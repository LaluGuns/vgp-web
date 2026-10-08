# Promo: carousels and explainer films

Social material for the blog lessons, drawn from the lessons themselves:
same figures, same numbers, same look as the page a viewer lands on.
Nothing here is part of the site build (`scripts/` is outside the site's
tsconfig, and `out/` is ignored by git).

## Setup

Needs Node 20+, Google Chrome (or set `CHROME_PATH`), and for the film
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

## Film

A 32 second explainer on attack and release (lesson 057) at 120 BPM, with
sound and captions. It opens on the hook (the same snare at 1 ms and 30 ms
attack), explains crack, body, threshold, attack and release one bar each,
proves it on the live loop, turns to release, and ends on the founder's
picture with the tagline and the lesson. One file, `film/timeline.mjs`, holds every beat, line, setting and
camera move; sound (`film/audio.mjs`) and picture (`film/film.js`) both read
it and share one model (`film/model.mjs`), so the waveform on screen is the
level of the drums you hear.

```
npm run film                 # all cuts and checks
npm run film -- --stills     # contact sheets only
npm run film -- --frames 9x16@25.4,16x9@18.6 --tag check
```

Writes to `out/film/`: `master_16x9.mp4`, `cut_9x16.mp4`, `cut_1x1.mp4`,
`master_16x9_reduced_motion.mp4`, `captions.srt`, `audio.wav`,
`contact.png`, `beats-<format>.png` and `VERIFY.md`, which records what the
run measured.

## Files

- `DECISIONS.md`: one line per creative call.
- `SOURCES.md`: where every number on screen comes from.
- `directions/directions.html`: the four looks considered, and why A won.
- `fonts/`: Inter and Inter Display (SIL OFL, see `LICENSE-Inter.txt`),
  subset to Latin and embedded in every render.
