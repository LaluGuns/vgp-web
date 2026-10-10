import { BlogArticle } from '../blog-data';

// Two decaying drum-like hits, drawn as waveforms.
const HITS = { kind: 'hits' as const, at: [0.05, 0.55], amp: [1, 0.9], decay: 7, cycles: 14 };

export const post121: BlogArticle = {
    slug: 'saturation-clipping-limiting-three-flavors-of-loud',
    title: 'Saturation, clipping and limiting: three ways to get loud',
    excerpt: 'All three lower your peaks so you can turn up. A saturator bends the wave, a clipper flattens it and a limiter turns it down, and each one sounds different.',
    category: 'mixing-mastering',
    publishedAt: '2026-05-30',
    updatedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Saturation bends the wave gradually, hard clipping cuts it flat at a ceiling, and limiting turns the whole signal down for a short time.',
        'Saturation and clipping add harmonics and need oversampling; a limiter keeps the wave\'s shape but moves the level around each peak.',
        'Spread the work across small stages and judge each one at matched loudness, because normalization takes the extra level away anyway.',
    ],
    figures: {
        curves: {
            type: 'transfer',
            domain: 'linear',
            caption:
                'Input against output for two ways of holding a signal under a ceiling of 0.5. The hard clipper is perfectly straight until the ceiling, then flat. The soft clipper, a tanh curve, starts bending well below the ceiling and only approaches it.',
            alt: 'A transfer plot from -1 to 1 on both axes. A faint diagonal shows no processing. A solid line follows the diagonal and turns flat at plus and minus 0.5. A dashed curve bends away from the diagonal gradually and levels off towards 0.5.',
            curves: [
                { kind: 'linear', label: 'No processing' },
                { kind: 'hardclip', ceiling: 0.5, label: 'Hard clip' },
                { kind: 'softclip', ceiling: 0.5, label: 'Soft clip (tanh)', dashed: true },
            ],
        },
        time: {
            type: 'signal',
            caption:
                'The same two hits through a hard clipper and through a fast limiter, both set to 0.5. The clipper flattens only the part of each cycle above the ceiling. The limiter keeps the shape of every cycle and turns the whole signal down, then takes time to recover, so the decay after each peak is turned down too.',
            alt: 'Two waveform plots of two decaying hits with the original drawn in grey. In the clipper plot the first cycles are squared off at the dashed ceiling and the decay matches the original. In the limiter plot the cycles keep their rounded shape but the whole hit and its decay sit lower than the original.',
            rows: [
                {
                    label: 'Hard clipper',
                    traces: [
                        { ...HITS, muted: true, label: 'Input' },
                        { ...HITS, clip: 0.5, label: 'Output' },
                    ],
                    lines: [{ y: 0.5, label: 'Ceiling' }],
                },
                {
                    label: 'Limiter',
                    traces: [
                        { ...HITS, muted: true, label: 'Input' },
                        { ...HITS, label: 'Output', compress: { threshold: 0.5, ratio: 50, attack: 0, release: 0.1 } },
                    ],
                    lines: [{ y: 0.5, label: 'Ceiling' }],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A signal sits at 0.25 into a soft clipper and a hard clipper, both with a ceiling of 0.5. Which one changes it?',
            options: ['Only the soft clipper', 'Only the hard clipper', 'Neither of the clippers', 'Both, by the same amount'],
            answer: 0,
            why: 'A hard clipper is perfectly linear below its ceiling. A tanh curve bends from the start: 0.5 × tanh(0.5) is about 0.23, slightly below 0.25.',
        },
        {
            q: 'What does a limiter do that a clipper does not?',
            options: [
                'It adds odd harmonics to every note it touches',
                'It turns down the samples around each peak too',
                'It changes just the samples above the ceiling',
                'It holds every peak under a fixed ceiling',
            ],
            answer: 1,
            why: 'A limiter is a very fast, very high-ratio compressor. It moves the gain of the whole signal, so the shape of the wave survives but the level around the peak changes.',
        },
        {
            q: 'In a 44.1 kHz session, a saturator creates a 5th harmonic at 40 kHz. Where does it land without oversampling?',
            options: ['40 kHz', '18 kHz', '4.1 kHz', '22.05 kHz'],
            answer: 2,
            why: 'It is above the 22.05 kHz Nyquist limit, so it folds back to 44.1 - 40 = 4.1 kHz, right in the range you hear best.',
        },
    ],
    content: `## Hook: three tools, one word

Producers use "saturate it", "clip it" and "limit it" almost as if they meant the same thing. All three make a track louder at the same peak level, and none of them can be undone. They get there by doing different things to the waveform, and if you know which one you are reaching for, you can predict how the result will sound on every system.

## Why it matters: each one bends the wave differently

All three are nonlinear: they change the shape of the wave, where a fader only changes its size. They differ in how and when they act.

**Saturation** runs the signal through a smooth curve. Quiet parts pass almost unchanged, and louder parts are rounded off more and more as they approach the top of the curve. There is no corner anywhere.

**Hard clipping** leaves everything below a ceiling exactly as it was and cuts everything above it flat. The change from untouched to flattened is instant.

**Limiting** is a compressor with a very fast attack and a very high ratio. When the signal crosses the threshold, the limiter turns the whole signal down, then turns it back up over its release time. The wave keeps its shape, but the samples around each peak are turned down along with it.

::figure curves

::demo saturation

Soft clipping sits between the first two. Many clipper plugins have a control that rounds the corner, from fully hard to soft.

## Science model: shape, harmonics and time

The classic saturation curve is the hyperbolic tangent. With a ceiling $A$, as in the figure above:

$$y = A \\tanh\\left( \\frac{x}{A} \\right)$$

For small inputs, $\\tanh$ is almost a straight line, so quiet material passes nearly clean. As the input grows, the output approaches $A$ without ever reaching it. A hard clipper is the limit of that idea:

$$y = \\begin{cases} A & x > A \\\\ x & -A \\le x \\le A \\\\ -A & x < -A \\end{cases}$$

Any curve that bends the waveform creates harmonics at whole-number multiples of each note. A curve that treats the positive and negative halves the same way, like both of these, creates odd harmonics only: 3, 5, 7 times the fundamental. The hard clipper's corner makes those harmonics stronger and reach higher than the smooth curve does. A curve that treats the two halves differently, as some tube stages do, adds even harmonics as well. "Even sounds warm, odd sounds harsh" is a rough guide at best: real circuits produce a mix, and how that mix changes with level is much of what gives each one its character.

A limiter works in time instead. Its gain falls quickly when a peak arrives and recovers over the release, so it changes the level of everything around the peak and adds less harmonic content than a clipper doing the same job.

::figure time

Saturation and clipping share one digital problem. New harmonics can land above the Nyquist limit, half the sample rate, and fold back down as aliasing. At 44.1 kHz, the 3rd harmonic of an 8 kHz tone sits at 24 kHz and folds to about 20 kHz; the 5th, at 40 kHz, folds to about 4 kHz. Oversampling runs the process at a higher internal rate and filters off those harmonics before they can fold. I leave it off while writing and arranging, and turn it on for bounces and critical listening.

## DAW experiment: one loop, three tools

Step 3 needs a hard clipper with oversampling. If your DAW has none, a free one is easy to find.

1. Loop eight bars of a drum bus or a full mix. At the end of the chain, put a gain plugin, then a true-peak meter and a short-term loudness meter. Note the true peak and the loudness.
2. Insert a saturator before the gain plugin, oversampling on. Raise its drive and lower its output until the loop reads 3 LU louder at the same true peak as before.
3. Bypass it. Insert a hard clipper with its ceiling at the original true peak, oversampling on, and raise its input until the loop again reads 3 LU louder.
4. Bypass that. Insert a limiter with its ceiling at the original true peak and raise its input until the loop reads 3 LU louder once more.
5. Turn on each version in turn and use the gain plugin to make the three short-term readings identical. Have someone switch between them without telling you which is which.
6. Listen to the front edge of the snare, the weight of the kick, and the decay after each hit.

Typically the saturator thickens the body and softens the edges, the clipper keeps the decay intact but adds bite to the peaks, and the limiter keeps the tone cleanest while the decay after loud hits dips and recovers.

## Common mistake: one stage doing all the work

The most common mistake is asking the final limiter for all of the loudness. Push a -16 LUFS mix hard enough to read -8 LUFS and the limiter works constantly, grabbing every transient. On Spotify's default setting that master is then turned down 6 dB, to -14 LUFS. A master at -12 LUFS with 2 to 3 dB of limiting is turned down only 2 dB and plays at exactly the same loudness, with its drums intact.

The other mistake is reaching for the wrong tool: a limiter to add warmth to a vocal, or a clipper on a sustained bass line. Saturation is for tone and body, clipping for short peaks, limiting for the final ceiling.

## Producer takeaway: small amounts, in order

Spread the work. I use a clipper on my drum bus more often than a limiter there, because it shaves the tips of the transients without touching the body of the hit. Light saturation on single tracks, a couple of dB of clipping on the drum bus, and a final limiter doing 1 to 3 dB will usually sound fuller than one limiter doing 8. Set the limiter in true-peak mode for the delivery format, judge every stage at matched loudness, and check how the master sounds after normalization, because that is what your listener hears. The [lesson on clipping](/blog/why-clipping-can-be-aesthetic-but-risky) covers when it helps and what it costs.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'Saturation vs clipping vs limiting explained | VGP Studio',
        description: 'How saturation, hard clipping and limiting each lower peaks, what they do to the waveform and its harmonics, and how to stack them without crushing a master.',
        keywords: ['saturation vs clipping', 'clipping vs limiting', 'soft clipping', 'tanh saturation', 'limiter mastering', 'harmonic distortion', 'oversampling', 'loudness normalization'],
    },
};
