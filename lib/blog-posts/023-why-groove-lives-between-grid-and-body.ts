import { BlogArticle } from '../blog-data';

// 90 BPM: one 16th lasts 166.7 ms, so 20 ms is 0.12 of a step.
const LEAN = 0.12;

export const post023: BlogArticle = {
    slug: 'why-groove-lives-between-grid-and-body',
    title: 'Why groove lives between grid and body',
    excerpt: 'The grid marks where a sound starts. Your body hears where its beat lands. Build the pocket from that gap, and correct for your own clapping bias.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-05',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'The grid marks where a sound starts, but listeners hear its beat later and more loosely when the attack is slow or the sound is long.',
        'A pocket needs a clear anchor, usually kick and backbeat, with the other parts leaning around it on purpose.',
        'When you set offsets by clapping along, measure your own early bias against a bare click first and subtract it.',
    ],
    figures: {
        attack: {
            type: 'signal',
            caption:
                "Both sounds start on the same grid line. The snare's energy arrives at once, so listeners place its beat on the line. The pad takes time to rise, so listeners place its beat later and less precisely (Danielsen et al., 2019).",
            alt: 'Two level plots. A snare envelope jumps to full level at the grid line and decays quickly. A pad envelope starts at the same grid line and rises slowly, with a second marker later than the grid where its beat is felt.',
            rows: [
                {
                    label: 'Snare: fast attack, short',
                    unipolar: true,
                    traces: [{ kind: 'hits', at: [0.2], decay: 12, outline: true }],
                    marks: [{ t: 0.2, label: 'Grid' }],
                },
                {
                    label: 'Pad: slow attack, long',
                    unipolar: true,
                    traces: [
                        {
                            kind: 'envelope',
                            points: [
                                [0, 0],
                                [0.2, 0],
                                [0.55, 0.85],
                                [1, 0.8],
                            ],
                        },
                    ],
                    marks: [
                        { t: 0.2, label: 'Grid' },
                        { t: 0.42, label: 'Felt beat' },
                    ],
                },
            ],
        },
        pocket: {
            type: 'rhythm',
            steps: 8,
            perBeat: 4,
            caption:
                'Two beats at 90 BPM, where a 16th lasts 166.7 ms. Kick and snare mark the beat on the grid. The slow pad starts 20 ms early to make up for its rise. The shaker sits 20 ms late on every hit, 12 percent of a step, with quieter hits in between, so it leans as one consistent part.',
            alt: 'A grid of two beats. Kick on beat one and snare on beat two sit on the grid. A pad hit on beat one is shifted slightly early. Shaker hits on every 16th are all shifted slightly late, alternating loud and quiet.',
            rows: [
                { label: 'Kick', hits: [0] },
                { label: 'Snare', hits: [4] },
                { label: 'Pad', focus: true, note: '-20 ms', hits: [{ step: 0, offset: -LEAN }] },
                {
                    label: 'Shaker', focus: true,
                    note: '+20 ms',
                    hits: [0, 1, 2, 3, 4, 5, 6, 7].map((step) => ({ step, offset: LEAN, level: step % 2 === 0 ? 1 : 0.45 })),
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A pad with a slow attack starts exactly on the grid line. Where do listeners tend to hear its beat?',
            options: ['Right on the line, in a narrow window', 'Earlier than the line, in a narrow window', 'Later than the line, in a wider window', 'Later than the line, in a narrow window'],
            answer: 2,
            why: 'Danielsen and colleagues found that slow and long sounds are placed later than their onset and with more spread. The perceived beat is a window, not a point.',
        },
        {
            q: 'You clap along to the click, then line a tambourine up with your raw claps without measuring anything. Where is the tambourine most likely to end up?',
            options: [
                'Behind the beat, since each clap is a reaction to the click',
                'Ahead of the beat, by tens of milliseconds on average',
                'On the beat, within a millisecond or two of the click',
                'Scattered either side of the beat, with no lean either way',
            ],
            answer: 1,
            why: "When people tap with a steady beat, their taps land ahead of it on average, usually by tens of milliseconds (Repp, 2005). Aligning a part to raw claps copies that anticipation into the track, which is why the corrected clap test measures it first.",
        },
        {
            q: 'In the corrected clap test, why do you first record a take against the click alone?',
            options: [
                'To measure your own tapping bias',
                'To check that the click is in time',
                'To warm up before the real take',
                'To set the input level for claps',
            ],
            answer: 0,
            why: 'The first take shows how early you tap anyway. Subtracting it leaves only the shift that the track itself causes.',
        },
    ],
    content: `## Hook: the clean line that does not move

You snap every track to the grid. Kick, bass, snare and chords all start on the same lines, and the arrange window shows one clean column of transients. Then you play it and nothing moves. The beat is correct and your body ignores it.

The grid measures where a sound starts. Your body responds to where it feels the beat land, and those are not always the same place. Groove, the pleasant urge to move with music (Janata, Tomic and Haberman, 2012), lives in the gap between the two.

## Why it matters: the eye aligns starts, the ear hears beats

Aligning by eye assumes that the beat of every sound sits at the start of its waveform. That holds for a snare. It does not hold for a pad, a soft bass or a breathy vocal. Danielsen and colleagues (2019) asked listeners to line up clicks with sounds of different shapes, and to tap along with them. Sounds with a fast attack and a short decay were placed close to their onset, in a narrow band. Sounds with a slow attack or a long duration were placed later and with far more spread. The authors describe the perceived beat of a sound as a beat bin: a window with a shape, rather than a single instant.

So a session that looks aligned can feel smeared. The snare lands on the line, the slow pad lands later, and the body has to pick. A good pocket gives it something clear to pick, then lets the other parts lean around it on purpose.

::figure attack

## Science model: anchors and leaning parts

Your body locks to the parts with the clearest beat, usually the kick and the backbeat. Janata and colleagues found that music rated high in groove also drew spontaneous movement, and that groove went with how easily people could move in time with it. A clear anchor makes that coupling easy. Once it is stable, other parts can sit early or late against it and be heard as feel rather than error.

::figure pocket

The demo below moves one part against an otherwise fixed beat. Here it is the snare, while the kick and hats stay on the grid. Notice how a few milliseconds change the attitude of the whole bar.

::demo late-snare

There is a catch when you set offsets by tapping or clapping along. When people tap with a steady beat, their taps land ahead of it on average, usually by tens of milliseconds (Repp, 2005). If you line percussion up with your raw claps, you copy your own anticipation into the track. The fix is to measure that bias first and keep only the difference the music causes.

## DAW experiment: the corrected clap test

1. Loop eight bars of your track and mute everything except the click. Record yourself clapping, or tapping a pad, on every beat. Do not quantize.
2. Zoom in and note how far your hits sit from the grid on average. Most people land early.
3. Mute the click and play the vocal, kick and snare. Record a second take, clapping where the vocal makes you want to clap.
4. Note the average offset of this take and subtract the first. Say you were 20 ms early to the click and 5 ms early to the track: the track pulls you 15 ms later.
5. Move your shaker or tambourine by that difference, here +15 ms, using track delay.
6. Compare it with the quantized shaker at matched level, with the full track playing.

The shaker should now sit where your body places the beat in this track. If the difference was close to zero, the grid already matched the track, which is a useful answer too.

## Common mistake: quantizing every layer

The usual mistake is snapping every layer to the grid at 100 percent and calling it clean. Tambourines, shakers and hats played by hand carry the player's lean. Strip it out and the track still works, but it loses the push or sit-back that made it sound like people playing together.

The opposite mistake is aligning slow sounds by the start of their waveform. A pad or a bowed bass placed exactly on the line sounds late, because its beat lands after its start. Nudge slow-attack parts a little early and judge them by ear against the kick.

## Producer takeaway: anchor the beat, then let the rest lean

Lock the kick and backbeat first. They are the reference the body uses. Then let the bass, hats and percussion lean around them. For played parts, try partial quantize at 50 to 75 percent strength, which pulls notes toward the grid but keeps the direction of each one. For programmed parts, move a whole part by a consistent amount, by ear. When the track makes you move without looking at the screen, stop editing.

## References

- Danielsen, A., Nymoen, K., Anderson, E., Câmara, G. S., Langerød, M. T., Thompson, M. R., & London, J. (2019). Where is the beat in that note? Effects of attack, duration, and frequency on the perceived timing of musical and quasi-musical sounds. *Journal of Experimental Psychology: Human Perception and Performance*, 45(3), 402-418.
- Janata, P., Tomic, S. T., & Haberman, J. M. (2012). Sensorimotor coupling in music and the psychology of the groove. *Journal of Experimental Psychology: General*, 141(1), 54-75.
- Repp, B. H. (2005). Sensorimotor synchronization: A review of the tapping literature. *Psychonomic Bulletin & Review*, 12(6), 969-992.
`,
    seo: {
        title: 'Why groove lives between grid and body | VGP Studio',
        description: 'Why a session aligned by eye can feel smeared, how slow attacks shift the felt beat, and a clap test that corrects for your own timing bias.',
        keywords: ['groove pocket', 'perceived timing', 'quantization', 'beat making', 'rhythm', 'microtiming'],
    },
};
