import { BlogArticle } from '../blog-data';

const VOCAL = {
    kind: 'envelope' as const,
    label: 'Vocal',
    points: [
        [0, 0], [0.03, 0], [0.05, 0.8], [0.25, 0.72], [0.27, 0],
        [0.37, 0], [0.39, 0.85], [0.58, 0.74], [0.6, 0],
        [0.7, 0], [0.72, 0.8], [0.91, 0.7], [0.93, 0], [1, 0],
    ] as [number, number][],
};

export const post019: BlogArticle = {
    slug: 'why-background-details-should-enter-like-plot-twists',
    title: 'Time background details like plot twists',
    excerpt: 'Ear candy that loops all verse fades into the background and crowds the vocal. Give it an entrance in the gaps between phrases and it gets noticed.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'A detail that plays all the time stops being noticed, and it masks the vocal in the range they share.',
        'The same detail entering in the gap between two vocal phrases is an event the listener hears, and it competes with nothing.',
        'Automate details up in the gaps and down under the vocal, and place them away from the centre so they stay in the background.',
    ],
    figures: {
        gaps: {
            type: 'signal',
            caption:
                'A sketch of one verse. On the top row the detail runs under every vocal phrase. On the bottom row its level is automated so it only rises in the gaps, answering the vocal instead of covering it.',
            alt: 'Two level plots with three vocal phrases each. In the first, a dashed detail line stays at a constant level under all the phrases. In the second, the dashed detail line is silent during the phrases and rises only in the gaps between them.',
            rows: [
                {
                    label: 'Detail always on',
                    unipolar: true,
                    traces: [VOCAL, { kind: 'envelope', label: 'Detail', dashed: true, points: [[0, 0.42], [1, 0.42]] }],
                },
                {
                    label: 'Detail in the gaps',
                    unipolar: true,
                    traces: [
                        VOCAL,
                        {
                            kind: 'envelope',
                            label: 'Detail',
                            dashed: true,
                            points: [
                                [0, 0], [0.27, 0], [0.29, 0.5], [0.35, 0.5], [0.37, 0],
                                [0.6, 0], [0.62, 0.5], [0.68, 0.5], [0.7, 0],
                                [0.93, 0], [0.95, 0.5], [1, 0.5],
                            ],
                        },
                    ],
                },
            ],
        },
        place: {
            type: 'stereo',
            title: 'Details away from the vocal',
            caption:
                'One way to place them. The vocal, kick and bass hold the centre at the front. The details sit off to the sides and further back, where a change of direction also makes them easier to hear without turning them up.',
            alt: 'Top-down view between two speakers. Vocal at the front centre, kick and bass just behind it, chords a little further back and spread. Two details sit far left and far right, near the back.',
            items: [
                { label: 'Vocal', pan: 0, depth: 0.08 },
                { label: 'Kick and bass', pan: 0, depth: 0.3 },
                { label: 'Chords', pan: 0, depth: 0.5, width: 0.5 },
                { label: 'Detail 1', pan: -0.75, depth: 0.78 },
                { label: 'Detail 2', pan: 0.72, depth: 0.85 },
            ],
        },
    },
    quiz: [
        {
            q: 'A synth texture plays through the whole verse. Why do you stop hearing it after a while?',
            options: [
                'The vocal covers it up once the singing starts',
                'An unchanging sound draws less and less response',
                'The texture is slightly out of tune with the vocal',
                'It is panned too wide to be heard in the centre',
            ],
            answer: 1,
            why: 'Habituation reduces the response to a sound that does not change. The texture keeps taking up space in the vocal range even after the listener has stopped noticing it.',
        },
        {
            q: 'Where does a background detail get noticed most and mask least?',
            options: [
                'Under the loudest word of each vocal line',
                'On every downbeat throughout the verse',
                'In the gap between two vocal phrases',
                'At the lead vocal\'s level, in the centre',
            ],
            answer: 2,
            why: 'In the gap the detail is a new event, and there is no vocal for it to mask. Under the vocal it competes in the same range at the same time.',
        },
        {
            q: 'Why can panning a detail away from the centre help, even at the same level?',
            options: [
                'Panning moves it away from the sound masking it',
                'Panning shortens the reverb tail of the detail',
                'Panning puts it out of phase with the lead vocal',
                'Panning thins out the low end that muddies it',
            ],
            answer: 0,
            why: 'Spatial separation reduces masking. A detail placed off to the side and further back can be heard clearly while staying quieter than the vocal.',
        },
    ],
    content: `## Hook: the ear candy you stopped hearing

You build a great synth loop or a percussion texture. It adds depth, so you let it run through the whole verse. When you listen back, you notice that you do not hear it any more. It has sunk into the background, and the verse still feels static.

You spent time designing ear candy, and because it never stops, the listener stops noticing it.

## Why it matters: constant details cost the vocal space

A detail that plays all the time still takes up room. If it shares the vocal's range, it masks the vocal, and you push the vocal up to compensate. The mix gets louder and harsher without getting clearer.

Timed details avoid both problems. Vocal lines have gaps: breaths, the space at the end of a phrase, the bar before the next line. A detail that enters there is heard as an answer to the vocal. It adds movement to the verse and covers nothing. This is call and response, one of the oldest devices in arranging: the voice states a line and an instrument answers in the space after it.

You do not have to answer every gap. One answer at the end of the second line and another at the end of the fourth is often enough to make a verse feel like it is developing.

::figure gaps

## Science model: habituation, entrances and masking

The ear responds less to a sound that does not change. This habituation is why a texture that loops for sixteen bars stops registering, even though it is still there in the mix.

Changes draw attention. Huron (1989) found that listeners noticed a voice entering a texture more easily than one leaving it. A detail that is silent most of the time and then enters in a gap is an entry every time it plays. A detail that never stops never enters.

Masking is the cost of a constant detail. A sound raises the level another sound needs to be heard, most strongly when the two overlap in frequency and time (Moore, 2012). A detail in the gap does not overlap the vocal in time, so it barely masks it. Direction helps too. A sound that comes from a different direction than its masker is easier to hear, an effect called spatial release from masking. A detail panned off to the side and placed further back can be quieter than the vocal and still clear.

::figure place

## DAW experiment: the vocal gap automation test

1. Find a verse with background loops or textures playing under the vocal.
2. Leave the background parts running unchanged in the first half of the verse.
3. In the second half, mark the gaps between vocal phrases.
4. Draw volume automation on the background tracks so they are fully down during every vocal line.
5. Let the automation rise only in the gaps, with a short ramp of an eighth note in and out.
6. Pan the details off centre and set their level well below the vocal.
7. Play the whole verse from the start.

In the first half, the details blur into the bed and crowd the vocal. In the second half, each detail should sound like it arrives on purpose, and the vocal should stay clear.

## Common mistake: running ear candy continuously

The most common mistake is running loops and textures through the entire song. It seems to add density, but the listener stops hearing them while the vocal still pays for them in masking.

The second mistake is letting the detail compete with the vocal for attention. If a detail plays a busy melody at the same time as the vocal, it breaks the vocal's pocket. A detail answers the vocal; it does not sing over it. Filling every single gap with the same sound is the same trap in a new place: it turns into a loop of its own.

## Producer takeaway: save details for the gaps

A background sound needs an entrance. Keep your details silent under the vocal, let them speak in the gaps, and place them away from the centre. They will be heard more often by being played less.

## References

- Huron, D. (1989). Voice denumerability in polyphonic music of homogeneous timbres. *Music Perception*, 6(4), 361-382.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
`,
    seo: {
        title: 'Time background details like plot twists',
        description: 'Ear candy that loops all verse fades from attention and masks the vocal. Automate details into the gaps between phrases so they get noticed.',
        keywords: ['background ear candy', 'vocal masking', 'automation', 'habituation', 'arrangement tips'],
    },
};
