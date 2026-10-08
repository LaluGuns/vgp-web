import { BlogArticle } from '../blog-data';
import type { SignalTrace } from '../blog/types';

// A drawn room response: direct sound, a few early reflections, then a dense decaying tail.
// A fixed seed keeps the drawing identical on every build. Times are fractions of the plot width.
function roomResponse(start: number, length: number) {
    let seed = 11;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    const early: [number, number][] = [
        [0.08, 0.72],
        [0.12, -0.6],
        [0.165, 0.55],
        [0.2, -0.46],
        [0.245, 0.4],
    ];
    const at = [start];
    const amp = [1];
    for (const [t, a] of early) {
        at.push(start + t * length);
        amp.push(a);
    }
    for (let t = 0.31; t < 1; t += 0.012) {
        at.push(start + t * length);
        amp.push((rand() < 0.5 ? -1 : 1) * (0.15 + 0.2 * rand()) * Math.exp(-4.2 * (t - 0.3)));
    }
    return { at, amp };
}

const BURST = { decay: 140, cycles: 90 };
const IR = roomResponse(0.03, 0.92);
const SHORT_IR = roomResponse(0, 0.5);
const INPUT = { at: [0.04, 0.42], amp: [1, 0.6] };

// The output is the convolution of the input hits with the response: one scaled, shifted copy per hit, added.
const OUTPUT = INPUT.at.flatMap((t, i) => SHORT_IR.at.map((tau, j) => ({ t: t + tau, a: INPUT.amp[i] * SHORT_IR.amp[j] }))).filter((h) => h.t < 1);

const hits = (h: { at: number[]; amp: number[] }, scale = 0.8): SignalTrace => ({ kind: 'hits', ...BURST, at: h.at, amp: h.amp.map((a) => a * scale) });

