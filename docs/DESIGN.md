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
| `--accent` | `#7dd3fc` (sky-300) | Real states only: Open now, Available, On Google Play, a demo that is playing. Also focus rings, and the data in article figures (below) |

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
- **Article figures.** Drawn like a meter: the data the caption asks you
  to look at (the trace, curve, melody, bar or moved hit) is in the
  accent, everything else is white or grey. "Before" and reference states
  are grey or dashed. One accent only, so the colour always means "look
  here". Tokens live in `components/blog/figures/svg.tsx`.
- **Imagery.** Use the real assets in `public/` (founder portrait, CADENZ
  poster, chrome logo, book cover, app icons, game art). No stock or
  generated filler.
- **Copy.** Specific and plain. No em dashes, no "not just X, but Y", no
  forced triads, no buzzwords, no invented numbers. Only translate ja-JP and
  de-DE strings with a native check.

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
