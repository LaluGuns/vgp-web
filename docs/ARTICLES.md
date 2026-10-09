# Writing articles

Articles live in `lib/blog-posts/NNN-slug.ts`, one file each. After adding a
file, run `node scripts/generate-posts-index.js`. The page renders on the
server from the markdown in `content`, plus the optional `summary`,
`figures` and `quiz` fields. Copy and visual rules from `docs/DESIGN.md`
apply to every word here too.

The three reference lessons are `001`, `057` and `092`. Read one before
writing a new one.

## Shape of a lesson

Lessons in the teaching categories (songwriting, arrangement, sound design,
vocals, mixing, audio science, music psychology, producer mindset) follow
one template. The heading prefix sets how the section looks; readers see
the label, not the prefix.

| Heading | Shown as | Job |
| --- | --- | --- |
| `## Hook: <title>` | `<title>`, larger first paragraph | A concrete scene the reader recognises |
| `## Why it matters: <title>` | label "Why it matters" | What goes wrong in a real session |
| `## Science model: <title>` | label "The science" | The mechanism, with sources and maths if useful |
| `## DAW experiment: <title>` | framed panel, steps become a checklist | 5 to 8 numbered steps the reader can do today |
| `## Common mistake: <title>` | left rule | One or two mistakes and why they happen |
| `## Producer takeaway: <title>` | label "Takeaway" | What to do differently, in a few sentences |
| `## References` | collapsible "Sources", after the quiz | Real, checkable sources only |

Guides (licensing, genres, production tips, product stories) may use plain
headings. They still get a summary and a quiz, and a figure where one
explains something.

## Markdown

- `**bold**`, `*italic*`, `[link](https://...)`, `` `code` ``.
- `- item` lists, `1. step` lists, tables with a header row and `---` row.
- Maths: `$x$` inline and `$$ ... $$` on its own line. In a `.ts`
  template string, every backslash is doubled: `$$\\frac{f_s}{2}$$`.
  A single backslash turns `\f` and `\t` into control characters, and
  the build fails.
- Prices are fine as text: `$15` never turns into maths. Inline maths that
  starts with a digit renders only if it contains a maths sign
  (`\\ ^ _ { } = /` or `×`), so `$2\\pi f$` works and `$15 to $30` stays
  text.
- Tables stack into one card per row on phones, so keep the first column
  a short name for the row.
- No raw HTML.
- Placement lines, each on its own line:
  - `::figure <id>` places `figures[id]`.
  - `::demo <id>` places a listening demo (list below).
  - `::licenses` places the current license table from
    `lib/licensing-registry.ts`. Never type license prices or limits by
    hand.
- Figures and demos never go inside the DAW experiment section: it is
  already a framed panel and panels do not nest.

## Summary and quiz

`summary`: three short sentences under the title as "In short". Each one a
complete idea a reader could act on. No restating the title.

`quiz`: three questions. Test understanding, not recall of a sentence. One
clearly right answer, three plausible wrong ones of similar length. Vary
the position of the right answer. `why` explains the answer in one or two
sentences and is shown after any choice.

```ts
quiz: [
    {
        q: 'Threshold -24 dB, ratio 4:1. A peak arrives at -12 dB. How much gain reduction?',
        options: ['3 dB', '6 dB', '9 dB', '12 dB'],
        answer: 2,
        why: 'The peak is 12 dB over. At 4:1 it comes out 3 dB over, so the compressor removes 9 dB.',
    },
],
```

## Figures

One to three per lesson, each placed where the text needs it. A figure has
to show the mechanism the paragraph describes; a figure that only decorates
does not go in. Every figure has `caption` (what to notice, one or two
sentences) and `alt` (what the drawing shows, for screen readers).

Values are 0 to 1 unless a unit is given. Curves and arrangement grids are
shapes, not measurements: never put invented numbers on them. Where a
figure computes something (EQ curves, compression, aliasing), the maths is
real, so the numbers in the caption must match.

Labels must stay short: phone layouts are 320 px wide. Use `xShort` and
`short` where offered.

