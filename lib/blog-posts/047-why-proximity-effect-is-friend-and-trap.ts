import { BlogArticle } from '../blog-data';

// Extra bass of a 5 cm take over a 15 cm take, ideal cardioid model. This shelf matches it within 0.3 dB from 50 Hz to 5 kHz.
const CLOSE = { type: 'lowshelf' as const, freq: 300, gain: 9.5, q: 0.5 };

export const post047: BlogArticle = {
    slug: 'why-proximity-effect-is-friend-and-trap',
    title: 'How proximity effect turns warmth into mud',
    excerpt: 'Singing close to a directional mic adds bass that grows as the distance shrinks. Learn the physics, what the boost looks like and why a high-pass is the wrong fix.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Pressure-gradient mics, which include cardioids, add bass as the source gets closer. Omni pressure mics do not.',
        'Up close, small head movements change both the level and the amount of bass, so the take keeps shifting.',
        'Set the distance at the source. A steep high-pass is the wrong shape to undo the boost.',
    ],
    figures: {
        boost: {
            type: 'bars',
            min: 0,
            max: 24,
            unit: 'dB',
            caption:
                'Bass boost at 100 Hz for an ideal cardioid and a small source, computed from the formula above. Well below the turnover frequency, halving the distance adds about 6 dB. Real sources and capsules are often gentler at the closest distances, so read this as the shape.',
            alt: 'Bars of bass boost at 100 Hz by distance: 20.8 dB at 2.5 cm, 14.9 dB at 5 cm, 9.3 dB at 10 cm, 6.3 dB at 15 cm, 2.6 dB at 30 cm and 0.8 dB at 60 cm.',
            bars: [
                { label: '2.5 cm (1 in)', value: 20.8, display: '+20.8 dB' },
                { label: '5 cm (2 in)', value: 14.9, display: '+14.9 dB' },
                { label: '10 cm (4 in)', value: 9.3, display: '+9.3 dB' },
                { label: '15 cm (6 in)', value: 6.3, display: '+6.3 dB' },
                { label: '30 cm (12 in)', value: 2.6, display: '+2.6 dB' },
                { label: '60 cm (24 in)', value: 0.8, display: '+0.8 dB' },
            ],
        },
        fix: {
            type: 'spectrum',
            mode: 'gain',
            range: [50, 5000],
            marks: [{ f: 150, label: 'Cutoff' }],
            caption:
                'Grey: how much more bass a 5 cm take has than a 15 cm take in the ideal model. A 150 Hz high-pass still leaves about 5 dB extra at 200 Hz and cuts about 10 dB too much at 50 Hz. A low shelf of the matching shape flattens the difference.',
            alt: 'EQ gain from 50 Hz to 5 kHz. A grey curve rises to about 9 dB at the low end. A dashed curve, the same rise after a 150 Hz high-pass, peaks around 5 dB near 200 Hz and plunges below 100 Hz. A solid curve, after a low shelf, stays flat at 0 dB. A dashed line marks the 150 Hz cutoff.',
            curves: [
                { kind: 'eq', bands: [CLOSE], label: 'Close take', muted: true },
                { kind: 'eq', bands: [CLOSE, { type: 'highpass', freq: 150 }], label: 'High-pass 150 Hz', dashed: true },
                { kind: 'eq', bands: [CLOSE, { ...CLOSE, gain: -9.5 }], label: 'Low shelf -9.5 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'Why does a pressure-gradient mic gain bass when the source is close?',
            options: [
                'The sound is weaker at the back up close, and that gap holds in the lows',
                'The diaphragm resonates at a low frequency when a singer stands close',
                'Lows lose less energy than highs over a short path, so they arrive stronger',
                "A close mic picks up more of the singer's chest resonance under the voice",
            ],
            answer: 0,
            why: 'Far away, the mic responds to a phase difference between front and back, which is small at low frequencies. Close up, the level difference from the sound spreading out adds to it, and that part is the same at every frequency.',
        },
        {
            q: 'A singer at 5 cm leans back to 7.5 cm. Roughly how much does the level drop from distance alone?',
            options: ['0.7 dB', '1.5 dB', '3.5 dB', '6 dB'],
            answer: 2,
            why: '20 × log10(5 / 7.5) is about -3.5 dB. The same 2.5 cm move at 30 cm changes the level by only 0.7 dB.',
        },
        {
            q: 'Why is a 150 Hz high-pass a poor fix for proximity effect?',
            options: [
                "Its phase shift smears the vocal's low end against the bass",
                'Its slope is too gentle to reach the boost around 100 Hz',
                'It suits omni mics, but cardioids already roll off the lows',
                'It cuts too much below 150 Hz and leaves the boost above it',
            ],
            answer: 3,
            why: 'Proximity effect rises gently across a wide range. A high-pass falls away steeply below one frequency, so it removes the fundamental of a low voice and misses the low mids.',
        },
    ],
    content: `## Hook: closer sounds warmer, until it sounds like mud

To make a vocal sound close and personal, the instinct is to put the singer right on the mic, lips at the grille, half whispering. It does add weight.

It also adds a bass rise that crowds the low mids. The vocal starts to fight the kick and the bass, and the warmth you wanted turns into mud.

## Why it matters: a boost you did not set

Directional mics add bass as the source gets closer. Up to a point, this is the warmth you hear on close pop vocals and radio voices. Past that point, the vocal's low end piles up in the same range as the bass, the kick and the body of the keys and guitars. Low frequencies also mask higher ones more easily than the reverse, an effect called the upward spread of masking (Moore, 2012), so a boomy vocal covers some of its own consonants.

Close singing also makes the take unstable. Level falls about 6 dB each time the distance doubles, and the bass boost changes with distance as well. At 5 cm, a singer who leans back 2.5 cm drops 3.5 dB in level and, in the ideal model, loses about 3 dB of extra bass at 100 Hz with it. At 30 cm the same movement changes the level by 0.7 dB. A singer who moves while singing close gives you a vocal whose level and tone change from word to word.

## Science model: pressure, gradient and distance

An omnidirectional mic is usually a pressure mic. Its diaphragm is open to sound on one side only and responds to pressure, so it has no proximity effect. A figure-8 mic is a pressure-gradient mic. Sound reaches both sides of the diaphragm, and the mic responds to the difference between them. A cardioid combines the two in equal parts (Eargle, 2004).

For a distant source, the difference between front and back comes from the small extra path the sound travels to reach the back of the diaphragm. That is a phase difference, it shrinks at low frequencies, and the mic is designed to sound flat despite it. Close to a source there is a second difference: the sound is noticeably weaker at the back because it has spread out over the extra distance. That level difference does not depend on frequency, so it takes over at low frequencies, where the phase difference is small. The result is a bass rise of about 6 dB per octave below a turnover frequency, and the turnover moves up as the source comes closer.

You can put numbers on this with a textbook model: an ideal cardioid made of equal parts pressure and gradient, and a point source on axis at distance $r$. Working through that model, the boost at frequency $f$ comes out as:

$$G(f, r) = 10 \\log_{10}\\left(1 + \\left(\\frac{c}{4\\pi f r}\\right)^2\\right)$$

Here $c$ is the speed of sound, about 343 m/s. At 100 Hz this gives about 15 dB at 5 cm, 6 dB at 15 cm and 2.6 dB at 30 cm. A figure-8 has $\\tfrac{c}{2\\pi f r}$ in place of $\\tfrac{c}{4\\pi f r}$, so a figure-8 at 30 cm gets the same boost as a cardioid at 15 cm. The formula is derived from the idealized model, not measured. Real voices are not point sources and real capsules are not ideal. The measurements Inglis (2021) describes show that proximity effect depends on the source: some follow the theory closely, and others gain little bass at the closest distances. Treat the numbers as the shape and the direction, not as a spec.

::figure boost

The level swing comes from the inverse square law. Between two distances, the change in level is:

$$\\Delta L = 20 \\log_{10}\\left(\\frac{r_1}{r_2}\\right)$$

Moving from 5 cm to 7.5 cm gives $\\Delta L = 20 \\log_{10}(5 / 7.5)$, about -3.5 dB.

## DAW experiment: three distances, one line

1. Set up a cardioid mic of any type, with its bass roll-off switch off, and put a pop filter in front of it.
2. Have the singer sing one line with their lips about 5 cm (2 in) from the grille.
3. Record the same line at 15 cm (6 in) and at 30 cm (12 in) with the same vocal effort, raising the preamp gain so the peaks land at similar levels.
4. Level-match the three takes with clip gain.
5. Play each one in the full mix with the bass and drums.
6. Put a 150 Hz high-pass on the 5 cm take and compare it with the 15 cm take, unfiltered.

The 5 cm take should boom, and its level should wobble as the singer moves. The 15 cm take keeps its weight without crowding the bass. The filtered close take loses depth at the bottom while its low mids still sound swollen.

## Common mistake: fixing distance with a steep filter

Proximity effect rises gradually, about 6 dB per octave, across a wide range. A high-pass filter falls away steeply below one frequency. They are different shapes. A high-pass set high enough to remove the boom also removes the fundamental of a low voice, and it still leaves extra bass above its cutoff. The closer match is a broad low shelf, and the best match is the distance you wanted in the first place.

::figure fix

::demo filter

On the way in, a gentle high-pass around 80 Hz, or the mic's own roll-off switch, is safe for most vocals. It removes rumble, stand thumps and the lowest part of plosive pops. A steep cut at 150 Hz or higher while tracking is permanent, so make bigger moves in the mix, where you can undo them.

## Producer takeaway: set the distance with the pop filter

Start most singers around 15 cm (6 in) from a cardioid: close enough for weight, far enough that small movements do not swing the level. Use the pop filter as a distance guide. Place it where you want the singer's lips and ask them to sing just behind it, so the distance stays the same from take to take. Move loud or deep voices further back. For an intimate whisper, go closer on purpose and plan for a low shelf, or switch a multi-pattern mic to omni, which has no proximity effect but picks up more of the room.

## References

- Eargle, J. (2004). *The Microphone Book* (2nd ed.). Focal Press.
- Inglis, S. (2021, November). Proximity effect: In theory and in practice. *Sound On Sound*. https://www.soundonsound.com/techniques/proximity-effect
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
`,
    seo: {
        title: 'How proximity effect turns warmth into mud | VGP Studio',
        description: 'Cardioid mics add bass as a singer gets closer. Learn the physics of proximity effect, how big the boost gets and how to set mic distance instead of EQ.',
        keywords: ['proximity effect', 'microphone distance', 'cardioid microphone', 'inverse square law', 'vocal recording tips', 'vocal low end'],
    },
};
