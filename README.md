# KU Acoustic

Website for the KU Acoustic music club — shows, news, and club info. Built as a single-page React site with a minimal black-and-white "paper & ink" look.

## Stack

- React + TypeScript
- Tailwind CSS (+ shadcn/ui components available, mostly unused by this site)
- Vite for local dev, Parcel to bundle into one self-contained HTML file

## Project structure

```
src/
  App.tsx              — assembles the page (Nav, Hero, Shows, News, About, Footer)
  index.css            — theme: colors, fonts (Fraunces, Space Grotesk, JetBrains Mono),
                          wave animation
  components/
    Nav.tsx             — sticky top navigation
    Hero.tsx            — big wordmark + tagline
    Shows.tsx           — Upcoming/Past toggle, ticket-stub style rows
    News.tsx            — news list, titles link out when an item has `link`
    About.tsx           — manifesto, stats, contact links
    Footer.tsx          — inverted (black background) footer
    Waveform.tsx         — the equalizer-bar motif used in Hero and Footer
  data/
    content.ts          — all show and news content lives here
tailwind.config.js       — fonts, wave keyframe animation
```

## Editing content

You won't usually need to touch the components. Almost everything you'd want to update lives in `src/data/content.ts`:

- **`shows`** — each entry needs `status` (`"upcoming"` or `"past"`), a date, `title`, `venue`, `time`, and `tag`. The Shows section filters and sorts off this array as-is — add/remove/reorder entries directly.
- **`news`** — each entry has `date`, `category`, `title`, `excerpt`, and an optional `link`. If `link` is set, the title becomes clickable and opens in a new tab.

A few other one-off details are hardcoded in their components rather than `content.ts`:

- Hero tagline — `src/components/Hero.tsx`
- Founded year, member count, rehearsal schedule, social links — `STATS` and `CONTACT` in `src/components/About.tsx`
- Footer address/schedule line — `src/components/Footer.tsx`

## Running locally

This source drop contains the custom files only (components, data, styles, Tailwind config) — it needs to sit inside a Vite + React + Tailwind + shadcn/ui scaffold to actually run. If you don't already have that scaffold:

```bash
npm create vite@latest ku-acoustic -- --template react-ts
cd ku-acoustic
# set up Tailwind CSS (see https://tailwindcss.com/docs/guides/vite)
# copy this project's src/ and tailwind.config.js in, overwriting the defaults
npm install
npm run dev
```

Once it's running:

```bash
npm run dev      # local dev server with hot reload
npm run build    # production build
```

## Notes

- Colors, radius, and most tokens are defined as CSS variables in `src/index.css` under `:root` — change those to re-theme the site.
- The footer is the one deliberate high-contrast moment (black background) — everything else stays on the off-white "paper" background by design.
