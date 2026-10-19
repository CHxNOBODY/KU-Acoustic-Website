# KU Acoustic

A full-stack website for Kasetsart University's acoustic music club. The design combines warm paper tones, forest green, editorial typography, and music photography with responsive layouts and accessible dialogs.

## Features

- Home, searchable events, journal, filterable gallery, club story, and FAQs.
- Upcoming and past events, capacity-aware registration, direct watch-video links on cards and event details, and downloadable calendar entries. Committee members can add, replace, or clear video URLs in the event editor.
- Membership applications for musicians, production crew, and music lovers.
- Rehearsal requests with Bangkok opening-hour validation and overlap prevention.
- Newsletter signup and collaboration/contact requests.
- Protected committee dashboard: review and approve requests, export CSV, and create, edit, or remove events and journal posts.
- SQLite storage locally and Supabase Postgres in production, server-side validation, request size limits, rate limiting, and expiring HTTP-only admin sessions.

## Run locally

Requires **Node.js 24 or newer**. No separate database installation or additional backend dependencies are needed.

```powershell
npm install
Copy-Item .env.example .env
# Edit .env and set ADMIN_TOKEN to a long, unique access key.
npm run dev
```

Run `npm run dev` to start both the frontend and backend. Open the local URL printed in the terminal (normally [the site](http://127.0.0.1:5173)). If backend port 3001 (or your configured `PORT`) is busy, startup automatically chooses a free port and connects Vite's `/api` proxy to it. Vite also chooses another frontend port if 5173 is busy. Open `/#admin` to use the committee dashboard. Without `ADMIN_TOKEN`, the admin endpoints stay locked; public features still work.

| Command                | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Frontend and backend together                           |
| `npm run dev:frontend` | Vite only                                               |
| `npm run dev:backend`  | Backend only                                            |
| `npm run typecheck`    | Strict TypeScript checks, frontend and backend          |
| `npm test`             | API integration tests, with isolated test databases     |
| `npm run build`        | Typecheck and production frontend build                 |
| `npm start`            | Backend serving the API and built frontend on port 3001 |
| `npm run prepare:supabase` | Copy the API handler into the Edge Function          |

The backend is TypeScript that Node 24 runs directly, with no build step: Node strips the type annotations when it loads each file. `tsconfig.server.json` only allows syntax that can be stripped this way. Restart the backend after changing server files or environment settings. React and CSS changes reload automatically.

## Project structure

```text
src/App.tsx                         Public pages and navigation
src/styles/index.css                Responsive design system
src/lib/api.ts                      API client and shared types
src/components/Dialog.tsx           Accessible native modal
src/features/community/             Application and request forms
src/features/admin/                 Committee dashboard
server/handler.ts                   HTTP API, sessions, validation, static hosting (shared with Supabase)
server/index.ts                     Node server: SQLite database, data migrations
server/seed.ts                      Initial content and original show archive
server/api.test.ts                  Integration tests
scripts/dev.ts                      Development process launcher
data/club.sqlite                    Runtime database (ignored by Git)
```

The original static feature files remain as a reference. The redesigned application fetches event and journal content from the backend. Initial content is seeded once; committee edits and deletions persist across restarts. Existing show dates and concert links are preserved in the archive.

## Environment

| Variable          | Default / purpose                                                               |
| ----------------- | ------------------------------------------------------------------------------- |
| `PORT`            | `3001`                                                                          |
| `HOST`            | `127.0.0.1`; use `0.0.0.0` inside a hosted container                            |
| `DATABASE_PATH`   | `./data/club.sqlite`; requires writable persistent storage                      |
| `ADMIN_TOKEN`     | Required for committee access; never exposed to the frontend                    |
| `ALLOWED_ORIGINS` | Comma-separated frontend origins; local Vite origins are allowed in development |
| `NODE_ENV`        | Use `production` behind HTTPS to enable secure session cookies                  |

For production, build the frontend and run `npm start` on a persistent Node host behind HTTPS. Configure `ADMIN_TOKEN` and the public frontend origin, mount persistent storage for the database, and back up the SQLite database regularly. The included Dockerfile supports a persistent `/app/data` volume and runs as the unprivileged Node user. The process closes the database on `SIGTERM` and `SIGINT`, so container stops are clean.

Set `TRUST_PROXY=1` only when a trusted reverse proxy terminates the connection. Rate limiting then keys on the first `X-Forwarded-For` address instead of the socket address, which would otherwise put every visitor behind the proxy into a single bucket. Leave it unset when the host is reached directly, since the header is attacker-controlled in that case.

Static delivery serves content-hashed `/assets/` files as immutable for a year and always revalidates `index.html`, which carries the asset manifest.

## Supabase production backend

The backend is deployed to the **KU Acoustic Website** Supabase project (`azkbfzvdqxcskqjafyfg`) in Singapore. The production API is:

```text
https://azkbfzvdqxcskqjafyfg.supabase.co/functions/v1/club-api/api
```

The `club-api` Edge Function preserves the existing routes and request/response shapes. Postgres tables live in the private `ku_acoustic` schema, with RLS enabled and no browser grants. The function authenticates every committee endpoint; content and validated public forms are intentionally open. Database transactions serialize mutations so event capacity and booking conflicts remain correct across concurrent function instances. Rate limits are stored in Postgres.

The existing local content was copied to Postgres without resetting committee edits. Local SQLite and production Postgres are separate databases; local changes do not automatically sync. Local admin sessions were not migrated. The existing `ADMIN_TOKEN` still works in production: only its SHA-256 digest is stored in the private settings table. Keep the access key long and unique. Production sessions use secure HTTP-only cookies.

`vercel.json` forwards the frontend's same-origin `/api/*` requests to this function, preserving committee cookies. **Redeploy the Vercel frontend to activate this proxy configuration.** The backend deployment does not itself update the hosted frontend. Direct cross-site browser committee login is not supported by the strict cookies; use the same-origin proxy. For a different frontend domain, set `ALLOWED_ORIGINS` in Supabase Edge Function secrets and update the proxy destination as needed.

Deployment sources:

- `supabase/schema.sql`: the schema applied as the `ku_acoustic_backend` remote migration.
- `supabase/functions/club-api/index.ts`: Postgres transactions, persisted rate limits, CORS, and the Edge HTTP adapter.
- `supabase/functions/club-api/handler.ts`: a copy of `server/handler.ts`, the same handler the Node server runs, made by `npm run prepare:supabase` because Supabase only bundles files under `supabase/functions`. Refresh it and redeploy after changing the API; `npm test` fails while the copy is stale.
- `supabase/config.toml`: local function configuration. Gateway JWT verification is disabled because the handler implements custom committee authentication and accepts public forms.
- `scripts/export-supabase-data.ts`: optional SQLite snapshot exporter. Run with `node --env-file=.env scripts/export-supabase-data.ts`. Its output is in ignored `artifacts/supabase-data.sql`; it contains submission data and must stay private. Exporting does not upload or synchronize data.

The function uses Supabase's built-in server-only `SUPABASE_DB_URL`; no database credentials or service keys are included in frontend code. Before redeploying, discover the installed Supabase CLI commands with `--help`, authenticate to the project, and deploy `club-api`. The Supabase connector can also deploy the three files in the function directory, explicitly setting `import_map_path` to `deno.json` when updating an existing deployment.

Deployment checks passed for public content, protected routes, committee login/logout, secure cookies, simultaneous registrations at capacity, newsletter deduplication, rehearsal overlap prevention, validation, and CORS. Temporary verification records were removed. Supabase's security advisor reported only informational notices about RLS tables without policies, which is intentional for this private schema with access through the backend.

## Content and delivery notes

Upcoming events are explicitly labeled **sample events**; replace them with approved club dates before launch. All photography is selected from the club's `D:\KUAC Website Picture` folder and served locally as optimized WebP assets in `public/images/club`. `sources.json` records the original file for each selection. The gallery includes club performances and candid community photos; event artwork may use representative club photography when a photo of that specific event was not supplied. Fonts load from Google Fonts. Club facts and social links are retained from the original project.

The image preparation scripts use Pillow and pillow-heif to orient, resize, and convert JPEG/HEIC originals into browser-ready copies. Originals remain unchanged. They are maintenance tools, not required to build or run the website. Existing database content using the previous stock photos is migrated on backend startup without resetting titles, dates, or submissions. Newly published content also defaults to local club photos.

Applications, subscriptions, contact messages, and registrations are stored and available to the committee. **Automatic email delivery is not configured**: the committee follows up manually using the stored email addresses or exported CSV. Rehearsal requests require committee approval; the public form does not verify student identity or membership. Calendar downloads use an estimated one-hour end time, which is stated in the calendar description.

Tests cover validation, protected routes, sessions and logout, event capacity, duplicate registrations, newsletter deduplication, booking conflicts/opening hours, cross-origin rejection, publishing, deletion, and database persistence after restart.
