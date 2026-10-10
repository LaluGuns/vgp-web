import { BlogArticle } from '../blog-data';

export const post054: BlogArticle = {
    slug: 'why-depth-is-a-contrast-illusion',
    title: 'Depth needs contrast to exist',
    excerpt: 'Reverb on everything flattens a mix. Depth comes from contrast: a dry, bright, close part next to quieter, darker and wetter parts further back.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Depth only exists by comparison, so a mix needs a dry, close anchor before anything can sound far away.',
        'Distance has several cues at once: lower level, less direct sound against the room, and a darker tone.',
        'Move background parts back with all the cues together, and keep the lead dry and bright.',
    ],
    figures: {
        stage: {
            type: 'stereo',
            title: 'Front to back',
            caption:
                'A depth map seen from above. The lead vocal is dry and bright at the front. Each row further back is a little quieter, darker and wetter, and the difference between the rows is what reads as depth.',
            alt: 'Top-down view between two speakers. The lead vocal sits centre front, kick and snare just behind it, guitar and keys left and right in the middle, and a wide, faded pad at the back.',
            items: [
                { label: 'Lead vocal', pan: 0, depth: 0.08 },
                { label: 'Kick and snare', pan: 0, depth: 0.3 },
                { label: 'Guitar', pan: -0.6, depth: 0.5, fade: 0.25 },
                { label: 'Keys', pan: 0.6, depth: 0.55, fade: 0.3 },
                { label: 'Pad', pan: 0, depth: 0.9, width: 0.8, fade: 0.55 },
            ],
        },
        arrivals: {
            type: 'signal',
            caption:
                'What reaches you from a close and a distant source in the same room. The room\'s reverberant level is about the same in both. Moving away mostly lowers the direct sound and shortens the gap before the room arrives.',
            alt: 'Two level plots over time. In the close source, a tall direct spike is followed by a clear gap and then a lower reverb tail. In the distant source, the direct spike is much smaller and the tail starts almost at once at nearly the same height.',
            rows: [
                {
                    label: 'Close source',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', label: 'Direct sound', points: [[0, 0], [0.04, 0], [0.045, 0.95], [0.08, 0.05], [0.12, 0]] },
                        { kind: 'envelope', label: 'Room', dashed: true, points: [[0, 0], [0.17, 0], [0.18, 0.32], [0.35, 0.2], [0.6, 0.09], [0.85, 0.03], [1, 0.01]] },
                    ],
                },
                {
                    label: 'Distant source',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', label: 'Direct sound', points: [[0, 0], [0.04, 0], [0.045, 0.36], [0.08, 0.02], [0.12, 0]] },
                        { kind: 'envelope', label: 'Room', dashed: true, points: [[0, 0], [0.06, 0], [0.07, 0.3], [0.25, 0.2], [0.5, 0.09], [0.75, 0.03], [1, 0.01]] },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A singer moves from 2 m to 4 m away in an open field. How much does the direct sound drop?',
            options: ['About 3 dB', 'About 6 dB', 'About 9 dB', 'About 12 dB'],
            answer: 1,
            why: 'Sound pressure falls with 1/r, so doubling the distance lowers the level by 20 × log10(2), about 6 dB.',
        },
        {
            q: 'In a room, why does a distant source sound wetter than a close one?',
            options: [
                'The reverb gets louder as the source moves away from you',
                "A distant source excites more of the room's reflections",
                'Air absorbs the highs, and the dull tone reads as reverb',
                'The direct sound falls while the room level holds steady',
            ],
            answer: 3,
            why: 'The reverberant level in a room changes little with position, but the direct sound falls with distance, so the ratio of direct to reverberant sound drops.',
        },
        {
            q: 'Every track goes to the same reverb at the same send level. What happens to depth?',
            options: [
                'All parts land at one distance, with no front or back',
                'The mix gains depth in step with the level of the send',
                'Depth grows, since every part now has its own space',
                'The mix gets wider, while the depth stays the same',
            ],
            answer: 0,
            why: 'Depth is a difference between parts. The same treatment on everything puts the whole band in one place, just further away.',
        },
    ],
    content: `## Hook: reverb on every part

You finish a mix and it feels like a flat sheet of paper, with everything right in front of the listener's face. To get depth you put reverb on the vocal, the guitars, the synths and the drums, and turn up the sends to push some parts back. Instead of a deep mix you get a washed-out one. The track feels smaller, and every part is buried in the same cloud of reflections.

Depth comes from contrast: you can only hear that something is far away if something else is clearly close. If every part is wet, there is no dry foreground to compare against, and the whole mix collapses onto one plane.

## Why it matters: depth is a comparison

A listener judges distance in a mix by comparison. The lead that is dry, bright and loud sits in front because the parts around it are quieter, darker and wetter. Remove that difference and the brain has nothing to rank.

::figure stage

The same reverb on everything does not create depth. It moves the whole band into one room at one distance. To build front and back, the parts need different treatments, and at least one part has to stay close.

## Science model: the cues the ear uses for distance

Several acoustic cues tell the ear how far away a source is, and they work together (Zahorik, Brungart and Bronkhorst, 2005).

The first is level. In open air, sound pressure falls with distance $r$ as $1/r$, so moving from distance $r_1$ out to $r_2$ lowers the level by:

$$\\Delta L = 20 \\log_{10} \\frac{r_2}{r_1}$$

At twice the distance, the direct sound is about 6 dB lower. Level alone is a weak cue, though, because you rarely know how loud the source was to begin with.

The second is the balance between direct and reflected sound. In a room the reverberant level stays roughly the same wherever the source is, while the direct sound keeps falling as the source moves away. A close source is mostly direct sound; a distant one is mostly room. The time gap between the direct sound and the first reflections also shrinks as the source moves away, which is why pre-delay helps keep a part forward.

::figure arrivals

The third is tone. A distant source sounds darker, mostly because more of what reaches you is reverberant sound, which has bounced off surfaces that soak up high frequencies. Air takes off a noticeable amount of top end only over longer distances. Transients also soften, because the reflections smear the sharp start of each sound.

Hear how pre-delay, decay and level move one melody forward and back.

::demo reverb

## DAW experiment: build a front-to-back stage

Use a section where at least four parts play together.

1. Pick the one part that should touch the listener, usually the lead vocal. Remove its reverb and delay sends for this test and keep it in the centre.
2. Create a reverb return with a room or hall, 100% wet, about 1.8 s decay and 0 ms pre-delay.
3. Pick two or three background parts, such as a pad, backing vocals or a rhythm guitar. Put a low-pass filter at 8 kHz, 12 dB per octave, on each.
4. Lower each of those faders by 3 dB.
5. Send them to the reverb. Raise each send until the part sits behind the vocal, and give the part you want furthest back, often the pad, the most.
6. Mute the reverb return and listen, then unmute it and bypass the low-pass filters instead.

With only one cue, the parts either get washed out or simply quieter. With level, tone and reverb working together, they settle into clear rows behind the dry vocal.

## Common mistake: one reverb, one send level

The most common error is sending every track to the same reverb at the same level. It can glue a sterile track together, but it does not create depth. It places the whole band in the same spot.

The second is giving the front part no pre-delay. If the lead vocal needs a tail, delay the reverb by 30 to 50 ms so the dry start of each word arrives on its own before the room. The vocal keeps its place at the front, as the [lesson on reverb and emotional distance](/blog/why-reverb-can-push-emotion-forward-or-backward) explains.

## Producer takeaway: protect your dry anchors

A deep mix needs dry parts. Do not be afraid of a bone-dry vocal or a dry drum transient: they are what gives the track punch, and they are the reference that makes everything else sound far away.

Check the result at a very low monitoring level. If the lead still sits in front of the background wash, the depth cues are balanced. If the reverb swallows it, pull the reverb returns down before you reach for more processing.

## References

- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
- Zahorik, P., Brungart, D. S., & Bronkhorst, A. W. (2005). Auditory distance perception in humans: A summary of past and present research. *Acta Acustica united with Acustica*, 91(3), 409-420.
`,
    seo: {
        title: 'Depth needs contrast to exist | VGP Studio',
        description: 'Reverb on everything flattens a mix. How level, direct-to-reverberant ratio and tone tell the ear distance, and how to build a front-to-back stage.',
        keywords: ['mix depth', 'distance cues', 'direct to reverberant ratio', 'reverb pre-delay', 'inverse square law', 'front to back'],
    },
};
