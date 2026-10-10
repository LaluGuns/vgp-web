import { BlogArticle } from '../blog-data';

export const post007: BlogArticle = {
    slug: 'how-contrast-makes-a-chorus-feel-expensive',
    title: 'Expensive choruses start with contrast',
    excerpt: 'A chorus sounds expensive when it opens a space the verse kept closed. Keep the verse narrow and dry, and let width and reverb arrive with the chorus.',
    category: 'songwriting',
    publishedAt: '2026-06-03',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Width comes from differences between the left and right channels, and distance from the balance of direct sound and reverb.',
        'A verse that already fills the stereo field and the reverb leaves the chorus nowhere to open into.',
        'Keep the verse narrow and dry, open width and reverb on the chorus downbeat, then check the lift still works in mono.',
    ],
    figures: {
        verse: {
            type: 'stereo',
            title: 'Verse',
            caption: 'The verse kept narrow and dry. Everything sits close to the centre and the reverb is short and quiet, so the vocal feels near.',
            alt: 'Top-down view of the verse mix between two speakers. Vocal, kick and bass sit in the centre at the front. Guitar and keys sit a little left and right of centre. A short room reverb sits in the middle at the back, faded.',
            items: [
                { label: 'Vocal', pan: 0, depth: 0.08 },
                { label: 'Kick and bass', pan: 0, depth: 0.32 },
                { label: 'Guitar', pan: -0.25, depth: 0.48 },
                { label: 'Keys', pan: 0.25, depth: 0.64 },
                { label: 'Short room', pan: 0, depth: 0.85, width: 0.15, fade: 0.5 },
            ],
        },
        chorus: {
            type: 'stereo',
            title: 'Chorus',
            caption: 'The chorus opens the field. The guitars move to the edges, a wide reverb fills the back, and the vocal stays in front, now with space around it.',
            alt: 'Top-down view of the chorus mix. Vocal, kick and bass stay in the centre at the front. Two guitars sit hard left and hard right. Keys sit half right. A wide reverb spans most of the back of the field.',
            items: [
                { label: 'Vocal', pan: 0, depth: 0.08 },
                { label: 'Kick and bass', pan: 0, depth: 0.32 },
                { label: 'Guitar L', pan: -0.9, depth: 0.45 },
                { label: 'Guitar R', pan: 0.9, depth: 0.45 },
                { label: 'Keys', pan: 0.5, depth: 0.62 },
                { label: 'Wide reverb', pan: 0, depth: 0.88, width: 0.6 },
            ],
        },
    },
    quiz: [
        {
            q: 'You narrow the verse music to 50% width and open it to 100% on the chorus. Why check the transition in mono afterwards?',
            options: [
                'In mono the chorus gets louder than the verse',
                'Mono reveals phase problems in the lead vocal',
                'Width automation can click at the section line',
                'Mono shows if the parts lift it without width',
            ],
            answer: 3,
            why: 'On a mono speaker the width contrast disappears. If the chorus still lifts there, the arrangement is doing real work and the width is a bonus.',
        },
        {
            q: 'A mid/side widener on the master boosts the side signal. What happens on a mono speaker?',
            options: [
                'The centred lead vocal cancels and drops out',
                'The side cancels, so the wide parts drop back',
                'The whole mix gets a few dB louder in mono',
                'Nothing changes, since mono ignores the widening',
            ],
            answer: 1,
            why: 'In mono the left and right channels are added, and the side signal cancels out. Centred parts like the vocal stay; the parts that sounded wide lose level.',
        },
        {
            q: 'Which change makes the verse vocal sound closer without touching its fader?',
            options: [
                'Cutting its reverb send so it sounds drier',
                'Panning it hard to one side of the stereo mix',
                'Adding a longer reverb tail behind the vocal',
                'Widening it with a stereo doubler plugin',
            ],
            answer: 0,
            why: 'The balance of direct sound to reverb is one of the main cues for distance. Less reverb relative to the dry voice reads as nearer.',
        },
    ],
    content: `## Hook: the crowded chorus

You want your chorus to sound expensive. You double-track the rhythm guitars and add several layers of backing synths.

When you press play, the chorus sounds crowded. The guitars cover the vocal and the synths turn the midrange into a wall. You tried to buy size with layers and bought clutter instead. An expensive-sounding chorus comes from contrast more than size.

## Why it matters: a mix has edges

The stereo field has two edges, and there is only so much depth before everything sounds far away. If the verse is already wide and wet, it has used that space up. When the chorus arrives, there is nowhere left to open into.

Adding more tracks then makes things worse. The new parts land in the same space as the old ones, so they mask each other, and the extra energy drives the bus compressor and the limiter harder. The chorus gets denser, but it does not get bigger. What sounds expensive is a controlled change: the field is narrow and close in the verse and opens out at the chorus, so the listener feels the room expand.

::figure verse

::figure chorus

## Science model: width and distance are cues you can set

Your ear builds the stereo picture from differences between the two channels: level differences from panning, timing differences, and reverb that differs between left and right. The more the channels differ for a part, the wider and more spread it sounds. Distance has its own cues, and one of the strongest is the balance between the direct sound and its reverb. More reverb relative to the dry sound, and less high-frequency energy, reads as further away (Moore, 2012).

That means width and depth are settings you control per section. A dry vocal over a narrow verse sounds close and intimate. The same vocal with a wide reverb behind it and guitars at the edges sounds like it has moved into a bigger room.

Spreading the chorus parts also keeps them clear. Bregman (1990) describes location as one of the cues the brain uses to sort a mixture into separate sources, and a part panned away from the vocal tends to mask it less than the same part in the centre. So a wide chorus can carry more parts than a narrow one without turning into a wall, as long as the new parts move out of the vocal's way.

The contrast is what the listener notices. Hearing tends to respond to change more than to steady states, so a field that stays wide all song stops registering, while a field that opens at the chorus is heard as an event.

## DAW experiment: the spatial contrast A/B

1. Loop the last four bars of the verse into the first four bars of the chorus.
2. Route every music track except the lead vocal, kick, snare and bass to one group bus, and insert a stereo utility with a width control on it.
3. Automate the width to 50% for the verse and 100% from the chorus downbeat.
4. Automate the lead vocal's reverb send about 10 dB lower in the verse than in the chorus, so the verse vocal is dry and close.
5. Set up a long, wide reverb (around 2 seconds of decay) on its own return, and send to it only in the chorus.
6. Compare the group level before and after on a meter, and match it, so you are judging space rather than volume.
7. Fold the master to mono and play the transition again.

In stereo, the chorus should open out with the faders untouched. In mono, the width change disappears, so the chorus should still lift from its parts and register, and nothing important should vanish.

## Common mistake: a verse as wide as the chorus

The most common mistake is double-tracking and wide-panning everything in the verse to make it sound full. That leaves the chorus no room to grow, so the biggest moment of the song sounds the same size as the rest.

The second mistake is reaching for a stereo widener on the master. A mid/side widener raises the side signal, which cancels when the mix is folded to mono, so the parts it made wide drop in level on a mono speaker while the centred vocal stays. Delay-based wideners can also comb filter in mono. Width works best when you build it into specific parts and sections.

## Producer takeaway: control beats crowd

Expensive usually means controlled, not crowded. Keeping the verse dry and narrow is a taste choice that makes the wet, wide chorus feel like a reward. Before you add another layer, change the space instead: open the width or move a part out to the edge. A chorus can only sound wide if the verse started narrow.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
`,
    seo: {
        title: 'Expensive choruses start with contrast',
        description: 'Make a chorus sound bigger by opening a space the verse kept closed. Keep the verse narrow and dry, then bring in width and reverb at the chorus.',
        keywords: ['chorus contrast', 'stereo width', 'reverb depth', 'mono compatibility', 'arrangement tips'],
    },
};
