# VGP Web design rules

Applies to the public site (repo root app). The founder dashboard and
`flowstate/` have their own looks and are out of scope.

Quality references: anti-slop (miqdadbadjuber/anti-slop), design-taste
(madebymustafa/design-taste), frontend-craft (nattergabriel/frontend-craft)
and humanizer (blader/humanizer) for every piece of user-facing copy.

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
| `--accent` | `#7dd3fc` (sky-300) | Real states only: Open now, Available, On Google Play. Also focus rings |

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
- **Motion.** State changes only (menus, dropdowns, modals) at 120-200ms
  ease-out. No scroll reveals, hover lifts, scale-on-hover or looping
  animation. `prefers-reduced-motion` is honored globally.
- **Imagery.** Use the real assets in `public/` (founder portrait, CADENZ
  poster, chrome logo, book cover, app icons, game art). No stock or
  generated filler.
- **Copy.** Specific and plain. No em dashes, no "not just X, but Y", no
  forced triads, no buzzwords, no invented numbers. Only translate ja-JP and
  de-DE strings with a native check.

## Shared building blocks

`components/editorial/EditorialPrimitives.tsx`: `PageHeader`,
`SectionShell`, `EditorialButton`, `TextLink`. Reuse these before writing new
page chrome.
