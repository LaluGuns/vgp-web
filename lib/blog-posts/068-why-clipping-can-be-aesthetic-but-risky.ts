import { BlogArticle } from '../blog-data';

// A bass note driven about 3 dB (x 1.41) into a hard clip at 0.7.
const BASS = { kind: 'sine' as const, cycles: 2, amp: 0.7, gain: 1.41 };
const BASS_AND_TONE = { kind: 'sum' as const, parts: [{ cycles: 2, amp: 0.6 }, { cycles: 24, amp: 0.14 }], gain: 1.41 };

export const post068: BlogArticle = {
    slug: 'why-clipping-can-be-aesthetic-but-risky',
    title: 'Clipping can work. It can also cost you',
    excerpt: 'A clipper can buy a decibel or two of drum headroom almost for free. Push it on a full mix and the bass starts distorting everything that sits on top of it.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'A clipper flattens only what crosses its ceiling, so shaving the tips of short drum transients can buy headroom you barely hear.',
        'On a full mix the bass crosses the ceiling first, and clipping it adds harmonics plus intermodulation sidebands that belong to no note.',
        'Clip a dB or two on short peaks, oversample, and level-match every comparison.',
    ],
    figures: {
        bass: {
            type: 'signal',
            caption:
                'On its own, a bass note driven into a hard clip loses its crests. With a quieter high note on top, the clipper also wipes out the high note at every bass crest, twice per bass cycle. That on and off pattern is intermodulation.',
            alt: 'Two waveforms against a dashed ceiling. A slow sine is flattened at the ceiling. Below, the same slow wave carries a fast ripple, and the ripple vanishes wherever the slow wave hits the ceiling.',
            rows: [
                {
                    label: 'Bass note, about 3 dB into a hard clip',
                    traces: [
                        { ...BASS, muted: true, label: 'Before the clipper' },
                        { ...BASS, clip: 0.7, label: 'Clipped' },
                    ],
                    lines: [{ y: 0.7, label: 'Ceiling' }],
                },
                {
                    label: 'Bass with a quiet high note on top',
                    traces: [
                        { ...BASS_AND_TONE, muted: true },
                        { ...BASS_AND_TONE, clip: 0.7 },
                    ],
                    lines: [{ y: 0.7, label: 'Ceiling' }],
                },
            ],
        },
        sidebands: {
            type: 'scale',
            caption:
                'What came out when an 80 Hz note and a quieter 1 kHz tone were hard-clipped together. Besides the bass\'s own 3rd harmonic, sidebands appear at 840 and 1160 Hz: the tone plus and minus twice the bass frequency. Neither belongs to either note.',
            alt: 'A frequency line from 0 to 1400 Hz with markers at 80 Hz for the bass, 240 Hz for its 3rd harmonic, 1000 Hz for the tone, and sidebands at 840 and 1160 Hz.',
            min: 0,
            max: 1400,
            unit: 'Hz',
            ticks: [0, 400, 800, 1200],
            markers: [
                { value: 80, label: 'Bass' },
                { value: 240, label: '3rd harmonic' },
                { value: 840, label: 'Sideband', strong: true },
                { value: 1000, label: 'Tone' },
                { value: 1160, label: 'Sideband', strong: true },
            ],
        },
    },
    quiz: [
        {
            q: 'Why does a drum bus usually take clipping better than a full mix?',
            options: [
                'A clipper adds even harmonics, which suit drums',
                'Oversampling works better on drums than on bass',
                'Drums have no pitch for distortion to clash with',
                'Only brief transient tips cross the ceiling',
            ],
            answer: 3,
            why: 'On drums the clipper touches brief peaks that mask their own distortion. On a full mix, sustained bass notes cross the ceiling and the distortion lasts as long as they do.',
        },
        {
            q: 'A symmetric hard clipper is fed a pure sine at 100 Hz. Which new frequencies appear?',
            options: ['300, 500 and 700 Hz', '200, 400 and 600 Hz', '200, 300 and 400 Hz', '50, 150 and 250 Hz'],
            answer: 0,
            why: 'Clipping the positive and negative halves the same way creates odd harmonics only: 3, 5, 7 times the fundamental.',
        },
        {
            q: 'An 80 Hz bass and a 1 kHz tone are clipped together. Where do the strongest sidebands land?',
            options: ['920 and 1080 Hz', '760 and 1240 Hz', '840 and 1160 Hz', '500 and 2000 Hz'],
            answer: 2,
            why: 'The bass flattens the tone twice per cycle, which modulates it at 160 Hz. That puts sidebands at 1000 minus and plus 160 Hz.',
        },
    ],
    content: `## Hook: free headroom, until it is not

You want louder drums without the limiter pumping, and you read that engineers put a clipper before the limiter. You add one, drive it, and the meter rises without the limiter working harder. Then you listen closely: the kick has lost weight, the low end sounds woolly, and the hi-hats have a fizzy edge.

Clipping is a real tool, and you will find it on plenty of loud records. It is also distortion, every single time. The only question is whether you can hear it.

## Why it matters: what a clipper does to the waveform

A hard clipper lets everything below its ceiling through untouched and flattens anything above it. On a drum bus, only the tips of the loudest transients cross the ceiling, for a millisecond or two. Shave 1 or 2 dB off those tips and you can raise the whole bus by the same amount before the peaks reach where they were. The limiter after it has less to do.

The cost is new frequency content. A flattened peak is a sharper shape than the wave it came from, and sharp shapes contain harmonics. Short drum transients hide a lot of that. A sustained bass note does not, and in a full mix the bass and kick carry most of the peak level, so on a mix bus they are what reach the ceiling first.

::figure bass

::demo saturation

## Science model: harmonics and intermodulation

A hard clipper passes everything below its ceiling untouched and holds everything above it at the ceiling, as drawn in the [lesson on saturation, clipping and limiting](/blog/saturation-clipping-limiting-three-flavors-of-loud). Because it treats positive and negative peaks the same way, a clipped sine gains odd harmonics only: 3, 5, 7 times the fundamental and up. The harder you drive it, the closer the wave gets to a square, whose peak and RMS level are equal, and the stronger those harmonics become. Clipping trades peak for density.

When several sounds are clipped together, the output also contains intermodulation: new frequencies at sums and differences of the inputs. With a big bass note under a quieter tone, the bass decides when the tone gets flattened, twice per bass cycle, and that shows up as sidebands either side of the tone. In a quick test, an 80 Hz note with a quieter 1 kHz tone on top, driven about 3 dB into a hard clip, produced sidebands at 840 and 1160 Hz only a few decibels below the tone. Those frequencies belong to neither note. That is why a clipped mix bus can sound rough and muddy when the clipped drum bus sounded clean.

::figure sidebands

## DAW experiment: find your clipping point

You need a clipper with oversampling. Not every DAW ships one, and free clippers with oversampling exist.

1. Loop four bars of a drum bus with clear transients. Put a true-peak meter and a loudness meter after it.
2. Insert a clipper with oversampling on, followed by a gain plugin. Set the clipper's ceiling at the loop's current peak level.
3. Raise the clipper's input by 1 dB, so the tips of the loudest hits are flattened.
4. Lower the gain plugin until the loudness meter reads the same as with both plugins bypassed.
5. Bypass and re-enable the clipper and the gain plugin together, and listen to the kick and snare. Repeat with 3 dB and then 6 dB of input drive.
6. Run the same test on a full mix loop with a sustained bass line, and listen to the bass and the vocal.

On drums, 1 dB is often hard to hear and 6 dB softens the crack. On the full mix the distortion shows up sooner, in the bass and the vocal, because the bass is what crosses the ceiling.

## Common mistake: clipping as a volume knob

The usual mistake is driving a clipper until the track is loud enough, as if it were a fader. On a mix bus the distortion builds in the low end first, and the intermodulation roughens everything the bass sits under.

The other is clipping without oversampling. A clipper's harmonics extend far above the Nyquist limit, and without oversampling they fold back down as tones unrelated to the music. Turn oversampling on, or test the plugin with a sine and an analyzer as described in the [lesson on aliasing](/blog/why-aliasing-is-a-ghost-frequency-problem).

## Producer takeaway: shave tips, not bodies

Use a clipper where the material is made of short peaks, like a drum bus, and keep it to a dB or two before the limiter. On a mix bus, clip less than you think, listen to the bass and the vocal rather than the drums, and level-match every comparison. Keep oversampling on.

## References

- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
`,
    seo: {
        title: 'Clipping can work. It can also cost you | VGP Studio',
        description: 'How a hard clipper buys drum headroom, why clipping a full mix adds odd harmonics and intermodulation, and how to find the point where it becomes audible.',
        keywords: ['audio clipping', 'clipper before limiter', 'odd harmonics', 'intermodulation distortion', 'oversampling', 'drum bus clipping'],
    },
};
