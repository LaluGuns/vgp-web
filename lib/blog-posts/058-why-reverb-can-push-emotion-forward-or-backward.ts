import { BlogArticle } from '../blog-data';

export const post058: BlogArticle = {
    slug: 'why-reverb-can-push-emotion-forward-or-backward',
    title: 'Reverb moves emotion forward or back',
    excerpt: 'Pre-delay and decay decide whether a vocal feels close or far away. Set the gap before the room and the length of the tail so the singer stays in front.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'A long gap before the first reflection tells the ear a source is close, so pre-delay keeps a wet vocal in front.',
        'A tail that runs into the next line masks its consonants, so set the decay to fade in the gap between phrases.',
        'Use space to tell the story: drier and closer in the verse, wider and longer in the chorus.',
    ],
    figures: {
        gap: {
            type: 'scale',
            caption:
                'When the first reflection arrives, for a reflection path of 12 m. With the singer 1 m away it comes 32 ms after the direct sound. With the singer 9 m away, the gap shrinks to about 9 ms. A long gap is a cue for closeness.',
            alt: 'A time line from 0 to 60 ms. The direct sound is at 0. The first reflection for a distant singer arrives at 9 ms, and for a close singer at 32 ms. A bar below marks the 32 ms gap.',
            min: 0,
            max: 60,
            unit: 'ms',
            ticks: [0, 20, 40, 60],
            markers: [
                { value: 0, label: 'Direct sound' },
                { value: 9, label: 'Far singer' },
                { value: 32, label: 'Close singer', strong: true },
            ],
            ranges: [{ from: 0, to: 32, label: 'Gap: 32 ms' }],
        },
        tail: {
            type: 'signal',
            caption:
                'Two vocal lines with the same reverb send. With a shorter decay the tail has faded before the next line starts. With a long one it is still loud when the next words arrive and covers their consonants.',
            alt: 'Two level plots of two vocal phrases with a dashed reverb tail. In the first, each tail falls to nothing in the gap between phrases. In the second, the tail of the first phrase is still high when the second phrase begins.',
            rows: [
                {
                    label: 'Decay fades in the gap',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', label: 'Vocal', points: [[0, 0], [0.04, 0], [0.05, 0.8], [0.4, 0.7], [0.42, 0], [0.55, 0], [0.56, 0.8], [0.9, 0.7], [0.92, 0], [1, 0]] },
                        { kind: 'envelope', label: 'Reverb', dashed: true, points: [[0, 0], [0.06, 0], [0.2, 0.32], [0.42, 0.34], [0.47, 0.12], [0.53, 0.02], [0.57, 0], [0.7, 0.32], [0.92, 0.34], [0.97, 0.12], [1, 0.05]] },
                    ],
                },
                {
                    label: 'Decay runs into the next line',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', label: 'Vocal', points: [[0, 0], [0.04, 0], [0.05, 0.8], [0.4, 0.7], [0.42, 0], [0.55, 0], [0.56, 0.8], [0.9, 0.7], [0.92, 0], [1, 0]] },
                        { kind: 'envelope', label: 'Reverb', dashed: true, points: [[0, 0], [0.06, 0], [0.22, 0.4], [0.42, 0.46], [0.5, 0.4], [0.56, 0.36], [0.7, 0.48], [0.92, 0.52], [1, 0.46]] },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'The first reflection travels 12 m and the singer stands 1 m from you. How long after the direct sound does it arrive?',
            options: ['About 3 ms', 'About 12 ms', 'About 32 ms', 'About 120 ms'],
            answer: 2,
            why: 'The extra path is 12 - 1 = 11 m. At 343 m/s that takes 11 / 343 = 0.032 s, about 32 ms.',
        },
        {
            q: 'Why does 50 ms of pre-delay keep a wet vocal in front?',
            options: [
                'It makes the reverb quieter overall, so less of the room is heard',
                'It shortens the reverb tail, so the room clears before the next word',
                'It narrows the reverb, so the room sits in the centre with the vocal',
                'Each word starts dry before the room comes in, like a close source',
            ],
            answer: 3,
            why: 'From a close source, the direct sound arrives well before the first reflection. Pre-delay recreates that gap, so the words stay clear and close.',
        },
        {
            q: 'At 140 BPM, roughly how long does a 3 s reverb tail last in musical time?',
            options: ['About seven beats, nearly two bars', 'About two beats, half of one bar', 'About three beats, most of one bar', 'About sixteen beats, four whole bars'],
            answer: 0,
            why: 'One beat at 140 BPM is 60 / 140 = 0.43 s, so 3 s is about seven beats. A tail that long overlaps the next line or two.',
        },
    ],
    content: `## Hook: the distant singer

You have an intimate vocal take. To make it feel bigger you add a plate reverb, and as the song plays the listener drifts away from it. The singer sounds as if they are performing in an empty hall down the corridor. You try a different reverb model and the distance stays.

Reverb does more than add size. It changes how close the singer feels. A dry vocal sounds near, as if the singer were right in front of you. A very wet one sounds distant. Get the space wrong and you push the performance into the background, along with the connection to the song.

## Why it matters: two settings decide the distance

Two reverb controls do most of this work. Pre-delay sets the gap between the dry vocal and the start of the reverb. Decay sets how long the tail lasts. A vocal can carry a lot of reverb and still feel close if the gap is long enough and the tail clears between lines. With no gap and a long tail, even a modest send pushes it back.

The tail also decides whether the words survive. A tail that is still loud when the next line starts covers the quiet consonants that carry the lyric, and the listener loses the story.

::figure tail

## Science model: the gap before the room

In a real room the direct sound reaches you first, and the reflections from the walls follow. Beranek (2004) calls the time between the direct sound and the first reflection the initial time delay gap. It depends on the extra distance the reflection travels:

$$\\Delta t = \\frac{d_{\\text{reflected}} - d_{\\text{direct}}}{c}$$

where $c$ is the speed of sound, about 343 m/s. Say the first reflection travels 12 m to reach you. With the singer 1 m away, the gap is $(12 - 1) / 343 \\approx 32$ ms. With the singer 9 m away and a reflection that still travels about 12 m, it shrinks to about 9 ms. A close source has a long gap; a distant one has almost none.

::figure gap

That is why pre-delay works. Setting it to 0 ms removes one of the cues for closeness. Setting it to 40 to 60 ms recreates the gap of a close source in a larger space, so the dry start of each word arrives on its own. The other strong cue is the balance between direct and reverberant sound: the more reverb relative to the dry signal, the further away the source seems (Zahorik, Brungart and Bronkhorst, 2005).

Move the pre-delay, decay and level and listen to the notes step forward or sink back.

::demo reverb

## DAW experiment: keep the singer close

Use a verse and a chorus of a finished vocal. Step 5 also needs a de-esser; if your DAW has none, install one before you start.

1. Insert a plate or hall reverb on an aux return, 100% wet, and send the lead vocal to it at -12 dB.
2. Set the pre-delay to 0 ms and listen, then set it to 50 ms. Listen to the start of each word separate from the room.
3. Work out one beat at your tempo: 60 divided by the BPM. Start the decay at 2.5 s and shorten it in 0.2 s steps until the tail has faded before the next line begins.
4. EQ the return: high-pass at 200 Hz and low-pass at 6 kHz.
5. Put a de-esser on the send path, before the reverb, and set it so the s and t sounds stop splashing into the tail.
6. Automate the send 4 dB lower in the verse than in the chorus.

The dry vocal stays at the front in both sections, with space behind it rather than around it. The chorus opens up without the verse losing its closeness.

## Common mistake: the long wash

A common mistake is a long decay on a fast song. At 140 BPM one beat lasts 0.43 s, so a 3 s tail runs for about seven beats and overlaps the next line or two. The vocal loses its articulation and the listener stops following the words.

The other is sending sibilance into the reverb. A bright reverb turns every s into a hiss that hangs in the air after the word, and you end up turning the whole vocal down to hide it. De-ess before the reverb and filter its return.

## Producer takeaway: space is part of the story

Reverb is not a set-and-forget background effect. A dry verse can make a singer feel exposed and close. A longer, wider reverb in the chorus can lift the same voice into something bigger. Plan those changes the way you plan the arrangement.

Check at a conversational listening level. If the vocal still feels close and the lyrics are easy to follow, the space is working. If the singer sounds detached, lengthen the pre-delay or shorten the decay before you touch the send level.

## References

- Beranek, L. (2004). *Concert Halls and Opera Houses: Music, Acoustics, and Architecture* (2nd ed.). Springer.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
- Zahorik, P., Brungart, D. S., & Bronkhorst, A. W. (2005). Auditory distance perception in humans: A summary of past and present research. *Acta Acustica united with Acustica*, 91(3), 409-420.
`,
    seo: {
        title: 'Reverb moves emotion forward or back | VGP Studio',
        description: 'Pre-delay and decay decide how close a vocal feels. The physics of the gap before the first reflection, and how to set reverb so the singer stays in front.',
        keywords: ['reverb pre-delay', 'reverb decay', 'vocal intimacy', 'initial time delay gap', 'vocal reverb', 'spatial cues'],
    },
};
