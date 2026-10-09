import { BlogArticle } from '../blog-data';

export const post016: BlogArticle = {
    slug: 'the-density-ladder-producers-use-without-naming-it',
    title: 'Climb a density ladder from verse to chorus',
    excerpt: 'Count the parts a listener can pick out in each section, give every section its own step, and let new parts enter on the downbeat.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Listeners hear the step between sections more than the size of any one section, so each section needs its own rung.',
        'Count parts by what a listener can pick out: a stack playing one line fuses into one part, and past about three similar parts people undercount.',
        'Bring new parts in on the first downbeat of a section, because entries are noticed more easily than slow fades.',
    ],
    figures: {
        ladder: {
            type: 'arrangement',
            caption:
                'A density ladder. Each section adds at least one part on its first downbeat, the pad in the pre-chorus and the guitar and harmony in the chorus, so the density bar climbs in clear steps from intro to chorus instead of sliding up.',
            alt: 'Arrangement grid for intro, verse, pre-chorus and chorus. The intro has keys only, the verse adds drums, bass and vocal, the pre-chorus adds a pad, and the chorus adds guitar and harmony. The density bars climb in steps.',
            density: true,
            sections: [
                { label: 'Intro', short: 'In', bars: 4 },
                { label: 'Verse', bars: 8 },
                { label: 'Pre', bars: 4 },
                { label: 'Chorus', bars: 8 },
            ],
            layers: [
                { label: 'Keys', levels: [0.8, 0.6, 0.6, 0.7] },
                { label: 'Drums', levels: [0, 0.6, 0.7, 1] },
                { label: 'Bass', levels: [0, 0.7, 0.7, 1] },
                { label: 'Vocal', levels: [0, 0.8, 0.8, 1] },
                { label: 'Pad', levels: [0, 0, 0.6, 0.7], focus: true },
                { label: 'Guitar', levels: [0, 0, 0, 0.8], focus: true },
                { label: 'Harmony', levels: [0, 0, 0, 0.8], focus: true },
            ],
        },
        count: {
            type: 'scale',
            caption:
                'Huron (1989): musicians counting the voices in a texture of similar timbres were accurate up to three. From three to four voices their accuracy fell sharply, and most errors were counting too few.',
            alt: 'A number line of voices from 1 to 5. A range from 1 to 3 is marked counted well, a range from 4 to 5 is marked often undercounted, and a strong marker between 3 and 4 is labelled sharp drop.',
            min: 1,
            max: 5,
            unit: 'voices',
            ticks: [1, 2, 3, 4, 5],
            markers: [{ value: 3.5, label: 'Sharp drop', strong: true }],
            ranges: [
                { from: 1, to: 3, label: 'Counted well' },
                { from: 4, to: 5, label: 'Often undercounted' },
            ],
        },
    },
    quiz: [
        {
            q: 'Four synths play the same lead line in unison. How many parts do they add to your density count?',
            options: ['None', 'One', 'Two', 'Four'],
            answer: 1,
            why: 'Sounds that start together and move together fuse into one stream, so the listener hears one thicker lead. Count parts by what a listener can pick out, not by tracks.',
        },
        {
            q: 'Why bring a new part in on the first downbeat of a section instead of fading it in across the bars before?',
            options: [
                'Long fades cause clicks at the section edge',
                'A fade-in makes the whole section sound quieter',
                'Entries are noticed more easily than fades',
                'A slow fade-in makes the bus compressor pump',
            ],
            answer: 2,
            why: 'Huron (1989) found that voice entries were noticed more easily than exits. A part that arrives on the downbeat is an event. One that creeps in is barely noticed.',
        },
        {
            q: 'Your verse and chorus both count six parts. What is the quickest fix?',
            options: [
                'Add two more parts so the chorus has eight',
                'Turn the whole chorus group up by 3 dB',
                'Add a riser across the last verse bar',
                'Mute two of the six parts in the verse',
            ],
            answer: 3,
            why: 'Past about three similar parts, more parts are hard to tell apart. Lowering the verse creates the step without crowding the chorus.',
        },
    ],
    content: `## Hook: the static arrangement loop

You write a beat and build it up: drums, bass, chords, a lead. When you listen to the arrangement, the verse and the chorus feel the same size. You add another layer to the chorus and the mix gets muddy. You add a riser and the transition still feels flat. The song plays like one long loop with a vocal on top.

Nobody planned the density. Every part plays everywhere, so no section is bigger than any other.

## Why it matters: the ear measures the step

A listener hears the difference between sections more clearly than the size of any one section. If every section has the same parts playing, there is no climb, and the chorus cannot feel like the top of anything. Managing density means deciding which parts stand down in the verse so the chorus can be the highest rung.

The count that matters is the number of parts a listener could pick out and follow, which can be far smaller than the track count. Four synths playing one line in unison count as one. A bass and a kick that always hit together may count as one. A pad holding long chords under everything counts as one, and often as less.

::figure ladder

## Science model: grouping and the limits of counting

Bregman (1990) showed that the ear groups sound into streams by how the parts behave. Sounds that start at the same moment and change together are heard as one source. That is why a stack of layers playing one line fuses into one thick part, and why your density count should follow lines and roles, not tracks.

There is also a limit to how many parts a listener can keep apart. Huron (1989) played musicians polyphonic textures of similar timbres and asked them to count the voices. They were accurate up to three. When a fourth voice joined, accuracy fell sharply, and the usual mistake was counting too few. Different timbres make separation easier, but the lesson for arrangement holds: past a few parts, an extra part adds mass and masking more than it adds a line anyone follows.

::figure count

The same study found that voices entering were noticed more easily than voices leaving. That is the case for a ladder with clear steps. A part that enters on the downbeat of the chorus is an event the listener notices. A part that creeps in across the last bars of the verse is barely noticed, and neither is the section change it was meant to mark.

## DAW experiment: the density count test

1. Put markers at the start of the intro, verse, pre-chorus and chorus.
2. In each section, count the parts a listener could pick out. Count a stack playing one line as one part, and leave out muted or silent tracks.
3. Write the counts down in order. A ladder such as 1, 4, 5 and 7, as in the figure above, is a reasonable starting point, not a rule.
4. If two neighbouring sections have the same count, mute parts in the earlier one until it sits a step lower. Start with doubles and pads.
5. Move every entry to the first downbeat of its section. Delete fade-ins that start in the bars before.
6. Play from the middle of the verse into the chorus, then from the pre-chorus into the chorus.

Each boundary should now feel like a step up, and the chorus downbeat should land as the biggest step.

## Common mistake: giving every section the same weight

The most common mistake is letting every part play all the time. It feels like it keeps the energy high, but a section that never changes stops sounding big and starts sounding constant. It also leaves no room to climb.

The second mistake is a slow slide in density. If parts fade in gradually throughout the verse, the section boundaries lose their impact and the chorus arrives on a ramp instead of a step.

## Producer takeaway: assign each section a density step

Give every section its own rung on the ladder, and count rungs in parts a listener can hear, not tracks. Keep the verse lean, bring new parts in on downbeats, and let the chorus be the one place where everything plays.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Huron, D. (1989). Voice denumerability in polyphonic music of homogeneous timbres. *Music Perception*, 6(4), 361-382.
`,
    seo: {
        title: 'Climb a density ladder from verse to chorus',
        description: 'Count the parts a listener can pick out in each section, give each section its own step, and bring new parts in on the downbeat.',
        keywords: ['arrangement density', 'density ladder', 'auditory grouping', 'song structure', 'arrangement tips'],
    },
};
