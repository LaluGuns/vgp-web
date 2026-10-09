import { BlogArticle } from '../blog-data';

// Four bass notes of uneven level, drawn as waveforms.
const NOTES = { kind: 'hits' as const, at: [0.02, 0.27, 0.52, 0.77], amp: [1, 0.35, 0.85, 0.3], decay: 10, cycles: 40 };
const COMP = { threshold: 0.3, ratio: 6, attack: 0.002, release: 0.04 };

export const post128: BlogArticle = {
    slug: 'plugin-order-changes-what-each-processor-hears',
    title: 'Plugin order changes what each processor hears',
    excerpt: 'Swap two EQs and nothing changes. Swap an EQ and a compressor, or a compressor and a saturator, and the sound does. Learn which orders matter and why.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Order matters only when a processor reacts to level, like a compressor, limiter, gate or saturator; two clean EQs give the same result in either order.',
        'An EQ before a compressor changes what drives the gain; an EQ after it changes only the tone of what comes out.',
        'Put a compressor before a saturator for even distortion across notes, and after it when loud notes should bite harder; then compare both orders at matched level.',
    ],
    figures: {
        drive: {
            type: 'signal',
            caption:
                'Four bass notes into the same soft saturator, drawn from a simulation. On its own, the loudest note peaks about 8.6 dB above the quietest, so the loud notes are flattened while the quiet ones pass almost clean. With a 6:1 compressor first and 6 dB of makeup gain, the notes arrive within about 2 dB of each other and all get bent by a similar amount.',
            alt: 'Three waveform plots of four decaying bass notes, two loud and two quiet. The first is the original. In the second, the loud notes are rounded off flat near the ceiling while the quiet notes keep their shape. In the third, all four notes reach a similar height and are rounded off in the same way.',
            rows: [
                { label: 'Bass notes in', traces: [NOTES] },
                {
                    label: 'Saturation only',
                    lines: [{ y: 0.4, label: 'Ceiling' }],
                    traces: [
                        { ...NOTES, muted: true, label: 'In' },
                        { ...NOTES, clip: 0.4, soft: true, label: 'Out' },
                    ],
                },
                {
                    label: 'Compressor, then saturation',
                    lines: [{ y: 0.4, label: 'Ceiling' }],
                    traces: [
                        { ...NOTES, muted: true, label: 'In' },
                        { ...NOTES, compress: COMP, gain: 2, clip: 0.4, soft: true, label: 'Out' },
                    ],
                },
            ],
        },
        eqcomp: {
            type: 'bars',
            caption:
                'One note whose low end drives the detector, 6 dB over the threshold of a 4:1 compressor. A 6 dB low boost placed after the compressor leaves the gain reduction at 4.5 dB. The same boost placed before it doubles the reduction to 9 dB, and that extra 4.5 dB comes off every frequency, the mids and highs included.',
            alt: 'Two bars on a scale from 0 to 10 dB. With the EQ after the compressor the gain reduction is 4.5 dB. With the EQ before it the gain reduction is 9 dB.',
            min: 0,
            max: 10,
            unit: 'dB',
            bars: [
                { label: 'EQ after the compressor', value: 4.5, display: '4.5 dB' },
                { label: 'EQ before the compressor', value: 9, display: '9 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'You swap the order of two clean digital EQs on a vocal: a high-pass, then a presence boost. What changes?',
            options: [
                'The presence boost gets louder after the swap',
                'Nothing, because linear filters in series commute',
                'The high-pass gets steeper after the swap',
                'The vocal clips, because the boost comes first',
            ],
            answer: 1,
            why: 'Filters that are linear and time-invariant multiply their responses, and multiplication does not depend on order. The combined curve is identical.',
        },
        {
            q: 'A bass note\'s low end sits 6 dB over the threshold of a 4:1 compressor. You add a 6 dB low boost before it. How much gain reduction now?',
            options: ['4.5 dB', '6 dB', '12 dB', '9 dB'],
            answer: 3,
            why: 'The boost puts the detector 12 dB over. At 4:1 the compressor removes 12 × 3/4 = 9 dB, against 6 × 3/4 = 4.5 dB without the boost in front of it.',
        },
        {
            q: 'You want a bass line to distort by the same amount on loud and quiet notes. Which order helps?',
            options: [
                'Compressor first, then the saturator',
                'Saturator first, then the compressor',
                'EQ boost first, then the saturator',
                'Limiter last, after the saturator',
            ],
            answer: 0,
            why: 'A saturator bends loud input more than quiet input. A compressor in front evens out the notes, so each one reaches the saturator at a similar level.',
        },
    ],
    content: `## Hook: same plugins, different record

You have an EQ and a compressor on a bass. Out of curiosity you drag the EQ below the compressor. Nothing else changes, same settings, same plugins, and the bass now sounds different: the low notes stop pulling the whole sound down, and the movement feels looser. Then you swap two EQs on the vocal and hear no difference at all.

In a serial chain, every processor works on what the one before it hands over. That matters only when a processor reacts to level, and a clean EQ does not.

## Why it matters: order is part of the sound

An insert chain is a series of stages, and each stage hears only the output of the stage above it. A compressor after an EQ hears the EQ'd signal. A saturator after a compressor hears a signal whose level has already been evened out. A limiter at the end hears everything every earlier plugin did.

If you never think about order, you end up fixing its side effects with more plugins: a compressor that pumps on the low end because a boost sits in front of it, distortion that comes and goes with the performance, an EQ after the limiter that pushes peaks back over the ceiling.

## Science model: which stages commute

A clean digital EQ is linear and time-invariant. Two such filters in series multiply their frequency responses, and multiplication does not care about order, so any ordering of filters in series gives the same overall response (Smith, 2007). Two EQs, a high-pass and a shelf, a delay and an EQ: swap them freely. The same is not true of an EQ that models analog saturation, because that is no longer linear.

A compressor is not linear. Its gain depends on the level it receives (Giannoulis, Massberg and Reiss, 2012), as in the [lesson on compression and motion](/blog/how-compression-changes-motion-not-level), so whatever changes that level changes the gain. Take a bass note whose low end drives the detector, 6 dB over the threshold of a 4:1 compressor. The compressor removes $6 \\times 3/4 = 4.5$ dB. Put a 6 dB low boost in front of it and the detector is 12 dB over, so the compressor removes $12 \\times 3/4 = 9$ dB.

::figure eqcomp

On a steady note and at matched level, the tonal balance at the output ends up the same both ways: the lows sit 6 dB above the rest because the compressor turns every frequency down together. What changes is the gain movement. With the boost in front, the compressor works twice as hard and follows the low end, so the mids and highs dip twice as deep with every bass note. With the boost after it, the compressor reacts to the original signal and the boost shapes only the tone. The same logic is why a high-pass in front of a compressor is common: it stops rumble from steering the gain.

Saturation is not linear either. A saturator bends loud input more than quiet input, so how much it distorts depends on the level that reaches it (Dutilleux, Dempwolf, Holters and Zölzer, 2011). Put a compressor first and every note reaches the saturator at a similar level, so the distortion is even. Put the saturator first and the distortion follows the performance, loud notes grittier than quiet ones, and the compressor then hears peaks that were already rounded off.

::figure drive

The demo runs bass and chords through a waveshaper at matched level. Move the drive and listen to how much the sound changes with the level going in. That level is exactly what the stage before a saturator decides.

::demo saturation

A limiter at the end of a master works the same way. A bright EQ boost in front of it gives the limiter more high-frequency peaks to catch, so it turns down harder on cymbals and consonants. The same boost after the limiter changes the tone of the limited signal and can push peaks back over the ceiling the limiter just set.

## DAW experiment: swap the order, keep everything else

1. Pick a bass or a drum loop. Insert an EQ with a 6 dB low shelf boost and a compressor at 4:1 with its threshold set for about 4 dB of reduction, EQ first.
2. Note the gain reduction meter. Then drag the EQ below the compressor without touching any setting, and note the meter again.
3. Match the loudness of the two orders with a gain plugin at the end of the chain and listen to the mids and highs on each low note.
4. Replace the EQ with a saturator. Drive it until the loudest notes clearly distort, saturator first.
5. Swap the order so the compressor comes first, raise the compressor's makeup gain until the saturator is again clearly working, and match the loudness again.
6. Listen to the quiet notes in both versions. Note which order gives the distortion you want.
7. As a control, swap two EQ plugins on another track and confirm you hear no difference.

The EQ swap usually changes the movement more than the tone. The saturator swap changes which notes distort.

## Common mistake: following a chain order as a rule

"EQ before compression" and "compression before saturation" get passed around as rules. They are starting points, and each one is right for some parts and wrong for others. The useful question is which stage should hear which version of the signal. Decide whether the compressor should react to the boosted low end, and whether the saturator should hear the raw dynamics or the evened ones, then order the chain to match.

The other mistake is comparing two orders without matching levels. Swapping a compressor and an EQ often changes the output level, and the louder version tends to win, as the [lesson on loudness bias](/blog/why-louder-is-not-always-bigger) explains.

## Producer takeaway: ask what should drive what

For every nonlinear plugin in a chain, decide what it should hear. Fix level problems before the compressor, as in the [lesson on clip gain](/blog/clip-gain-and-automation-before-compression). Cut what should not steer the gain before it, and boost what is purely tonal after it. Put saturation after compression when you want the grit even, and before it when you want the grit to follow the playing. Keep the limiter last. Linear EQs can go anywhere. The [lesson on what plugins compute](/blog/every-plugin-is-math-wearing-an-interface) sorts plugins into linear and nonlinear changes, and that split decides whether their order matters.

## References

- Dutilleux, P., Dempwolf, K., Holters, M., & Zölzer, U. (2011). Nonlinear processing. In U. Zölzer (Ed.), *DAFX: Digital Audio Effects* (2nd ed., ch. 4). Wiley.
- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. W3K Publishing. https://ccrma.stanford.edu/~jos/filters/
`,
    seo: {
        title: 'Plugin order changes what each processor hears | VGP Studio',
        description: 'Why swapping two EQs changes nothing but swapping an EQ and a compressor, or a compressor and a saturator, changes the sound. Worked examples and a test.',
        keywords: ['plugin order', 'EQ before or after compression', 'signal chain order', 'saturation before compression', 'mastering chain order', 'insert order'],
    },
};
