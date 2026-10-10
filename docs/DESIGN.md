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
  or dashed. A second line the caption also names, to compare with the
  first, is a line of accent dots. One accent per page, so the colour
  always means "look here".
  Figures draw in once as they scroll into view. Tokens live in
  `lib/blog/dialects.ts`, the drawing helpers in
  `components/blog/figures/svg.tsx`.
- **Imagery.** Use the real assets in `public/` (founder portrait, CADENZ
  poster, chrome logo, book cover, app icons, game art). No stock or
  generated filler. Share cards (`app/og/route.tsx`) show the blue DP,
  `virzy-guns-dp.jpg`, whole on its own navy: resized, never cropped (the
  owner's rule).
- **Focus.** One style everywhere: `.vgp-focus` in `app/globals.css`, a 2px
  outline in the page's `--accent` with a 3px offset, shown only for
  keyboard focus. `EditorialPrimitives`, `TapLink`, the navbar, bottom nav,
  footer, subscribe dialog and every demo control carry it.
- **Menus and dialogs.** The navbar menus and the subscribe dialog fade
  with CSS (`.vgp-shell-*` in `app/globals.css`, `components/useExitTransition.ts`),
  150 to 180 ms, and appear at once under reduced motion. No framer-motion
  on public pages.
- **Copy.** Specific and plain. No em dashes, no "not just X, but Y", no
  forced triads, no buzzwords, no invented numbers. Only translate ja-JP and
  de-DE strings with a native check.
- **Spelling.** British forms with -ize endings: centre, colour, labelled,
  recognize, normalize, analyse. Three trade words keep the form producers
  see in their tools and in Flow: "license" (noun and verb; Flow sells the
  Creator License), "analyzer" for the tool, "meter" for the device. The
  musical sense is "metre". "Midrange" is one word. One form each for
  "artefact", "judgment", "toward" and "off-beat". Within a lesson, write
  note values one way: "16th" and "8th", or "sixteenth" and "eighth".

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
  figures, demo displays, focus rings, the reading-progress bar and the
  Learn sub-navigation's marker all use it. The navbar, buttons, the blog
  index and every non-blog page stay sky. The one exception is the path
  map on /learn, which shows the four groups side by side on purpose
  (Learn area, below).
- **The key.** The group's mark (its value glyph in its accent) sits beside
  the category name on a lesson and on its learning path page, and beside
  each group's name on the path map. Nowhere else. A lesson on no learning
  path (a studio note) has no path crumb, so it shows no mark.
- **Lit and paper.** Technical and mind keep a faint accent area under a
  line. Music and business are ink on paper, so their lines stand alone.
- **Rules are texture.** They stay well under the data; mind's dots need a
  higher opacity than a hairline to be seen at all.
- **Demos.** Plots, meters, step lanes and step strips follow the dialect;
  controls (play, sliders, choices) are the same in every lesson.
- **Four line styles.** A solid accent line is the one to look at; a line
  of accent dots is a second one the caption also names ("also look
  here"); a dashed line is a reference; a grey line is context or
  "before". So the line a caption is about is never dashed: it is solid,
  and what it is set against is grey or dashed. The dots are round in
  every dialect and a little heavier than a line; the space between two
  dots is at least as long as the dialect's dash, and every dash is longer
  than a dot is wide, so dots never read as a finer dash. A dotted line
  fades in, like a dashed one, and has no area under it. Dots mark a
  second line the caption names that is not a reference (both EQ moves in
  052, the right channel in 132). When three lines are all subjects, keep
  the third solid where its shape sets it apart (040), or draw the layers
  as labelled `bands` (039). A solid line that lies along the 0 dB rule of a
  gain plot (047: a shelf that cancels a boost) would read as the axis, so
  it carries the dialect's value mark on each labelled frequency. Grey
  context (`muted`) is a solid grey line in every figure that draws lines.
- **Labels never sit on data.** A label goes where no mark comes near
  it (6 units of clear space round a line label): a signal's threshold or
  ceiling label beside its line where the traces leave room, else in the
  row's legend as a dashed sample, else past the line's end in a margin
  every row shares. One line per row can go to the legend, while the
  row's other lines keep their labels beside them; two or more go to the
  margin. A line keeps one treatment in a figure: once it is named in a
  legend in one row, it is named there in every row it appears in. Mark
  labels on curves and spectra sit above the plot, never closer than two
  letters to the dB unit, and never run up to the next mark's line (they
  step up a row instead); once they need a second row, they all sit on the
  same side of their lines where that costs no extra row. On a scale, a
  label up a lane hangs on a leader that keeps 6 units from every label it
  passes, and two labels in one lane with a leader between them stand 16
  units apart. A value steps over a dashed reference line. A scale's range
  labels follow one rule per figure: every label inside its bar when each
  one fits there, else every label beside its bar, never some of each.
  A bar with no upper limit (`open`) fades out at the end of the scale
  with no end mark, so it never reads as a number.
- **Focus.** Rhythm rows, flow steps and arrangement layers take
  `focus: true`. Once any item in a figure is focused, it is in the accent
  and the rest go grey; with none focused, all of them are. Bars, markers,
  scale ranges and traces have the same switch under their own names
  (`strong`, `muted: false`).
- **Motion.** A figure draws in once when it is 30% up the screen: lines
  along their length (technical at a constant speed, like a scope beam),
  a shaded area fades in after its line, bars grow, points pop, mind's
  focus rings close in on their points, moved hits slide from their grid
  step, flow steps appear in order with their arrows drawing between them
  (an arrow takes 300 ms, so it lands as the next step shows), and
  arrangement cells rise into their rows. Many like marks move as one
  group (a beat of hits, a row of cells, a quarter of the harmonics), so a
  busy figure stays smooth on a slow phone. A figure that comes to rest
  low on the screen draws in then; none is left waiting. Never on a figure already on screen;
  off under reduced motion, with no script and in print. The end state is
  the server-rendered drawing. Turn it off by removing `data-reveal="draw"`
  in `components/blog/figures/Figure.tsx`.
- **No stylesheet needed.** A figure is complete as a bare SVG: the accent
  is the root's `color` attribute and every dialect choice is an attribute,
  so the offline renderer gets the same marks and colours as the page.
- **Print.** Figures print inverted with the hue turned back, so the
  accent stays its own colour on white paper and text prints dark. The
  fixed bars (navbar, reading progress) and the demos are hidden in print,
  and so are the reading tools (Save, Copy link, Share, the Contents list,
  Check answer, the author photo). Collapsed Sources print open.
- **New figure types** implement all four dialects before they ship.

## Learn area

The owner's direction (2026-10-10): Learn is its own area inside this site,
with its own face, while the header, footer and tokens stay the site's. Its
pages are /learn, /blog, the path pages (/blog/category/*), every lesson,
/learn/glossary and /book. Code in `components/learn/`.

- **Sub-navigation.** `LearnNav`: one row under the site header on every
  Learn page, before `<main>` (the skip link passes it): Lessons (/blog),
  Paths (/learn, the path map), Glossary, Book. The current entry is white
  with a 2px marker in `--accent` and `aria-current` (`page` on the
  entry's own page, `true` inside it: a lesson under Lessons, a path page
  under Paths). On a lesson the marker and focus rings take the group's
  accent; elsewhere sky. It is not sticky: a lesson keeps its full screen
  for reading, it never covers text or the fixed reading tools (progress
  bar, Contents, a demo's Stop), the glossary's sticky letter bar keeps
  its place, and `scroll-padding-top` stays 88px. The site header's Learn
  menu covers the area once it has scrolled away. Four 48px entries fit
  one row at 320px, so it never scrolls. Hidden in print.
- **Header.** `LearnHeader`: the same opening on /learn, /blog, the path
  pages and the glossary: an optional label line (the "Lessons" crumb, a
  path's mark), the display title, the description, and on /learn a row
  of counts on a hairline, like the book page's facts. Counts come from
  the data.
- **Landing.** /learn answers "what is this and where do I start" in its
  first screen: the title, one sentence, the counts, and Start here (the
  first lessons of Songwriting and Mixing & Mastering, as large links with
  their titles; under 640px the one-line "New here? Start with ..." form
  that /blog uses), and the path map's first group starts in that screen
  too (at 390x844 and 1280x800). Then the rest of the path map, one demo
  to try (the blind loudness test from Mixing & Mastering lesson 1,
  through `DemoSlot`, in the same column width as in a lesson so its
  reserved height holds, against the page grid's right edge), the newest
  lessons, and the glossary (three real entries) beside the book.
- **Path map.** `PathMap`: every learning path as a line of its lessons,
  in its group's dialect and accent, the one place the four accents appear
  together. Groups run from the first idea to the release: Writing and
  arranging (music), Sound and mixing (technical), Psychology (mind),
  Business. Lessons sit on a shared axis, so lesson n is at the same place
  on every path and a line's length is the path's size; from 1280px each
  path is one line under a lesson ruler. Narrower, a line wraps like a
  score's systems (22 lessons to a system from 640px with a mouse; 44px
  cells on phones, 6 at 320px, and for any coarse pointer at any width,
  which leaves out the lesson ruler from 1280px). Each
  cell draws its stretch of the line, and each group's rules (graticule,
  staff with bar lines and a final bar, dotted field, ledger rows with a
  closing double rule) run the full width of every system as paper, so a
  short path ends on open paper. A lesson is its group's value glyph,
  hollow until read on this device, filled once read (`PathMapLive` adds
  the fills, the "read" in each name and the "3 of 44 read" counts after
  hydration, in boxes that already have their size). Every lesson and path
  is a link in reading order, named "Lesson 3: <title>"; a "Skip past the
  map" link, shown on focus, lets keyboard users step over it. A
  fixed-height readout above the map shows the path, place, minutes and
  title of the lesson under the pointer or the focus (`aria-hidden`: the
  link already says it); it stays under the site header while the map
  scrolls beneath it, and a mark the Tab key reaches stops below it. A
  finger has no hover, so on a touch screen the first tap on a mark
  chooses it, scrolls it clear of the card if the card would cover it,
  and the readout shows it; the whole readout is then one link to that
  lesson, and a second tap on the mark opens it too. Under 1024px on a
  touch screen the readout is a fixed-height card over the tab bar (the
  title on two lines, three under 360px), shown only for a chosen mark, so
  it costs the map no height; the gesture hint ends the map's intro, in a
  space it has from the first paint. Each line draws in once with the figure motion
  (`data-reveal="draw"`): it wipes in from lesson 1 at a constant speed,
  like a scope beam, the group's later paths 60ms apart (one clip that
  opens from lesson 1; the marks keep their place from the first frame,
  so a tap during the draw-in lands, and nothing repaints per frame);
  never on screen at load, with reduced motion,
  without script or in print. Server-rendered; works with JavaScript off.
- **Keep the map cheap.** 147 lessons are 147 cells on a slow phone. A
  cell is an `li` and a plain `a` that draws its glyph and its stretch of
  line as two background layers: no pseudo-elements on the link (only the
  few cells that carry a rule mark, a graticule line, a bar line or the
  final bar, draw it as an `li::before`), no SVG, no `next/link` (one
  listener in `PathMapLive` sends clicks through the router and prefetches
  on hover or focus), and no per-cell custom property or inline style,
  which stops cells sharing styles and made a restyle four times slower.
  Per-path values (`--o`, `--len`) sit on the eleven boxes round the
  lists, per-group ones (accent, glyphs, line weight) on the four groups.

## Story and voice

The site is Virzy Guns' founder site: producer, founder of Virzy Guns
Production (2020), now building HealingWave. Menu: Story, HealingWave,
Studio, Learn, with Get CADENZ as the button. Games and MyCamScan are
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
