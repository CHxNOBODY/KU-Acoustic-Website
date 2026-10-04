# KU Acoustic

A full-stack website for Kasetsart University's acoustic music club. The design combines warm paper tones, forest green, editorial typography, and music photography with responsive layouts and accessible dialogs.

## Features

- Home, searchable events, journal, filterable gallery, club story, and FAQs.
- Upcoming and past events, capacity-aware registration, direct watch-video links on cards and event details, and downloadable calendar entries. Committee members can add, replace, or clear video URLs in the event editor.
- Membership applications for musicians, production crew, and music lovers.
- Rehearsal requests with Bangkok opening-hour validation and overlap prevention.
- Newsletter signup and collaboration/contact requests.
- Protected committee dashboard: review and approve requests, export CSV, and create, edit, or remove events and journal posts.
- Persistent SQLite storage, server-side validation, request size limits, rate limiting, and expiring HTTP-only admin sessions.

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
| `npm run typecheck`    | Strict TypeScript checks                                |
| `npm test`             | API integration tests, with isolated test databases     |
| `npm run build`        | Typecheck and production frontend build                 |
| `npm start`            | Backend serving the API and built frontend on port 3001 |

Restart the backend after changing server files or environment settings. React and CSS changes reload automatically.

## Project structure

```text
src/App.tsx                         Public pages and navigation
src/styles/index.css                Responsive design system
src/lib/api.ts                      API client and shared types
src/components/Dialog.tsx           Accessible native modal
src/features/community/             Application and request forms
src/features/admin/                 Committee dashboard
server/index.mjs                    HTTP API, sessions, database, static hosting
server/seed.mjs                     Initial content and original show archive
server/api.test.mjs                 Integration tests
scripts/dev.mjs                     Development process launcher
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

For production, build the frontend and run `npm start` on a persistent Node host behind HTTPS. Configure `ADMIN_TOKEN` and the public frontend origin, mount persistent storage for the database, and back up the SQLite database regularly. The included Dockerfile supports a persistent `/app/data` volume and runs as the unprivileged Node user.

**The previous Vercel static-only deployment does not run this backend.** A persistent Node/container host is needed for this SQLite architecture. A Vercel deployment would require adapting the API to serverless functions and moving storage to a hosted database. No deployment is performed by this change.

## Content and delivery notes

Upcoming events are explicitly labeled **sample events**; replace them with approved club dates before launch. All photography is selected from the club's `D:\KUAC Website Picture` folder and served locally as optimized WebP assets in `public/images/club`. `sources.json` records the original file for each selection. The gallery includes club performances and candid community photos; event artwork may use representative club photography when a photo of that specific event was not supplied. Fonts load from Google Fonts. Club facts and social links are retained from the original project.

The image preparation scripts use Pillow and pillow-heif to orient, resize, and convert JPEG/HEIC originals into browser-ready copies. Originals remain unchanged. They are maintenance tools, not required to build or run the website. Existing database content using the previous stock photos is migrated on backend startup without resetting titles, dates, or submissions. Newly published content also defaults to local club photos.

Applications, subscriptions, contact messages, and registrations are stored and available to the committee. **Automatic email delivery is not configured**: the committee follows up manually using the stored email addresses or exported CSV. Rehearsal requests require committee approval; the public form does not verify student identity or membership. Calendar downloads use an estimated one-hour end time, which is stated in the calendar description.

Tests cover validation, protected routes, sessions and logout, event capacity, duplicate registrations, newsletter deduplication, booking conflicts/opening hours, cross-origin rejection, publishing, deletion, and database persistence after restart.
