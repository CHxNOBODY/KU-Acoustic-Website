# KU Acoustic

Website for the KU Acoustic music club — shows, news, and club info. A single-page
React site with a minimal black-and-white "paper & ink" look.

## Stack

- **React 18 + TypeScript**
- **Vite** — dev server and production build
- **Tailwind CSS v3** — theme tokens live as CSS variables in `src/styles/index.css`
- **lucide-react** — icons

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                    |
| `npm run build`     | Typecheck, then build to `dist/`              |
| `npm run preview`   | Serve the built `dist/` locally               |
| `npm run typecheck` | Run TypeScript with no build                  |

## Project structure

```
index.html                  Vite entry — page <head>, meta tags, font loading
vite.config.ts              Build config, "@/" alias, GitHub Pages base path
tailwind.config.ts          Theme: colors, fonts, wave keyframe
tsconfig.json               TypeScript config (app + config files)
postcss.config.js           Tailwind + autoprefixer

public/
  favicon.svg               Waveform mark

src/
  main.tsx                  Mounts <App> into #root
  App.tsx                   Assembles the page
  features/                 One folder per section — component, data and types together
    hero/
      Hero.tsx              Big wordmark + tagline
    shows/
      Shows.tsx             Upcoming/Past toggle, ticket-stub rows
      shows.data.ts         Every show, past and upcoming
      types.ts              Show, ShowStatus
    news/
      News.tsx              News list, titles link out when `link` is set
      news.data.ts          Every news item
      types.ts              NewsItem
    about/
      About.tsx             Manifesto, stats, contact links
  components/               Shared across features
    Nav.tsx                 Sticky top navigation + mobile menu
    Footer.tsx              Inverted (black background) footer
    Waveform.tsx            Equalizer-bar motif used in Hero and Footer
  styles/
    index.css               Theme tokens, base styles, font utilities

.github/workflows/deploy.yml  Builds and deploys to GitHub Pages on push to main
legacy/index.html             Archived pre-Vite build (see "Legacy build" below)
```

The layout is **feature-based**: everything belonging to a section lives in its own
folder under `features/`, so adding a section means adding one folder rather than
touching four. Only genuinely shared pieces sit in `components/`.

Imports use the `@/` alias for `src/` — e.g. `import Shows from "@/features/shows/Shows"`.
Inside a feature, use relative imports (`./shows.data`). The alias is declared in
**two** places that must stay in sync: `resolve.alias` in `vite.config.ts` and
`compilerOptions.paths` in `tsconfig.json`.

## Editing content

Almost everything you'd want to update lives in two files — you shouldn't need to
touch the components:

- **`src/features/shows/shows.data.ts`** — each show needs `status` (`"upcoming"` or
  `"past"`), `day` / `month` / `year`, `title`, `venue`, `time`, and `tag`. Add an
  optional `link` and the whole row becomes clickable, opening in a new tab. The
  Shows section filters by `status` and renders the array in the order you write it.
- **`src/features/news/news.data.ts`** — each item has `date`, `category`, `title`,
  `excerpt`, and an optional `link`. With `link` set, the title becomes a link.

A few one-off details are hardcoded in their components rather than in `data/`:

| What                                        | Where                              |
| ------------------------------------------- | ---------------------------------- |
| Hero tagline                                 | `src/features/hero/Hero.tsx`        |
| Founded year, members, rehearsal schedule    | `STATS` in `features/about/About.tsx` |
| Social links                                 | `CONTACT` in `features/about/About.tsx` |
| Footer address/schedule line                 | `src/components/Footer.tsx`         |
| Nav items                                    | `LINKS` in `components/Nav.tsx`     |

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages.

**One-time setup:** in the repo, go to **Settings → Pages → Build and deployment**
and set **Source** to **GitHub Actions**. Until you do that, the workflow will run
but the published site won't update.

### Base path

The site is served from `https://<user>.github.io/KU-Acoustic-Website/`, so
production builds prefix assets with `/KU-Acoustic-Website/` (`PROD_BASE` in
`vite.config.ts`). Dev stays on `/`. If you move to a custom domain or rename the
repo, update `PROD_BASE` — otherwise the CSS and JS will 404.

## Legacy build

`legacy/index.html` is the previous deployment: a single 465 KB self-contained file
produced by the old Parcel setup, with React and all styles inlined. It's kept for
reference only — nothing builds or serves it, and editing it has no effect.

Note that a few edits had been made directly to that bundled file without being
applied back to the source, so the two had drifted. The source is now the single
authority, reconciled to match what the bundle was serving. Once you've confirmed
the new deployment looks right, `legacy/` is safe to delete.

## Notes

- Colors, radius, and other tokens are CSS variables under `:root` in
  `src/styles/index.css` — change those to re-theme the site.
- Fonts (Fraunces, Space Grotesk, JetBrains Mono) load via `<link>` in `index.html`
  with `preconnect`, rather than a CSS `@import`.
- The footer is the one deliberate high-contrast moment — everything else stays on
  the off-white "paper" background by design.
