// Film 3: the attack and release lesson as a narrated, illustrated short
// for TikTok and Reels (1080 x 1920). One object holds every placement: the
// narration lines, the drum demos and their compressor settings, sound
// effects and scenes. Sound (audio.mjs) and picture (film.js) both read it.
//
// Idea: a compressor is a little hand on a fader. Attack is how fast it
// grabs, release is how fast it lets go, and together they decide which part
// of every hit survives.
// Viewer outcome: "Slow attack keeps the crack, fast attack squashes it, and
// release decides whether the groove breathes."
// Hook: the same snare through the same compressor, twice, within 3 s.
//
// Times are seconds from the start of the film. The music grid is 120 BPM
// with bar lines on odd seconds (1, 3, 5 ...), so every drum demo starts on a
// downbeat of the keys loop underneath.

const base = { threshold: 0.12, ratio: 6 };
export const SETTINGS = {
    FAST: { ...base, attack: 0.001, release: 0.06, label: '1 ms attack' },
    SLOW: { ...base, attack: 0.03, release: 0.06, label: '30 ms attack' },
    HOLD: { ...base, attack: 0.03, release: 2.5, label: '2.5 s release' },
    TEMPO: { ...base, attack: 0.03, release: 0.09, label: '90 ms release' },
};

export const TIMELINE = {
    fps: 60,
    width: 1080,
    height: 1920,
    duration: 72.5,
    bpm: 120,
    bar: 2,
    gridOrigin: 1,
    lesson: {
        url: 'virzyguns.com/blog',
        slug: 'how-compression-changes-motion-not-level',
        title: 'Compression changes motion before level',
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
    // One bar of drums, 16 steps. Hats on every eighth, the off-beat ones
    // softer, so there is something quiet between the hits for release to
    // act on.
    pattern: {
        kick: [0, 7, 10],
        snare: [4, 12],
        hat: [0, 4, 8, 12],
        hatSoft: [2, 6, 10, 14],
    },

    // Narration: `id` is a line in vo-cues.json, `at` where it starts.
    vo: [
        { id: 'same-snare', at: 0.25 },
        { id: 'same-comp', at: 1.25 },
        { id: 'listen', at: 2.35 },
        { id: 'flat', at: 7.15 },
        { id: 'punchy', at: 8.4 },
        { id: 'knob', at: 9.8 },
        { id: 'hand', at: 11.85 },
        { id: 'watch', at: 15.65 },
        { id: 'pull', at: 17.0 },
        { id: 'parts', at: 20.85 },
        { id: 'crack', at: 22.95 },
        { id: 'body', at: 24.7 },
        { id: 'attack', at: 26.85 },
        { id: 'fast', at: 29.1 },
        { id: 'slow', at: 35.3 },
        { id: 'slips', at: 38.45 },
        { id: 'punch', at: 42.25 },
        { id: 'release', at: 45.3 },
        { id: 'hold', at: 47.4 },
        { id: 'flatgroove', at: 51.65 },
        { id: 'fresh', at: 55.3 },
        { id: 'rule-a', at: 61.2 },
        { id: 'rule-r', at: 62.85 },
        { id: 'cta', at: 65.2 },
    ],

    // Drum demos, each on a bar line. `under`: seconds at the end during
    // which narration plays over the drums, so they sit lower.
    demos: [
        { id: 'A', at: 3, bars: 1, comp: 'FAST' },
        { id: 'B', at: 5, bars: 1, comp: 'SLOW' },
        { id: 'fast', at: 33, bars: 1, comp: 'FAST' },
        { id: 'slow', at: 43, bars: 1, comp: 'SLOW' },
        { id: 'hold', at: 53, bars: 1, comp: 'HOLD' },
        { id: 'tempo', at: 59, bars: 3, comp: 'TEMPO', under: 4 },
    ],

    // Keys loop under everything from the first demo to the button.
    bed: { from: 3, to: 71 },

    // Single sounds: `hit` is a dry snare, the rest are effects. An effect
    // tied to the picture gives `cue: [line, word]` and `dt`, and lands when
    // that word is spoken, where film.js shows the same thing.
    sfx: [
        { at: 0.0, kind: 'hit' },
        { at: 1.22, kind: 'pop' },
        { at: 2.3, kind: 'pop', level: 0.6 },
        { at: 5.0, kind: 'tick' },
        { cue: ['flat', 'flat'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['punchy', 'punchy'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['knob', 'knob'], dt: 0.12, kind: 'tick' },
        { cue: ['knob', 'knob'], dt: 0.52, kind: 'tick' },
        { at: 11.3, kind: 'whoosh' },
        { at: 12.4, kind: 'pop', level: 0.7 },
        { cue: ['watch', 'watches'], dt: -0.05, kind: 'blink' },
        { at: 17.05, kind: 'tick' },
        { cue: ['pull', 'pulls'], dt: -0.1, kind: 'slide' },
        { at: 20.25, kind: 'whoosh', level: 0.6 },
        { at: 20.62, kind: 'hit' },
        { cue: ['crack', 'crack'], dt: 0, kind: 'pop', level: 0.7 },
        { cue: ['body', 'body'], dt: 0, kind: 'pop', level: 0.7 },
        { at: 26.55, kind: 'whoosh', level: 0.6 },
        { cue: ['attack', 'grabs'], dt: -0.05, kind: 'grab' },
        { cue: ['fast', 'catches'], dt: -0.1, kind: 'grab' },
        { cue: ['fast', 'squashes'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['slips', 'past'], dt: -0.2, kind: 'pop', level: 0.6 },
        { cue: ['slips', 'only'], dt: 0.05, kind: 'grab', level: 0.7 },
        { cue: ['slips', 'body'], dt: -0.1, kind: 'pop', level: 0.6 },
        { cue: ['punch', 'punch'], dt: -0.1, kind: 'pop' },
        { cue: ['release', 'lets'], dt: 0.05, kind: 'spring' },
        { cue: ['hold', 'arrives'], dt: -0.1, kind: 'pop', level: 0.6 },
        { cue: ['flatgroove', 'flat'], dt: -0.25, kind: 'pop', level: 0.6 },
        { cue: ['fresh', 'fresh'], dt: -0.1, kind: 'pop', level: 0.6 },
        { at: 57.4, kind: 'swell', to: 59 },
        { at: 59, kind: 'crash' },
        { at: 61.05, kind: 'pop', level: 0.7 },
        { at: 62.7, kind: 'pop', level: 0.7 },
        { at: 64.6, kind: 'whoosh' },
        { at: 70.56, kind: 'pop' },
        { at: 71, kind: 'button' },
    ],

    // Scenes in order; each runs until the next one starts.
    // view: what the stage draws (film.js).
    scenes: [
        { id: 'intro', at: 0, view: 'stage', teaches: 'Hook: same snare, same compressor.' },
        { id: 'ab', at: 3, view: 'stage', teaches: 'Hook: 1 ms, then 30 ms, heard back to back.' },
        { id: 'verdict', at: 7, view: 'stage', teaches: 'One is flat, one is punchy; only the attack knob moved.' },
        { id: 'inside', at: 11.3, view: 'inside', teaches: 'A compressor is a hand on a fader that pulls down above the threshold.' },
        { id: 'parts', at: 20.3, view: 'parts', teaches: 'A hit is a crack and a body.' },
        { id: 'attack', at: 26.55, view: 'rig', setting: 'FAST', mode: 'intro', teaches: 'Attack: how fast the hand grabs.' },
        { id: 'fast', at: 29.0, view: 'rig', setting: 'FAST', mode: 'slowmo', teaches: '1 ms catches the crack and squashes it.' },
        { id: 'demo-fast', at: 33, view: 'rig', setting: 'FAST', mode: 'live', demo: 'fast', teaches: 'Heard: 1 ms attack.' },
        { id: 'slow', at: 35, view: 'rig', setting: 'SLOW', mode: 'slowmo', teaches: '30 ms lets the crack past and turns the body down.' },
        { id: 'demo-slow', at: 43, view: 'rig', setting: 'SLOW', mode: 'live', demo: 'slow', teaches: 'Heard: 30 ms attack. Punch.' },
        { id: 'release', at: 45, view: 'rig', setting: 'SLOW', mode: 'letgo', teaches: 'Release: how fast the hand lets go.' },
        { id: 'hold', at: 47.3, view: 'rig', setting: 'HOLD', mode: 'groove', teaches: 'Too slow: still holding when the next hit arrives.' },
        { id: 'demo-hold', at: 53, view: 'rig', setting: 'HOLD', mode: 'live', demo: 'hold', teaches: 'Heard: 2.5 s release. Flat.' },
        { id: 'fresh', at: 55, view: 'rig', setting: 'TEMPO', mode: 'groove', teaches: 'In time: every hit starts fresh.' },
        { id: 'demo-tempo', at: 59, view: 'rig', setting: 'TEMPO', mode: 'live', demo: 'tempo', teaches: 'Heard: 90 ms release.' },
        { id: 'rule', at: 61, view: 'rule', teaches: 'Attack shapes the hit. Release shapes the groove.' },
        { id: 'end', at: 64.6, view: 'end', teaches: 'Where the lesson is, and who made it.' },
    ],
};
