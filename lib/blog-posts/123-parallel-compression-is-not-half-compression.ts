import { BlogArticle } from '../blog-data';

// Two drum hits. The copy runs through 10:1 with an instant attack, a threshold 20 dB under the peak
// (0.055 against 0.55) and a makeup gain of 3, about 9.5 dB.
const HITS = { kind: 'hits' as const, at: [0.04, 0.54], amp: [0.55, 0.55], decay: 7, outline: true };
const CRUSH = { threshold: 0.055, ratio: 10, attack: 0, release: 0.06 };
const MAKEUP = 3;

// Dry plus compressed copy, computed with the same feed-forward model the figure renderer uses for `compress`.
function blendEnvelope(): [number, number][] {
    const n = 2000;
    const level = (t: number) => HITS.at.reduce((sum, at, i) => (t < at ? sum : sum + HITS.amp[i] * Math.exp(-HITS.decay * (t - at))), 0);
    const toDb = (v: number) => 20 * Math.log10(Math.max(1e-5, v));
    const release = Math.exp(-1 / (CRUSH.release * n));
    const points: [number, number][] = [];
    let gr = 0;
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const over = toDb(level(t)) - toDb(CRUSH.threshold);
        const target = over > 0 ? over * (1 - 1 / CRUSH.ratio) : 0;
        // Instant attack: the gain reduction jumps up to its target and recovers with the release.
        gr = target > gr ? target : release * gr + (1 - release) * target;
        if (i % 4 === 0) points.push([t, level(t) * (1 + MAKEUP * 10 ** (-gr / 20))]);
    }
    return points;
}

