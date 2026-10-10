import { BlogArticle } from '../blog-data';

export const post118: BlogArticle = {
    slug: 'masking-why-vocals-drown-even-when-fader-goes-up',
    title: 'Turning up a buried vocal rarely fixes it',
    excerpt: 'The fader raises every band of the vocal at once. Whether the words come through depends on the vocal\'s lead over the competition in its own band.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Whether a vocal is clear depends on its lead over the competing parts in its own bands, not on its overall level.',
        'The fader raises every band at once, so it buys clarity at the cost of balance and headroom.',
        'Fix the competition in order: arrangement first, then a cut on the masker, then a dynamic band, and the fader last.',
    ],
    figures: {
        moves: {
            type: 'spectrum',
            mode: 'gain',
            db: 6,
            caption:
                'Two ways to give the vocal 3 dB more lead over the guitar between 2 and 4 kHz, drawn from the real filter maths. The fader lifts the whole vocal by 3 dB. The cut takes 3 dB out of the guitar at 3 kHz and leaves everything else alone.',
            alt: 'Gain over frequency from 20 Hz to 20 kHz, with the 2 to 4 kHz band shaded. A dashed line sits flat at +3 dB across the whole range for the vocal fader. A solid curve is flat at 0 dB except for a 3 dB dip centred on 3 kHz for the guitar EQ.',
            bands: [{ from: 2000, to: 4000, label: 'Where they clash' }],
            curves: [
                { kind: 'slope', dbPerOct: 0, level: 3, label: 'Vocal fader +3 dB', dashed: true },
                { kind: 'eq', label: 'Guitar, -3 dB at 3 kHz', bands: [{ type: 'bell', freq: 3000, gain: -3, q: 1.4 }] },
            ],
        },
        order: {
            type: 'flow',
            caption:
                'The order to try fixes in, from the most natural fix to the last resort. Start with the first step and stop as soon as the words are clear.',
            alt: 'Four steps from top to bottom: change the arrangement, cut the masker where it clashes, add a dynamic band keyed from the vocal, and raise the vocal fader last.',
            steps: [
                { label: 'Change the arrangement', focus: true, note: 'Move, thin or mute the part under the vocal lines' },
                { label: 'Cut the masker where it clashes', note: 'A few dB on the competing part, in the vocal\'s band' },
                { label: 'Add a dynamic band', note: 'Keyed from the vocal, if a static cut leaves the part thin in the gaps' },
                { label: 'Raise the vocal fader', note: 'Last, and only if the vocal is truly too quiet' },
            ],
        },
    },
    quiz: [
        {
            q: 'Between 2 and 4 kHz the vocal sits at -12 dB and the guitar at -10 dB. You cut the guitar by 3 dB there. Where does the vocal now sit in that band?',
            options: ['2 dB under the guitar', '1 dB over the guitar', '3 dB over the guitar', '5 dB over the guitar'],
            answer: 1,
            why: 'The guitar drops from -10 to -13 dB while the vocal stays at -12 dB, so the vocal now leads by 1 dB in that band.',
        },
        {
            q: 'Why does pushing the vocal fader often leave the vocal sounding pasted on top?',
            options: [
                'It adds distortion once the fader passes 0 dB',
                'It delays the vocal slightly against the beat',
                'It narrows the stereo image of the lead vocal',
                'It raises every band, including unmasked ones',
            ],
            answer: 3,
            why: 'The masking was in one region. The fader lifts the whole vocal, so it gains clarity there but also jumps out of the balance everywhere else.',
        },
        {
            q: 'A rhythm guitar masks the vocal in every chorus. Which fix should you try first?',
            options: [
                'Change the guitar part under the vocal lines',
                'Raise the vocal fader until it cuts through',
                'Compress the vocal harder to keep it on top',
                'Boost the vocal\'s presence band around 3 kHz',
            ],
            answer: 0,
            why: 'If the guitar is not playing in the vocal\'s range while the vocal sings, there is no masking to process. Every later step is a workaround for a clash the part itself could avoid.',
        },
    ],
    content: `## Hook: the fader is up and the words are gone

The vocal fader goes to -3 dB, then -1 dB, then the master starts to clip, and the singer still sounds as if she is behind a wall. Solo the vocal and it is clear, present and detailed. Unsolo it and it sinks back into the beat.

Every push makes the vocal louder, but not clearer. The consonants stay buried while the vocal starts to sit on top of the music instead of inside it. The fader is the wrong tool here, because the problem is masking.

## Why it matters: clarity is decided band by band

Masking means one sound makes another harder to hear. The masked sound is still in the file; your hearing just cannot separate it from the louder sound that shares its frequencies at the same moment. That happens band by band. A vocal can be clear in the low mids and buried between 2 and 4 kHz, where a bright guitar plays the same range.

The fader cannot aim. It raises the vocal everywhere: where it was masked, but also where it was already fine. A cut on the competing part can aim at exactly the band where the clash happens.

::figure moves

Hear it on a lead and a pad. The lead's level never changes; only the pad does.

::demo masking

## Science model: the margin in the band

Inside the ear, sound is split into narrow bands, and within each band the louder sound sets how loud a quieter one has to be to remain audible. Raise the masker and that threshold rises with it (Fastl and Zwicker, 2007). What decides whether a vocal detail comes through is therefore its margin over the competition in its own band, not its absolute level.

A worked example makes the trade-off concrete. Say that between 2 and 4 kHz the vocal sits at -12 dB and a distorted guitar at -10 dB, so the vocal is 2 dB under. Raise the vocal fader by 3 dB and it leads by 1 dB in that band, but it is now also 3 dB louder in every other band, and the master has 3 dB less room. Cut the guitar by 3 dB at 3 kHz instead and the vocal leads by the same 1 dB, with its level and the rest of the balance unchanged.

Audible is not the same as understood. Consonants are short and quiet compared with vowels, so they need a margin to come through clearly, not a bare pass. Masking also reaches across time. A loud hit masks quiet sounds that follow it for around a tenth of a second or more, and even sounds up to about 20 ms before it (Fastl and Zwicker, 2007). A dense snare and cymbal pattern can eat the starts and ends of words even where the frequencies overlap only a little.

## DAW experiment: find the masker, then pick the smallest fix

Use the section where the vocal feels most buried, with everything playing.

1. Loop four bars of that section. Keep the vocal fader where it is for the whole test.
2. Mute the other parts one at a time, never solo, and note which mute brings the words forward the most. That part is the main masker.
3. On the masker, sweep a bell at +8 dB with Q 4 between 1 and 5 kHz. Stop where it covers the vocal's consonants the most, then turn it into a 3 dB cut with Q 1.4.
4. Bypass the cut and raise the vocal fader 3 dB instead. Compare the two versions, with the master turned down 3 dB for the fader version so both play at similar loudness.
5. Now try the arrangement: mute the masker only under the sung lines, or move its part an octave away from the vocal.
6. Keep the smallest change that makes every word easy to follow.

The cut and the arrangement change usually bring the words forward with the vocal still sitting inside the track. The fader version is clearer too, but it sounds like a vocal laid over a backing track.

## Common mistake: treating level as clarity

Whenever a part is unclear, you reach for the fader. Level is how loud something is. Clarity is how easy it is to separate from everything around it. A vocal at a modest level in a sparse arrangement can be easier to understand than a much louder vocal in a dense one.

The second mistake is fixing the vocal instead of the masker: stacking presence boosts or compressing it harder. Both make the vocal more aggressive without moving the energy that covers it. For the mechanics of where low-mid mud comes from, see the [lesson on masking and mud](/blog/the-masking-problem-producers-hear-as-mud). A pocket that opens only while the singer sings is a [dynamic EQ keyed from the vocal](/blog/the-mix-decision-that-makes-vocals-feel-expensive).

## Producer takeaway: subtract the competition

When the vocal is buried, ask first whether the vocal is too quiet or whether something else is too loud in the vocal's band. Work through the fixes in order and stop as soon as the words are clear.

::figure order

The same habit works everywhere in a mix. If the kick is buried, check the bass in the kick's low range before you boost the kick. If the snare is lost, check the guitars and keys around the snare's body before you push the snare. Taking a little away from the competition usually does more than adding to the part you want to hear.

## References

- Fastl, H., & Zwicker, E. (2007). *Psychoacoustics: Facts and Models* (3rd ed.). Springer.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'Turning up a buried vocal rarely fixes it | VGP Studio',
        description: 'Frequency masking is decided band by band, and the fader raises them all. How to find the masker, cut it where it clashes, and keep the vocal inside the mix.',
        keywords: ['frequency masking', 'vocal clarity', 'buried vocal', 'EQ carving', 'temporal masking', 'mix clarity'],
    },
};
