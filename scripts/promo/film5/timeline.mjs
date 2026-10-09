// Film 5: "Same drop. Which one hits harder?" A gap before the drop (lesson
// 030) as a narrated, illustrated short for TikTok and Reels (1080 x 1920).
// One object holds every placement: the narration lines, the A/B demos,
// sound effects and scenes. Sound (audio.mjs) and picture (film.js) both read it.
//
// Idea: cut everything an 8th note before the drop. In the silence the ear
// recovers and the limiter lets go, so the kick lands with its full click,
// right where the listener expects it.
// Hook: the same drop twice, version 1 with the build running into the
// downbeat, version 2 with a 234 ms gap, within 4 s.
//
// Times are seconds from the start of the film. The music grid is 128 BPM
// from t = 0, so every demo starts on a beat of the bed underneath.
// Narration lines are placed one after another from their measured lengths
// (vo-cues.json), so a new take moves the picture with it.
import fs from 'node:fs';
import path from 'node:path';
import { BAR, BEAT, BPM, GAP } from './drop.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const CUES = JSON.parse(fs.readFileSync(path.join(HERE, 'vo-cues.json'), 'utf8'));
const dur = (id) => {
    const c = CUES.segments.find((s) => s.id === id);
    return c.to - c.from;
};
const onGrid = (t) => Math.ceil(t / BEAT - 1e-9) * BEAT;

// Demos: `v` is the version, `pre` and `post` the beats played either side of the downbeat.
const HOOK = { pre: 2.5, post: 2 };
const REPLAY = { pre: 1.5, post: 2 };
// After the hook, two beats to pick 1 or 2 before the voice gives the answer.
const GUESS = 2 * BEAT;
const len = (d) => (d.pre + d.post) * BEAT;

const LINE_GAP = 0.22;
const vo = [];
const guessAt = len(HOOK) * 2;
let t = guessAt + GUESS + 0.1;
for (const id of ['hook', 'fog', 'fresh', 'hand', 'brain', 'how']) {
    vo.push({ id, at: Math.round(t * 1000) / 1000 });
    t += dur(id) + LINE_GAP;
}
// "Listen again" ends just before the replay, which starts on the grid.
const replayAt = onGrid(t + dur('again') + 0.12);
vo.push({ id: 'again', at: Math.round((replayAt - 0.12 - dur('again')) * 1000) / 1000 });
const replayEnd = replayAt + 2 * len(REPLAY);
// The CTA waits for version 2's second kick to ring out.
vo.push({ id: 'cta', at: Math.round((replayEnd + 0.45) * 1000) / 1000 });
const button = replayEnd + 0.45 + dur('cta') + 0.15;

export const TIMELINE = {
    fps: 60,
    width: 1080,
    height: 1920,
    // A whole number of frames, so picture and sound end together.
    duration: Math.round((button + 0.75) * 60) / 60,
    bpm: BPM,
    beat: BEAT,
    bar: BAR,
    gapMs: Math.round(GAP * 10000) / 10,
    lesson: {
        url: 'virzyguns.com/blog',
        slug: 'why-silence-before-the-beat-feels-physical',
        title: 'A gap before the drop makes the downbeat hit harder',
        tagline: '100% Art. 100% Science.',
    },
    vo,
    // A/B demos: the same drop rendered by drop.mjs, version 1 (no gap) and
    // version 2 (gap), from `pre` beats before the downbeat to `post` after.
    demos: [
        { id: 'A', v: 1, at: 0, ...HOOK },
        { id: 'B', v: 2, at: len(HOOK), ...HOOK },
        { id: 'A2', v: 1, at: replayAt, ...REPLAY },
        { id: 'B2', v: 2, at: replayAt + len(REPLAY), ...REPLAY },
    ],
    // Single sounds tied to the picture: `cue: [line, word]` lands on that word.
    sfx: [
        // The guess: two ticks on the beat, "1 or 2?"
        { at: guessAt, kind: 'tick' },
        { at: guessAt + BEAT, kind: 'tick' },
        { cue: ['hook', 'two'], dt: -0.05, kind: 'pop', level: 0.8 },
        { cue: ['hook', 'hole'], dt: 0, kind: 'tick' },
        { cue: ['hook', 'quarter'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['fog', 'loud'], dt: -0.2, kind: 'whoosh', level: 0.6 },
        { cue: ['fog', 'stops'], dt: 0.1, kind: 'tick' },
        { cue: ['fog', 'click'], dt: 0, kind: 'pop', level: 0.6 },

        { cue: ['fresh', 'full'], dt: 0, kind: 'pop', level: 0.7 },
        { cue: ['hand', 'your'], dt: -0.2, kind: 'whoosh', level: 0.5 },
        { cue: ['hand', 'hand'], dt: -0.1, kind: 'grab' },
        { cue: ['hand', 'down'], dt: 0, kind: 'grab', level: 0.7 },
        { cue: ['brain', 'silence'], dt: -0.25, kind: 'whoosh', level: 0.5 },
        { cue: ['brain', 'there'], dt: 0, kind: 'kick' },
        { cue: ['brain', 'payoff'], dt: 0, kind: 'pop', level: 0.7 },
        { cue: ['how', 'at'], dt: -0.2, kind: 'whoosh', level: 0.5 },
        { cue: ['how', 'eighth'], dt: 0, kind: 'tick' },
        { cue: ['how', 'tails'], dt: 0, kind: 'tick' },
        { cue: ['again', 'listen'], dt: -0.1, kind: 'pop' },
        { cue: ['cta', 'the'], dt: -0.25, kind: 'whoosh' },
        { cue: ['cta', 'play'], dt: 0.05, kind: 'tick' },
        { at: button, kind: 'button' },
        // The last half second rises into the first frame, so a replay feels intended.
        { at: button + 0.15, kind: 'swell', to: button + 0.75 },
    ],
    button,
    guess: { at: guessAt, dur: GUESS },
    // Scenes in order; each runs until the next one starts. `from: [line, word]`
    // starts a scene on a spoken word; `at` is used otherwise.
    scenes: [
        { id: 'ab', at: 0, view: 'ab', teaches: 'Hook: the same drop twice, 1 then 2.' },
        { id: 'notch', from: ['hook', 'number'], dt: -0.15, view: 'ab', teaches: 'Number 2 has a hole: less than a quarter second of silence.' },
        { id: 'fog', from: ['fog', 'a'], dt: -0.3, view: 'ear', teaches: 'A loud riser covers the click while it plays and leaves a fog (forward masking, model) for up to 200 ms; in 1 the click is buried, in 2 it is clear (measured: 10.6 dB).' },
        { id: 'fresh', from: ['fresh', 'after'], dt: -0.25, view: 'ear', teaches: 'Same rows: after silence the ear responds fully, inside the riser only a little (adaptation, model).' },
        { id: 'hand', from: ['hand', 'your'], dt: -0.25, view: 'hand', teaches: 'The limiter is a hand on a fader: in 1 it is already down when the kick arrives.' },
        { id: 'brain', from: ['brain', 'silence'], dt: -0.3, view: 'brain', teaches: 'Silence leaves one thing to predict: the next beat. The arrival is the payoff.' },
        { id: 'how', from: ['how', 'at'], dt: -0.25, view: 'how', teaches: 'At 128 BPM cut everything an 8th early; reverb tails too.' },
        { id: 'replay', from: ['again', 'listen'], dt: -0.15, view: 'ab', replay: true, teaches: 'Listen again, knowing what to listen for.' },
        { id: 'end', from: ['cta', 'the'], dt: -0.2, view: 'end', teaches: 'Where the lesson is, and who made it.' },
    ],
};
