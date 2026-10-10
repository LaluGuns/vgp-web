import { BlogArticle } from '../blog-data';

// Two kick-like hits drawn as level envelopes. The limited version runs through a
// 20:1 limiter with instant attack, then makeup gain brings its peak back to 1.
const HIT = { kind: 'hits' as const, at: [0.05, 0.55], amp: [1, 1], decay: 9, outline: true };

export const post066: BlogArticle = {
    slug: 'the-difference-between-impact-and-level',
    title: 'Impact is not the same as level',
    excerpt: 'A chorus can be loud and still not land. Impact comes from distance: hits above their body and sections above each other, which limiting closes.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Impact is a change in level: a transient jumping out of its body, a chorus rising out of a verse.',
        'Limiting with makeup gain takes nearly a decibel of peak to average ratio for every decibel of gain reduction on the peaks.',
        'Judge every loudness move at matched level, because both the meter and your first impression favour the flatter version.',
    ],
    figures: {
        hit: {
            type: 'signal',
            caption:
                'Two hits from a simulation, one through a fast limiter with makeup gain back to the same peak. The limited hit is flat on top and its body sits higher, so it carries about 4.5 dB more energy and reads louder, while its front edge no longer stands out from the body.',
            alt: 'Two level plots of two drum hits. The dynamic hits spike up and decay smoothly. The limited hits rise to the same height but form a flat plateau before decaying, drawn over the dynamic outline in grey.',
            rows: [
                { label: 'Dynamic hits', unipolar: true, traces: [HIT] },
                {
                    label: 'Limited, then turned up to the same peak',
                    unipolar: true,
                    traces: [
                        { ...HIT, muted: true, label: 'Dynamic' },
                        { ...HIT, label: 'Limited', gain: 3.171, compress: { threshold: 0.3, ratio: 20, attack: 0, release: 0.01 } },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'You limit the peaks by 4 dB and add 4 dB of makeup gain. What happens to the peak to average ratio?',
            options: ['It falls by about 4 dB', 'It rises by about 4 dB', 'It stays about the same', 'It falls by about 8 dB'],
            answer: 0,
            why: 'The peaks end up where they were, but the body of the sound, which holds most of the energy, comes up nearly the full 4 dB.',
        },
        {
            q: 'Why does a chorus land harder when the verse before it is quieter?',
            options: [
                'A quiet verse makes the chorus limiter work harder',
                'Impact comes from the step up in level and density',
                'Normalization lifts the chorus when the verse is quiet',
                'A quiet verse frees true-peak headroom for the chorus',
            ],
            answer: 1,
            why: 'The ear responds to change. A steady level fades into the background, so the size of the step is what makes the chorus feel big.',
        },
        {
            q: 'A heavily limited version wins your quick A/B. What should you check first?',
            options: [
                'Whether its true peak stays under 0 dBTP',
                'Whether both files share one sample rate',
                'Whether it played louder than the other',
                'Whether its LUFS reading hits your target',
            ],
            answer: 2,
            why: 'A louder version tends to sound better in a quick comparison. Match the levels, then listen again.',
        },
    ],
    content: `## Hook: the drop that did not land

You want the chorus to hit. You push the mix into the limiter, raise the master fader, and the meters climb. When the chorus arrives it is loud, and it does not land. The verse was already almost as loud, the kick has turned into a thud, and the moment you built toward barely registers.

Level and impact are different things. Level is how much energy a meter averages. Impact is change: how far a hit jumps out of the sound around it, and how far a section rises above the one before.

## Why it matters: the ear listens for change

Hearing is tuned to change. A sudden rise in level grabs attention, while a steady level, however high, fades into the background as you get used to it. A song uses that at two scales.

At the scale of one hit, a kick or snare has a short, sharp transient followed by a lower body. The transient holds a tiny share of the energy, but it is how you feel the strike. A limiter that takes the top off it so you can raise the rest leaves a hit that is louder on the meter and flatter to the ear.

::figure hit

At the scale of the arrangement, a chorus hits because it is louder and denser than the verse. Squash the verse up to nearly the same level and the chorus has nowhere to go.

::demo loudness-bias

## Science model: peak to average ratio

The distance between the transients and the average is the crest factor, also called the peak to average ratio, as in the [lesson on loud masters after normalization](/blog/why-loud-masters-can-sound-smaller-after-normalization):

$$\\text{PAR} = 20 \\log_{10}\\left( \\frac{V_{\\text{peak}}}{V_{\\text{RMS}}} \\right)$$

A pure sine has a PAR of about 3 dB. A square wave, the shape heavy clipping pushes toward, has 0 dB, because its peak and its RMS level are the same. Drum recordings sit well above the sine. Limit the peaks by a few decibels, add the same amount of makeup gain, and the peaks land where they were while the body, which holds most of the energy, rises almost the full amount. The PAR falls by close to the gain reduction.

That is why level-based thinking misleads you. Loudness meters average over 400 ms or longer and barely register a short transient, so they reward a change that removes the part of the sound that carries impact. The comparison is biased too: in a quick A/B, the louder version tends to sound better, even when it is the flatter one.

## DAW experiment: the matched-level hit test

1. Loop two bars of a drum bus, or of a mix with a clear kick and snare. Put a short-term loudness meter and a true-peak meter at the end of the chain.
2. Bounce the loop and import it twice, on two tracks. Note the short-term reading and the true peak of the first track.
3. On the second track, insert a limiter with its ceiling at the loop's true peak, followed by a gain plugin. Raise the limiter input until the snare hits show about 6 dB of gain reduction.
4. Lower the gain plugin until the second track's short-term reading matches the first.
5. Compare the true-peak readings. At the same loudness, the limited track now peaks several decibels lower.
6. Have someone switch between the tracks without telling you which is which, and listen to the front edge of the kick and snare and to the space between hits.

At matched loudness the unlimited loop usually sounds like it hits harder: its transients stand further out, while the limited one has a softer front edge and a fuller gap between hits. The same test across a verse and chorus, for the lift between sections, is in the [lesson on the final loudness push](/blog/the-final-loudness-push-that-can-cost-emotion).

## Common mistake: making every part as loud as possible

The usual mistake is pushing every section to its maximum. When the verse is as loud as the chorus, the song loses its shape, and constant loudness gets tiring. Listeners turn it down.

The second mistake is a limiter or bus compressor release that is too slow for the tempo. If the gain reduction has not recovered when the next hit arrives, that hit is turned down before it starts, and the groove flattens. Watch the gain reduction meter: it should fall back between hits.

## Producer takeaway: protect distances, not level

Build impact out of distances: transients above the body, chorus above verse. Use the limiter to catch what pokes out, not to close those gaps. Judge every loudness change at matched level, because the meter and your first impression both prefer the flatter version.

## References

- European Broadcasting Union. (2023). *Tech 3341: Loudness metering: 'EBU Mode' metering to supplement EBU R 128 loudness normalization*. EBU. https://tech.ebu.ch/docs/tech/tech3341.pdf
- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Katz, B. (2015). *Mastering Audio: The Art and the Science* (3rd ed.). Focal Press.
`,
    seo: {
        title: 'Impact is not the same as level | VGP Studio',
        description: 'Why a loud chorus can still fail to land: impact comes from transient and section contrast, and limiting with makeup gain closes both gaps.',
        keywords: ['impact vs loudness', 'crest factor', 'peak to average ratio', 'dynamic contrast', 'limiting', 'loudness bias'],
    },
};
