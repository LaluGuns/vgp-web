# Promo: carousels and shorts

Social material for the blog lessons, drawn from the lessons themselves:
same figures, same numbers, same look as the page a viewer lands on.
Nothing here is part of the site build (`scripts/` is outside the site's
tsconfig, and `out/` is ignored by git).

## Setup

Needs Node 20+, Google Chrome (or set `CHROME_PATH`), and for the shorts
`ffmpeg` and `ffprobe` on the PATH.

```
cd scripts/promo
npm install
```

## Carousels

1080 x 1350 slides for Instagram and TikTok, built from a lesson's title,
figures, section headings, DAW steps and quiz.

```
npm run carousel -- how-compression-changes-motion-not-level
npm run carousel -- --all
```

Writes `out/carousel/<slug>/01.png ...` and a `contact.png`. The run
prints a warning for any slide where text had to shrink past its floor or a
figure's labels fall under 24 px (about 8 px on a phone). Covers and figure
notes can be rewritten per lesson in `carousel/overrides.ts`.

Slides: cover (hook and the clearest figure), one slide per remaining
figure, the DAW experiment, a quiz question, its answer, and the call to
action with what the lesson contains and its sources.

## Shorts

Narrated 9:16 shorts for TikTok and Reels, one folder per lesson under
`shorts/`, named by topic. They share the brand tokens and the compressor
(`shared/compressor.mjs`). Shorts made in other sessions join this folder
when their branches are merged:

| Folder | Lesson | Status |
|---|---|---|
| `shorts/attack-release/` | 057, compression attack and release | done |
| `shorts/bass-on-phones/` | 036, small speakers need bass harmonics | done |
| `shorts/gap-before-drop/` | 030, a gap before the drop | round 28 cut delivered (built from 63d7407); guide voice |

### Short: attack and release

A 76 second, 1080 x 1920 short on lesson 057 (attack and release), in
an illustrated explainer style: a snare, a compressor, and inside it a small
robot whose hand rides the fader. Narrated in American English (ElevenLabs
`eleven_v4`, voice Michael C. Vincent, prompt in `shorts/attack-release/narration-prompt.txt`),
with real drum samples through the compressor the picture shows.

The samples and the narration are licensed or generated material and stay
out of git. Put them in `scripts/promo/assets/` (ignored):

