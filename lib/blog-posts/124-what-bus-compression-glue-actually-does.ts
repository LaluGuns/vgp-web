import { BlogArticle } from '../blog-data';
import type { SignalTrace } from '../blog/types';

// Two bars of kick and snare on a bus, with a sustained pad at a steady level underneath.
const AT = [0.02, 0.27, 0.52, 0.77];
const AMP = [1, 0.8, 1, 0.8];
const DECAY = 14;
const PAD = 0.25;
// Display scales only: the bus row is drawn at 0.8 so the summed peaks fit, the pad rows 3x taller
// so a 2 dB dip is visible. The compressor runs on the unscaled levels; the dB figures are unchanged.
const BUS_SHOW = 0.8;
const SHOW = 3;
const drums = (t: number) => AT.reduce((sum, at, i) => (t < at ? sum : sum + AMP[i] * Math.exp(-DECAY * (t - at))), 0);

// The same feed-forward compressor the figure renderer uses for `compress`: static curve in dB,
// then one-pole attack and release on the gain reduction. Here the detector hears the whole bus,
// drums plus pad, and the one gain it computes is applied to the pad.
function padThroughBus(c: { threshold: number; ratio: number; attack: number; release: number }): SignalTrace {
    const n = 2000;
    const toDb = (v: number) => 20 * Math.log10(Math.max(1e-5, v));
    const coef = (time: number) => Math.exp(-1 / (time * n));
    const points: [number, number][] = [];
    let gr = 0;
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const over = toDb(drums(t) + PAD) - toDb(c.threshold);
        const target = over > 0 ? over * (1 - 1 / c.ratio) : 0;
        const a = target > gr ? coef(c.attack) : coef(c.release);
        gr = a * gr + (1 - a) * target;
        if (i % 5 === 0) points.push([t, SHOW * PAD * 10 ** (-gr / 20)]);
    }
    return { kind: 'envelope', points, label: 'Pad after' };
}

const PAD_BEFORE: SignalTrace = { kind: 'envelope', points: [[0, SHOW * PAD], [1, SHOW * PAD]], muted: true, label: 'Pad before' };

// What the detector hears: drums plus pad.
const BUS: SignalTrace = {
    kind: 'envelope',
    points: Array.from({ length: 2001 }, (_, i) => [i / 2000, BUS_SHOW * (drums(i / 2000) + PAD)] as [number, number]),
    label: 'Bus: drums + pad',
};

