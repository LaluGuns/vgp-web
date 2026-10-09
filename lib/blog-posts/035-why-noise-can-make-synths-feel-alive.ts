import { BlogArticle } from '../blog-data';

// Two notes and their level over time.
const NOTES: [number, number][] = [
    [0, 0], [0.05, 0], [0.06, 1], [0.2, 0.6], [0.4, 0.6], [0.47, 0],
    [0.55, 0], [0.56, 1], [0.7, 0.6], [0.9, 0.6], [0.97, 0], [1, 0],
];

export const post035: BlogArticle = {
    slug: 'why-noise-can-make-synths-feel-alive',
    title: 'Noise can make synths breathe',
    excerpt: 'Acoustic instruments carry noise that moves with each note. Give a synth\'s noise the same envelope and it fuses into the sound instead of sitting beside it.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Acoustic instruments carry noise that starts, changes and stops with each note, and a clean oscillator has none of it.',
        'The ear joins sounds that move together, so noise on the note\'s envelope fuses with it while a steady hiss track stays separate.',
        'Generate noise inside the voice, filter it with the oscillator and band-pass it to where you want breath, bite or air.',
    ],
    figures: {
        fusion: {
            type: 'signal',
            caption:
                'Two notes and their noise, sketched as levels over time. Above, the noise runs at one level through notes and gaps, so it is heard as a second sound. Below, it bursts on each attack, then falls and stops with the note, so it is heard as part of it.',
            alt: 'Two level plots with two synth notes each. In the first, a dashed noise line stays flat across the whole plot. In the second, the dashed noise line jumps up at each note start, drops to a low level and ends when each note ends.',
            rows: [
                {
                    label: 'Noise on its own track',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', label: 'Synth note', points: NOTES },
                        { kind: 'envelope', label: 'Noise', dashed: true, points: [[0, 0.18], [1, 0.18]] },
                    ],
                },
                {
                    label: 'Noise inside the voice',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', label: 'Synth note', points: NOTES },
                        {
                            kind: 'envelope',
                            label: 'Noise',
                            dashed: true,
                            points: [
                                [0, 0], [0.05, 0], [0.055, 0.4], [0.1, 0.15], [0.4, 0.15], [0.47, 0],
                                [0.55, 0], [0.555, 0.4], [0.6, 0.15], [0.9, 0.15], [0.97, 0], [1, 0],
                            ],
                        },
                    ],
                },
            ],
        },
        split: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'One note split the way a sines-plus-noise model sees it. The oscillator is a set of lines at multiples of 110 Hz. The noise is a smooth band with no pitch, here band-passed to the upper mids, where it reads as breath or bite.',
            alt: 'Harmonic lines starting at 110 Hz and getting shorter with frequency, over a low, wide dashed hump centred around 3.5 kHz.',
            curves: [
                { kind: 'hump', center: 3500, width: 1, level: 0.25, label: 'Band-passed noise', dashed: true },
                { kind: 'harmonics', f0: 110, count: 60, rolloff: 1, label: 'Oscillator harmonics' },
            ],
        },
    },
    quiz: [
        {
            q: 'A hiss track runs at a constant level under a synth. Why does it sound like a separate sound?',
            options: [
                "It masks the top of the synth's harmonics",
                "It sits an octave above the synth's notes",
                'It does not rise and fall with the notes',
                'Its level is too low to blend with the synth',
            ],
            answer: 2,
            why: 'The ear groups parts that start together and change together. A steady hiss shares neither cue with the notes, so it is filed as a second source.',
        },
        {
            q: 'In y(t) = s(t) + e(t) n(t), what does making e(t) follow the note do?',
            options: [
                'It turns the noise into extra harmonics of the note',
                'It makes the noise start and stop with the note',
                'It raises the noise to the level of the oscillator',
                'It band-passes the noise to the upper mid range',
            ],
            answer: 1,
            why: 'e(t) is only the level of the noise over time. When it follows the note, the noise shares the note\'s onset and decay, which is what lets the ear hear one instrument.',
        },
        {
            q: 'Why can noise add texture without clashing with the key of the song?',
            options: [
                'It is quieter than the oscillator in the mix',
                'Its energy sits above the range of the notes',
                "Synths tune the noise to the patch's root note",
                'It has no pitch, just a spread of energy',
            ],
            answer: 3,
            why: 'Pitched sounds put energy on lines at multiples of a note. Noise spreads energy across a band, so it fills the gaps between those lines without adding a competing note.',
        },
    ],
    content: `## Hook: the sterile digital synth

You load a wavetable synth, pick a clean saw and program a chord progression. The tuning is perfect and the filter sweep is smooth, yet it sounds cold, as if it lives inside the computer. You add chorus and a stereo delay. It gets wider. It still sounds sterile.

Acoustic instruments are never pure pitched tone. A violin has the scrape of the bow, a flute the rush of breath, a piano the thump of the hammer. Each of those noises starts with the note, changes with it and stops with it. A clean oscillator has none of that, and the ear notices what is missing.

## Why it matters: noise that moves with the note joins it

Adding noise is easy. Making it part of the instrument is the hard part. The ear groups sound by how it behaves over time: components that start together and rise and fall together are heard as one source, and components that do their own thing split off into separate streams (Bregman, 1990).

A vinyl crackle or hiss track running under the synth at a fixed level fails both tests. It starts before the note and keeps going after it, so the ear files it as a second sound beside the synth. A steady background also fades from attention through habituation, so after a while it is only clutter.

The same noise inside the synth voice, shaped by the note's envelope and passed through the same filter, passes both tests. It starts with the attack, falls with the decay and darkens as the filter closes, so the ear hears one instrument with breath in it.

::figure fusion

## Science model: sines plus noise

A standard way to describe instrument sounds splits them into two parts: a set of sinusoids that carry the pitch, and a noise part that carries everything else, with its own changing level and spectrum. Serra and Smith (1990) built an analysis and synthesis method on exactly this split. A simple version for one synth voice:

$$y(t) = s(t) + e(t) \\, n(t)$$

Here $s(t)$ is the oscillator, $n(t)$ is a noise source, usually filtered, and $e(t)$ is the envelope that sets how loud the noise is at each moment. With $e(t)$ held constant you have a hiss track. With $e(t)$ following the note, or a short envelope of its own on the attack, the noise becomes part of the note.

The two parts also sit differently in the spectrum. The harmonic part is a set of lines at multiples of the note. Noise has no pitch: it is a smooth spread of energy that fills the gaps between those lines, so it adds texture without clashing with the key. Band-passing it decides where the texture lives: low for thump, upper mids for breath and bite, the top for air.

::figure split

## DAW experiment: the in-voice noise test

Hear the difference between noise beside a synth and noise inside it.

1. Open a synth with a noise oscillator, such as Vital or Serum, and start from an initialized patch.
2. Set oscillator 1 to a saw, and the amp envelope to attack 5 ms, decay 400 ms, sustain at about half level, release 300 ms.
3. Turn on the noise oscillator with white noise, route it through the same filter as the saw, and start with its level at zero.
4. Loop a four-note chord and raise the noise level until you can just hear it with the chord.
5. Turn the synth's noise off. On a separate track, run a white-noise generator at about the same level all the time, and listen to it with the chord.
6. Mute that track and bring the synth's own noise back. Because it plays inside the voice, it already follows the amp envelope.
7. Give the noise level a second envelope (attack 0 ms, decay 60 ms, sustain 0), then add a filter envelope that closes the filter after each attack.

The constant noise track sounds like hiss next to the synth. The in-voice noise sounds like breath or bow inside the note, and the short noise envelope gives every attack a little bite.

## Common mistake: the static background loop

A vinyl crackle or rain sample on its own track for the whole song is a common way to add warmth. It is a valid lo-fi colour, but it does not make the synth itself sound played. It is one more layer, it adds steady energy in the upper mids and highs where it can blur transients, and the ear soon stops attending to it.

The opposite mistake is too much. Noise that is obvious in solo is usually too loud in the mix. It should be something you miss when you mute it, not something you hear first.

## Producer takeaway: put the noise inside the voice

Treat noise as part of the instrument. Generate it in the synth voice, run it through the same filter, give it the note's envelope or a short one of its own, and band-pass it to the range you want: low for thump, upper mids for breath, the top for air. On a bass, a short burst of filtered noise on each attack adds snap without adding any low end.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Serra, X., & Smith, J. O. (1990). Spectral modeling synthesis: A sound analysis/synthesis system based on a deterministic plus stochastic decomposition. *Computer Music Journal*, 14(4), 12-24.
`,
    seo: {
        title: 'Noise can make synths breathe | VGP Studio',
        description: 'Why a steady noise track sits beside a synth while noise on the note\'s envelope fuses with it, explained with the sines-plus-noise model and a synth test.',
        keywords: ['noise oscillator', 'synth sound design', 'sines plus noise', 'amplitude envelope', 'auditory grouping', 'organic synth'],
    },
};