- `assets/samples/`: the Cymatics files named in `shorts/attack-release/timeline.mjs`
  under `samples` (Diamonds Snare 4 C#, Kick 15 E, Closed Hihat 5 and 11,
  Crash 1, KEYS Dusty (C), Gems Vol 10 Nightfall 120 BPM A# Min Keys).
- `assets/vo/attack-release/narration.mp3`: the narration take. Each short keeps
  its narration in its own folder under `assets/vo/`. `shorts/attack-release/vo-cues.json` holds
  where each line sits in that file and when each word is spoken. For a new
  take, cue it against `shorts/attack-release/script.txt` (needs `faster-whisper`):
  `python shorts/attack-release/cue_vo.py assets/vo/attack-release/narration.mp3 shorts/attack-release/script.txt shorts/attack-release/vo-cues.json`,
  then adjust the `vo` placements in `shorts/attack-release/timeline.mjs` if line lengths
  changed.

```
npm run short:attack-release                    # sound, stills, video and checks
npm run short:attack-release -- --stills        # contact sheets only
npm run short:attack-release -- --frames 12.5,31 --tag check
npm run short:attack-release -- --refresh-lesson   # re-capture the lesson's Listen demo for the end card
```

Writes to `out/shorts/attack-release/`: `short_9x16.mp4`, `audio.wav`, `captions.srt`,
`contact.png` (one still per scene), `seconds.png` (one per second),
`cover.png` (for the profile grid) and `VERIFY.md`. `shorts/attack-release/timeline.mjs` places every line, demo, effect and
scene; `shorts/attack-release/audio.mjs` mixes the sound and hands the picture the levels
and gain reduction it computed, so the shapes on screen are the drums you
hear. `shorts/attack-release/art.js` is the drawing kit, `shorts/attack-release/film.js` the scenes.

### Short: bass on phones

An 84 second, 1080 x 1920 short on lesson 036 ("Small speakers need bass
harmonics"): your phone can't play a sub, but it plays the harmonics above
it, and your brain puts the note back. Same voice, model, kit and pipeline
as the attack-and-release short (`eleven_v4`, Michael C. Vincent, prompt in
`shorts/bass-on-phones/narration-prompt.txt`).

The bass is synthesised in `shorts/bass-on-phones/bass.mjs`: a pure sine sub with an
808-style envelope, and its parallel copy through an asymmetric soft
clipper and a 120 Hz high-pass, as in the lesson's DAW experiment. The
music bus goes through the lesson's phone check (200 Hz high-pass, 24
dB/oct); the voice never does. Every harmonic rung on screen is an FFT of
the bass at that frame, and the scope is the phone's actual output.

Assets, in `scripts/promo/assets/` (ignored): the same Cymatics samples as
the attack-and-release short (named in `shorts/bass-on-phones/timeline.mjs`) and the narration take as
`assets/vo/bass-on-phones/narration.mp3`. The film plays it 10% slower: `shorts/bass-on-phones/audio.mjs`
builds `assets/vo/bass-on-phones/narration-slow.wav` from the take with Rubber Band
(`VO_STRETCH`) when it is missing. `shorts/bass-on-phones/script.txt` has one sentence per
line, so each can be placed with its own pause. For a new take, delete the
slow file, run any `npm run short:bass-on-phones -- --frames 0` to rebuild it, then
`python shorts/bass-on-phones/cue_vo.py assets/vo/bass-on-phones/narration-slow.wav shorts/bass-on-phones/script.txt shorts/bass-on-phones/vo-cues.json`
and adjust the `vo` placements in `shorts/bass-on-phones/timeline.mjs`.

```
npm run short:bass-on-phones                    # sound, stills, video and checks
npm run short:bass-on-phones -- --stills        # contact sheets and cover only
npm run short:bass-on-phones -- --frames 9.3,44.5 --tag check
npm run short:bass-on-phones -- --refresh-lesson   # re-capture the lesson's Listen demo
```

Writes to `out/shorts/bass-on-phones/`: `short_9x16.mp4`, `audio.wav`, `captions.srt`,
`contact.png`, `seconds.png`, `cover.png` and `VERIFY.md`, which logs the
five measured claims (fundamental drop through the phone, saturated against
clean through the phone, autocorrelation period, cone travel, FFT rungs),
loudness, true peak, sync and flashes.

## Files

- `DECISIONS.md`: one line per creative call.
- `SOURCES.md`: where every number on screen comes from.
- `directions/directions.html`: the four looks considered, and why A won.
- `fonts/`: Inter and Inter Display (SIL OFL, see `LICENSE-Inter.txt`),
  subset to Latin and embedded in every render.

### Short: gap before the drop

A 1080 x 1920 short for TikTok and Reels on lesson 030 (about 73 s with the
guide voice): the same 128 BPM drop twice, version 1 with the build running
into the downbeat and version 2 with everything cut one 8th note early, then
why (your ears, your limiter, your brain), how, a replay and an open comment
question. The narration in the repo's cuts is a Kokoro-82M guide track
(Apache-2.0 weights, runs on CPU) until the ElevenLabs take exists.

Assets (ignored by git) in `scripts/promo/assets/`:

- `assets/samples/`: the Cymatics files named in `shorts/gap-before-drop/drop.mjs` under `FILES`.
- `assets/samples/sfx/`: the recorded one-shots named in `shorts/gap-before-drop/audio.mjs`
  under `SFX_REAL` (Cymatics Bubble Pop, Sweet Click, FX Essentials
  Downlifter 21). Without them the synthesized effects are used.
- `assets/vo/gap-before-drop/narration.wav`: the narration. `shorts/gap-before-drop/vo-cues.json` records where
  each line sits in it; for a new take run
  `python shorts/gap-before-drop/cue_vo.py assets/vo/gap-before-drop/narration.wav shorts/gap-before-drop/script.txt shorts/gap-before-drop/vo-cues.json`.
  `shorts/gap-before-drop/timeline.mjs` places the lines from their measured lengths.

```
npm run short:gap-before-drop                       # sound, stills, video and checks
npm run short:gap-before-drop -- --stills           # contact sheets and cover only
npm run short:gap-before-drop -- --frames 12.5,31 --tag check
npm run short:gap-before-drop -- --refresh-lesson   # re-capture the lesson's Listen demo
node shorts/gap-before-drop/judge-pack.mjs round1    # pack for a review panel (after a render)
```

`shorts/gap-before-drop/drop.mjs` builds and measures the A/B (claims 1 to 4 in `VERIFY.md`);
`shorts/gap-before-drop/audio.mjs` mixes the film and hands the picture the levels, limiter
gain and the two hearing models; `shorts/gap-before-drop/film.js` draws the scenes. The
delivered cut is round 28, built from commit 63d7407; the branch carries
rounds 29 to 31 on top of it (see DECISIONS.md).
