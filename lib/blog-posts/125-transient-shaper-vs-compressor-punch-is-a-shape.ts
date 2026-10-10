import { BlogArticle } from '../blog-data';
import type { SignalTrace } from '../blog/types';

const N = 2000;
const toDb = (v: number) => 20 * Math.log10(Math.max(1e-9, v));
const coef = (time: number) => Math.exp(-1 / (time * N));

/** Level envelope of decaying hits, the same shape the figure renderer draws for `hits`. */
const hitsLevel = (at: number[], amp: number[], decay: number) => (t: number) =>
    at.reduce((sum, a, i) => (t < a ? sum : sum + amp[i] * Math.exp(-decay * (t - a))), 0);

/**
 * A differential-envelope transient shaper. A fast and a slow follower track the same level;
 * the attack gain in dB is `amount` times how far the fast one sits above the slow one.
 * Times are fractions of the plot width.
 */
function shape(level: (t: number) => number, fast: number, slow: number, release: number, amount: number) {
    let f = 1e-9;
    let s = 1e-9;
    const out: { t: number; x: number; f: number; s: number; d: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const x = level(t);
        const af = x > f ? coef(fast) : coef(release);
        const as = x > s ? coef(slow) : coef(release);
        f = af * f + (1 - af) * x;
        s = as * s + (1 - as) * x;
        const d = Math.max(0, toDb(f) - toDb(s));
        out.push({ t, x, f, s, d, y: x * 10 ** ((amount * d) / 20) });
    }
    return out.filter((_, i) => i % 5 === 0);
}

// A snare part: two backbeats and two ghost notes, scaled so the shaped peaks (about 6 dB up) still fit the plot.
const AT = [0.03, 0.28, 0.53, 0.78];
const AMP = [1, 0.3, 0.9, 0.25].map((a) => a * 0.53);
const THRESHOLD = 0.35 * 0.53;
const SNARE = { kind: 'hits' as const, at: AT, amp: AMP, decay: 28, outline: true };
const SHAPED = shape(hitsLevel(AT, AMP, 28), 0.004, 0.03, 0.02, 0.35);
const shaperOut: SignalTrace = { kind: 'envelope', points: SHAPED.map((p) => [p.t, p.y] as [number, number]), label: 'After' };

// One hit, zoomed in, to show the two followers and their difference.
const ONE = shape(hitsLevel([0.08], [0.9], 9), 0.003, 0.08, 0.05, 1);
const DMAX = Math.max(...ONE.map((p) => p.d));

