import { BlogArticle } from '../blog-data';

// Drum-like hits. The loud master is the same signal pushed about 9.5 dB into a hard clip,
// then turned down to the same average power (gain 3 x 0.453, ceiling 0.95 x 0.453).
const HITS = { kind: 'hits' as const, at: [0.02, 0.27, 0.52, 0.77], amp: [0.95, 0.8, 0.95, 0.8], decay: 9, cycles: 30 };

export const post065: BlogArticle = {
    slug: 'why-loud-masters-can-sound-smaller-after-normalization',
    title: 'Loud masters can shrink after matching',
    excerpt: 'Normalization plays a crushed master and a dynamic one at the same loudness. Then the only difference left is how far the drums rise above the mix.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Normalization turns each master down by its own amount until both play at the same loudness, so the level you won with the limiter is cancelled.',
        'A plain gain change keeps the distance from peak to loudness, so the dynamic master keeps its taller drum hits at playback.',
        'Compare limiter settings at matched loudness, because the louder version wins every unmatched comparison.',
    ],
    figures: {
        matched: {
            type: 'signal',
            caption:
                'Two masters at the same average power, which is roughly what normalization matches. The loud one was pushed about 9.5 dB into a hard clip and turned down. Its peaks now sit about 6 dB below the dynamic master\'s: a crest factor near 4 dB against 10 dB.',
            alt: 'Two waveforms of four drum hits. The dynamic master has tall, sharp peaks. The loud master, at the same average power, has flat-topped hits whose peaks reach only about half the height.',
            rows: [
                { label: 'Dynamic master', traces: [HITS], lines: [{ y: 0.882, label: 'Peak' }] },
                {
                    label: 'Loud master at the same average power',
                    traces: [{ ...HITS, gain: 1.359, clip: 0.43 }],
                    lines: [{ y: 0.43, label: 'Peak' }],
                },
            ],
        },
        peaks: {
            type: 'scale',
            caption:
                'Master A at -6 LUFS and master B at -11 LUFS, both peaking at -1 dBTP, after normalization to -14 LUFS. A plain gain change keeps each distance from peak to loudness, so B\'s peaks rise 5 dB higher above the same average.',
            alt: 'A number line from -16 to 0 dB. Both masters play at -14. Master A peaks at -9 and master B at -4. Two bars show distances of 5 dB and 10 dB above -14.',
            min: -16,
            max: 0,
            unit: 'dB',
            ticks: [-16, -12, -8, -4, 0],
            markers: [
                { value: -14, label: 'Both play at -14 LUFS', strong: true },
                { value: -9, label: 'A peaks' },
                { value: -4, label: 'B peaks' },
            ],
            ranges: [
                { from: -14, to: -9, label: 'A: 5 dB' },
                { from: -14, to: -4, label: 'B: 10 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'Masters at -6 and -11 LUFS are normalized to -14 LUFS. How far is each turned down?',
            options: ['Both by 8 dB', '8 dB and 3 dB', '3 dB and 8 dB', 'Both by 3 dB'],
            answer: 1,
            why: 'Normalization moves each track to the target: -14 - (-6) = -8 dB and -14 - (-11) = -3 dB.',
        },
        {
            q: 'Both masters peak at -1 dBTP. After normalization to -14 LUFS, where do the loud master\'s peaks sit?',
            options: ['-1 dBTP', '-4 dBTP', '-9 dBTP', '-14 dBTP'],
            answer: 2,
            why: 'Its peaks were 5 dB above its -6 LUFS loudness. A plain gain change keeps that distance, so at -14 LUFS they reach -9 dBTP.',
        },
        {
            q: 'Why does the dynamic master often sound bigger once both are normalized?',
            options: [
                'Normalization adds compression to quiet tracks',
                'It is played back louder than the limited one',
                'Services add bass to tracks with more dynamics',
                'Its transients rise further above the average',
            ],
            answer: 3,
            why: 'At matched loudness the only difference left is the shape. Taller peaks over the same average read as punch and size.',
        },
    ],
    content: `## Hook: the loudest track in the playlist that wasn't

You push the master until it reads -6 LUFS. In the session it hits hard. On a streaming service, next to a song mastered around -11 LUFS, yours sounds smaller: the kick has less weight, the snare less crack, and the other song seems to jump out of the speakers.

Nothing went wrong in the upload. Both songs were turned down to the same loudness, and at the same loudness the one with more room above its average sounds bigger.

## Why it matters: normalization cancels the only advantage

On Spotify's default setting, both masters are turned down until they measure -14 LUFS: yours by 8 dB, the other by 3 dB. The level race you won in the session is cancelled. What remains is what you paid for it: flatter transients and less distance between the hits and the space around them.

Apple says the same about its Sound Check: songs mastered loud are played back at a lower volume, and Apple warns that this can make them sound weaker (Apple, 2021).

::figure matched

::demo normalization

## Science model: the distance from peak to average

The number that matters here is how far the peaks rise above the average. For a waveform it is the crest factor:

$$C = 20 \\log_{10}\\left( \\frac{x_{\\text{peak}}}{x_{\\text{RMS}}} \\right)$$

A pure sine has a crest factor of 3 dB, because its peak is $\\sqrt{2}$ times its RMS level. A drum recording has far more. A limiter or clipper lowers the peaks so you can raise everything else, and the crest factor drops. For a whole master the same idea is measured as the peak to loudness ratio: true peak minus integrated loudness.

Take two masters that both peak at -1 dBTP. Master A measures -6 LUFS, so its peaks sit 5 dB above its loudness. Master B measures -11 LUFS, so its peaks sit 10 dB above. Normalization moves every sample of a track by one fixed gain, which keeps those distances. At -14 LUFS, A's peaks reach -9 dBTP and B's reach -4 dBTP. B's loudest hits rise 5 dB further above the same average than A's, and that distance is much of what you hear as size and punch.

::figure peaks

## DAW experiment: match first, then judge

1. Make two masters of the same mix with a -1 dBTP true-peak ceiling: one pushed to about -6 LUFS integrated, and one with gentle limiting at about -11 LUFS.
2. Import both into a new session on two tracks, each with a gain plugin followed by a loudness meter.
3. Set the gain plugins to -8 dB on the loud master and -3 dB on the dynamic one. Both should now read about -14 LUFS.
4. Have someone switch between the two during the loudest chorus without telling you which is playing.
5. Listen to the kick and snare first, then the vocal, then how far the chorus lifts out of the verse.
6. Check the true-peak readings after the gain plugins. They should sit near -9 and -4 dBTP.

At matched loudness the dynamic master often sounds bigger: the drums stand further out and the chorus lifts more. If the loud one still wins, its density is doing musical work and you can keep some of it.

## Common mistake: comparing at different levels

Judging limiter settings without matching levels is the main trap. A version that is even 1 dB louder often sounds better in a quick comparison when nothing else has changed, so heavier limiting keeps winning in the session and losing on the platform.

The other mistake is blaming normalization. It adds nothing and removes nothing except level. If a master sounds small after normalization, it sounded just as small in the session at the same level; you were simply listening louder.

## Producer takeaway: spend the distance carefully

Compare limiter settings at matched loudness every time. Push further only while the song gains density you want, and stop when the drums start to shrink. On a normalized service, the distance between your peaks and your average is what survives. The rules behind the turn-down are in the [lesson on streaming loudness myths](/blog/the-streaming-loudness-myth-that-refuses-to-die).

## References

- Apple. (2021). *Apple Digital Masters* [Technology brief]. https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'Loud masters can shrink after matching | VGP Studio',
        description: 'Why a heavily limited master sounds smaller once streaming normalization matches loudness, explained with crest factor and peak to loudness ratio.',
        keywords: ['loudness normalization', 'crest factor', 'peak to loudness ratio', 'limiting', 'mastering loudness', 'loudness war'],
    },
};
