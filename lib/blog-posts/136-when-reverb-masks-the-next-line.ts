import { BlogArticle } from '../blog-data';

// Two sung lines as level envelopes on one timeline. Line 1 runs 0.05 to 0.40, line 2 from 0.55 to 0.90.
const DRY: [number, number][] = [
    [0, 0], [0.05, 0], [0.07, 0.9], [0.2, 0.75], [0.3, 0.85], [0.38, 0.7], [0.4, 0],
    [0.55, 0], [0.57, 0.9], [0.7, 0.75], [0.8, 0.85], [0.88, 0.7], [0.9, 0], [1, 0],
];
const LINES = [{ t: 0.05, label: 'Line 1' }, { t: 0.55, label: 'Line 2' }];

export const post136: BlogArticle = {
    slug: 'when-reverb-masks-the-next-line',
    title: 'When reverb masks the next line',
    excerpt: 'A long tail is still sounding when the next words arrive. How to work out how much it has faded, and how ducking and delay throws keep the space without the wash.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'A tail with decay T has only fallen 60 × gap / T dB when the next line starts, so a long reverb on a fast vocal is still loud under the first words.',
        'Duck the reverb return from the dry vocal so it drops whenever the singer sings and blooms in the gaps, which keeps the decay you like without the overlap.',
        'Use a delay throw on the last word of a line when you want space that lands in a chosen spot, and keep full repeats out from under the next line.',
    ],
    figures: {
        duck: {
            type: 'signal',
            caption:
                'A sketch of two sung lines and their reverb. Without ducking, the tail of line 1 is still near its peak when line 2 starts and sits under its first words. Ducked from the dry vocal, the same reverb stays low while the singer sings and rises in the gap.',
            alt: 'Three level plots on one timeline. The top shows two vocal phrases with a gap between them. The middle shows a reverb that builds during line 1 and is still high when line 2 starts. The bottom shows a ducked reverb that stays low during both lines and swells in the gap between them.',
            rows: [
                { label: 'Dry vocal', unipolar: true, marks: LINES, traces: [{ kind: 'envelope', points: DRY }] },
                {
                    label: 'Reverb return',
                    unipolar: true,
                    marks: LINES,
                    traces: [
                        { kind: 'envelope', points: DRY, muted: true },
                        { kind: 'envelope', points: [[0, 0], [0.05, 0], [0.15, 0.4], [0.4, 0.5], [0.55, 0.4], [0.65, 0.52], [0.9, 0.58], [1, 0.45]] },
                    ],
                },
                {
                    label: 'Reverb return, ducked',
                    unipolar: true,
                    marks: LINES,
                    traces: [
                        { kind: 'envelope', points: DRY, muted: true },
                        { kind: 'envelope', points: [[0, 0], [0.05, 0], [0.12, 0.14], [0.4, 0.17], [0.45, 0.45], [0.55, 0.38], [0.58, 0.12], [0.9, 0.17], [0.95, 0.5], [1, 0.42]] },
                    ],
                },
            ],
        },
        fade: {
            type: 'bars',
            caption:
                'How far the tail of line 1 has fallen when line 2 starts 0.4 s later, worked out as 60 × 0.4 / T. A 3 s reverb has fallen only 8 dB. Ducking the return by 8 dB while the singer sings doubles that margin to 16 dB at the start of the new line.',
            alt: 'Horizontal bars on a scale from 0 to 30 dB. A 1 s decay has fallen 24 dB, 2 s has fallen 12 dB and 3 s has fallen 8 dB. A dimmed bar for the 3 s decay with 8 dB of ducking reaches 16 dB.',
            min: 0,
            max: 30,
            unit: 'dB',
            bars: [
                { label: 'Decay 1 s', value: 24, display: '24 dB' },
                { label: 'Decay 2 s', value: 12, display: '12 dB' },
                { label: 'Decay 3 s', value: 8, display: '8 dB' },
                { label: '3 s, ducked 8 dB', value: 16, display: '16 dB', dim: true },
            ],
        },
        throw: {
            type: 'rhythm',
            caption:
                'A delay throw on the last word of a line, with a dotted-eighth delay and the feedback set so each repeat is about 9 dB quieter than the one before. All three repeats land in the gap before the next line starts on the following downbeat. A fourth repeat would already be about 27 dB below the first.',
            alt: 'A one-bar grid of sixteen steps. The vocal row has syllables on steps 1 to 5 and a last word on step 7. The delay row has a repeat on step 10, a smaller one on step 13 and a very small one on step 16.',
            rows: [
                { label: 'Vocal', hits: [0, 1, 2, 3, 4, 6], note: 'Line ends on step 7' },
                { label: 'Delay throw', hits: [{ step: 9, level: 0.7 }, { step: 12, level: 0.25 }, { step: 15, level: 0.09 }], note: 'Last word only' },
            ],
        },
    },
    quiz: [
        {
            q: 'A vocal reverb has a 2.5 s decay. The next line starts 0.5 s after the last word ends. How far has the tail fallen?',
            options: ['About 6 dB', 'About 12 dB', 'About 20 dB', 'About 30 dB'],
            answer: 1,
            why: 'The tail falls 60 dB in 2.5 s, which is 24 dB per second. After 0.5 s it is 60 × 0.5 / 2.5 = 12 dB down, still well within reach of the new words.',
        },
        {
            q: 'You duck a reverb return with a compressor keyed from the dry vocal. Why does the release time matter so much?',
            options: [
                'It sets the decay time of the reverb itself',
                'It changes how bright the reverb tail sounds',
                'It decides how fast the reverb rises in the gap',
                'It sets how much level the dry vocal loses',
            ],
            answer: 2,
            why: 'After the line ends, the compressor lets go at the speed of the release. Too slow and the reverb never swells in the gap, so you lose the space you were trying to keep.',
        },
        {
            q: 'Why keep clear delay repeats of a whole line out from under the next line?',
            options: [
                'Delay repeats always add more low end than reverb',
                'Repeats push the vocal bus into clipping faster',
                'Repeats in time with the beat sound off the grid',
                'It puts the same voice saying other words underneath',
            ],
            answer: 3,
            why: 'In Brungart\'s (2001) tests a competing phrase interfered most with understanding when it came from the same talker. A clear repeat of the last line under the new one is exactly that case.',
        },
    ],
    content: `## Hook: the plate that sounds great in solo

You put a long plate on the lead vocal and solo it. It sounds expensive: every phrase opens into a soft cloud that hangs in the air. Then you bring the band back for the chorus, and the first words of every line are hard to catch. The singer did not get worse. The tail of the line before is still sounding when the next one starts.

## Why it matters: the tail is the same voice in the same band

A reverb tail is mostly the last word, smeared over time. It has much the same spectrum as the voice, so it competes with the next words in exactly the bands they need. In solo nothing else is playing, and the overlap sounds like space. In the mix the tail adds to the guitars and keys that already cover those bands, and the start of the new line is where the old tail is loudest.

::figure duck

Shortening the decay fixes the overlap, and the [lesson on reverb and emotional distance](/blog/why-reverb-can-push-emotion-forward-or-backward) shows how to fit it to the tempo. But a shorter decay also shrinks the bloom in the gaps, which is the part you liked. Ducking the return and replacing part of the reverb with a delay let you keep that bloom and move it to where no one is singing.

## Science model: how much is left when the next line starts

The next words are masked by whatever shares their bands at the same moment, and the louder the masker in a band, the louder a sound must be to stay audible there (Fastl and Zwicker, 2007). So the question is how loud the old tail still is when the new line begins.

A reverb tail falls 60 dB in its decay time $T$. After a gap of $g$ seconds it has fallen:

$$\\Delta L = \\frac{60\\,g}{T} \\;\\text{dB}$$

With 0.4 s between lines, a 1 s reverb has fallen 24 dB, but a 3 s reverb has fallen only 8 dB. If the tail starts 10 dB under the dry vocal and the next line is sung at the same level, the old tail sits only about 18 dB under the new vowels. The consonants that carry the words are shorter and quieter than the vowels, so their margin is smaller still.

::figure fade

A compressor on the reverb return, keyed from the dry vocal, adds its gain reduction to that margin, and it does so only while the singer sings. At the start of the new line the dry vocal triggers the compressor and pulls the old tail down. When the line ends the compressor lets go, and the tail rises in the gap with its full decay. Eight dB of ducking turns the 3 s reverb's 8 dB of fade into 16 dB. The same sidechain idea works on many other pairs, as the [lesson on sidechain beyond kick and bass](/blog/sidechain-is-more-than-kick-ducking-bass) shows.

A delay works differently. It makes discrete copies, and you choose when they land. With a feedback gain $k$, each repeat is $20 \\log_{10} k$ dB relative to the one before (Zölzer, 2011): feedback at 0.35 gives about -9 dB per repeat. The catch is what the copies contain. Brungart (2001) found that a competing phrase interfered most with understanding when it was spoken by the same talker as the target. A clear repeat of the last line under the new line is the same voice saying different words. So a delay is cleanest as a throw: sent only the last word, timed so the repeats fall in the gap.

::figure throw

Play the phrase dry into the long reverb, then duck it, then swap it for the tempo delay. Listen each time to the first word of the next line.

::demo reverb-duck

## DAW experiment: keep the bloom, lose the overlap

1. Loop a chorus with the full band and a lead vocal sent to a long plate or hall, about 2.5 to 3 s, on a return.
2. Put a compressor on the reverb return after the reverb, and key its sidechain from the dry vocal (a pre-fader send works).
3. Start with a ratio of 4:1, the fastest attack it has and a release around 200 ms. Lower the threshold until the return shows 6 to 8 dB of gain reduction while the singer sings.
4. Bypass and enable the compressor while you listen to the first word of each line. Then listen to the gaps and adjust the release until the tail swells just after each line ends.
5. Make a second return with a delay set to a dotted eighth: 60 divided by the BPM, times 0.75. Feedback about 35%, high-pass at 300 Hz and low-pass at 4 kHz.
6. Automate a send to the delay on the last word of two or three lines only. Check that no repeat is still sounding when the next line starts.
7. Bounce the chorus with the original reverb and with the ducked reverb plus throws, and compare them at matched loudness with the band playing.

The ducked version usually sounds as wet in the gaps as the original, while the starts of lines come through. The throws give the ends of lines a reply in the space the singer left.

## Common mistake: judging the tail in solo

Solo makes every tail sound right, because the next line has nothing else to compete with. Judge the decay with the band playing, and listen to the start of the next line rather than the end of the current one.

The other mistake is a ducker that is too slow. A slow attack lets the old tail through for the first syllable before the gain comes down. A slow release keeps the return pinned through the gap, so the reverb seems to vanish and you push the send up to compensate. Watch the gain reduction: it should rise with each line and fall back to zero in the gaps.

## Producer takeaway: treat decay as part of the arrangement

The tail decides what the listener hears between lines and under the start of the next one, so it belongs in the arrangement. Work out how far it has faded by the next line before you decide it is too long. If you like the length, duck it from the dry vocal. If a line ending needs a reply, throw a delay on that word and keep the repeats in the gap.

## References

- Brungart, D. S. (2001). Informational and energetic masking effects in the perception of two simultaneous talkers. *Journal of the Acoustical Society of America*, 109(3), 1101-1109.
- Fastl, H., & Zwicker, E. (2007). *Psychoacoustics: Facts and Models* (3rd ed.). Springer.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'When reverb masks the next line | VGP Studio',
        description: 'A long reverb tail is still sounding when the next line starts. Work out how far it has faded, then duck the return or use delay throws to keep the space.',
        keywords: ['reverb masking', 'ducked reverb', 'vocal reverb clarity', 'delay throw', 'reverb decay time', 'sidechain reverb'],
    },
};
