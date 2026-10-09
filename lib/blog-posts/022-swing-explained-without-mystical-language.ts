import { BlogArticle } from '../blog-data';

const SIXTEENTHS = Array.from({ length: 16 }, (_, i) => i);

export const post022: BlogArticle = {
    slug: 'swing-explained-without-mystical-language',
    title: 'Swing explained without mystical language',
    excerpt: 'Swing is one timing rule: every second note lands late. Here is the maths of the ratio, why tempo changes it, and how to stop parts from flamming.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-05',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Swing delays every second subdivision by a share of the pair: 50 percent is straight and 66.7 percent is a triplet shuffle.',
        'The same percentage means fewer milliseconds at a faster tempo, and the short note can get too short to read as its own note.',
        'Set the tempo first, set swing by ear, and give every part that shares the off-beats the same setting.',
    ],
    figures: {
        grid: {
            type: 'rhythm',
            caption:
                'One bar of 16th-note swing. Only every second 16th moves, and it moves further as the setting rises. The kick and snare sit on positions that swing never touches.',
            alt: 'Five rows on a 16-step grid. Straight hats on every step, then hats at 58 and 66.7 percent swing with every second hit shifted right by a growing amount. Kick on beats one and three and snare on two and four stay on the grid.',
            rows: [
                { label: 'Hats 50%', note: 'straight', swing: 0.5, hits: SIXTEENTHS },
                { label: 'Hats 58%', focus: true, swing: 0.58, hits: SIXTEENTHS },
                { label: 'Hats 66.7%', focus: true, note: 'triplet', swing: 0.667, hits: SIXTEENTHS },
                { label: 'Kick', hits: [0, 8] },
                { label: 'Snare', hits: [4, 12] },
            ],
        },
        short: {
            type: 'bars',
            min: 0,
            max: 160,
            unit: 'ms',
            caption:
                'How long the short 16th lasts at triplet swing, 66.7 percent, at four tempos. It shrinks as the tempo rises. The dim bar is the rough floor Friberg and Sundström (2002) found in jazz recordings, where players swung less at fast tempos to keep the short note near 100 ms.',
            alt: 'Five bars. At triplet swing the short 16th lasts 142.9 ms at 70 BPM, 111.1 ms at 90 BPM, 83.3 ms at 120 BPM and 71.4 ms at 140 BPM. A fifth, dimmer bar shows about 100 ms for the short note in jazz.',
            bars: [
                { label: '70 BPM', value: 142.9 },
                { label: '90 BPM', value: 111.1 },
                { label: '120 BPM', value: 83.3 },
                { label: '140 BPM', value: 71.4 },
                { label: 'Jazz short note', value: 100, display: 'about 100 ms', dim: true },
            ],
        },
    },
    quiz: [
        {
            q: 'At 100 BPM with 8th-note swing at 58 percent, how late does each off-beat 8th land?',
            options: ['8 ms', '29 ms', '48 ms', '58 ms'],
            answer: 2,
            why: 'At 100 BPM a pair of 8ths lasts 600 ms. The off-beat moves (0.58 - 0.5) × 600 = 48 ms late.',
        },
        {
            q: 'You swing the hats at 62 percent 16ths over a straight 16th bass line at 90 BPM. What do you hear?',
            options: [
                'A flam on each off-16th, because the bass lands first',
                'A tighter groove, because the bass anchors the swung hats',
                'No change, because swing only moves the on-beat notes',
                'A slow tempo drift, because the hats keep falling behind',
            ],
            answer: 0,
            why: 'At 90 BPM a pair of 16ths lasts 333.3 ms. At 62 percent the off-16th moves 40 ms late while the straight bass stays put, so every off-beat sounds twice.',
        },
        {
            q: 'Why does a fast track usually need less swing than a slow one?',
            options: [
                'Most DAWs cap the swing setting at higher tempos',
                'A swing setting means more milliseconds at a fast tempo',
                'Swing adds latency that builds up at fast tempos',
                'The short note gets too short to read as its own note',
            ],
            answer: 3,
            why: 'The pair gets shorter as the tempo rises, and the short note with it. Friberg and Sundström found that jazz players swing less at fast tempos and keep the short note near 100 ms.',
        },
    ],
    content: `## Hook: the swing slider myth

Producers talk about swing as if it were a secret. They swear by one drum machine's timing, or claim that one DAW has a warmer groove engine than another, and they drag a slider hunting for the number that will bring a loop to life.

There is no secret in it. Swing is one timing rule: every second subdivision lands late, so pairs of notes move long-short instead of evenly. Roger Linn, who designed the swing on his drum machines and the MPC, describes his version just as plainly: it delays the second 16th note within each 8th (Scarth and Linn, 2013). What makes swing feel right or wrong is how much you delay, at what tempo, and whether every part agrees.

## Why it matters: one percentage, many timings

A swing setting is a share of the pair. At 50 percent both notes get equal time and the rhythm is straight. At 66.7 percent the first note takes two thirds of the pair and the second takes one third: a triplet shuffle. Most swing in beats lives between those two.

Because the setting is a share, the delay in milliseconds scales with tempo. At 58 percent, 16th-note swing delays each off-16th by 26.7 ms at 90 BPM but only by 17.1 ms at 140 BPM. The shape stays the same while the absolute timing changes, which is why a preset that rolls at one tempo can feel stiff or cartoonish at another.

::figure grid

::demo swing

## Science model: the maths of long and short

Call the swing setting $p$, the share of the pair given to the first note. The swing ratio compares the two durations:

$$r = \\frac{T_{\\text{long}}}{T_{\\text{short}}} = \\frac{p}{1 - p}$$

Straight, 50 percent, gives 1:1. 58 percent gives about 1.4:1, and 66.7 percent gives 2:1. The second note arrives late by:

$$\\Delta t = (p - 0.5) \\times T_{\\text{pair}}$$

The pair lasts $T_{\\text{pair}} = 60\\,000 / \\text{BPM}$ ms for 8th-note swing, and half that for 16th-note swing.

Players do not keep the ratio fixed. Friberg and Sundström (2002) measured the ride cymbal patterns of jazz drummers on commercial recordings and found that the swing ratio fell as tempo rose, from strongly long-short pairs at slow tempos to almost even 8ths at fast ones. At medium and fast tempos the short note stayed at roughly 100 ms, as if it had a floor. The same logic carries over to beats. Push 16th swing hard at a high tempo and the short note gets so short it stops reading as a note of its own.

::figure short

Linn's own advice points the same way. He notes that 54 percent loosens a straight 16th beat without making it sound swung, and that a 90 BPM groove can feel looser at 62 percent than at a full triplet (Scarth and Linn, 2013).

## DAW experiment: the A/B swing test

1. Set the tempo to 100 BPM. Program closed hats on every 8th at one fixed velocity and a kick on beats one and three.
2. Duplicate the hat track and leave the original straight.
3. On the copy, set the swing or groove amount to 58 percent at 8th-note resolution. Each off-beat 8th now lands 48 ms late, and each pair splits into 348 ms and 252 ms.
4. Mute one hat track at a time and switch between them every four bars. Keep their levels identical.
5. Raise the copy to 66 percent, then drop it to 54 percent, and listen to each for four bars.
6. Change the tempo to 140 BPM without touching the swing and listen again.

At 100 BPM the 58 percent hats roll forward while the straight hats tick. At 140 BPM the same setting delays the off-beat by only 34.3 ms, and it sounds lighter.

## Common mistake: parts that disagree about the grid

Swing only moves the second note of each pair, so a kick on beats one and three does not move at all, and swinging it changes nothing. The real trouble starts when two parts share the off-beat positions with different swing. Swing the hats at 62 percent 16ths over a straight 16th bass line at 90 BPM, and every off-16th bass note lands 40 ms before the hat it should meet. That gap is wide enough to hear as two notes, so every off-beat flams. The same thing happens when a sample loop with its own swing plays under a programmed part with another.

Pick one swing amount and one resolution and apply it to every part that plays the off-beat positions. If you want one part straight, keep it off those positions.

## Producer takeaway: set swing by ear at the final tempo

Choose the tempo first, then the swing. Start straight and raise the amount in small steps while the full beat plays. Faster tracks usually want less, slower ones can carry more. Stop when the off-beats roll into the next beat, and back off when they start to bounce. Then give every part that shares those positions the same setting.

## References

- Friberg, A., & Sundström, A. (2002). Swing ratios and ensemble timing in jazz performance: Evidence for a common rhythmic pattern. *Music Perception*, 19(3), 333-349.
- Scarth, G., & Linn, R. (2013, July 2). Roger Linn on swing, groove & the magic of the MPC's timing. *Attack Magazine*. https://attackmagazine.com/features/interview/roger-linn-swing-groove-magic-mpc-timing/
`,
    seo: {
        title: 'Swing explained without mystical language | VGP Studio',
        description: 'Swing as plain timing maths: the long-short ratio, how tempo changes the delay in milliseconds, and how to keep swung parts from flamming.',
        keywords: ['swing rhythm', 'swing ratio', 'MPC swing', 'groove', 'drum programming', 'beat making'],
    },
};
