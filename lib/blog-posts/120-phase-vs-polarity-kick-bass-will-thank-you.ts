import { BlogArticle } from '../blog-data';

// A wave with a fundamental and a second harmonic, so a flip and a delay look different.
const WAVE = [
    { cycles: 2, amp: 0.6 },
    { cycles: 4, amp: 0.3 },
];

export const post120: BlogArticle = {
    slug: 'phase-vs-polarity-kick-bass-will-thank-you',
    title: 'Phase and polarity are not the same fix',
    excerpt: 'A polarity flip turns every frequency upside down at once. A delay shifts each frequency by a different angle. Which one you have decides the fix.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-02',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Polarity inverts every frequency at once with no time shift. A delay shifts each frequency by a different angle.',
        'Only related signals cancel reliably: two mics on one source, or layers that start together, like a kick and its sub.',
        'Fix the relationship before the tone: polarity first, then timing or phase rotation, and EQ last.',
    ],
    figures: {
        flip: {
            type: 'signal',
            caption:
                'The same wave, flipped and delayed. A polarity flip mirrors it top to bottom. A delay slides it later in time and keeps its shape. For a pure sine the two can look alike; for a real sound with harmonics they are clearly different.',
            alt: 'Three plots of the same uneven wave. The first is the original. The second is its mirror image upside down. The third is the original shape moved to the right.',
            rows: [
                { label: 'Original', traces: [{ kind: 'sum', parts: WAVE }] },
                {
                    label: 'Polarity flipped',
                    traces: [
                        { kind: 'sum', parts: WAVE, muted: true, label: 'Original' },
                        { kind: 'sum', parts: WAVE.map((p) => ({ ...p, phase: 180 })), label: 'Flipped' },
                    ],
                },
                {
                    label: 'Delayed by a quarter cycle',
                    traces: [
                        { kind: 'sum', parts: WAVE, muted: true, label: 'Original' },
                        { kind: 'sum', parts: [{ cycles: 2, amp: 0.6, phase: -90 }, { cycles: 4, amp: 0.3, phase: -180 }], label: 'Delayed' },
                    ],
                },
            ],
        },
        delay: {
            type: 'signal',
            caption:
                'One delay of 1 ms, three frequencies, over a 4 ms window. At 250 Hz the copies are 90 degrees apart and the sum is 3 dB below a perfect match. At 500 Hz they are 180 degrees apart and cancel. At 1 kHz they are a full cycle apart and add up again.',
            alt: 'Three plots, each with an original sine, a dashed copy delayed by 1 ms, and their sum. At 250 Hz the sum is somewhat smaller than double. At 500 Hz the sum is a flat line. At 1 kHz the sum is double the original.',
            rows: [
                {
                    label: '250 Hz: 90° apart',
                    traces: [
                        { kind: 'sine', cycles: 1, amp: 0.45, muted: true, label: 'Original' },
                        { kind: 'sine', cycles: 1, amp: 0.45, phase: -90, dashed: true, muted: true, label: 'Delayed 1 ms' },
                        { kind: 'sum', parts: [{ cycles: 1, amp: 0.45 }, { cycles: 1, amp: 0.45, phase: -90 }], label: 'Sum' },
                    ],
                },
                {
                    label: '500 Hz: 180° apart',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.45, muted: true },
                        { kind: 'sine', cycles: 2, amp: 0.45, phase: -180, dashed: true, muted: true },
                        { kind: 'sum', parts: [{ cycles: 2, amp: 0.45 }, { cycles: 2, amp: 0.45, phase: -180 }] },
                    ],
                },
                {
                    label: '1 kHz: 360° apart',
                    traces: [
                        { kind: 'sine', cycles: 4, amp: 0.45, muted: true },
                        { kind: 'sine', cycles: 4, amp: 0.45, phase: -360, dashed: true, muted: true },
                        { kind: 'sum', parts: [{ cycles: 4, amp: 0.45 }, { cycles: 4, amp: 0.45, phase: -360 }] },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'What does the polarity button do to a kick drum?',
            options: [
                'It inverts every frequency at once, with no delay',
                'It delays the kick by half its fundamental cycle',
                'It shifts the lows by 180 degrees but not the click',
                'It nudges the kick 1 ms earlier to meet the sub',
            ],
            answer: 0,
            why: 'Polarity multiplies the signal by -1. That is the same 180 degrees at every frequency, which no single delay can do.',
        },
        {
            q: 'Two copies of a sound play 1 ms apart. At which frequency do they first cancel?',
            options: ['50 Hz', '250 Hz', '500 Hz', '1 kHz'],
            answer: 2,
            why: 'Cancellation needs 180 degrees, half a cycle. Half a cycle lasts 1 ms at 500 Hz, because a full cycle at 500 Hz lasts 2 ms.',
        },
        {
            q: 'A kick and a 55 Hz sub layer sound thin together. Nudging the sub by 1 ms changes little. Why?',
            options: [
                'A sub has no transient to line up with',
                'The kick masks the sub, whatever the timing',
                'The sub is out of tune with the kick\'s note',
                '1 ms is a small slice of a 55 Hz cycle',
            ],
            answer: 3,
            why: 'The phase shift is 360° × 55 × 0.001, about 20 degrees. Half a cycle at 55 Hz takes about 9 ms, so the low end only cancels with a much larger offset or a polarity flip.',
        },
    ],
    content: `## Hook: the disappearing low end

You spend twenty minutes on the kick until it hits hard, and twenty more on the sub until it rumbles. Then you play them together and the low end caves in. It sounds thin and hollow, as if someone scooped out the bottom with an EQ.

So you boost the lows on the kick and the lows on the sub, and now the mix is muddy and thin at once. The problem was never the tone of either part. The two signals are working against each other, and before you can fix that you need to know whether you are dealing with polarity or phase. They are related, but they are not the same thing, and they need different fixes.

## Why it matters: only related signals cancel

Cancellation only happens reliably between related signals: two microphones on one source, such as a bass DI and its amp mic or a kick's inside and outside mics, or layers that start together on every hit, such as a kick sample and the sine sub under it. Their relationship is the same every time, so a bad one thins out every single note.

A kick and an unrelated bass line are different. The bass changes notes, so how its waves line up with the kick's changes from hit to hit, and no single polarity setting is right for all of them. That is still worth checking when an 808 or a sub plays the same note as the kick and starts with it, but for a moving bass line the answer is usually arrangement and EQ, not the polarity button.

Whatever the pair, boosting EQ does not fix cancellation. If two signals cancel at a frequency, boosting that frequency on one or both gives you more of each to cancel, and eats headroom on the way.

## Science model: a flip against a shift

Polarity is a flip. Multiply every sample by -1 and every peak becomes a trough. Every frequency is inverted at the same moment, with no change in timing. The button that does this is often labelled phase or drawn as Ø, which is where much of the confusion starts.

Phase is a position in a cycle, and a delay changes it by an amount that depends on frequency:

$$\\Delta \\phi = 360^\\circ \\times f \\times \\Delta t$$

A 1 ms delay is 90 degrees at 250 Hz, 180 degrees at 500 Hz and a full 360 degrees at 1 kHz, where the copies line up again. So a delay does not shift everything by one angle the way a flip does. That is why a flip and a delay only look alike on a pure sine.

::figure flip

When a signal is added to a delayed copy of itself, the frequencies where the delay reaches an odd multiple of 180 degrees cancel. The notches fall at:

$$f_{\\text{notch}} = \\frac{2k + 1}{2\\tau}, \\quad k = 0, 1, 2, \\dots$$

For $\\tau = 1$ ms that is 500 Hz, 1.5 kHz, 2.5 kHz and on up, a comb filter (Smith, 2010). The same formula explains a point that matters for kick and sub: to cancel at 55 Hz you need half a cycle, about 9 ms. A 1 ms offset is only about 20 degrees at 55 Hz and barely touches the sub. Small timing errors hollow out the mids and the click; the deep low end is lost mainly to a polarity mismatch or to a large offset.

::figure delay

Filters shift phase too, without any delay. A high-pass filter, an amp and speaker cabinet, or an analog-style EQ rotates the phase of low frequencies by an amount that changes with frequency (Smith, 2007). Two layers can line up perfectly at the transient and still fight in the sub range because one of them went through a filter.

Hear both effects on two copies of a bass note. At 55 Hz, about 9 ms of delay puts the layers half a cycle apart.

::demo phase

## DAW experiment: line up a kick and its sub

Use a kick sample and a sine sub, or an 808, that hits on the same beats and plays the kick's low note.

1. Put the kick and the sub on two tracks, both starting exactly on the beat, and fold the mix to mono.
2. Zoom in on the first 20 ms of one hit and check whether the sub's first half-cycle moves in the same direction as the kick's low thump.
3. Flip the sub's polarity and listen to the first 100 ms of each hit. Keep whichever setting sounds fuller and punchier.
4. If neither is clearly better, nudge the sub later in 0.5 ms steps, up to about 5 ms, and stop where the low end is fullest.
5. Add a high-pass at 30 Hz on the kick only, then try the polarity flip again. The filter's phase shift can change which setting wins.
6. Bounce the best version and the worst one and compare them on a small speaker as well as on your monitors.

The right combination sounds like one big hit with weight under the click. The wrong one sounds like a click with the bottom missing.

## Common mistake: EQ as a phase fix

The biggest mistake is treating cancellation as a tone problem. The symptom looks like a lack of low end, so you boost 60 Hz on the kick and 80 Hz on the bass. The result is louder and still hollow, with less headroom.

The second is trusting your eyes. Lining up the transients on screen does not guarantee the low frequencies line up, because filters and amps shift their phase without moving the transient. Let your ears in mono decide, and if polarity and timing do not settle it, try a phase rotation tool, which shifts phase without delaying the signal.

## Producer takeaway: fix the relationship before the tone

When two parts each sound full alone but thin together, work in order: check polarity, which is free and instant, then timing, then phase rotation. Reach for EQ only after the relationship is right.

The same rules apply wherever related signals meet: snare top and bottom mics, a guitar amp with two mics, a bass DI and its amp. For multi-mic drums, see the [lesson on phase as timing](/blog/phase-explained-without-panic).

## References

- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
- Smith, J. O. (2010). *Physical Audio Signal Processing*. W3K Publishing. https://ccrma.stanford.edu/~jos/pasp/
`,
    seo: {
        title: 'Phase and polarity are not the same fix | VGP Studio',
        description: 'Polarity inverts every frequency at once; a delay shifts each by a different angle. How to tell them apart and line up a kick and sub before you reach for EQ.',
        keywords: ['phase vs polarity', 'phase cancellation', 'kick and sub', 'comb filtering', 'polarity flip', 'low end mixing'],
    },
};