export const post097: BlogArticle = {
    slug: 'what-convolution-reverb-is-doing',
    title: 'Convolution reverb copies a space',
    excerpt: 'A convolution reverb plays your sound through a recording of how a room answers a single click. Learn what an impulse response captures and what it cannot.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'An impulse response records how a space answers one click: direct sound, early reflections, then a decaying tail.',
        'Convolution starts a scaled copy of that response for every input sample and adds the copies together.',
        'It captures one fixed, linear snapshot: great for real rooms and cabinets, with no modulation and no drive.',
    ],
    figures: {
        ir: {
            type: 'signal',
            caption:
                'A room answering one click, drawn as a shape rather than a measurement: the direct sound, a few separate early reflections, then a dense tail that dies away.',
            alt: 'A single tall spike at the start, followed by several smaller separate spikes, then a dense cluster of tiny spikes that fades out toward the right.',
            rows: [
                {
                    label: 'Impulse response of a room',
                    traces: [hits(IR)],
                    marks: [
                        { t: 0.03, label: 'Direct' },
                        { t: 0.27, label: 'Reflections' },
                        { t: 0.7, label: 'Tail' },
                    ],
                },
            ],
        },
        convolve: {
            type: 'signal',
            caption:
                'Convolution in pictures. Each hit in the input starts its own copy of the impulse response, scaled by how loud the hit was, and the output is all of those copies added together.',
            alt: 'Three plots. The first shows two short hits, the second quieter than the first. The second plot shows a short room response. The third shows two overlapping copies of that response, starting at each hit, the second one quieter.',
            rows: [
                { label: 'Dry input: two hits', traces: [hits(INPUT)] },
                { label: 'Impulse response', traces: [hits(SHORT_IR)] },
                { label: 'Wet output', traces: [hits({ at: OUTPUT.map((h) => h.t), amp: OUTPUT.map((h) => h.a) })] },
            ],
        },
    },
    quiz: [
        {
            q: 'What does a convolution reverb do with each sample of your dry vocal?',
            options: [
                'Multiplies it by the matching sample of the response',
                'Feeds it into a network of delays with feedback',
                'Starts a scaled copy of the response at that sample',
                'Swaps it for the nearest sample of the room recording',
            ],
            answer: 2,
            why: 'Convolution is a sum of shifted, scaled copies of the impulse response, one per input sample. Multiplication only happens in the frequency domain, which is how fast convolution computes the same result.',
        },
        {
            q: 'Why can an impulse response of a guitar amp not capture its drive?',
            options: [
                'Impulse responses are too short to hold distortion',
                'The amp is too loud for the sweep to record cleanly',
                'The harmonics of drive sit above the Nyquist limit',
                'Convolution is linear, but drive depends on level',
            ],
            answer: 3,
            why: 'An impulse response describes a system that treats loud and quiet signals the same way. Distortion and compression depend on level, so the IR keeps only the frequency and phase response at one setting.',
        },
        {
            q: 'A 2-second impulse response runs at 48 kHz. Done directly, how many multiplications does each output sample need?',
            options: ['96,000', '192,000', '48,000', '4.6 billion'],
            answer: 0,
            why: '2 s × 48,000 samples per second gives 96,000 response samples, each multiplied once per output sample. At 48,000 output samples a second that is about 4.6 billion a second, which is why plugins use the FFT.',
        },
    ],
    content: `## Hook: a dry vocal looking for a room

You have a clean, dry vocal from a treated booth. It sits on top of the beat instead of inside it. You add a reverb and raise the send, and now it sounds like a reverb: a smooth tail behind the voice, but no sense of a real room around it.

There are two ways to make a reverb. An algorithmic reverb builds a tail from networks of delays and feedback, which makes it flexible and easy to animate. A convolution reverb takes the opposite route. It starts from a recording of how one real space answers a single click, and plays your sound through that recording.

## Why it matters: the room is in the first moments

When you clap in a room, the direct sound reaches you first. Then come the early reflections, separate echoes from the nearest walls, floor and ceiling, arriving over the first few tens of milliseconds. Sound travels about 34 cm per millisecond, so a reflection whose path is 3.4 m longer than the direct path arrives 10 ms later. After that the reflections pile up into a dense tail that dies away. The early part tells your ear a lot about the size of the space and how far away the source is. The tail sets how long the room hangs on.

::figure ir

That recording of a room's answer to a click is its impulse response. Because it holds the exact pattern of reflections of one real space, a convolution reverb can place a dry recording in that space without any tuning. It works the same way for anything else you have an impulse response for: a plate, a spring, a speaker cabinet, a stairwell you recorded yourself.

::demo reverb

The demo above is itself a convolution reverb. It convolves the melody with a generated impulse response of decaying noise, and the decay control sets how long that response is.

## Science model: convolution adds up copies of the response

A room behaves, to a good approximation, like a linear time-invariant system: double the input and the output doubles, play the same input later and the same output comes later. For such a system, the response to one impulse tells you the response to anything, because any signal is a series of impulses of different sizes, one per sample. Each input sample starts its own copy of the impulse response, scaled by that sample's value, and the output is the sum of all the copies:

$$y[n] = \\sum_{k=0}^{n} x[k]\\, h[n - k]$$

Here $x$ is the dry input, $h$ the impulse response and $y$ the wet output. Convolution is not the signal multiplied by the response sample by sample. It is this sum of shifted, scaled copies.

::figure convolve

Done directly, the cost is large. A 2-second impulse response at 48 kHz has 96,000 samples, so every output sample needs 96,000 multiplications, about 4.6 billion a second for one channel. Plugins use the FFT instead, because convolution in time equals multiplication in frequency. Splitting the response into blocks of growing size keeps that efficient without adding delay between input and output (Gardner, 1995).

To capture a response, engineers play an exponential sine sweep through a speaker in the space, record it and process the recording back into an impulse response (Farina, 2000). A balloon pop or a starting pistol works too, with more noise.

The model has limits. An impulse response captures one source position, one microphone position and one frozen moment. It cannot capture distortion or anything that moves. A convolution reverb has no modulation, and an impulse response of a guitar amp or an analog EQ copies only its frequency and phase response at one setting, not its drive or the way it changes with level.

## DAW experiment: turn any reverb into an impulse response

1. In a 48 kHz session, put a one-sample click at full scale at the start of an audio track. Draw it with the pencil at sample zoom, or use the shortest click sample you have.
2. Send it to an aux with your algorithmic reverb at 100% wet, modulation off and a decay of about 1.5 s. Bounce three seconds of the aux, starting at the click. That file is the reverb's impulse response.
3. On a second aux, load a convolution reverb at 100% wet and load the bounced file as its impulse response.
4. Send a dry vocal or snare to both auxes. Solo each in turn and match their levels. They should sound almost the same.
5. Flip the polarity of the convolution aux and play both. The leftover is much quieter than either reverb.
6. Turn the algorithmic reverb's modulation back on. The leftover grows, because the impulse response froze one moment of a reverb that now moves.
7. Load a recorded room impulse response into the convolution reverb instead and hear the same vocal in a real space.

The convolution reverb reproduces whatever made its impulse response, including your own algorithmic reverb, but only as a frozen snapshot.

## Common mistake: the biggest hall on a busy mix

The common error is choosing a cathedral or a large hall because it sounds lush in solo. A tail several seconds long fills every gap in a dense arrangement, covers the transients of the drums and pushes the vocal back. Choose the space for the tempo and density of the song: short rooms for fast, busy tracks, long halls for sparse ones. Put a high-pass filter around 150 Hz on the reverb return so the tail stays out of the kick and bass.

## Producer takeaway: choose the space for the scene

Pick an impulse response for where you want the listener to be, not for the name of the preset. Sending parts recorded in different rooms to the same room response puts them in one shared space. Use convolution for realism and fixed character, such as rooms, plates and cabinets. Use an algorithmic reverb when you want movement, a tail you can reshape freely or a lighter CPU load.

## References

- Farina, A. (2000). Simultaneous measurement of impulse response and distortion with a swept-sine technique. *108th AES Convention*, Paris, paper 5093.
- Gardner, W. G. (1995). Efficient convolution without input-output delay. *Journal of the Audio Engineering Society*, 43(3), 127-136.
- Smith, J. O. *Spectral Audio Signal Processing*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/sasp/
- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
`,
    seo: {
        title: 'Convolution reverb copies a space | VGP Studio',
        description: 'What an impulse response captures, how convolution adds up copies of it, and what a convolution reverb can and cannot reproduce in your mix.',
        keywords: ['convolution reverb', 'impulse response', 'early reflections', 'linear time-invariant', 'sine sweep', 'reverb setup'],
    },
};
