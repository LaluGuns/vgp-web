import { BlogArticle } from '../blog-data';

export const post077: BlogArticle = {
    slug: 'why-a-hook-must-be-predictable-and-unstable',
    title: 'A hook needs a familiar shape and one odd turn',
    excerpt: 'Catchy melodies tend to follow a common shape with something unusual inside it. How repetition builds a hook, when it wears out, and how one chord change renews it.',
    category: 'music-psychology',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Tunes that get stuck in people\'s heads tend to have a common overall contour, with less usual rises and falls between its high and low points.',
        'Repetition makes a hook easy to predict and sing, but close listening to the same thing over and over eventually lowers liking.',
        'Repeat the melody exactly and change the harmony under its last note, so the familiar line ends somewhere new.',
    ],
    figures: {
        cadence: {
            type: 'curve',
            caption:
                'The same four-bar melody over two harmonizations. The first pass resolves from V to I and the tension drains. The second moves from V to vi, a deceptive cadence: the melody ends on the same note, but the harmony stays open.',
            alt: 'A tension curve over eight bars labelled with chords I, IV, V, I, I, IV, V, vi. Tension rises to V in bar 3, falls to its lowest at I in bar 4, rises again to V in bar 7 and only drops part of the way at vi in bar 8. A dashed marker between bars 4 and 5 marks the second pass.',
            x: ['I', 'IV', 'V', 'I', 'I', 'IV', 'V', 'vi'],
            yLabel: 'Harmonic tension',
            series: [{ values: [0.2, 0.45, 0.82, 0.12, 0.2, 0.45, 0.82, 0.55] }],
            marks: [{ at: 3.5, label: 'Second pass' }],
        },
        exposure: {
            type: 'curve',
            caption:
                'The shape Szpunar, Schellenberg and Pliner (2004) reported for their most realistic music. Heard in the background, liking kept rising with exposure. Heard with full attention, it rose and then fell. A sketch of the shape, not their data.',
            alt: 'Two curves across four levels of exposure. The solid focused-listening curve rises, peaks after a few plays and falls. The dashed background-listening curve keeps rising.',
            x: ['First play', 'A few plays', 'Many plays', 'Very many'],
            xShort: ['First', 'A few', 'Many', 'Lots'],
            yLabel: 'Liking',
            series: [
                { label: 'Focused listening', values: [0.35, 0.78, 0.6, 0.4] },
                { label: 'In the background', values: [0.3, 0.48, 0.62, 0.74], dashed: true },
            ],
        },
    },
    quiz: [
        {
            q: 'People forget your hook after one play. Which rewrite brings it closer to the earworms Jakubowski and colleagues (2017) analysed?',
            options: [
                'Keep its rise-then-fall shape and make one climb steeper than expected',
                'Swap to an unusual zigzag shape built only from small, common steps',
                'Flatten it to hover near one pitch so it is easy to sing back',
                'Slow it down so each note has more time to sink in',
            ],
            answer: 0,
            why: 'Earworm tunes tended to follow a common overall contour, often a rise then a fall, with less usual slopes between the turning points. They were also faster on average, so slowing the line down moves it away from that profile.',
        },
        {
            q: 'A melody ends on C in C major. Which change under that last note keeps the note and leaves the phrase open?',
            options: [
                'Replace the C major chord with G major',
                'Replace the C major chord with A minor',
                'Transpose the whole phrase up a tone',
                'Double the melody an octave up',
            ],
            answer: 1,
            why: 'A minor (A, C, E) contains C, so the melody still fits. Moving from G to A minor instead of to C is a deceptive cadence: the ear expected home and got somewhere close to it.',
        },
        {
            q: 'After a week of looping your chorus with full attention you are sick of it, while the client, who mostly heard it under their video edit, likes it more each time. What explains the split?',
            options: [
                'Liking always keeps rising, so your verdict is just tired ears',
                'A strong hook keeps gaining for everyone, so the chorus is weak',
                'Focused listening rises then falls, while background play keeps rising',
                'Background play cannot change liking, so the client has other taste',
            ],
            answer: 2,
            why: 'Szpunar, Schellenberg and Pliner found that with full attention liking rose over the first few plays and then fell, while music heard in the background kept gaining. You and the client have been in those two conditions.',
        },
    ],
    content: `## Hook: the loop that wears out by bar sixteen

You write a hook and repeat the same four-bar vocal phrase over the same chords four times in a row. You expect the repetition to make it stick. You play it for a friend, and by the third pass they have stopped listening. The hook is easy to remember, and it already sounds used up.

Nearly every hook repeats. This one wears out because nothing about the repeat changes, so after the second pass the listener has nothing left to predict.

## Why it matters: a familiar shape with something odd inside

Jakubowski and colleagues (2017) compared 100 songs people often reported getting stuck in their heads with 100 matched songs that were never named. The earworms tended to have a more common overall contour, often a rise followed by a fall, and less common slopes between its high and low points: how steeply the line climbs or falls from one turning point to the next. They were also faster on average. A catchy line seems to combine a shape the ear already knows with one detail it does not expect.

Repetition then does its own work. Margulis (2014) argues that repetition changes how music is heard: on each pass, attention moves to different details, and the listener starts to anticipate the line well enough to sing along. That is part of what makes a chorus feel like it belongs to the listener.

::figure exposure

There is a limit. Szpunar, Schellenberg and Pliner (2004) played music to listeners many times. When they heard it in the background, liking kept rising with exposure. When they listened with full attention, liking rose over the first few plays and then fell. A hook that never changes is heard closely, again and again, by exactly the people you want to keep.

## Science model: repeat the line, move the ground

The simplest way to renew a repeated melody is to keep it exactly the same and change what sits under it. The melody stays predictable, and the harmony gives the listener something new to hear it against.

The deceptive cadence is the classic version. After a dominant chord (V), the ear expects the home chord (I). Moving to the minor chord on the sixth degree (vi) instead keeps the music close to home, because vi shares two notes with I, while denying the full resolution. Huron (2006) uses the deceptive cadence as an example of an expectation the ear holds on every hearing, even when the listener knows the song.

In C major, the melody can end on a C over C major the first time and on the same C over A minor the second time. A minor contains C, so the note still fits, but the phrase no longer sounds finished.

::figure cadence

## DAW experiment: same melody, new last chord

Use a piano or synth patch and a MIDI editor.

1. Set the tempo to 100 BPM in C major. Program four bars of chords: C, F, G, C.
2. Write a simple four-bar melody over them that ends on a long C in bar 4. Keep it mostly stepwise, with one leap of a fifth or a sixth in bar 2.
3. Copy the chords and melody to bars 5 to 8 without changing a single melody note.
4. In bar 8, replace the C major chord with A minor and move the bass note from C to A.
5. Loop all eight bars four times. Then try F major in bar 8 instead of A minor.
6. Rewrite the leap in bar 2 as steps only, and loop again.

The A minor ending should make the second pass pull forward into whatever comes next, while the melody stays exactly as the listener learned it. Without the leap in bar 2, listen for whether the line loses the one turn that set it apart.

## Common mistake: copy and paste as the arrangement

The most common mistake is pasting the same chorus block four times with nothing changed. Each pass is a perfect copy of the last, and an attentive listener hears it as a loop rather than a chorus. Change the harmony, the bass line or the arrangement on later passes, and keep the melody itself.

The opposite mistake is putting the variation in the melody. A hook should be simple enough to hum after one hearing. If you rewrite the tune on every pass, nothing gets learned. Let the chords and the production carry the change.

## Producer takeaway: keep the tune, change the ground

Build the hook from a shape the ear knows and give it one turn it does not expect. Repeat that line exactly, because repetition is how it gets learned. Then change what is underneath: end one pass on vi, move the bass, add or strip a layer. If the hook still sounds fresh on the fourth pass, keep it. If it sounds like a loop, change the last chord before you change the melody.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Jakubowski, K., Finkel, S., Stewart, L., & Müllensiefen, D. (2017). Dissecting an earworm: Melodic features and song popularity predict involuntary musical imagery. *Psychology of Aesthetics, Creativity, and the Arts*, 11(2), 122-135.
- Margulis, E. H. (2014). *On Repeat: How Music Plays the Mind*. Oxford University Press.
- Szpunar, K. K., Schellenberg, E. G., & Pliner, P. (2004). Liking and memory for musical stimuli as a function of exposure. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 30(2), 370-381.
`,
    seo: {
        title: 'A hook needs a familiar shape and one odd turn | VGP Studio',
        description: 'What earworm and repetition research says about catchy hooks, why exact repeats wear out, and how a deceptive cadence renews a repeated melody.',
        keywords: ['hook writing', 'earworm', 'melodic repetition', 'deceptive cadence', 'songwriting', 'music psychology'],
    },
};
