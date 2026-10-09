import { BlogArticle } from '../blog-data';

// Two 50 Hz waves over a 40 ms window: two cycles. 5 ms is 90 degrees, 10 ms is 180.
const WAVE = { cycles: 2, amp: 0.45 };

export const post027: BlogArticle = {
    slug: 'how-kick-placement-changes-perceived-weight',
    title: 'How kick placement changes perceived weight',
    excerpt: 'When a kick and bass overlap, a few milliseconds of offset decide whether their low end adds or cancels. Here is the phase maths and a nudge test.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-05',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'When a kick and bass overlap at the same frequency, a timing offset is a phase shift that decides whether they add or cancel.',
        'At 50 Hz a 10 ms offset is half a cycle, and the delay that causes a half-cycle flip shrinks as the frequency rises.',
        'Check polarity and timing by ear with the low end isolated before you reach for EQ.',
    ],
    figures: {
        phase: {
            type: 'signal',
            caption:
                'Two 50 Hz waves at equal level, 40 ms shown. In phase they add to twice the height, 6 dB above one wave. 5 ms apart is a quarter cycle and the sum is only 3 dB above one wave. 10 ms apart is half a cycle and they cancel.',
            alt: 'Three plots of two sine waves and their sum. In the first the sum is twice as tall as each wave. In the second one wave is shifted a quarter cycle and the sum is somewhat taller than one wave. In the third the waves are opposite and the sum is a flat line.',
            rows: [
                {
                    label: 'In phase, 0 ms',
                    traces: [
                        { kind: 'sine', ...WAVE, muted: true, label: 'Each wave' },
                        { kind: 'sum', parts: [WAVE, WAVE], label: 'Sum' },
                    ],
                },
                {
                    label: '5 ms apart, 90°',
                    traces: [
                        { kind: 'sine', ...WAVE, muted: true },
                        { kind: 'sine', ...WAVE, phase: -90, muted: true, dashed: true },
                        { kind: 'sum', parts: [WAVE, { ...WAVE, phase: -90 }] },
                    ],
                },
                {
                    label: '10 ms apart, 180°',
                    traces: [
                        { kind: 'sine', ...WAVE, muted: true },
                        { kind: 'sine', ...WAVE, phase: -180, muted: true, dashed: true },
                        { kind: 'sum', parts: [WAVE, { ...WAVE, phase: -180 }] },
                    ],
                },
            ],
        },
        halfcycle: {
            type: 'bars',
            min: 0,
            max: 14,
            unit: 'ms',
            caption:
                'The offset that puts two waves half a cycle apart, 1 / (2f). A 5 ms nudge is a 72 degree shift at 40 Hz but a full cancellation at 100 Hz, so check any nudge across the bass notes the song uses.',
            alt: 'Five bars for the half-cycle delay: 12.5 ms at 40 Hz, 10 ms at 50 Hz, 8.3 ms at 60 Hz, 6.25 ms at 80 Hz and 5 ms at 100 Hz.',
            bars: [
                { label: '40 Hz', value: 12.5 },
                { label: '50 Hz', value: 10 },
                { label: '60 Hz', value: 8.33, display: '8.3 ms' },
                { label: '80 Hz', value: 6.25 },
                { label: '100 Hz', value: 5 },
            ],
        },
    },
    quiz: [
        {
            q: 'A kick tail and a bass note both sit at 50 Hz at equal level. What offset makes them cancel?',
            options: ['2.5 ms', '5 ms', '10 ms', '20 ms'],
            answer: 2,
            why: 'At 50 Hz one cycle lasts 20 ms. Half a cycle, 10 ms, turns one wave upside down against the other.',
        },
        {
            q: 'Two equal waves are 90 degrees apart. Compared with one wave alone, how loud is their sum?',
            options: ['3 dB louder', '6 dB louder', 'The same level', 'Silent'],
            answer: 0,
            why: 'The sum is 2 × cos(45°) = 1.41 times the amplitude of one wave, which is 3 dB. Perfectly in phase it would be twice the amplitude, 6 dB.',
        },
        {
            q: 'Why does boosting 50 Hz on both the kick and the bass not fix a cancellation at 50 Hz?',
            options: [
                'Most EQ bands cannot boost as low as 50 Hz',
                'The boost changes the pitch of both parts',
                'The bus limiter removes the added low end',
                'Both waves rise equally and still cancel',
            ],
            answer: 3,
            why: 'Cancellation depends on relative timing and polarity, not level. Equal boosts keep the same relationship, so the hole stays while the rest gets louder.',
        },
    ],
    content: `## Hook: the disappearing low end

You choose a punchy kick and a deep sub bass. Soloed, each one sounds huge. Together, the low end thins out and the impact disappears. You boost 50 Hz on the kick and 60 Hz on the bass. The mix gets muddier, the master meter climbs, and the speakers still do not move the air the way they should.

The frequencies were fine. The problem is how the two waves meet. When a kick and a bass overlap at similar frequencies, their relative timing decides whether they add or cancel, and a few milliseconds is enough to flip the result.

## Why it matters: overlapping waves add or subtract

Waves in the same place add point by point. Where the kick's wave is positive while the bass's is negative, they subtract. Where both point the same way, they reinforce. This is superposition, the basic rule for any two waves that overlap (Lee, 2016).

So the start of each sound matters. If the kick's low tail and the bass note share a frequency, shifting either one in time shifts their phase relationship. Snapping both to the same grid line does not guarantee that they line up: each sample has its own starting phase, and a kick's pitch usually falls as it decays. Grid alignment and wave alignment are different things.

::figure phase

::demo phase

The demo uses two copies of the same bass, the extreme case where the cancellation can be total. A real kick and bass match only in part, so you get a thinner, weaker low end rather than silence, and the result changes from note to note.

## Science model: a timing offset is a phase shift

A timing offset $\\Delta t$ between two waves of frequency $f$ shifts their phase by:

$$\\varphi = 360^\\circ \\times f \\times \\Delta t$$

For two waves of equal level, the amplitude of the sum is:

$$A_{\\text{sum}} = 2A \\left| \\cos\\left(\\frac{\\varphi}{2}\\right) \\right|$$

At 50 Hz one cycle lasts 20 ms. A 5 ms offset is 90 degrees, and the sum is 3 dB louder than either wave alone, down from 6 dB when they are perfectly in phase. A 10 ms offset is 180 degrees, half a cycle, and two equal waves cancel. The delay that causes a half-cycle flip is $\\Delta t = 1 / (2f)$, so it shrinks as the frequency rises: 12.5 ms at 40 Hz, but only 5 ms at 100 Hz.

::figure halfcycle

Timing also changes how the attacks read. If the bass note starts at the same instant as the kick's click, the two onsets merge into one event. Starting the bass a few milliseconds later, or ducking it under the kick, lets the click speak first and the bass carry the weight after it. Notes that start a little apart are easier for the ear to separate, even when they still sound simultaneous (Moore, 2012).

## DAW experiment: the kick and bass nudge

1. Loop four bars where the kick and sub bass play together, and route both to one bus with a peak or RMS meter.
2. Put a low-pass filter at 120 Hz on that bus so you hear only the low end. Remove it when you finish.
3. Flip the polarity of the bass. If the low end gets fuller, keep it flipped.
4. Turn off snap and set the bass track delay to -5 ms, then step it in 1 ms increments up to +5 ms, listening at each step.
5. Watch the meter where the kick and bass overlap. Mark the setting where it reads highest and the low end sounds fullest.
6. Remove the filter and check the full mix. The kick's click should still land with the snare and hats.
7. If the best setting changes from note to note, shorten the kick's tail or duck the bass with sidechain compression instead.

At one setting the low end turns round and solid and the meter rises. At another it thins out and the meter drops. A meter that rises as the low end gets fuller tells you the waves are adding.

## Common mistake: boosting EQ to fill a hole

The common mistake is trying to fix a low-end cancellation with EQ. If two waves cancel at 55 Hz, boosting 55 Hz on both raises them by the same amount, and they still cancel. You add level everywhere else, eat headroom and clip the master bus while the hole stays where it was. Fix polarity and timing first, then EQ.

The other mistake is moving the kick far off the grid to cure the phase. The kick carries the beat, and shifting it 8 ms changes the feel of the whole groove. Move the bass instead, or tune the kick so it does not fight the bass note.

## Producer takeaway: slot the low end in time

Manage the low end in time as well as in frequency. Keep the kick anchored on the beat and let the bass answer it. If the kick has a long tail, shorten it so the bass has room. If the bass has a hard attack, duck it under the kick with sidechain compression or volume automation. The kick gives the punch, the bass gives the sustained weight, and timing decides whether they help or cancel each other.

## References

- Lee, Y.-J. (2016). *8.03SC Physics III: Vibrations and Waves*. MIT OpenCourseWare. https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
`,
    seo: {
        title: 'How kick placement changes perceived weight | VGP Studio',
        description: 'Why kick and bass can cancel when they overlap, the phase maths of a few milliseconds of offset, and a nudge test to restore low-end weight.',
        keywords: ['kick placement', 'kick and bass phase', 'phase cancellation', 'low end', 'mixing tips', 'polarity'],
    },
};
