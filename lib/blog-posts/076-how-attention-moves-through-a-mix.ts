import { BlogArticle } from '../blog-data';

export const post076: BlogArticle = {
    slug: 'how-attention-moves-through-a-mix',
    title: 'Attention moves through a mix like a spotlight',
    excerpt: 'Listeners follow one part of a mix at a time. How the ear sorts sound into streams, why a crowded chorus buries the vocal, and how to hand the spotlight on.',
    category: 'music-psychology',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'The ear sorts a mix into streams, and listeners tend to follow one of them in the foreground while the rest become background.',
        'Parts that share a frequency range at the same time mask each other. Panning helps in stereo, but that help disappears in mono.',
        'Give one part the foreground at a time, cut the backing where the lead needs space, and check the balance at low level and in mono.',
    ],
    figures: {
        handoff: {
            type: 'curve',
            caption:
                'A sketch of a clean handoff. The guitar answers in the gaps between vocal lines, so one part owns the foreground at any moment and the ear always knows where to look.',
            alt: 'Two curves across six moments of a phrase. The solid vocal curve is high on each line and low in each gap. The dashed guitar curve does the opposite and is highest in the final fill.',
            x: ['Line 1', 'Gap', 'Line 2', 'Gap', 'Line 3', 'Fill'],
            yLabel: 'Foreground',
            series: [
                { label: 'Vocal', values: [0.9, 0.2, 0.9, 0.2, 0.9, 0.15] },
                { label: 'Guitar', values: [0.2, 0.75, 0.2, 0.75, 0.2, 0.9], dashed: true },
            ],
        },
        cut: {
            type: 'spectrum',
            mode: 'gain',
            db: 6,
            caption:
                'A broad 2 dB cut at 2.5 kHz with a Q of 0.7, placed on the instrument bus rather than on the vocal. The backing loses a little presence right where the lead voice needs it, and keeps its weight and air.',
            alt: 'An EQ curve from 20 Hz to 20 kHz. It is flat except for a wide, shallow dip of 2 dB centred at 2.5 kHz, inside a shaded band marked vocal presence from 2 to 5 kHz.',
            curves: [{ kind: 'eq', label: 'Instrument bus', bands: [{ type: 'bell', freq: 2500, gain: -2, q: 0.7 }] }],
            bands: [{ from: 2000, to: 5000, label: 'Vocal presence' }],
        },
    },
    quiz: [
        {
            q: 'Huron (1989) asked listeners to count the voices in polyphonic music with similar timbres. What happened?',
            options: [
                'They counted every voice accurately, however many there were',
                'They tended to overcount, hearing more voices than were there',
                'They did well up to three voices and made errors beyond that',
                'They noticed a voice dropping out sooner than one entering',
            ],
            answer: 2,
            why: 'Accuracy dropped once a texture went beyond three voices, and listeners tended to undercount. A dense mix asks for more separate attention than listeners have.',
        },
        {
            q: 'Why can a mix that sounds clear in stereo get muddy in mono?',
            options: [
                'Mono sums both sides, so every track gets louder by the same amount',
                'Panning helps the ear separate parts, and mono removes that cue',
                'Mono doubles the low end, and the extra bass smears the midrange',
                'Mono drops the reverb from the vocal, so it loses its own space',
            ],
            answer: 1,
            why: 'Panning reduces masking because the ear can use location to separate sources. In mono the location cue is gone, so parts that share a frequency range clash again.',
        },
        {
            q: 'The vocal is buried under guitars in the chorus. Which move keeps the vocal level the same and makes it clearer?',
            options: [
                'Boost 2.5 kHz slightly on every chorus track',
                'Widen the vocal with a stereo doubler plugin',
                'Add a long plate reverb to the lead vocal',
                'Cut 2.5 kHz slightly on the instrument bus',
            ],
            answer: 3,
            why: 'A small, broad cut on the backing reduces the overlap with the voice where its presence sits, so the vocal comes forward without its fader moving.',
        },
    ],
    content: `## Hook: the crowded chorus

You mix a dense chorus: lead vocal, two electric guitars, a synth pad and a busy drum groove. You want everything to sound big, so you boost the midrange on every track. Played back, the chorus is a wall. The vocal sinks, the guitars lose their bite and the synth becomes irritating.

The level of each track is not the problem. Every part is asking for attention at the same moment and in the same frequency range. A listener can only follow so much at once, so the mix has to choose what they follow.

## Why it matters: one stream in the foreground

The brain sorts a mixture of sound into separate streams, one per source, a process called auditory scene analysis (Bregman, 1990). Once the streams are sorted, listeners tend to follow one of them in the foreground and let the others sit behind it, switching between them from time to time.

There is a limit to how many parts a listener can keep track of. Huron (1989) asked listeners to count the voices in polyphonic music with similar timbres. They did well up to three voices, made more errors beyond that, and usually undercounted. They also noticed a voice entering more readily than one dropping out. A new entry pulls attention. A part that has been playing for a while slips into the background.

That is why a mix works best as a sequence of handoffs. While the vocal sings, the other parts support it. When the vocal rests, a guitar line or a fill can step forward.

::figure handoff

## Science model: grouping, masking and space

The ear groups sound using several cues. Parts that start together, share harmonic relationships, sit close in pitch or come from the same place tend to fuse into one stream. Parts that differ in timing, pitch range, timbre or location tend to split apart.

Masking is what happens when that sorting fails. When two sounds share a frequency range at the same moment, the louder one hides parts of the quieter one. Boosting the midrange on every track makes this worse, because every part grows in the same place.

Space helps too. Sources that come from different directions are easier to hear apart, so panning a guitar away from the centre reduces how much it masks the vocal. That advantage depends on the two speakers. Fold the mix to mono and every part comes from one point again, and the masking returns.

The most reliable fix is to give the lead a range of its own. A small, broad cut on the backing instruments where the voice carries its presence lets the vocal come forward without raising its fader.

::figure cut

::demo masking

## DAW experiment: the quiet balance test

This takes about ten minutes on the densest section of a mix.

1. Loop the densest chorus of your song.
2. Turn your monitors down until the music is barely louder than a quiet conversation.
3. Listen for which part you hear first, and whether you can follow the words of the lead vocal.
4. If the vocal is buried, insert an EQ on the instrument bus, not on the vocal. Add a bell cut of 2 dB at 2.5 kHz with a Q of 0.7. Bypass it and compare.
5. If the vocal still sinks, make the cut dynamic: use a dynamic EQ band at the same settings with its sidechain fed from the vocal, so it dips by up to 3 dB only while the vocal sings.
6. Play through one verse and chorus and listen for the handoffs. In each vocal gap, one part should step forward. If nothing does, or everything does, change the arrangement there.
7. Switch your monitor controller or master bus to mono and repeat step 3.

At low level the vocal should stay clear without its fader moving. If it sinks again in mono, the separation was coming from panning, and the backing needs more EQ or arrangement space.

## Common mistake: lighting everything at once

The most common mistake is trying to put every part in front. Vocal, guitar, synth and drums all pushed forward produce a tiring wall where nothing leads. Decide which part owns each moment, and let the others play a supporting role.

The second mistake is relying on panning to separate parts. Panning does help in stereo, but many listeners hear music on a single phone speaker or a mono smart speaker. Parts that clash in frequency will clash again there.

## Producer takeaway: hand the spotlight on

Treat attention like a spotlight with one beam. Choose the part that owns each moment, give it a frequency range of its own and let the backing step aside where it needs to. Use the gaps between vocal lines for answers and fills. Check the balance at low level and in mono. If the lead still tells the story there, the mix is doing its job.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Huron, D. (1989). Voice denumerability in polyphonic music of homogeneous timbres. *Music Perception*, 6(4), 361-382.
`,
    seo: {
        title: 'Attention moves through a mix like a spotlight | VGP Studio',
        description: 'How auditory scene analysis and masking decide what a listener hears in a dense mix, and how to give the lead vocal its own space with EQ and arrangement.',
        keywords: ['listener attention', 'auditory scene analysis', 'stream segregation', 'vocal masking', 'mixing tips', 'mono compatibility'],
    },
};
