# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server, opens http://localhost:5173
npm run build      # tsc --noEmit, then vite build → dist/
npm run typecheck  # type check only
npm run preview    # serve the built dist/ at http://localhost:4173
```

There is no test suite and no linter. `npm run typecheck` is the only automated check —
`tsconfig.json` runs `strict` plus `noUnusedLocals` / `noUnusedParameters`, so unused
imports or variables fail the build, not just the editor.

## Architecture

A single-page React 18 + TypeScript site (Vite, Tailwind v3, lucide-react icons) for the
KU Acoustic club. There is no router, no data fetching, and no backend: `App.tsx` stacks
`Nav`, four sections, and `Footer`, and navigation is anchor links to section `id`s
(`#shows`, `#news`, `#about`) with `scroll-behavior: smooth`.

Code is organized **feature-first**: each section owns a folder under `src/features/`
holding its component, its `*.data.ts` array, and its `types.ts`. `src/components/` is
only for pieces genuinely shared across features (`Nav`, `Footer`, `Waveform`). Adding a
section means adding one folder, wiring it into `App.tsx`, and adding an entry to `LINKS`
in `Nav.tsx`.

Content lives in the data files, not the components — `features/shows/shows.data.ts` and
`features/news/news.data.ts`. Both render in array order; Shows filters on `status`
(`"upcoming"` | `"past"`). An optional `link` on either type turns the row/title into a
new-tab link. A handful of one-off strings are hardcoded in components instead: `STATS`
and `CONTACT` in `About.tsx`, the tagline in `Hero.tsx`, the address line in `Footer.tsx`,
`LINKS` in `Nav.tsx`.

### Conventions that matter

- **`@/` alias** for `src/` in cross-feature imports; relative imports inside a feature.
  It is declared in **two** places that must stay in sync: `resolve.alias` in
  `vite.config.ts` and `compilerOptions.paths` in `tsconfig.json`.
- **Theming is CSS variables, not Tailwind color literals.** `src/styles/index.css`
  defines `--ink` / `--paper` / `--gray` and maps them onto shadcn-style semantic tokens
  (`--background`, `--foreground`, `--muted`, …) that `tailwind.config.ts` exposes as
  `bg-background`, `text-foreground`, etc. Style with the semantic classes; re-theme by
  editing the `:root` variables. `--radius` is `0px` by design — the look is flat,
  black-on-off-white "paper & ink", and the inverted footer is the one deliberate
  high-contrast moment.
- Sections carry a mono numeric label (`01`, `02`, `03`) matching their `Nav` entry; keep
  those in sync when reordering.
- Fonts (Fraunces / Space Grotesk / JetBrains Mono) load via `<link>` in `index.html`, and
  are applied through `font-display` / `font-body` / `font-mono` utilities.

## Deployment

Hosted on Vercel at https://ku-acoustic-website.vercel.app, auto-deploying on push to
`main` (PRs get preview URLs). `BASE` in `vite.config.ts` is `"/"` because Vercel serves
from the domain root — a wrong value 404s every asset and renders a blank page while still
returning HTTP 200. GitHub *project* Pages would need `"/KU-Acoustic-Website/"`.