| `type` | Shows | Key fields |
| --- | --- | --- |
| `curve` | A shape over named points: energy, tension, attention | `x`, `xShort`, `xLabel`, `yLabel`, `series[{label, values, dashed}]`, `marks[{at, label}]`, `straight` |
| `notes` | A small piano roll: a melody, a bass line, a voicing | `notes[{start, length, pitch, label, muted}]` (beats, MIDI pitch), `chords[{at, label}]`, `perBar` |
| `bars` | Horizontal bars on one scale: LUFS, levels | `min`, `max`, `unit`, `bars[{label, value, display, dim, open}]` (`open`: no upper limit, the bar fades out at the end of the scale), `reference{value, label}`, `log` (powers of ten, for ranges over two decades) |
| `rhythm` | Hits on a 16-step grid with swing and offsets | `rows[{label, hits, swing, note, focus}]`; a hit is a step or `{step, offset, level}` (offset in steps) |
| `signal` | Waveforms over time, one plot per row | `rows[{label, traces, unipolar, lines[{y, label, short}], marks, samples}]` (`short`: a line's label on phones) |
| `spectrum` | Energy or EQ gain over log frequency | `mode: 'level' \| 'gain'`, `curves`, `bands[{from, to, label}]`, `marks[{f, label}]` |
| `transfer` | Input level against output level | `domain: 'db' \| 'linear'`, `curves[{kind, threshold, ratio, knee, ceiling, label}]` |
| `stereo` | Top-down mix: pan and depth | `items[{label, pan, depth, width, fade}]`, `title` |
| `flow` | Steps with arrows, optional loop back | `steps[{label, note, focus}]`, `loop{to, label}` |
| `arrangement` | Which layers play in which section | `sections[{label, short, bars}]`, `layers[{label, levels, focus}]`, `density` |
| `scale` | Markers along one number line | `min`, `max`, `unit`, `ticks`, `markers[{value, label, strong}]`, `ranges`, `arrows[{from, to}]` |

Signal traces (`kind`):

- `sine`: `cycles`, `amp`, `phase` (degrees), `decay`.
- `sum`: `parts` of sines, added. Use it for phase and polarity.
- `envelope`: `points: [t, level][]`. Use with `unipolar: true` for ADSR.
- `hits`: drum hits at `at` times with `amp`, `decay`; `outline: true` draws
  the level envelope; `compress: {threshold, ratio, attack, release}`
  simulates a compressor (times are fractions of the plot width).
- `noise`: `amp`, `seed`.
- Any trace: `label`, `dashed`, `muted` (grey, for "before"), `gain`,
  `clip`, `soft`, `quantize` (bits).
- Gain-mode spectra take `dbRange: [lo, hi]` for filters that only cut.
- `samples: {count, alias: true}` on a row draws sample dots and the slower
  wave they also fit.

Spectrum curves (`kind`): `hump` (`center` Hz, `width` octaves, `level`),
`eq` (`bands` of `bell`, `lowshelf`, `highshelf`, `highpass`, `lowpass`,
and first-order `highpass1`, `lowpass1`, with `freq`, `gain`, `q`),
`comb` (`delayMs`, `mix`: a signal plus a delayed copy), `slope` (`dbPerOct`; in gain mode `dbPerOct: 0,
level: 3` draws a flat +3 dB line), `harmonics` (`f0`, `count`, `rolloff`,
`level`, `odd`).

## Listening demos

Place at most one or two per lesson, where hearing it beats reading about
it. Sound is synthesised in the browser. Ids:

| Id | What the reader does |
| --- | --- |
| `compressor` | Threshold, ratio, attack, release on a drum loop, level-matched |
| `aliasing` | Sweep past Nyquist at 16 kHz, with or without the anti-alias filter |
| `swing` | Swing amount on a beat |
| `late-snare` | Move the snare early or late in milliseconds |
| `tempo` | Same beat from 60 to 160 BPM |
| `humanize` | Add timing drift to hats and snare |
| `syncopation` | On the beat against syncopated accents |
| `drop` | Silence or stripped layers before a drop, with a bar-by-bar strip |
| `mono` | Fold a mix to mono; Haas delay against flipped polarity, with a level meter per part |
| `phase` | Two copies of a bass, delay and polarity |
| `reverb` | Pre-delay, decay and level, with a live trace of the dry notes and the reverb |
| `filter` | Low-pass, high-pass and narrow boost with a live spectrum |
| `eq-sweep` | Sweep a narrow boost to find a frequency by ear |
| `envelope` | Attack and release on a synth phrase, with the note's level drawn |
| `masking` | Cut or duck a pad under a lead, with both parts' live spectra |
| `saturation` | Soft saturation and hard clipping, level-matched |
| `bit-depth` | Fewer bits, with or without dither |
| `latency` | Tap pad with added delay, against a metronome |
| `normalization` | Dynamic against loud master, with streaming-style matching |
| `loudness-bias` | Blind A/B with one side 1 dB louder |
| `cadence` | A four-bar phrase ending on V or on I, with its chords and melody drawn |
| `parallel` | Blend a heavily compressed copy under dry drums, level-matched |
| `transient` | Transient shaper attack and sustain against a compressor on one loop |
| `sidechain` | Kick ducks a sustained bass: depth, release, full-band or lows only |
| `limiter` | Drive a limiter, change its release, loudness-matched to the original |
| `clip-recover` | A take clipped at the converter, then turned down afterwards |
| `width` | Mid/side balance with a mono check and a live correlation meter |
| `monitor-level` | One mix at three playback levels, to hear bass and air change |
| `reverb-duck` | Reverb ducked under the dry phrase, or a delay throw on the last syllable |
| `chord-context` | One chord after different lead-ins; one melody in major or minor, at two tempos and three registers |

New demos go in `components/blog/demos/` and `lib/blog/demos.ts`. Give each
one a `height` there (its controls' height in each width range that file
lists), so the page keeps that space while the demo's code loads and nothing
below it moves. Set its `level` there (a playback trim in dB) so its
K-weighted loudness sits with the drum-loop demos (about -24 LUFS at 100 %
demo volume, both channels, ungated) and its loudest setting peaks under
-7 dBFS; a demo whose comparison would peak higher plays lower, or says
where its matching stops. The reader's volume is the last stage, after the
engine's -6 dBFS limiter and clip, so it never changes what a demo does;
the limiter and clip only catch mistakes. The default volume, 80 %, is
4 dB under 100 %.

## Glossary

`lib/blog/glossary.ts`. The first use of a term in an article's prose
becomes a dotted word that opens its definition; the full list is at
`/learn/glossary`. Add a term when several articles use it and a reader
could get stuck on it. Definitions are one or two plain sentences.

## Facts and sources

- Keep a source only if it supports the sentence that cites it.
- Add a new source only after checking it exists, with the right authors,
  year and title.
- A number needs a source or a calculation the reader can follow. If it
  has neither, say it in words instead.
- HealingWave and hearing content never claims to treat or cure anything.

## Checks

The article route validates every article at build time
(`lib/blog/validate.ts`): figure ids, demo ids, maths, quiz answers. A
problem fails the build with the slug and the reason.
