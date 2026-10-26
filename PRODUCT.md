# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: prospective members.** Kasetsart University students, from any faculty, deciding
whether to join the club: performers of every level, production and creative crew, and
people who simply love music. Their job is to find out what the club is like, whether
there is a place for them, and how to apply.

Secondary audiences, served by the same site:

- **Current members** checking upcoming gigs and requesting clubroom rehearsal slots.
- **Audiences and the public** finding shows, registering, adding events to a calendar,
  and watching recap videos.
- **The club committee**, who use the protected dashboard (`/#admin`) to review
  applications and requests, export CSV, and publish or edit events and journal posts.

## Product Purpose

The website for KU Acoustic, Kasetsart University's acoustic music club. It exists to
turn curious students into members: show the club's people, performances, and history,
then make applying easy. Success is a prospective member understanding that they would
belong and submitting a membership application.

It also runs the club's everyday logistics in one place: event listings with
capacity-aware registration, rehearsal booking, newsletter signup, and contact requests.

## Positioning

A student community with history since 1989 and 40+ active members, shown through its
own photographs of real club performances, rehearsals, and trips rather than stock
imagery. Membership is open beyond performers: production crew and music lovers are
explicitly welcome.

## Operating Context

- Students typically arrive from social links or campus word of mouth, often on phones.
- Membership applications are reviewed by the committee, who follow up with recruitment
  or audition details; submitting does not confirm membership.
- Rehearsal requests are for the clubroom and need committee approval. Hours (Bangkok
  time): weekdays 16:00–21:00, weekends 13:00–18:00.
- No automatic email delivery: the committee follows up manually from stored addresses or
  exported CSV.
- Calendar downloads use an estimated one-hour end time.

## Capabilities and Constraints

- Pages: Home, Events (searchable, upcoming/past), Journal, Gallery (filterable), Our
  story (About + FAQ), and the committee Admin dashboard.
- Bilingual, **English first** with a Thai toggle. Every string lives in
  `src/lib/copy.tsx`, with `th` typed against `en` so the two cannot drift.
- Backend: one API handler (`server/handler.ts`) shared by the local Node/SQLite server
  and the Supabase Edge Function on Postgres; the Vercel frontend proxies `/api/*` to it.
- Membership roles: musicians, production crew, music lovers.
- The public rehearsal form does not verify student identity or membership.

## Brand Commitments

- Name: **KU Acoustic**, Kasetsart University, Bangkhen, Bangkok.
- Voice: warm, inclusive, lightly playful ("Find your sound. Find your people.",
  "Come for the music. Stay for the people.").

## Evidence on Hand

- Confirmed facts: founded **1989**; **40+ active members**; clubroom hours above;
  upcoming events in the data are real club dates (seed data has `sample: false`).
- Club photography: `public/images/club/` (exhibition, Run In Rhythm, Royal, Kaset,
  freshy, clubroom, and trip sets), with originals recorded in `sources.json`.
- Show archive with original dates and concert video links, preserved in `server/seed.ts`.
- Social links and club facts carried over from the original project.
- No testimonials, member quotes, press, or membership counts beyond the above exist;
  do not invent them.

## Product Principles

1. **Belonging first.** Every page should help a prospective member picture themselves in
   the club, including non-performers.
2. **Real over polished.** Use the club's own photos, dates, and history; never stock
   imagery or invented proof.
3. **One clear next step.** Applying, registering, or booking should always be obvious
   and short.
4. **Both languages are real.** English leads, but Thai is complete and never an
   afterthought.
5. **Honest logistics.** State what happens after a submission (committee review, manual
   follow-up) rather than implying automation.
