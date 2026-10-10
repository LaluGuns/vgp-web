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
    duration: 86,
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
    // The same rhythm on one note, G#1, for the scope.
    pedal: [
        [[0, 7, 'G#1'], [7, 3, 'G#1'], [10, 4, 'G#1'], [14, 2, 'G#1']],
        [[0, 7, 'G#1'], [7, 3, 'G#1'], [10, 4, 'G#1'], [14, 2, 'G#1']],
    ],
    // The vamp restarts on bar 1 at these times (each a bar line), so every
    // demo starts on the same notes. Before the first, bar 1 falls on 1 s.
    vampSync: [5, 19, 33, 69, 75, 77],

    // Narration, one sentence per entry: `id` is a line in vo-cues.json,
    // `at` where it starts. Lines sharing a stem (air-1, air-2) form one beat;
    // film.js looks words up across the beat. Each new idea gets a breath.
    vo: [
        { id: 'hook-a1', at: 0.3 },
        { id: 'hook-a2', at: 2 },
        { id: 'hook-b1', at: 3.3 },
        { id: 'hook-b2', at: 4.15 },
        { id: 'hook-b3', at: 6.1 },
        { id: 'air-1', at: 9.4 },
        { id: 'air-2', at: 12.1 },
        { id: 'phone-1', at: 17.5 },
        { id: 'phone-2', at: 19.45 },
        { id: 'phone-3', at: 21.9 },
        { id: 'stack-1', at: 24.6 },
        { id: 'stack-2', at: 27.0 },
        { id: 'sub-1', at: 33.4 },
        { id: 'sub-2', at: 36.6 },
        { id: 'grow', at: 38.6 },
        { id: 'window-1', at: 41.9 },
        { id: 'window-2', at: 43.9 },
        { id: 'strange-1', at: 46.5 },
        { id: 'strange-2', at: 48 },
        { id: 'brain-1', at: 52 },
        { id: 'brain-2', at: 53.9 },
        { id: 'ghost', at: 55.7 },
        { id: 'limit-1', at: 59.4 },
        { id: 'limit-2', at: 61.5 },
        { id: 'rule-1', at: 63.6 },
        { id: 'rule-2', at: 66.1 },
        { id: 'again', at: 74.2 },
        { id: 'cta', at: 79.3 },
    ],

    // Bass demos. `blend`: level of the saturated copy under the clean sub
    // (0 = clean sub only), a number or a ramp { cue, dt, to, v }. `boostDb`
    // turns the whole bass up. `duck`: the bass sits 9 dB lower while the
    // voice speaks over it. `drums`: the beat plays along.
    bass: [
        { id: 'hookClean', from: 0, to: 5, blend: 0, drums: true },
        { id: 'hookSat', from: 5, to: 9, blend: 0.5, drums: true },
        { id: 'boost', from: 19, to: 24.1, blend: 0, boostDb: { cue: ['phone', 'turning'], dt: 0, to: 1.0, db: 10 }, duck: true },
        { id: 'grow', from: 33, to: 41, blend: { cue: ['grow', 'saturate'], dt: -0.05, to: 2.1, v: 0.5 }, duck: true },
        // From the window beat to the ghost the bass holds G#1, the vamp's
        // root under both bars, so one note's harmonics and period stay put.
        { id: 'pedal', from: 41, to: 59, blend: 0.5, duck: true, riff: 'pedal' },
        // The recipe: the clean sub through the phone, then the saturated
        // copy added on the diagram's last step (film.js RECIPE_STEPS).
        { id: 'recipe', from: 69, to: 74, blend: { cue: ['rule', 'add'], dt: 5.3, to: 0.4, v: 0.5 } },
        { id: 'againClean', from: 75, to: 77, blend: 0, drums: true },
        { id: 'againSat', from: 77, to: 79, blend: 0.5, drums: true },
    ],
    // The "typical note": a plucked bass string at the bass's own pitch,
    // plucked as the idea is introduced and again on "stack".
    plucks: [
        { cue: ['stack', 'notes'], dt: -0.05, note: 'G#1', dur: 2.6 },
        { cue: ['stack', 'stack'], dt: -0.1, note: 'G#1', dur: 5.0 },
    ],

    // Keys under everything to the button.
    bed: { from: 0, to: 85 },

    sfx: [
        { cue: ['hook-b', 'now'], dt: -0.05, kind: 'pop', level: 0.6 },
        { at: 5, kind: 'crash' },
        { cue: ['hook-b', 'change'], dt: 0, kind: 'pop', level: 0.5 },
        { at: 9, kind: 'whoosh', level: 0.6 },
        { cue: ['air', 'every'], dt: 0, kind: 'pop', level: 0.5 },
        { cue: ['air', 'four'], dt: -0.05, kind: 'pop', level: 0.6 },
        { at: 17.1, kind: 'whoosh', level: 0.5 },
        { cue: ['phone', 'tiny'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['phone', 'barely'], dt: 0, kind: 'thud' },
        { cue: ['phone', 'turning'], dt: 0.1, kind: 'tick' },
        { cue: ['phone', 'turning'], dt: 0.45, kind: 'tick' },
        { cue: ['phone', 'turning'], dt: 0.8, kind: 'tick' },
        { at: 24.2, kind: 'whoosh', level: 0.5 },
        { cue: ['stack', 'two'], dt: -0.05, kind: 'pop', level: 0.5 },
        { cue: ['stack', 'three'], dt: -0.05, kind: 'pop', level: 0.5 },
        { cue: ['stack', 'four'], dt: -0.05, kind: 'pop', level: 0.5 },
        { cue: ['window', 'harmonics'], dt: 0, kind: 'shimmer' },
        { cue: ['strange', 'heres'], dt: -0.3, kind: 'whoosh', level: 0.5 },
        { cue: ['strange', 'repeat'], dt: 0, kind: 'tick' },
        { cue: ['brain', 'back'], dt: -0.1, kind: 'blink' },
        { cue: ['ghost', 'never'], dt: 0, kind: 'shimmer' },
        { at: 59, kind: 'whoosh', level: 0.5 },
        { cue: ['rule', 'keep'], dt: -0.1, kind: 'pop', level: 0.7 },
        { cue: ['rule', 'add'], dt: -0.1, kind: 'pop', level: 0.7 },
        { at: 74, kind: 'pop' },
        { at: 77, kind: 'tick' },
        { at: 79.1, kind: 'whoosh' },
        { at: 79.45, kind: 'pop', level: 0.7 },
        { cue: ['cta', 'play'], dt: 0.05, kind: 'tick' },
        { at: 84.8, kind: 'button' },
    ],

    // Scenes in order; each runs until the next one starts.
    scenes: [
        { id: 'hook', at: 0, view: 'hook', teaches: 'Hook: a bass line your phone cannot play.' },
        { id: 'payoff', at: 4.8, view: 'hook', teaches: 'Same notes, saturated: now the phone plays it.' },
        { id: 'air', at: 9.2, view: 'air', teaches: 'Each octave down, four times the cone movement.' },
        { id: 'phone', at: 17.3, view: 'phone', teaches: 'A phone cone cannot move that far; turning the sub up changes nothing.' },
        { id: 'stack', at: 24.4, view: 'ladder', teaches: 'A note is a stack: f, 2f, 3f, 4f.' },
        { id: 'sub', at: 33.2, view: 'ladder', teaches: 'A clean sub is only the bottom line, below the phone.' },
        { id: 'grow', at: 38.4, view: 'ladder', teaches: 'Saturation grows the stack.' },
        { id: 'window', at: 41.7, view: 'ladder', teaches: 'The phone plays the harmonics, not the note.' },
        { id: 'strange', at: 46.3, view: 'scope', teaches: 'The harmonics repeat at the period of the missing note.' },
        { id: 'ghost', at: 55.5, view: 'scope', teaches: 'The brain puts the note back.' },
        { id: 'limit', at: 59.2, view: 'limit', teaches: 'Feel it on a club sub, hear it on a phone.' },
        { id: 'rule', at: 63.4, view: 'rule', teaches: 'Sub clean for big speakers, harmonics for small ones.' },
        { id: 'again', at: 74, view: 'hook', teaches: 'The hook again, knowing what to listen for.' },
        { id: 'end', at: 79.1, view: 'end', teaches: 'Where the lesson is, and who made it.' },
    ],
};
