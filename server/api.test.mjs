import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClubServer } from "./index.mjs";
import { DatabaseSync } from "node:sqlite";

async function setup(t, options = {}) {
  const server = createClubServer({
    databasePath: ":memory:",
    adminToken: "test-secret",
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
    "open-mic",
    JSON.stringify({
      id: "open-mic",
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
  assert.equal(data.events[0].image, "royal-vocals");
  assert.equal(data.events[0].title, "Committee edited title");
  assert.equal(data.news[0].image, "freshy-friends");
  assert.equal(data.news[0].body, "Saved article text");
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
  assert.equal(content.data.events.length, 9);
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
