import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve, extname, sep } from "node:path";
import { randomUUID, createHash, timingSafeEqual } from "node:crypto";
import { events, news, archive } from "./seed.mjs";

export function createClubServer({
  databasePath = process.env.DATABASE_PATH || "./data/club.sqlite",
  adminToken = process.env.ADMIN_TOKEN || "",
} = {}) {
  if (databasePath !== ":memory:")
    mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(
    `PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS content (kind TEXT, id TEXT, data TEXT NOT NULL, PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, email TEXT NOT NULL, target TEXT, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created TEXT NOT NULL); CREATE UNIQUE INDEX IF NOT EXISTS unique_registration ON submissions(email,target) WHERE kind='registration'; CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY);`,
  );
  if (!db.prepare("SELECT key FROM metadata WHERE key='seeded'").get()) {
    for (const [kind, items] of [
      ["events", events],
      ["news", news],
    ])
      for (const item of items)
        db.prepare("INSERT INTO content VALUES(?,?,?)").run(
          kind,
          item.id,
          JSON.stringify(item),
        );
    db.prepare("INSERT INTO metadata VALUES('seeded')").run();
  }
  const list = (kind) =>
    db
      .prepare("SELECT data FROM content WHERE kind=?")
      .all(kind)
      .map((row) => JSON.parse(row.data));
  if (!db.prepare("SELECT key FROM metadata WHERE key='archive-v1'").get()) {
    for (const item of archive)
      db.prepare("INSERT OR IGNORE INTO content VALUES(?,?,?)").run(
        "events",
        item.id,
        JSON.stringify(item),
      );
    db.prepare("INSERT INTO metadata VALUES('archive-v1')").run();
  }
  // Replace the old stock artwork without resetting edited content or submissions.
  for (const kind of ["events", "news"]) {
    const currentPhotos = new Map(
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
        db.prepare("UPDATE content SET data=? WHERE kind=? AND id=?").run(
          JSON.stringify(item),
          kind,
          item.id,
        );
      }
    }
  }
  // Use the newly supplied concert photography for the existing recap.
  if (!db.prepare("SELECT key FROM metadata WHERE key='run-photos-v1'").get()) {
    const row = db.prepare("SELECT data FROM content WHERE kind='events' AND id='run-in-rhythm'").get();
    if (row) {
      const event = JSON.parse(row.data);
      if (event.image === "kaset-family") {
        event.image = "run-stage";
        db.prepare("UPDATE content SET data=? WHERE kind='events' AND id=?").run(JSON.stringify(event), event.id);
      }
    }
    db.prepare("INSERT INTO metadata VALUES('run-photos-v1')").run();
  }
  // Apply the owner's supplied recordings once, preserving later committee edits.
  if (!db.prepare("SELECT key FROM metadata WHERE key='event-videos-v1'").get()) {
    for (const seeded of [...events, ...archive].filter((event) => event.link)) {
      const row = db.prepare("SELECT data FROM content WHERE kind='events' AND id=?").get(seeded.id);
      if (!row) continue;
      const event = JSON.parse(row.data);
      event.link = seeded.link;
      if (event.id === "open-world") event.title = seeded.title;
      db.prepare("UPDATE content SET data=? WHERE kind='events' AND id=?").run(JSON.stringify(event), event.id);
    }
    db.prepare("INSERT INTO metadata VALUES('event-videos-v1')").run();
  }
  const send = (res, status, value, headers = {}) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    });
    res.end(JSON.stringify(value));
  };
  const rates = new Map();
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    try {
      if (path.startsWith("/api/") && !["GET", "HEAD"].includes(req.method)) {
        const allowedOrigins = (
          process.env.ALLOWED_ORIGINS ||
          (process.env.NODE_ENV === "production"
            ? ""
            : "http://localhost:5173,http://127.0.0.1:5173")
        )
          .split(",")
          .filter(Boolean);
        if (
          req.headers.origin &&
          new URL(req.headers.origin).host !== req.headers.host &&
          !allowedOrigins.includes(req.headers.origin)
        )
          return send(res, 403, { error: "Request origin is not allowed." });
        const key = req.socket.remoteAddress;
        const now = Date.now();
        const rate = rates.get(key);
        if (rate && rate.until > now && rate.count >= 50)
          return send(res, 429, {
            error: "Too many requests. Please try again in a minute.",
          });
        if (!rate || rate.until <= now)
          rates.set(key, { count: 1, until: now + 60000 });
        else rate.count++;
        if (rates.size > 10000)
          for (const [key, entry] of rates)
            if (entry.until < now) rates.delete(key);
      }
      if (path === "/api/health") return send(res, 200, { ok: true });
      if (path === "/api/content" && req.method === "GET")
        return send(res, 200, {
          events: list("events").map((event) => ({
            ...event,
            registered: db
              .prepare(
                "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
              )
              .get(event.id).count,
          })),
          news: list("news"),
        });
      let body = {};
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return send(res, 415, { error: "JSON content is required." });
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 16384)
            return send(res, 413, { error: "Request is too large." });
        }
        try {
          body = JSON.parse(raw);
        } catch {
          return send(res, 400, { error: "Invalid JSON." });
        }
        if (!body || typeof body !== "object" || Array.isArray(body))
          return send(res, 400, { error: "Invalid request." });
      }
      const field = (key, max = 200, required = true) => {
        const value = typeof body[key] === "string" ? body[key].trim() : "";
        if ((required && !value) || value.length > max)
          throw new Error(
            `Please provide a valid ${key} (up to ${max} characters).`,
          );
        return value;
      };
      if (path === "/api/admin/login" && req.method === "POST") {
        if (!adminToken)
          return send(res, 503, {
            error:
              "Admin access is not configured. Set ADMIN_TOKEN on the server.",
          });
        const hash = (value) => createHash("sha256").update(value).digest();
        if (!timingSafeEqual(hash(field("token", 500)), hash(adminToken)))
          return send(res, 401, { error: "Incorrect admin access key." });
        const session = randomUUID();
        db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
        db.prepare("INSERT INTO sessions VALUES(?,?)").run(
          session,
          Date.now() + 8 * 3600000,
        );
        return send(
          res,
          200,
          { ok: true },
          {
            "Set-Cookie": `club_session=${session}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
          },
        );
      }
      if (path.startsWith("/api/admin/")) {
        const session = req.headers.cookie
          ?.split(";")
          .map((item) => item.trim())
          .find((item) => item.startsWith("club_session="))
          ?.slice(13);
        if (
          !session ||
          !db
            .prepare("SELECT id FROM sessions WHERE id=? AND expires>?")
            .get(session, Date.now())
        )
          return send(res, 401, {
            error: "Please sign in to the admin dashboard.",
          });
        if (path === "/api/admin/logout" && req.method === "POST") {
          db.prepare("DELETE FROM sessions WHERE id=?").run(session);
          return send(
            res,
            200,
            { ok: true },
            {
              "Set-Cookie":
                "club_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0",
            },
          );
        }
        if (path === "/api/admin/submissions" && req.method === "GET")
          return send(
            res,
            200,
            db
              .prepare("SELECT * FROM submissions ORDER BY created DESC")
              .all()
              .map((row) => ({ ...row, data: JSON.parse(row.data) })),
          );
        if (
          path.startsWith("/api/admin/submissions/") &&
          req.method === "PATCH"
        ) {
          if (!["approved", "rejected", "pending"].includes(body.status))
            return send(res, 400, { error: "Invalid status." });
          const id = path.split("/").at(-1);
          const existing = db
            .prepare("SELECT * FROM submissions WHERE id=?")
            .get(id);
          if (!existing)
            return send(res, 404, { error: "Submission not found." });
          if (existing.status === "rejected" && body.status !== "rejected") {
            if (existing.kind === "registration") {
              const event = list("events").find(
                (item) => item.id === existing.target,
              );
              const occupied = db
                .prepare(
                  "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
                )
                .get(existing.target).count;
              if (!event || occupied >= event.capacity)
                return send(res, 409, {
                  error: "This event is no longer available or is full.",
                });
            }
            if (existing.kind === "booking") {
              const slot = JSON.parse(existing.data);
              const start = Number(slot.time.slice(0, 2));
              const other = db
                .prepare(
                  "SELECT data FROM submissions WHERE kind='booking' AND status!='rejected' AND id!=?",
                )
                .all(id)
                .map((row) => JSON.parse(row.data));
              if (
                other.some(
                  (item) =>
                    item.date === slot.date &&
                    Number(item.time.slice(0, 2)) < start + slot.duration &&
                    Number(item.time.slice(0, 2)) + item.duration > start,
                )
              )
                return send(res, 409, {
                  error: "Another rehearsal now occupies this slot.",
                });
            }
          }
          const result = db
            .prepare("UPDATE submissions SET status=? WHERE id=?")
            .run(body.status, path.split("/").at(-1));
          return send(
            res,
            result.changes ? 200 : 404,
            result.changes ? { ok: true } : { error: "Submission not found." },
          );
        }
        if (
          path === "/api/admin/content" &&
          ["POST", "PUT"].includes(req.method)
        ) {
          const kind = field("kind");
          if (!["events", "news"].includes(kind))
            throw new Error("Invalid content type.");
          const title = field("title", 120);
          const date = field("date", 50);
          if (!Number.isFinite(Date.parse(date)))
            throw new Error("Invalid date.");
          const previous =
            req.method === "PUT"
              ? db
                  .prepare("SELECT data FROM content WHERE kind=? AND id=?")
                  .get(kind, field("id"))
              : null;
          if (req.method === "PUT" && !previous)
            return send(res, 404, { error: "Content not found." });
          const original = previous ? JSON.parse(previous.data) : null;
          const item = {
            ...original,
            id: original?.id || randomUUID(),
            title,
            date,
            category: field("category", 50),
            image:
              original?.image ||
              (kind === "events" ? "royal-vocals" : "freshy-friends"),
            sample: original?.sample || false,
          };
          if (kind === "events") {
            if (Object.hasOwn(body, "link")) {
              const link = field("link", 2000, false);
              if (link) {
                let videoUrl;
                try { videoUrl = new URL(link); } catch {
                  throw new Error("Please provide a valid video URL.");
                }
                if (!["https:", "http:"].includes(videoUrl.protocol) || videoUrl.username || videoUrl.password)
                  throw new Error("Please use an http or https video link without credentials.");
              }
              item.link = link;
            }
            Object.assign(item, {
              venue: field("venue"),
              description: field("description", 3000),
              capacity: Number(body.capacity),
            });
            if (
              !Number.isInteger(item.capacity) ||
              item.capacity < 1 ||
              item.capacity > 10000
            )
              throw new Error("Capacity must be between 1 and 10000.");
            const occupied = db
              .prepare(
                "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
              )
              .get(item.id).count;
            if (item.capacity < occupied)
              return send(res, 409, {
                error:
                  "Capacity cannot be lower than the current registration count.",
              });
          } else
            Object.assign(item, {
              excerpt: field("excerpt", 300),
              body: field("body", 5000),
            });
          db.prepare(
            "INSERT INTO content VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",
          ).run(kind, item.id, JSON.stringify(item));
          return send(res, req.method === "PUT" ? 200 : 201, item);
        }
        if (path.startsWith("/api/admin/content/") && req.method === "DELETE") {
          const [, , , , kind, id] = path.split("/");
          const result = db
            .prepare("DELETE FROM content WHERE kind=? AND id=?")
            .run(kind, id);
          return send(
            res,
            result.changes ? 200 : 404,
            result.changes ? { ok: true } : { error: "Content not found." },
          );
        }
      }
      if (path === "/api/submissions" && req.method === "POST") {
        const kind = field("kind");
        if (
          ![
            "membership",
            "registration",
            "booking",
            "newsletter",
            "contact",
          ].includes(kind)
        )
          throw new Error("Invalid submission type.");
        const email = field("email", 254).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new Error("Please enter a valid email address.");
        const data = { email };
        if (kind !== "newsletter") data.name = field("name", 100);
        let target = null;
        if (kind === "membership") {
          data.role = field("role", 80);
          data.faculty = field("faculty", 100);
          data.message = field("message", 2000, false);
        }
        if (kind === "contact") data.message = field("message", 2000);
        if (kind === "registration") {
          target = field("eventId");
          const event = list("events").find((item) => item.id === target);
          if (!event) return send(res, 404, { error: "Event not found." });
          if (Date.parse(event.date) <= Date.now())
            throw new Error("Registration for this event is closed.");
          if (
            db
              .prepare(
                "SELECT id FROM submissions WHERE kind='registration' AND email=? AND target=?",
              )
              .get(email, target)
          )
            return send(res, 409, {
              error: "You are already registered for this event.",
            });
          if (
            db
              .prepare(
                "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
              )
              .get(target).count >= event.capacity
          )
            return send(res, 409, { error: "This event is full." });
          data.event = event.title;
        }
        if (kind === "booking") {
          data.date = field("date", 10);
          data.time = field("time", 5);
          data.duration = Number(body.duration);
          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
            !/^\d{2}:00$/.test(data.time) ||
            ![1, 2, 3].includes(data.duration)
          )
            throw new Error("Please choose a valid rehearsal slot.");
          const start = new Date(`${data.date}T${data.time}:00+07:00`);
          if (
            !Number.isFinite(start.getTime()) ||
            start <= new Date() ||
            start.toISOString().slice(0, 10) !== data.date
          )
            throw new Error("Choose a future rehearsal date.");
          const hour = Number(data.time.slice(0, 2));
          const weekend = [0, 6].includes(
            new Date(`${data.date}T12:00:00+07:00`).getUTCDay(),
          );
          if (
            hour < (weekend ? 13 : 16) ||
            hour + data.duration > (weekend ? 18 : 21)
          )
            throw new Error("Choose a slot within club opening hours.");
          const bookings = db
            .prepare(
              "SELECT data FROM submissions WHERE kind='booking' AND status!='rejected'",
            )
            .all()
            .map((row) => JSON.parse(row.data));
          if (
            bookings.some(
              (item) =>
                item.date === data.date &&
                Number(item.time.slice(0, 2)) < hour + data.duration &&
                Number(item.time.slice(0, 2)) + item.duration > hour,
            )
          )
            return send(res, 409, {
              error:
                "This slot has already been requested. Please choose another time.",
            });
          data.message = field("message", 2000, false);
        }
        if (
          kind === "newsletter" &&
          db
            .prepare(
              "SELECT id FROM submissions WHERE kind='newsletter' AND email=?",
            )
            .get(email)
        )
          return send(res, 200, {
            ok: true,
            message: "You are already on the list.",
          });
        const id = randomUUID();
        db.prepare(
          "INSERT INTO submissions(id,kind,email,target,data,created) VALUES(?,?,?,?,?,?)",
        ).run(
          id,
          kind,
          email,
          target,
          JSON.stringify(data),
          new Date().toISOString(),
        );
        return send(res, 201, { ok: true, id });
      }
      if (path.startsWith("/api/"))
        return send(res, 404, { error: "Endpoint not found." });
      if (!["GET", "HEAD"].includes(req.method))
        return send(res, 405, { error: "Method not allowed." });
      const root = resolve("dist");
      let file = resolve(root, "." + decodeURIComponent(path));
      if (file !== root && !file.startsWith(root + sep))
        return send(res, 403, { error: "Invalid path." });
      if (!existsSync(file) || !extname(file))
        file = resolve(root, "index.html");
      if (!existsSync(file))
        return send(res, 404, {
          error: "Build the frontend with npm run build, or use npm run dev.",
        });
      const types = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
      };
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : readFileSync(file));
    } catch (error) {
      if (
        (error instanceof Error && error.message.startsWith("Please")) ||
        (error instanceof Error &&
          /^(Invalid|Capacity|Registration|Choose)/.test(error.message))
      )
        send(res, 400, { error: error.message });
      else {
        console.error(error);
        send(res, 500, { error: "Something went wrong. Please try again." });
      }
    }
  });
  server.on("close", () => db.close());
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === resolve("server/index.mjs"))
  createClubServer().listen(
    Number(process.env.PORT || 3001),
    process.env.HOST || "127.0.0.1",
    () =>
      console.log(
        `Club backend ready at http://127.0.0.1:${process.env.PORT || 3001}`,
      ),
  );
