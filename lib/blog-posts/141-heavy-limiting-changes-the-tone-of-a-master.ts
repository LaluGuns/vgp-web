import { BlogArticle } from '../blog-data';

type Pt = [number, number];

/**
 * The broadband gain of a peak limiter with instant attack and a one-pole release on the
 * gain reduction in dB (the smoothing model in Giannoulis, Massberg and Reiss, 2012), run
 * at 48 kHz on the level envelope of a kick every 500 ms (120 BPM) with an 80 ms decay.
 * The detector reads the envelope, as a look-ahead limiter would see each peak coming.
 * The ceiling sits 6 dB under the kick's peak and the release is 50 ms. One second shown,
 * after one second of pre-roll.
 */
const FS = 48000;
const RELEASE = Math.exp(-1 / (0.05 * FS));
/** One sample of the limiter: the new gain reduction in dB for this detector level. */
const nextGr = (gr: number, level: number, ceiling: number) => {
    const target = Math.max(0, 20 * Math.log10(Math.max(1e-9, level) / ceiling));
    return target > gr ? target : RELEASE * gr + (1 - RELEASE) * target;
};
/** A hit every `every` seconds from `at`, decaying exponentially; or a steady level. */
const hits = (level: number, at: number, every: number, decay: number) => (t: number) => level * Math.exp(-((((t - at) % every) + every) % every) / decay);
const steady = (level: number) => () => level;

const KICK_LEVEL = 0.9;
const CEILING = KICK_LEVEL * 10 ** (-6 / 20);
const kickEnv = hits(KICK_LEVEL, 0.02, 0.5, 0.08);

function limiterGain(points: number): Pt[] {
    const every = FS / points;
    const out: Pt[] = [];
    let gr = 0;
    for (let i = -FS; i <= FS; i++) {
        gr = nextGr(gr, kickEnv((i + FS) / FS), CEILING);
        if (i >= 0 && i % every === 0) out.push([i / FS, 10 ** (-gr / 20)]);
    }
    return out;
}

const GAIN = limiterGain(400);
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const HIGHS = 0.3;

/**
 * The bars and the numbers in the text come from the same limiter. Each part of a loop is a
 * level envelope in the low or the high band. As in Figure 1, the detector reads the loudest
 * part at each moment and the ceiling sits `grDb` under the biggest peak. A band's loss is
 * 10 log10 of the sum of g^2 x^2 over the sum of x^2 (the formula in the text), over one
 * second (both loops repeat every second) after one second of pre-roll.
 */
type Part = { band: 0 | 1; env: (t: number) => number };
function bandLoss(parts: Part[], peak: number, grDb: number) {
    const ceiling = peak * 10 ** (-grDb / 20);
    const num = [0, 0];
    const den = [0, 0];
    const x = new Float64Array(parts.length);
    let gr = 0;
    for (let i = -FS; i < FS; i++) {
        const t = (i + FS) / FS;
        let level = 0;
        for (let k = 0; k < parts.length; k++) {
            x[k] = parts[k].env(t);
            level = Math.max(level, x[k]);
        }
        gr = nextGr(gr, level, ceiling);
        if (i < 0) continue;
        const g2 = 10 ** (-gr / 10);
        for (let k = 0; k < parts.length; k++) {
            num[parts[k].band] += g2 * x[k] * x[k];
            den[parts[k].band] += x[k] * x[k];
        }
    }
    const loss = (b: number) => -10 * Math.log10(num[b] / den[b]);
    return { lows: loss(0), highs: loss(1), tilt: loss(0) - loss(1) };
}

