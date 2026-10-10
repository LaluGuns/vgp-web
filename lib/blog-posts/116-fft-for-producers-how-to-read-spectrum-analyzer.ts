import { BlogArticle } from '../blog-data';
import type { SignalTrace } from '../blog/types';

const FS = 48000;
const SIZES = [1024, 2048, 4096, 8192, 16384];

// Two snare hits 200 ms apart on a 400 ms plot, and the block an FFT of N points covers.
const SPAN_MS = 400;
const SNARES: SignalTrace = { kind: 'hits', at: [0.08, 0.58], amp: [0.85, 0.85], decay: 12, cycles: 45, muted: true };
const block = (n: number): SignalTrace => {
    const end = 0.06 + (n / FS) * 1000 / SPAN_MS;
    return { kind: 'envelope', label: 'Block', points: [[0.06, 0], [0.0601, 0.95], [end, 0.95], [end + 0.0001, 0]] };
};

// A block holding 2.5 cycles, starting at a peak, with and without a Hann window.
const hann = (t: number) => 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
const grid = Array.from({ length: 241 }, (_, i) => i / 240);
const windowed: [number, number][] = grid.map((t) => [t, 0.85 * Math.cos(2 * Math.PI * 2.5 * t) * hann(t)]);
const outline: [number, number][] = grid.map((t) => [t, 0.85 * hann(t)]);

