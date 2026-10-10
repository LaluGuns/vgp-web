import { BlogArticle } from '../blog-data';

// A sketch of the word "cat": a k burst, the vowel, a short closure, then the t burst.
const CAT: [number, number][] = [
    [0, 0.02],
    [0.05, 0.02],
    [0.055, 0.5],
    [0.075, 0.12],
    [0.1, 0.7],
    [0.16, 0.95],
    [0.3, 0.9],
    [0.45, 0.8],
    [0.52, 0.4],
    [0.56, 0.02],
    [0.62, 0.02],
    [0.625, 0.42],
    [0.65, 0.1],
    [0.69, 0.02],
    [1, 0.02],
];
// The same word after a compressor: the k passes before the attack, the vowel comes down,
// and the t comes back only as far as the gain has recovered.
const squeezed = (t: number): [number, number][] => [
    [0, 0.02],
    [0.05, 0.02],
    [0.055, 0.48],
    [0.075, 0.12],
    [0.1, 0.55],
    [0.16, 0.62],
    [0.3, 0.6],
    [0.45, 0.56],
    [0.52, 0.3],
    [0.56, 0.02],
    [0.62, 0.02],
    [0.625, t],
    [0.65, t * 0.25],
    [0.69, 0.02],
    [1, 0.02],
];