export const post123: BlogArticle = {
    slug: 'parallel-compression-is-not-half-compression',
    title: 'Parallel compression turns the quiet parts up',
    excerpt: 'Blending a crushed copy under the dry track raises the quiet detail and leaves the peaks almost where they were. The maths of the sum, and how to check it.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'A heavily compressed copy blended under the dry track lifts everything below its threshold and barely moves the loud peaks, so leave peak control to clip gain or an ordinary compressor.',
        'Set the blend with the full mix playing, then compare it with the dry track at matched loudness, because the blend is always louder.',
        'Before you trust the blend, flip the copy\'s polarity with the compressor idle and listen for near silence: anything left means the paths do not line up.',
    ],
    figures: {
        hits: {
            type: 'signal',
            caption:
                'Two drum hits, simulated. The copy (10:1, instant attack, threshold 20 dB under the peak, about 9.5 dB of makeup gain) flattens each hit, so its body decays far more slowly than the dry hit. Added to the dry track, the first peak rises about 3 dB, while the tail just before the second hit rises about 12 dB.',
            alt: 'Three level plots of the same two drum hits. The dry row shows two sharp peaks that decay quickly. The compressed copy shows low, flat-topped hits that decay slowly. The blend row shows peaks only a little higher than the grey dry outline, with a much higher tail between the hits.',
            rows: [
                { label: 'Dry', unipolar: true, traces: [HITS] },
                { label: 'Compressed copy', unipolar: true, traces: [{ ...HITS, compress: CRUSH, gain: MAKEUP }] },
                {
                    label: 'Blend',
                    unipolar: true,
                    traces: [
                        { ...HITS, muted: true, label: 'Dry' },
                        { kind: 'envelope', points: blendEnvelope(), label: 'Dry + copy' },
                    ],
                },
            ],
        },
        gain: {
            type: 'bars',
            caption:
                'How much louder the blend is than the dry track, from the static maths: a 10:1 copy with a -30 dB threshold, no makeup gain, its fader level with the dry path. Everything up to the threshold gains 6 dB. A peak at 0 dB gains 0.4 dB.',
            alt: 'Six horizontal bars, one per input level. Inputs of -40 and -30 dB gain 6.0 dB. Above the threshold the gain shrinks: 4.1 dB at -25, 2.6 dB at -20, 1.0 dB at -10 and 0.4 dB at 0 dB.',
            min: 0,
            max: 7,
            unit: 'dB',
            bars: [
                { label: 'Input -40 dB', value: 6.02, display: '+6.0 dB' },
                { label: 'Input -30 dB', value: 6.02, display: '+6.0 dB' },
                { label: 'Input -25 dB', value: 4.06, display: '+4.1 dB' },
                { label: 'Input -20 dB', value: 2.64, display: '+2.6 dB' },
                { label: 'Input -10 dB', value: 1.03, display: '+1.0 dB' },
                { label: 'Input 0 dB', value: 0.38, display: '+0.4 dB' },
            ],
        },
        comb: {
            type: 'spectrum',
            mode: 'gain',
            range: [100, 10000],
            caption:
                'Both paths at equal level, as on a quiet passage. Lined up, the blend is a flat 6 dB louder than the dry track. With the copy 1 ms late it cancels at 500 Hz, 1.5 kHz, 2.5 kHz and every 1 kHz above, and reaches the lined-up level only at 1, 2, 3 kHz and so on.',
            alt: 'Gain over frequency from 100 Hz to 10 kHz. A dashed line sits flat at +6 dB. A solid curve touches it at every multiple of 1 kHz and falls into deep notches halfway between, starting at 500 Hz.',
            marks: [{ f: 500, label: '500 Hz' }],
            curves: [
                { kind: 'slope', dbPerOct: 0, level: 6, label: 'Lined up', dashed: true },
                { kind: 'comb', delayMs: 1, mix: 1, label: 'Copy 1 ms late' },
            ],
        },
    },
    quiz: [
        {
            q: 'Below the threshold, the compressed copy plays at exactly the same level as the dry track. How much louder is the blend there?',
            options: ['3 dB', '6 dB', '10 dB', '0 dB'],
            answer: 1,
            why: 'Below the threshold the two paths are identical, and two identical in-phase signals double the amplitude: 20 × log10(2) is about 6 dB.',
        },
        {
            q: 'On the loudest hit, the compressed copy sits 20 dB under the dry track. Roughly how much does the blend raise that hit?',
            options: ['Under 1 dB', 'About 3 dB', 'About 6 dB', 'About 10 dB'],
            answer: 0,
            why: 'A copy 20 dB down has a tenth of the amplitude, so the sum is 1.1 times the dry hit: 20 × log10(1.1) is about 0.8 dB.',
        },
        {
            q: 'When you fade in the parallel copy, the drums get thinner instead of fuller. What do you check first?',
            options: [
                'Whether the copy\'s ratio is high enough',
                'Whether the copy\'s release fits the tempo',
                'Whether the copy is late or flipped in polarity',
                'Whether the copy\'s attack is fast enough',
            ],
            answer: 2,
            why: 'Two aligned copies of the same signal can only add. A sum that loses body means part of the copy is cancelling the dry path, which takes a delay, a phase shift or a polarity flip.',
        },
    ],
    content: `## Hook: the blend that sounded huge

You crush a copy of the drum bus until the meter shows 20 dB of gain reduction and fade it in under the dry drums. The room fills in, the ghost notes appear and the kit sounds twice the size. Somewhere along the way you started treating the blend fader as a percentage: halfway up means half the compression.

Summing a dry path and a compressed path builds a level response of its own, and that response mostly turns the quiet parts up. A 10:1 copy blended in at equal level behaves nothing like a 5:1 compressor.

## Why it matters: two paths, one sum

One path carries the drums untouched. The other carries the same drums through a compressor set hard: fast attack, high ratio, low threshold. The two meet on a bus and add, sample by sample.

On a loud hit, the compressor has pulled the copy far down, so the dry path supplies most of the peak. In the quieter stretch after the hit, the compressor recovers and the copy plays with its full makeup gain, often louder than the dry tail. Added together, the hit keeps most of its height while the decay, the room and the ghost notes come up by several dB.

::figure hits

Listen for two things in the demo as you raise the blend: the space between the hits and the front edge of each hit. The first should change a lot, the second very little.

::demo parallel

## Science model: adding two levels that move differently

Call the dry level $L_d$ and the copy's level $L_w$, both in decibels. When the two paths carry the same waveform and line up in time, they add in amplitude:

$$L_{\\text{blend}} = 20\\log_{10}\\left(10^{L_d/20} + 10^{L_w/20}\\right)$$

Take a copy compressed at 10:1 from a -30 dB threshold, with no makeup gain and its fader level with the dry track. Below the threshold the two paths are identical, and two identical signals double the amplitude, so the blend is $20\\log_{10}2 \\approx 6$ dB louder than the dry track. Above the threshold the copy falls behind. With a hard knee, a -20 dB input leaves the compressor at -29 dB (Giannoulis, Massberg and Reiss, 2012), 9 dB under the dry path, and the blend adds only 2.6 dB. A peak at 0 dB leaves it at -27 dB, and the blend adds 0.4 dB.

::figure gain

The "half compression" idea fails this test. A detail at the threshold and a peak at 0 dB are 30 dB apart in the dry track and 24.4 dB apart in the blend. A single 5:1 compressor with the same threshold would squeeze that gap to 6 dB. Right at the threshold, where the blend works hardest, its slope is $(1 + 1/10)/2 = 0.55$, about 1.8:1, and it drifts back toward 1:1 as the input rises. Katz (2002) describes parallel compression as upward compression: the soft passages come up toward the loud ones while the peaks stay put. On real drums, attack and release reshape this static picture, as the [lesson on compression and motion](/blog/how-compression-changes-motion-not-level) shows.

The sum only works this way when the paths line up. If the copy arrives late by a time $\\tau$, the bus becomes a comb filter (Zölzer, 2011). The paths cancel wherever the delay is an odd number of half periods, at

$$f_{\\text{notch}} = \\frac{2k+1}{2\\tau}, \\quad k = 0, 1, 2, \\ldots$$

A 1 ms delay, which is 48 samples at 48 kHz, puts notches at 500 Hz, 1.5 kHz, 2.5 kHz and every 1 kHz above. On quiet passages, where both paths play at the same level, those notches are deep. On loud hits the copy is quieter, so the notches are shallower, and their depth changes as the compressor works.

::figure comb

Most DAWs compensate plugin latency automatically, so a plain software chain usually lines up. The trouble comes where that compensation does not reach: outboard gear patched in without a measured round trip, a plugin that reports the wrong latency, or a low-latency recording mode that bypasses or stops compensating some plugins. An EQ on the copy does a milder version of the same thing: a high-pass shifts the copy's phase around its corner, so the sum can thin out there, as the [lesson on filters](/blog/filters-are-shape-machines) explains.

## DAW experiment: build the blend, then check it

1. Duplicate a drum loop or your drum bus onto a second track, or send it to an aux at unity gain. Route both paths to the same bus, with their faders at the same level.
2. Insert a compressor on the copy with its threshold above the loudest peak and no makeup gain, so it does nothing, followed by a utility plugin with the polarity flipped. Play the loop. You should hear near silence. If a thin, hollow sound is left, the copy is late or the compressor changes its tone even when idle. Fix any delay before you go on.
3. Set the polarity back to normal. Set the compressor to 10:1 or higher with its fastest attack, and pull the threshold down until the hits show 15 dB or more of gain reduction. Solo the copy once: it should sound flat and squashed.
4. Unsolo it, pull the copy's fader all the way down, then raise it slowly with the full mix playing. Stop when the room and the ghost notes come forward, before the hits start to feel soft.
5. Put a loudness meter on the bus and read the short-term loudness with the copy muted and unmuted. Use a gain plugin on the bus to take the difference off the blended version, then switch between the two.
6. Change only the copy's release, from fast to slow. A fast release lets the gaps between hits swell; a slow one keeps the copy down for longer, so the gaps lift less.
7. For contrast, mute the copy and put the same compressor on the dry path at 5:1, with the threshold set for about 6 dB of reduction on the hits. Match the loudness again and compare the front edge of each hit with the blend.

At matched loudness the blend usually keeps the snap of the hits and adds weight between them, while the single compressor trades some snap for control of the peaks. Which one the song needs is your call.

## Common mistake: asking the blend to control peaks

The first mistake is reaching for parallel compression when the problem is a peak. A snare hit that jumps out over the others needs gain reduction on that hit, from clip gain or an ordinary compressor (the [lesson on clip gain](/blog/clip-gain-and-automation-before-compression) shows how). The blend leaves that hit almost where it was and raises everything around it.

The second mistake is judging the blend without matching its level. Every blend is louder than the dry track, 6 dB on quiet passages with the copy at equal level and more with makeup gain, so an over-blended version can win the A/B right up to the moment you take the extra level off. The [lesson on loudness bias](/blog/why-louder-is-not-always-bigger) covers why.

## Producer takeaway: set the crush, then the blend

Use parallel compression to bring the quiet parts of a sound up toward its peaks. Set the copy hard enough that it sounds wrong in solo, set the blend with the whole mix playing and judge it at matched loudness. When I want the hits themselves smaller, I compress the dry path. When I want more of what happens between the hits, I use the blend. Run the polarity check again whenever outboard gear or a new plugin goes on the copy.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Katz, B. (2002). *Mastering Audio: The Art and the Science*. Focal Press.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Parallel compression turns the quiet parts up | VGP Studio',
        description: 'Parallel compression lifts quiet detail and barely moves the peaks. The maths of the blend, why 50% is not half compression, and a latency check.',
        keywords: ['parallel compression', 'upward compression', 'New York compression', 'drum bus compression', 'comb filtering', 'plugin latency'],
    },
};
