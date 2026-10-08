import { BlogArticle } from '../blog-data';

const COPY = { cycles: 3, amp: 0.42 };

export const post039: BlogArticle = {
    slug: 'why-layered-sounds-often-get-smaller',
    title: 'Too many layers make sounds smaller',
    excerpt: 'Similar layers do not simply add. Offsets cut notches, detune makes the level swell and sag, and attacks smear. Layer by role instead of by copy.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Copies of a sound add or cancel depending on their phase: double in phase, silence at 180 degrees.',
        'A time offset cuts evenly spaced notches, detune makes the level swell and sag, and mixed attacks smear the start of each note.',
        'Layer by role, with each layer filtered to its own band, and keep the single best layer if the stack does not beat it.',
    ],
    figures: {
        phase: {
            type: 'signal',
            caption:
                'Two equal copies of a sine at three phase offsets, computed. In phase they double. A third of a cycle apart, the sum is no louder than one copy. Half a cycle apart, they cancel completely.',
            alt: 'Three plots. In each, a grey sine shows one copy and a white line shows the sum of two copies. The sum is twice as tall in the first plot, the same height in the second and a flat line in the third.',
            rows: [
                {
                    label: 'In phase: twice the level',
                    traces: [
                        { kind: 'sine', ...COPY, muted: true, label: 'One copy' },
                        { kind: 'sum', parts: [COPY, COPY], label: 'Sum of two' },
                    ],
                },
                {
                    label: '120° apart: same as one copy',
                    traces: [
                        { kind: 'sine', ...COPY, muted: true },
                        { kind: 'sum', parts: [COPY, { ...COPY, phase: 120 }] },
                    ],
                },
                {
                    label: '180° apart: silence',
                    traces: [
                        { kind: 'sine', ...COPY, muted: true },
                        { kind: 'sum', parts: [COPY, { ...COPY, phase: 180 }] },
                    ],
                },
            ],
        },
        beats: {
            type: 'signal',
            caption:
                'Two equal tones slightly apart in pitch, computed. Their sum swells to double and falls to silence once per cycle of the pitch difference. On a detuned bass this is a slow rise and fall in level.',
            alt: 'A fast wave whose height swells to a maximum at both ends of the plot and shrinks to nothing in the middle.',
            rows: [
                {
                    label: 'Two slightly detuned copies',
                    traces: [
                        {
                            kind: 'sum',
                            parts: [
                                { cycles: 24, amp: 0.45 },
                                { cycles: 25, amp: 0.45 },
                            ],
                        },
                    ],
                },
            ],
        },
        roles: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'A stack layered by role, sketched. Each layer owns its own band, so together they add body, bite and air instead of interfering in one range.',
            alt: 'Three humps across the spectrum: a solid one labelled body around 200 Hz, a dashed one labelled edge around 2.5 kHz and a grey one labelled air around 9 kHz.',
            curves: [
                { kind: 'hump', center: 200, width: 1, level: 0.8, label: 'Body' },
                { kind: 'hump', center: 2500, width: 0.8, level: 0.6, label: 'Edge', dashed: true },
                { kind: 'hump', center: 9000, width: 0.6, level: 0.45, label: 'Air', muted: true },
            ],
        },
    },
    quiz: [
        {
            q: 'Two equal copies of a sound are 180 degrees out of phase. What do you hear?',
            options: ['Twice the level', 'The same level', 'No sound at all', 'An octave higher'],
            answer: 2,
            why: 'With equal amplitudes the sum is 2A |cos(Δφ/2)|. At 180 degrees the cosine of 90 degrees is zero, so every peak of one copy meets a trough of the other.',
        },
        {
            q: 'A copy of a lead is delayed by 1 ms. Where is the first notch?',
            options: ['100 Hz', '500 Hz', '1 kHz', '2 kHz'],
            answer: 1,
            why: 'The first notch is where the delay equals half a period: 1 / (2 × 0.001 s) = 500 Hz. The next ones sit at 1.5 kHz, 2.5 kHz and so on.',
        },
        {
            q: 'Why does a 5-cent detune sound like a slow swell on a bass note but a shimmer on a high note?',
            options: [
                'Five cents is a wider gap in hertz on high notes',
                'Bass notes lack the harmonics that detune affects',
                'Synths add more chorus to high notes than low ones',
                'Detune shifts the timing of low notes, not high ones',
            ],
            answer: 0,
            why: 'Five cents is about 0.32 Hz at 110 Hz but about 2.5 Hz at 880 Hz. Two tones beat at their difference in hertz, so the low note swells slowly and the high one shimmers.',
        },
    ],
    content: `## Hook: the shrinking wall of sound

You want a massive lead. You load a bright saw preset. It sounds good, but you want huge, so you duplicate the track and load another saw on the copy, then a third. Three leads now play the same notes. You hit play expecting a wall of sound.

Instead the lead sounds smaller: thinner, blurrier, missing the midrange weight it had. Mute two of the layers and the one left sounds heavier and clearer.

Similar waves do not simply add. Whether they reinforce or cancel depends on their phase, and in a stack of near-identical sounds that relationship shifts from moment to moment and from one frequency to the next.

## Why it matters: copies interfere

Two copies of the same sound in phase add to twice the amplitude, 6 dB louder. Flip the polarity of one and they cancel completely. Most stacks sit somewhere between those extremes, and they keep moving.

Stacks rarely line up exactly. Samples start a few milliseconds apart, oscillators start at different points in their cycle, and unison detune keeps the copies drifting. Each of those does something specific. A fixed time offset between two copies is a comb filter: it cuts deep notches at evenly spaced frequencies. A small detune makes the copies drift in and out of phase, so their sum swells and sags at a rate equal to the difference in pitch. Different attacks smear the start of each note.

The stack gets louder on average, because unrelated layers add in power, but it gets less defined. Turn it down to the level of the single layer and it sounds smaller.

::figure phase

::demo phase

## Science model: sums of sines

Two sine waves of the same frequency, with amplitudes $A_1$ and $A_2$ and a phase difference $\\Delta\\phi$, add to one sine with amplitude:

$$A_{\\text{total}} = \\sqrt{A_1^2 + A_2^2 + 2 A_1 A_2 \\cos \\Delta\\phi}$$

With equal amplitudes $A$ this becomes $2A \\left| \\cos(\\Delta\\phi / 2) \\right|$: double at 0°, about 1.41 times (+3 dB) at 90°, the same as one copy at 120°, and silence at 180°.

A time offset $\\Delta t$ turns into a phase difference that grows with frequency, $\\Delta\\phi = 360° \\cdot f \\, \\Delta t$. The copies cancel wherever that reaches an odd multiple of 180°, which gives the notches of the comb (Smith, *Introduction to Digital Filters*):

$$f_k = \\frac{2k + 1}{2 \\, \\Delta t}, \\quad k = 0, 1, 2, \\dots$$

An offset of 1 ms puts notches at 500 Hz, 1.5 kHz, 2.5 kHz and up. An offset of 5 ms, easy to get from two samples that do not start together, puts them at 100, 300 and 500 Hz, right in the body of the sound.

Detune works over time instead. Two tones at $f$ and $f + \\Delta f$ beat $\\Delta f$ times per second (Moore, 2012). A 5-cent detune at 110 Hz is about 0.32 Hz apart, a slow swell every three seconds or so. At 880 Hz the same 5 cents is about 2.5 Hz, a fast shimmer. That is why unison sounds lush on top and unstable in the low end.

::figure beats

## DAW experiment: the layered sound role test

Hear how copies interfere, then build a stack that does not.

1. Bounce one bar of your lead to audio and duplicate the audio track, with both at the same level.
2. Flip the polarity of the copy. The two cancel to near silence, which shows how strongly identical copies interact.
3. Restore the polarity and delay the copy by 1 ms with a track delay. Put a spectrum analyzer on the bus, look for notches at 500 Hz and 1.5 kHz, and listen to the hollow tone.
4. Remove the delay and detune the copy by 7 cents. Listen to the low notes swell and sag.
5. Now build by role. Body: the original lead through a low-pass filter at 1 kHz, 12 dB per octave. Edge: a short pluck with a decay of about 150 ms, high-passed at 500 Hz. Air: a noisy pad high-passed at 4 kHz and widened.
6. Match the copy stack and the role stack to the same short-term LUFS and switch between them.
7. Fold the master to mono and compare both again.

The copies sound hollow, swell and smear at the start of each note. The role stack keeps a steady body, a clear attack and air on top, and it survives mono.

## Common mistake: stacking similar presets

Layering is not adding more of the same. Three presets from the same library, in the same octave with the same envelope, fight over one band and interfere with each other there. If two layers do the same job, one of them is only adding level and phase trouble.

The low end is the worst place for it. Slow beating between detuned copies turns into a level that rises and falls under the whole mix, and wide unison can partly cancel when the mix is folded to mono. Keep the sub as one clean source.

## Producer takeaway: layer by role

Give every layer one job: body, edge, width or air. Filter each so its band overlaps the others as little as possible, give the edge layer the sharpest attack and the body the steadiest pitch, and keep the lowest layer in mono.

::figure roles

Then check the stack against its single best layer at matched loudness. If the stack does not win, use the single layer.

## References

- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Smith, J. O. *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
`,
    seo: {
        title: 'Too many layers make sounds smaller | VGP Studio',
        description: 'Why stacked copies of a synth thin out: phase sums, comb-filter notches from time offsets and beating from detune, and how to layer by role instead.',
        keywords: ['layering synths', 'phase cancellation', 'comb filtering', 'detune beating', 'sound design', 'mono compatibility'],
    },
};
