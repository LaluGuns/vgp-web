import { BlogArticle } from '../blog-data';

// Level envelopes of five verse hits and five chorus hits twice as loud (6 dB), with the
// chorus peaks at the ceiling. The push is 4 dB (x 1.585) into a 50:1 limiter, ceiling 0.86.
const SONG = {
    kind: 'hits' as const,
    at: [0.03, 0.12, 0.21, 0.3, 0.39, 0.53, 0.62, 0.71, 0.8, 0.89],
    amp: [0.37, 0.37, 0.37, 0.37, 0.37, 0.74, 0.74, 0.74, 0.74, 0.74],
    decay: 22,
    outline: true,
};

export const post069: BlogArticle = {
    slug: 'the-final-loudness-push-that-can-cost-emotion',
    title: 'The final loudness push steals emotion',
    excerpt: 'The last few decibels of limiting raise the verse more than the chorus. How the final push closes the lift your song depends on, and where to stop.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'A limiter turns down the loudest material most, so pushing into it raises the verse more than the chorus and shrinks the lift between them.',
        'With normalization on, the pushed master plays back at the same loudness as before, so the listener gets the smaller lift without the extra level.',
        'Push in 1 dB steps at matched level, write down the verse to chorus difference, and stop when it starts to close.',
    ],
    figures: {
        lift: {
            type: 'signal',
            caption:
                'A simulated limiter: hits in a quiet verse and a chorus 6 dB louder, pushed 4 dB into the ceiling. The verse rises the full 4 dB and the chorus about 1 dB, so the step between them shrinks from about 6 dB to about 3 dB of average level.',
            alt: 'Two level plots of ten hits, five quiet then five loud. Before the push the chorus hits are twice as tall as the verse hits and just reach the ceiling. After the push the verse hits are much taller and the chorus hits are flattened at the ceiling, nearly the same height.',
            rows: [
                {
                    label: 'Before the push',
                    unipolar: true,
                    traces: [SONG],
                    lines: [{ y: 0.86, label: 'Ceiling' }],
                    marks: [{ t: 0.5, label: 'Chorus starts' }],
                },
                {
                    label: 'After a 4 dB push into the limiter',
                    unipolar: true,
                    traces: [
                        { ...SONG, muted: true, label: 'Before' },
                        { ...SONG, label: 'After', gain: 1.585, compress: { threshold: 0.5426, ratio: 50, attack: 0, release: 0.06 } },
                    ],
                    lines: [{ y: 0.86, label: 'Ceiling' }],
                    marks: [{ t: 0.5, label: 'Chorus starts' }],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'You push 4 dB more into the master limiter. Which part of the song comes up the most?',
            options: ['The loudest chorus', 'The quieter verse', 'Every section equally', 'The drum transients'],
            answer: 1,
            why: 'Most of the verse sits under the ceiling, so it rises the full 4 dB. The chorus was already near the ceiling, so the limiter holds it back.',
        },
        {
            q: 'With normalization on, what does the listener get from your extra push?',
            options: [
                'More punch in the drums at the same loudness',
                'A louder track than the songs around it',
                'Its lost dynamics restored by the service',
                'The same loudness and a smaller chorus lift',
            ],
            answer: 3,
            why: 'Normalization turns the louder master back down to the same playback level, so only the side effects of the push remain.',
        },
        {
            q: 'In the 1 dB step experiment, what do you hold constant after each step?',
            options: ['The chorus short-term reading', 'The verse short-term reading', 'The integrated loudness reading', 'The limiter\'s gain reduction'],
            answer: 0,
            why: 'Matching the chorus level removes the loudness difference, so the only change you hear, and see on the meter, is the verse catching up.',
        },
    ],
    content: `## Hook: the chorus that stopped lifting

The mix works. The verse holds back, and when the chorus arrives everything rises: the drums open up, the vocal climbs, the song lifts. Then comes the last step. You put a limiter on the master and push for a loud number, and somewhere in the last few decibels the lift disappears. The chorus is barely louder than the verse. It is simply there.

That lift is often the emotional point of the song. The final push is where you are most likely to lose it, because each extra decibel looks small on the meter and sounds better at first, simply because it is louder.

## Why it matters: a limiter turns the loud parts down most

A limiter does the most work on the loudest material. Push its input up 4 dB and the quiet verse comes up the full 4 dB, because most of it stays under the ceiling. The chorus was already at the ceiling, so it comes up much less. The step between them gets smaller.

::figure lift

On a streaming service with normalization on, the louder master is then turned back down to the same playback loudness as before; Spotify's default turns every louder master down to -14 LUFS. The listener gets the smaller lift without the extra level.

::demo normalization

## Science model: micro and macro dynamics

Two kinds of dynamics are at stake. Micro dynamics are the transients inside each bar: the crack of the snare above its body, the consonant at the front of a sung word. Macro dynamics are the level steps between sections: verse to chorus, breakdown to drop.

The final limiter changes both. Short transients cross the ceiling first, so the first decibels of gain reduction mostly shave micro dynamics, and the drums get blunter. Push further and the limiter stays engaged through the whole chorus while the verse passes untouched, which is the loss of macro dynamics in the figure. You can watch it happen on a short-term loudness meter, which averages over 3 seconds: the gap between the verse and chorus readings closes as you push.

The crest factor, peak level minus RMS level in decibels, tracks the first effect. The ceiling holds the peak level where it is while the push raises the RMS level, so the crest factor falls with every extra decibel.

## DAW experiment: find the last good decibel

1. Loop the verse into the chorus. On the master, insert your limiter with a -1 dBTP ceiling, then a gain plugin, then a loudness meter showing short-term LUFS.
2. Set the limiter so it barely touches the chorus peaks. Note the short-term reading at the end of the verse and in the middle of the chorus.
3. Raise the limiter input by 1 dB, then lower the gain plugin until the chorus reading is back where it was.
4. Note the verse reading again and listen to the chorus entrance.
5. Repeat steps 3 and 4 in 1 dB steps, writing down the verse to chorus difference each time.
6. Stop at the first step where the chorus entrance feels smaller, then go back 1 dB. That is your push.

Because the chorus level stays the same, you hear only what the limiter is doing, and the written difference shows the lift closing before your ears get used to it.

## Common mistake: judging the push at its own level

The usual mistake is judging each extra decibel by bypassing the limiter, so the pushed version is always louder in the comparison. Louder tends to sound fuller and more exciting at first, and that impression wins every time unless the levels are matched.

The second mistake is pushing an acoustic or vocal-led song as far as a dense electronic track. Sustained synths and distorted guitars hide limiting. A piano, a voice and the sound of a room expose it. The song decides how far the push can go.

## Producer takeaway: keep the lift

Before the final push, note how far the chorus rises above the verse. Push only in matched-level steps, and stop when that distance starts closing. If the song needs more density, build it earlier in the mix, where you choose what gets denser, instead of asking the last limiter to flatten everything at once. Why the heavier version tends to lose once levels are matched is covered in [loud masters can shrink after matching](/blog/why-loud-masters-can-sound-smaller-after-normalization).

## References

- European Broadcasting Union. (2023). *Tech 3341: Loudness metering: 'EBU Mode' metering to supplement EBU R 128 loudness normalization*. EBU. https://tech.ebu.ch/docs/tech/tech3341.pdf
- Katz, B. (2015). *Mastering Audio: The Art and the Science* (3rd ed.). Focal Press.
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'The final loudness push steals emotion | VGP Studio',
        description: 'Why the last decibels of master limiting raise the verse more than the chorus, and a matched-level method to find where your loudness push should stop.',
        keywords: ['master limiting', 'macro dynamics', 'loudness push', 'crest factor', 'short-term loudness', 'loudness normalization'],
    },
};
