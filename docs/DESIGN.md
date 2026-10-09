# VGP Web design rules

Applies to the public site (repo root app). The founder dashboard and
`flowstate/` have their own looks and are out of scope.

Quality references: anti-slop (miqdadbadjuber/anti-slop), design-taste
(madebymustafa/design-taste), frontend-craft (nattergabriel/frontend-craft)
and humanizer (blader/humanizer) for every piece of user-facing copy.
The two copy skills are vendored in `.claude/skills/humanizer/` and
`.claude/skills/antislop-copywriting/`; run both on any new copy.

## Direction

A producer's site, so it is dark on purpose: the founder portrait is black and
white and the logo is chrome. Real photos carry the pages. Everything else is
flat and quiet so the photos and the music do the talking.

## Tokens

Defined in `app/globals.css` (`:root`) and mirrored in Tailwind where needed.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#050607` | Page background, every public page |
| `--surface` | `#0a0e12` | Panels, menus, modals, image frames |
| `--surface-strong` | `#0e1318` | A surface that sits on a surface |
| `--line` | `white/10` | Hairline borders and dividers |
| `--accent` | `#7dd3fc` (sky-300) | Real states only: Open now, Available, On Google Play, a demo that is playing. Also focus rings, and the data in article figures (below). Inside a lesson it is the lesson group's accent (Figure dialects) |

Text steps: `white`, `white/75`, `white/60`, `white/50`. Nothing dimmer for
readable text.

## Rules

- **Shape.** 6px radius on cards and images, 4px on book covers, full pill
  only on the primary button. No nested cards: group with spacing and
  hairlines.
- **Depth.** No glass, glow, radial gradients or gradient text. The fixed
  navbar is the one frosted surface. Menus and modals may cast one neutral
  shadow because they sit above the page.
- **Buttons.** One solid white primary action per screen. Second actions are
  underlined text links (`TextLink` / `EditorialButton variant="ghost"`).
  Arrows only on the primary action (`withArrow`).
- **Labels.** No uppercase, wide-tracked eyebrows. A small label above a
  heading is allowed only when it adds a fact the heading does not (a date, a
  category). Status labels are plain text, not pills.
- **Type.** System SF stack (`--font-display`). Hierarchy from size and
  weight: display `clamp(2.5rem, 6vw, 4.75rem)`, section headings 30-48px,
  body 16-18px at 1.6-1.75 line height, 45-75 characters per line.
- **Motion.** The site should feel alive, not static (the founder asked for
  this after a fully still version felt boring). The vocabulary, all in
  `app/globals.css`:
  - `data-enter` on hero blocks: rise and fade on load, staggered with
    `--enter-delay`. `data-enter="settle"` on a hero photo eases it from 1.06.
  - `data-reveal` on sections below the fold: `components/MotionObserver.tsx`
    hides them only if they start off screen, then eases them in once.
    Stagger with `--reveal-delay`. Never gate content on framer-motion
    `whileInView`; it left Beat Store sections blank before.
  - `.vgp-zoom` on image frames: the photo scales to 1.04 when its section
    (`group`) is hovered.
  - `.vgp-link` underline sweep, `buttonMotionClass` press and
    `ButtonArrow` nudge from `EditorialPrimitives`.
  - Looping animation only where it means something: the CADENZ tempo
    widget pulses at the chosen BPM.
  No hover lifts, glow or parallax. Everything is off under
  `prefers-reduced-motion`.
- **Article figures.** Drawn in the lesson group's dialect (Figure
  dialects, below). In every dialect the data the caption asks you to look
  at (the trace, curve, melody, bar or moved hit) is in the accent and
  everything else is white or grey. "Before" and reference states are grey
  or dashed. One accent per page, so the colour always means "look here".
  Figures draw in once as they scroll into view. Tokens live in
  `lib/blog/dialects.ts`, the drawing helpers in
  `components/blog/figures/svg.tsx`.
- **Imagery.** Use the real assets in `public/` (founder portrait, CADENZ
  poster, chrome logo, book cover, app icons, game art). No stock or
  generated filler.
- **Copy.** Specific and plain. No em dashes, no "not just X, but Y", no
  forced triads, no buzzwords, no invented numbers. Only translate ja-JP and
  de-DE strings with a native check.