// Loop 1 is Figure 1: the kick makes the peaks over steady highs.
const KICK_LOOP: Part[] = [
    { band: 0, env: kickEnv },
    { band: 1, env: steady(HIGHS) },
];
// Loop 2: a bright snare on 2 and 4 makes the peaks over a softer kick on 1 and 3 and a sustained bass.
const SNARE_LOOP: Part[] = [
    { band: 0, env: hits(0.4, 0.02, 1, 0.08) },
    { band: 0, env: steady(0.3) },
    { band: 1, env: hits(KICK_LEVEL, 0.52, 1, 0.08) },
];
const KICK2 = bandLoss(KICK_LOOP, KICK_LEVEL, 2);
const KICK4 = bandLoss(KICK_LOOP, KICK_LEVEL, 4);
const KICK6 = bandLoss(KICK_LOOP, KICK_LEVEL, 6);
const KICK8 = bandLoss(KICK_LOOP, KICK_LEVEL, 8);
const SNARE6 = bandLoss(SNARE_LOOP, KICK_LEVEL, 6);
/** One decimal, as the text and the bars show it. */
const f1 = (v: number) => v.toFixed(1);
const r1 = (v: number) => Math.round(v * 10) / 10;

export const post141: BlogArticle = {
    slug: 'heavy-limiting-changes-the-tone-of-a-master',
    title: 'Heavy limiting changes the tone of a master',
    excerpt: 'A broadband limiter turns down moments, not frequencies. Whatever makes the peaks loses the most level, so the tonal balance shifts as you push it.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'A broadband limiter lowers the level of whole moments, so the part of the spectrum whose energy sits in those moments loses level against the rest, and the tone shifts.',
        'Find out what drives the limiter by cutting the lows or the highs 2 dB before it and watching which cut lowers the gain reduction more.',
        'Control the peaks that drive the limiter earlier in the chain, and never judge the tone of a limited master without matching its loudness first.',
    ],
    figures: {
        ducking: {
            type: 'signal',
            caption:
                'A simulated limiter taking 6 dB off each kick with a 50 ms release. The kick loses its peak, and the steady highs, which never came near the ceiling, dip on every kick as well because the gain is shared.',
            alt: 'Two level plots over two kicks, the input in grey. In the first, each kick spike is cut down and recovers. In the second, a flat line for the high band dips under each kick and climbs back before the next.',
            rows: [
                {
                    label: 'Low band: kick',
                    unipolar: true,
                    lines: [{ y: r3(CEILING), label: 'Ceiling' }],
                    traces: [
                        { kind: 'envelope', points: GAIN.map(([t]) => [t, r3(kickEnv(t))] as Pt), muted: true, label: 'In' },
                        { kind: 'envelope', points: GAIN.map(([t, g]) => [t, r3(kickEnv(t) * g)] as Pt), label: 'Out' },
                    ],
                },
                {
                    label: 'High band: hats and air',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: [[0, HIGHS], [1, HIGHS]], muted: true, label: 'In' },
                        { kind: 'envelope', points: GAIN.map(([t, g]) => [t, r3(HIGHS * g)] as Pt), label: 'Out' },
                    ],
                },
            ],
        },
        bands: {
            type: 'bars',
            caption:
                `Level each band loses, averaged over a loop, computed with the limiter from Figure 1 taking 6 dB off the biggest peaks. When the kick makes the peaks, the lows lose ${f1(KICK6.lows)} dB and the steady highs ${f1(KICK6.highs)} dB, so the master tilts ${f1(KICK6.tilt)} dB brighter. When a bright snare makes the peaks, the highs lose ${f1(SNARE6.highs)} dB, the lows ${f1(SNARE6.lows)} dB, and the master tilts ${f1(-SNARE6.tilt)} dB darker.`,
            alt: `Four horizontal bars on a scale from 0 to 6 dB. Kick drives: lows ${f1(KICK6.lows)} dB, highs ${f1(KICK6.highs)} dB. Snare drives: lows ${f1(SNARE6.lows)} dB, highs ${f1(SNARE6.highs)} dB.`,
            min: 0,
            max: 6,
            unit: 'dB',
            bars: [
                { label: 'Kick drives: lows', value: r1(KICK6.lows) },
                { label: 'Kick drives: highs', value: r1(KICK6.highs), dim: true },
                { label: 'Snare drives: lows', value: r1(SNARE6.lows), dim: true },
                { label: 'Snare drives: highs', value: r1(SNARE6.highs) },
            ],
        },
    },
    quiz: [
        {
            q: `In a loop, the kick makes the peaks and the limiter takes ${f1(KICK6.lows)} dB of average level off the lows and ${f1(KICK6.highs)} dB off the highs. After makeup gain, how has the balance moved?`,
            options: [
                'It has not moved, because makeup gain restores it',
                `The highs sit about ${f1(KICK6.tilt)} dB higher against the lows`,
                `The lows sit about ${f1(KICK6.tilt)} dB higher against the highs`,
                `Both bands are ${f1(KICK6.lows + KICK6.highs)} dB quieter than they were before`,
            ],
            answer: 1,
            why: `Makeup gain raises both bands by the same amount, so it cannot undo the difference. The highs lost ${f1(KICK6.tilt)} dB less than the lows, so the master leans ${f1(KICK6.tilt)} dB toward the top.`,
        },
        {
            q: 'You cut 2 dB below 100 Hz before the limiter and its gain reduction drops by almost 2 dB. What does that tell you?',
            options: [
                'The limiter release is too slow for the tempo',
                'The master has inter-sample peaks above the ceiling',
                'The low end is making the peaks the limiter reacts to',
                'The high end is being turned down more than the low end',
            ],
            answer: 2,
            why: 'If lowering the lows lowers the peaks by about as much, the peaks are mostly low-frequency energy, so the low end decides when the limiter turns everything down.',
        },
        {
            q: 'The limited master sounds thin, so you boost the low shelf 2 dB in front of the limiter. Why can this make things worse?',
            options: [
                'The limiter gets more of what triggers it and turns down harder',
                'A low shelf adds latency that throws off the look-ahead',
                'Shelving filters add inter-sample peaks only in the highs',
                'Boosting before a limiter switches off its true-peak mode',
            ],
            answer: 0,
            why: 'When the low end drives the limiter, more low end means more gain reduction on every kick, which ducks the rest of the mix harder and takes the extra lows back off the peaks.',
        },
    ],
    content: `## Hook: the master that got thinner on its own

You push the limiter for the last few decibels, match the loudness and compare. The limited version has less weight in the kick and the bass, and the hats and the vocal's sibilance seem further forward. On the next song the same move does the opposite and the top end goes dull. You never touched an EQ.

So what changed the tone? A broadband limiter applies one gain to the whole mix at each moment, and which moments it turns down depends on which part of the spectrum makes the peaks.

## Why it matters: tone moves with the drive

If you hear the thinner low end and reach for a low shelf, you can start a loop. When the low end is what drives the limiter, more low end in front of it means more gain reduction on every kick, and the extra lows come straight back off the peaks. Put the boost after the limiter instead and you raise peaks above the ceiling you set.

Knowing what drives the limiter tells you where the fix belongs. It also explains why a master can sound balanced at 2 dB of gain reduction and lopsided at 6.

::figure ducking

## Science model: one gain, shared by every frequency

A limiter measures the peak level of the full signal, computes the reduction needed to keep it under the ceiling, and smooths that gain over time (Zölzer, 2011; Giannoulis, Massberg and Reiss, 2012). At any instant every frequency gets the same gain, so a single moment keeps its spectral balance. What changes is the balance over time, because the parts of the mix do not have their energy in the same moments.

For one band $b$ of the mix, with signal $x_b$ and limiter gain $g$, the change in its average level is the gain weighted by when that band has its energy:

$$\\Delta L_b = 10 \\log_{10} \\frac{\\sum_t g(t)^2 \\, x_b(t)^2}{\\sum_t x_b(t)^2}$$

A band whose energy sits in the moments the limiter turns down loses the most. A band whose energy is spread evenly loses roughly the average gain reduction, which can be much smaller. Makeup gain raises every band by the same amount, so it cannot undo the difference between them.

I ran that calculation on two loops through the limiter in the first figure (instant attack, 50 ms release), pushed until the biggest peaks lost 6 dB. In the first, a kick on every beat at 120 BPM made the peaks over steady high-frequency noise standing in for hats and air. The lows lost ${f1(KICK6.lows)} dB of average level and the highs ${f1(KICK6.highs)} dB, a tilt of ${f1(KICK6.tilt)} dB toward the top. The tilt grew with the drive: ${f1(KICK2.tilt)} dB at 2 dB of reduction, ${f1(KICK4.tilt)} dB at 4 and ${f1(KICK8.tilt)} dB at 8. In the second loop a bright snare on beats 2 and 4 made the peaks over a softer kick on 1 and 3 and a sustained bass. The highs lost ${f1(SNARE6.highs)} dB and the lows ${f1(SNARE6.lows)} dB, so the master went ${f1(-SNARE6.tilt)} dB darker. When I replaced the first loop's steady highs with short bursts that start on each kick, the tilt shrank, because the highs then lost level in the same moments as the kick.

::figure bands

Those figures depend on the levels I chose for each part, and real limiters use look-ahead and gentler gain curves, so your numbers will differ. The direction follows the same rule: the part of the spectrum that makes the peaks loses the most level. A fast release adds a second effect, harmonics from the gain moving within each bass cycle, which brightens the low end in a rougher way, as the [lesson on limiter release](/blog/limiter-release-reaches-into-the-groove) explains.

Push the drive and listen to the tone rather than the level, since the demo keeps the loudness matched.

::demo limiter

## DAW experiment: find the trigger, then move it

1. Loop the loudest chorus. On the master put a flat EQ, then the limiter with a -1 dBTP ceiling, then a gain plugin and a loudness meter showing short-term LUFS.
2. Drive the limiter to about 6 dB of gain reduction on the biggest hits. Use the gain plugin to match the short-term reading of the bypassed chain, then compare limited and bypassed and write down what moved: weight, brightness, vocal level.
3. On the EQ, cut a low shelf by 2 dB below 100 Hz and watch the gain reduction. Reset it, then cut a high shelf by 2 dB above 5 kHz and watch again.
4. Whichever cut lowers the gain reduction more points to the part of the spectrum that drives the limiter. Reset the EQ to flat.
5. Control that part earlier. For a kick or bass, use clip gain on the loudest hits, a clipper on the drum bus, or a high-pass on sub energy below what the song needs. For a snare or cymbal, tame its peaks in the mix.
6. Drive the limiter again to the same short-term loudness as step 2 and compare both limited versions with the bypassed mix at matched loudness.

If those peaks were the trigger, the version where they were controlled first needs less gain reduction for the same loudness and stays closer to the tonal balance of the unlimited mix. If it does not, look elsewhere in the chain for the tone change.

## Common mistake: EQ-ing the limiter's side effect

Correcting the limiter's tone with more EQ on the master usually makes it worse. A low boost in front of a kick-driven limiter feeds the trigger. A high cut to tame the brighter top makes the master duller during the parts where the limiter is not working. Fix what drives the limiter, and the tone mostly stops moving.

The second mistake is judging tone at different levels. Turned up, a master seems to have more bass, because the ear's equal-loudness contours flatten as level rises (ISO, 2023). A limited master compared louder than the original will seem fuller than it is. Match the loudness first; the [lesson on monitoring level](/blog/monitoring-level-changes-the-balance-you-hear) covers how much level shifts the balance you hear.

## Producer takeaway: watch what the limiter is listening to

Treat the final limiter as part of your tone controls. Before you push it, find out which part of the mix makes the peaks, and give that part its own peak control in the mix or on its bus. Then drive the limiter only as far as the tonal balance holds at matched loudness. I would rather lose half a decibel of loudness than spend it on a master that tilts every time the kick hits.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- International Organization for Standardization. (2023). *ISO 226:2023 Acoustics: Normal equal-loudness-level contours*. ISO.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Heavy limiting changes the tone of a master | VGP Studio',
        description: 'A broadband limiter turns down moments, not frequencies, so whatever makes the peaks loses level. How to find the trigger and keep the tone while limiting.',
        keywords: ['limiting changes tone', 'mastering limiter', 'limiter low end', 'broadband limiter', 'tonal balance mastering', 'limiter gain reduction'],
    },
};
