import { BlogArticle } from '../blog-data';

// A(t) = 1 - e^(-t / tau) with tau = 0.12 of the plot width.
const TAU = 0.12;
const EXP_ATTACK: [number, number][] = Array.from({ length: 51 }, (_, i) => [i / 50, 1 - Math.exp(-i / 50 / TAU)]);
const NOTE_MARKS = [
    { t: 0.05, label: 'Note on' },
    { t: 0.7, label: 'Note off' },
];

export const post037: BlogArticle = {
    slug: 'why-attack-time-changes-emotional-intent',
    title: 'Attack time changes how a part feels',
    excerpt: 'Attack time is one of the main cues the ear uses to tell sounds apart. A fast onset speaks on the beat and sits forward; a slow one swells and sits back.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Attack time is one of the main cues the ear uses to tell sounds apart, so changing it changes what kind of instrument a part seems to be.',
        'A fast attack lands on the beat and sits forward. A slow one becomes audible later and sits further back.',
        'Shape the envelope before you reach for EQ, and move slow-attack parts a little earlier to keep them in time.',
    ],
    figures: {
        adsr: {
            type: 'signal',
            caption:
                'Two ADSR envelopes for the same note, with the same sustain and release. The fast attack is at full level almost as soon as the note starts. The slow one is still rising for nearly half the note, which is why it sounds later, softer and further back.',
            alt: 'Two level plots between a note-on and a note-off marker. In the first, the level jumps to its peak at once, falls to a sustain level and holds. In the second, the level ramps up slowly to the peak before falling to the same sustain level.',
            rows: [
                {
                    label: 'Fast attack',
                    unipolar: true,
                    marks: NOTE_MARKS,
                    traces: [{ kind: 'envelope', points: [[0, 0], [0.05, 0], [0.07, 1], [0.2, 0.65], [0.7, 0.65], [0.85, 0], [1, 0]] }],
                },
                {
                    label: 'Slow attack',
                    unipolar: true,
                    marks: NOTE_MARKS,
                    traces: [{ kind: 'envelope', points: [[0, 0], [0.05, 0], [0.35, 1], [0.48, 0.65], [0.7, 0.65], [0.85, 0], [1, 0]] }],
                },
            ],
        },
        tau: {
            type: 'signal',
            caption:
                'An analog-style attack, computed from the formula. The level covers 63 percent of the way in one time constant and 95 percent in three, then keeps creeping toward full level.',
            alt: 'A level curve that rises steeply from zero and bends over toward full level. Dashed vertical lines mark one time constant, where it reaches 63 percent, and three time constants, where it reaches 95 percent.',
            rows: [
                {
                    label: 'Exponential attack',
                    unipolar: true,
                    marks: [
                        { t: TAU, label: 'τ: 63%' },
                        { t: 3 * TAU, label: '3τ: 95%' },
                    ],
                    traces: [{ kind: 'envelope', points: EXP_ATTACK }],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'Your synth string patch has the right brightness, but it still sounds like a pad instead of a plucked string. According to the timbre study by McAdams and colleagues, which control does most to change what instrument it seems to be?',
            options: ['The attack time of the envelope', 'The stereo width of the patch', 'The output level of the synth', 'The sample rate of the session'],
            answer: 0,
            why: 'When listeners rate how different instrument sounds are, rise time comes out as one of the main dimensions, alongside where the energy sits in the spectrum. With the spectrum already right, a faster attack is what turns a swell into a pluck.',
        },
        {
            q: 'An exponential attack has a time constant of 20 ms. Roughly how long until it reaches 95 percent of full level?',
            options: ['20 ms', '40 ms', '60 ms', '100 ms'],
            answer: 2,
            why: '95 percent takes three time constants: 3 × 20 = 60 ms. One time constant only gets the level to 63 percent.',
        },
        {
            q: 'You lengthen the attack on a chord part and now it feels behind the beat. What fixes the timing and keeps the swell?',
            options: [
                'Boost its high end with an EQ',
                'Add a fast-attack compressor',
                'Turn the whole part up by 3 dB',
                'Nudge the whole part earlier',
            ],
            answer: 3,
            why: 'A slow attack becomes audible later than the note starts. Moving the part earlier lets it reach full level near the beat while it still swells in.',
        },
    ],
    content: `## Hook: the chords with no attitude

You programmed a chord progression you like, but it feels lazy. It sits at the back of the mix and does not push the song forward. So you open an EQ, boost the highs for bite and the mids for punch. The chords get brighter and louder. They still drag.

The drag comes from the envelope, which EQ leaves alone. How a note starts is set in its first moments, by the attack. A slow attack keeps a part relaxed and behind the beat however bright you make it. A fast attack makes it speak at once.

## Why it matters: the onset is part of the timbre

Attack time is not a small detail of a sound. When listeners rate how different instrument sounds are, rise time comes out as one of the main dimensions they use, alongside where the energy sits in the spectrum (McAdams and colleagues, 1995). Change the attack and you change what kind of instrument the part seems to be: plucked, struck, bowed or swelling.

It changes timing too. A fast attack reaches full level almost the moment the note starts, so the part lands where you placed it. A slow attack takes time to rise above the rest of the mix, so the same note seems to arrive late and the part leans behind the beat.

It also changes depth. Listeners judge distance from level, from the balance of direct sound against room reflections, and over long distances from the loss of high frequencies (Zahorik, Brungart and Bronkhorst, 2005). A sharp onset belongs to the direct sound, and the reflections of a room blur onsets. A soft attack can therefore resemble a sound heard from further away, and parts with slow attacks tend to sit behind parts with fast ones.

::figure adsr

::demo envelope

## Science model: the amplitude envelope

A synth shapes each note with an envelope, usually ADSR: attack, decay, sustain and release. In many analog envelope generators, and in digital models of them, the attack is a capacitor charging, which gives an exponential rise toward full level:

$$A(t) = A_{\\max} \\left( 1 - e^{-t/\\tau} \\right)$$

$\\tau$ is the time constant. After one time constant the level has covered 63 percent of the way, after three 95 percent and after five more than 99 percent. With a short $\\tau$ the note is at full level almost at once. With a long one it is still rising when a faster part would already be on its next note.

::figure tau

Synths label the attack knob in different ways, often as the time to reach full level rather than $\\tau$, and some use straight-line ramps. The same number can feel different from one synth to another, so trust your ears and the meter more than the label.

A fast rise also puts more high-frequency energy into the onset. A sudden step contains energy across the whole spectrum, while a slow swell adds almost nothing beyond the note's own harmonics. That is why a fast attack sounds like a click or a pluck and a slow one sounds soft, even at the same peak level.

## DAW experiment: the attack duplication test

Hear one part change its job when only the attack changes.

1. Load a synth pluck or chord part that plays on the beat with your drums.
2. Duplicate the track. On the copy, raise the amp envelope attack from about 1 ms to 80 ms. For an audio part, use a transient shaper on the copy and turn the attack down by about 6 dB instead.
3. Put a loudness meter on both and match them to the same short-term LUFS, within 0.5 LU.
4. Loop four bars with the drums and switch between the two versions.
5. On the slow copy, move the part earlier in 5 ms steps until the notes feel on the beat again, and note how far you had to go.
6. Send both versions to the same short room reverb at the same level and compare how far back each one sits.
7. Pick the version that fits the part's job before you add any compression or EQ.

The fast version speaks on the beat and sits forward. The slow version swells, leans behind the beat until you move it earlier, and sinks further into the reverb.

## Common mistake: fixing an envelope problem with EQ

An EQ can make a slow attack brighter, but it cannot make it faster. If a part feels lazy, change its attack before you touch its tone.

The opposite mistake happens on drums: a compressor at its fastest attack, often well under 1 ms. It clamps the transient of every hit, so the kick and snare lose their crack and sink back. A slower attack, tens of milliseconds as a starting point, lets the transient through before the gain reduction starts. The [lesson on compression and motion](/blog/how-compression-changes-motion-not-level) shows that in detail.

## Producer takeaway: shape the envelope before the EQ

Decide how each part should speak before you decide how it should sound. Leads and rhythm parts that drive the song need fast attacks. Pads that should sit behind the vocal can swell in slowly, and moving them a little earlier keeps them in time. If a part lacks punch, shorten its attack or use a transient shaper. If a pad crowds the vocal, lengthen its attack and let it sit back.

## References

- McAdams, S., Winsberg, S., Donnadieu, S., De Soete, G., & Krimphoff, J. (1995). Perceptual scaling of synthesized musical timbres: Common dimensions, specificities, and latent subject classes. *Psychological Research*, 58(3), 177-192.
- Zahorik, P., Brungart, D. S., & Bronkhorst, A. W. (2005). Auditory distance perception in humans: A summary of past and present research. *Acta Acustica united with Acustica*, 91(3), 409-420.
`,
    seo: {
        title: 'Attack time changes how a part feels | VGP Studio',
        description: 'How attack time shapes timbre, timing and depth, what the exponential attack formula means for your envelope settings, and a test to hear it in your mix.',
        keywords: ['attack time', 'amplitude envelope', 'ADSR', 'transient shaping', 'mix depth', 'sound design'],
    },
};
