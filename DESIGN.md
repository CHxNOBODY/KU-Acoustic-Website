---
name: KU Acoustic
description: Kasetsart University's acoustic music club; a scrapbook the club keeps of itself.
colors:
  kasetsart-forest: "#234c3e"
  forest-night: "#173b30"
  fired-clay: "#be6d41"
  clay-ink: "#a0552e"
  pressed-sage: "#e8ede3"
  unbleached-cream: "#f7f6f0"
  rag-paper: "#fffef9"
  moss-mist: "#edf0e7"
  loam-ink: "#252c26"
  lichen-gray: "#666a60"
  chalk-line: "#dedfd5"
typography:
  display:
    fontFamily: "Fraunces, Mitr, Georgia, serif"
    fontSize: "clamp(43px, 4.4vw, 63px)"
    fontWeight: 400
    lineHeight: 1.13
    letterSpacing: "-2.4px"
  headline:
    fontFamily: "Fraunces, Mitr, Georgia, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "-1.5px"
  title:
    fontFamily: "Space Grotesk, Anuphan, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.5px"
  body:
    fontFamily: "Space Grotesk, Anuphan, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Space Grotesk, Anuphan, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  eyebrow:
    fontFamily: "Space Grotesk, Anuphan, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "1.8px"
rounded:
  sticker: "4px"
  control: "5px"
  card: "7px"
  dialog: "12px"
  pill: "30px"
  arch: "130px 8px 8px 8px"
spacing:
  gutter-mobile: "22px"
  gutter-tablet: "30px"
  gutter-desktop: "45px"
  card-gap: "24px"
  section-y: "77px"
  container: "1260px"
components:
  button-primary:
    backgroundColor: "{colors.kasetsart-forest}"
    textColor: "{colors.unbleached-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
    height: "47px"
  button-primary-hover:
    backgroundColor: "{colors.forest-night}"
  button-cream:
    backgroundColor: "{colors.unbleached-cream}"
    textColor: "{colors.kasetsart-forest}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.loam-ink}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  filter-chip:
    textColor: "{colors.loam-ink}"
    rounded: "{rounded.pill}"
    padding: "8px 15px"
  filter-chip-active:
    backgroundColor: "{colors.kasetsart-forest}"
    textColor: "{colors.unbleached-cream}"
  input-field:
    backgroundColor: "{colors.rag-paper}"
    textColor: "{colors.loam-ink}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
    height: "43px"
  event-card:
    backgroundColor: "{colors.rag-paper}"
    rounded: "{rounded.card}"
  date-sticker:
    backgroundColor: "{colors.unbleached-cream}"
    textColor: "{colors.kasetsart-forest}"
    rounded: "{rounded.sticker}"
    width: "49px"
  join-banner:
    backgroundColor: "{colors.kasetsart-forest}"
    textColor: "{colors.unbleached-cream}"
    rounded: "{rounded.card}"
    padding: "40px 42px"
---

# Design System: KU Acoustic

## Overview

**Creative North Star: "The Clubroom Scrapbook"**

The site reads like a scrapbook the club keeps of itself: warm unbleached paper, forest-green ink, and the club's own photographs pinned in with a few handwritten asides. Real moments carry the page. A large photo with one dramatically arched corner anchors the hero; paper notes sit slightly askew on top of it (rotated −4° to −6°); a terracotta script line ("it starts with a song ↗") is scrawled underneath. Everything else is orderly and calm, so those few tilted, handwritten touches read as personality rather than noise.

Density is light and editorial. Fraunces display type sets warm, slightly literary headlines with one green italic phrase carrying the emphasis, while Space Grotesk handles everything functional in small, tidy sizes. Surfaces are flat paper on paper, separated by hairline chalk rules; depth appears only when something is lifted (a hovered card, a pinned note, an open dialog). Motion is friendly and tactile: buttons rise on hover and press back down, arrows nudge up-right, chips pop when chosen. All of it switches off under reduced motion.

The system is bilingual by construction. Thai swaps in Anuphan (body) and Mitr (display), drops all letter-spacing, opens up display leading, and never fakes an italic.

**Key Characteristics:**
- Cream paper ground, forest-green ink, terracotta used sparingly as the hand-drawn accent.
- Club photography as the hero material, slightly desaturated (`brightness(0.92) saturate(0.92)`) so it sits on the paper.
- One arched corner as the signature silhouette; everything else softly rounded at 4–7px.
- A few tilted "pinned" elements per page, never a whole tilted layout.
- Hairline borders over shadows; shadows reserved for lifted things.
- Small, tracked uppercase eyebrows above every section headline.