export const post125: BlogArticle = {
    slug: 'transient-shaper-vs-compressor-punch-is-a-shape',
    title: 'Transient shaper or compressor for punch',
    excerpt: 'A compressor shapes a hit only when it crosses the threshold. A transient shaper reacts to the shape of every hit, loud or quiet. Know which one your part needs.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Use a compressor when loud hits should be treated differently from quiet ones, because its threshold makes it level dependent.',
        'Use a transient shaper when every hit, ghost notes included, needs the same change to its front edge or tail.',
        'An attack boost raises peaks by about the amount of the boost and a sustain boost lifts room and bleed, so check headroom and the gaps after you shape.',
    ],
    figures: {
        compare: {
            type: 'signal',
            caption:
                'Two backbeats and two ghost notes, drawn from a simulation. An 8:1 compressor with a slow attack turns the loud hits down by up to about 4 dB just after their front edge and leaves the ghost notes alone. A transient shaper lifts the front edge of every hit by 5 to 6 dB, loud or quiet.',
            alt: 'Three level plots of four snare hits, two loud and two quiet. The first is the original with a threshold line between the loud and quiet hits. In the second, the loud hits keep their peak but their bodies drop, while the quiet hits are unchanged. In the third, every hit, loud and quiet, has a taller spike at its start than the grey original.',
            rows: [
                {
                    label: 'Snare part',
                    unipolar: true,
                    lines: [{ y: THRESHOLD, label: 'Threshold' }],
                    traces: [SNARE],
                },
                {
                    label: 'Compressor, slow attack',
                    unipolar: true,
                    lines: [{ y: THRESHOLD, label: 'Threshold' }],
                    traces: [
                        { ...SNARE, muted: true, label: 'Before' },
                        { ...SNARE, label: 'After', compress: { threshold: THRESHOLD, ratio: 8, attack: 0.015, release: 0.06 } },
                    ],
                },
                {
                    label: 'Transient shaper, attack up',
                    unipolar: true,
                    traces: [{ ...SNARE, muted: true, label: 'Before' }, shaperOut],
                },
            ],
        },
        followers: {
            type: 'signal',
            caption:
                'Inside a transient shaper, drawn from the same model. A fast follower jumps with the hit while a slow one lags behind. The gap between them, in dB, is largest at the onset and shrinks as the slow one catches up, and the shaper turns that gap into gain. Scale the hit up or down and both followers scale with it, so the gap stays the same.',
            alt: 'Two plots of one drum hit. In the first, the hit envelope rises instantly; a solid line follows it closely and a dashed line rises more slowly and gradually closes in on it. The second plot shows the difference between the two lines: a peak at the start of the hit that falls away to nothing.',
            rows: [
                {
                    label: 'Fast and slow followers',
                    unipolar: true,
                    traces: [
                        { kind: 'hits', at: [0.08], amp: [0.9], decay: 9, outline: true, muted: true, label: 'Hit' },
                        { kind: 'envelope', points: ONE.map((p) => [p.t, p.f] as [number, number]), label: 'Fast' },
                        { kind: 'envelope', points: ONE.map((p) => [p.t, p.s] as [number, number]), label: 'Slow', dashed: true },
                    ],
                },
                {
                    label: 'Gap between them, becomes attack gain',
                    unipolar: true,
                    traces: [{ kind: 'envelope', points: ONE.map((p) => [p.t, (0.9 * p.d) / DMAX] as [number, number]), label: 'Gap' }],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A snare part has loud backbeats and quiet ghost notes. You want more crack on every hit, ghost notes included. Which tool does that directly?',
            options: [
                'A compressor with a slow attack and a low threshold',
                'A transient shaper with the attack control turned up',
                'A limiter with a fast release on the snare channel',
                'A compressor with a fast attack and makeup gain',
            ],
            answer: 1,
            why: 'The shaper reacts to the shape of each onset, not to its level, so the ghost notes get the same change as the backbeats. A compressor only acts on hits that cross its threshold.',
        },
        {
            q: 'A transient shaper raises each onset by 6 dB. The snare peaked at -8 dBFS before. Roughly where does it peak now?',
            options: ['-14 dBFS', '-8 dBFS', '-2 dBFS', '-5 dBFS'],
            answer: 2,
            why: 'The boost applies to the front edge, where the peak is, so the peak rises by about the full 6 dB, to around -2 dBFS. Check headroom after an attack boost.',
        },
        {
            q: 'Why does a differential-envelope shaper treat a quiet hit the same as a loud one?',
            options: [
                'It normalizes every hit to the same peak level first',
                'It uses a very low threshold that every hit crosses',
                'It reads the hit\'s pitch to decide how much gain to add',
                'Both followers scale with the hit, so the gap is unchanged',
            ],
            answer: 3,
            why: 'Turning a signal up by some dB adds the same dB to both followers. Their difference, which sets the gain, does not change.',
        },
    ],
    content: `## Hook: the ghost notes under the threshold

You want the snare to crack. A compressor with a slow attack does it on the backbeats: the front edge gets through, the body comes down, and with makeup gain the hit sounds sharper. Then you listen to the ghost notes between the backbeats. The makeup gain has turned them up, but they keep exactly the shape they had, soft and a little vague, because they never reached the threshold.

Swap the compressor for a transient shaper and turn up its attack, and the ghost notes get the same extra edge as the backbeats. Both tools change punch. They decide when to act in different ways, and that decides which one a part needs.

## Why it matters: one tool listens to level, the other to shape

A compressor acts on level. Its threshold splits the signal into two groups, hits that cross it and hits that do not, and only the first group gets shaped. Attack and release then decide what that shaping sounds like, as the [lesson on compression and motion](/blog/how-compression-changes-motion-not-level) shows. Play the same part louder and more of it crosses the line, so the result changes with the performance.

A transient shaper looks at how fast the level rises. Many designs have no threshold at all, only an attack control that turns onsets up or down and a sustain control that does the same to tails. A ghost note and a backbeat with the same shape get the same treatment.

::figure compare

The demo lets you hear both on one loop. Turn the shaper's attack up, then switch to the compressor and try to get the same change, listening to the start of each hit.

::demo transient

## Science model: two followers and a difference

A compressor's gain reduction is the overshoot above a fixed threshold times $1 - 1/R$, where $R$ is the [ratio](/blog/compression-ratio-what-4-to-1-actually-means). Turn the input up by 6 dB and the overshoot grows by 6 dB, so the gain reduction grows too, and a hit that was under the threshold may now cross it. The outcome depends on level.

A common transient shaper design, which SPL describes as differential envelope technology, runs two envelope followers on the same signal: one with a fast attack, one with a slow attack (White, 1998). At the start of a hit, the fast follower $L_f$ jumps up while the slow one $L_s$ lags behind. The gap between them, in decibels, sets the attack gain:

$$G_{\\text{attack}}(t) = k \\left( L_f(t) - L_s(t) \\right)$$

where $k$ is the attack control, positive to sharpen onsets and negative to soften them. Turn the input up by 6 dB and both $L_f$ and $L_s$ rise by 6 dB, so their difference stays the same. That is why the process is independent of level and needs no threshold. The sustain control uses a second pair of followers in a similar way, acting on the tail instead of the onset.

::figure followers

Fenton and Lee's perceptual model of punch suggests why the front edge carries so much of it: the score comes from the loudness of the transient part of a sound, separated from its steady part, weighted by onset time and frequency band. In their listening tests it correlated strongly with listeners' punch ratings (Fenton and Lee, 2019). Change the onset and you change the part of the sound that model listens to. How that onset relates to the average level is the subject of the [lesson on impact and level](/blog/the-difference-between-impact-and-level).

## DAW experiment: one snare, two tools

You need a transient shaper. Several DAWs include one, sometimes under the name envelope shaper.

1. Pick a snare track with clear backbeats and some ghost notes, or a drum loop with loud and quiet hits. Loop two bars.
2. Insert a compressor: ratio 4:1 or higher, attack around 20 to 30 ms, release short. Pull the threshold down until the backbeats show 4 to 6 dB of reduction, then add makeup gain until the loudness matches the bypassed track.
3. Listen to the backbeats, then to the ghost notes. Note which hits changed.
4. Bypass the compressor. Insert a transient shaper and raise its attack until the backbeats have about the same extra crack as with the compressor. Match the loudness again.
5. Listen to the ghost notes now. Then watch the peak meter: compare the peak level with the compressor version.
6. Set the shaper's attack back to zero and raise its sustain instead. Listen to the room sound and any hi-hat bleed between the hits.

You will usually find the compressor sharpens only the loud hits and the shaper sharpens all of them. A part where the ghost notes should stay soft wants the compressor; a part that needs every stroke to speak wants the shaper.

## Common mistake: forgetting what level independence costs

An attack boost raises the peaks by about the amount of the boost, because the peak sits on the front edge it is boosting. Add 6 dB of attack to a snare and the snare peaks about 6 dB higher, which eats headroom on the bus and gives a limiter downstream more to catch. Check the meters after shaping.

A sustain boost has a different risk. Because it ignores level, it lifts every tail it finds: room sound, bleed from the hi-hat, the noise floor between hits. On a close-miked snare in a busy kit, a few dB of sustain can bring up more hi-hat than snare. A gate or expander before the shaper, which turns down whatever falls below its threshold, keeps that bleed out of the tail.

## Producer takeaway: decide whether level should matter

Before reaching for either tool, ask whether loud and quiet hits should be treated differently. If they should, the compressor's threshold is a feature: it shapes the backbeats and leaves the ghost notes soft. If they should not, the shaper gives every hit the same change without a threshold to chase as the performance gets louder or softer. On drum loops and samples with a fixed level I go to the shaper first; on a live drummer with a wide dynamic range I usually want the compressor's judgment on level. Either way, compare at matched loudness and watch the peak meter.

## References

- Fenton, S., & Lee, H. (2019). A perceptual model of "punch" based on weighted transient loudness. *Journal of the Audio Engineering Society*, 67(6), 429-439. https://doi.org/10.17743/jaes.2019.0017
- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- White, P. (1998, October). SPL Transient Designer. *Sound On Sound*. https://www.soundonsound.com/reviews/spl-transient-designer
`,
    seo: {
        title: 'Transient shaper vs compressor for punch | VGP Studio',
        description: 'A compressor shapes only the hits that cross its threshold. A transient shaper reacts to every onset, loud or quiet. How each works and when to use which.',
        keywords: ['transient shaper', 'transient shaper vs compressor', 'drum punch', 'differential envelope', 'snare ghost notes', 'attack and sustain'],
    },
};
