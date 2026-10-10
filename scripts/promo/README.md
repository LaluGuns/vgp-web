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

## Film 3: the narrated short

A 76 second, 1080 x 1920 short for TikTok and Reels on the same lesson, in
an illustrated explainer style: a snare, a compressor, and inside it a small
robot whose hand rides the fader. Narrated in American English (ElevenLabs
`eleven_v4`, voice Michael C. Vincent, prompt in `film3/narration-prompt.txt`),
with real drum samples through the compressor the picture shows.

The samples and the narration are licensed or generated material and stay
out of git. Put them in `scripts/promo/assets/` (ignored):

- `assets/samples/`: the Cymatics files named in `film3/timeline.mjs`
  under `samples` (Diamonds Snare 4 C#, Kick 15 E, Closed Hihat 5 and 11,
  Crash 1, KEYS Dusty (C), Gems Vol 10 Nightfall 120 BPM A# Min Keys).
- `assets/vo/narration.mp3`: the narration take. `film3/vo-cues.json` holds
  where each line sits in that file and when each word is spoken. For a new
  take, cue it against `film3/script.txt` (needs `faster-whisper`):
  `python film3/cue_vo.py assets/vo/narration.mp3 film3/script.txt film3/vo-cues.json`,
  then adjust the `vo` placements in `film3/timeline.mjs` if line lengths
  changed.

```
npm run film3                    # sound, stills, video and checks
npm run film3 -- --stills        # contact sheets only
npm run film3 -- --frames 12.5,31 --tag check
npm run film3 -- --refresh-lesson   # re-capture the lesson's Listen demo for the end card
```

Writes to `out/film3/`: `short_9x16.mp4`, `audio.wav`, `captions.srt`,
`contact.png` (one still per scene), `seconds.png` (one per second),
`cover.png` (for the profile grid) and `VERIFY.md`. `film3/timeline.mjs` places every line, demo, effect and
scene; `film3/audio.mjs` mixes the sound and hands the picture the levels
and gain reduction it computed, so the shapes on screen are the drums you
hear. `film3/art.js` is the drawing kit, `film3/film.js` the scenes.

## Film 4: the missing fundamental

A 94 second, 1080 x 1920 short on lesson 036 ("Small speakers need bass
harmonics"): your phone can't play a sub, but it plays the harmonics above
it, and your brain puts the note back. Same voice, model, kit and pipeline
as film 3 (`eleven_v4`, Michael C. Vincent, prompt in
`film4/narration-prompt.txt`).

The bass is synthesised in `film4/bass.mjs`: a pure sine sub with an
808-style envelope, and its parallel copy through an asymmetric soft
clipper and a 120 Hz high-pass, as in the lesson's DAW experiment. The
music bus goes through the lesson's phone check (200 Hz high-pass, 24
dB/oct); the voice never does. Every harmonic rung on screen is an FFT of
the bass at that frame, and the scope is the phone's actual output.

Assets, in `scripts/promo/assets/` (ignored): the same Cymatics samples as
film 3 (named in `film4/timeline.mjs`) and the narration take as
`assets/vo/narration.mp3`. The film plays it 10% slower: `film4/audio.mjs`
builds `assets/vo/narration-slow.wav` from the take with Rubber Band
(`VO_STRETCH`) when it is missing. `film4/script.txt` has one sentence per
line, so each can be placed with its own pause. For a new take, delete the
slow file, run any `npm run film4 -- --frames 0` to rebuild it, then
`python film4/cue_vo.py assets/vo/narration-slow.wav film4/script.txt film4/vo-cues.json`
and adjust the `vo` placements in `film4/timeline.mjs`.

```
npm run film4                    # sound, stills, video and checks
npm run film4 -- --stills        # contact sheets and cover only
npm run film4 -- --frames 9.3,44.5 --tag check
npm run film4 -- --refresh-lesson   # re-capture the lesson's Listen demo
```

Writes to `out/film4/`: `short_9x16.mp4`, `audio.wav`, `captions.srt`,
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
