import { BlogArticle } from '../blog-data';

export const post134: BlogArticle = {
    slug: 'what-a-correlation-meter-actually-tells-you',
    title: 'What a correlation meter tells you',
    excerpt: 'A correlation meter measures how alike the two channels are, weighted by energy. Learn the maths, what a reading predicts for mono and what it cannot see.',
    category: 'audio-science',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Read the needle as a mono forecast for equal-level channels: +1 loses nothing, 0 drops 3 dB, -0.5 drops 6 dB.',
        'Do not trust a healthy full-mix reading on its own, because a quiet anti-phase part barely moves an energy-weighted meter.',
        'Use the meter to find which part to check, then make the decision by listening in stereo and in mono.',
    ],
    figures: {
        pairs: {
            type: 'signal',
            caption:
                'For two equal sines, the correlation is the cosine of the phase difference between them. In step it is +1, a quarter cycle apart it is 0, half a cycle apart it is -1.',
            alt: 'Three plots, each with a solid left wave and a dashed right wave. In the first they lie on top of each other. In the second the right wave is shifted by a quarter cycle. In the third the right wave peaks where the left dips.',
            rows: [
                {
                    label: 'r = +1, in step',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.8, label: 'Left' },
                        { kind: 'sine', cycles: 2, amp: 0.8, label: 'Right', dashed: true },
                    ],
                },
                {
                    label: 'r = 0, 90° apart',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.8, label: 'Left' },
                        { kind: 'sine', cycles: 2, amp: 0.8, phase: 90, label: 'Right', dashed: true },
                    ],
                },
                {
                    label: 'r = -1, 180° apart',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.8, label: 'Left' },
                        { kind: 'sine', cycles: 2, amp: 0.8, phase: 180, label: 'Right', dashed: true },
                    ],
                },
            ],
        },
        mono: {
            type: 'bars',
            caption:
                'Level of the mono fold (L + R) / 2 against the level of one channel, for two channels of equal level, computed from 10 log((1 + r) / 2). Positive readings cost little. Below zero the loss grows fast, and at -1 nothing is left.',
            alt: 'Six bars. A reading of +1 keeps 0 dB, +0.5 gives -1.2 dB, 0 gives -3 dB, -0.5 gives -6 dB, -0.9 gives -13 dB, and -1 is silent.',
            min: -18,
            max: 0,
            unit: 'dB',
            bars: [
                { label: 'r = +1', value: 0, display: '0 dB' },
                { label: 'r = +0.5', value: -1.2, display: '-1.2 dB' },
                { label: 'r = 0', value: -3, display: '-3 dB' },
                { label: 'r = -0.5', value: -6, display: '-6 dB' },
                { label: 'r = -0.9', value: -13, display: '-13 dB' },
                { label: 'r = -1', value: -18, display: 'silent', dim: true },
            ],
        },
        hidden: {
            type: 'scale',
            caption:
                'A mix where centred parts hold 90% of the energy and a pad in opposite polarity holds 10%. The meter averages them by energy and reads +0.8, which looks healthy, while the pad disappears completely in mono.',
            alt: 'A line from -1 to +1. A marker at -1 is labelled pad, 10%, a marker at +1 is labelled centre parts, 90%, and a larger marker at +0.8 is labelled meter.',
            min: -1,
            max: 1,
            ticks: [-1, -0.5, 0, 0.5, 1],
            markers: [
                { value: -1, label: 'Pad, 10%' },
                { value: 0.8, label: 'Meter +0.8', strong: true },
                { value: 1, label: 'Centre parts, 90%' },
            ],
        },
    },
    quiz: [
        {
            q: 'A mono vocal is panned 30% left, so the right channel is a quieter copy of the left. What does the correlation meter read?',
            options: ['About +0.3', 'About 0', 'About +0.7', '+1'],
            answer: 3,
            why: 'The right channel is the left multiplied by a positive number. The level cancels out of the formula, so any panned mono source that is in both channels reads +1.',
        },
        {
            q: 'The two channels have equal level and the meter reads -0.5. How loud is the mono fold (L + R) / 2 compared with one channel?',
            options: ['-1.2 dB', '-3 dB', '-6 dB', '-12 dB'],
            answer: 2,
            why: 'The mono fold has (1 + r) / 2 of one channel\'s power. With r = -0.5 that is 0.25, and 10 log(0.25) is -6 dB.',
        },
        {
            q: 'The full mix reads +0.8, yet a pad vanishes when you switch to mono. Why did the meter not warn you?',
            options: [
                'The pad holds little energy, so it barely moves the average',
                'Correlation meters ignore anything panned away from the centre',
                'The meter reads only the low end, and pads live higher up',
                'A positive reading means the mono fold is louder than stereo',
            ],
            answer: 0,
            why: 'The meter is an energy-weighted average over everything playing. A pad at -1 with a tenth of the energy pulls a +1 mix down only to +0.8.',
        },
    ],
    content: `## Hook: the needle in the chorus

The correlation meter on your master sits happily near +1 through the verse. In the chorus it swings toward zero and keeps flicking below it. You panic, narrow the pads, pull the room mics in, and the chorus gets smaller. Another day, on another song, the needle never leaves +0.9 and the mix still falls apart on a phone.

Both times the meter was right about the question it answers, which is narrower than the one you were asking.

## Why it matters: one number for a whole stereo picture

A correlation meter compresses everything about two channels into one value between -1 and +1. That number predicts something specific and useful about the mono fold. It says nothing about whether the width suits the song, how wide the image sounds, or which part is responsible. Read it as more than it is and you will mix to the needle.

## Science model: a normalized cross-product

Over a short window, the meter computes

$$r = \\frac{\\sum L \\cdot R}{\\sqrt{\\sum L^2 \\cdot \\sum R^2}}$$

which is the correlation coefficient of the two channels (Bendat and Piersol, 2010). Identical channels give +1. If $R = -L$ it is -1. Two unrelated signals, such as the two sides of a dense reverb, average out to about 0. For two equal sines a phase angle $\\theta$ apart, $r = \\cos\\theta$.

::figure pairs

Level cancels out of the formula. If the right channel is the left at half the level, $r$ is still exactly +1. A mono source panned anywhere short of hard left or right reads +1, so the meter cannot see amplitude panning at all. Pan something fully to one side and the other channel is silent: the formula divides 0 by 0, and what the meter shows then depends on how it was built.

The mono forecast comes from the same terms. For two channels of equal power $P$, the fold $(L + R)/2$ has power $P(1 + r)/2$, so its level against one channel is

$$\\Delta = 10 \\log_{10} \\frac{1 + r}{2} \\ \\text{dB}$$

At +1 nothing is lost. At 0 the fold is 3 dB down, which is ordinary power addition, not a cancellation; unrelated reverb sides simply add. At -0.5 it is 6 dB down, and at -1 it is gone. For sines this matches the [mono lesson's](/blog/why-mono-reveals-what-stereo-hides) phase table, since $(1 + \\cos\\theta)/2 = \\cos^2(\\theta/2)$.

::figure mono

The equal-level condition matters. In the [mid/side lesson](/blog/mid-side-widening-moves-the-center-too), a hard-left guitar after a +6 dB side boost has $L = 1.5x$ and $R = -0.5x$. That pair reads exactly -1, yet its mono fold is $0.5x$, the same as before the boost. For channels of unequal level, -1 means the quieter channel subtracts from the louder one. The fold only goes silent when the levels match as well.

The meter is also an average weighted by energy. With several unrelated parts, each with equal level in both channels, the reading is each part's own $r$ weighted by its share of the power. If centred parts hold 90% of the energy and an anti-phase pad holds 10%, the meter shows $0.9 - 0.1 = 0.8$. The pad vanishes in mono, and the needle hardly mentions it. In many mixes the low end holds much of the energy, so a full-mix reading leans heavily on what the bass is doing.

::figure hidden

What the number does not predict is how wide the image sounds. Kurozumi and Ohgushi (1983) played noise with controlled correlation from two loudspeakers. Judged width depended on the magnitude of the coefficient, with the image growing wider as the coefficient approached zero, while its sign changed how far away the image seemed. By that result a pad at -0.3 can sound about as wide as one at +0.3, yet the first loses 4.6 dB in mono and the second 1.9 dB. The study used noise, not music, but the warning carries: the sign answers a mono question and says little about width.

One more relation ties the needle to mid/side. For channels of equal level, $r = (P_M - P_S)/(P_M + P_S)$, so the meter crosses zero exactly where side power equals mid power. In the demo, watch the needle fall toward that point as the side rises.

::demo width

## DAW experiment: calibrate your own meter

1. Put a correlation meter and a mono switch on the master, with the meter before the switch.
2. Play a mono vocal centred and note the reading. Pan it 30% left and check that the reading does not change. Then pan it hard left and see what your meter shows.
3. Duplicate a pad, invert the polarity of its right channel only and play it alone. The meter reads -1 and the mono fold is silent.
4. Play a stereo reverb return alone. The needle hovers near 0 and moves around; in mono the reverb drops a few dB but does not turn hollow.
5. Play the full chorus and note the reading. Mute the widest part and see how far the needle moves, then compare that part in stereo and mono by ear.
6. On a pad, raise the side level until the meter reaches 0. If your utility shows mid and side levels, they read the same at that point.

Expect the needle to move far less for quiet parts than your ears do in mono, which is why the last check is always by ear.

## Common mistake: mixing to the needle

One mistake is treating a threshold, such as "stay above +0.5", as a rule. A natural stereo room recording or a wide synth can sit lower and fold to mono with only a few dB of loss, which is often fine. Narrowing it to please the meter makes the mix smaller without making it safer.

The other is trusting a positive reading on the full mix. Energy weighting lets a quiet anti-phase part hide behind a healthy number. A meter that shows correlation per frequency band helps, and a mono check with your ears helps more.

## Producer takeaway: read it as a mono forecast

Use the reading as a mono forecast and a pointer. When it drops, find the part responsible, fold to mono and listen to what that part loses. Then decide whether the width earns its cost in the song. The meter can tell you that the channels disagree, but whether that belongs in the record is your call.

## References

- Bendat, J. S., & Piersol, A. G. (2010). *Random Data: Analysis and Measurement Procedures* (4th ed.). Wiley.
- Kurozumi, K., & Ohgushi, K. (1983). The relationship between the cross-correlation coefficient of two-channel acoustic signals and sound image quality. *The Journal of the Acoustical Society of America*, 74(6), 1726-1733.
`,
    seo: {
        title: 'What a correlation meter tells you | VGP Studio',
        description: 'The maths behind the stereo correlation meter: what a reading predicts for mono, why panning cannot move it, and the quiet problems it hides.',
        keywords: ['correlation meter', 'phase correlation', 'mono compatibility', 'stereo metering', 'mid side', 'stereo width'],
    },
};
