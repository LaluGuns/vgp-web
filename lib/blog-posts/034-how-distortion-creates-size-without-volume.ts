import { BlogArticle } from '../blog-data';

export const post034: BlogArticle = {
    slug: 'how-distortion-creates-size-without-volume',
    title: 'Distortion adds size without more volume',
    excerpt: 'Saturation adds harmonics and lifts the average level against the peak, so a part sounds bigger at the same loudness. Level-match to hear it.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Saturation adds harmonics at multiples of each note, in a range that small speakers play and the ear hears easily.',
        'Rounding the peaks lowers the crest factor, so a saturated part carries more average level at the same peak.',
        'Match loudness before you judge, and stop driving once the part sits forward at the same level.',
    ],
    figures: {
        clip: {
            type: 'signal',
            caption:
                'All three peak at the same level. The clipped versions spend more of each cycle near the top, so they carry more average energy and read louder on the same peak meter.',
            alt: 'Three plots of two cycles each. A clean sine touches the peak line only at its tips. A soft-clipped sine has rounded, broader tops. A hard-clipped sine has flat tops along the peak line.',
            rows: [
                { label: 'Clean sine', traces: [{ kind: 'sine', cycles: 2, amp: 0.6 }], lines: [{ y: 0.6, label: 'Peak' }] },
                { label: 'Soft clip', traces: [{ kind: 'sine', cycles: 2, gain: 1.5, clip: 0.6, soft: true }], lines: [{ y: 0.6, label: 'Peak' }] },
                { label: 'Hard clip', traces: [{ kind: 'sine', cycles: 2, gain: 1.5, clip: 0.6 }], lines: [{ y: 0.6, label: 'Peak' }] },
            ],
        },
        curves: {
            type: 'transfer',
            domain: 'linear',
            caption:
                'Input against output. The soft curve bends gradually, so quiet signals pass almost clean and harmonics grow as you push. The hard curve is clean up to the ceiling and then flat, and that sudden corner makes many more high harmonics.',
            alt: 'Input against output from minus 1 to 1. A dashed diagonal shows the clean line. A smooth S-shaped curve bends away from it toward a ceiling. A dashed hard-clip line follows the diagonal, then turns flat at the ceiling.',
            curves: [
                { kind: 'linear', label: 'Clean' },
                { kind: 'softclip', ceiling: 0.6, label: 'Soft clip' },
                { kind: 'hardclip', ceiling: 0.6, label: 'Hard clip', dashed: true },
            ],
        },
    },
    quiz: [
        {
            q: 'A cubic soft clipper, x - x³/3, is fed a pure sine. Which new frequency appears?',
            options: ['Only the second harmonic', 'Only the third harmonic', 'All of the odd harmonics', 'A tone an octave below'],
            answer: 1,
            why: 'Cubing a sine gives a component at the fundamental and one at three times its frequency, and nothing else. Curves with higher-order terms, like tanh or a hard clip, add the fifth, seventh and beyond.',
        },
        {
            q: 'A saturated and a clean version peak at the same level. Why does the saturated one sound louder?',
            options: [
                'It runs at a higher sample rate after processing',
                'Its real peaks are higher than the meter shows',
                'Its lower crest factor raises its average level',
                'The saturator boosts the level of its fundamental',
            ],
            answer: 2,
            why: 'Rounding the peaks lets the rest of the wave sit closer to the ceiling. Same peak, more average energy, so it reads louder.',
        },
        {
            q: 'Why match loudness before you judge a saturator?',
            options: [
                'Saturation adds level, and the louder one wins',
                'Saturation makes the part sound quieter at first',
                'Matching the level strips out the new harmonics',
                'Loudness meters misread a saturated signal',
            ],
            answer: 0,
            why: 'Louder almost always sounds better at first. Only at matched loudness can you hear whether the harmonics improved the part or just made it louder.',
        },
    ],
    content: `## Hook: the fader trap

Your bass is too quiet. On a laptop you cannot follow the bass line at all, so you push the fader. Now it is loud enough, but its peaks hit the master ceiling and the limiter starts squeezing the whole mix. You pull it back and the bass disappears again. There seems to be no setting between invisible and too loud.

Turning a clean sound up raises every part of it by the same amount, peaks included, so the peaks reach the ceiling first. On a small speaker it barely helps anyway, because most of the bass energy sits below what that speaker can play. Saturation changes the sound itself, so it can be heard more without peaking higher.

## Why it matters: harmonics and a smaller crest factor

Saturation adds new frequencies at whole-number multiples of each note. A 55 Hz bass note gains energy at 110, 165, 220 Hz and up, where small speakers can play it and the ear is more sensitive than it is in the deep bass (Moore, 2012). The note becomes easier to hear without its fundamental getting any louder.

Saturation also rounds off peaks, which lowers the crest factor, the gap between peak and average level. A pure sine has a crest factor of about 3 dB. Clip it hard and it approaches a square wave, whose crest factor is 0 dB. At the same peak level the clipped wave carries more average energy, so it reads louder and denser while the peak meter stays put.

::figure clip

::demo saturation

## Science model: a curve that bends

EQ, delay and reverb are linear. They can change the level and phase of frequencies that are already there, and nothing more. A saturator is nonlinear: it bends the relationship between input and output, and a bent curve makes new frequencies.

A common soft clipper is the cubic curve (Smith, *Physical Audio Signal Processing*):

$$f(x) = x - \\frac{x^3}{3}, \\quad |x| \\le 1$$

Beyond $|x| = 1$ the output stays at $\\pm 2/3$. The cubic is the start of the Taylor series of $\\tanh$, another classic soft clipper:

$$\\tanh x = x - \\frac{x^3}{3} + \\frac{2x^5}{15} - \\dots$$

Feed the cubic a sine, $x = A \\sin \\omega t$, and use $\\sin^3 \\theta = \\tfrac{1}{4}(3 \\sin \\theta - \\sin 3\\theta)$:

$$f(x) = \\left( A - \\frac{A^3}{4} \\right) \\sin \\omega t + \\frac{A^3}{12} \\sin 3\\omega t$$

So the cubic makes exactly one new frequency, the third harmonic. At full input ($A = 1$) it sits about 19 dB below the fundamental, and at half input about 33 dB below. Because it grows with $A^3$, the edge arrives quickly once you push. Curves with higher-order terms, such as $\\tanh$, add the fifth, seventh and further odd harmonics, and a hard clip adds a long series of them, which is why it sounds harsher.

::figure curves

A curve that treats the positive and negative halves of the wave the same way, like all of these, makes only odd harmonics. An asymmetric curve, such as a single-ended tube stage, adds even harmonics too. The second harmonic is an octave above the note and blends in, while the odd ones add more edge. That is a rule of thumb, not a law, but it is a useful one.

## DAW experiment: the level-matched distortion test

Prove to yourself that saturation adds size and not only level.

1. Load a bass synth or an 808 playing a simple riff, peaking around -10 dBFS on its channel.
2. Insert a saturator in a tape or tube mode, set the mix to 100% and raise the drive until the character clearly changes.
3. After the saturator, insert a utility gain plugin, then a loudness meter and a spectrum analyzer.
4. Toggle the saturator's bypass and set the utility gain so both states read the same short-term LUFS, within 0.5 LU. At matched loudness the saturated version usually peaks lower.
5. Watch the analyzer as you toggle. New peaks appear at multiples of each note.
6. Have someone else toggle the bypass while you listen without looking, and pick the version that sits better in the mix.
7. Halve the drive and match the levels again.

At matched loudness the saturated bass sounds denser and closer, and you can follow it on a laptop speaker. When you halve the drive, the edge falls away much faster than the level does. If you cannot hear a difference once levels match, the drive was only making it louder.

## Common mistake: more drive is not more size

Past a point, more drive takes size away. Hard clipping flattens the transient of every hit, so the kick loses its punch and the bass loses its attack. When two or more notes go through a nonlinear curve together, as in a distorted chord, they also produce intermodulation: new tones at the sums and differences of the notes, which are not in key and sound muddy (Reiss and McPherson, 2014). And every harmonic that lands above the Nyquist limit folds back down as aliasing, covered in [why aliasing is a ghost frequency problem](/blog/why-aliasing-is-a-ghost-frequency-problem).

The other mistake is judging without matching level. Saturation almost always adds loudness, and the louder version wins a careless comparison.

## Producer takeaway: saturate for density, decide at matched level

Use saturation where a part needs to be heard more without peaking higher: bass, vocals, snare, synths. Drive in small steps, match loudness after each one, and stop when the part sits forward at the same level. On bass, try it in parallel: saturate a copy, high-pass the copy and blend it in, so the harmonics help on small speakers while the sub stays clean. [Small speakers need bass harmonics](/blog/the-physics-of-bass-on-small-speakers) walks through that setup.

## References

- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
- Smith, J. O. *Physical Audio Signal Processing*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/pasp/
`,
    seo: {
        title: 'Distortion adds size without more volume | VGP Studio',
        description: 'How saturation adds harmonics and lowers crest factor so a part sounds bigger at the same loudness, with the maths of a soft clipper and a level-matched test.',
        keywords: ['saturation', 'harmonic distortion', 'soft clipping', 'crest factor', 'level matching', 'sound design'],
    },
};
