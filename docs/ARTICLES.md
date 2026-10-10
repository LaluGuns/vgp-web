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

Line styles, the same in every figure that draws lines (`curve` series,
`signal` traces, `spectrum` curves, `transfer` curves): a solid accent line
is the one the caption asks you to look at; `dotted: true` draws a second
line the caption also names in accent dots ("also look here");
`dashed: true` is a reference; `muted: true` is grey context or "before".
The line the caption is about is never dashed: draw it solid and make what
it is set against `muted` (or `dashed`, for a reference). Use dots for a
second line the caption names that is not a reference. When three lines
are all subjects, keep the third solid where its shape sets it apart (as
040 does), or draw the layers as labelled `bands` (as 039 does).

| `type` | Shows | Key fields |
| --- | --- | --- |
| `curve` | A shape over named points: energy, tension, attention | `x`, `xShort`, `xLabel`, `yLabel`, `series[{label, values, dashed, dotted}]`, `marks[{at, label}]`, `straight` |
| `notes` | A small piano roll: a melody, a bass line, a voicing | `notes[{start, length, pitch, label, muted}]` (beats, MIDI pitch), `chords[{at, label}]`, `perBar` |
| `bars` | Horizontal bars on one scale: LUFS, levels | `min`, `max`, `unit`, `bars[{label, value, display, dim, open}]` (`open`: no upper limit, the bar fades out at the end of the scale), `reference{value, label}`, `log` (powers of ten, for ranges over two decades) |
| `rhythm` | Hits on a 16-step grid with swing and offsets | `rows[{label, hits, swing, note, focus}]`; a hit is a step or `{step, offset, level}` (offset in steps) |
| `signal` | Waveforms over time, one plot per row | `rows[{label, traces, unipolar, lines[{y, label, short}], marks, samples}]` (`short`: a line's label on phones) |
| `spectrum` | Energy or EQ gain over log frequency | `mode: 'level' \| 'gain'`, `curves`, `bands[{from, to, label}]`, `marks[{f, label}]` |
| `transfer` | Input level against output level | `domain: 'db' \| 'linear'`, `curves[{kind, threshold, ratio, knee, ceiling, label}]` |
| `stereo` | Top-down mix: pan and depth | `items[{label, pan, depth, width, fade}]`, `title` |
| `flow` | Steps with arrows, optional loop back | `steps[{label, note, focus}]`, `loop{to, label}` |
| `arrangement` | Which layers play in which section | `sections[{label, short, bars}]`, `layers[{label, levels, focus}]`, `density` |
| `scale` | Markers along one number line | `min`, `max`, `unit`, `ticks`, `markers[{value, label, strong}]`, `ranges[{from, to, label, strong}]` (`strong`: the range the caption points at, in the accent; others are grey; a span too short to read as a bar is drawn as an interval, a thin bar between end ticks), `arrows[{from, to}]` |

Signal traces (`kind`):

- `sine`: `cycles`, `amp`, `phase` (degrees), `decay`.
- `sum`: `parts` of sines, added. Use it for phase and polarity.
- `envelope`: `points: [t, level][]`. Use with `unipolar: true` for ADSR.
- `hits`: drum hits at `at` times with `amp`, `decay`; `outline: true` draws
  the level envelope; `compress: {threshold, ratio, attack, release}`
  simulates a compressor (times are fractions of the plot width).
- `noise`: `amp`, `seed`.
- Any trace: `label`, `dashed`, `dotted` (a second trace the caption also
  names), `muted` (grey, for "before"), `gain`, `clip`, `soft`, `quantize`
  (bits).
- Line labels (`lines`) sit beside their line where the traces leave room.
  One line per row that finds no room is named in the row's legend
  instead; a line named in a legend in one row is named there in every
  row. Give a line a `short` label for phones.
- Gain-mode spectra take `dbRange: [lo, hi]` for filters that only cut.
- `samples: {count, alias: true}` on a row draws sample dots and the slower
  wave they also fit.

Spectrum curves take `label`, `dashed`, `dotted` and `muted` like traces.
Their kinds (`kind`): `hump` (`center` Hz, `width` octaves, `level`),
`eq` (`bands` of `bell`, `lowshelf`, `highshelf`, `highpass`, `lowpass`,
and first-order `highpass1`, `lowpass1`, with `freq`, `gain`, `q`),
`comb` (`delayMs`, `mix`: a signal plus a delayed copy), `slope` (`dbPerOct`; in gain mode `dbPerOct: 0,
level: 3` draws a flat +3 dB line), `harmonics` (`f0`, `count`, `rolloff`,
`level`, `odd`).

## Listening demos

Place at most one or two per lesson, where hearing it beats reading about
it. Sound is synthesised in the browser; eleven demos can also play a real
mix (Real mix, below). Ids:

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
below it moves. Playing must not move anything either: the Play button keeps
the width of its widest state (Stop with "Playing" beside it) from the first
render, so keep a new button label within that, and give any text that
changes while a demo plays the width of its longest wording (a meter's
`widest`). Check every state (idle, playing, stopped, and on a real mix
waiting and playing) at both ends of every width range. Set its `level` there (a playback trim in dB) so its default
setting sits at the house loudness, -29 LUFS at 100 % demo volume (BS.1770
K-weighting with the standard high-pass, both channels, ungated, over whole
loops), and check that its loudest setting peaks under -7 dBFS there; a
comparison that would peak higher stops matching at that point and says how
much quieter it plays (the compressor and transient demos do). -29 is the
highest level at which every demo fits under that peak: the loudness-matched
compressors set it (the compressor and transient demos peak -7.4 to -7.7
dBFS at their loudest). The reader's volume is the last stage, after the
engine's -6 dBFS limiter and clip, so it never changes what a demo does; the
limiter and clip only catch mistakes. The volume starts at 100 %. Schedule a
loop with the engine's `sequence` (it skips steps a stalled page made late
instead of stacking them into one loud hit), and give a voice's envelope an
`envelopeGain` (a new GainNode starts at 1, and a noise hit can then open
with one full-scale sample).

