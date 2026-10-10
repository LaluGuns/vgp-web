import { BlogArticle } from '../blog-data';

export const post119: BlogArticle = {
    slug: 'compression-ratio-what-4-to-1-actually-means',
    title: 'What a 4:1 compression ratio does',
    excerpt: 'Threshold, ratio and knee decide how much a compressor turns down before attack and release come in. Work out 4:1 by hand and you can predict any setting.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Above the threshold, a 4:1 ratio lets 1 dB out for every 4 dB in. Below it, nothing changes.',
        'Gain reduction is the overshoot times (1 - 1/R), so raising the ratio past about 8:1 adds very little.',
        'The knee sets how gently compression begins. Compression narrows the gap between loud and quiet, and makeup gain lifts the whole result back up.',
    ],
    figures: {
        ratios: {
            type: 'bars',
            caption:
                'Gain reduction for a peak 12 dB over the threshold, computed as 12 × (1 - 1/R). Going from 2:1 to 4:1 adds 3 dB of reduction. Going from 8:1 to 20:1 adds less than 1 dB.',
            alt: 'Five bars on a scale from 0 to 12 dB. 2:1 gives 6 dB, 4:1 gives 9 dB, 8:1 gives 10.5 dB, 20:1 gives 11.4 dB and infinity to 1 gives 12 dB.',
            min: 0,
            max: 12,
            unit: 'dB',
            bars: [
                { label: '2:1', value: 6, display: '6 dB' },
                { label: '4:1', value: 9, display: '9 dB' },
                { label: '8:1', value: 10.5, display: '10.5 dB' },
                { label: '20:1', value: 11.4, display: '11.4 dB' },
                { label: '∞:1, a limiter', value: 12, display: '12 dB' },
            ],
        },
        knee: {
            type: 'transfer',
            domain: 'db',
            caption:
                'The same 4:1 ratio with a hard knee and a 12 dB soft knee, threshold -20 dB. The soft knee starts turning down 6 dB below the threshold and reaches the full 4:1 slope 6 dB above it. Away from the threshold the two curves are identical.',
            alt: 'Input level against output level from -48 to 0 dB. Below -26 dB all lines follow one to one. The dashed hard-knee line bends sharply at -20 dB; the solid soft-knee line curves gradually between -26 and -14 dB. Above -14 dB both rise at a quarter of the slope.',
            curves: [
                { kind: 'linear', label: 'No compression' },
                { kind: 'compressor', threshold: -20, ratio: 4, label: '4:1, hard knee', dashed: true },
                { kind: 'compressor', threshold: -20, ratio: 4, knee: 12, label: '4:1, 12 dB soft knee' },
            ],
        },
        makeup: {
            type: 'signal',
            caption:
                'Four hits through a 4:1 compressor, drawn from a simulation. Compression pulls the two loud hits down toward the quiet ones. Makeup gain then lifts everything by the same amount, so the loud hits return to about where they were and the quiet hits, never compressed, come up with them.',
            alt: 'Three level plots of four drum hits, two loud and two quiet. The first is uncompressed. In the second the loud hits are lowered while the quiet hits are unchanged. In the third the loud hits are back near their original height and the quiet hits are much higher than before.',
            rows: [
                {
                    label: 'Before',
                    unipolar: true,
                    lines: [{ y: 0.3, label: 'Threshold' }],
                    traces: [{ kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.28, 0.95, 0.25], decay: 16, outline: true }],
                },
                {
                    label: 'Compressed at 4:1',
                    unipolar: true,
                    lines: [{ y: 0.3, label: 'Threshold' }],
                    traces: [
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.28, 0.95, 0.25], decay: 16, outline: true, muted: true },
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.28, 0.95, 0.25], decay: 16, outline: true, compress: { threshold: 0.3, ratio: 4, attack: 0.001, release: 0.03 } },
                    ],
                },
                {
                    label: 'Compressed plus 8 dB makeup gain',
                    unipolar: true,
                    traces: [
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.28, 0.95, 0.25], decay: 16, outline: true, muted: true },
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.28, 0.95, 0.25], decay: 16, outline: true, gain: 2.5, compress: { threshold: 0.3, ratio: 4, attack: 0.001, release: 0.03 } },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'Threshold -20 dB, ratio 4:1. A peak reaches -8 dB. What level comes out?',
            options: ['-14 dB', '-17 dB', '-20 dB', '-11 dB'],
            answer: 1,
            why: 'The peak is 12 dB over the threshold. At 4:1 only 3 dB of that is left, so it comes out at -20 + 3 = -17 dB, with 9 dB of gain reduction.',
        },
        {
            q: 'A peak is 12 dB over the threshold. Going from 8:1 to 20:1 adds how much gain reduction?',
            options: ['About 3 dB', 'About 1.5 dB', 'About 6 dB', 'About 0.9 dB'],
            answer: 3,
            why: 'At 8:1 the reduction is 12 × (1 - 1/8) = 10.5 dB. At 20:1 it is 12 × (1 - 1/20) = 11.4 dB. The difference is 0.9 dB.',
        },
        {
            q: 'What does a 12 dB soft knee change compared with a hard knee at the same 4:1?',
            options: [
                'It raises the ratio above 4:1 right at the threshold',
                'It speeds up the attack so peaks are caught sooner',
                'It eases in over 6 dB either side of the threshold',
                'It moves the threshold up 12 dB and keeps the slope',
            ],
            answer: 2,
            why: 'The knee width is centred on the threshold. Inside it the ratio rises gradually from 1:1 to the full setting, so the start of compression is smoother.',
        },
    ],
    content: `## Hook: the numbers on the front panel

The vocal preset you load in every session reads 4:1, the ratio every tutorial seems to suggest. You pull the threshold down until the meter moves, add makeup gain, and the vocal sounds better. But could you say how much it turned the loudest word down, or what would change at 8:1?

Most compressor confusion starts here. Threshold, ratio and knee are a small piece of arithmetic, and once you can do it in your head you can predict what a setting will do before you hear it. This lesson covers that static part. How fast the compressor moves, attack and release, is the subject of the [lesson on compression and motion](/blog/how-compression-changes-motion-not-level).

## Why it matters: ratio is not volume

A 4:1 ratio does not divide the level by four. It only acts on the part of the signal above the threshold, and it acts on decibels. For every 4 dB the input goes over the threshold, 1 dB comes out over it. Everything below the threshold passes unchanged.

That has a practical consequence: the threshold decides how much of the signal gets compressed, and the ratio decides how hard. Raising the ratio past a certain point barely changes the result, while moving the threshold changes it a lot.

::figure ratios

## Science model: the static curve

With a hard knee, a compressor's output level above the threshold is:

$$L_{\\text{out}} = T + \\frac{L_{\\text{in}} - T}{R}$$

where $L_{\\text{in}}$ is the input level in decibels, $T$ the threshold and $R$ the ratio. The gain reduction is the difference between input and output:

$$GR = \\left( L_{\\text{in}} - T \\right) \\left( 1 - \\frac{1}{R} \\right)$$

Take a threshold of -20 dB and a peak at -8 dB. The peak is 12 dB over. At 4:1 it comes out 3 dB over, at -17 dB, so the compressor removes 9 dB. At 2:1 it would remove 6 dB, at 8:1 10.5 dB and at infinity to 1, a limiter, all 12. The jump from 2:1 to 4:1 is large; above 8:1 there is little left to take.

The knee decides how compression begins. A hard knee switches from 1:1 to the full ratio exactly at the threshold. A soft knee of width $W$ blends between them over a range centred on the threshold (Giannoulis, Massberg and Reiss, 2012). Inside that range:

$$L_{\\text{out}} = L_{\\text{in}} + \\left( \\frac{1}{R} - 1 \\right) \\frac{\\left( L_{\\text{in}} - T + \\frac{W}{2} \\right)^2}{2W}$$

With a 12 dB knee at 4:1, a signal right at the threshold is already turned down about 1.1 dB, and the full ratio applies from 6 dB above it. Soft knees sound smoother on vocals and buses because there is no sudden point where compression starts.

::figure knee

Makeup gain is the last piece. Compression only turns things down, so the output is quieter. Makeup gain lifts the whole signal by a fixed amount, loud and quiet parts alike. The loud parts come back to about where they were, and the quiet parts, which were never compressed, end up louder. The gap between loud and quiet shrank in the compressor; makeup gain only moves the smaller range back up.

::figure makeup

Try it on a drum loop. The demo matches levels for you, so you hear the shape change rather than the volume. Switch Source to Real mix to hear the same ratios on a finished song.

::demo compressor

## DAW experiment: measure your compressor's curve

A test tone shows you exactly what your compressor does, with no guessing.

1. Create a track with a test tone generator playing a 1 kHz sine at -20 dBFS. Insert a compressor and a peak meter after it.
2. Set the threshold to -20 dB, the ratio to 4:1, a hard knee, zero makeup gain and auto makeup off. Leave attack and release at moderate settings; a steady tone makes them irrelevant once it settles.
3. Raise the tone to -16, -12 and -8 dBFS and read the output each time. You should see about -19, -18 and -17 dBFS.
4. If every reading is about 2 dB higher than that, your compressor probably detects RMS level rather than peak. A sine's RMS sits 3 dB below its peak, so the compressor sees 3 dB less overshoot and removes 3 × 3/4 = 2.25 dB less. Lower the threshold by 3 dB and repeat.
5. Set a 12 dB soft knee and play the tone at -20 dBFS again. The output should drop by about 1 dB, where the hard knee did nothing.
6. Replace the tone with a drum loop, set the threshold for about 6 dB of reduction on the peaks, then raise the makeup gain until the loudness matches the bypassed loop.

At matched loudness you can hear what the static curve does on real material: the peaks sit closer to the body of the sound, and the quiet details come up.

## Common mistake: more ratio for more control

When a part still jumps out, the reflex is to raise the ratio. Above about 8:1 that buys very little, because almost all of the overshoot is already removed. Lower the threshold instead, so more of the signal reaches the compressor.

The second mistake is judging the result with makeup gain on and levels unmatched. The compressed version is louder, and louder tends to win any quick comparison, as the [lesson on loudness bias](/blog/why-louder-is-not-always-bigger) shows. Match the loudness, then decide.

## Producer takeaway: set threshold for amount, ratio for character

For most mixing work, a ratio between 2:1 and 4:1 is a common starting point. Pull the threshold down until the meter shows the amount of reduction you want on the loudest moments, often 3 to 6 dB, then pick the knee: soft for vocals and buses, hard when you want the compressor to grab.

When you are unsure what a setting does, do the arithmetic. Overshoot times one minus one over the ratio tells you the gain reduction, and the meter should agree.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'What a 4:1 compression ratio does | VGP Studio',
        description: 'Threshold, ratio, knee and makeup gain worked out by hand: the static compressor curve, why high ratios add little, and how to measure your own compressor.',
        keywords: ['compression ratio', 'compressor threshold', 'soft knee', 'gain reduction', 'makeup gain', 'compressor math'],
    },
};
