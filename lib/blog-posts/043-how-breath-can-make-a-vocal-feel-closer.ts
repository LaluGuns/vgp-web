import { BlogArticle } from '../blog-data';

// Two sung phrases with a gap between them, as level envelopes. The room under the vocal sits at 0.07.
const FLOOR = 0.07;
const PHRASE_1: [number, number][] = [
    [0, FLOOR],
    [0.02, FLOOR],
    [0.04, 0.6],
    [0.08, 0.75],
    [0.11, 0.5],
    [0.14, 0.8],
    [0.19, 0.7],
    [0.22, 0.45],
    [0.25, 0.78],
    [0.31, 0.72],
    [0.34, 0.5],
    [0.37, 0.3],
    [0.4, 0.15],
    [0.43, FLOOR],
];
const PHRASE_2: [number, number][] = [
    [0.61, FLOOR],
    [0.63, 0.22],
    [0.66, 0.7],
    [0.7, 0.85],
    [0.74, 0.55],
    [0.78, 0.8],
    [0.84, 0.75],
    [0.88, 0.5],
    [0.92, 0.3],
    [0.95, 0.14],
    [0.98, FLOOR],
    [1, FLOOR],
];
const breath = (level: number): [number, number][] => [
    [0.49, FLOOR],
    [0.52, level],
    [0.56, level * 1.1],
    [0.59, FLOOR],
];

