import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { resolve, extname, sep } from "node:path";
import { readFileSync, existsSync } from "node:fs";
export function createClubHandler({ db, adminTokenDigest, allowedOrigins: configuredOrigins, production = true, trustProxy = true }) {
  const list = async (kind) => (await db.prepare("SELECT data FROM content WHERE kind=?").all(kind)).map(row => JSON.parse(row.data));
  const send = (res, status, value, headers = {}) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    });
    res.end(JSON.stringify(value));
  };
  // A distinct type for validation failures: the previous catch block matched
  // on message prefixes, so any new wording silently became a 500.
  class ValidationError extends Error {}
  const invalid = (message) => new ValidationError(message);
  // True when a unique index caught a duplicate that raced past its lookup.
  const duplicate = (error) =>
    /UNIQUE constraint failed|duplicate key value/i.test(error?.message || "");
  // The public booking form and committee reinstatement must apply the same
  // overlap rule; one helper stops the two copies from drifting apart.
  const overlapping = async (date, hour, duration, exceptId) =>
    (await db
      .prepare(
        `SELECT data FROM submissions WHERE kind='booking' AND status!='rejected'${exceptId ? " AND id!=?" : ""}`,
      )
      .all(...(exceptId ? [exceptId] : [])))
      .map((row) => JSON.parse(row.data))
      .some(
        (item) =>
          item.date === date &&
          Number(item.time.slice(0, 2)) < hour + duration &&
          Number(item.time.slice(0, 2)) + item.duration > hour,
      );
  const rates = new Map();
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    try {
      if (path.startsWith("/api/") && !["GET", "HEAD"].includes(req.method)) {
        const allowedOrigins = (
          configuredOrigins ||
          (production
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
        const key =
          (trustProxy &&
            req.headers["x-forwarded-for"]?.split(",")[0].trim()) ||
          req.socket.remoteAddress;
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
          events: await Promise.all((await list("events")).map(async (event) => ({
            ...event,
            registered: (await db
              .prepare(
                "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
              )
              .get(event.id)).count,
          }))),
          news: await list("news"),
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
          throw invalid(
            `Please provide a valid ${key} (up to ${max} characters).`,
          );
        return value;
      };
      if (path === "/api/admin/login" && req.method === "POST") {
        if (!adminTokenDigest)
          return send(res, 503, {
            error:
              "Admin access is not configured. Set ADMIN_TOKEN on the server.",
          });
        const hash = (value) => createHash("sha256").update(value).digest();
        if (!timingSafeEqual(hash(field("token", 500)), Buffer.from(adminTokenDigest, "hex")))
          return send(res, 401, { error: "Incorrect admin access key." });
        const session = randomUUID();
        (await db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now()));
        (await db.prepare("INSERT INTO sessions VALUES(?,?)").run(
          session,
          Date.now() + 8 * 3600000,
        ));
        return send(
          res,
          200,
          { ok: true },
          {
            "Set-Cookie": `club_session=${session}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800${production ? "; Secure" : ""}`,
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
          !(await db
            .prepare("SELECT id FROM sessions WHERE id=? AND expires>?")
            .get(session, Date.now()))
        )
          return send(res, 401, {
            error: "Please sign in to the admin dashboard.",
          });
        if (path === "/api/admin/logout" && req.method === "POST") {
          (await db.prepare("DELETE FROM sessions WHERE id=?").run(session));
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
            (await db
              .prepare("SELECT * FROM submissions ORDER BY created DESC")
              .all())
              .map((row) => ({ ...row, data: JSON.parse(row.data) })),
          );
        if (
          path.startsWith("/api/admin/submissions/") &&
          req.method === "PATCH"
        ) {
          if (!["approved", "rejected", "pending"].includes(body.status))
            return send(res, 400, { error: "Invalid status." });
          const id = path.split("/").at(-1);
          const existing = (await db
            .prepare("SELECT * FROM submissions WHERE id=?")
            .get(id));
          if (!existing)
            return send(res, 404, { error: "Submission not found." });
          if (existing.status === "rejected" && body.status !== "rejected") {
            if (existing.kind === "registration") {
              const event = (await list("events")).find(
                (item) => item.id === existing.target,
              );
              const occupied = (await db
                .prepare(
                  "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
                )
                .get(existing.target)).count;
              if (!event || (event.capacity != null && occupied >= event.capacity))
                return send(res, 409, {
                  error: "This event is no longer available or is full.",
                });
            }
            if (existing.kind === "booking") {
              const slot = JSON.parse(existing.data);
              if (
                (await overlapping(
                  slot.date,
                  Number(slot.time.slice(0, 2)),
                  slot.duration,
                  id,
                ))
              )
                return send(res, 409, {
                  error: "Another rehearsal now occupies this slot.",
                });
            }
          }
          const result = (await db
            .prepare("UPDATE submissions SET status=? WHERE id=?")
            .run(body.status, id));
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
            throw invalid("Invalid content type.");
          const title = field("title", 120);
          const date = field("date", 50);
          if (!Number.isFinite(Date.parse(date)))
            throw invalid("Invalid date.");
          const previous =
            req.method === "PUT"
              ? (await db
                  .prepare("SELECT data FROM content WHERE kind=? AND id=?")
                  .get(kind, field("id")))
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
            sample: original?.sample || false,
          };
          if (!original)
            item.image = kind === "events" ? "royal-vocals" : "freshy-friends";
          if (kind === "events") {
            if (Object.hasOwn(body, "link")) {
              const link = field("link", 2000, false);
              if (link) {
                let videoUrl;
                try { videoUrl = new URL(link); } catch {
                  throw invalid("Please provide a valid video URL.");
                }
                if (!["https:", "http:"].includes(videoUrl.protocol) || videoUrl.username || videoUrl.password)
                  throw invalid("Please use an http or https video link without credentials.");
              }
              item.link = link;
            }
            Object.assign(item, {
              venue: field("venue"),
              description: field("description", 3000),
            });
            // An event with no capacity is unlimited, so a blank or absent
            // value clears any limit the event previously carried.
            const limit =
              typeof body.capacity === "string"
                ? body.capacity.trim()
                : body.capacity;
            if (limit === "" || limit === null || limit === undefined)
              delete item.capacity;
            else {
              item.capacity = Number(limit);
              if (
                !Number.isInteger(item.capacity) ||
                item.capacity < 1 ||
                item.capacity > 10000
              )
                throw invalid("Capacity must be between 1 and 10000.");
              const occupied = (await db
                .prepare(
                  "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
                )
                .get(item.id)).count;
              if (item.capacity < occupied)
                return send(res, 409, {
                  error:
                    "Capacity cannot be lower than the current registration count.",
                });
            }
          } else
            Object.assign(item, {
              excerpt: field("excerpt", 300),
              body: field("body", 5000),
            });
          (await db.prepare(
            "INSERT INTO content VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",
          ).run(kind, item.id, JSON.stringify(item)));
          return send(res, req.method === "PUT" ? 200 : 201, item);
        }
        if (path.startsWith("/api/admin/content/") && req.method === "DELETE") {
          const [, , , , kind, id] = path.split("/");
          const result = (await db
            .prepare("DELETE FROM content WHERE kind=? AND id=?")
            .run(kind, id));
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
          throw invalid("Invalid submission type.");
        const email = field("email", 254).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw invalid("Please enter a valid email address.");
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
          const event = (await list("events")).find((item) => item.id === target);
          if (!event) return send(res, 404, { error: "Event not found." });
          const ends = /^\d{4}-\d{2}-\d{2}$/.test(event.date)
            ? Date.parse(`${event.date}T23:59:59+07:00`)
            : Date.parse(event.date);
          if (ends <= Date.now())
            throw invalid("Registration for this event is closed.");
          if (
            (await db
              .prepare(
                "SELECT id FROM submissions WHERE kind='registration' AND email=? AND target=?",
              )
              .get(email, target))
          )
            return send(res, 409, {
              error: "You are already registered for this event.",
            });
          if (
            event.capacity != null &&
            (await db
              .prepare(
                "SELECT COUNT(*) AS count FROM submissions WHERE kind='registration' AND target=? AND status!='rejected'",
              )
              .get(target)).count >= event.capacity
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
            throw invalid("Please choose a valid rehearsal slot.");
          const start = new Date(`${data.date}T${data.time}:00+07:00`);
          if (
            !Number.isFinite(start.getTime()) ||
            start <= new Date() ||
            start.toISOString().slice(0, 10) !== data.date
          )
            throw invalid("Choose a future rehearsal date.");
          const hour = Number(data.time.slice(0, 2));
          const weekend = [0, 6].includes(
            new Date(`${data.date}T12:00:00+07:00`).getUTCDay(),
          );
          if (
            hour < (weekend ? 13 : 16) ||
            hour + data.duration > (weekend ? 18 : 21)
          )
            throw invalid("Choose a slot within club opening hours.");
          if ((await overlapping(data.date, hour, data.duration)))
            return send(res, 409, {
              error:
                "This slot has already been requested. Please choose another time.",
            });
          data.message = field("message", 2000, false);
        }
        if (
          kind === "newsletter" &&
          (await db
            .prepare(
              "SELECT id FROM submissions WHERE kind='newsletter' AND email=?",
            )
            .get(email))
        )
          return send(res, 200, {
            ok: true,
            message: "You are already on the list.",
          });
        const id = randomUUID();
        (await db.prepare(
          "INSERT INTO submissions(id,kind,email,target,data,created) VALUES(?,?,?,?,?,?)",
        ).run(
          id,
          kind,
          email,
          target,
          JSON.stringify(data),
          new Date().toISOString(),
        ));
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
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".map": "application/json; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".png": "image/png",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".woff2": "font/woff2",
      };
      const extension = extname(file);
      res.writeHead(200, {
        "Content-Type": types[extension] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        // Vite fingerprints everything under /assets/, so those are immutable.
        // The shell must revalidate or it would pin a stale asset manifest.
        "Cache-Control": file.includes(`${sep}assets${sep}`)
          ? "public, max-age=31536000, immutable"
          : extension === ".html"
            ? "no-cache"
            : "public, max-age=3600",
      });
      res.end(req.method === "HEAD" ? undefined : readFileSync(file));
    } catch (error) {
      if (error instanceof ValidationError)
        send(res, 400, { error: error.message });
      else if (duplicate(error))
        send(res, 409, { error: "That submission already exists." });
      else {
        console.error(`${req.method} ${path} failed`, error);
        send(res, 500, { error: "Something went wrong. Please try again." });
      }
    }
  };

}
