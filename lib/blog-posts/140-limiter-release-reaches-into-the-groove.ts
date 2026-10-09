import { BlogArticle } from '../blog-data';

type Pt = [number, number];

/**
 * A peak limiter with instant attack and a one-pole release on the gain reduction in dB,
 * the smoothing model in Giannoulis, Massberg and Reiss (2012). Runs at 48 kHz from
 * `start` (pre-roll, so the gain has settled) and returns input and output as plot points
 * between `from` and `to`, with time scaled to 0 to 1.
 */
function limit(signal: (t: number) => number, ceilingDb: number, release: number, start: number, from: number, to: number, points: number) {
    const fs = 48000;
    const ceiling = 10 ** (ceilingDb / 20);
    const a = Math.exp(-1 / (release * fs));
    const every = Math.round(((to - from) * fs) / points);
    const input: Pt[] = [];
    const output: Pt[] = [];
    let gr = 0;
    for (let i = 0, t = start; t <= to + 1e-9; i++, t = start + i / fs) {
        const x = signal(t);
        const target = Math.max(0, 20 * Math.log10(Math.max(1e-9, Math.abs(x)) / ceiling));
        gr = target > gr ? target : a * gr + (1 - a) * target;
        const k = Math.round((t - from) * fs);
        if (k >= 0 && k % every === 0) {
            const u = Math.round(((t - from) / (to - from)) * 1000) / 1000;
            input.push([u, Math.round(x * 1000) / 1000]);
            output.push([u, Math.round(x * 10 ** (-gr / 20) * 1000) / 1000]);
        }
    }
    return { input, output };
}

// Groove: a steady bed (bass and pads) at 0.3 with a kick on every beat at 120 BPM that peaks at 1.0.
// The ceiling sits 4 dB under the kick peak. One second shown: two beats.
const groove = (t: number) => 0.3 + 0.7 * Math.exp(-(t - (0.02 + Math.floor((t - 0.02) / 0.5) * 0.5)) / 0.04);
const grooveRow = (release: number, label: string) => {
    const { input, output } = limit(groove, -4, release, -3, 0, 1, 400);
    return {
        label,
        unipolar: true,
        lines: [{ y: 0.631, label: 'Ceiling' }],
        marks: [{ t: 0.27, label: 'Off-beat' }],
        traces: [
            { kind: 'envelope' as const, points: input, muted: true, label: 'In' },
            { kind: 'envelope' as const, points: output, label: 'Out' },
        ],
    };
};

// Bass: a 50 Hz sine at full scale into a ceiling 6 dB lower. 40 ms shown: two cycles.
const bass = (t: number) => Math.sin(2 * Math.PI * 50 * t);
const bassRow = (release: number, label: string) => {
    const { input, output } = limit(bass, -6, release, 0, 0.5, 0.54, 320);
    return {
        label,
        lines: [{ y: 0.5, label: 'Ceiling' }],
        traces: [
            { kind: 'envelope' as const, points: input, muted: true, label: 'In' },
            { kind: 'envelope' as const, points: output, label: 'Out' },
        ],
    };
};

