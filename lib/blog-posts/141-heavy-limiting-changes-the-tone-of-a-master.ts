import { BlogArticle } from '../blog-data';

type Pt = [number, number];

/**
 * The broadband gain of a peak limiter with instant attack and a one-pole release on the
 * gain reduction in dB (the smoothing model in Giannoulis, Massberg and Reiss, 2012), run
 * at 48 kHz on a kick: a 55 Hz sine burst every 500 ms (120 BPM) with an 80 ms decay.
 * The ceiling sits 6 dB under the kick's peak and the release is 50 ms. One second shown,
 * after one second of pre-roll.
 */
const KICK_LEVEL = 0.9;
const phase = (t: number) => (((t - 0.02) % 0.5) + 0.5) % 0.5;
const kickEnv = (t: number) => KICK_LEVEL * Math.exp(-phase(t) / 0.08);
const kickWave = (t: number) => kickEnv(t) * Math.sin(2 * Math.PI * 55 * phase(t));

function limiterGain(points: number): Pt[] {
    const fs = 48000;
    const ceiling = 0.85 * 10 ** (-6 / 20);
    const a = Math.exp(-1 / (0.05 * fs));
    const every = fs / points;
    const out: Pt[] = [];
    let gr = 0;
    for (let i = -fs; i <= fs; i++) {
        const t = (i + fs) / fs;
        const target = Math.max(0, 20 * Math.log10(Math.max(1e-9, Math.abs(kickWave(t))) / ceiling));
        gr = target > gr ? target : a * gr + (1 - a) * target;
        if (i >= 0 && i % every === 0) out.push([i / fs, 10 ** (-gr / 20)]);
    }
    return out;
}

