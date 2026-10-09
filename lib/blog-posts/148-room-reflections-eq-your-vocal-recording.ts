import { BlogArticle } from '../blog-data';

// Mouth and mic the same height h above a hard desk, d apart. The reflection comes from the mouth's
// mirror image 2h below it: reflected path sqrt(d² + (2h)²), delay = (reflected - direct) / 343 m/s,
// relative level g = direct / reflected (spreading loss only, perfectly hard desk).
// h 0.30, d 0.30: path 0.671 m, delay 1.081 ms, g 0.447. h 0.45, d 0.30: path 0.949 m, delay 1.891 ms, g 0.316.

export const post148: BlogArticle = {
    slug: 'room-reflections-eq-your-vocal-recording',
    title: 'Room reflections EQ your vocal before you do',
    excerpt: 'A hard surface near the mic adds a late copy of the voice and carves a comb of notches into the take. How to work out where they fall and get rid of them.',
    category: 'vocal-production',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Before you EQ a hollow vocal, look for hard surfaces near the mic: each one adds a late copy of the voice that carves evenly spaced notches into the take.',
        'Bring the mic closer to the singer or move both away from the surface, so the reflection arrives weaker and the comb gets shallower.',
        'Absorb at the reflection point and keep EQ for the overall tone, because the notches move every time the singer leans.',
    ],
    figures: {
        desk: {
            type: 'spectrum',
            mode: 'gain',
            range: [100, 5000],
            db: 6,
            caption:
                'Mic 30 cm from the singer, mouth and mic 30 cm above a perfectly hard desk, computed from the geometry. The reflection arrives 1.08 ms late and 7 dB down, so the take gets notches at 462 Hz, 1.39 kHz, 2.31 kHz and up, dipping 5.1 dB. Raise both by 15 cm and every notch moves, the first to 264 Hz, and the dips shrink to 3.3 dB.',
            alt: 'Gain against frequency from 100 Hz to 5 kHz. A solid curve ripples between about +3 dB and -5 dB with its first dip at 462 Hz and further dips about 925 Hz apart. A dashed curve ripples less, between about +2 dB and -3 dB, with its first dip at 264 Hz and dips closer together.',
            curves: [
                { kind: 'comb', delayMs: 1.081, mix: 0.447, label: 'Desk 30 cm below' },
                { kind: 'comb', delayMs: 1.891, mix: 0.316, label: 'Desk 45 cm below', dashed: true },
            ],
            marks: [
                { f: 264, label: '264 Hz' },
                { f: 462, label: '462 Hz' },
            ],
        },
        distance: {
            type: 'bars',
            min: 0,
            max: 14,
            unit: 'dB',
            caption:
                'How deep the desk comb is, from its peaks to its notches, as the mic moves away from the mouth. Mouth and mic stay 30 cm above a hard desk. The reflected path changes much less than the direct one, so a closer mic hears the direct sound much louder than the reflection.',
            alt: 'Five bars of peak-to-notch depth by mic distance: 2.9 dB at 10 cm, 4.3 dB at 15 cm, 5.7 dB at 20 cm, 8.4 dB at 30 cm and 13.2 dB at 50 cm.',
            bars: [
                { label: 'Mic 10 cm away', value: 2.9, display: '2.9 dB' },
                { label: 'Mic 15 cm away', value: 4.3, display: '4.3 dB' },
                { label: 'Mic 20 cm away', value: 5.7, display: '5.7 dB' },
                { label: 'Mic 30 cm away', value: 8.4, display: '8.4 dB' },
                { label: 'Mic 50 cm away', value: 13.2, display: '13.2 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'A reflection travels 0.686 m further than the direct sound. At 343 m/s, where is the first notch?',
            options: ['125 Hz', '250 Hz', '500 Hz', '1 kHz'],
            answer: 1,
            why: 'The delay is 0.686 / 343 = 2 ms. The first notch is where that equals half a cycle: 1 / (2 × 0.002 s) = 250 Hz, with more every 500 Hz above it.',
        },
        {
            q: 'Why is a static EQ a fragile fix for a desk reflection?',
            options: [
                'An EQ cut adds its own comb filter to the take',
                'EQ cannot change anything once the take is mono',
                'The notches are too narrow for any bell to reach',
                'The notches move whenever the singer leans in',
            ],
            answer: 3,
            why: 'The notch frequencies come from the path difference. A few centimetres of movement changes the delay, so bands tuned to one position miss the notches at the next.',
        },
        {
            q: 'A blanket over the desk absorbs 90% of the sound energy at some frequency. How much weaker is the reflection there?',
            options: ['10 dB', '3 dB', '6 dB', '20 dB'],
            answer: 0,
            why: 'Only 10% of the energy comes back, and 10 × log10(0.1) = -10 dB. In the 30 cm example that shrinks the dips from 5.1 dB to about 1.3 dB.',
        },
    ],
    content: `## Hook: the demo vocal that sounds boxed in

You track a demo vocal at your desk: mic on a short stand over the keyboard, the singer (usually you) leaning in. The take sounds slightly hollow, as if the voice came through a cardboard tube. You try a few EQ boosts and each one makes it more nasal. The next day you sing the same line standing up, a metre back from the desk, and the colour is gone.

The desk did that: part of the voice bounced off it and reached the mic about a millisecond after the direct sound, and the mic recorded the sum.

## Why it matters: the mic hears one point

A microphone measures the pressure at one spot. Into that spot arrives the direct sound from the mouth, plus a copy from every nearby surface, each one late by its extra path and weaker for the longer trip. The nearest hard surfaces send back the earliest and strongest copies: a desk, a window, a bare wall, a music stand with a lyric sheet on it.

A copy that arrives within a few milliseconds does not sound like an echo. It changes the tone, because a sound plus a delayed copy of itself is a comb filter, the effect the [phase lesson](/blog/phase-explained-without-panic) builds from two equal copies. A reflection is a weaker copy, so its notches are shallower, and it moves whenever someone moves. Once the take is recorded, direct sound and reflection share one waveform, with no clean way to pull them apart.

Unlike the [room modes that rule small-room bass](/blog/why-your-low-end-lies-in-a-small-room), this needs no resonance. One strong reflection off a nearby surface is enough to colour a vocal's mid range.

## Science model: path, delay and depth

Treat the hard surface as a mirror. The reflection behaves as if it came from an image of the mouth behind the surface, so its path length is the straight distance from that image to the mic. With the direct path $r_d$, the reflected path $r_r$ and the speed of sound $c$, about 343 m/s at room temperature:

$$\\Delta t = \\frac{r_r - r_d}{c}, \\qquad f_{\\text{notch}} = \\frac{2k + 1}{2\\,\\Delta t}, \\quad k = 0, 1, 2, \\dots$$

Take the desk in the hook. Mouth and mic are 30 cm apart, both 30 cm above the desk. The image of the mouth sits 60 cm below it, so the reflected path is $\\sqrt{0.3^2 + 0.6^2} \\approx 0.671$ m, 0.371 m longer than the direct one. That is 1.08 ms of delay, which puts notches at 462 Hz, 1.39 kHz, 2.31 kHz and every 925 Hz above.

How deep the notches go depends on how loud the copy is. Sound spreading from a small source falls in amplitude in inverse proportion to the distance travelled, so a perfectly hard surface sends the copy back at

$$g = \\frac{r_d}{r_r}$$

of the direct level, here 0.3 / 0.671 = 0.447, or 7 dB down. A signal plus a copy at relative level $g$ swings between $1 + g$ at the peaks and $1 - g$ at the notches (Zölzer, 2011): +3.2 dB and -5.1 dB in this case. A cardioid aimed at the mouth hears the desk reflection off axis, a voice beams forward at high frequencies and no desk reflects perfectly, so treat these numbers as the worst case for this layout.

::figure desk

Raise mouth and mic by 15 cm and the reflected path grows to 0.949 m. The delay becomes 1.89 ms, the first notch drops to 264 Hz, the spacing narrows to 529 Hz, and the copy is now 10 dB down, so the dips shrink to 3.3 dB. Smaller moves count too. If the singer leans so the path difference grows by 5 cm, the notch at 2.31 kHz slides to about 2.04 kHz.

Mic distance has a large effect on the depth. Moving the mic toward the mouth shortens the direct path a lot while the reflected path barely changes, so $g$ falls. At 10 cm the copy is 15.7 dB down and the whole comb spans 2.9 dB. The price is [proximity effect](/blog/why-proximity-effect-is-friend-and-trap) and a level that swings as the singer moves.

::figure distance

Absorption weakens the copy where it bounces. An absorption coefficient $\\alpha$ is the share of the sound energy a surface soaks up, so the reflected level changes by $10 \\log_{10}(1 - \\alpha)$ dB. A surface that absorbs 90% at some frequency sends back a copy 10 dB weaker there, and in the 30 cm example the dips shrink from 5.1 dB to about 1.3 dB. Thick porous material, such as a folded duvet or a proper absorber panel, works down into the mid range; a thin cloth mostly takes out the highs (Everest and Pohlmann, 2015).

The phase demo below uses two equal copies of a bass, the deepest comb there is. A reflection is a weaker copy, but listen for the same thing: how the tone changes as the delay changes.

::demo phase

## DAW experiment: measure your own desk

1. Put a phone or small speaker where the singer's mouth would be, 30 cm from the mic and both about 30 cm above your desk, and play pink noise from it.
2. Record 10 seconds. Then lift speaker and mic together, keeping their spacing, to about head height and a metre or more from any wall, and record 10 seconds again.
3. Put a spectrum analyzer with slow averaging on each take. The desk take shows a row of regular dips that are much weaker or missing in the other take. The phone's own colour is the same in both, so the difference is the room.
4. Measure your real distances, work out the reflected path from the mirror image, calculate the first notch and compare it with the first dip you see.
5. Back at the desk, move the mic 5 cm closer to the speaker and record again. The dips move and get shallower.
6. Lay a folded duvet or a thick towel on the desk between them and record once more.
7. Sing one line at the desk and one line away from it, at the same mic distance, and compare them level-matched.

The dips you see should sit near the frequencies you calculated, move when the geometry moves and shrink when the desk is covered or the mic comes closer.

## Common mistake: fitting EQ to a comb

On the recording, the comb is a filter, so an EQ can counter it at one position. It needs a band for every notch, though, and the notches move every time the singer leans. A set of narrow boosts tuned to one moment is wrong a few centimetres later, and on the takes where it misses it adds peaks of its own.

The other mistake is treating the wrong surface. Foam on the wall behind the singer does little if the strongest reflection comes off the desk under the mic. To find the reflection point on a surface, lay a mirror flat on it and move it until, looking from the mic's position, you can see the singer's mouth in it. That spot is where the absorber goes.

## Producer takeaway: fix the geometry first

When a vocal sounds hollow and EQ keeps making it worse, look at what is near the mic before you touch another knob. Move the singer and mic away from the desk, window or bare wall. Then set a steady mic distance, closer if the comb is still audible and the proximity bass allows it. If you cannot move, put something thick at the reflection point the mirror shows you. Record a short test after each step, and use EQ last, for the tone of the voice rather than the notches.

Moving and setting the distance cost nothing and often do the job. A singer standing clear of the desk, with the mic at a steady distance, gives you a take to shape with EQ rather than repair.

## References

- Everest, F. A., & Pohlmann, K. C. (2015). *Master Handbook of Acoustics* (6th ed.). McGraw-Hill Education.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Room reflections EQ your vocal before you do | VGP Studio',
        description: 'A hard surface near the mic adds a delayed copy of the voice and a comb of notches. Work out where they fall, and fix placement before you reach for EQ.',
        keywords: ['comb filtering vocals', 'early reflections', 'vocal recording room', 'mic placement', 'acoustic treatment', 'home vocal booth'],
    },
};
