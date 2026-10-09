import { BlogArticle } from '../blog-data';

// The first harmonics of a saw (every harmonic at 1/n) and a square (odd harmonics at 1/n), two periods each.
const SAW = Array.from({ length: 10 }, (_, i) => ({ cycles: 2 * (i + 1), amp: 0.45 / (i + 1) }));
const SQUARE = [1, 3, 5, 7, 9, 11].map((n) => ({ cycles: 2 * n, amp: 0.9 / n }));

export const post031: BlogArticle = {
    slug: 'why-timbre-tells-the-brain-what-this-is',
    title: 'Timbre tells the brain what arrived',
    excerpt: 'Pitch says which note. Timbre says what is playing it, and listeners hear it in a fraction of a second. Choose the sound before you polish the melody.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Timbre is what tells two sounds apart at the same pitch and loudness, and listeners pick it up within a fraction of a second.',
        'It comes from the balance of harmonics and from how a sound starts and changes, so the attack matters as much as the tone.',
        'Choose the sound before you polish the notes, and give parts that share a register clearly different colours.',
    ],
    figures: {
        shapes: {
            type: 'signal',
            caption:
                'Three waves with the same period, so the same pitch. They differ only in which harmonics they contain and how strong each one is. Each is built from its first few harmonics, which is why the edges ripple.',
            alt: 'Three waveforms with two cycles each: a smooth sine, a ramp-shaped saw and a flat-topped square, each drawn as a sum of sine waves.',
            rows: [
                { label: 'Sine: the fundamental alone', traces: [{ kind: 'sine', cycles: 2, amp: 0.8 }] },
                { label: 'Saw: every harmonic', traces: [{ kind: 'sum', parts: SAW }] },
                { label: 'Square: odd harmonics only', traces: [{ kind: 'sum', parts: SQUARE }] },
            ],
        },
        slopes: {
            type: 'spectrum',
            mode: 'level',
            range: [50, 5000],
            caption:
                'The same 110 Hz note with two spectral envelopes. The lines sit at the same frequencies, so the pitch does not change. In the second the tops fall faster, which you hear as a rounder, darker sound.',
            alt: 'Two sets of harmonic lines starting at 110 Hz. The grey set falls slowly with frequency; the white set falls much faster, so its upper lines are very short.',
            curves: [
                { kind: 'harmonics', f0: 110, count: 40, rolloff: 1, label: 'Falling as 1/n (saw)', muted: true },
                { kind: 'harmonics', f0: 110, count: 40, rolloff: 2, label: 'Falling as 1/n²' },
            ],
        },
    },
    quiz: [
        {
            q: 'Two tones have the same pitch and the same loudness, but they sound different. What differs?',
            options: [
                'Their harmonic balance and their onsets',
                'The fundamental frequency of each tone',
                'The sample rate that each was recorded at',
                'Their average level on the master meter',
            ],
            answer: 0,
            why: 'Same pitch means the same fundamental. What is left is timbre: which harmonics are present, how strong they are, and how the sound rises and evolves.',
        },
        {
            q: 'A saw and a square play the same 110 Hz note. Which statement is right?',
            options: [
                'The square has no energy at 110 Hz',
                'The square sounds an octave higher',
                'Both have identical harmonic levels',
                'The square has no even harmonics',
            ],
            answer: 3,
            why: 'Both have their fundamental at 110 Hz, so the pitch matches. The saw adds 220, 330, 440 Hz and so on; the square skips the even ones and adds only 330, 550, 770 Hz and up.',
        },
        {
            q: 'Listeners can match a 200 ms clip of a popular song to its title more often than chance. What are they using?',
            options: [
                'Melody, the shape of the first few notes',
                'Lyrics, the words of the opening line',
                'Timbre, the spectral detail of the mix',
                'Tempo, the speed of the underlying beat',
            ],
            answer: 2,
            why: 'A fifth of a second holds a note or two at most, too little for a melody, lyric or tempo. Removing the high frequencies dropped the shortest clips to chance, which points to timbre.',
        },
    ],
    content: `## Hook: same notes, different instrument

You program a melody and play it on a synth lead. Then a singer sings the same notes at the same tempo. You know at once which is which, before the first note has finished. Filter the synth or distort the vocal and you still do not confuse them.

The notes did not tell you that. The timbre did: the quality that lets you tell two sounds apart at the same pitch and loudness. It works fast. In one study, listeners heard clips of popular recordings only 100 or 200 milliseconds long and still matched them to the right title and artist more often than chance. When the clips were played backwards or had their high frequencies removed, the shortest clips dropped to chance (Schellenberg, Iverson and McKinnon, 1999). A tenth of a second is far too short for a melody. It is long enough for a sound.

## Why it matters: the sound is part of the part

When you choose a preset after the notes are written, you treat the sound as packaging. The listener hears it the other way round. The same four bars on a bright saw lead, a soft sine pluck and a slow pad are three different parts. One pushes, one sits close, one floats behind.

Timbre also decides whether parts stay separate in a mix. The ear sorts a mix into streams, one per source, and sounds with similar timbre in the same register tend to be grouped together (Bregman, 1990). Two similar pads in the same octave blend into one sound, and the quieter one is masked. Choose contrasting sounds from the start, one bright and edgy, the other round and soft, and they sit apart with little EQ.

::figure shapes

## Science model: harmonics and how they change

A pitched sound repeats. Anything that repeats can be built from sine waves at whole-number multiples of its repetition rate, the fundamental frequency $f_0$. Its spectrum is a set of lines:

$$X(f) = \\sum_{n=1}^{N} A_n \\, \\delta(f - n f_0)$$

Each term is one harmonic: a line at $n f_0$ with amplitude $A_n$. The fundamental sets the pitch. The amplitudes set the spectral envelope, the contour across the tops of the lines, and that contour is a large part of what you hear as colour. A saw has every harmonic, falling as $1/n$. A square has only the odd ones, also falling as $1/n$. A triangle has only odd ones falling as $1/n^2$, which is why it sounds close to a sine.

::figure slopes

::demo filter

The spectrum is only half of timbre. When listeners rate how different pairs of instrument sounds are, the same few properties keep explaining their judgements: how fast the sound rises at the start, where the centre of its spectrum sits, and how much the spectrum changes over time (Grey, 1977; McAdams and colleagues, 1995). The start matters for recognition too. Instruments become harder to identify once the starts of their notes are cut off (Saldanha and Corso, 1964). A sound's identity lives in how it starts as much as in how it sustains.

## DAW experiment: the four-sound test

Hear how much of a part's character comes from the sound rather than the notes.

1. Write a four-bar melody in MIDI between C4 and C5, with every velocity at 100.
2. Duplicate the track three times so you have four copies of the same notes.
3. Load four sounds: a saw lead with the filter fully open, a sine pluck (attack 1 ms, decay 300 ms, sustain 0), a pad with a 400 ms attack, and an electric piano.
4. Put a loudness meter on each track and set the faders so all four read the same short-term LUFS, within 1 LU.
5. Loop the melody and solo each track in turn. Write down one word for how each one feels.
6. Put a spectrum analyzer on the saw and on the pluck and compare how far up their harmonics reach.
7. On the saw, close a low-pass filter slowly from 20 kHz toward 1 kHz and stop where it no longer sounds like a lead.

The notes never change, yet you hear four different parts. The onset and the slope of the harmonics did more to the character than any note edit could.

## Common mistake: stacking the same colour

A weak line tempts you to add layers that sound like it, such as three saw leads in the same octave. Similar sounds that start together fuse into one, so the stack gets louder without getting more distinct, and the small detail that made one of them interesting is masked by the other two. Stacking near-identical waves also causes phase problems of its own, covered in the [lesson on layered sounds](/blog/why-layered-sounds-often-get-smaller).

The other mistake is choosing a sound in solo. A pad that sounds rich on its own may be the reason the vocal disappears. Judge timbre against the parts it has to live with.

## Producer takeaway: choose character before detail

Pick the sound before you polish the notes. Give each part its own face: if the lead is bright and sharp, keep the support round and slower. If two parts must share a register, make their onsets or their harmonic slopes clearly different. When a part does not work, try a different sound before you rewrite it.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Grey, J. M. (1977). Multidimensional perceptual scaling of musical timbres. *Journal of the Acoustical Society of America*, 61(5), 1270-1277.
- McAdams, S., Winsberg, S., Donnadieu, S., De Soete, G., & Krimphoff, J. (1995). Perceptual scaling of synthesized musical timbres: Common dimensions, specificities, and latent subject classes. *Psychological Research*, 58(3), 177-192.
- Saldanha, E. L., & Corso, J. F. (1964). Timbre cues and the identification of musical instruments. *Journal of the Acoustical Society of America*, 36(11), 2021-2026.
- Schellenberg, E. G., Iverson, P., & McKinnon, M. C. (1999). Name that tune: Identifying popular recordings from brief excerpts. *Psychonomic Bulletin & Review*, 6(4), 641-646.
`,
    seo: {
        title: 'Timbre tells the brain what arrived | VGP Studio',
        description: 'Timbre tells two sounds at one pitch apart, and listeners hear it in a fraction of a second. How harmonics and attack shape it, and why to pick sounds first.',
        keywords: ['timbre', 'harmonics', 'spectral envelope', 'sound design', 'attack time', 'psychoacoustics'],
    },
};