const GAIN = limiterGain(400);
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const HIGHS = 0.3;

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
                'Level each band loses, averaged over a loop, with 6 dB of limiting on the biggest peaks. When the kick makes the peaks, the lows lose 3.3 dB and steady highs 0.5 dB, so the master tilts 2.8 dB brighter. When a bright snare makes the peaks, the highs lose 3.7 dB and the master tilts darker.',
            alt: 'Four horizontal bars on a scale from 0 to 6 dB. Kick drives: lows 3.3 dB, highs 0.5 dB. Snare drives: lows 0 dB, highs 3.7 dB.',
            min: 0,
            max: 6,
            unit: 'dB',
            bars: [
                { label: 'Kick drives: lows', value: 3.3 },
                { label: 'Kick drives: highs', value: 0.5, dim: true },
                { label: 'Snare drives: lows', value: 0, display: '0.0 dB', dim: true },
                { label: 'Snare drives: highs', value: 3.7 },
            ],
        },
    },
    quiz: [
        {
            q: 'In a loop, the kick makes the peaks and the limiter takes 3.3 dB of average level off the lows and 0.5 dB off the highs. After makeup gain, how has the balance moved?',
            options: [
                'It has not moved, because makeup gain restores it',
                'The highs sit about 2.8 dB higher against the lows',
                'The lows sit about 2.8 dB higher against the highs',
                'Both bands are 3.8 dB quieter than they were before',
            ],
            answer: 1,
            why: 'Makeup gain raises both bands by the same amount, so it cannot undo the difference. The highs lost 2.8 dB less than the lows, so the master leans 2.8 dB toward the top.',
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

The limiter changed the tone anyway. A broadband limiter applies one gain to the whole mix at each moment, and which moments it turns down depends on which part of the spectrum makes the peaks.

## Why it matters: tone moves with the drive

If you hear the thinner low end and reach for a low shelf, you can start a loop. When the low end is what drives the limiter, more low end in front of it means more gain reduction on every kick, and the extra lows come straight back off the peaks. Put the boost after the limiter instead and you raise peaks above the ceiling you set.

Knowing what drives the limiter tells you where the fix belongs. It also explains why a master can sound balanced at 2 dB of gain reduction and lopsided at 6.

::figure ducking

## Science model: one gain, shared by every frequency

A limiter measures the peak level of the full signal, computes the reduction needed to keep it under the ceiling, and smooths that gain over time (Zölzer, 2011; Giannoulis, Massberg and Reiss, 2012). At any instant every frequency gets the same gain, so a single moment keeps its spectral balance. What changes is the balance over time, because the parts of the mix do not have their energy in the same moments.

For one band $b$ of the mix, with signal $x_b$ and limiter gain $g$, the change in its average level is the gain weighted by when that band has its energy:

$$\\Delta L_b = 10 \\log_{10} \\frac{\\sum_t g(t)^2 \\, x_b(t)^2}{\\sum_t x_b(t)^2}$$

A band whose energy sits in the moments the limiter turns down loses the most. A band whose energy is spread evenly loses roughly the average gain reduction, which can be much smaller. Makeup gain raises every band by the same amount, so it cannot undo the difference between them.

I ran that calculation on two loops through a simple peak limiter with instant attack and a 50 ms release, pushed until the biggest peaks lost 6 dB. In the first, a 55 Hz kick made the peaks over steady high-frequency noise standing in for hats and air. The lows lost 3.3 dB of average level and the highs 0.5 dB, a 2.8 dB tilt toward the top. The tilt grew with the drive: about 0.7 dB at 2 dB of reduction, 1.7 at 4 and 3.9 at 8. In the second loop a bright snare made the peaks over a softer kick and a sustained bass. The highs lost 3.7 dB and the lows almost nothing, so the master went darker. Replacing the first loop's steady highs with crash-like bursts that start on each kick shrank its tilt to about 1.1 dB, because the highs then shared the kick's moments.

::figure bands

Real limiters use look-ahead and gentler gain curves, so your numbers will differ. The direction follows the same rule: the part of the spectrum that makes the peaks loses the most level. A fast release adds a second effect, harmonics from the gain moving within each bass cycle, which brightens the low end in a rougher way, as covered in [limiter release reaches into the groove](/blog/limiter-release-reaches-into-the-groove).

Push the drive and listen to the tone rather than the level, since the demo keeps the loudness matched.

::demo limiter

## DAW experiment: find the trigger, then move it

1. Loop the loudest chorus. On the master put a flat EQ, then the limiter with a -1 dBTP ceiling, then a gain plugin and a loudness meter showing short-term LUFS.
2. Drive the limiter to about 6 dB of gain reduction on the biggest hits. Use the gain plugin to match the short-term reading of the bypassed chain, then compare limited and bypassed and write down what moved: weight, brightness, vocal level.
3. On the EQ, cut a low shelf by 2 dB below 100 Hz and watch the gain reduction. Reset it, then cut a high shelf by 2 dB above 5 kHz and watch again.
4. Whichever cut lowers the gain reduction more points to the part of the spectrum that drives the limiter. Reset the EQ to flat.
5. Control that part earlier. For a kick or bass, use clip gain on the loudest hits, a clipper on the drum bus, or a high-pass on sub energy nobody hears. For a snare or cymbal, tame its peaks in the mix.
6. Drive the limiter again to the same short-term loudness as step 2 and compare both limited versions with the bypassed mix at matched loudness.

If those peaks were the trigger, the version where they were controlled first needs less gain reduction for the same loudness and stays closer to the tonal balance of the unlimited mix. If it does not, look elsewhere in the chain for the tone change.

## Common mistake: EQ-ing the limiter's side effect

The common mistake is correcting the limiter's tone with more EQ on the master. A low boost in front of a kick-driven limiter feeds the trigger. A high cut to tame the brighter top makes the master duller during the parts where the limiter is not working. Fix what drives the limiter, and the tone mostly stops moving.

The second mistake is judging tone at different levels. Turned up, a master seems to have more bass, because the ear's equal-loudness contours flatten as level rises (ISO, 2023). A limited master compared louder than the original will seem fuller than it is. Match the loudness first, as in [monitoring level changes the balance you hear](/blog/monitoring-level-changes-the-balance-you-hear).

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
