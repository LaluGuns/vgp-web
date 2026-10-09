import { BlogArticle } from '../blog-data';

const A = { kind: 'sine' as const, cycles: 2, amp: 0.45 };

export const post095: BlogArticle = {
    slug: 'phase-explained-without-panic',
    title: 'Phase is timing with consequences',
    excerpt: 'Two copies of a sound add up or cancel depending on their timing. Fix polarity and alignment on related mics before you reach for EQ, then check the mix in mono.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Two copies of a sound reinforce when they are in step and cancel half a cycle apart, so their sum depends on timing.',
        'A polarity flip inverts every frequency at once. A delay cancels a comb of frequencies, starting at one over twice the delay.',
        'Fix polarity and alignment on related mics before you reach for EQ, then check the mix in mono.',
    ],
    figures: {
        sum: {
            type: 'signal',
            caption:
                'Two equal sine waves and their sum. In step they add to twice the height, +6 dB. A quarter cycle apart (90 degrees) they add to 1.41 times, +3 dB. Half a cycle apart they cancel completely.',
            alt: 'Three plots, each with two thin sine waves and their sum drawn bold. When the waves line up, the sum is twice as tall. When they are a quarter cycle apart, the sum is a bit taller than either. When they are half a cycle apart, the sum is a flat line.',
            rows: [
                {
                    label: 'In step: +6 dB',
                    traces: [
                        { ...A, muted: true, label: 'Track A' },
                        { ...A, muted: true, dashed: true, label: 'Track B' },
                        { kind: 'sum', parts: [A, A], label: 'Sum' },
                    ],
                },
                {
                    label: '90 degrees apart: +3 dB',
                    traces: [
                        { ...A, muted: true },
                        { ...A, phase: 90, muted: true, dashed: true },
                        { kind: 'sum', parts: [A, { ...A, phase: 90 }] },
                    ],
                },
                {
                    label: '180 degrees apart: silence',
                    traces: [
                        { ...A, muted: true },
                        { ...A, phase: 180, muted: true, dashed: true },
                        { kind: 'sum', parts: [A, { ...A, phase: 180 }] },
                    ],
                },
            ],
        },
        comb: {
            type: 'spectrum',
            mode: 'gain',
            range: [100, 10000],
            dbRange: [-30, 6],
            caption:
                'A sound mixed with an equal copy of itself delayed by 1 ms. Every frequency where the delay is an odd number of half cycles cancels: 500 Hz, 1.5 kHz, 2.5 kHz and on up, 1 kHz apart. Halfway between the notches the two copies add to +6 dB. The notches are evenly spaced in hertz, so on this log scale they crowd together toward the top.',
            alt: 'Gain against frequency from 100 Hz to 10 kHz for a signal plus a 1 ms delayed copy. The curve peaks at +6 dB and drops into deep notches at 500 Hz, 1.5 kHz, 2.5 kHz and every further 1 kHz, which bunch closer together toward the right.',
            curves: [{ kind: 'comb', delayMs: 1, mix: 1, label: '1 ms delay' }],
            marks: [
                { f: 500, label: '500 Hz' },
                { f: 1500, label: '1.5 kHz' },
            ],
        },
    },
    quiz: [
        {
            q: 'A copy of a track is delayed by 2 ms and mixed back in. Where is the first notch?',
            options: ['2 kHz', '500 Hz', '250 Hz', '1 kHz'],
            answer: 2,
            why: 'The first notch is where the delay equals half a cycle: 1 / (2 × 0.002 s) = 250 Hz. The next ones follow every 500 Hz.',
        },
        {
            q: 'Why does a polarity flip fix a snare top and bottom pair, but not two mics at different distances?',
            options: [
                'A delay shifts each frequency by a different angle',
                'A flip equals a half-cycle delay at every frequency',
                'Distant mics pick up too little low end to cancel',
                'The farther mic is quieter, so a flip cannot match it',
            ],
            answer: 0,
            why: 'The snare mics are opposite but nearly aligned in time, so flipping one fixes every frequency. A time offset needs a time correction, because it cancels some frequencies and not others.',
        },
        {
            q: 'Two equal signals are 90 degrees apart at one frequency. How much louder than one of them is their sum at that frequency?',
            options: ['+6 dB', '+3 dB', '0 dB', '-3 dB'],
            answer: 1,
            why: '2 × cos(45°) = 1.41 times the amplitude, which is +3 dB. In step it would be +6 dB, and 180 degrees apart they would cancel.',
        },
    ],
    content: `## Hook: the snare that EQ cannot thicken

You are mixing a snare recorded with two microphones, one above the top head and one below the bottom head. Together they sound thin. You boost 200 Hz by 6 dB and the snare gets louder but no thicker. You boost more and it turns hollow and harsh.

The thin sound comes from how the two mics add up. When the stick drives the heads down, the top head moves away from the top mic while the bottom head moves toward the bottom mic, so the two mics produce waveforms of opposite polarity. Added together, they cancel much of the body of the drum. Boosting a frequency that is cancelling boosts both halves of the cancellation.

## Why it matters: two copies, one result

Phase describes where a wave is in its cycle. When two signals that carry the same sound are mixed, their sum depends on how their cycles line up. In step, they reinforce: two equal copies add up to 6 dB louder. Half a cycle apart, they cancel. Anywhere in between, you get something in between.

::figure sum

This happens whenever one sound reaches two microphones at different times, whenever a track is layered with a slightly delayed copy of itself, and whenever a stereo trick is folded to mono. The low end is where it hurts most. Low frequencies carry most of the weight of a mix, and two nearby mics pick up nearly the same low-frequency waveform, so their sum depends almost entirely on how well they are aligned.

::demo phase

## Science model: phase, polarity and comb filtering

For two equal sines that differ in phase by $\\Delta\\phi$, the sum has an amplitude of

$$A = 2 \\cos\\left(\\frac{\\Delta\\phi}{2}\\right)$$

times the amplitude of one of them. At 0 degrees that is 2, or +6 dB. At 90 degrees it is 1.41, or +3 dB. At 120 degrees it is 1, no gain at all, and at 180 degrees it is 0.

A time delay does not shift every frequency by the same angle. A delay of $\\Delta t$ moves each frequency $f$ by $360° \\times f \\Delta t$, so some frequencies stay in step and others land half a cycle apart. Mixing a sound with a delayed copy of itself cancels every frequency where the delay is an odd number of half cycles:

$$f_{\\text{notch}} = \\frac{2k + 1}{2\\,\\Delta t}, \\quad k = 0, 1, 2, \\dots$$

With a 1 ms delay the notches sit at 500 Hz, 1.5 kHz, 2.5 kHz and on up, 1 kHz apart. That evenly spaced pattern is comb filtering. A longer delay pulls the first notch lower: at 5 ms it sits at 100 Hz, right in the punch of a kick.

::figure comb

Polarity is a different control. The polarity switch, usually marked Ø, flips the waveform upside down at every frequency at once, with no delay. It fixes the snare top and bottom problem, because those two mics are opposite but almost aligned in time. It cannot fix a time offset, because a delay affects each frequency differently. For that you move the track in time.

## DAW experiment: build cancellations on purpose

1. Put a mono kick or bass sample on a track and duplicate it.
2. Play both at the same level. The sound is 6 dB louder and otherwise unchanged.
3. Flip the polarity of the copy. The two cancel to silence.
4. Undo the flip and delay the copy by 1 ms, which is 48 samples at 48 kHz. The sound turns hollow, with notches at 500 Hz, 1.5 kHz and up.
5. Increase the delay to 5 ms, 240 samples. The first notch drops to 100 Hz and the low punch thins out.
6. Set the delay back to 1 ms and flip the polarity again. Now the lows cancel and the region around 500 Hz doubles, so the kick turns thin and clicky.

A polarity flip changes every frequency at once. A delay picks out specific frequencies to cancel, and the longer the delay, the lower the damage starts.

## Common mistake: chasing perfect alignment everywhere

With several mics on one source, you cannot align everything at once. If you slide the room mics so they line up with the snare, they are still offset for the toms and cymbals, which sit at different distances. Align the most important source, usually the kick and snare, check the result by ear and leave the rest.

Delays between left and right are also how some stereo width is made. A short delay on one side, the Haas effect, sounds wide in stereo and turns into comb filtering when the two sides are folded to mono. That is why a mono check matters: a part that relies on such a trick can turn hollow or drop in level on a phone speaker or a mono club system. Only a part that is fully opposite in polarity between left and right vanishes completely.

## Producer takeaway: check phase before you reach for EQ

When a multi-mic source sounds thin, fix the timing first. Solo the related mics, sum them to mono and flip the polarity of one, then keep whichever setting gives the fullest low end. If a time offset remains, nudge the later track earlier a fraction of a millisecond at a time until the low end locks together. Only then pick up the EQ. Finish with a mono check of the whole mix, listening for the bass and the lead vocal.

## References

- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
- MIT OpenCourseWare. *8.03SC Physics III: Vibrations and Waves*, Fall 2016. https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/
`,
    seo: {
        title: 'Phase is timing with consequences | VGP Studio',
        description: 'How phase and polarity differ, how a short delay creates comb filtering, and how to align multi-mic recordings and check the mix in mono.',
        keywords: ['audio phase', 'phase cancellation', 'polarity flip', 'comb filtering', 'mono compatibility', 'multi-mic alignment'],
    },
};
