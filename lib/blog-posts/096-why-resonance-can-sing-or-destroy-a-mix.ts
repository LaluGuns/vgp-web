import { BlogArticle } from '../blog-data';

// A 1 kHz resonance drawn over 20 ms (20 cycles). Its envelope falls as e^(-pi B t),
// with B = 1000 / Q, so the decay over the plot is pi × B × 0.02.
const ring = (q: number) => Math.PI * (1000 / q) * 0.02;

export const post096: BlogArticle = {
    slug: 'why-resonance-can-sing-or-destroy-a-mix',
    title: 'Resonance can sing or wreck the mix',
    excerpt: 'Resonances give instruments their voice and turn harsh only when they ring too long or too loud. Learn what Q means and how to cut only what hurts.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Resonances give instruments and voices their character. They are a problem only when they are too strong for the context.',
        'Q is centre frequency divided by bandwidth, and the narrower a resonance is, the longer it rings.',
        'Sweep with about 4 dB of boost, cut 2 to 3 dB, and judge every cut with the full mix playing.',
    ],
    figures: {
        ring: {
            type: 'signal',
            caption:
                'Two 1 kHz resonances struck once, drawn over 20 ms. At Q 5 the ring falls 60 dB in about 11 ms. At Q 25 it is still only about 22 dB down after 20 ms.',
            alt: 'Two decaying sine waves of the same frequency. The first dies away within the first half of the plot. The second is still clearly oscillating at the right edge.',
            rows: [
                { label: 'Q 5', traces: [{ kind: 'sine', cycles: 20, amp: 0.85, decay: ring(5) }] },
                { label: 'Q 25', traces: [{ kind: 'sine', cycles: 20, amp: 0.85, decay: ring(25) }] },
            ],
        },
        peak: {
            type: 'spectrum',
            mode: 'gain',
            db: 24,
            range: [100, 10000],
            caption:
                'A two-pole low-pass at 1 kHz with three resonance settings. At Q 0.7 there is no peak, only a bend 3 dB down at the cutoff. At Q 4 the cutoff is boosted by 12 dB, and at Q 10 by 20 dB.',
            alt: 'Gain against frequency for three low-pass filters at 1 kHz. All are flat below 1 kHz and fall above it. The Q 0.7 curve bends smoothly, the Q 4 curve has a peak of 12 dB at the cutoff and the Q 10 curve a sharp 20 dB peak.',
            curves: [
                { kind: 'eq', label: 'Q 0.7', muted: true, bands: [{ type: 'lowpass', freq: 1000, q: 0.707 }] },
                { kind: 'eq', label: 'Q 4', dotted: true, bands: [{ type: 'lowpass', freq: 1000, q: 4 }] },
                { kind: 'eq', label: 'Q 10', bands: [{ type: 'lowpass', freq: 1000, q: 10 }] },
            ],
            marks: [{ f: 1000, label: 'Cutoff' }],
        },
    },
    quiz: [
        {
            q: 'An EQ band at 2 kHz has a Q of 4. What is its bandwidth?',
            options: ['8 kHz', '250 Hz', '4 kHz', '500 Hz'],
            answer: 3,
            why: 'Q is centre frequency divided by bandwidth, so the bandwidth is 2000 / 4 = 500 Hz, measured between the points 3 dB below the peak.',
        },
        {
            q: 'Two resonances sit at the same frequency, one at Q 5 and one at Q 25. What does the second one do differently?',
            options: [
                'It covers a band five times as wide as the other',
                'It stops ringing the moment the input note stops',
                'It rings five times as long after the note stops',
                'It dies away sooner because its band is narrower',
            ],
            answer: 2,
            why: 'Ring time grows with Q divided by frequency. Five times the Q at the same frequency means a band one fifth as wide and about five times the ringing.',
        },
        {
            q: 'Why sweep for resonances with a small boost instead of a large one?',
            options: [
                'A big boost makes normal tone sound like a fault',
                'Large narrow boosts can damage the studio monitors',
                'Small boosts are more accurate in most digital EQs',
                'A big boost clips the track and hides the peak',
            ],
            answer: 0,
            why: 'With 15 dB of narrow boost, every frequency you stop on sounds like a problem. At 4 dB, only the resonances that really stick out still jump forward.',
        },
    ],
    content: `## Hook: the sweep that empties a vocal

A vocal sounds slightly harsh, so you create a narrow EQ band, boost it by 15 dB and sweep it through the upper mids. Everywhere you stop, something whistles, so you turn each spot into a deep notch. Four notches later the harshness is gone, and so is the voice. In the mix it sounds thin and far away.

A 15 dB narrow boost makes almost any frequency sound like a problem. Cut everything that rings under that much boost and you strip out the resonances that make an instrument sound like itself.

## Why it matters: resonances are the instrument

Most acoustic sound is shaped by resonance. A snare's shell and heads ring at a few frequencies, usually with a fundamental somewhere in the low hundreds of hertz, depending on tuning. A guitar body boosts some notes more than others. A voice is a buzz from the vocal folds filtered by the throat, mouth and nose, and the resonances of those spaces, the formants, are what make an "ah" different from an "ee".

A resonance becomes a problem when it is too strong for its context: a narrow peak that pokes out on loud notes, or a ring that keeps sounding after the note has stopped and smears the next one. The job is to tell those apart from the resonances that carry the tone, and that starts with knowing what makes a resonance narrow or broad.

## Science model: Q, bandwidth and ringing

A resonant system stores energy at its natural frequency and gives it back slowly. How narrow the resonance is and how long it rings are two views of one property. The quality factor $Q$ relates the centre frequency $f_c$ to the bandwidth $B$, measured between the points 3 dB below the peak:

$$Q = \\frac{f_c}{B}$$

A resonance at 1 kHz with a bandwidth of 100 Hz has a Q of 10. The same number sets the ringing. For a simple resonance, the envelope after the input stops decays as $e^{-\\pi B t}$, so the time to fall by 60 dB is about

$$T_{60} \\approx \\frac{2.2}{B} = \\frac{2.2\\,Q}{f_c}$$

A 1 kHz resonance at Q 5 dies away in about 11 ms. At Q 25 it rings for about 55 ms. Narrow means long.

::figure ring

Filters use the same physics. In a digital filter, resonance comes from feedback: part of each output is fed back into the next calculation. Raise the resonance control on a synth low-pass and the feedback lifts a peak at the cutoff. For a two-pole low-pass, the gain at the cutoff equals Q, so Q 4 is a 12 dB peak and Q 10 a 20 dB peak, and the filter rings at that frequency on every transient.

::figure peak

::demo filter

Q on an EQ plugin is a guide, not a standard. Manufacturers define a bell's bandwidth slightly differently, especially for boosts against cuts, so the same number can give different widths in two EQs. Trust the curve and your ears over the number.

## DAW experiment: the quiet sweep

1. Pick a track that sounds harsh or boxy, such as an acoustic guitar or a lead vocal, and loop a busy section.
2. Insert a parametric EQ and create a bell with Q 4 and only +4 dB of boost.
3. Solo the track and sweep the bell slowly from 500 Hz to 6 kHz.
4. Listen for spots that jump out clearly even at this small boost, or that keep ringing after the note stops.
5. When you find one, turn the boost into a cut of 2 to 3 dB at the same frequency and Q.
6. Unsolo the track and compare the cut against bypass with the full mix playing.
7. Keep the cut only if the track sounds better in the mix. If it only sounded better in solo, remove it.

Real problem resonances stand out even at a 4 dB boost and usually need only a few dB of cut. Most of what screamed under a 15 dB boost was the normal tone of the instrument.

## Common mistake: notching every peak

The common error is a row of narrow cuts across the midrange of every vocal, often placed by eye from an analyzer. The peaks it removes include the formants that carry the vowels and the singer's character. The vocal gets smoother, harder to understand and less able to sit on top of the track. Formants also move with every vowel, so a fixed notch on one of them is in the wrong place most of the time.

The other error is judging resonance in solo. A ring that is obvious alone can be covered by the band, and a peak that is fine alone can clash with another part at the same frequency. Decide in context.

## Producer takeaway: cut what hurts, keep the voice

Hunt resonances with small boosts, fix them with small cuts and judge them with the mix playing. For a resonance that only bites at loud moments, such as a vocal that turns harsh on held high notes, use a dynamic EQ band. It cuts only when that frequency crosses a threshold and leaves the quiet passages alone. A track with a few controlled peaks still sounds played. A track with every peak removed sounds like nobody is playing it.

## References

- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
- MIT OpenCourseWare. *8.03SC Physics III: Vibrations and Waves*, Fall 2016. https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/
`,
    seo: {
        title: 'Resonance can sing or wreck the mix | VGP Studio',
        description: 'What resonance and Q mean, why narrow resonances ring longer, and how to find and cut harsh peaks without stripping the character from a track.',
        keywords: ['audio resonance', 'Q factor', 'EQ sweep', 'filter resonance', 'formants', 'dynamic EQ'],
    },
};