export const post140: BlogArticle = {
    slug: 'limiter-release-reaches-into-the-groove',
    title: 'Limiter release reaches into the groove',
    excerpt: 'A master limiter turns the whole mix down on every kick. Its release decides what happens to everything between the hits: clean, pumping or distorted.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Every kick that hits the limiter turns down the bass, pads and hats under it, and the release decides how far they are still down when the next off-beat arrives.',
        'A release that is too fast lets the gain move within each bass cycle, which distorts the low end and makes the master louder, so always compare release settings at matched loudness.',
        'Set the release against the beat interval (60 divided by the BPM), by ear, because plugins label release time in different ways.',
    ],
    figures: {
        recovery: {
            type: 'signal',
            caption:
                'A simulated limiter on a kick over a steady bed at 120 BPM, 4 dB of gain reduction on each kick. With a 50 ms release the bed is untouched by the off-beat. With 250 ms it is still about 1.5 dB down there and swells back to within about half a decibel before the next kick. With 1 s it stays about 3 dB down all the time.',
            alt: 'Three level plots of two kicks over a flat bed, each with the input in grey and a ceiling line. In the first, only the kick tops are cut and the bed stays flat. In the second, the bed dips after each kick and climbs back before the next. In the third, the whole bed sits lower and barely moves.',
            rows: [grooveRow(0.05, 'Release 50 ms'), grooveRow(0.25, 'Release 250 ms'), grooveRow(1, 'Release 1 s')],
        },
        cycle: {
            type: 'signal',
            caption:
                'A 50 Hz bass sine driven 6 dB into the same simulated limiter. With a 1 ms release the gain recovers between crests and the wave comes out close to clipped, with a third harmonic about 15 dB below the fundamental. With 100 ms the gain barely moves within a cycle and the third harmonic falls to about 39 dB below.',
            alt: 'Two plots of two cycles of a sine wave, the input in grey. With a 1 ms release, the output has flat, squared-off tops at the ceiling line. With a 100 ms release, the output is a smaller, rounded sine that just touches the ceiling.',
            rows: [bassRow(0.001, 'Release 1 ms'), bassRow(0.1, 'Release 100 ms')],
        },
    },
    quiz: [
        {
            q: 'A kick causes 4 dB of gain reduction and the release time constant is 250 ms. Roughly how far down is the rest of the mix at the off-beat 250 ms later?',
            options: ['About 0.5 dB', 'About 1.5 dB', 'About 2.5 dB', 'About 4 dB'],
            answer: 1,
            why: 'The gain reduction decays as 4 × e^(-t/τ). With t equal to τ that is 4 × 0.37, about 1.5 dB.',
        },
        {
            q: 'Why does a very fast release on a full mix tend to distort the bass first?',
            options: [
                'Bass notes trigger true-peak overs that the limiter misses',
                'The look-ahead delay shifts the bass out of time with the kick',
                'The gain can rise and fall within each long bass cycle',
                'The limiter boosts low frequencies when it recovers',
            ],
            answer: 2,
            why: 'A 50 Hz cycle lasts 20 ms. If the gain recovers within a few milliseconds, it moves in step with the waveform, reshaping it and adding harmonics.',
        },
        {
            q: 'You shorten the release and the master sounds bigger. What should you check before keeping it?',
            options: [
                'That the change survives a comparison at matched loudness',
                'That the gain reduction meter now reads less than before',
                'That the release is shorter than the attack time',
                'That the integrated loudness is now above -14 LUFS',
            ],
            answer: 0,
            why: 'A shorter release lets the limiter behave more like a clipper, so the master gets louder at the same peak level. Louder tends to win until the levels are matched.',
        },
    ],
    content: `## Hook: the hats that started breathing

The mix bounces clean. You put a limiter on the master, push it until the meter reads where you want, and the groove changes. The hats and the pad now swell up between kicks and duck on every downbeat, like a sidechain nobody set up. You lengthen the release to stop it, and the master gets quieter. You shorten it, and the bass picks up a furry edge.

The limiter did both of those things through one control. Its release decides what the rest of the mix is doing between the hits that triggered it.

## Why it matters: the limiter turns everything down at once

A master limiter sees one signal, the whole mix. When a kick crosses the ceiling, the limiter cannot turn down the kick alone. It turns down the bass, the pad, the vocal and the hats that are playing at that moment, then lets them back up over the release time. Each kick leaves a dip in everything else, and the release sets its shape.

On a drum loop in a mix session, release decides how the next hit lands, as the [lesson on compression and motion](/blog/how-compression-changes-motion-not-level) shows. On a master the more audible effect is often on the parts that do not trigger the limiter at all: the sustained bass under the kick and the off-beat hats that fall inside the dip.

::figure recovery

## Science model: the recovery curve against the beat

A digital limiter measures the peak level, computes how much gain reduction is needed to keep it under the ceiling, and smooths that gain over time (Zölzer, 2011). Many limiters add a short look-ahead delay so the gain is already down when the peak arrives. Recovery is commonly modelled as a one-pole smoother on the gain reduction in decibels (Giannoulis, Massberg and Reiss, 2012). Once the kick has passed, the gain reduction left after a time $t$ is:

$$GR(t) = GR_0 \\, e^{-t/\\tau}$$

Here $GR_0$ is the reduction on the kick and $\\tau$ is the release time constant. The time to compare it with is the gap between beats:

$$\\Delta t = \\frac{60}{\\text{BPM}}$$

At 120 BPM a beat lasts 500 ms, so an off-beat hat lands 250 ms after the kick. With 4 dB on the kick, a 50 ms release has almost fully recovered by then. A 250 ms release still holds the hat $4 \\times e^{-1} \\approx 1.5$ dB down, and the bed rises by about 3 dB across each beat: that rise is the pumping you hear. A 1 s release holds everything about 3 dB down nearly all the time. That is clean and steady, but you need more drive to reach the same loudness.

MATLAB's Audio Toolbox, for example, defines attack and release as the time the gain takes to move from 10% to 90% of its final value, which for a one-pole smoother is $\\tau \\ln 9 \\approx 2.2\\tau$. Two plugins can both read 250 ms and recover at different speeds, so set release by ear against the tempo, not by number.

Go the other way and the release becomes faster than the bass. A 50 Hz cycle lasts 20 ms, with a crest every 10 ms. If the gain recovers within a few milliseconds, it rises and falls with every crest, and the limiter starts reshaping the wave instead of riding its level. In my simulation of a 50 Hz sine driven 6 dB into the ceiling, a 1 ms release produced a third harmonic about 15 dB under the fundamental, against about 39 dB under with a 100 ms release. The fast version also came out about 1.3 dB louder at the same peak level, because it was behaving like a clipper.

::figure cycle

Some limiters split the job between two stages: a fast one that catches short peaks and a slower release stage that follows the average level. FabFilter's documentation for its Pro-L 2 limiter describes that design and its trade-off: short attack and long release settings are "safer and cleaner" but "can also cause pumping and reduce clarity", while long attack and short release can raise apparent loudness "at the expense of possible distortion". Program-dependent and auto modes make that trade-off for you, so their choice still needs checking by ear.

Listen to the space between the hits as you change the release, with the loudness held equal.

::demo limiter

## DAW experiment: set the release to the beat

1. Loop eight bars of the full mix where the kick plays with a sustained bass or pad. On the master put a limiter with a -1 dBTP ceiling, then a gain plugin, then a loudness meter showing short-term LUFS.
2. Set the release to its longest value and raise the limiter input until the kicks show about 4 dB of gain reduction. Note the short-term reading.
3. Set the release to its shortest value. Lower the gain plugin until the short-term reading matches step 2, then listen to the bass for a buzzy or furry edge.
4. Raise the release slowly and listen to the hats and the pad between kicks. Note the range where they start to swell back after each kick.
5. Work out your beat interval, 60 divided by the BPM, and compare it with the release values where the swelling was strongest.
6. Keep raising the release until the swell turns into a steady turn-down. Rematch the loudness with the gain plugin each time you stop.
7. Choose the shortest release where the bass stays clean and any pumping is gone or sits on the beat the way you want it. If the limiter has an auto mode, compare it with your choice at matched loudness.

Between the two extremes there is often a range that does neither. In the simulation above, a 100 ms release kept the bass far cleaner than 1 ms and left the bed less than half a decibel down at the off-beat.

## Common mistake: choosing the release that sounds loudest

Comparing releases without matching loudness picks the wrong one. A short release lets the limiter work like a clipper, so the master gets louder at the same ceiling, and louder wins until you level-match. The harmonics it adds sit at three and five times the bass frequency, so they stay audible on small speakers that cannot play the bass note itself.

The second mistake is reading the gain reduction meter instead of listening. A meter that bounces neatly in time can still be pumping the pad on every beat, and a meter that hardly moves can be holding the whole mix 3 dB down. Listen to what plays between the kicks. If you want the pump, a sidechain on the parts you choose gives you control the master limiter cannot, and the [lesson on sidechain routing](/blog/sidechain-is-more-than-kick-ducking-bass) shows how to set one up.

## Producer takeaway: tune the release like a groove control

Treat the master limiter's release as part of the rhythm. Start from the beat interval, listen to the hats and the sustained parts between kicks, and back off from the setting where the bass gets rough. I set it with the full chorus playing and the loudness matched, so that what changes between settings is the groove and not the level. When no release works, the limiter is doing too much: move some of the work to a clipper on the drums or to the mix, as the [lesson on saturation, clipping and limiting](/blog/saturation-clipping-limiting-three-flavors-of-loud) explains.

## References

- FabFilter. (n.d.). *Pro-L 2 help: Advanced settings*. https://www.fabfilter.com/help/pro-l/using/advancedsettings
- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- MathWorks. (n.d.). *Dynamic range control*. Audio Toolbox documentation. https://www.mathworks.com/help/audio/ug/dynamic-range-control.html
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Limiter release reaches into the groove | VGP Studio',
        description: 'A master limiter turns the whole mix down on every kick. How release time sets pumping, bass distortion and loudness, and how to tune it to the tempo.',
        keywords: ['limiter release time', 'mastering limiter', 'limiter pumping', 'release and tempo', 'bass distortion limiter', 'program dependent release'],
    },
};