export const post042: BlogArticle = {
    slug: 'the-emotion-hidden-in-consonants',
    title: 'The bite of a vocal lives in its consonants',
    excerpt: 'Consonants are the quietest, shortest parts of a vocal and the parts that tell words apart. A slow release and an over-eager de-esser wear them down first.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Consonants are short and quiet next to vowels, so any process that reacts to small, bright events reacts to them first.',
        'Compression on its own usually lifts consonants against vowels. A slow release and an over-eager de-esser are what pull them down.',
        'Check the de-esser in listen mode: if you hear t, k or ch in it, raise or narrow the band before anything else.',
    ],
    figures: {
        where: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'Where a voice puts its energy, drawn as shapes. Vowels carry most of it, low in the spectrum. The s and sh sounds are much quieter overall but sit high, in the band a de-esser listens to, and a wide de-esser band reaches down into sh as well.',
            alt: 'Energy against frequency. A large hump for vowels sits between about 150 Hz and 2 kHz. A small hump for sh sits around 3 to 4 kHz and a small hump for s around 6 to 8 kHz, inside a shaded sibilance band from 5 to 10 kHz.',
            curves: [
                { kind: 'hump', center: 500, width: 1.1, level: 0.9, label: 'Vowels' },
                { kind: 'hump', center: 3500, width: 0.4, level: 0.3, label: 'sh', dashed: true },
                { kind: 'hump', center: 7000, width: 0.4, level: 0.36, label: 's' },
            ],
            bands: [{ from: 5000, to: 10000, label: 'Sibilance' }],
        },
        release: {
            type: 'signal',
            caption:
                'A sketch of the word "cat" through a compressor. With a slow release the gain is still down when the final t arrives, so the word loses its ending. With a fast release the gain is back in time and the t keeps its edge.',
            alt: 'Three level plots of the word "cat": a short k burst, a long vowel, a gap, then a short t burst. In the slow-release plot the vowel is lower and the final t is much smaller. In the fast-release plot the vowel is lower but the t is nearly as tall as before.',
            rows: [
                { label: 'As sung', unipolar: true, traces: [{ kind: 'envelope', points: CAT }], marks: [{ t: 0.055, label: 'k' }, { t: 0.625, label: 't' }] },
                {
                    label: 'Slow release',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: CAT, muted: true, label: 'Before' },
                        { kind: 'envelope', points: squeezed(0.14), label: 'After' },
                    ],
                },
                {
                    label: 'Fast release',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: CAT, muted: true, label: 'Before' },
                        { kind: 'envelope', points: squeezed(0.4), label: 'After' },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'Compression on its own usually does what to quiet consonants relative to the vowels around them?',
            options: [
                'Lowers them, because compressors react to high frequencies',
                'Leaves them as they were, since makeup gain lifts both equally',
                'Lowers them, because short bursts trip the detector first',
                'Raises them, because the loud vowels are turned down more',
            ],
            answer: 3,
            why: 'A compressor turns down what crosses the threshold, and vowels are the loud part. Quiet consonants below the threshold keep their level, so after makeup gain they sit higher relative to the vowels.',
        },
        {
            q: 'A compressor with a long release sits on a vocal. Which consonants does it most often turn down?',
            options: [
                'The s and sh sounds, which carry the most energy up high',
                'Consonants that end a word straight after a loud vowel',
                'The first consonant of a phrase, after a pause in the line',
                'Plosives at the start of words, which hit the threshold hard',
            ],
            answer: 1,
            why: 'The loud vowel pulls the gain down. If the release has not recovered by the time the final consonant arrives, the consonant is turned down with it.',
        },
        {
            q: "In listen mode your de-esser lets through t, k and ch as well as s. What should you change first?",
            options: [
                'Raise the detection band or narrow it',
                'Lower the threshold so it acts more firmly',
                'Add a high-shelf boost after the de-esser',
                'Switch it from split-band to wideband',
            ],
            answer: 0,
            why: 'Listen mode plays what the de-esser reacts to. If other consonants are in it, the band is too low or too wide, so it will dull them along with the s sounds.',
        },
    ],
    content: `## Hook: in tune, smooth and somehow absent

A vocal can be in tune and smooth and still sound as if the singer is somewhere else. The usual reach is for an exciter or more saturation. Often the problem sits earlier in the chain: the consonants have been worn down.

The click of a k, the tick of a t, the pop of a p and the hiss of an s give a line its edges. Smooth them away and the words melt into the vowels. The vocal is clean, and it has lost its bite.

## Why it matters: consonants are small and easy to lose

Vowels carry most of the energy in a voice. Consonants are short and quiet by comparison. A plosive such as p, t or k is a brief closure followed by a burst. A fricative such as s or sh is a stream of noise, much of it high in the spectrum. Anything in the chain that reacts to short, quiet or bright events reacts to consonants first.

You hear the cost on earbuds in a noisy room, where the quietest parts of a voice drop under the noise before anything else does. You also hear it when you try to rescue a dull vocal with a broad top boost. The s sounds already sit high and strong in their band, so they rise first, and the vocal turns harsh before the words get any clearer.

::figure where

## Science model: what consonants carry, and what removes them

Consonants carry much of the information that tells words apart: cat, cap and cab differ only in their last sound. In running speech, vowels matter more than that suggests. When researchers replaced either the vowels or the consonants of sentences with noise, listeners understood the vowel-only sentences about twice as well (Kewley-Port, Burkle and Lee, 2007). So the honest version of the idea is narrower. Vowels hold the flow and much of the sense, consonants give the words their edges, and consonants are the part that processing removes first.

Speech research measures the balance as the consonant-to-vowel ratio: the level of a consonant relative to the vowel beside it, in decibels.

$$\\text{CVR} = L_{\\text{consonant}} - L_{\\text{vowel}}$$

When people speak clearly on purpose, this ratio goes up, because they make the consonants relatively stronger (Picheny, Durlach and Braida, 1986). A singer who leans into consonants is doing the same thing, and it reads as deliberate delivery.

Compression on its own usually raises the ratio, because it turns the loud vowels down more than the quiet consonants. A slow release lowers it: if the gain is still down from a loud vowel when a word-final consonant arrives, that consonant is turned down too. So does the de-esser. It is built to turn down short bursts of high-frequency energy, and t, k, ch and sh sit in or near the same range as s. With the threshold too low or the band too wide, it catches all of them, and the singer starts to sound as if they have a lisp.

::figure release

## DAW experiment: hear what the de-esser takes

You need a de-esser. Not every DAW ships one; a free plugin is fine for this test.

1. Loop a fast, wordy section of the lead vocal with the full mix playing.
2. Switch your de-esser to its listen or delta mode, if it has one, so you hear only what it removes.
3. If you hear t, k, ch or sh in that signal, raise the detection frequency, narrow the band, or switch from wideband to split-band. Most voices put their s energy somewhere between 5 and 10 kHz.
4. Raise the threshold until it only acts on the loudest s sounds, with about 3 to 6 dB of reduction on those and none on anything else.
5. Turn listen mode off and compare the de-esser active and bypassed at matched level.
6. On the vocal compressor, shorten the release in steps, for example from 300 ms to 150 ms to 80 ms, and listen to the ends of words.

The words should now end cleanly while the s sounds stay smooth. If the shortest release makes the vocal pump, settle between the last two settings.

## Common mistake: one de-esser setting for the whole song

A vocal's level changes from verse to chorus. Set the de-esser threshold for the quiet verse and it clamps the loud chorus, catching consonants that were fine. Set it for the chorus and the verse slips through. Lower the few worst s sounds with clip gain before the chain, or automate the threshold, so the de-esser can stay gentle everywhere.

The second mistake comes after over-de-essing: trying to restore the lost bite with a broad high boost. That brings the s sounds back first, and you end up de-essing again.

## Producer takeaway: protect the consonants first

Treat consonants as the part of the vocal that every process can damage. Clip gain the harshest s sounds down by 3 to 6 dB, keep the de-esser narrow and high, and set the compressor's release so the gain recovers before a word's last consonant. If you want a denser vocal, compress a parallel copy hard and blend it under the main one, so the main vocal keeps its consonants. Judge the result in the full mix at a normal level, and once on a phone speaker.

## References

- Kewley-Port, D., Burkle, T. Z., & Lee, J. H. (2007). Contribution of consonant versus vowel information to sentence intelligibility for young normal-hearing and elderly hearing-impaired listeners. *Journal of the Acoustical Society of America*, 122(4), 2365-2375.
- Picheny, M. A., Durlach, N. I., & Braida, L. D. (1986). Speaking clearly for the hard of hearing. II: Acoustic characteristics of clear and conversational speech. *Journal of Speech and Hearing Research*, 29(4), 434-446.
`,
    seo: {
        title: 'The bite of a vocal lives in its consonants | VGP Studio',
        description: 'Consonants give a vocal its edges and are the first thing processing removes. Learn how release times and de-essers wear them down, and how to keep them.',
        keywords: ['vocal consonants', 'de-essing', 'consonant-vowel ratio', 'speech intelligibility', 'mixing vocals', 'compressor release'],
    },
};
