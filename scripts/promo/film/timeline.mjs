// The whole film in one object: beats, words, compressor settings and
// camera. Audio (audio.mjs) and picture (film.js) both read it, so a change
// here moves sound and image together. Pure data, no imports.
//
// Idea: attack and release decide which part of every hit survives, so a
// compressor changes how a groove moves, not only how loud it is.
// Viewer outcome: "Slow attack keeps the snap, fast attack flattens it, and
// release decides whether the groove breathes."

export const TIMELINE = {
    bpm: 96,
    bars: 16,
    fps: 60,
    // Seconds per bar at 96 BPM: 4 beats x 0.625 s.
    get bar() {
        return (4 * 60) / this.bpm;
    },
    get duration() {
        return this.bars * this.bar;
    },
    lesson: {
        url: 'virzyguns.com/blog',
        path: 'Mixing & Mastering',
        slug: 'how-compression-changes-motion-not-level',
    },

    // One scene per idea. `bar` is 1-based and inclusive of `bars` bars.
    // view: what the stage shows.
    //   knob   the reference snare, plus a copy scaled down like a fader
    //   hit    the reference snare, frozen, for annotations
    //   live   the latest snare hit, drawn as it sounds
    //   bar    the whole current bar, drawn as it sounds
    //   cta    stage gone, call to action
    // comp: compressor on the drum bus for these bars (null = bypassed).
    scenes: [
        {
            id: 'question',
            bar: 1,
            bars: 1,
            teaches: 'The belief: a compressor is a volume knob.',
            view: 'knob',
            comp: null,
            text: [{ at: 0.15, lines: ['We treat compressors', 'like a volume knob.'] }],
        },
        {
            id: 'listen',
            bar: 2,
            bars: 1,
            teaches: 'Focus on one snare hit and its shape.',
            view: 'live',
            comp: null,
            text: [{ at: 0, lines: ['Listen to what one', 'does to a snare.'] }],
        },
        {
            id: 'crack-body',
            bar: 3,
            bars: 1,
            teaches: 'A hit has a short crack and a longer body.',
            view: 'hit',
            show: ['parts'],
            comp: null,
            text: [{ at: 0, lines: ['A hit has a crack', 'and a body.'] }],
        },
        {
            id: 'threshold',
            bar: 4,
            bars: 1,
            teaches: 'Only level above the threshold gets turned down.',
            view: 'hit',
            show: ['parts', 'threshold'],
            comp: null,
            text: [{ at: 0, lines: ['It only acts above', 'the threshold.'] }],
        },
        {
            id: 'attack',
            bar: 5,
            bars: 1,
            teaches: 'Attack is how fast gain reduction arrives.',
            view: 'hit',
            show: ['threshold', 'gr', 'attack'],
            comp: null,
            text: [{ at: 0, lines: ['Attack: how fast', 'it clamps down.'] }],
        },
        {
            id: 'release',
            bar: 6,
            bars: 1,
            teaches: 'Release is how fast it lets go.',
            view: 'hit',
            show: ['threshold', 'gr', 'release'],
            comp: null,
            text: [{ at: 0, lines: ['Release: how fast', 'it lets go.'] }],
        },
        {
            id: 'fast',
            bar: 7,
            bars: 2,
            teaches: 'A 1 ms attack clamps the crack.',
            view: 'live',
            show: ['threshold', 'gr', 'readout'],
            comp: { threshold: 0.28, ratio: 6, attack: 0.001, release: 0.06 },
            text: [
                { at: 0, lines: ['Fast attack, 1 ms.'] },
                { at: 1.25, lines: ['Fast attack, 1 ms.', 'The crack is clamped.'] },
            ],
        },
        {
            id: 'slow',
            bar: 9,
            bars: 3,
            teaches: 'A 30 ms attack lets the crack through and turns the body down.',
            view: 'live',
            show: ['threshold', 'gr', 'readout'],
            motif: true,
            comp: { threshold: 0.28, ratio: 6, attack: 0.03, release: 0.06 },
            text: [
                { at: 0, lines: ['Slow attack, 30 ms.'] },
                { at: 1.25, lines: ['Slow attack, 30 ms.', 'The crack gets through.'] },
                { at: 3.75, lines: ['Slow attack, 30 ms.', 'Only the body drops.'] },
            ],
        },
        {
            id: 'release-slow',
            bar: 12,
            bars: 2,
            teaches: 'Too slow a release never lets go, so the groove goes flat.',
            view: 'bar',
            show: ['threshold', 'gr', 'readout'],
            comp: { threshold: 0.28, ratio: 6, attack: 0.03, release: 2.5 },
            text: [
                { at: 0, lines: ['Now slow the release.'] },
                { at: 2.5, lines: ['Now slow the release.', 'It never lets go.'] },
            ],
        },
        {
            id: 'release-tempo',
            bar: 14,
            bars: 1,
            teaches: 'A release that recovers before the next hit lets the groove breathe.',
            view: 'bar',
            show: ['threshold', 'gr', 'readout'],
            comp: { threshold: 0.28, ratio: 6, attack: 0.03, release: 0.09 },
            text: [{ at: 0, lines: ['Release set to tempo.', 'Every hit starts fresh.'] }],
        },
        {
            id: 'payoff',
            bar: 15,
            bars: 1,
            teaches: 'The opening image, read correctly.',
            view: 'hit',
            show: ['threshold', 'after'],
            comp: { threshold: 0.28, ratio: 6, attack: 0.03, release: 0.09 },
            text: [{ at: 0, lines: ['Attack sets the crack.', 'Release sets the groove.'] }],
        },
        {
            id: 'cta',
            bar: 16,
            bars: 1,
            teaches: 'Where the full lesson is.',
            view: 'cta',
            motif: true,
            comp: { threshold: 0.28, ratio: 6, attack: 0.03, release: 0.09 },
            text: [{ at: 0, lines: ['Full lesson and demo:', 'free, no sign-up.'] }],
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
