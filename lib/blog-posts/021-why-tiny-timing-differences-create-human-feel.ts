import { BlogArticle } from '../blog-data';

// 90 BPM: one 16th lasts 166.7 ms, so 20 ms is 0.12 of a step.
const STEP_MS = 60000 / 90 / 4;
const at = (ms: number) => Math.round((ms / STEP_MS) * 1000) / 1000;
const EIGHT = [0, 1, 2, 3, 4, 5, 6, 7];
const RANDOM_MS = [13, -17, 20, -5, -20, 8, 17, -12];

export const post021: BlogArticle = {
    slug: 'why-tiny-timing-differences-create-human-feel',
    title: 'Why tiny timing differences create human feel',
    excerpt: 'A small, consistent offset makes a part lean back or push. Random humanize and large offsets do the opposite. Learn to size the lean in milliseconds.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-05',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Microtiming is a feel control: a small, consistent lean makes a part sit back or push, while large offsets lower the groove.',
        'At 90 BPM a 16th lasts 166.7 ms, so a 20 ms lean is 12 percent of a step, heard as together but no longer fused.',
        'Move one secondary part by the same amount on every hit and keep the kick and snare as the anchor.',
    ],
    figures: {
        lean: {
            type: 'rhythm',
            steps: 8,
            perBeat: 4,
            caption:
                'Two beats at 90 BPM, where one 16th lasts 166.7 ms. The consistent lean moves every hat 20 ms late, so the hats sit behind the kick as one part. Random humanize scatters them up to 20 ms either side with no pattern.',
            alt: 'A grid of two beats. Kick on beat one and snare on beat two sit on the grid. Below them, quantized hats on every 16th, hats all shifted slightly late by the same amount, and hats shifted early and late by different amounts.',
            rows: [
                { label: 'Kick', hits: [0] },
                { label: 'Snare', hits: [4] },
                { label: 'Hats, quantized', hits: EIGHT },
                { label: 'Hats, lean', focus: true, note: '+20 ms', hits: EIGHT.map((step) => ({ step, offset: at(20) })) },
                { label: 'Hats, random', note: '±20 ms', hits: EIGHT.map((step) => ({ step, offset: at(RANDOM_MS[step]) })) },
            ],
        },
        size: {
            type: 'scale',
            min: 0,
            max: 180,
            unit: 'ms',
            ticks: [0, 60, 120, 180],
            caption:
                'A 20 ms lean against the length of a 16th note. Onsets up to about 30 ms apart still sound as if they start together, so the lean reads as feel rather than as a wrong note. A 16th is five to eight times longer than the lean, depending on tempo.',
            alt: 'A line from 0 to 180 milliseconds. A shaded range from 0 to 30 ms is marked as still sounding together. Markers show a 20 ms lean, a 16th at 140 BPM at 107 ms and a 16th at 90 BPM at 167 ms.',
            markers: [
                { value: 20, label: '20 ms lean', strong: true },
                { value: 107.1, label: '16th at 140 BPM' },
                { value: 166.7, label: '16th at 90 BPM' },
            ],
            ranges: [{ from: 0, to: 30, label: 'Still sounds together' }],
        },
    },
    quiz: [
        {
            q: 'At 90 BPM, how long does one 16th note last?',
            options: ['83.3 ms', '111.1 ms', '166.7 ms', '250 ms'],
            answer: 2,
            why: 'A beat lasts 60,000 / 90 = 666.7 ms and holds four 16ths, so each one lasts 166.7 ms.',
        },
        {
            q: 'Why does random humanize often sound sloppy rather than played?',
            options: [
                'It pulls every note early, so the part rushes',
                'It changes velocity on every hit as well as timing',
                'It shifts the whole part late by one fixed amount',
                'Each offset is unrelated to the ones before it',
            ],
            answer: 3,
            why: 'Hennig and colleagues found that human timing errors are related from hit to hit. Independent random offsets have no pattern, so the part sounds unsure of where the beat is.',
        },
        {
            q: 'A 20 ms lean on the hats gave your 90 BPM beat a relaxed feel, so you try 60 ms to make it groove harder. What do the listening tests on bigger offsets predict?',
            options: [
                'The groove gets stronger, since more offset means more feel',
                'Groove ratings drop once the lean outgrows what players use',
                'Nothing changes, since the ear cannot hear a 60 ms offset',
                'It grooves harder as long as the kick and snare stay quantized',
            ],
            answer: 1,
            why: 'Senn and colleagues found groove ratings fell when performed offsets were exaggerated, and Davies and colleagues and Frühauf and colleagues saw ratings drop as offsets grew. At 90 BPM, 60 ms is over a third of a 16th, well past a lean a player would use.',
        },
    ],
    content: `## Hook: the beat that went flat

You record a drum part, select everything and quantize it to 100 percent. The snare lands exactly on beats two and four. The hats sit exactly on the 16th-note lines. On screen it is perfect. On playback something has gone flat. The vocal floats on top of the beat instead of sitting in it, and the hats tick like a clock.

Quantizing removed a relationship between the parts. Before, the hats leaned slightly behind the kick, the same way on every hit, and that lean was part of the feel. After, every part shares the same instant, so nothing pushes and nothing sits back.

## Why it matters: feel is a lean, not a wobble

Microtiming is the set of small offsets, from a few to a few tens of milliseconds, that place notes ahead of or behind the grid. Players use them on purpose. A drummer who sits behind the beat makes a groove feel relaxed. A percussionist who plays slightly ahead pushes it forward.

That does not make the grid the enemy. In listening tests, fully quantized versions of real bass and drum grooves were rated as grooving as much as the original performances, and exaggerated offsets lowered the ratings (Senn et al., 2016). Other studies found the same drop as offsets grew (Davies et al., 2013; Frühauf, Kopiez and Platz, 2013). Microtiming does not add groove by itself. It is a control for feel: it decides whether a part leans back or pushes, and it only works when it is small and consistent.

::figure lean

::demo humanize

## Science model: how big an offset really is

The offset of a note is its measured arrival minus its grid position:

$$t_{\\text{offset}} = t_{\\text{actual}} - t_{\\text{grid}}$$

A positive offset is late and a negative one early. To judge its size, compare it with the length of one grid step. A 16th note lasts:

$$t_{16} = \\frac{60\\,000}{4 \\times \\text{BPM}} \\ \\text{ms}$$

At 90 BPM that is 166.7 ms, so a 20 ms lean is 12 percent of a step. That is far too small to hear as a wrong note, but large enough to change how two parts sit together. Rasch (1978) found that notes starting up to about 30 ms apart still sound as if they start together, yet the ear uses that head start to hear them as separate sounds (Moore, 2012). A hat 20 ms behind the kick still lands with it, but the two stop fusing into one hit.

::figure size

The pattern of the offsets matters as much as their size. Hennig and colleagues (2011) measured human rhythmic performance and found that timing errors are not independent from hit to hit. They drift in slow waves, so each error is related to the ones before it, even many beats back. Listeners preferred a beat humanized with that kind of related drift over one humanized with plain random offsets, the kind most humanize functions use.

## DAW experiment: consistent lean against random drift

1. Set the tempo to 90 BPM. Program a kick on beats one and three, a snare on two and four and closed hats on every 16th. Quantize all three to 100 percent.
2. Duplicate the hat track and mute the copy. It is your quantized reference.
3. On the active hat track, set the track delay to +20 ms and loop four bars. The hats now sit 12 percent of a 16th behind the kick.
4. Change the track delay to -15 ms and loop the same four bars.
5. Set the track delay back to 0 and run your DAW's humanize or randomize function on the hat notes with a range of 20 ms either way.
6. Compare the random version with the +20 ms version. Both reach the same maximum distance from the grid.
7. Keep the version that sounds like one player, and leave the kick and snare quantized.

The +20 ms hats sit back and the -15 ms hats push, and both sound deliberate. The random version covers the same range and sounds loose, because no two hits agree on where the beat is.

## Common mistake: random humanize as a shortcut

The common mistake is selecting every note and running a random humanize to make it feel played. Random offsets jump independently from one hit to the next: 12 ms late, then 10 ms early, then on the grid. A real player does not do that. Their timing drifts, and when they lean, they lean the same way for a reason, such as a snare that sits a little late on every backbeat while the kick stays with the bass.

The second mistake is assuming that more offset means more feel. Past the amount a good player would use, offsets stop sounding like a lean and start sounding like a mistake, and listeners rate the groove lower.

## Producer takeaway: lock the anchor, lean one part

Keep the kick and snare tight to the grid unless you have a reason to move them. They are the anchor the listener locks to. Then choose one secondary part, such as hats, shaker or a percussion loop, and move all of it by the same small amount. Set it by ear, not by eye, and check it from across the room. If the part sounds like one player with an attitude, keep it. If it sounds like two players disagreeing, pull it back toward the grid.

## References

- Davies, M., Madison, G., Silva, P., & Gouyon, F. (2013). The effect of microtiming deviations on the perception of groove in short rhythms. *Music Perception*, 30(5), 497-510.
- Frühauf, J., Kopiez, R., & Platz, F. (2013). Music on the timing grid: The influence of microtiming on the perceived groove quality of a simple drum pattern performance. *Musicae Scientiae*, 17(2), 246-260.
- Hennig, H., Fleischmann, R., Fredebohm, A., Hagmayer, Y., Nagler, J., Witt, A., Theis, F. J., & Geisel, T. (2011). The nature and perception of fluctuations in human musical rhythms. *PLoS ONE*, 6(10), e26457.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Rasch, R. A. (1978). The perception of simultaneous notes such as in polyphonic music. *Acustica*, 40, 21-33.
- Senn, O., Kilchenmann, L., von Georgi, R., & Bullerjahn, C. (2016). The effect of expert performance microtiming on listeners' experience of groove in swing or funk music. *Frontiers in Psychology*, 7, 1487.
`,
    seo: {
        title: 'Why tiny timing differences create human feel | VGP Studio',
        description: 'How microtiming offsets of a few milliseconds shape feel, why random humanize sounds sloppy, and how to set a consistent lean in your DAW.',
        keywords: ['microtiming', 'human timing', 'humanize', 'groove', 'quantize', 'drum programming'],
    },
};
