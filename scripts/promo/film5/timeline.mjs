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
const REPLAY = { pre: 1.75, post: 2.5 };
// The sting after the fog line: each version's downbeat alone, so the ear hears what the rows show.
const STING = { pre: 0.5, post: 0.5 };
const len = (d) => (d.pre + d.post) * BEAT;

const LINE_GAP = 0.05;
const vo = [];
const guessAt = len(HOOK) * 2;
// "One or two? Pick one." is spoken over the countdown, which lasts at least three beats.
vo.push({ id: 'guess', at: Math.round((guessAt + 0.05) * 1000) / 1000 });
const GUESS = Math.max(3 * BEAT, dur('guess') + 0.02);
let t = guessAt + GUESS + 0.1;
const stings = [];
// A sting: one version's downbeat alone, its downbeat on the grid, after a line ends at t.
// `hold` keeps the picture on the result before the next line starts.
const sting = (id, v, hold) => {
    const down = onGrid(t + 0.1 + STING.pre * BEAT);
    stings.push({ id, v, at: down - STING.pre * BEAT, ...STING });
    t = down + STING.post * BEAT + 0.1 + hold;
};
for (const id of ['hook', 'fog', 'fresh', 'hand', 'brain', 'how']) {
    vo.push({ id, at: Math.round(t * 1000) / 1000 });
    t += dur(id) + LINE_GAP;
    // "So in number one, the click is buried." then version 1's downbeat; "your ears hit it fresh" then version 2's.
    if (id === 'fog') sting('S1', 1, 0);
    if (id === 'fresh') sting('S2', 2, 0.3);
}
// "Listen again" ends just before the replay, which starts on the grid.
const replayAt = onGrid(t + dur('again') + 0.12);
vo.push({ id: 'again', at: Math.round((replayAt - 0.12 - dur('again')) * 1000) / 1000 });
const replayEnd = replayAt + 2 * len(REPLAY);
// The CTA waits for version 2's second kick to ring out.
vo.push({ id: 'cta', at: Math.round((replayEnd + 0.2) * 1000) / 1000 });
const button = replayEnd + 0.2 + dur('cta') + 0.15;

export const TIMELINE = {
    fps: 60,
    width: 1080,
    height: 1920,
    // A whole number of frames, so picture and sound end together.
    duration: Math.round((button + 0.4) * 60) / 60,
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
        ...stings,
        { id: 'A2', v: 1, at: replayAt, ...REPLAY },
        { id: 'B2', v: 2, at: replayAt + len(REPLAY), ...REPLAY },
    ],
    // The last half second plays the build that precedes frame one, so an auto-replay continues it.
    preroll: 0.55,
    // Single sounds tied to the picture: `cue: [line, word]` lands on that word.
    sfx: [
        // The guess: three ticks on the beat, "3, 2, 1"
        { at: guessAt, kind: 'tick' },
        { at: guessAt + BEAT, kind: 'tick' },
        { at: guessAt + 2 * BEAT, kind: 'tick' },
        { cue: ['hook', 'two', 0.05], dt: -0.05, kind: 'pop', level: 0.8 },
        { cue: ['hook', 'hole', 0.35], dt: 0, kind: 'tick' },
        { cue: ['hook', 'quarter', 0.6], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['fog', 'ears', 0.1], dt: -0.15, kind: 'whoosh', level: 0.6 },
        { cue: ['fog', 'covers', 0.8], dt: 0, kind: 'tick' },
        { cue: ['fresh', 'stopped', 0.4], dt: 0, kind: 'tick' },
        { cue: ['fresh', 'kick', 0.85], dt: 0, kind: 'pop', level: 0.7 },
        { cue: ['hand', 'your', 0], dt: -0.2, kind: 'whoosh', level: 0.5 },
        { cue: ['hand', 'hand', 0.17], dt: -0.1, kind: 'grab' },
        { cue: ['hand', 'down', 0.7], dt: 0, kind: 'grab', level: 0.7 },
        { cue: ['brain', 'silence', 0], dt: -0.25, kind: 'whoosh', level: 0.5 },
        { cue: ['brain', 'lands', 0.82], dt: 0, kind: 'kick' },
        { cue: ['brain', 'payoff', 0.95], dt: 0, kind: 'pop', level: 0.7 },
        { cue: ['how', 'at', 0], dt: -0.2, kind: 'whoosh', level: 0.5 },
        { cue: ['how', 'eighth', 0.6], dt: 0, kind: 'tick' },
        { cue: ['how', 'tails', 0.85], dt: 0, kind: 'tick' },
        { cue: ['again', 'listen', 0], dt: -0.1, kind: 'pop' },
        { cue: ['cta', 'the', 0], dt: -0.25, kind: 'whoosh' },
        { cue: ['cta', 'lesson', 0.3], dt: 0.05, kind: 'tick' },
        { at: button, kind: 'button' },
    ],
    button,
    guess: { at: guessAt, dur: GUESS },
    // Scenes in order; each runs until the next one starts. `from: [line, word]`
    // starts a scene on a spoken word; `at` is used otherwise.
    scenes: [
        { id: 'ab', at: 0, view: 'ab', teaches: 'Hook: the same drop twice, 1 then 2.' },
        { id: 'notch', line: 'hook', dt: -0.15, view: 'ab', teaches: 'Number 2 has a hole: less than a quarter second of silence.' },
        { id: 'fog', line: 'fog', dt: -0.3, view: 'ear', teaches: "One, your ears, in cross-section and then inside the cochlea (slowed down, model): in 1 the riser is still playing when the kick lands, so the click's spark is covered and the hair cells barely react." },
        { id: 'fresh', line: 'fresh', dt: -0.25, view: 'ear', teaches: "In 2 the riser stops, the silence lets the fog clear, and the hair cells meet the click fresh; measured: click clearer in 2 (see VERIFY)." },
        { id: 'hand', line: 'hand', dt: -0.25, view: 'hand', teaches: "Two, the limiter is a hand on a console fader: in 1 it is pulled down as the kick arrives (measured gain reduction on each strip's display)." },
        { id: 'brain', line: 'brain', dt: -0.3, view: 'brain', teaches: "Three, in the silence the only thing left to predict is the next beat; the kick lands where it was expected." },
        { id: 'how', line: 'how', dt: -0.25, view: 'how', teaches: "In a DAW: cut every track an 8th before the drop, the reverb return too; a loud sound fogs hearing for up to 200 ms (model) and an 8th at 128 BPM (234.4 ms) outlasts it." },
        { id: 'replay', line: 'again', dt: -0.15, view: 'ab', replay: true, teaches: 'Listen again, knowing what to listen for.' },
        { id: 'end', line: 'cta', dt: -0.2, view: 'end', teaches: 'Where the lesson is, and who made it.' },
    ],
};
