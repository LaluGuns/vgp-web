import { BlogArticle } from '../blog-data';

export const post040: BlogArticle = {
    slug: 'warm-dark-and-dull-are-not-the-same-sound',
    title: 'Warm, dark and dull are different sounds',
    excerpt: 'Warm adds body, dark tilts the top down, dull loses the attack. Treat all three as a low-pass request and you blur the part. Match the move to the word.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Warm means more low-mid body with the top intact, dark means the top tilted down, and dull means the attack has lost its high end.',
        'All three lower the spectral centroid, so all three sound less bright, but each one needs a different move.',
        'Add body before you cut top, use a shelf or dynamic EQ for darkness, and keep low-pass filters for parts that should recede.',
    ],
    figures: {
        moves: {
            type: 'spectrum',
            mode: 'gain',
            marks: [
                { f: 250, label: '250 Hz' },
                { f: 3000, label: '3 kHz' },
            ],
            caption:
                'The three moves from the experiment, computed. Warm adds 3 dB at 250 Hz and takes 1.5 dB off at 10 kHz. Dark is close to 6 dB down from about 8 kHz up. Dull is 13 dB down at 6 kHz and more than 20 dB down at 10 kHz, which removes most of the high end of every attack.',
            alt: 'EQ gain against frequency. A solid curve bumps up 3 dB around 250 Hz and dips slightly at the top. A grey shelf curve falls to minus 6 dB above about 8 kHz. A dashed low-pass curve falls steeply above 3 kHz and leaves the plot below minus 12 dB.',
            curves: [
                { kind: 'eq', bands: [{ type: 'bell', freq: 250, gain: 3, q: 0.8 }, { type: 'highshelf', freq: 8000, gain: -2 }], label: 'Warm' },
                { kind: 'eq', bands: [{ type: 'highshelf', freq: 4000, gain: -6 }], label: 'Dark', muted: true },
                { kind: 'eq', bands: [{ type: 'lowpass', freq: 3000 }], label: 'Dull', dashed: true },
            ],
        },
        centroid: {
            type: 'spectrum',
            mode: 'level',
            range: [100, 5000],
            marks: [
                { f: 496, label: '500 Hz' },
                { f: 1223, label: '1.2 kHz' },
            ],
            caption:
                'The first 20 harmonics of a 220 Hz note with two slopes. The dashed lines mark their spectral centroids, computed: about 1.2 kHz for the slower slope and about 500 Hz for the faster one. A lower centroid sounds less bright, whatever move lowered it.',
            alt: 'Two sets of harmonic lines from 220 Hz to about 4.4 kHz. The grey set falls slowly, the white set falls fast. Dashed vertical lines mark 500 Hz and 1.2 kHz.',
            curves: [
                { kind: 'harmonics', f0: 220, count: 20, rolloff: 1, label: 'Falling as 1/n', muted: true },
                { kind: 'harmonics', f0: 220, count: 20, rolloff: 2, label: 'Falling as 1/n²' },
            ],
        },
    },
    quiz: [
        {
            q: 'A singer asks for a warmer synth. Which move fits the word best?',
            options: [
                'A low-pass filter set to 2 kHz',
                'A 6 dB high-shelf cut at 4 kHz',
                'A 3 dB low-mid boost at 250 Hz',
                'A longer reverb tail on the synth',
            ],
            answer: 2,
            why: 'Warmth is weight in the low mids relative to the top. A low-pass or a high-shelf cut takes the top away instead, which reads as dull or dark rather than warm.',
        },
        {
            q: 'A low-pass filter at 3 kHz makes a pluck sound dull. What has it mainly removed?',
            options: [
                'The low fundamental of each note',
                'Several milliseconds of its attack',
                'The stereo width of the whole part',
                'The high end of each note’s onset',
            ],
            answer: 3,
            why: 'A first-order filter at 3 kHz has a rise time of only about 0.12 ms, far too short to hear. What goes is the high end of the click, which the ear uses to hear a sharp start.',
        },
        {
            q: 'The first 20 harmonics of a 220 Hz note change from falling as 1/n to falling as 1/n². What happens to the spectral centroid?',
            options: [
                'It rises from about 500 Hz to about 1.2 kHz',
                'It falls from about 1.2 kHz to about 500 Hz',
                'It drops to 220 Hz, the note’s fundamental',
                'It stays the same, since the pitch is the same',
            ],
            answer: 1,
            why: 'The centroid is the amplitude-weighted average frequency. A faster fall weights the low harmonics more, so the average moves down from about 1.2 kHz to about 500 Hz.',
        },
    ],
    content: `## Hook: the language barrier in the studio

You are working with a singer on a lead synth. They ask for it warmer. You pull a low-pass filter down to 2 kHz. They frown: now it sounds muddy and dull, and they wanted warm, not dark. You undo the filter and try a midrange boost. Still not it.

Musicians use warm, dark and dull as if they meant the same thing, and producers often hear all three as a request to cut the top. They describe different sounds, and each one needs a different move. Get it wrong and you take away the definition of the part.

## Why it matters: three words, three moves

These are working definitions from the studio, not standard terms, but they map onto real differences in the spectrum and in the attack:

- **Warm**: more weight in the low mids than in the top, with the top still present. The part feels full and close.
- **Dark**: the whole top end tilted down. The tone is softer, but each note still starts cleanly.
- **Dull**: the high-frequency part of each attack is gone, so notes smear into each other and the part seems to sit behind a curtain.

If you make a part dark when it needed warmth, it loses brightness it did not need to lose. If you make it dull, it loses definition, and listeners stop following it.

::figure moves

::demo filter

## Science model: the centroid and the onset

The best-studied of these qualities is brightness. Listeners' brightness ratings follow the spectral centroid, the amplitude-weighted average frequency of a sound (McAdams and colleagues, 1995; Schubert and Wolfe, 2006):

$$f_c = \\frac{\\sum_n f_n \\, A_n}{\\sum_n A_n}$$

For the first 20 harmonics of a 220 Hz saw, with amplitudes falling as $1/n$, the centroid is about 1.2 kHz. Make them fall as $1/n^2$ and it drops to about 500 Hz. All three moves lower the centroid, which is why all three can be described as less bright. The centroid alone cannot tell them apart. Where the change happens can: warmth adds below, darkness takes a little from the whole top, and dullness takes away the part of the spectrum that carries the attack.

::figure centroid

The attack is the key to dull. A sudden onset is a burst of energy across the whole spectrum, and much of what the ear hears as a sharp start sits in the highs. A low-pass filter barely changes the timing of the attack. For a simple first-order low-pass with cutoff $f_{\\text{cut}}$, the time to rise from 10 to 90 percent is $\\tau \\ln 9$, with $\\tau = 1 / (2\\pi f_{\\text{cut}})$:

$$t_r = \\frac{\\ln 9}{2\\pi f_{\\text{cut}}} \\approx \\frac{0.35}{f_{\\text{cut}}}$$

At a 3 kHz cutoff that is about 0.12 ms, far too short to hear as a slower attack. What the filter does remove is the high-frequency content of the click, and without it the note no longer sounds struck. Dullness is a tone problem that you hear as a timing problem.

## DAW experiment: the three-version test

Hear the three words as three different sounds.

1. Load a bright synth lead or an acoustic guitar part and duplicate it twice, so you have three copies of the same part.
2. Dull: on copy one, insert a low-pass filter at 3 kHz, 12 dB per octave.
3. Dark: on copy two, insert a high shelf of -6 dB at 4 kHz. For a version that darkens only the loud notes, use a dynamic EQ band there instead.
4. Warm: on copy three, add a bell of +3 dB at 250 Hz with a Q of 0.8, and a high shelf of -2 dB at 8 kHz.
5. Put a loudness meter on each copy and match all three to the same short-term LUFS, since each move changes the level by a different amount.
6. Loop the part with the drums and switch between the copies, listening to the first moment of each note.

The dull copy smears its note starts and seems to move into another room. The dark copy is softer on top but still starts each note cleanly. The warm copy sounds fuller and closer with its top intact.

## Common mistake: reaching for the low-pass filter

A low-pass filter is the quickest way to make a sound less bright, so it becomes the answer to every request. It removes the top of every note, all the time, attack included. That is the right tool when a part should recede, and the wrong one when it only needs to be less harsh or more full.

If the complaint is harshness, find where it sits, often somewhere between 2 and 5 kHz, and cut a narrow band there, or use a dynamic EQ so the cut only acts on the loud notes. If the request is warmth, add low mids before you take away any top. Some tape plugins also soften the extreme top as you drive them, so check yours on an analyzer before you add a shelf as well.

## Producer takeaway: build body, do not cut detail

Before you reach for a filter, ask which word you are working with. If the part needs body, add low mids and leave the top alone: that is warmth. If it needs less top, tilt the top down with a shelf: that is darkness. If it has gone dull, open the filter or cut whatever is masking its attack. Better words lead to better moves, and better moves keep the part readable.

## References

- McAdams, S., Winsberg, S., Donnadieu, S., De Soete, G., & Krimphoff, J. (1995). Perceptual scaling of synthesized musical timbres: Common dimensions, specificities, and latent subject classes. *Psychological Research*, 58(3), 177-192.
- Schubert, E., & Wolfe, J. (2006). Does timbral brightness scale with frequency and spectral centroid? *Acta Acustica united with Acustica*, 92, 820-825.
`,
    seo: {
        title: 'Warm, dark and dull are different sounds | VGP Studio',
        description: 'What warm, dark and dull mean in the spectrum and in the attack, why a low-pass filter makes parts dull, and which EQ move matches each word.',
        keywords: ['warm dark dull', 'spectral centroid', 'brightness', 'low-pass filter', 'EQ moves', 'sound design'],
    },
};