export const post124: BlogArticle = {
    slug: 'what-bus-compression-glue-actually-does',
    title: 'What bus compression glue really is',
    excerpt: 'A bus compressor turns every track on the bus down by the same amount at the same moment. That shared movement is what engineers hear as glue, and too much of it pumps.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'A bus compressor computes one gain from the sum of its inputs and applies it to all of them, so the loudest element moves everything else.',
        'A couple of dB of shared movement that recovers before the next hit makes parts move together; more than that, or a release too slow for the tempo, pumps.',
        'Filter the low end out of the detector when the kick is steering the whole bus, and judge the result at matched level with the full mix playing.',
    ],
    figures: {
        shared: {
            type: 'signal',
            caption:
                'A steady pad shares a bus compressor with kick and snare, drawn from a simulation. The pad never changes, but the gain the drums trigger is applied to it. At 2:1 the pad dips about 2 dB after each hit and is back before the next one. At 6:1 with a lower threshold it dips about 9 dB, and after the first hit it never gets back within about 3 dB of where it started. The pad rows are drawn taller than the bus row so the dips are easy to see.',
            alt: 'Three level plots across two bars. The first shows the bus level, four drum hits sitting on top of a flat pad, with two threshold lines. The second shows the pad after a light bus compressor: small dips after each hit that recover fully. The third shows the pad after a heavy setting: deep dips after each hit and a level that stays below the original grey line throughout.',
            rows: [
                {
                    label: 'Drums and pad into the bus',
                    unipolar: true,
                    lines: [
                        { y: BUS_SHOW * 0.6, label: '2:1 threshold', short: '2:1' },
                        { y: BUS_SHOW * 0.3, label: '6:1 threshold', short: '6:1' },
                    ],
                    traces: [
                        BUS,
                        { kind: 'envelope', points: [[0, BUS_SHOW * PAD], [1, BUS_SHOW * PAD]], label: 'Pad alone', dashed: true, muted: true },
                    ],
                },
                {
                    label: 'Pad after the bus, 2:1, light',
                    unipolar: true,
                    traces: [PAD_BEFORE, padThroughBus({ threshold: 0.6, ratio: 2, attack: 0.01, release: 0.06 })],
                },
                {
                    label: 'Pad after the bus, 6:1, heavy',
                    unipolar: true,
                    traces: [PAD_BEFORE, padThroughBus({ threshold: 0.3, ratio: 6, attack: 0.005, release: 0.15 })],
                },
            ],
        },
        detector: {
            type: 'spectrum',
            mode: 'gain',
            dbRange: [-36, 6],
            caption:
                'An example detector filter: a 12 dB per octave high-pass at 100 Hz on the side chain only. At 50 Hz the detector hears the kick about 12 dB quieter, so the kick steers the gain less. The audio itself passes unfiltered.',
            alt: 'Gain over frequency from 20 Hz to 20 kHz. A curve is flat at 0 dB above about 200 Hz and falls steeply below 100 Hz. A shaded band from 40 to 100 Hz marks where a kick drum carries its weight.',
            bands: [{ from: 40, to: 100, label: 'Kick weight' }],
            curves: [{ kind: 'eq', label: 'Detector high-pass, 100 Hz', bands: [{ type: 'highpass', freq: 100, q: 0.707 }] }],
        },
    },
    quiz: [
        {
            q: 'A pad and a drum kit share a bus compressor. The pad never changes level. What happens to it when the snare hits?',
            options: [
                'Nothing, because the pad is below the threshold',
                'It is turned down by the same amount as the snare',
                'It is turned up to make room for the snare hit',
                'It is turned down only if the pad crosses the threshold',
            ],
            answer: 1,
            why: 'A bus compressor computes one gain from the sum and applies it to everything on the bus. The pad does not need to cross the threshold to be turned down.',
        },
        {
            q: 'A bus compressor with a 12 dB per octave detector high-pass at 100 Hz hears a 50 Hz kick how much quieter?',
            options: ['About 3 dB', 'About 6 dB', 'About 24 dB', 'About 12 dB'],
            answer: 3,
            why: '50 Hz is one octave below the corner, and a second-order high-pass falls about 12 dB per octave there. The audio is not filtered, only what the detector hears.',
        },
        {
            q: 'Your mix bus compressor makes the chorus pump against the tempo. Which change helps first?',
            options: [
                'Shorten the release so it recovers before the next hit',
                'Raise the ratio so the peaks are caught more firmly',
                'Speed up the attack so the hits are clamped sooner',
                'Add makeup gain so the chorus stays as loud as before',
            ],
            answer: 0,
            why: 'Pumping against the groove means the gain is still recovering when the next hit arrives. A release that returns in time, or less gain reduction, lets the movement follow the beat.',
        },
    ],
    content: `## Hook: the word everyone uses

Someone hears your rough mix and says it needs glue. You put a compressor across the drum bus or the mix bus, pull the threshold down a little, and something changes: the parts feel more like one performance. Push further and the cymbals start breathing with the kick.

Glue sounds like a vague, almost mystical quality. What the compressor does is simple enough to draw: it turns everything on the bus down by the same amount at the same moment.

## Why it matters: one detector, one gain, many tracks

On separate channels, each compressor listens to its own track and moves its own gain. On a bus there is one detector, and it hears the sum of everything routed there. When the snare hits, the sum gets louder, the compressor turns down, and the vocal, the pad and the hi-hats on that bus all go down with the snare.

None of those parts did anything. They move because they share the gain. With a small amount of reduction that recovers before the next hit, the parts start to rise and fall together, in time with the loudest events in the music. With a lot of reduction, or a release slower than the beat, the sustained parts audibly duck and swell. That is pumping, and the same mechanism, aimed on purpose, is what [sidechain ducking](/blog/sidechain-is-more-than-kick-ducking-bass) does.

::figure shared

The demo's drum loop is a small bus in itself: every drum in it shares one compressor's gain. Listen to what the sound between the hits does as you lower the threshold.

::demo compressor

## Science model: one gain applied to a sum

For a bus with tracks $x_1$ to $x_N$, a feed-forward compressor computes its gain from the summed signal and multiplies the whole sum by it:

$$\\begin{aligned} y(t) &= g(t) \\sum_{i=1}^{N} x_i(t) \\\\ g(t) &= f\\left( \\sum_{i=1}^{N} x_i(t) \\right) \\end{aligned}$$

Here $f$ is the threshold, ratio, attack and release machinery from the [lesson on compression and motion](/blog/how-compression-changes-motion-not-level) (Giannoulis, Massberg and Reiss, 2012). Compare that with a compressor on each track, where every $x_i$ gets its own $g_i(t)$ and the tracks move independently. On the bus, every level change the compressor makes is shared, so the tracks' envelopes become partly correlated with whatever drives the detector. On a stereo bus the left and right sides are normally linked to the same gain as well, so a hit on one side does not pull the image toward the other.

Bregman's account of auditory scene analysis suggests why shared movement sounds cohesive: sounds whose levels change together at the same time tend to be grouped as one source, a cue he discusses under common fate (Bregman, 1990). Applying that to bus compression is an interpretation rather than a measured result, but it fits what engineers describe: a little common movement makes separate parts feel like one event.

The detector also decides who steers. It reacts to the sum, so the element with the biggest peaks sets most of the gain movement, and on a drum or mix bus that is often the kick. Many bus compressors offer a high-pass filter on the detector path for this reason. It changes only what the detector hears, so the kick still passes at full weight while steering the gain less.

::figure detector

## DAW experiment: watch one hit move the bus

1. Route drums, bass and one sustained part, a pad or held guitar, to a bus. Put a compressor on the bus with a 2:1 ratio, a medium attack and auto or medium release.
2. Solo nothing. Pull the threshold down until the meter shows 1 to 2 dB on the loudest hits.
3. Mute the drums for a moment and listen to the pad. Unmute and listen again: the pad now dips slightly with each kick and snare.
4. Pull the threshold down until you see 6 to 8 dB of reduction. Listen to the pad and the cymbal tails between hits.
5. Set the release short enough that the meter is back near zero before each kick, then long enough that it never fully returns. Note which one moves with the groove.
6. If your compressor has a detector high-pass, raise it until the kick stops dominating the meter, and listen to whether the snare and the bass now steer the movement.
7. Return to a setting you like and compare it with the bypassed bus at matched loudness.

Exaggerating first makes the shared movement easy to hear. Back at a couple of dB, it shows up as parts that sit together rather than as an effect you can point to.

## Common mistake: adding glue to cover a balance problem

Glue cannot fix a balance problem. If the vocal is too loud against the band, a bus compressor turns the band and the vocal down together whenever the drums hit, and the vocal is still too loud. Fix the balance first, then compress the bus.

The other mistake is judging with makeup gain on, so the louder compressed version wins. Match the levels and listen to the sustained parts, where shared movement shows first. Over a whole song, heavy bus compression can also shrink the lift from verse to chorus, the same cost the [lesson on the final loudness push](/blog/the-final-loudness-push-that-can-cost-emotion) describes for limiting.

## Producer takeaway: glue is a timing decision

Treat a bus compressor as a decision about which events move everything else, and how fast everything comes back. Pick the release so the gain returns in time with the beat, keep the amount small, and filter the detector if the kick is steering the whole bus. On a mix bus I start with a couple of dB of reduction at most; past that, pumping tends to arrive before glue does. When parts still feel separate, the cause is usually arrangement or balance, and more bus compression will not reach it.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
`,
    seo: {
        title: 'What bus compression glue really is | VGP Studio',
        description: 'A bus compressor applies one gain to every track on the bus. How that shared movement creates glue, when it turns into pumping, and how to set it.',
        keywords: ['bus compression', 'mix bus glue', 'drum bus compression', 'pumping', 'sidechain high-pass', 'stereo link'],
    },
};
