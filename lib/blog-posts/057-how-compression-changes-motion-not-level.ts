import { BlogArticle } from '../blog-data';

// Two hits across a 520 ms window: a hit decays in about 200 ms.
const HITS = { kind: 'hits' as const, at: [0.04, 0.54], amp: [1, 0.85], decay: 8, outline: true };

export const post057: BlogArticle = {
    slug: 'how-compression-changes-motion-not-level',
    title: 'Compression changes motion before level',
    excerpt: 'Compression changes how a sound moves in time as well as how loud it is. Learn to set attack and release so a track breathes with the groove.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Attack decides whether the first crack of a hit gets through. Release decides how fast the body comes back up.',
        'Set release so gain reduction is back at zero just before the next hit, and the track breathes with the tempo.',
        'Judge at matched level. Louder sounds better at first, so makeup gain alone can fool you.',
    ],
    figures: {
        attack: {
            type: 'signal',
            caption:
                'Two drum hits through the same 6:1 compressor, drawn from a simulation. A 1 ms attack clamps the hit almost at once, leaving only a thin spike of the peak. A slow attack lets the peak through and turns down only the body, which is why it sounds punchier.',
            alt: 'Three level plots of two drum hits. The first is uncompressed. The second, with a 1 ms attack, has its peaks flattened near the threshold. The third, with a 30 ms attack, keeps a sharp peak before the level drops.',
            rows: [
                { label: 'No compression', unipolar: true, traces: [HITS], lines: [{ y: 0.3, label: 'Threshold' }] },
                {
                    label: 'Fast attack (1 ms)',
                    unipolar: true,
                    traces: [
                        { ...HITS, muted: true, label: 'Before' },
                        { ...HITS, label: 'After', compress: { threshold: 0.3, ratio: 6, attack: 0.002, release: 0.12 } },
                    ],
                    lines: [{ y: 0.3, label: 'Threshold' }],
                },
                {
                    label: 'Slow attack (30 ms)',
                    unipolar: true,
                    traces: [
                        { ...HITS, muted: true, label: 'Before' },
                        { ...HITS, label: 'After', compress: { threshold: 0.3, ratio: 6, attack: 0.058, release: 0.12 } },
                    ],
                    lines: [{ y: 0.3, label: 'Threshold' }],
                },
            ],
        },
        curve: {
            type: 'transfer',
            domain: 'db',
            caption: 'Above the threshold, a 4:1 ratio lets 1 dB out for every 4 dB in. A peak at -12 dB comes out at -21 dB: 9 dB of gain reduction.',
            alt: 'Input level against output level. Below the -24 dB threshold all lines follow one to one. Above it the 2:1 line rises at half the slope and the 4:1 line at a quarter.',
            curves: [
                { kind: 'linear', label: 'No compression' },
                { kind: 'compressor', threshold: -24, ratio: 2, label: '2:1', dashed: true },
                { kind: 'compressor', threshold: -24, ratio: 4, label: '4:1' },
            ],
        },
        release: {
            type: 'signal',
            caption:
                'Four hits through an 8:1 compressor. When the release recovers between hits, each hit starts from full level. When it is too slow, the compressor is still clamped as the next hit arrives, so every hit after the first is held down and the groove flattens.',
            alt: 'Two level plots of four hits. In the first, each compressed hit rises to a similar peak. In the second, after the first hit every following hit is held down.',
            rows: [
                {
                    label: 'Release recovers before the next hit',
                    unipolar: true,
                    lines: [{ y: 0.25, label: 'Threshold' }],
                    traces: [
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.8, 1, 0.8], decay: 14, outline: true, muted: true },
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.8, 1, 0.8], decay: 14, outline: true, compress: { threshold: 0.25, ratio: 8, attack: 0.02, release: 0.04 } },
                    ],
                },
                {
                    label: 'Release too slow',
                    unipolar: true,
                    lines: [{ y: 0.25, label: 'Threshold' }],
                    traces: [
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.8, 1, 0.8], decay: 14, outline: true, muted: true },
                        { kind: 'hits', at: [0.03, 0.28, 0.53, 0.78], amp: [1, 0.8, 1, 0.8], decay: 14, outline: true, compress: { threshold: 0.25, ratio: 8, attack: 0.02, release: 2.5 } },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'With a very fast attack, what happens to a snare hit?',
            options: [
                'The crack passes and only the tail is turned down',
                'The snare gets louder because the peaks are lifted',
                'The tail is held down until the next hit arrives',
                'The crack is clamped, so the hit sits further back',
            ],
            answer: 3,
            why: 'A fast attack reacts before the transient is over, so the loudest, sharpest part of the hit is turned down first.',
        },
        {
            q: 'Threshold -24 dB, ratio 4:1. A peak arrives at -12 dB. How much gain reduction?',
            options: ['3 dB', '6 dB', '9 dB', '12 dB'],
            answer: 2,
            why: 'The peak is 12 dB over. At 4:1 it comes out 3 dB over, so the compressor removes 12 × (1 - 1/4) = 9 dB.',
        },
        {
            q: 'Why compare compressed and bypassed at the same loudness?',
            options: [
                'Because the gain reduction meter is often inaccurate',
                'Because louder sounds better and can hide a bad setting',
                'Because streaming services normalize every upload',
                'Because compression shifts the pitch of sustained notes',
            ],
            answer: 1,
            why: 'Loudness bias is strong. Matching levels is the only way to hear whether the movement of the sound got better.',
        },
    ],
    content: `## Hook: the static level misconception

You put a compressor on a bass or a vocal, watch the gain reduction meter dance and think the job is done. You assume a compressor is a level regulator that keeps the quiet parts up and the loud parts down. Then you play the full mix and the part feels stiff. It sits in the middle of the speakers and refuses to lock in with the drums.

That happens when compression is treated as a volume tool instead of a motion tool. A compressor changes the envelope of a sound: how sharp its start is and how fast its tail falls away. Change those, and you change how the sound moves through time, which changes the groove of the whole track.

## Why it matters: compression reshapes the envelope

Every note has a level envelope: a sharp start, the transient, then a body that decays. A compressor reacts to that level with the attack and release times you set.

With a fast attack, the compressor reacts almost at once and clamps the transient. The hit loses punch and seems to sit further back in the mix. With a slow attack, the transient gets through before the compressor engages, so the hit keeps its snap and seems closer. The release sets how quickly the compressor lets go afterwards, which decides how loud the decaying body is and how the track breathes.

::figure attack

::demo compressor

## Science model: the gain computer and its time constants

A digital compressor has two parts. The gain computer compares the input level with the threshold and decides how much to turn down. A smoothing stage then moves the gain reduction toward that target at the speed set by attack and release (Giannoulis, Massberg and Reiss, 2012). Above the threshold, with a hard knee, the target is:

$$GR(t) = \\left( L_{\\text{in}}(t) - T \\right) \\times \\left( 1 - \\frac{1}{R} \\right)$$

Here $L_{\\text{in}}$ is the input level in decibels, $T$ the threshold and $R$ the ratio. While the target is rising, the gain reduction follows it with the attack time constant $\\tau_a$. While it is falling, it recovers with the release time constant $\\tau_r$. Changing those two constants changes the balance between the transient and the body of a sound, and that balance is most of what you hear as punch.

::figure curve

## DAW experiment: tune compression to the groove

Shape the movement of a part by lining up the compressor's timing with the tempo.

1. Pick a drum room track or a bass track and insert a compressor.
2. Set a high ratio, around 6:1, and pull the threshold down until you see 6 to 8 dB of gain reduction. Exaggerating makes the changes easy to hear.
3. Turn the attack to its fastest setting. The snare loses its crack and the bass notes sound soft.
4. Slowly lengthen the attack. Stop when the snare snaps again or the bass has a clear pluck.
5. Turn the release to its slowest setting. The compressor stays clamped and the track goes flat and lifeless.
6. Slowly shorten the release while watching the meter. Stop when gain reduction returns to zero just before the next kick or snare.

You should now hear the room tail rise in the gaps between hits, a pumping motion that breathes in time with the song.

## Common mistake: default attack and release

A common error is leaving the compressor on its default settings or relying on auto release. Auto release can work well on full mixes, where the material is complex. On a single drum or bass track it rarely matches the rhythm, and a release that does not match the tempo fights the performance.

::figure release

The other mistake is judging with makeup gain on. The compressed version is louder, and louder almost always sounds better at first. Bypass the compressor at matched level to hear whether the movement of the sound improved.

## Producer takeaway: set it with the rhythm section playing

Think of compression as a way to place a part in time. A slow release keeps a vocal steady. A faster release lets the breaths come up between phrases, which adds urgency and closeness.

Set your compressors with the rhythm section playing, not in solo. The attack should respect the kick and snare transients, and the release should move with the hi-hats. If the part moves with the beat, keep the setting. If the groove feels stiff, raise the threshold or shorten the release.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'Compression changes motion before level | VGP Studio',
        description: 'Compression changes how a sound moves in time. Learn how to set attack and release times to shape transients and lock a part to the groove.',
        keywords: ['compression motion', 'dynamic range control', 'transient envelope', 'attack and release', 'mixing groove', 'audio compression'],
    },
};
