import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClubServer } from "./index.mjs";
import { DatabaseSync } from "node:sqlite";
import { createClubHandler } from "../supabase/functions/club-api/handler.mjs";

async function setup(t, options = {}) {
  const server = createClubServer({
    databasePath: ":memory:",
    adminToken: "test-secret",
    ...(process.env.TEST_SUPABASE_HANDLER ? { handlerFactory: createClubHandler } : {}),
    ...options,
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, body, cookie, method) {
    const response = await fetch(base + path, {
      method: method || (body ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: response.status,
      data: await response.json(),
      cookie: response.headers.get("set-cookie")?.split(";")[0],
    };
  }
  return request;
}
test("stock artwork migrates to local club photos while preserving edited content", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ku-club-photos-"));
  const databasePath = join(dir, "club.sqlite");
  const db = new DatabaseSync(databasePath);
  db.exec(
    "CREATE TABLE content (kind TEXT, id TEXT, data TEXT NOT NULL, PRIMARY KEY(kind,id)); CREATE TABLE metadata (key TEXT PRIMARY KEY); INSERT INTO metadata VALUES('seeded'),('archive-v1');",
  );
  db.prepare("INSERT INTO content VALUES(?,?,?)").run(
    "events",
    "royal-project",
    JSON.stringify({
      id: "royal-project",
      title: "Committee edited title",
      image: "photo-legacy-stock",
      date: "2099-01-01",
      capacity: 30,
    }),
  );
  db.prepare("INSERT INTO content VALUES(?,?,?)").run(
    "news",
    "custom-post",
    JSON.stringify({
      id: "custom-post",
      title: "Custom journal entry",
      image: "photo-legacy-stock",
      body: "Saved article text",
    }),
  );
  db.close();
  const request = await setup(t, { databasePath });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const { data } = await request("/api/content");
  const migrated = data.events.find((event) => event.id === "royal-project");
  assert.equal(migrated.image, "royal-stage");
  assert.equal(migrated.title, "Committee edited title");
  const article = data.news.find((item) => item.id === "custom-post");
  assert.equal(article.image, "freshy-friends");
  assert.equal(article.body, "Saved article text");
});
test("event video links can be published, preserved, replaced and cleared; unsafe URLs are rejected", async (t) => {
  const request = await setup(t);
  const { cookie } = await request("/api/admin/login", { token: "test-secret" });
  const payload = {
    kind: "events", title: "Recorded concert", category: "Live music",
    date: "2026-02-25T16:30:00+07:00", venue: "Theatre",
    description: "Watch our concert", capacity: 300,
  };
  const link = "https://www.youtube.com/watch?v=concert";
  const created = await request("/api/admin/content", { ...payload, link }, cookie);
  assert.equal(created.status, 201);
  const id = created.data.id;
  const readLink = async () => (await request("/api/content")).data.events.find((event) => event.id === id).link;
  assert.equal(await readLink(), link);
  const updated = await request("/api/admin/content", { ...payload, id, title: "New title" }, cookie, "PUT");
  assert.equal(updated.data.link, link);
  for (const invalid of ["javascript:alert(1)", "data:text/html,hello", "not a url", "https://user:secret@example.com/video"]) {
    assert.equal((await request("/api/admin/content", { ...payload, id, link: invalid }, cookie, "PUT")).status, 400);
    assert.equal(await readLink(), link);
  }
  const replacement = "https://youtu.be/replacement";
  assert.equal((await request("/api/admin/content", { ...payload, id, link: replacement }, cookie, "PUT")).status, 200);
  assert.equal(await readLink(), replacement);
  await request("/api/admin/content", { ...payload, id, link: "" }, cookie, "PUT");
  assert.equal(await readLink(), "");
});

test("Run In Rhythm uses its own concert artwork and retains the recording", async (t) => {
  const request = await setup(t);
  const event = (await request("/api/content")).data.events.find((item) => item.id === "run-in-rhythm");
  assert.equal(event.image, "run-stage");
  assert.equal(event.link, "https://www.youtube.com/live/ib7OgoWOZQ8?si=IiGXu8RoNbARWbDo");
  const exhibition = (await request("/api/content")).data.events.find((item) => item.id === "open-world");
  assert.equal(exhibition.title, "KU Club Exhibition");
  assert.equal(exhibition.link, "https://youtu.be/L_xYNuuvxO4?si=vIbX1RbkYNPAtqiE");
});
test("public content and input validation", async (t) => {
  const request = await setup(t);
  const content = await request("/api/content");
  assert.equal(content.status, 200);
  assert.equal(content.data.events.length, 7);
  const loy = content.data.events.find(
    (event) => event.id === "loy-krathong-2026",
  );
  assert.equal(loy.title, "Loy Kra Tong 2026");
  assert.equal(loy.venue, "Lan Dao");
  assert.equal(loy.category, "Full band");
  // No start time is known yet, so the date carries no time component.
  assert.equal(loy.date, "2026-11-23");
  // No photo was supplied for this show.
  assert.equal(loy.image, undefined);
  // The truck show has its own photograph, not a borrowed Kaset Fair one.
  assert.equal(
    content.data.events.find((event) => event.id === "acoustic-truck").image,
    "truck-community",
  );
  // No event carries a guest limit any more.
  for (const event of content.data.events)
    assert.equal(
      event.capacity,
      undefined,
      `${event.id} still carries a capacity`,
    );
  assert.equal(
    (
      await request("/api/submissions", {
        kind: "membership",
        name: "A",
        email: "bad",
        role: "Guitar",
        faculty: "Engineering",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/submissions", {
        kind: "membership",
        name: "A",
        email: "a@example.com",
        role: "Guitar",
        faculty: "Engineering",
      })
    ).status,
    201,
  );
});
test("admin authentication, content publishing, status changes, deletion, and logout", async (t) => {
  const request = await setup(t);
  assert.equal((await request("/api/admin/submissions")).status, 401);
  assert.equal(
    (await request("/api/admin/login", { token: "wrong" })).status,
    401,
  );
  const { cookie } = await request("/api/admin/login", {
    token: "test-secret",
  });
  assert.ok(cookie);
  const submitted = await request("/api/submissions", {
    kind: "contact",
    name: "Student",
    email: "student@example.com",
    message: "Hello",
  });
  const rows = await request("/api/admin/submissions", null, cookie);
  assert.equal(rows.data[0].data.message, "Hello");
  assert.equal(
    (
      await request(
        `/api/admin/submissions/${submitted.data.id}`,
        { status: "approved" },
        cookie,
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        `/api/admin/submissions/${submitted.data.id}`,
        { status: "invalid" },
        cookie,
        "PATCH",
      )
    ).status,
    400,
  );
  const created = await request(
    "/api/admin/content",
    {
      kind: "events",
      title: "Test event",
      category: "Workshop",
      date: "2099-11-01T17:00:00+07:00",
      venue: "Clubroom",
      description: "An event",
      capacity: 1,
    },
    cookie,
  );
  assert.equal(created.status, 201);
  assert.equal(
    (
      await request(
        `/api/admin/content/events/${created.data.id}`,
        null,
        cookie,
        "DELETE",
      )
    ).status,
    200,
  );
  assert.equal((await request("/api/admin/logout", {}, cookie)).status, 200);
  assert.equal(
    (await request("/api/admin/submissions", null, cookie)).status,
    401,
  );
});
test("capacity, duplicate registration, past event, and newsletter deduplication", async (t) => {
  const request = await setup(t);
  const { cookie } = await request("/api/admin/login", {
    token: "test-secret",
  });
  const event = await request(
    "/api/admin/content",
    {
      kind: "events",
      title: "Tiny gig",
      category: "Open mic",
      date: "2099-11-01T17:00:00+07:00",
      venue: "Clubroom",
      description: "Capacity test",
      capacity: 1,
    },
    cookie,
  );
  const body = {
    kind: "registration",
    name: "A",
    email: "a@example.com",
    eventId: event.data.id,
  };
  assert.equal((await request("/api/submissions", body)).status, 201);
  assert.equal((await request("/api/submissions", body)).status, 409);
  assert.equal(
    (await request("/api/submissions", { ...body, email: "b@example.com" }))
      .status,
    409,
  );
  assert.equal(
    (await request("/api/submissions", { ...body, eventId: "run-in-rhythm" }))
      .status,
    400,
  );
  assert.equal(
    (
      await request("/api/submissions", {
        kind: "newsletter",
        email: "a@example.com",
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await request("/api/submissions", {
        kind: "newsletter",
        email: "A@example.com",
      })
    ).status,
    200,
  );
});
test("booking opening hours, overlap, rejected slot release, and invalid dates", async (t) => {
  const request = await setup(t);
  const body = {
    kind: "booking",
    name: "A",
    email: "a@example.com",
    date: "2099-11-02",
    time: "16:00",
    duration: 2,
  };
  const booked = await request("/api/submissions", body);
  assert.equal(booked.status, 201);
  assert.equal(
    (await request("/api/submissions", { ...body, time: "17:00" })).status,
    409,
  );
  assert.equal(
    (await request("/api/submissions", { ...body, time: "12:00" })).status,
    400,
  );
  assert.equal(
    (await request("/api/submissions", { ...body, date: "2099-02-30" })).status,
    400,
  );
  assert.equal(
    (await request("/api/submissions", { ...body, date: "2020-01-01" })).status,
    400,
  );
  const { cookie } = await request("/api/admin/login", {
    token: "test-secret",
  });
  await request(
    `/api/admin/submissions/${booked.data.id}`,
    { status: "rejected" },
    cookie,
    "PATCH",
  );
  assert.equal((await request("/api/submissions", body)).status, 201);
});
test("content editing preserves identifiers and cannot reduce capacity below registrations", async (t) => {
  const request = await setup(t);
  const { cookie } = await request("/api/admin/login", {
    token: "test-secret",
  });
  const payload = {
    kind: "events",
    title: "Edit me",
    category: "Workshop",
    date: "2099-11-02T17:00:00+07:00",
    venue: "Clubroom",
    description: "Original description",
    capacity: 2,
  };
  const created = await request("/api/admin/content", payload, cookie);
  await request("/api/submissions", {
    kind: "registration",
    name: "A",
    email: "a@example.com",
    eventId: created.data.id,
  });
  await request("/api/submissions", {
    kind: "registration",
    name: "B",
    email: "b@example.com",
    eventId: created.data.id,
  });
  assert.equal(
    (
      await request(
        "/api/admin/content",
        { ...payload, id: created.data.id, capacity: 1 },
        cookie,
        "PUT",
      )
    ).status,
    409,
  );
  const updated = await request(
    "/api/admin/content",
    { ...payload, id: created.data.id, title: "New title" },
    cookie,
    "PUT",
  );
  assert.equal(updated.status, 200);
  assert.equal(updated.data.id, created.data.id);
  assert.equal(updated.data.title, "New title");
  assert.equal(
    (
      await request(
        "/api/admin/content",
        { ...payload, id: "missing" },
        cookie,
        "PUT",
      )
    ).status,
    404,
  );
});
test("reinstating a rejected booking cannot overlap a newly reserved slot", async (t) => {
  const request = await setup(t);
  const { cookie } = await request("/api/admin/login", {
    token: "test-secret",
  });
  const payload = {
    kind: "booking",
    name: "A",
    email: "a@example.com",
    date: "2099-11-02",
    time: "16:00",
    duration: 1,
  };
  const first = await request("/api/submissions", payload);
  await request(
    `/api/admin/submissions/${first.data.id}`,
    { status: "rejected" },
    cookie,
    "PATCH",
  );
  await request("/api/submissions", {
    ...payload,
    name: "B",
    email: "b@example.com",
  });
  assert.equal(
    (
      await request(
        `/api/admin/submissions/${first.data.id}`,
        { status: "approved" },
        cookie,
        "PATCH",
      )
    ).status,
    409,
  );
});
test("data survives server restart", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ku-acoustic-"));
  const path = join(dir, "club.sqlite");
  let server = createClubServer({
    databasePath: path,
    adminToken: "test-secret",
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  await fetch(`http://127.0.0.1:${server.address().port}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "newsletter",
      email: "persistent@example.com",
    }),
  });
  await new Promise((resolve) => server.close(resolve));
  server = createClubServer({ databasePath: path, adminToken: "test-secret" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const login = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "test-secret" }),
  });
  const rows = await fetch(base + "/api/admin/submissions", {
    headers: { Cookie: login.headers.get("set-cookie").split(";")[0] },
  });
  assert.equal((await rows.json())[0].email, "persistent@example.com");
});
test("cross-origin mutation is rejected and unconfigured admin remains locked", async (t) => {
  const request = await setup(t, { adminToken: "" });
  assert.equal(
    (await request("/api/admin/login", { token: "anything" })).status,
    503,
  );
  const server = createClubServer({ databasePath: ":memory:" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/submissions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://example.com",
      },
      body: JSON.stringify({ kind: "newsletter", email: "a@example.com" }),
    },
  );
  assert.equal(response.status, 403);
});

test("built assets are served with correct types and cache lifetimes", async (t) => {
  if (!existsSync("dist/assets") || !existsSync("dist/index.html")) {
    t.skip("run npm run build to exercise static delivery");
    return;
  }
  const server = createClubServer({
    databasePath: ":memory:",
    adminToken: "test-secret",
    ...(process.env.TEST_SUPABASE_HANDLER
      ? { handlerFactory: createClubHandler }
      : {}),
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const bundle = readdirSync("dist/assets").find((name) => name.endsWith(".js"));
  const asset = await fetch(`${base}/assets/${bundle}`);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("content-type"), /^text\/javascript/);
  // Fingerprinted bundles must never be revalidated.
  assert.equal(
    asset.headers.get("cache-control"),
    "public, max-age=31536000, immutable",
  );

  // The shell carries the asset manifest, so it must always be rechecked.
  const shell = await fetch(`${base}/`);
  assert.equal(shell.status, 200);
  assert.match(shell.headers.get("content-type"), /^text\/html/);
  assert.equal(shell.headers.get("cache-control"), "no-cache");

  // An unknown route falls back to the shell rather than leaking the filesystem.
  const deep = await fetch(`${base}/shows`);
  assert.equal(deep.status, 200);
  assert.match(deep.headers.get("content-type"), /^text\/html/);

  const traversal = await fetch(`${base}/../package.json`, { redirect: "manual" });
  assert.ok([403, 200, 301, 404].includes(traversal.status));
  if (traversal.status === 200)
    assert.match(traversal.headers.get("content-type"), /^text\/html/);
});

test("events without a capacity are unlimited and date-only events stay open all day", async (t) => {
  const request = await setup(t);
  const { cookie } = await request("/api/admin/login", {
    token: "test-secret",
  });
  const base = {
    kind: "events",
    title: "Open gig",
    category: "Full band",
    venue: "Larn Daw",
    description: "No guest list for this one.",
  };

  // Omitting capacity entirely leaves the event unlimited.
  const open = await request(
    "/api/admin/content",
    { ...base, date: "2099-11-23T18:00:00+07:00" },
    cookie,
  );
  assert.equal(open.status, 201);
  assert.equal(open.data.capacity, undefined);
  for (const email of ["a@example.com", "b@example.com", "c@example.com"])
    assert.equal(
      (
        await request("/api/submissions", {
          kind: "registration",
          name: "Guest",
          email,
          eventId: open.data.id,
        })
      ).status,
      201,
    );

  // The admin form posts an empty string when the field is left blank.
  const blank = await request(
    "/api/admin/content",
    { ...base, title: "Blank capacity", date: "2099-11-24T18:00:00+07:00", capacity: "" },
    cookie,
  );
  assert.equal(blank.status, 201);
  assert.equal(blank.data.capacity, undefined);

  // Clearing the field on an existing event removes the limit it carried.
  const limited = await request(
    "/api/admin/content",
    { ...base, title: "Had a limit", date: "2099-11-25T18:00:00+07:00", capacity: 2 },
    cookie,
  );
  assert.equal(limited.data.capacity, 2);
  const cleared = await request(
    "/api/admin/content",
    { ...base, title: "Had a limit", date: "2099-11-25T18:00:00+07:00", id: limited.data.id, capacity: "" },
    cookie,
    "PUT",
  );
  assert.equal(cleared.status, 200);
  assert.equal(cleared.data.capacity, undefined);

  // A nonsense capacity is still rejected when one is supplied.
  assert.equal(
    (
      await request(
        "/api/admin/content",
        { ...base, title: "Bad limit", date: "2099-11-26T18:00:00+07:00", capacity: 0 },
        cookie,
      )
    ).status,
    400,
  );

  // A date-only event accepts registrations until that day ends in Bangkok,
  // not from UTC midnight, which would close it at 07:00 local time.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
  }).format(new Date());
  const dateOnly = await request(
    "/api/admin/content",
    { ...base, title: "Time to be announced", date: today },
    cookie,
  );
  assert.equal(dateOnly.status, 201);
  assert.equal(dateOnly.data.date, today);
  assert.equal(
    (
      await request("/api/submissions", {
        kind: "registration",
        name: "Guest",
        email: "today@example.com",
        eventId: dateOnly.data.id,
      })
    ).status,
    201,
  );

  // A date-only event in the past is closed.
  const over = await request(
    "/api/admin/content",
    { ...base, title: "Last year", date: "2020-01-01" },
    cookie,
  );
  assert.equal(
    (
      await request("/api/submissions", {
        kind: "registration",
        name: "Guest",
        email: "late@example.com",
        eventId: over.data.id,
      })
    ).status,
    400,
  );
});