export const post043: BlogArticle = {
    slug: 'how-breath-can-make-a-vocal-feel-closer',
    title: 'How breath can make a vocal feel closer',
    excerpt: 'Deleting or gating every breath makes a vocal sound pasted together. Keep the breaths, turn them down before compression, and the singer stays in the room.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'A breath tells the listener a person is close and that a line is coming. Deleting it leaves gaps of dead silence between phrases.',
        'Compression shrinks the gap between words and breaths, so a natural breath can come out of the chain sounding like a gasp.',
        'Lower breaths with clip gain before the compressor instead of deleting or gating them.',
    ],
    figures: {
        gaps: {
            type: 'signal',
            caption:
                'Three ways to handle the gap between two phrases, drawn as level shapes. Lowering the breath keeps the line continuous. Deleting it drops the vocal to dead silence, so the room under the voice stops and starts. A gate does the same and also clips the end of the first phrase and the start of the second.',
            alt: 'Three level plots of two phrases with a gap between them. In the first, a small breath sits in the gap and a taller grey outline shows its level before clip gain. In the second, the gap drops to zero. In the third, a threshold line crosses the plot and the phrase ending and the next phrase start are cut off where they fall below it.',
            rows: [
                {
                    label: 'Breath lowered with clip gain',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: [...PHRASE_1, ...breath(0.4), ...PHRASE_2], muted: true, label: 'Raw' },
                        { kind: 'envelope', points: [...PHRASE_1, ...breath(0.18), ...PHRASE_2], label: 'Lowered' },
                    ],
                },
                {
                    label: 'Breath deleted',
                    unipolar: true,
                    traces: [
                        {
                            kind: 'envelope',
                            points: [...PHRASE_1, [0.44, 0], [0.6, 0], ...PHRASE_2],
                        },
                    ],
                },
                {
                    label: 'Gated',
                    unipolar: true,
                    lines: [{ y: 0.26, label: 'Threshold' }],
                    traces: [
                        {
                            kind: 'envelope',
                            points: [[0, 0], [0.039, 0], ...PHRASE_1.slice(2, 12), [0.371, 0], [0.64, 0], [0.641, 0.4], ...PHRASE_2.slice(2, 9), [0.921, 0], [1, 0]],
                        },
                    ],
                },
            ],
        },
        squeeze: {
            type: 'bars',
            min: -40,
            max: 0,
            unit: 'dBFS',
            caption:
                'Words peaking at -10 dBFS and a breath at -30 dBFS through a 4:1 compressor with its threshold at -20 dBFS, then 7.5 dB of makeup gain. The breath sits under the threshold, so it is only lifted: the gap shrinks from 20 dB to 12.5 dB. Cutting the breath by 8 dB first puts it 20.5 dB below the words again.',
            alt: 'Bars from -40 to 0 dBFS. Raw words at -10 and raw breath at -30. After compression the words are at -10 and the breath at -22.5. A breath cut by 8 dB before compression ends at -30.5.',
            bars: [
                { label: 'Words, raw', value: -10, dim: true },
                { label: 'Breath, raw', value: -30, dim: true },
                { label: 'Words, compressed', value: -10 },
                { label: 'Breath, compressed', value: -22.5 },
                { label: 'Breath cut 8 dB first', value: -30.5 },
            ],
        },
    },
    quiz: [
        {
            q: 'Words peak at -10 dBFS and a breath sits at -30 dBFS. A 4:1 compressor at -20 dBFS, with makeup gain that brings the words back to -10, leaves the breath where?',
            options: ['-30 dBFS', '-22.5 dBFS', '-17.5 dBFS', '-10 dBFS'],
            answer: 1,
            why: 'The words are 10 dB over and come out 2.5 dB over, so the compressor removes 7.5 dB. The breath is below the threshold and only gets the 7.5 dB of makeup: -30 + 7.5 = -22.5.',
        },
        {
            q: 'What does a gate on a lead vocal usually cut along with the breaths?',
            options: [
                'The quiet starts and ends of words',
                'The peaks of the loudest chorus notes',
                'The low end below 100 Hz of the voice',
                'Nothing, if the attack is set to 1 ms',
            ],
            answer: 0,
            why: 'A gate only knows level. Soft word endings and gentle onsets sit at breath level, so a threshold that removes the breaths removes them too.',
        },
        {
            q: 'Why does a vocal with every breath deleted often sound pasted together?',
            options: [
                'The reverb tails get cut off with the breaths',
                'The breaths no longer hold the compressor down',
                'The room tone under the voice stops and starts',
                'The lines lose the low end that breaths carry',
            ],
            answer: 2,
            why: 'Every phrase now starts out of dead silence and ends in it. The listener hears the edits, and loses the breath that signals a line is coming.',
        },
    ],
    content: `## Hook: the vocal that sounds too clean

During editing, the temptation is to clean up everything. You run strip silence or put a gate on the lead vocal, and the spaces between phrases go quiet. On playback, the vocal sounds pasted into the song. Each line starts out of nothing and stops dead.

Breaths are part of how a person sings, and part of how a listener hears that a person is singing.

## Why it matters: breath tells the listener someone is there

Breath is quiet. In everyday life you only hear someone breathe when you are close to them. A close vocal mic hears it the same way, so a breath on a record reads as closeness. It also carries timing and intent: a quick sip of air sets up a fast line, a deep inhale warns that a big note is coming.

There is evidence that listeners use these sounds. When Whalen, Hoequist and Sheffert (1995) put a natural breath before synthetic sentences, listeners transcribed and recalled them better. Replacing the breath with rustling leaves, a sound with a similar spectrum, gave no benefit.

Deleting breaths costs more than the breath. Under every vocal there is room tone and a little headphone bleed. When you cut each gap to dead silence, that background stops and starts with every phrase, and on headphones the vocal seems to drop out between lines.

::figure gaps

## Science model: why compression makes breaths loud

The reason producers want breaths gone is often the compressor. A breath that sounds fine in the raw take can come out of the vocal chain sounding like a gasp, because compression shrinks the gap between the loud words and the quiet breath.

Take words peaking at -10 dBFS and a breath at -30 dBFS, 20 dB below. A compressor with its threshold at -20 dBFS and a 4:1 ratio brings the words down to -17.5 dBFS: they were 10 dB over the threshold and come out 2.5 dB over. The breath is under the threshold, so the compressor leaves it alone. Then makeup gain of 7.5 dB brings the words back to -10 dBFS and lifts the breath to -22.5 dBFS. While the breath stays under the threshold, the standard gain computer of a compressor (Giannoulis, Massberg and Reiss, 2012) gives the new gap as:

$$\\Delta_{\\text{after}} = \\Delta_{\\text{before}} - \\left(L_{\\text{word}} - T\\right)\\left(1 - \\frac{1}{R}\\right)$$

Here $\\Delta$ is the gap between word and breath in decibels, $L_{\\text{word}}$ the word peak, $T$ the threshold and $R$ the ratio. With these numbers, 20 dB becomes 12.5 dB. Every compressor or limiter after it on the vocal or the mix bus shrinks the gap again.

::figure squeeze

## DAW experiment: three versions of the same gap

1. Pick a verse with clear breaths between lines and make three copies of the vocal track.
2. Copy A: delete every breath and leave the gaps empty.
3. Copy B: insert a gate with the threshold just above the breath level, attack 1 ms, hold 20 ms and release 80 ms.
4. Copy C: keep the breaths but split each one into its own region, lower it 8 dB with clip gain, and add 5 ms fades at both edges.
5. Put the same compressor on all three: ratio 4:1, threshold set for about 6 dB of reduction on the loudest words, with makeup gain to match.
6. Play each copy in the full mix at the same loudness.

Copy A should sound edited, copy B should clip the soft ends of words, and copy C should sound continuous, with breaths that sit under the words instead of over them.

## Common mistake: the gate, or no editing at all

A gate on a lead vocal saves editing time and costs detail. It only knows level, and the quiet starts and ends of words sit at the same level as the breaths, so it clips them too. Near the threshold it also chatters open and shut on bleed.

The opposite mistake is leaving every breath at its raw level in front of heavy compression, a bus compressor and a limiter. Each stage lifts the breaths a little more, and by the master they compete with the words.

## Producer takeaway: turn breaths down, not off

Edit breaths before the vocal chain. Lower most of them by 6 to 10 dB with clip gain, delete only the ones that are clicks, pops or bleed, and use short fades so nothing starts or stops with a click. Leave a breath at full level when it sets up a big line or lands as part of the rhythm. The singer stays close to the listener, and the compressor stops working against you.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Whalen, D. H., Hoequist, C. E., & Sheffert, S. M. (1995). The effects of breath sounds on the perception of synthetic speech. *Journal of the Acoustical Society of America*, 97(5), 3147-3153.
`,
    seo: {
        title: 'How breath can make a vocal feel closer | VGP Studio',
        description: 'Deleting or gating breaths makes a vocal sound edited. Learn why compression makes breaths loud and how to lower them with clip gain instead.',
        keywords: ['vocal breath editing', 'vocal editing tips', 'noise gate vocals', 'clip gain vocals', 'vocal compression', 'vocal intimacy'],
    },
};
