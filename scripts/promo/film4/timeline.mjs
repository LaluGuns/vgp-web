// Film 4: the missing fundamental, for TikTok and Reels (1080 x 1920). One
// object holds every placement: narration lines, the bass and drum demos,
// the plucked note, sound effects and scenes. Sound (audio.mjs) and picture
// (film.js) both read it.
//
// Idea: a phone cannot play a sub, but it can play the harmonics above it,
// and the ear rebuilds the missing note from them.
// Viewer outcome: "Keep the sub clean for big speakers and add harmonics for
// small ones."
// Hook: the same bass line through a phone speaker twice: a clean sub that
// disappears, then with parallel saturation, which comes back.
//
// Times are seconds from the start of the film. The music grid is 120 BPM
// with bar lines on odd seconds. The keys bed is a two-bar vamp of the
// Nightfall loop's first two bars (A flat maj9, then A flat m6/9); the bass
// follows it: G#1 under bar 1, F1 under bar 2, G1 passing between them.

export const TIMELINE = {
    fps: 60,
    width: 1080,
    height: 1920,
    duration: 76,
    bpm: 120,
    bar: 2,
    gridOrigin: 1,
    lesson: {
        url: 'virzyguns.com/blog',
        slug: 'the-physics-of-bass-on-small-speakers',
        title: 'Small speakers need bass harmonics',
        tagline: '100% Art. 100% Science.',
    },
    samples: {
        snare: 'Cymatics - Diamonds Snare 4 - C#.wav',
        kick: 'Cymatics - Diamonds Kick 15 - E.wav',
        hat: 'Cymatics - Diamonds Closed Hihat 5.wav',
        hatSoft: 'Cymatics - Diamonds Closed Hihat 11.wav',
        crash: 'Cymatics - Diamonds Crash 1.wav',
        keys: 'Cymatics Gems Vol 10 - Nightfall - 120 BPM A# Min Keys.wav',
        note: 'Cymatics - KEYS Dusty (C).wav',
    },
    // One bar of drums, 16 steps.
    pattern: {
        kick: [0, 7, 10],
        snare: [4, 12],
        hat: [0, 4, 8, 12],
        hatSoft: [2, 6, 10, 14],
    },
    // The bass line, per vamp bar: [step, length in steps, note]. It locks to
    // the kick (steps 0, 7, 10) and walks into the next bar on step 14.
    riff: [
        [[0, 7, 'G#1'], [7, 3, 'G#1'], [10, 4, 'G#1'], [14, 2, 'G1']],
        [[0, 7, 'F1'], [7, 3, 'F1'], [10, 4, 'F1'], [14, 2, 'G1']],
    ],
    // The vamp restarts on bar 1 at these times (each a bar line), so every
    // demo starts on the same notes. Before the first, bar 1 falls on 1 s.
    vampSync: [7, 21, 31, 61, 65],

    // Narration: `id` is a line in vo-cues.json, `at` where it starts.
    vo: [
        { id: 'hook-a', at: 0.35 },
        { id: 'hook-b', at: 3.45 },
        { id: 'air', at: 11.25 },
        { id: 'phone', at: 18.3 },
        { id: 'stack', at: 24.1 },
        { id: 'sub', at: 30.85 },
        { id: 'grow', at: 35.4 },
        { id: 'window', at: 38.15 },
        { id: 'strange', at: 42.1 },
        { id: 'brain', at: 46.85 },
        { id: 'ghost', at: 49.95 },
        { id: 'limit', at: 53.3 },
        { id: 'rule', at: 56.6 },
        { id: 'again', at: 60.75 },
        { id: 'cta', at: 69.3 },
    ],

    // Bass demos. `blend`: level of the saturated copy under the clean sub
    // (0 = clean sub only), a number or [[t, v], ...] keys. `boostDb` keys
    // turn the whole bass up. `duck`: narration plays over it, so it sits
    // lower while the voice speaks. `drums`: the beat plays along.
    bass: [
        { id: 'hookClean', from: 0, to: 7, blend: 0, drums: true },
        { id: 'hookSat', from: 7, to: 11, blend: 0.5, drums: true },
        { id: 'boost', from: 21, to: 23.5, blend: 0, boostDb: { cue: ['phone', 'turning'], dt: 0, to: 1.0, db: 10 }, duck: true },
        { id: 'grow', from: 31, to: 53, blend: { cue: ['grow', 'saturate'], dt: -0.05, to: 2.1, v: 0.5 }, duck: true },
        { id: 'againClean', from: 61, to: 65, blend: 0, drums: true },
        { id: 'againSat', from: 65, to: 69, blend: 0.5, drums: true },
    ],
    // The "typical note": a plucked bass string at the bass's own pitch.
    plucks: [{ cue: ['stack', 'stack'], dt: -0.1, note: 'G#1', dur: 3.6 }],

    // Keys under everything to the button.
    bed: { from: 0, to: 75 },

    sfx: [
        { cue: ['hook-b', 'now'], dt: -0.05, kind: 'pop', level: 0.6 },
        { at: 7.0, kind: 'crash' },
        { at: 11.05, kind: 'whoosh', level: 0.6 },
        { cue: ['air', 'every'], dt: 0, kind: 'pop', level: 0.5 },
        { cue: ['air', 'four'], dt: -0.05, kind: 'pop', level: 0.6 },
        { cue: ['phone', 'tiny'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['phone', 'barely'], dt: 0, kind: 'thud' },
        { cue: ['phone', 'turning'], dt: 0.1, kind: 'tick' },
        { cue: ['phone', 'turning'], dt: 0.45, kind: 'tick' },
        { cue: ['phone', 'turning'], dt: 0.8, kind: 'tick' },
        { cue: ['stack', 'but'], dt: -0.25, kind: 'whoosh', level: 0.5 },
        { cue: ['stack', 'two'], dt: -0.05, kind: 'pop', level: 0.5 },
        { cue: ['stack', 'three'], dt: -0.05, kind: 'pop', level: 0.5 },
        { cue: ['stack', 'four'], dt: -0.05, kind: 'pop', level: 0.5 },
        { cue: ['window', 'harmonics'], dt: 0, kind: 'shimmer' },
        { cue: ['strange', 'heres'], dt: -0.3, kind: 'whoosh', level: 0.5 },
        { cue: ['strange', 'repeat'], dt: 0, kind: 'tick' },
        { cue: ['brain', 'back'], dt: -0.1, kind: 'blink' },
        { cue: ['ghost', 'never'], dt: 0, kind: 'shimmer' },
        { at: 53.0, kind: 'whoosh', level: 0.5 },
        { cue: ['rule', 'keep'], dt: -0.1, kind: 'pop', level: 0.7 },
        { cue: ['rule', 'add'], dt: -0.1, kind: 'pop', level: 0.7 },
        { at: 60.6, kind: 'pop' },
        { at: 65.0, kind: 'tick' },
        { at: 69.1, kind: 'whoosh' },
        { at: 69.45, kind: 'pop', level: 0.7 },
        { cue: ['cta', 'play'], dt: 0.05, kind: 'tick' },
        { at: 74.5, kind: 'button' },
    ],

    // Scenes in order; each runs until the next one starts.
    scenes: [
        { id: 'hook', at: 0, view: 'hook', teaches: 'Hook: a bass line your phone cannot play.' },
        { id: 'payoff', at: 6.8, view: 'hook', teaches: 'Same notes, saturated: now the phone plays it.' },
        { id: 'air', at: 11.1, view: 'air', teaches: 'Each octave down, four times the cone movement.' },
        { id: 'phone', at: 18.1, view: 'phone', teaches: 'A phone cone cannot move that far; turning the sub up changes nothing.' },
        { id: 'stack', at: 23.9, view: 'ladder', teaches: 'A note is a stack: f, 2f, 3f, 4f.' },
        { id: 'sub', at: 30.7, view: 'ladder', teaches: 'A clean sub is only the bottom line, below the phone.' },
        { id: 'grow', at: 35.25, view: 'ladder', teaches: 'Saturation grows the stack.' },
        { id: 'window', at: 38.0, view: 'ladder', teaches: 'The phone plays the harmonics, not the note.' },
        { id: 'strange', at: 41.9, view: 'scope', teaches: 'The harmonics repeat at the period of the missing note.' },
        { id: 'ghost', at: 49.8, view: 'scope', teaches: 'The brain puts the note back.' },
        { id: 'limit', at: 53.1, view: 'limit', teaches: 'Feel it on a club sub, hear it on a phone.' },
        { id: 'rule', at: 56.45, view: 'rule', teaches: 'Sub clean for big speakers, harmonics for small ones.' },
        { id: 'again', at: 60.55, view: 'hook', teaches: 'The hook again, knowing what to listen for.' },
        { id: 'end', at: 69.1, view: 'end', teaches: 'Where the lesson is, and who made it.' },
    ],
};
