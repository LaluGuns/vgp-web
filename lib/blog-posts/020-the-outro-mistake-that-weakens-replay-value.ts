import { BlogArticle } from '../blog-data';

export const post020: BlogArticle = {
    slug: 'the-outro-mistake-that-weakens-replay-value',
    title: 'End the song before the hook wears out',
    excerpt: 'Listeners remember a song by its peak and its end, not its length. Cut the extra chorus repeats and choose a cold ending or a short fade on purpose.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Listeners remember a song by its overall impression, its peak and its end, and how long a passage lasts barely changes the memory.',
        'A long outro of unchanged repeats adds time without adding anything to remember, and it makes the least intense moment the last one.',
        'Cut the extra repeats, then choose between a cold ending at full energy and a short fade that leaves the groove running in the listener\'s head.',
    ],
    figures: {
        endings: {
            type: 'signal',
            caption:
                'A sketch of three endings on the same time scale. The long fade spends its last stretch getting quieter on material already heard. The short fade leaves a full chorus and lets go quickly. The cold ending stops on a final hit with a short tail.',
            alt: 'Three level plots. The first holds a level, then falls in a long straight line to silence at the end. The second holds the level longer and falls quickly to silence. The third holds the level, spikes on a final hit, and decays to silence within a short tail.',
            rows: [
                {
                    label: 'Long fade',
                    unipolar: true,
                    marks: [{ t: 0.3, label: 'Fade starts' }],
                    traces: [{ kind: 'envelope', points: [[0, 0.85], [0.3, 0.85], [1, 0.02]] }],
                },
                {
                    label: 'Short fade',
                    unipolar: true,
                    marks: [{ t: 0.45, label: 'Fade starts' }],
                    traces: [{ kind: 'envelope', points: [[0, 0.85], [0.45, 0.85], [0.62, 0], [1, 0]] }],
                },
                {
                    label: 'Cold ending',
                    unipolar: true,
                    marks: [{ t: 0.5, label: 'Last hit' }],
                    traces: [
                        {
                            kind: 'envelope',
                            points: [[0, 0.85], [0.49, 0.85], [0.5, 1], [0.51, 0.35], [0.55, 0.15], [0.6, 0.04], [0.62, 0], [1, 0]],
                        },
                    ],
                },
            ],
        },
        outro: {
            type: 'arrangement',
            caption:
                'A long outro. After the final chorus, two repeats play the same parts at the same density and the vocal repeats the hook into the fade, which lowers everything together. The peak of the song is already over when the last third begins.',
            alt: 'Arrangement grid for bridge, final chorus, two repeats and a fade. Density is low in the bridge, highest in the final chorus, stays flat through both repeats, and drops in the fade.',
            density: true,
            sections: [
                { label: 'Bridge', short: 'Br', bars: 8 },
                { label: 'Final chorus', short: 'Final', bars: 8 },
                { label: 'Repeat', short: 'Rep', bars: 8 },
                { label: 'Repeat', short: 'Rep', bars: 8 },
                { label: 'Fade', bars: 8 },
            ],
            layers: [
                { label: 'Drums', levels: [0.3, 1, 1, 1, 0.4] },
                { label: 'Bass', levels: [0, 1, 1, 1, 0.4] },
                { label: 'Chords', levels: [0.7, 0.8, 0.8, 0.8, 0.35] },
                { label: 'Vocal', levels: [0.7, 1, 1, 1, 0.4], focus: true },
                { label: 'Harmony', levels: [0, 0.8, 0.8, 0.8, 0.3] },
            ],
        },
    },
    quiz: [
        {
            q: 'To end the song, you add two more repeats of the final chorus under a slow master fade, which makes it 40 seconds longer. What do the memory studies predict for how intense listeners remember it?',
            options: [
                'No higher: the length barely counts and the end got quieter',
                'Higher, because listeners spend longer inside the hook',
                'It rises, since the fade keeps the pulse going past the end',
                'Each repeat adds a rise, so the memory of the song grows',
            ],
            answer: 0,
            why: 'Rozin and colleagues found that the length of a passage made little difference to remembered intensity, while the peak and the end weighed heavily. The repeats add time, the fade makes the quietest moment the last one, and a repeat at the same level is not a rise above what came before.',
        },
        {
            q: 'You want the groove of a track to feel as if it carries on after the file ends, without the outro dragging. Which ending fits both the tapping study and the memory studies in this lesson?',
            options: [
                'A cold ending on one last hit, so the beat stays in their head',
                'Any ending, since tapping stopped at the last beat either way',
                'A long fade over three repeats, so the groove plays for longer',
                'A short fade from a full chorus, so the pulse runs past the end',
            ],
            answer: 3,
            why: 'In the tapping study by Kopiez and colleagues, listeners kept tapping after a fade-out had ended and stopped before the last beat of an arranged ending. A long fade over three repeats is also a fade, but the memory studies found that extra length barely counts, so the repeats only make the quietest stretch the last impression.',
        },
        {
            q: 'Your fade starts halfway through the final chorus, before the last hook line. What is the problem?',
            options: [
                'It breaks the pulse the listener feels',
                'The limiter pumps as the level falls away',
                'It turns the peak down before it lands',
                'Fades sound less finished than cold ends',
            ],
            answer: 2,
            why: 'The peak is one of the moments listeners remember most. A fade that starts before the hook has landed turns the strongest moment down.',
        },
    ],
    content: `## Hook: the long, dragging fade-out

You finish the final chorus. To end the song, you copy the chorus loop and let it repeat. Then you draw a thirty-second fade across the master. The drums keep playing, the synths ride along, and the vocal repeats the hook until the sound disappears. By the time it ends, the energy has drained away and the song has said nothing new for a long time.

You spent the last part of the song letting it wind down instead of finishing it.

## Why it matters: the end is one of the moments listeners remember

The end of a song is one of the moments a listener uses to judge it. Research has not shown that any one kind of ending makes people press replay. It has shown what listeners remember: the strongest moment and the last one weigh heavily, and the length of a passage barely counts. An outro of unchanged repeats adds time without adding anything to remember, and it makes the quietest, least eventful part of the song the final impression.

::figure outro

That does not make fades wrong. A fade and a cold ending do different things, and the mistake is choosing neither: letting the song repeat until the fader runs out.

## Science model: peaks, ends and the pulse that keeps going

Rozin, Rozin and Goldberg (2004) had listeners press a pressure-sensitive button to show how intense music felt from moment to moment, then asked later how intense each piece had been. The remembered intensity leaned on the peak, the final moments and the moments more intense than the ones just before. How long a passage lasted made little difference. Schäfer, Zimmermann and Sedlmeier (2014) tested the same question and found that the overall average impression mattered most, with the peak and the end adding substantially on top. Either way, a long, flat outro does not help the memory, and it lowers the average.

Fades have their own effect. Kopiez, Platz, Müller and Wolf (2015) played listeners three versions of one pop song and asked them to tap along for as long as they felt the pulse. With the fade-out, listeners kept tapping after the recording had ended. With an arranged ending, they stopped before the last beat. A fade leaves the groove running in the listener's head. A cold ending closes it.

So a fade suits a song whose groove is the point and should feel like it goes on. A cold ending suits a song that should finish on its strongest moment. Both work best when they start from a full section, not from the third identical repeat.

::figure endings

## DAW experiment: the sudden outro cut test

1. Find the final chorus and everything after it.
2. If the final chorus repeats four times, cut the last two repeats.
3. End every part on the downbeat after the last chorus with one final hit: kick, bass and a chord together.
4. Route the reverb and delay returns to one group and automate the group down to silence over about half a bar after the final hit.
5. Bounce this as the cold ending.
6. Make a second version: keep the shortened chorus and fade the master over its last four bars instead.
7. Play both, and the original long fade, starting each from the bridge.

The cold ending should stop at full energy. The short fade should keep the groove going for a moment after the sound stops. The long fade will spend its last stretch on a loop you have already heard several times.

## Common mistake: the endless repetition trap

The most common mistake is letting the outro run because ending feels risky. Each extra repeat makes the song longer and the last impression weaker, and nothing in it is new.

The second mistake is starting a fade too early. If the fade begins before the last hook line has landed, it turns down the peak of the song, which is the moment the listener was most likely to remember.

## Producer takeaway: end before the hook loses its shape

Leaving early is a production decision. Cut the repeats that add nothing, decide whether the song should stop or drift away, and make that choice from a full section while the hook is still strong.

## References

- Kopiez, R., Platz, F., Müller, S., & Wolf, A. (2015). When the pulse of the song goes on: Fade-out in popular music and the pulse continuity phenomenon. *Psychology of Music*, 43(3), 359-374.
- Rozin, A., Rozin, P., & Goldberg, E. (2004). The feeling of music past: How listeners remember musical affect. *Music Perception*, 22(1), 15-39.
- Schäfer, T., Zimmermann, D., & Sedlmeier, P. (2014). How we remember the emotional intensity of past musical experiences. *Frontiers in Psychology*, 5, 911.
`,
    seo: {
        title: 'End the song before the hook wears out',
        description: 'Listeners remember a song by its peak and its end, not its length. Cut extra outro repeats and choose a cold ending or a short fade on purpose.',
        keywords: ['song outro', 'song endings', 'fade-out', 'peak-end', 'arrangement tips'],
    },
};
