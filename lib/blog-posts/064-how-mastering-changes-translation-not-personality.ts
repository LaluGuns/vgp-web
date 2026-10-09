import { BlogArticle } from '../blog-data';

export const post064: BlogArticle = {
    slug: 'how-mastering-changes-translation-not-personality',
    title: 'Mastering should translate the song',
    excerpt: 'Mastering works on the whole stereo file, so it cannot move one instrument. What it can do is make the song hold together on every system it meets.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Mastering acts on the whole stereo file, so a master EQ moves every instrument in its band at once.',
        'A problem you hear on every playback system is a master problem; a problem with one instrument belongs in the mix.',
        'Check balance at more than one listening level, because the ear loses bass sensitivity as level drops.',
    ],
    figures: {
        loop: {
            type: 'flow',
            caption:
                'A translation pass. Problems that show up on every system get a small, broad move on the master. A problem with one instrument goes back to the mix, where you can reach it.',
            alt: 'Four steps: mix, master with broad EQ and gentle dynamics, check on phone, earbuds and car, then fix problems heard everywhere on the master. An arrow labelled back to the mix loops from the last step back to the mix.',
            steps: [
                { label: 'Mix' },
                { label: 'Master', note: 'Broad EQ, gentle dynamics, final level' },
                { label: 'Check on other systems', note: 'Phone, earbuds, car, at two levels' },
                { label: 'Same problem everywhere? Fix it on the master', focus: true },
            ],
            loop: { to: 0, label: 'Back to the mix' },
        },
        eq: {
            type: 'spectrum',
            mode: 'gain',
            db: 6,
            marks: [
                { f: 300, label: '300 Hz' },
                { f: 3000, label: '3 kHz' },
            ],
            caption:
                'A typical mastering move is broad and small: 1 dB less around 300 Hz and a 1 dB high shelf at 8 kHz. Lifting a buried vocal from the master takes a bigger, narrower boost at 3 kHz, and it lifts every guitar, synth and cymbal in that band too.',
            alt: 'EQ gain against frequency. A solid curve dips gently by 1 dB around 300 Hz and rises by 1 dB in the treble. A dashed curve shows a narrow 4 dB peak at 3 kHz.',
            curves: [
                {
                    kind: 'eq',
                    label: 'Mastering move',
                    bands: [
                        { type: 'bell', freq: 300, gain: -1, q: 0.7 },
                        { type: 'highshelf', freq: 8000, gain: 1, q: 0.7 },
                    ],
                },
                { kind: 'eq', label: 'Vocal fix on the master', dashed: true, bands: [{ type: 'bell', freq: 3000, gain: 4, q: 2 }] },
            ],
        },
    },
    quiz: [
        {
            q: 'The vocal is buried. Why is a narrow EQ boost on the master a poor fix?',
            options: [
                'It gets stripped out when the file is encoded',
                'It is undone when streaming services normalize',
                'It shifts the vocal\'s pitch as well as its level',
                'It lifts every other sound in that range too',
            ],
            answer: 3,
            why: 'A master EQ sees one stereo signal. The guitars, synths and cymbals that share the vocal\'s range rise with it, so the arrangement shifts.',
        },
        {
            q: 'You hear the same low-mid mud on a phone, in the car and on earbuds. Where does the fix belong?',
            options: [
                'In a narrow cut on the bass track alone',
                'In a broad 1 dB cut on the master EQ',
                'In a harder limiter setting on the master',
                'In the playback systems, not in the file',
            ],
            answer: 1,
            why: 'A problem that shows up on every system is a whole-song balance problem, and a small, broad master move is the tool for that.',
        },
        {
            q: 'Why check a master at more than one listening level?',
            options: [
                'The loudness meter reads the monitor volume',
                'The limiter works harder at high volume',
                'The ear hears less bass as the level drops',
                'Quiet playback narrows the stereo image',
            ],
            answer: 2,
            why: 'Equal-loudness contours show the ear losing low-frequency sensitivity as level drops. A balance that only works loud sounds thin when it is played at low volume.',
        },
    ],
    content: `## Hook: the master that sounded like the mix

You send a mix to mastering and hope it comes back transformed: the buried vocal forward, the dull snare popping, the kick and bass finally sorted. It comes back sounding like your mix, a little clearer, a little more even, louder. It feels as if nothing happened.

Something did happen, just not what you asked for. Mastering works on the whole stereo file. It can change the overall tone, the dynamics and the level, and it can make the song hold together on systems you never heard it on. It cannot reach inside the mix and move one instrument without moving everything around it.

## Why it matters: every playback system bends the balance

Your song will play on phone speakers, earbuds, car systems, laptops and club rigs, and each one bends the balance its own way. A small speaker cannot reproduce deep bass at any useful level, so you hear the bass line mostly through its upper harmonics. A car cabin tends to exaggerate parts of the low end. Earbuds sealed in the ear canal can sound nothing like the same song on speakers.

No master sounds identical everywhere. What you can do is make sure no single system exposes a problem: a low-mid build-up that turns to mud in the car, a harsh edge around 3 kHz that hurts on a phone, sub energy that eats the limiter's headroom while nobody can hear it. That is what translation means.

::figure loop

## Science model: why small, broad moves travel

Perceived balance depends on playback level. The equal-loudness contours in ISO 226 show that the ear is far less sensitive to low frequencies at low levels than to the midrange, and that the contours flatten as level rises. Turn a song down and the bass seems to fall away; turn it up and the bass seems to grow. A master that is only right at one monitoring level will not translate, so balance gets checked at more than one level.

A master EQ also acts on everything in its band. A 1 dB cut centred on 300 Hz turns down the low-mids of the bass, guitars, keys and vocal together. That is useful for an overall build-up and useless for one instrument. Broad, gentle curves change the tone of the whole song without drawing attention to themselves. A narrow boost large enough to lift one vocal also lifts every other sound in that range.

::figure eq

Dynamics follow the same logic. Gentle compression or limiting on the master evens out the whole song. A multiband compressor can tame one region of the spectrum, but it still cannot tell the vocal from the guitar that shares its frequencies.

## DAW experiment: a translation pass

1. Bounce your mix through your mastering chain as a WAV and copy it to your phone, your car and a pair of earbuds.
2. Listen on each system at a normal volume and write down the first problem you notice, one line per system: muddy, harsh, thin, boomy, vocal too low.
3. Sort the notes. A problem that shows up on every system is a master problem. A problem with one instrument, such as a low vocal or a dull snare, is a mix problem.
4. For master problems, make broad moves of 1 dB or less: a wide bell, Q around 0.7, for a low-mid build-up, or a gentle high shelf for dullness.
5. For mix problems, open the mix session and fix the instrument there, then bounce again.
6. Check the new version on your monitors at a quiet and a moderate level, then on at least two of the other systems.

You should hear the song keep its shape from system to system. If a 1 dB master move is not enough, the fix belongs in the mix.

## Common mistake: mixing on the master bus

The most common mistake is fixing one instrument from the master. A narrow EQ boost or a multiband compressor that brings out a buried vocal also pushes the guitars and synths in its range, and the arrangement shifts in ways you did not choose.

The second is stacking processors because the master feels like the last chance. Several compressors, saturators and limiters, each working a little harder than needed, add up to a dense, tiring master with less depth than the mix had.

## Producer takeaway: send a mix that needs no rescue

Get the balance right in the mix, where you can reach each instrument. Use mastering for what only it can do: small overall tone moves, gentle control of dynamics, the final level, and a file that survives every system it meets. When you catch yourself asking the master to fix one part, go back to the mix.

## References

- International Organization for Standardization. (2023). *ISO 226:2023 Acoustics: Normal equal-loudness-level contours*. ISO.
- Katz, B. (2015). *Mastering Audio: The Art and the Science* (3rd ed.). Focal Press.
`,
    seo: {
        title: 'Mastering should translate the song | VGP Studio',
        description: 'What mastering can and cannot change: why a master EQ moves every instrument in its band, and how to run a translation pass across phone, earbuds and car.',
        keywords: ['mastering translation', 'mastering EQ', 'equal-loudness contours', 'playback systems', 'mix vs master', 'home studio mastering'],
    },
};
