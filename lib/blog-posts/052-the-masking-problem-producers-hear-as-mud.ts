import { BlogArticle } from '../blog-data';

export const post052: BlogArticle = {
    slug: 'the-masking-problem-producers-hear-as-mud',
    title: 'Mud is often masking, not dirt',
    excerpt: 'Mud is rarely one bad track. It is several parts piling up in the low mids and hiding each other. Find the pile-up and thin the parts that do not need it.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Mud is usually several parts each adding a little low-mid energy, which together mask everything near them.',
        'The ear sorts sound into bands only about 57 Hz wide near 300 Hz, and a loud low band also hides frequencies above it.',
        'Clear mud on the supporting parts with small, staggered cuts and high-pass filters instead of pushing the vocal.',
    ],
    figures: {
        pileup: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'Where the energy of five common parts sits. Each one is modest on its own, but the guitar, keys and pad all peak between 200 and 500 Hz, and that overlap is what you hear as mud.',
            alt: 'Energy over frequency for bass, guitar, keys, pad and vocal. The guitar, keys and pad humps overlap heavily in a shaded band from 200 to 500 Hz, with the bass just below and the vocal centred higher, around 1.2 kHz.',
            bands: [{ from: 200, to: 500, label: 'Low mids' }],
            curves: [
                { kind: 'hump', center: 100, width: 0.7, level: 0.6, label: 'Bass', muted: true },
                { kind: 'hump', center: 260, width: 0.8, level: 0.55, label: 'Guitar' },
                { kind: 'hump', center: 340, width: 0.9, level: 0.5, label: 'Keys' },
                { kind: 'hump', center: 420, width: 1, level: 0.5, label: 'Pad' },
                { kind: 'hump', center: 1200, width: 1.3, level: 0.65, label: 'Vocal', dashed: true },
            ],
        },
        cuts: {
            type: 'spectrum',
            mode: 'gain',
            caption:
                'Two cleanup EQs drawn from the real filter maths. The guitar keeps its body at 300 Hz but loses 3 dB there, the pad gives up 4 dB a little higher at 450 Hz, and both lose the rumble they never needed. The vocal is not touched.',
            alt: 'EQ curves from 20 Hz to 20 kHz. The guitar curve rolls off below 100 Hz and dips 3 dB at 300 Hz. The dashed pad curve rolls off below 150 Hz and dips 4 dB at 450 Hz. Both are flat above 1 kHz, where a marker shows the vocal centre.',
            marks: [{ f: 1200, label: 'Vocal centre' }],
            curves: [
                {
                    kind: 'eq',
                    label: 'Guitar',
                    bands: [
                        { type: 'highpass', freq: 100, q: 0.707 },
                        { type: 'bell', freq: 300, gain: -3, q: 1.4 },
                    ],
                },
                {
                    kind: 'eq',
                    label: 'Pad',
                    dashed: true,
                    bands: [
                        { type: 'highpass', freq: 150, q: 0.707 },
                        { type: 'bell', freq: 450, gain: -4, q: 1.4 },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'Every part sounds clean in solo, but the full mix is muddy. What is the most likely cause?',
            options: [
                'One of the tracks was recorded badly',
                'The vocal lacks presence around 3 kHz',
                'Their low mids add up in the same bands',
                'The kick and bass share the same low end',
            ],
            answer: 2,
            why: 'Mud is a sum. Each part adds a little energy in the same low-mid bands, and together they mask the detail of everything near them.',
        },
        {
            q: 'Why can a heavy pile-up around 250 Hz blur a vocal’s detail higher up?',
            options: [
                'The ear’s bands are wider up high, so the pile-up reaches them',
                'Masking spreads upward from a loud band into higher ones',
                'Low notes ring longer, so they smear the vocal’s consonants',
                'The pile-up phase-cancels the upper harmonics of the voice',
            ],
            answer: 1,
            why: 'A masker hides sounds above its own frequency much more than sounds below it, and the spread grows as the masker gets louder.',
        },
        {
            q: 'Near 300 Hz the auditory filter is about 57 Hz wide. A guitar peaks at 280 Hz and keys at 320 Hz. What follows?',
            options: [
                'They share one auditory band and compete for it',
                'They are 40 Hz apart, so each gets its own band',
                'The louder one cancels the quieter one by phase',
                'They sum to 6 dB more, like two copies of a signal',
            ],
            answer: 0,
            why: 'The two peaks are 40 Hz apart, less than one filter width. The ear cannot fully separate them, so the stronger one masks the weaker.',
        },
    ],
    content: `## Hook: the buried vocal

Your lead vocal sounds muffled in the hook. You open an EQ and boost 3 kHz, or you push the fader up 3 dB. The vocal pokes through, but now it sounds harsh and sits on top of the track, and the mix still feels thick and cloudy.

The vocal was rarely the problem. It may be a great recording. What you are hearing is the arrangement around it: guitars, keys and a pad that each put a little energy in the same range. That is not dirt or a bad recording. It is masking, and it builds up out of parts that each sound fine on their own.

## Why it matters: mud is a sum

Solo any one of those parts and it sounds clean. The guitar has body, the keys have warmth, the pad fills the space. The trouble starts when they play together. Most melodic parts carry a lot of their energy between about 200 and 500 Hz, so three or four of them in the same section stack up there.

::figure pileup

The stack does not sound like "too much 300 Hz" while you work on single tracks. It sounds like the vocal lost its words, the bass lost its shape and the whole mix got cloudy. So you reach for the vocal, the part that is suffering, instead of the parts that are causing it.

## Science model: auditory bands and upward spread

The inner ear analyses sound with a bank of overlapping filters. Each one responds to a narrow range of frequencies, and two sounds that land in the same filter compete for it. Glasberg and Moore (1990) give the width of one of these filters, its equivalent rectangular bandwidth, as:

$$\\text{ERB} = 24.7 \\left( \\frac{4.37 f}{1000} + 1 \\right)$$

with $f$ in hertz. At 300 Hz that is about 57 Hz. A guitar peaking at 280 Hz and keys at 320 Hz sit inside one filter, and the ear cannot fully pull them apart. Within a band, the louder sound sets the masked threshold: the quieter one has to rise with it to stay audible (Fastl and Zwicker, 2007).

Masking also spreads, and unevenly. A loud sound hides frequencies above its own much more than frequencies below, and the spread widens as the masker gets louder (Wegel and Lane, 1924). A dense low-mid pile-up therefore veils more than the low mids. It blurs the lower part of the vocal and the attack of the bass notes too.

Hear the same principle in the demo below. The lead never changes level; only the pad around it does.

::demo masking

## DAW experiment: find the pile-up and thin it

Use the densest section of the song, with every part playing.

1. Loop the busiest eight bars and set your monitors to a moderate level you can hold.
2. On the first supporting part, a guitar or keys, insert an EQ with a bell at +8 dB and Q 4. Sweep it slowly between 150 and 600 Hz with the full mix playing.
3. Stop where the boost makes the mix boom or cloud over the most. Turn that boost into a 3 dB cut and widen the Q to about 1.4.
4. Repeat on the next part, a pad or a second guitar. Pick a cut point at least a few semitones away from the first one, so each part keeps its body somewhere.
5. On each part that does not carry the bass line, look for rumble or room noise below its lowest played note. Where you find some, add a high-pass just under that note, not at a fixed number; [set it from the lowest note](/blog/stop-high-passing-everything-by-default) so the part keeps its body.
6. Bypass all these EQs at once and compare at matched loudness.

With the cuts in, the vocal words and the bass notes come forward although neither fader moved. Bypass them and the cloud returns.

## Common mistake: fixing the victim

The common reflex is to fix the vocal: boost its presence or compress it hard. Compression keeps its level steady but does not move the competing energy, so a squashed vocal sitting over a thick pad still sounds pasted on top of the music. Presence boosts make it harsher without clearing the cloud underneath.

The opposite mistake is high-passing every backing track at 300 Hz. The mud disappears, and so does the warmth. Small, staggered cuts keep each part full in its own place, which a blanket high-pass cannot do.

::figure cuts

## Producer takeaway: subtract before you add

When something is buried, look first for the parts that cover it, and take a little out of each where they overlap. A few decibels on three tracks clears more than six decibels on the one you want to hear.

Check the result in mono as well. Panning separates parts in stereo and hides some masking; in mono that help is gone, so it is the stricter test. If the vocal and bass still read clearly in mono, the low mids are under control.

## References

- Fastl, H., & Zwicker, E. (2007). *Psychoacoustics: Facts and Models* (3rd ed.). Springer.
- Glasberg, B. R., & Moore, B. C. J. (1990). Derivation of auditory filter shapes from notched-noise data. *Hearing Research*, 47(1-2), 103-138.
- Wegel, R. L., & Lane, C. E. (1924). The auditory masking of one pure tone by another and its probable relation to the dynamics of the inner ear. *Physical Review*, 23, 266-285.
`,
    seo: {
        title: 'Mud is often masking, not dirt | VGP Studio',
        description: 'Mud is several parts piling up in the low mids and masking each other. How auditory bands and upward spread of masking work, and how to thin the pile-up.',
        keywords: ['frequency masking', 'mixing mud', 'low mids', 'critical band', 'upward spread of masking', 'eq techniques'],
    },
};
