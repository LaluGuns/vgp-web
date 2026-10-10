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
| `shorts/bass-on-phones/` | 036, small speakers need bass harmonics | on branch `claude/new-session-0fjac3` as `film4/` |
| `shorts/gap-before-drop/` | 030, a gap before the drop | on branch `claude/new-session-aa3y0x` as `film5/` |

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
- `assets/vo/narration.mp3`: the narration take. `shorts/attack-release/vo-cues.json` holds
  where each line sits in that file and when each word is spoken. For a new
  take, cue it against `shorts/attack-release/script.txt` (needs `faster-whisper`):
  `python shorts/attack-release/cue_vo.py assets/vo/narration.mp3 shorts/attack-release/script.txt shorts/attack-release/vo-cues.json`,
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

## Files

- `DECISIONS.md`: one line per creative call.
- `SOURCES.md`: where every number on screen comes from.
- `directions/directions.html`: the four looks considered, and why A won.
- `fonts/`: Inter and Inter Display (SIL OFL, see `LICENSE-Inter.txt`),
  subset to Latin and embedded in every render.