## Colors

A botanical palette: one deep green that does nearly all the work, cream and sage paper tones, and a single fired-clay accent.

### Primary
- **Kasetsart Forest** (#234c3e): The ink. Primary buttons, active nav and filter states, eyebrows, links, the italic emphasis in headlines, focus borders on inputs, the join banner, text selection.
- **Forest Night** (#173b30): Hover state for primary buttons, the backdrop behind the hero slideshow, the translucent slideshow control bar (`#173b30d9`).

### Secondary
- **Fired Clay** (#be6d41): The hand-drawn accent for non-text marks: keyboard focus outlines, small decorative icons and arrows in pinned notes, social-icon hover. It marks attention, never fills areas.
- **Clay Ink** (#a0552e): Fired Clay darkened to pass 4.5:1 on every paper tone, for clay-colored *text*: link hover, the handwritten script line, the event-card status label (COMING UP / PAST EVENT).

### Neutral
- **Unbleached Cream** (#f7f6f0): The page ground and dialog background; also the text color on green.
- **Rag Paper** (#fffef9): Raised paper: event cards, input fields, pinned hero notes.
- **Pressed Sage** (#e8ede3): Quiet fills: the marquee band, icon-button and chip hover, image placeholders, note icons.
- **Moss Mist** (#edf0e7): The footer ground, one step greener than the page.
- **Loam Ink** (#252c26): Body text.
- **Lichen Gray** (#666a60): Secondary text: hero body copy, meta lines, helper text, the footer bottom bar. Chosen to pass 4.5:1 on cream, paper, sage and both footer/section greens.
- **Chalk Line** (#dedfd5): Every hairline border and divider: cards, inputs, chips, header rule, dialog edge.

On the green join banner, text uses softened greens rather than pure cream (eyebrow `#bfcdb8`, italic `#d1dfbd`, body `#c4cfc5`) so the banner stays gentle.

### Named Rules
**The Green Ink Rule.** Kasetsart Forest is the only color for interactive emphasis. A button, active tab, selected chip or link is green; nothing interactive is terracotta at rest.

**The Clay Mark Rule.** Fired Clay appears in strokes and small marks (focus rings, icons), never as a background fill or a button. Text in clay always uses Clay Ink.

## Typography

**Display Font:** Fraunces (with Mitr for Thai, Georgia fallback)
**Body Font:** Space Grotesk (with Anuphan for Thai, sans-serif fallback)

**Character:** A warm, slightly bookish optical-size serif paired with a crisp, friendly grotesk. The serif carries feeling; the grotesk carries information.

### Hierarchy
- **Display** (400, clamp(43px, 4.4vw, 63px), 1.13): The hero headline only. Tight tracking (−2.4px). One phrase set in green italic `<em>`.
- **Headline** (400, 40px, 1.14): Section and page titles (`h2`, `h1` on inner pages at 62px). Tracking −1.5px. Same green-italic emphasis convention. Banner headlines step down to 34–36px.
- **Title** (500, 20px, 1.35): Card and article titles (`h3`), in Space Grotesk.
- **Body** (400, 14px base, 1.8): Paragraphs. Lead and supporting paragraphs run 14–15px in Lichen Gray (hero body 15px desktop / 14px phone).
- **Label** (500, 12px): Buttons, text links, nav items, form labels (11px).
- **Eyebrow** (600, 11px, tracking 1.8px, uppercase copy): The small green kicker above every section headline. Other tracked micro labels (date-sticker months, event status, footer column heads, photo captions) are also 11px.

### Named Rules
**The One Italic Phrase Rule.** A serif headline gets at most one `<em>` phrase, set in Kasetsart Forest. It is the emotional beat of the line ("Find *your people.*", "Stay for *the people.*").

**The Readable Floor Rule.** Nothing a visitor needs to read is under 12px; tracked uppercase labels may sit at 11px. Form fields are 14px (16px on phones, so iOS does not zoom on focus). Only the brand subline and the decorative vertical photo tagline go smaller, and the subline is hidden below 1050px.

**The Thai Typesetting Rule.** Under `html[lang="th"]`: letter-spacing is 0 everywhere except the brand lockup, `h1`/`h2` line-height opens to 1.35, and italics (headline `em`, the handwritten line) render upright, because Mitr has no italic.

## Layout

A centered container of 1260px (1170px for banners and the footer's inner width), with side gutters of 45px on desktop, 30px at ≤1050px, and 22px at ≤760px. Sections breathe at about 77px vertical padding (60px on tablet). The hero is a two-column grid (1.1fr copy / 1fr photo) that stacks on mobile. Card lists use a three-column grid with 24px gaps, dropping to fewer columns as the width narrows. Section headings are a flex row: eyebrow and headline on the left, a "view all" text link aligned to the baseline on the right.

Breakpoints: 1500px (wide), 1050px (tablet), 760px (mobile, collapsible nav), 650px and 380px (small-phone tightening). The header is sticky at 87px (73px on mobile) with a translucent cream background (`rgba(247,246,240,0.96)`) and a 15px backdrop blur.

## Elevation & Depth

Flat by default: paper on paper, separated by Chalk Line hairlines and the occasional tonal step (cream → sage → moss mist). Shadows are soft, green-tinted, and appear only when something is physically lifted off the page.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 10px 22px #234c3e0a`): Event card hover, paired with `translateY(-4px)`; slightly stronger (`#234c3e12`) on `:focus-within`.
- **Pinned note** (`box-shadow: 0 8px 30px #00000015`): The rotated paper note over the hero photo.
- **Popover** (`box-shadow: 0 10px 26px #234c3e12`): The date-picker calendar.
- **Dialog** (`box-shadow: 0 30px 100px #0004`): Modal dialogs, over a deep green backdrop (`#14271ed0`, 4px blur).
- **Input focus halo** (`box-shadow: 0 0 0 3px #234c3e1a`): Form fields on focus, with a green border.

### Named Rules
**The Lifted-Only Rule.** Nothing rests with a shadow except a pinned note. Cards, buttons and panels are flat until hovered, focused or opened.

## Shapes

Softly rounded rectangles throughout: 4px for date stickers, 5px for buttons, inputs, search and the language toggle, 7px for cards and the join banner, 12px for dialogs. Filter chips and image tags are full pills (20–30px). Avatars, dots and slideshow controls are circles.

The signature silhouette is the **arch**: one oversized rounded corner against three tight ones. The hero photo uses `130px 8px 8px 8px` (top-left arch; 105px on small phones); the belonging photo uses `6px 6px 110px 6px` and the About photo `8px 8px 100px 8px` (bottom-right arch). The brand mark echoes it as a small tilted tombstone (`45% 45% 3px 3px`, rotated −6°).

### Named Rules
**The One Arch Rule.** At most one arched photo per viewport, and the arch always belongs to a photograph, never to a button, card or panel.

## Components

Friendly and tactile: things lift when you approach them, press back when you click them, and say thanks with a small pop.

### Buttons
- **Shape:** Gently rounded (5px), minimum height 47px (40px in the header), 12px/500 label, generous 20px gap before a trailing arrow icon.
- **Primary:** Kasetsart Forest fill, cream text, 13px × 22px padding.
- **Hover / Focus:** Lifts 2px (`translateY(-2px)`), fill deepens to Forest Night, trailing arrow nudges up-right (`translate(3px, -3px)`, 260ms `cubic-bezier(0.2, 0.7, 0.2, 1)`). Active presses down to `scale(0.98)`. Keyboard focus is a 2px Fired Clay outline offset 5px.
- **Cream:** Cream fill with green text, for use on green surfaces (join banner).
- **Outline:** Transparent with a Chalk Line border; secondary actions.
- **Text link:** Green 12px/500 label with a trailing arrow, turns Fired Clay on hover.
- **Icon button:** 8px padding, 5px radius, sage fill on hover.

### Chips
- **Style:** Pill (30px), Chalk Line border, 11px label, 8px × 15px padding.
- **State:** Active is a solid Kasetsart Forest fill with cream text; inactive hover is a sage fill. Form option chips (roles, time slots) pop (`scale 0.94 → 1.04 → 1`, 280ms) when checked.

### Cards / Containers
- **Corner Style:** 7px.
- **Background:** Rag Paper on the cream page.
- **Shadow Strategy:** Flat at rest; Card lift on hover (see Elevation).
- **Border:** 1px Chalk Line; internal dividers (e.g. card footer) are also Chalk Line hairlines.
- **Internal Padding:** 20px. Event photos are 220px tall, zoom to `scale(1.04)` on hover over 0.4s.

### Inputs / Fields
- **Style:** Rag Paper fill, 1px Chalk Line border, 5px radius, 12px × 13px padding, min height 43px, 12px text. Labels sit above in green 11px/500.
- **Focus:** Border turns Kasetsart Forest with a soft 3px green halo; no outline.
- **Error:** The form error message shakes once (360ms). Success shows a checkmark that pops in with a slight rotation.
- **Newsletter variant:** Borderless, with only a bottom rule (`#9ba794`), for inline signup.

### Navigation
- **Style:** Sticky translucent cream header with a Chalk Line bottom rule. Links are 12px in a soft gray (`#666c63`); an underline draws in from the left on hover (220ms). The active page is green, 600 weight, with a 4px green dot beneath.
- **Actions:** A bordered language toggle (ไทย / EN) and a compact primary "Join the club" button.
- **Mobile:** At ≤760px the nav collapses behind a toggle and slides open (240ms).

### Date Sticker (signature)
A small cream tab (49px wide, 4px radius) pinned to the top-left of event photos: the day in Fraunces 25px/500, the month in 8px uppercase tracked text below. Without a photo it sits inline with a Chalk Line border.

### Pinned Note (signature)
A Rag Paper card laid over the hero photo, rotated −4°, with the pinned-note shadow, a round sage icon, short two-line copy (second line bold), and a small Fired Clay arrow. Paired with the Fired Clay italic script line rotated −6°.

### Marquee Band
A 56px Pressed Sage band between hero and content with hairline top and bottom borders, scrolling tracked uppercase words (PLAY · CONNECT · CREATE · BELONG) in green at 11px with 3px tracking. It has a visible play/pause control and is hidden from motion under reduced-motion.

### Role List
The three ways into the club (Play / Make the show happen / Just love music) in the belonging section. Ruled like a songbook index rather than boxed as cards: hairline rules (`#d6dacd`) above and below each row, a 20px green line icon, a green 600-weight role name, and one 14px Lichen Gray line beneath.

### Card Placeholder
While content loads, event grids show three Rag Paper cards with a Chalk Line border holding sage bars (date-sticker block, title bar, meta bar) with a slow 1.4s shimmer. Errors replace the grid in place with the pale clay panel (`#f4dfd6`), a plain-language message, a Try again link and an Instagram link.

## Do's and Don'ts

### Do:
- **Do** use the club's own photographs, softened with `brightness(0.92) saturate(0.92)`, as the main visual material.
- **Do** set section headlines in Fraunces with one green italic phrase, preceded by a 10px tracked uppercase eyebrow.
- **Do** separate surfaces with 1px Chalk Line (#dedfd5) hairlines and tonal steps before reaching for a shadow.
- **Do** keep interactive states green: hover lifts (−2px buttons, −4px cards), arrows nudge up-right, presses scale to 0.98.
- **Do** use Fired Clay (#be6d41) for focus outlines (2px, 5px offset) and small hand-drawn marks.
- **Do** wrap every animation so `prefers-reduced-motion: reduce` turns it off, as the global block in `src/styles/index.css` does.
- **Do** check every new string and style in Thai: no letter-spacing, looser display leading, upright emphasis.
- **Do** give every control a 44px target on phones (header Join, language and menu buttons, slideshow arrows, newsletter submit, social icons). Where 44px cannot fit, as with the slideshow dots, swap the pattern (a `3 / 14` counter) rather than shrinking the target.
- **Do** use `button outline` knowing Tailwind also emits an `.outline` utility; the stylesheet cancels it so only keyboard focus draws a ring.

### Don't:
- **Don't** fill buttons or backgrounds with Fired Clay; it is an accent stroke, not a surface.
- **Don't** tilt more than the one or two pinned elements in a view; the rotation only reads as charm against an orderly page.
- **Don't** put the arched corner on anything but a photograph, or use more than one arch per viewport.
- **Don't** give resting cards or panels a shadow.
- **Don't** use sharp 0px corners or pure black-on-white; that was the retired "paper & ink" look and its unused legacy components (`Nav.tsx`, `Footer.tsx`, `Waveform.tsx`, `features/hero/Hero.tsx`).
- **Don't** style new UI with the leftover Tailwind semantic tokens (`bg-background`, `text-foreground`); the shipped system is the CSS custom properties and classes in `src/styles/index.css`.