## Figure dialects

The owner's direction: each lesson group has its own accent and its own
way of drawing, inside one family. A dialect changes how marks are drawn,
never what they plot. Positions, values, labels, captions and alt text are
the same in all four; grey is still context, dashed is still reference, the
accent is still "look here". The group comes from the lesson's category;
anything without one is technical.

| Group | Categories | Accent | Reads as | Rules | A value is | Ends and type |
| --- | --- | --- | --- | --- | --- | --- |
| Technical | mixing-mastering, audio-science, sound-design, vocal-production, production-tips | `#7dd3fc` | An instrument panel | Hairline graticule, minor and major; every 1-9 step of a decade on spectra; registration corners on plots | A square | Square ends, 1.75 lines, tabular figures |
| Music | songwriting, arrangement-groove, genre-guides | `#fdba74` | Score paper | Staff rulings, bar lines, a double bar at a mark, a final bar to close | A note head, hollow when not in focus; drum hits as heads with stems | Round ends, 2.25 lines, axis titles and notes in italic |
| Mind | music-psychology, producer-psychology | `#f9abcb` | A field of attention | Dotted rules | A dot held in a focus ring | Round ends, soft nodes, a loop drawn as one arc |
| Business | licensing-guide | `#8ad8af` | A ledger | Ruled rows, a header rule, a closing double rule | A tick; figures right-aligned in their own column; steps numbered | Square ends, tabular figures |

- **Colour.** The four accents share one lightness and chroma (OKLCH about
  0.83 and 0.10), so they read as one family, and each is over 10:1 on
  `--surface`. Mind is rose, not violet: violet on black is the stock AI
  look, and for deuteranopes it is nearly the same colour as sky.
- **One accent per page.** Inside a lesson `--accent` is the group's, so
  figures, demo displays, focus rings and the reading-progress bar all use
  it. The navbar, buttons, the blog index and every non-blog page stay sky.
- **The key.** The group's mark (its value glyph in its accent) sits beside
  the category name on a lesson and on its learning path page. Nowhere
  else.
- **Lit and paper.** Technical and mind keep a faint accent area under a
  line. Music and business are ink on paper, so their lines stand alone.
- **Rules are texture.** They stay well under the data; mind's dots need a
  higher opacity than a hairline to be seen at all.
- **Demos.** Plots, meters, step lanes and bar cells follow the dialect;
  controls (play, sliders, choices) are the same in every lesson.
- **Motion.** A figure draws in once when it is 30% up the screen: lines
  along their length (technical at a constant speed, like a scope beam),
  bars grow, points pop, mind's focus rings close in on their points, moved
  hits slide from their grid step. Never on a figure already on screen;
  off under reduced motion, with no script and in print. The end state is
  the server-rendered drawing. Turn it off by removing `data-reveal="draw"`
  in `components/blog/figures/Figure.tsx`.
- **No stylesheet needed.** A figure is complete as a bare SVG: the accent
  is the root's `color` attribute and every dialect choice is an attribute,
  so the offline renderer gets the same marks and colours as the page.
- **New figure types** implement all four dialects before they ship.

## Story and voice

The site is Virzy Guns' founder site: producer, founder of Virzy Guns
Production (2020), now building HealingWave. Menu: Story, HealingWave,
Studio, Writing, with Get CADENZ as the button. Games and MyCamScan are
footer-only.

- Write in the first person ("I"), as Virzy Guns.
- Social proof is the Muso.ai credits only. No other artists' releases.
- Publishing, exact wording: "My publishing is administered through
  BeatStars Publishing, in partnership with Sony Music Publishing." Never
  "signed to Sony" or a Sony logo.
- HealingWave never claims to treat or cure anything.
- Never show where Virzy Guns lives or is based. The founder treats it as
  private.
- Use only the two founder photos already in `public/images` (`founder.jpg`,
  `virzy-guns-dp.jpg`). Do not add more personal photos.

## Shared building blocks

`components/editorial/EditorialPrimitives.tsx`: `PageHeader`,
`SectionShell`, `EditorialButton`, `TextLink`. A `mailto:` href on
`TextLink` or `EditorialButton` renders `EmailChooser` (Gmail, mail app or
copy address). Reuse these before writing new
page chrome.