export const post116: BlogArticle = {
    slug: 'fft-for-producers-how-to-read-spectrum-analyzer',
    title: 'How to read a spectrum analyzer',
    excerpt: 'FFT size, window and averaging decide what an analyzer can show. Learn to set it for the question you are asking, and keep your ears in charge.',
    category: 'audio-science',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'FFT bins sit sample rate divided by FFT size apart, and the block lasts FFT size divided by sample rate, so finer frequency detail always costs time.',
        'Windows trade leakage against peak width. Hann is a sensible default, and the low octaves always get few bins.',
        'Listen first, then set the analyzer for the question: large FFT for low notes, small for transients, and never EQ to match a reference curve.',
    ],
    figures: {
        sizes: {
            type: 'bars',
            caption:
                'At 48 kHz, every doubling of the FFT size halves the bin spacing and doubles the length of the block. Sharper frequency detail always costs time.',
            alt: 'Bars of block length for five FFT sizes at 48 kHz: 1024 points 21 ms with 46.9 Hz bins, 2048 points 43 ms with 23.4 Hz bins, 4096 points 85 ms with 11.7 Hz bins, 8192 points 171 ms with 5.9 Hz bins, 16384 points 341 ms with 2.9 Hz bins.',
            min: 0,
            max: 360,
            unit: 'ms',
            bars: SIZES.map((n) => ({
                label: `${n} points, ${(FS / n).toFixed(1)} Hz bins`,
                value: (n / FS) * 1000,
                display: `${Math.round((n / FS) * 1000)} ms`,
            })),
        },
        window: {
            type: 'signal',
            caption:
                'Two snare hits 200 ms apart, drawn over 400 ms, with the block each FFT size analyses. The 1024-point block catches the start of one hit. The 16384-point block spans both hits and the gap between them, and reports them as one blended spectrum.',
            alt: 'Two plots of the same two drum hits, drawn in grey. In the first, a box covers only the very start of the first hit. In the second, a box stretches from before the first hit to past the second.',
            rows: [
                { label: '1024 points: a 21 ms block', traces: [SNARES, block(1024)] },
                { label: '16384 points: a 341 ms block', traces: [SNARES, block(16384)] },
            ],
        },
        taper: {
            type: 'signal',
            caption:
                'An analyzer block rarely holds a whole number of cycles. This one starts at a peak and ends at a trough, so the endless repeat the FFT assumes has a jump in it, and the jump leaks energy across the spectrum. A Hann window fades both ends to zero.',
            alt: 'Two plots. The first shows two and a half cycles of a sine that starts high and ends low. The second shows the same wave faded in and out under a bell-shaped outline, starting and ending at zero.',
            rows: [
                { label: 'The block as captured', traces: [{ kind: 'sine', cycles: 2.5, amp: 0.85, phase: 90 }] },
                {
                    label: 'After a Hann window',
                    traces: [
                        { kind: 'envelope', points: outline, muted: true, dashed: true, label: 'Window' },
                        { kind: 'envelope', points: windowed, label: 'Signal' },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'At 48 kHz, what bin spacing does a 4096-point FFT give?',
            options: ['11.7 Hz', '23.4 Hz', '4.1 Hz', '85 Hz'],
            answer: 0,
            why: '48,000 / 4096 ≈ 11.7 Hz. The block is 4096 / 48,000 ≈ 85 ms long.',
        },
        {
            q: 'Why does the sub region look blocky on an analyzer that looks detailed in the highs?',
            options: [
                'Averaging smooths the lows more than the highs',
                'The window function fades out the low frequencies',
                'The analyzer stops measuring below about 50 Hz',
                'Even bin spacing leaves the low octaves few bins',
            ],
            answer: 3,
            why: 'With 11.7 Hz bins, the octave from 20 to 40 Hz holds about two bins, while 10 to 20 kHz holds more than 800. The log scale gives both octaves the same width.',
        },
        {
            q: 'What does a window function do before the FFT?',
            options: [
                'Removes frequencies above the Nyquist limit',
                'Averages several blocks together for a steady line',
                'Fades the block ends so the repeat has no jump',
                'Raises the sample rate before the analysis runs',
            ],
            answer: 2,
            why: 'The FFT treats a block as if it repeated forever. Fading its ends to zero removes the jump at the join, so energy stays near its true frequency.',
        },
    ],
    content: `## Hook: matching the curve

You load a reference track, put an analyzer on it and on your mix, and start EQing your master until the two curves look the same. Forty minutes later the shapes are close, and the mix sounds worse. The curve matches. The music does not.

The analyzer was answering a narrower question than the one you asked. To read it well, you need to know what its settings do to the picture.

## Why it matters: the display is a set of choices

An analyzer takes a short block of samples, runs a fast Fourier transform (FFT) on it and draws how much energy each frequency had in that block. Then it takes the next block and does it again. The block length, the fade at its edges and the averaging between blocks all change what you see. The same mix can look smooth or jagged, fast or sluggish, and each view is accurate for its settings.

If the [Fourier transform](/blog/fourier-turns-sound-into-ingredients) itself is new to you, start there. This lesson is about the analyzer built on it.

In the filter demo below, sweep the cutoff and watch how quickly the live spectrum follows.

::demo filter

## Science model: bins, windows and averaging

The FFT, a fast way to compute the discrete Fourier transform (Cooley and Tukey, 1965), turns a block of $N$ samples into frequency slots called bins, spaced evenly:

$$\\Delta f = \\frac{f_s}{N}$$

The block itself lasts

$$T = \\frac{N}{f_s}$$

so the two are tied together: $\\Delta f = 1 / T$. To see finer frequency detail you need a longer block, and a longer block blurs events in time. At 48 kHz, a 1024-point FFT has bins 46.9 Hz apart and covers 21 ms. An 8192-point FFT has 5.9 Hz bins and covers 171 ms. This is a limit of analysis itself, not a weakness of a particular plugin.

::figure sizes

The bins are evenly spaced in hertz, but the display is logarithmic, with each octave the same width, so the low octaves get very few bins. With 4096 points at 48 kHz, the octave from 20 to 40 Hz holds about two bins, while the octave from 10 to 20 kHz holds more than 800. That is why the sub region looks blocky while the top end looks detailed. Two bass notes a semitone apart, E1 at 41.2 Hz and F1 at 43.7 Hz, are only 2.5 Hz apart. Telling them apart takes bins around a hertz wide, and that means a block close to a second long.

::figure window

Windowing deals with the edges of the block. The FFT treats each block as if it repeated forever. A real block almost never starts and ends at the same point of the wave, so the repeat has a jump in it, and that jump spreads energy into bins where there is none. This is spectral leakage. A window fades the block in and out so the ends meet at zero. A rectangular window, which means no fade, gives the narrowest peaks and the most leakage. Hann, the usual default, leaks far less at the cost of wider peaks. Blackman-Harris leaks less still and widens peaks further (Harris, 1978).

::figure taper

Finally, averaging. A raw FFT display jumps with every block. Analyzers overlap their blocks and average them or slow the decay of the display, so a steady tone reads as a steady line. Heavy averaging shows the long-term balance of a mix. Light averaging with a peak hold shows what the transients are doing. Many analyzers can also tilt the display, often by 3 or 4.5 dB per octave, so that a typical mix reads roughly flat. Know which tilt yours uses before you judge the top end.

## DAW experiment: resolve two tones

You need a spectrum analyzer with an FFT size setting. If your stock analyzer leaves it out, use a third-party analyzer that has one.

1. In a 48 kHz session, put a sine generator at 1 kHz on one track and another at 1.05 kHz on a second track, both at -12 dBFS.
2. Insert a spectrum analyzer on the master and set it to 1024 points with a Hann window.
3. Look at 1 kHz: one wide bump. The two tones are 50 Hz apart, about one bin.
4. Raise the FFT size to 4096. Two separate peaks appear, now about four bins apart.
5. Mute the second tone and set the window to rectangular, if your analyzer offers it. The peak gets narrower and its skirts spread wider across the display.
6. Replace the tones with a drum loop. Switch between 1024 and 16384 points and watch the kick: fast but blurry in pitch at the small size, sharp in pitch but slow and smeared at the large one.
7. Turn the averaging up and down and watch the same loop settle into a long-term shape or jump with every hit.

Nothing changes in the sound. Every difference you saw came from the analyzer settings.

## Common mistake: matching a reference curve

The mistake that wastes the most time is EQing a mix until its spectrum matches a reference. The average spectrum of a finished song reflects its arrangement, its key and its instruments as much as its mix. Two great songs in the same genre have different curves because they contain different notes. Force yours onto someone else's and you boost gaps your arrangement left on purpose and cut energy it needs.

Use references for broad checks. "My mix has far more energy below 50 Hz than anything else in this genre" is worth knowing. "My mix is 1.3 dB lighter at 2.4 kHz than the reference" is noise. Spectrograms, the scrolling waterfall displays, have the same trade-offs painted in colour. They are good for spotting a hum that never moves or a resonance that rings after each hit.

## Producer takeaway: listen, measure, decide

Use the analyzer to check an idea, not to find one. Listen first and name what bothers you: the vocal is buried, the low end booms. Guess where it lives, then open the analyzer and look there, with the FFT size set for the job, large for low notes and steady tones, small for transients. Make the change, match the level so the quieter version is not judged as worse, and decide by ear. If you are watching the analyzer more than you are listening, close it.

## References

- Cooley, J. W., & Tukey, J. W. (1965). An algorithm for the machine calculation of complex Fourier series. *Mathematics of Computation*, 19(90), 297-301.
- Harris, F. J. (1978). On the use of windows for harmonic analysis with the discrete Fourier transform. *Proceedings of the IEEE*, 66(1), 51-83.
- Smith, J. O. *Spectral Audio Signal Processing*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/sasp/
`,
    seo: {
        title: 'How to read a spectrum analyzer | VGP Studio',
        description: 'What FFT size, bin spacing, windows and averaging do to an analyzer display, why the low end looks blocky, and why matching a reference curve fails.',
        keywords: ['FFT', 'spectrum analyzer', 'FFT size', 'window function', 'spectral leakage', 'frequency resolution'],
    },
};
