import { BlogArticle } from '../blog-data';

// One word that decays into room noise, then the gap after it. Levels are shapes, not measurements.
const NOISE = 0.08;
const decay = (t: number) => 0.8 * Math.exp(-(t - 0.36) / 0.12) + NOISE;
const steps = (from: number, to: number, fn: (t: number) => number): [number, number][] =>
    Array.from({ length: 25 }, (_, i) => {
        const t = from + ((to - from) * i) / 24;
        return [Number(t.toFixed(4)), Number(fn(t).toFixed(4))];
    });
const WORD: [number, number][] = [
    [0, NOISE],
    [0.04, NOISE],
    [0.07, 0.75],
    [0.14, 0.88],
    [0.22, 0.8],
    [0.3, 0.86],
];
const RAW: [number, number][] = [...WORD, ...steps(0.36, 1, decay)];
const GATED: [number, number][] = [...WORD, ...steps(0.36, 0.53, decay), [0.55, 0], [1, 0]];
const CLEANED: [number, number][] = [
    ...WORD,
    ...steps(0.36, 0.7, decay),
    ...steps(0.7, 1, (t) => decay(t) - (NOISE - 0.025) * Math.min(1, (t - 0.7) / 0.12)),
];

export const post048: BlogArticle = {
    slug: 'the-quiet-vocal-detail-that-sounds-expensive',
    title: 'Keep the quiet detail a gate would cut',
    excerpt: 'The fading ends of words and the soft starts of lines sit just above the noise, right where a gate acts. Clean the gaps by hand, then compress.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'The quiet ends of words decay smoothly, so any gate threshold above the noise cuts them off mid-fade.',
        'Compression with makeup gain lifts quiet detail and room noise by the same amount, so clean the gaps before you compress.',
        'Lower gaps with clip gain and long fades, or use an expander with a limited range, instead of a hard gate.',
    ],
    figures: {
        tail: {
            type: 'signal',
            caption:
                'The end of a word fading into room noise, drawn as level shapes. A gate set to silence the gap closes partway down the fade and cuts the rest of the word. Clip gain with a long fade lets the tail finish and then lowers the noise in the gap.',
            alt: 'Two level plots. In the first, a dashed threshold line crosses a word that decays smoothly; the gated version drops to zero partway down the decay. In the second, the decay continues until it meets the noise, and the noise in the gap is then lowered.',
            rows: [
                {
                    label: 'Gate',
                    unipolar: true,
                    lines: [{ y: 0.25, label: 'Threshold' }],
                    traces: [
                        { kind: 'envelope', points: RAW, muted: true, label: 'Before' },
                        { kind: 'envelope', points: GATED, label: 'After' },
                    ],
                },
                {
                    label: 'Clip gain in the gap',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: RAW, muted: true, label: 'Before' },
                        { kind: 'envelope', points: CLEANED, label: 'After' },
                    ],
                },
            ],
        },
        floor: {
            type: 'bars',
            min: -70,
            max: 0,
            unit: 'dBFS',
            caption:
                'Peaks at -10 dBFS, a word tail at -40 and room noise at -60, through a 4:1 compressor with its threshold at -30 dBFS and 15 dB of makeup gain. The tail comes up 15 dB and so does the noise. The gap between them stays 20 dB, but both are now 15 dB closer to the peaks.',
            alt: 'Bars from -70 to 0 dBFS. Raw: peaks -10, word tail -40, room noise -60. Compressed with makeup gain: peaks -10, word tail -25, room noise -45.',
            bars: [
                { label: 'Peaks, raw', value: -10, dim: true },
                { label: 'Word tail, raw', value: -40, dim: true },
                { label: 'Room noise, raw', value: -60, dim: true },
                { label: 'Peaks, compressed', value: -10 },
                { label: 'Word tail, compressed', value: -25 },
                { label: 'Room noise, compressed', value: -45 },
            ],
        },
    },
    quiz: [
        {
            q: 'Peaks at -10 dBFS, room noise at -60. A 4:1 compressor at -30 dBFS with 15 dB of makeup gain. Where does the room noise end up?',
            options: ['-60 dBFS', '-52.5 dBFS', '-45 dBFS', '-30 dBFS'],
            answer: 2,
            why: 'The noise is below the threshold, so the compressor leaves it alone and the makeup gain lifts it 15 dB: -60 + 15 = -45.',
        },
        {
            q: 'Why does a gate cut off the end of a long word?',
            options: [
                'The gate listens to the highs in the tail, and those fade first',
                'The fading tail crosses the threshold before it has finished',
                'The attack is too slow for the gate to reopen during the tail',
                'It turns the tail down by its ratio, like a compressor in reverse',
            ],
            answer: 1,
            why: 'A gate only compares level with its threshold. Any threshold above the noise is crossed by every fading tail before the tail is finished.',
        },
        {
            q: 'What does a downward expander with a 10 dB range do differently from a gate?',
            options: [
                'It lowers sound below the threshold by 10 dB at most, so tails fade',
                'It silences the gaps like a gate, but opens and closes more slowly',
                'It raises quiet parts that sit above the threshold by up to 10 dB',
                'It lowers sound above the threshold by 10 dB and leaves the gaps alone',
            ],
            answer: 0,
            why: 'The range caps how far the level is turned down. The noise drops but never switches off, and a tail crossing the threshold gets quieter faster instead of being cut.',
        },
    ],
    content: `## Hook: clean, quiet and somehow cheaper

You edit a lead vocal until it is spotless. A gate on the channel makes every gap silent. Then the cleaned vocal sounds cheaper than the rough take did.

On vocals that sound expensive, you can hear the end of each word fade into the room, the small sounds of the mouth before a line and the soft way some lines start. Those quiet details are much of what makes a vocal sound close and handled with care, and they are the first thing an aggressive gate removes.

## Why it matters: quiet detail sits where the gate acts

A gate opens when the level rises above its threshold and closes when it falls back below. Room noise and headphone bleed sit at the bottom of a vocal track. The quiet detail sits just above them: the tail of a word as it decays, a soft consonant at the start of a line. To silence the gaps, you set the threshold above the noise, and every tail that decays through that threshold is cut at the moment it crosses, partway through its fade.

Near the threshold the gate also opens and closes on small changes in level. The room noise then appears and disappears with the voice, a pumping you hear most clearly on headphones.

::figure tail

## Science model: compression lifts detail and noise together

The reason producers reach for a gate is usually the compressor that comes next. A compressor leaves everything below its threshold alone (Giannoulis, Massberg and Reiss, 2012), so makeup gain raises all of it by the same amount, quiet detail and noise alike.

Take peaks at -10 dBFS, a word tail at -40 dBFS and room noise at -60 dBFS. A 4:1 compressor with its threshold at -30 dBFS turns the peaks down to -25 dBFS: they were 20 dB over and come out 5 dB over, so the gain reduction is 15 dB. Makeup gain of 15 dB brings the peaks back to -10 dBFS. The tail and the noise were below the threshold, so they only get the makeup gain: the tail rises to -25 dBFS and the noise to -45 dBFS.

So the advice to compress a vocal to bring up its quiet detail is half right. It does bring the detail up relative to the peaks, and it brings the noise in the gaps up by exactly the same amount. Bus compression and limiting later in the chain lift it again. That is why the order matters: clean the gaps first, then compress.

::figure floor

A gentler tool than a gate is a downward expander with a limited range (Reiss and McPherson, 2014). Below its threshold it turns the level down by a ratio, such as 1:2, but never by more than the range you set, such as 10 dB. A tail that crosses the threshold fades faster instead of stopping, and the noise drops without switching off.

## DAW experiment: gate against hand clean-up

1. Solo the lead vocal and find a phrase that ends on a long, decaying word, followed by a gap with audible room noise or bleed.
2. Insert a gate with attack 0.5 ms, hold 10 ms and release 50 ms, and raise the threshold until the gap is silent.
3. Play the end of the phrase and listen for where the tail of the last word is cut.
4. Bypass the gate. Split the region where the tail has faded into the noise, lower the gap by 12 dB with clip gain, and put a 100 ms fade on the edge so the tail fades out instead of stopping.
5. On a copy of the track, try an expander instead: ratio 1:2, range 10 dB, release 150 ms, threshold just above the noise.
6. Put the same compressor after all three versions, with a 4:1 ratio, about 6 dB of reduction on the peaks and matched makeup gain, and compare them in the full mix at a low listening level.

The gated version cuts the tails and the noise pumps in and out. The clip-gain version keeps every tail and leaves the gaps quiet without sounding dead. The expander lands between the two.

## Common mistake: compressing first, cleaning later

The usual order goes wrong in one of two ways. Either the vocal is gated hard and then compressed, and the compressor lifts the chopped edges and the switching noise along with everything else. Or the gaps are never cleaned, and every decibel of makeup gain on the vocal, the bus and the master lifts the room between the lines.

Clean up before the vocal chain, and the compressor has only the performance to work on.

## Producer takeaway: clean first, then compress

Do the clean-up by hand before any compression. Cut clicks and bleed in long gaps, lower the rest of each gap with clip gain, and use fades long enough to let the tails finish. Where a soft word or a quiet ending gets lost in the mix, raise it with clip gain instead of adding more compression. Leave a little room tone in the gaps, so the vocal sounds quieter between lines without sounding switched off.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
`,
    seo: {
        title: 'Keep the quiet vocal detail a gate would cut | VGP Studio',
        description: 'Gates cut the fading ends of words and compression lifts room noise. Learn why the order matters and how to clean vocal gaps by hand before compressing.',
        keywords: ['quiet vocal detail', 'vocal editing tips', 'noise gate vocals', 'downward expander', 'clip gain vocals', 'noise floor'],
    },
};
