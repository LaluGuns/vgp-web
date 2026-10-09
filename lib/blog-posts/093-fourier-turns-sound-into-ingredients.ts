import { BlogArticle } from '../blog-data';

// Sawtooth partial sums: harmonic n at 1/n of the fundamental, scaled so each row peaks near 0.85.
const harmonics = (count: number, scale: number, phases: number[] = []) =>
    Array.from({ length: count }, (_, i) => ({ cycles: 2 * (i + 1), amp: scale / (i + 1), phase: phases[i] ?? 0 }));

export const post093: BlogArticle = {
    slug: 'fourier-turns-sound-into-ingredients',
    title: 'Fourier shows the ingredients',
    excerpt: 'Any sound can be described as a sum of sine waves. See how harmonics build a waveform, how to hear them, and what an analyzer leaves out.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'The Fourier transform describes any sound as sine waves, each with its own frequency, level and phase.',
        'A pitched note is a fundamental plus harmonics at whole-number multiples, and their balance is most of its tone.',
        'An analyzer shows the level of each ingredient and hides the phase, so use it to locate what you hear, not to judge it.',
    ],
    figures: {
        build: {
            type: 'signal',
            caption:
                'Each row adds sines at whole-number multiples of the fundamental, the nth one at 1/n of its strength. By the 10th harmonic the smooth wave is close to a sawtooth. Fourier analysis runs this in reverse.',
            alt: 'Three waveforms. The first is a plain sine. The second adds two harmonics and has a leaning shape. The third adds harmonics up to the 10th and looks like a sawtooth, with a slow ramp and a sharp jump each cycle.',
            rows: [
                { label: 'The fundamental alone', traces: [{ kind: 'sine', cycles: 2, amp: 0.85 }] },
                {
                    label: 'Plus the 2nd and 3rd harmonics',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.59, muted: true },
                        { kind: 'sum', parts: harmonics(3, 0.59) },
                    ],
                },
                {
                    label: 'Plus harmonics up to the 10th',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.5, muted: true },
                        { kind: 'sum', parts: harmonics(10, 0.5) },
                    ],
                },
            ],
        },
        saw: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'A sawtooth at 110 Hz as an analyzer sees it: a line at every multiple of 110 Hz, the nth one 1/n as strong. The 3rd harmonic, at 330 Hz, is an E, which is why a narrow boost there sounds like a new note.',
            alt: 'A spectrum with vertical lines at 110, 220, 330, 440 Hz and every further multiple of 110 Hz, each shorter than the one before. A mark labels the 3rd harmonic.',
            range: [50, 5000],
            curves: [{ kind: 'harmonics', f0: 110, count: 45, rolloff: 1, label: 'Sawtooth at 110 Hz' }],
            marks: [{ f: 330, label: '3rd harmonic, an E' }],
        },
        phase: {
            type: 'signal',
            caption:
                'Both waves hold the same three harmonics at the same levels. Only their phases differ. An analyzer that shows level per frequency draws the same three lines for both, because it throws the phase away.',
            alt: 'Two waveforms with clearly different shapes, built from the same first three harmonics. In the second, the 2nd and 3rd harmonics are shifted in phase.',
            rows: [
                { label: 'Harmonics 1 to 3, starting together', traces: [{ kind: 'sum', parts: harmonics(3, 0.46) }] },
                { label: 'Same harmonics, phases shifted', traces: [{ kind: 'sum', parts: harmonics(3, 0.46, [0, 90, 180]) }] },
            ],
        },
    },
    quiz: [
        {
            q: 'You play A2 (110 Hz) on a sawtooth synth. Where is its 3rd harmonic, and how loud is it?',
            options: ['220 Hz, 6 dB down', '330 Hz, 4.8 dB down', '330 Hz, 9.5 dB down', '440 Hz, 12 dB down'],
            answer: 2,
            why: 'The 3rd harmonic sits at 3 × 110 = 330 Hz. In a sawtooth it has 1/3 of the fundamental amplitude, and 20 × log10(1/3) ≈ -9.5 dB.',
        },
        {
            q: 'Two signals show identical lines on a spectrum analyzer. What can still be different?',
            options: ['The pitch of the two notes', 'The phase of each harmonic', 'The level of each harmonic', 'Which harmonics they contain'],
            answer: 1,
            why: 'A level display keeps the size of each ingredient and discards its phase. The same harmonics with different phases make different waveforms, and they add up differently with other tracks.',
        },
        {
            q: 'Why does a balanced mix slope downward on an analyzer with no tilt?',
            options: [
                'Because each higher octave spans more hertz',
                'Because analyzers lose accuracy above 1 kHz',
                'Because the bass is too loud in most mixes',
                'Because high frequencies are masked by the bass',
            ],
            answer: 0,
            why: 'An untilted analyzer counts each hertz equally. Pink noise, with equal energy per octave, falls 3 dB per octave on it, and a balanced mix slopes roughly the same way.',
        },
    ],
    content: `## Hook: mixing a moving line

Open almost any home studio session and there is a spectrum analyzer on the master, a moving line full of peaks and dips. The producer sees a bump in the low mids and pulls it down. They see the highs sloping away and boost them. They are fixing a graph.

The graph is real. It comes from one of the most useful ideas in audio, the Fourier transform, and it shows something your ears also hear: the ingredients of a sound. Knowing what those ingredients are, and what the graph leaves out, turns the analyzer into a tool instead of a boss.

## Why it matters: a peak is not a problem by itself

Fourier's idea is that any sound can be described as a sum of sine waves, each with its own frequency, level and phase. A plucked bass note is a sine at the pitch you play, the fundamental, plus quieter sines at two, three and four times that frequency, the harmonics. The balance of those harmonics is most of what makes a bass sound like a bass and not like a flute playing the same note.

::figure build

That is why an analyzer helps when you hear a problem you cannot place, such as a build-up in the low mids or a ringing tone in a vocal. It is also why it cannot tell you whether a sound is good. A vocal with a strong peak in the low mids may look lumpy, but that peak can be the chest tone that gives the singer authority. Cut it because it looks wrong and you remove the part you liked.

::demo eq-sweep

## Science model: from time to frequency

A waveform shows pressure over time. The Fourier transform rewrites the same signal as level and phase over frequency:

$$X(f) = \\int_{-\\infty}^{\\infty} x(t)\\, e^{-i 2 \\pi f t}\\, dt$$

Read it as a test. For each frequency $f$, the transform multiplies the signal $x(t)$ by a sine and a cosine at that frequency and adds up the products over time. If the signal contains that frequency, the products line up and the total is large. If it does not, they cancel. The result $X(f)$ is a complex number: its size is how much of that frequency is present, and its angle is the phase.

For a note with a steady pitch, the ingredients sit at whole-number multiples of the fundamental. A sawtooth contains every harmonic, the nth at $1/n$ of the fundamental's amplitude: the 2nd is 6 dB down, the 3rd 9.5 dB down, the 4th 12 dB down. A square wave keeps only the odd harmonics. A sine has one ingredient, itself.

::figure saw

An analyzer shows only the size of each ingredient and throws the phase away. Two signals with the same harmonics at the same levels draw the same lines even when their waveforms look nothing alike. Phase starts to matter as soon as two signals are added, which is why phase problems in a mix rarely show up on a spectrum display.

::figure phase

In a DAW the analyzer uses the discrete version of this idea, computed with the fast Fourier transform (FFT) on short blocks of samples. How long those blocks are and how they are shaped decides what the display can resolve. The [lesson on reading a spectrum analyzer](/blog/fft-for-producers-how-to-read-spectrum-analyzer) covers those settings.

## DAW experiment: build a sawtooth, then take it apart

1. Load a synth with one oscillator set to sawtooth, filter fully open, no effects. Play A2, which is 110 Hz, and put a spectrum analyzer after it.
2. Read the peaks: 110, 220, 330 and 440 Hz and up, each lower than the last. The 2nd should be about 6 dB below the fundamental and the 4th about 12 dB below.
3. Switch the oscillator to a square wave. The peaks at 220 and 440 Hz disappear and 330 Hz stays.
4. Switch to a sine. One peak is left, and the tone is pure and dull.
5. Go back to the sawtooth. Hide the analyzer, insert an EQ and add a narrow bell at 330 Hz with Q 10 and +12 dB. The 3rd harmonic stands out as its own pitch, an E an octave and a fifth above the A.
6. Move the bell to 440 Hz, then to 550 Hz. Each boosted harmonic sings out as a note of the A major chord hidden inside the sawtooth.
7. Remove the bell and low-pass the sawtooth at 300 Hz, 24 dB per octave. The peaks above 300 Hz fall away fast, and the waveform rounds off toward a sine.

A single note is a stack of sines you can pick out by ear once you know where they are. The analyzer draws the same stack. Your ear decides which parts of it matter.

## Common mistake: EQing until the line looks flat

The most common mistake is trying to make a mix look flat on an analyzer. Music carries more energy per hertz in the low end than in the highs, and each higher octave spreads its energy over more hertz. On an analyzer with no tilt, a balanced mix therefore slopes downward, roughly like pink noise, which has equal energy in every octave and falls 3 dB per octave on such a display. Many analyzers can add a tilt so that slope reads flat. Check which setting yours uses before you decide a mix has too much bass or too little top.

The second mistake is looking for phase problems on the analyzer. Because it hides phase, a kick and bass that partly cancel simply look a little quieter. Find those with your ears, the polarity switch and a mono check.

## Producer takeaway: use it as a flashlight

Keep the analyzer closed while you balance. Open it when you hear something you cannot place, when you need to see sub-bass your monitors cannot reproduce, or to check what a boost is really doing. Make the EQ move by ear, then look to confirm the frequency. Over time your guesses land closer to the number on the screen, and you need the screen less.

## References

- Smith, J. O. *Spectral Audio Signal Processing*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/sasp/
- MIT OpenCourseWare. *6.003 Signals and Systems*, Fall 2011. https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/
`,
    seo: {
        title: 'Fourier shows the ingredients | VGP Studio',
        description: 'How the Fourier transform describes any sound as sine waves, how harmonics build a waveform, and why a spectrum analyzer shows level but hides phase.',
        keywords: ['fourier transform', 'harmonics', 'spectrum analyzer', 'sawtooth wave', 'frequency domain', 'phase'],
    },
};
