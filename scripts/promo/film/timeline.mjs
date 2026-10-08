// The whole film in one object: beats, words, compressor settings and
// camera. Audio (audio.mjs) and picture (film.js) both read it, so a change
// here moves sound and image together. Pure data, no imports.
//
// Idea: attack and release decide which part of every hit survives, so a
// compressor changes how a groove moves, not only how loud it is.
// Viewer outcome: "Slow attack keeps the snap, fast attack flattens it, and
// release decides whether the groove breathes."
// Hook: the same compressor on the same snare, heard twice, before any
// explanation.

const FAST = { threshold: 0.28, ratio: 6, attack: 0.001, release: 0.06 };
const SLOW = { threshold: 0.28, ratio: 6, attack: 0.03, release: 0.06 };
const HOLD = { threshold: 0.28, ratio: 6, attack: 0.03, release: 2.5 };
const TEMPO = { threshold: 0.28, ratio: 6, attack: 0.03, release: 0.09 };

export const TIMELINE = {
    bpm: 120,
    bars: 16,
    fps: 60,
    // Seconds per bar at 120 BPM: 4 beats x 0.5 s.
    get bar() {
        return (4 * 60) / this.bpm;
    },
    get duration() {
        return this.bars * this.bar;
    },
    lesson: {
        url: 'virzyguns.com/blog',
        path: 'Mixing & Mastering',
        title: 'Compression changes motion before level',
        tagline: '100% Art. 100% Science.',
    },
    settings: { FAST, SLOW },

    // One scene per idea. `bar` is 1-based; a scene lasts `bars` bars.
    // view: what the stage shows.
    //   split  two lanes, fast and slow attack, the playing one lit
    //   knob   one hit and a copy turned down like a fader
    //   hit    one hit, frozen, for annotations
    //   live   the latest snare, drawn as it sounds
    //   bar    the whole bar, drawn as it sounds
    //   end    the end card
    // comp: compressor on the drum bus for these bars (null = bypassed).
    // bed: whether the pad and bass play. riser: a sweep into this scene.
    // Text: `at` in seconds from the scene start; `key` is the word drawn in
    // the accent, the one thing to look at.
    scenes: [
        {
            id: 'hook-fast',
            bar: 1,
            bars: 1,
            teaches: 'Hook, part one: a 1 ms attack on a snare.',
            view: 'split',
            lit: 'fast',
            comp: FAST,
            bed: false,
            text: [{ at: 0, lines: ['Same compressor.'] }],
        },
        {
            id: 'hook-slow',
            bar: 2,
            bars: 1,
            teaches: 'Hook, part two: the same snare at 30 ms. It sounds bigger.',
            view: 'split',
            lit: 'slow',
            comp: SLOW,
            bed: false,
            text: [{ at: 0, lines: ['Same compressor.', 'Two different snares.'], key: 'different' }],
        },
        {
            id: 'myth',
            bar: 3,
            bars: 1,
            teaches: 'The belief: a compressor is a volume knob.',
            view: 'knob',
            comp: null,
            bed: true,
            text: [{ at: 0, lines: ['We treat it like', 'a volume knob.'], key: 'volume' }],
        },
        {
            id: 'shape',
            bar: 4,
            bars: 1,
            teaches: 'It changes the shape of a hit: crack and body.',
            view: 'hit',
            show: ['parts'],
            comp: null,
            bed: true,
            text: [{ at: 0, lines: ['It reshapes the hit:', 'a crack and a body.'], key: 'reshapes' }],
        },
        {
            id: 'threshold',
            bar: 5,
            bars: 1,
            teaches: 'Only level above the threshold gets turned down.',
            view: 'hit',
            show: ['threshold'],
            comp: null,
            bed: true,
            text: [{ at: 0, lines: ['Above the threshold,', 'it starts pulling down.'], key: 'threshold' }],
        },
        {
            id: 'attack',
            bar: 6,
            bars: 1,
            teaches: 'Attack is how fast gain reduction arrives.',
            view: 'hit',
            show: ['threshold', 'gr', 'attack'],
            comp: SLOW,
            bed: true,
            text: [{ at: 0, lines: ['Attack: how fast', 'it grabs.'], key: 'Attack' }],
        },
        {
            id: 'release',
            bar: 7,
            bars: 1,
            teaches: 'Release is how fast it lets go.',
            view: 'hit',
            show: ['threshold', 'gr', 'release'],
            comp: SLOW,
            bed: true,
            text: [{ at: 0, lines: ['Release: how fast', 'it lets go.'], key: 'Release' }],
        },
        {
            id: 'fast',
            bar: 8,
            bars: 2,
            teaches: 'A 1 ms attack clamps the crack.',
            view: 'live',
            show: ['threshold', 'gr', 'readout'],
            comp: FAST,
            bed: true,
            text: [
                { at: 0, lines: ['1 ms attack.'], key: '1 ms' },
                { at: 1, lines: ['1 ms attack.', 'The crack gets clamped.'], key: 'clamped' },
            ],
        },
        {
            id: 'slow',
            bar: 10,
            bars: 2,
            teaches: 'A 30 ms attack lets the crack through and turns the body down.',
            view: 'live',
            show: ['threshold', 'gr', 'readout'],
            comp: SLOW,
            bed: true,
            riser: true,
            motif: true,
            text: [
                { at: 0, lines: ['30 ms attack.'], key: '30 ms' },
                { at: 1, lines: ['30 ms attack.', 'The crack gets through.'], key: 'through' },
                { at: 2.5, lines: ['30 ms attack.', 'Only the body drops.'], key: 'body' },
            ],
        },
        {
            id: 'release-slow',
            bar: 12,
            bars: 2,
            teaches: 'Too slow a release never lets go, so the groove goes flat.',
            view: 'bar',
            show: ['threshold', 'gr', 'readout'],
            comp: HOLD,
            bed: true,
            text: [
                { at: 0, lines: ['Release too slow.'], key: 'slow' },
                { at: 1, lines: ['Release too slow.', 'The groove goes flat.'], key: 'flat' },
            ],
        },
        {
            id: 'release-tempo',
            bar: 14,
            bars: 1,
            teaches: 'A release that recovers before the next hit lets the groove breathe.',
            view: 'bar',
            show: ['threshold', 'gr', 'readout'],
            comp: TEMPO,
            bed: true,
            text: [{ at: 0, lines: ['Release back to 90 ms.', 'Every hit breathes.'], key: 'breathes' }],
        },
        {
            id: 'payoff',
            bar: 15,
            bars: 1,
            teaches: 'The rule, on the groove it just fixed.',
            view: 'bar',
            show: ['threshold', 'gr'],
            comp: TEMPO,
            bed: true,
            text: [{ at: 0, lines: ['Attack shapes the hit.', 'Release shapes the groove.'], key: 'shapes' }],
        },
        {
            id: 'end',
            bar: 16,
            bars: 1,
            teaches: 'Who made it and where the full lesson is.',
            view: 'end',
            comp: TEMPO,
            bed: true,
            motif: true,
            impact: true,
            text: [{ at: 0, lines: ['Free lesson + demo'] }],
        },
    ],
};

/** Scene playing at time t (seconds). */
export function sceneAt(t) {
    const bar = Math.floor(t / TIMELINE.bar) + 1;
    return TIMELINE.scenes.find((s) => bar >= s.bar && bar < s.bar + s.bars) ?? TIMELINE.scenes[TIMELINE.scenes.length - 1];
}

export const sceneStart = (s) => (s.bar - 1) * TIMELINE.bar;
export const sceneEnd = (s) => (s.bar - 1 + s.bars) * TIMELINE.bar;
