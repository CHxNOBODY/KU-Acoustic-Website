import { createServer } from "node:http";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createClubHandler, type ContentItem, type Database } from "./handler.ts";
import { events, news, archive } from "./seed.ts";

export type ClubServerOptions = {
  databasePath?: string;
  adminToken?: string;
};

export function createClubServer({
  databasePath = process.env.DATABASE_PATH || "./data/club.sqlite",
  adminToken = process.env.ADMIN_TOKEN || "",
}: ClubServerOptions = {}) {
  if (databasePath !== ":memory:")
    mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(
    `PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS content (kind TEXT, id TEXT, data TEXT NOT NULL, PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, email TEXT NOT NULL, target TEXT, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL); CREATE UNIQUE INDEX IF NOT EXISTS unique_registration ON submissions(email,target) WHERE kind='registration'; CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY);`,
  );
  // Keep local SQLite in step with supabase/schema.sql so both backends
  // enforce the same constraints and plan the same queries. The unique
  // newsletter index can fail on a legacy database that already holds
  // duplicates, so each statement is applied defensively.
  for (const statement of [
    "CREATE UNIQUE INDEX IF NOT EXISTS unique_newsletter ON submissions(email) WHERE kind='newsletter'",
    "CREATE INDEX IF NOT EXISTS registration_capacity ON submissions(target) WHERE kind='registration' AND status!='rejected'",
    "CREATE INDEX IF NOT EXISTS booking_status ON submissions(status) WHERE kind='booking'",
    "CREATE INDEX IF NOT EXISTS submission_created ON submissions(created DESC)",
    "CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires)",
  ])
    try {
      db.exec(statement);
    } catch (error) {
      console.warn(`Skipped index (${(error as Error).message}).`);
    }
  db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
  const done = (key: string) =>
    db.prepare("SELECT key FROM metadata WHERE key=?").get(key);
  const markDone = (key: string) =>
    db.prepare("INSERT INTO metadata VALUES(?)").run(key);
  const readEvent = (id: string) => {
    const row = db
      .prepare("SELECT data FROM content WHERE kind='events' AND id=?")
      .get(id);
    return row ? (JSON.parse(row.data as string) as ContentItem) : undefined;
  };
  const save = (kind: string, item: ContentItem) =>
    db
      .prepare("UPDATE content SET data=? WHERE kind=? AND id=?")
      .run(JSON.stringify(item), kind, item.id);
  if (!done("seeded")) {
    for (const [kind, items] of [
      ["events", events],
      ["news", news],
    ] as const)
      for (const item of items)
        db.prepare("INSERT INTO content VALUES(?,?,?)").run(
          kind,
          item.id,
          JSON.stringify(item),
        );
    markDone("seeded");
  }
  const list = (kind: string) =>
    db
      .prepare("SELECT data FROM content WHERE kind=?")
      .all(kind)
      .map((row) => JSON.parse(row.data as string) as ContentItem);
  if (!done("archive-v1")) {
    for (const item of archive)
      db.prepare("INSERT OR IGNORE INTO content VALUES(?,?,?)").run(
        "events",
        item.id,
        JSON.stringify(item),
      );
    markDone("archive-v1");
  }
  // Replace the old stock artwork without resetting edited content or submissions.
  for (const kind of ["events", "news"]) {
    const currentPhotos = new Map<string, string | undefined>(
      (kind === "events" ? [...events, ...archive] : news).map((item) => [
        item.id,
        item.image,
      ]),
    );
    for (const item of list(kind)) {
      if (
        item.image?.startsWith("photo-") ||
        item.image?.includes("images.unsplash.com")
      ) {
        item.image =
          currentPhotos.get(item.id) ||
          (kind === "events" ? "royal-vocals" : "freshy-friends");
        save(kind, item);
      }
    }
  }
  // Use the newly supplied concert photography for the existing recap.
  if (!done("run-photos-v1")) {
    const event = readEvent("run-in-rhythm");
    if (event?.image === "kaset-family") {
      event.image = "run-stage";
      save("events", event);
    }
    markDone("run-photos-v1");
  }
  // Apply the owner's supplied recordings once, preserving later committee edits.
  if (!done("event-videos-v1")) {
    for (const seeded of [...events, ...archive].filter((event) => event.link)) {
      const event = readEvent(seeded.id);
      if (!event) continue;
      event.link = seeded.link;
      if (event.id === "open-world") event.title = seeded.title;
      save("events", event);
    }
    markDone("event-videos-v1");
  }
  // The committee replaced the three sample upcoming events with the
  // confirmed Loy Kra Tong show. Registrations that targeted the removed
  // events stay in the submissions table, as committee deletion already does.
  if (!done("loy-krathong-v1")) {
    for (const id of ["open-mic", "guitar-workshop", "sunset-session"])
      db.prepare("DELETE FROM content WHERE kind='events' AND id=?").run(id);
    for (const item of events)
      db.prepare("INSERT OR IGNORE INTO content VALUES(?,?,?)").run(
        "events",
        item.id,
        JSON.stringify(item),
      );
    markDone("loy-krathong-v1");
  }
  // Lan Dao is the correct venue spelling, no photo was supplied for the Loy
  // Kra Tong show, and events no longer carry a guest limit at all.
  if (!done("event-details-v2")) {
    for (const event of list("events")) {
      delete event.capacity;
      if (event.id === "loy-krathong-2026") {
        event.venue = "Lan Dao";
        event.description = event.description?.replace(/Larn Daw/g, "Lan Dao");
        delete event.image;
      }
      save("events", event);
    }
    markDone("event-details-v2");
  }
  // The truck show now has its own photograph instead of a borrowed one from
  // the Kaset Fair set. Only replace the borrowed picture, so a committee
  // that has already chosen something else keeps it.
  if (!done("truck-photo-v1")) {
    const event = readEvent("acoustic-truck");
    if (event?.image === "kaset-guitar") {
      event.image = "truck-community";
      save("events", event);
    }
    markDone("truck-photo-v1");
  }
  // node:sqlite answers synchronously; the shared handler simply awaits the
  // plain values it gets back.
  const database: Database = {
    prepare(query) {
      const statement = db.prepare(query);
      const values = (args: unknown[]) => args as SQLInputValue[];
      return {
        all: (...args) => statement.all(...values(args)),
        get: (...args) => statement.get(...values(args)),
        run: (...args) => statement.run(...values(args)),
      };
    },
  };
  const server = createServer(
    createClubHandler({
      db: database,
      adminTokenDigest: adminToken
        ? createHash("sha256").update(adminToken).digest("hex")
        : undefined,
      allowedOrigins: process.env.ALLOWED_ORIGINS,
      production: process.env.NODE_ENV === "production",
      trustProxy: process.env.TRUST_PROXY === "1",
    }),
  );
  server.on("close", () => db.close());
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === resolve("server/index.ts")) {
  const server = createClubServer();
  // Containers stop with SIGTERM; closing the server also closes the database.
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => server.close(() => process.exit(0)));
  server.listen(
    Number(process.env.PORT || 3001),
    process.env.HOST || "127.0.0.1",
    () =>
      console.log(
        `Club backend ready at http://127.0.0.1:${process.env.PORT || 3001}`,
      ),
  );
}
