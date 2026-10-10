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
    duration: 76.5,
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
        { id: 'same-snare', at: 0.3 },
        { id: 'listen', at: 2.45 },
        { id: 'flat', at: 7.15 },
        { id: 'punchy', at: 8.35 },
        { id: 'knob', at: 9.65 },
        { id: 'hand', at: 12.2 },
        { id: 'watch', at: 16.0 },
        { id: 'pull', at: 17.3 },
        { id: 'parts', at: 21.6 },
        { id: 'crack', at: 23.45 },
        { id: 'body', at: 25.0 },
        { id: 'attack', at: 26.75 },
        { id: 'fast', at: 29.25 },
        { id: 'slow', at: 35.3 },
        { id: 'slips', at: 38.0 },
        { id: 'punch', at: 41.6 },
        { id: 'release', at: 45.15 },
        { id: 'hold', at: 47.35 },
        { id: 'squashed', at: 51.1 },
        { id: 'fresh', at: 55.3 },
        { id: 'rule-a', at: 61.2 },
        { id: 'rule-r', at: 62.55 },
        { id: 'again', at: 64.05 },
        { id: 'cta', at: 69.35 },
    ],

    // Drum demos, each on a bar line. `under`: seconds at the end during
    // which narration plays over the drums, so they sit lower.
    demos: [
        { id: 'A', at: 3, bars: 1, comp: 'FAST' },
        { id: 'B', at: 5, bars: 1, comp: 'SLOW' },
        { id: 'fast', at: 33, bars: 1, comp: 'FAST' },
        { id: 'slow', at: 43, bars: 1, comp: 'SLOW' },
        { id: 'hold', at: 53, bars: 1, comp: 'HOLD' },
        { id: 'tempo', at: 59, bars: 2, comp: 'TEMPO', under: 2 },
        // "Now listen again": the hook once more, now that the viewer knows what to listen for.
        { id: 'A2', at: 65, bars: 1, comp: 'FAST' },
        { id: 'B2', at: 67, bars: 1, comp: 'SLOW' },
    ],

    // Keys loop under everything from the first demo to the button.
    bed: { from: 3, to: 75 },

    // Single sounds: `hit` is a dry snare, the rest are effects. An effect
    // tied to the picture gives `cue: [line, word]` and `dt`, and lands when
    // that word is spoken, where film.js shows the same thing.
    sfx: [
        { at: 0.0, kind: 'hit' },
        // A second strike right after the word "snare".
        { cue: ['same-snare', 'snare'], dt: 0.32, kind: 'hit', level: 0.8 },
        { cue: ['same-snare', 'compressor'], dt: -0.08, kind: 'pop' },
        { at: 2.3, kind: 'pop', level: 0.6 },
        { at: 5.0, kind: 'tick' },
        { cue: ['flat', 'flat'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['punchy', 'punchy'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['knob', 'knob'], dt: 0.12, kind: 'tick' },
        { cue: ['knob', 'knob'], dt: 0.52, kind: 'tick' },
        { at: 11.55, kind: 'whoosh' },
        { cue: ['hand', 'hand'], dt: -0.25, kind: 'pop', level: 0.7 },
        { cue: ['watch', 'watches'], dt: -0.05, kind: 'blink' },
        { cue: ['pull', 'when'], dt: 0.05, kind: 'tick' },
        // Soft hits the meter and the hand react to inside the box.
        { cue: ['pull', 'crosses'], dt: 0, kind: 'hit', level: 0.5 },
        { cue: ['pull', 'pulls'], dt: -0.1, kind: 'hit', level: 0.5 },
        { cue: ['pull', 'down'], dt: 0.35, kind: 'hit', level: 0.5 },
        { cue: ['pull', 'down'], dt: 0.85, kind: 'hit', level: 0.5 },
        { at: 21.15, kind: 'whoosh', level: 0.6 },
        { at: 21.3, kind: 'hit' },
        { cue: ['crack', 'crack'], dt: 0, kind: 'pop', level: 0.7 },
        { cue: ['body', 'body'], dt: 0, kind: 'pop', level: 0.7 },
        { at: 26.5, kind: 'whoosh', level: 0.6 },
        { cue: ['attack', 'grabs'], dt: -0.05, kind: 'grab' },
        { cue: ['fast', 'catches'], dt: -0.1, kind: 'grab' },
        { cue: ['fast', 'squashes'], dt: 0, kind: 'pop', level: 0.6 },
        { cue: ['slips', 'past'], dt: -0.2, kind: 'pop', level: 0.6 },
        { cue: ['slips', 'and'], dt: 0.05, kind: 'grab', level: 0.7 },
        { cue: ['slips', 'body'], dt: -0.1, kind: 'pop', level: 0.6 },
        { cue: ['punch', 'punch'], dt: -0.1, kind: 'pop' },
        { cue: ['release', 'lets'], dt: 0.05, kind: 'spring' },
        { cue: ['hold', 'arrives'], dt: -0.1, kind: 'pop', level: 0.6 },
        { cue: ['squashed', 'squashed'], dt: -0.3, kind: 'pop', level: 0.6 },
        { cue: ['fresh', 'fresh'], dt: -0.1, kind: 'pop', level: 0.6 },
        { at: 57.4, kind: 'swell', to: 59 },
        { at: 59, kind: 'crash' },
        { cue: ['rule-a', 'attack'], dt: -0.15, kind: 'pop', level: 0.7 },
        { cue: ['rule-r', 'release'], dt: -0.15, kind: 'pop', level: 0.7 },
        { at: 64.05, kind: 'pop' },
        { at: 67, kind: 'tick' },
        { at: 69.1, kind: 'whoosh' },
        { at: 69.45, kind: 'pop', level: 0.7 },
        { cue: ['cta', 'play'], dt: 0.05, kind: 'tick' },
        { at: 75, kind: 'button' },
    ],

    // Scenes in order; each runs until the next one starts.
    // view: what the stage draws (film.js).
    scenes: [
        { id: 'intro', at: 0, view: 'stage', teaches: 'Hook: same snare, same compressor.' },
        { id: 'ab', at: 3, view: 'stage', teaches: 'Hook: 1 ms, then 30 ms, heard back to back.' },
        { id: 'verdict', at: 7, view: 'stage', teaches: 'One is flat, one is punchy; only the attack knob moved.' },
        { id: 'inside', at: 11.55, view: 'inside', teaches: 'A compressor is a hand on a fader that pulls down above the threshold.' },
        { id: 'parts', at: 21.2, view: 'parts', teaches: 'A hit is a crack and a body.' },
        { id: 'attack', at: 26.5, view: 'rig', setting: 'FAST', mode: 'intro', teaches: 'Attack: how fast the hand grabs.' },
        { id: 'fast', at: 29.0, view: 'rig', setting: 'FAST', mode: 'slowmo', teaches: '1 ms catches the crack and squashes it.' },
        { id: 'demo-fast', at: 33, view: 'rig', setting: 'FAST', mode: 'live', demo: 'fast', teaches: 'Heard: 1 ms attack.' },
        { id: 'slow', at: 35, view: 'rig', setting: 'SLOW', mode: 'slowmo', teaches: '30 ms lets the crack past and turns the body down.' },
        { id: 'demo-slow', at: 43, view: 'rig', setting: 'SLOW', mode: 'live', demo: 'slow', teaches: 'Heard: 30 ms attack. Punch.' },
        { id: 'release', at: 45, view: 'rig', setting: 'SLOW', mode: 'letgo', teaches: 'Release: how fast the hand lets go.' },
        { id: 'hold', at: 47.2, view: 'rig', setting: 'HOLD', mode: 'groove', teaches: 'Too slow: still holding when the next hit arrives.' },
        { id: 'demo-hold', at: 53, view: 'rig', setting: 'HOLD', mode: 'live', demo: 'hold', teaches: 'Heard: 2.5 s release. Flat.' },
        { id: 'fresh', at: 55, view: 'rig', setting: 'TEMPO', mode: 'groove', teaches: 'In time: every hit starts fresh.' },
        { id: 'demo-tempo', at: 59, view: 'rig', setting: 'TEMPO', mode: 'live', demo: 'tempo', teaches: 'Heard: 90 ms release.' },
        { id: 'rule', at: 60.95, view: 'rule', teaches: 'Attack shapes the hit. Release shapes the groove.' },
        { id: 'replay', at: 63.95, view: 'stage', teaches: 'The hook again: now the viewer hears the crack.' },
        { id: 'end', at: 69.1, view: 'end', teaches: 'Where the lesson is, and who made it.' },
    ],
};