### Real mix

Eleven demos have a Source choice: Synth, their own sound and the default,
or Real mix, one of three short loops, so the reader hears the same move on
finished music. Each demo uses one loop, and the line under the choice
credits it.

| Loop | Demos | What it is |
| --- | --- | --- |
| Dystopia (excerpt) | `width`, `monitor-level`, `normalization`, `loudness-bias` | Bars 99 to 106 of Virzy Guns' own mastered track, 150 BPM, 12.8 s. A finished, limited master with a mono low end and a wide top. Credit: "Real mix: Dystopia by Virzy Guns (excerpt)." |
| Chrome Teeth | `limiter`, `parallel`, `saturation` | A hard 808 dark synthwave trap loop made for the blog from licensed Cymatics one-shots, mixed but not limited, 144 BPM, 13.3 s. Credit: "Real mix: Chrome Teeth, made for this blog." |
| Late Train Home | `compressor`, `filter`, `eq-sweep`, `bit-depth` | A City Pop and neo-soul loop made the same way, dynamic and wide-band, 96 BPM, 20 s. Credit: "Real mix: Late Train Home, made for this blog." |

The other demos stay synth only. `mono` is about one wide part against
centred ones, metered part by part, and a finished mix has no parts to
meter (Dystopia loses 0.14 dB in mono, which the `width` demo's mono check
already plays). `clip-recover` is about a take clipped at the converter
while recording. The rest are built from separate voices (drums, chords, a
bass under a kick, a voice into a reverb), not one stereo stream.

The loops are MP3s in `public/blog-mix/`, named `.dat` and served
as `application/octet-stream`. A demo fetches its loop with `fetch()` only
when the reader picks Real mix, never on page load, decodes it with
`decodeAudioData` and loops it with an `AudioBufferSourceNode` on exact loop
points. Never use `<audio>`, `<video>` or `MediaSource`, an `audio/*` or
`video/*` content type, or a media extension in a URL: download managers
such as IDM offer to grab any of those. Each file is encoded with the end of
the loop before its start and its start after its end, under a gapless tag
that points past them, so it repeats without a seam whether or not the
decoder reads the tag (`components/blog/demos/realmix.tsx` places the loop
either way). Keep a loop under about 350 KB. Publish the stereo mix only: no
stems, samples or project files.

A real mix plays at the house loudness with the same peak rule:
each demo sets the loudness its loop goes in at (`*_REAL_IN` in its module)
from the loop's measured loudness (`LOOPS` in `realmix.tsx`). The
level-matched demos measure the real loop itself, one whole pass offline,
so the line says "Loading the mix…" until the fetch, the decoding and that
measurement are done, and the switch goes live with its matching. Play
pressed meanwhile waits, and the button says "Loading…". On the
real mix the `filter` and `eq-sweep` demos turn down as the resonance rises
past 11 dB or the boost widens past a Q of 2; at full resonance the mix's
bass would otherwise peak about 3 dB over the rule. Text that differs by
source sits in one place (`Variants` in `ui.tsx`), so a switch moves nothing.

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
