import { BlogArticle } from '../blog-data';

export const post127: BlogArticle = {
    slug: 'dynamic-eq-vs-multiband-compression',
    title: 'Dynamic EQ or multiband: match the problem',
    excerpt: 'Both turn part of the spectrum down when it gets loud. They differ in the shape of the cut, what the detector hears and what happens at rest.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Before choosing a processor, find out how wide the problem is and when it happens, then pick the tool whose cut has that shape.',
        'A narrow ring on a few notes suits a dynamic bell, because its detector and its cut can both be as narrow as the ring.',
        'A broad region that swells in loud sections suits a multiband band, but remember that its crossovers shift phase even when nothing is being compressed.',
    ],
    figures: {
        shape: {
            type: 'spectrum',
            mode: 'gain',
            dbRange: [-9, 3],
            caption:
                'Both are set to cut 6 dB. The dynamic bell (Q 4) reaches 6 dB at 3 kHz and is back within 1 dB by 2 and 4 kHz. The multiband band, 2 to 6 kHz between fourth-order Linkwitz-Riley crossovers, reaches only about 4.5 dB at its centre because the crossover slopes overlap, and still takes about 1 dB out at 1.5 and 8 kHz. That curve is drawn with two shelves that follow the crossover maths within about half a decibel.',
            alt: 'Gain over frequency. A solid curve dips sharply to -6 dB at 3 kHz and returns to 0 dB within about half an octave either side. A dotted curve sags gradually from about 1 kHz, bottoms out near -4.5 dB around 3.5 kHz and recovers by about 12 kHz.',
            marks: [{ f: 3000, label: 'Ring' }],
            curves: [
                { kind: 'eq', label: 'Dynamic bell, -6 dB', bands: [{ type: 'bell', freq: 3000, gain: -6, q: 4 }] },
                {
                    kind: 'eq',
                    label: 'Multiband 2-6 kHz, -6 dB',
                    dotted: true,
                    bands: [
                        { type: 'highshelf', freq: 2000, gain: -6 },
                        { type: 'highshelf', freq: 6000, gain: 6 },
                    ],
                },
            ],
        },
        detector: {
            type: 'bars',
            min: -12,
            max: 0,
            unit: 'dB',
            caption:
                'How loud each detector hears a 3 kHz ring and a bright 4 kHz peak of the same level. Through a band-pass at 3 kHz with Q 4, the peak arrives 8.1 dB quieter than the ring. Through the 2 to 6 kHz band, both arrive about 2 dB down, so the multiband cannot tell them apart.',
            alt: 'Four horizontal bars. Dynamic EQ detector: the 3 kHz ring at 0 dB and the 4 kHz peak at -8.1 dB. Multiband band: the 3 kHz ring at -2.1 dB and the 4 kHz peak at -2.1 dB.',
            bars: [
                { label: 'Dynamic EQ, 3 kHz ring', value: 0, display: '0 dB' },
                { label: 'Dynamic EQ, 4 kHz peak', value: -8.1, display: '-8.1 dB' },
                { label: 'Multiband, 3 kHz ring', value: -2.1, display: '-2.1 dB' },
                { label: 'Multiband, 4 kHz peak', value: -2.1, display: '-2.1 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'A vocal rings at 3 kHz on two high notes in the chorus. The rest of the take sounds fine. Which move changes the least?',
            options: [
                'A static 6 dB cut at 3 kHz',
                'A high shelf cut from 2 kHz up',
                'A dynamic bell at 3 kHz with a narrow Q',
                'A multiband band from 2 to 6 kHz',
            ],
            answer: 2,
            why: 'The dynamic bell cuts only near 3 kHz and only while the ring is loud. The static cut and the shelf work all the time, and the band also turns down the healthy presence around the ring.',
        },
        {
            q: 'A 2 to 6 kHz multiband band is turned down 6 dB, but the cut at its centre is only about 4.5 dB. Why?',
            options: [
                'The crossover slopes overlap across a band that narrow',
                'The detector reads RMS level instead of peak level',
                'The soft knee rounds off the deepest part of the cut',
                'The phase shift cancels part of the cut at the centre',
            ],
            answer: 0,
            why: 'Each crossover rolls off gradually, so on a band only about an octave and a half wide, the neighbouring bands still carry part of the centre frequencies at full level.',
        },
        {
            q: 'You set every band of a multiband compressor so none of them compresses, then null it against the dry track. Something is left near each crossover. What is it?',
            options: [
                'Level lost where two bands overlap',
                'Distortion added by the band detectors',
                'Noise added when the bands are summed',
                'Phase shift from the crossover filters',
            ],
            answer: 3,
            why: 'Linkwitz-Riley crossovers sum back to a flat level, but they behave like an all-pass filter, shifting the phase around each crossover frequency.',
        },
    ],
    content: `## Hook: the fix that dulled every chorus

The chorus vocal stings on two notes, the high ones, where a harmonic lands on a ring near 3 kHz. You put a multiband compressor on the vocal, pick the upper-mid band and pull its threshold down until the sting goes. It works on those two notes. Then you notice the rest of the chorus: every loud line has lost a little presence, and the vocal seems to sit further back than it did in the verse.

The multiband did what it was set up to do. Its band was wider than the problem, and its detector could not tell the ring from the healthy brightness around it. A dynamic EQ bell at the same frequency would have cut on those two notes and left most of the chorus alone. A broad problem would have favoured the multiband.

## Why it matters: same idea, different shapes

Both processors turn part of the spectrum down when that part gets loud, so they are easy to treat as one tool with two interfaces. They differ in where they cut, what they listen to, and what they do to the signal while nothing is being cut. Pick the wrong one and you fix the problem while changing a lot of sound that had nothing wrong with it.

A dynamic EQ band is a peaking or shelving filter, the same design a static parametric EQ uses (Zölzer, 2011), with its gain knob turned by a level detector instead of your hand. A multiband compressor splits the signal into bands with crossover filters, gives each band its own compressor, and adds the bands back together.

## Science model: cut shape, detector and crossovers

The cut a dynamic bell makes has the shape of the bell. Its width is set by Q, so it can be as narrow as a single resonance. A multiband band's cut is as wide as the band, and its edges are the crossover slopes. Those slopes are gradual, so on a narrow band they overlap and the band never reaches its full cut.

::figure shape

The detector matters as much as the cut. In many dynamic EQs the detector listens through a band-pass at the band's own frequency and width; here it is drawn as a second-order band-pass at 3 kHz with Q 4. The multiband detector hears everything in its band. Give both a 3 kHz ring and a bright 4 kHz consonant or harmonic at the same level, and the results split.

::figure detector

The dynamic EQ reacts to the ring and mostly ignores the 4 kHz peak. The multiband reacts to both equally, so it turns down the whole band on loud words that never rang, which is how the chorus in the hook lost its presence.

The third difference shows up when nothing is being compressed. Many multiband compressors use Linkwitz-Riley crossovers, which add back to a flat level but behave like an all-pass filter: the phase shifts around each crossover frequency (Linkwitz, 1976). A peaking filter at 0 dB gain is a straight wire, so an idle dynamic bell changes nothing. On one track the crossover phase shift is hard to hear. It matters when the processed track is mixed with an unprocessed copy, the same trap the [lesson on filters](/blog/filters-are-shape-machines) describes. Linear-phase crossovers avoid it, at the cost of latency and some pre-ringing.

Multiband is the better shape when a broad region swells with level, such as the whole 2 to 8 kHz range of a mix getting hard in loud choruses, or the low end of a bass blooming across several notes. Multiband compressors make it easy to give the lows a slower release than the highs. The tools also overlap: many dynamic EQs can draw wide bells and shelves, and many multiband compressors let you place crossovers close together.

The first step is always the same: find the problem by ear and judge how wide it is. Use the sweep below to practise it.

::demo eq-sweep

## DAW experiment: one ring, two tools

You need a dynamic EQ and a multiband compressor. Several DAWs ship only one of the two, so you may need a free plugin for the other.

1. Pick a vocal or acoustic guitar with a harsh spot on a few notes. Loop a phrase that has both harsh and clean notes, with the mix playing.
2. Sweep a bell at +6 dB and Q 5 to find the ring. Note the frequency, and note whether it bites on every note or only on some.
3. Insert a dynamic EQ, put a bell at that frequency with Q 4, and lower the threshold until it cuts 3 to 4 dB on the harsh notes only.
4. On a duplicate track, insert a multiband compressor and set one band from about half an octave below the ring to an octave above it. Lower that band's threshold until the harsh notes get the same reduction.
5. Level-match the two tracks and switch between them on the clean notes. Watch each gain reduction meter while those notes play.
6. Bypass the dynamic EQ on the original track. Set every band of the multiband to zero gain reduction, flip the duplicate's polarity and play the two together. What remains, around the crossover frequencies, is phase shift from the crossover filters. In a linear-phase mode it should almost vanish.

On the harsh notes both versions remove the sting. On the clean notes the multiband keeps working and the presence drops, while the dynamic bell sits at zero.

## Common mistake: choosing by the interface

Reaching for multiband because it looks like the more serious tool is the first mistake, and so is the opposite: stacking five narrow dynamic bells to tame a mix bus that gets harsh across an octave or two. Each bell catches one slice at its own moments, so the tone shifts in a way one broad band would avoid.

The second mistake is setting the threshold on the worst note and never checking the others. A dynamic processor that cuts on every note is a static EQ with a detector attached. Check the meter on the passages that sounded fine. If it moves there, raise the threshold or narrow the detector.

## Producer takeaway: describe the problem first

Before opening either plugin, describe the problem in three parts: how wide it is, when it happens and what should trigger the fix. A narrow ring on certain notes points to a dynamic bell. A broad region that grows with level points to a multiband band. If the trigger is another track, such as a vocal that needs room in the guitars, key the processor from that track, as in the [lesson on sidechain routing](/blog/sidechain-is-more-than-kick-ducking-bass). Whichever tool you choose, the test is the same: check the passages that were already fine and keep the setting only if they still sound the same.

## References

- Linkwitz, S. H. (1976). Active crossover networks for noncoincident drivers. *Journal of the Audio Engineering Society*, 24(1), 2-8.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Dynamic EQ or multiband: match the problem | VGP Studio',
        description: 'Dynamic EQ and multiband compression both cut when a band gets loud. Learn how cut shape, detector and crossovers decide which one fits the problem.',
        keywords: ['dynamic EQ', 'multiband compression', 'vocal resonance', 'Linkwitz-Riley crossover', 'harsh vocal fix', 'mixing'],
    },
};
