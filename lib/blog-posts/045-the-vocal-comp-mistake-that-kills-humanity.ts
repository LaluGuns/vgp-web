import { BlogArticle } from '../blog-data';

export const post045: BlogArticle = {
    slug: 'the-vocal-comp-mistake-that-kills-humanity',
    title: 'Comp vocals in phrases, not syllables',
    excerpt: 'A comp stitched word by word can be flawless and still feel cold. Build it from whole lines of one strong take and cut where the ear cannot follow the join.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'A sung line is one physical gesture, so level, tone and pitch move together across it. A word-by-word comp breaks that shape at every splice.',
        'A crossfade removes the click at a join. It does not remove a jump in tone or intensity between two takes.',
        'Start from the best whole take, swap whole lines, and cut just before hard consonants or in breaths.',
    ],
    figures: {
        arc: {
            type: 'curve',
            caption:
                'The intensity of one line, drawn as a shape. Sung in one take it rises to the big word and falls away. Built word by word from different takes, it jumps at every join, so the line no longer seems to be going anywhere.',
            alt: 'A curve across six words of a line. The solid curve for one take rises steadily to a peak on word five and falls on word six. The dashed curve for a word-by-word comp zigzags up and down from word to word.',
            x: ['Word 1', 'Word 2', 'Word 3', 'Word 4', 'Word 5', 'Word 6'],
            xShort: ['1', '2', '3', '4', '5', '6'],
            yLabel: 'Intensity',
            series: [
                { label: 'One take', values: [0.35, 0.45, 0.58, 0.74, 0.9, 0.55] },
                { label: 'Word-by-word comp', values: [0.55, 0.3, 0.72, 0.48, 0.86, 0.36], dashed: true },
            ],
        },
        workflow: {
            type: 'flow',
            caption: 'A comping order that keeps the performance. Most of the line comes from one take, and every swap is a whole line unless a smaller one is unavoidable.',
            alt: 'Five steps: record full passes, pick a base take by feel, swap whole lines, cut at consonants or breaths, play it top to bottom. An arrow from the last step back to swapping lines is labelled "swap again".',
            steps: [
                { label: 'Record full passes' },
                { label: 'Pick a base take by feel', focus: true },
                { label: 'Swap whole lines', focus: true },
                { label: 'Cut at consonants or breaths' },
                { label: 'Play it top to bottom' },
            ],
            loop: { to: 2, label: 'Swap again' },
        },
    },
    quiz: [
        {
            q: 'Where is the safest place to cut between two vocal takes?',
            options: [
                'Halfway through a long vowel, where it is steady',
                'On the downbeat, where the drums hide the join',
                'On the loudest note, where it masks the join',
                'Just before a hard consonant, or in a breath',
            ],
            answer: 3,
            why: 'A plosive starts with a brief closure, a moment of near silence, and a breath is a natural break. A cut in a vowel exposes any change in pitch or tone between the takes.',
        },
        {
            q: 'A crossfade at a splice hides the click. What does it not hide?',
            options: [
                'A pop from a cut away from a zero crossing',
                'A jump in tone or intensity between takes',
                'A tiny gap of silence at the edit point',
                'A small step in DC offset between regions',
            ],
            answer: 1,
            why: 'The crossfade only smooths the join itself. If the two takes differ in colour, distance or energy, that difference is still there on either side of it.',
        },
        {
            q: 'A phrase has the best delivery of the session, but one held note is slightly flat. What is the better move?',
            options: [
                'Keep the phrase and correct that one note',
                'Swap in that note from an in-tune weaker take',
                'Record the phrase again until it is in tune',
                'Copy the same phrase in from the first chorus',
            ],
            answer: 0,
            why: 'Pitch on one note can be corrected afterwards. The delivery of the phrase cannot be added later, so keep the take that has it.',
        },
    ],
    content: `## Hook: the perfect comp that feels cold

Comping in a DAW makes it easy to slice a vocal into tiny pieces. Record ten takes, stack them in comp lanes, and pick the best word or even the best syllable from each. The result has every note in tune and every word clean.

Then it plays in the mix and the performance feels cold. It sounds like a sampled instrument playing the melody, not a person telling you something.

## Why it matters: a line is one gesture

Singing a line is one physical gesture. Breath pressure builds, the voice gets brighter as it gets louder, and the singer leans into the big word and pulls back on the soft one. All of that changes together across the phrase, and that shared movement is what gives a line its arc.

Takes recorded minutes apart differ in all of it. The singer is in a slightly different mood, a little closer to the mic or further away, fresher or more tired. Stitch one line from five takes and those differences meet at every join. A crossfade removes the click, but it does not remove a jump in level, tone or intent. Listeners rarely pick out an edit as an edit. They hear a singer who seems to change their mind on every word.

::figure arc

## Science model: what travels with a take

Several things belong to a take and do not survive being cut into pieces:

- **Level and arc.** The line rises and falls in one shape.
- **Tone.** Louder singing is brighter, and moving closer to a directional mic adds bass through the proximity effect, so the same word from another take can have a different colour.
- **Pitch path.** The way a singer slides from one note into the next belongs to that take. A cut between notes can join an approach from one take to a landing from another.
- **Breath and timing.** A phrase is timed around the breath before it.

The ear is quick to notice the tone changes. In auditory scene analysis, sounds that change smoothly tend to be heard as one continuing source, while an abrupt change in timbre is a cue that a new sound has started (Bregman, 1990). A word whose colour jumps away from its neighbours can stand out even when its pitch and level match.

This also tells you where to cut. A plosive such as p, t or k starts with a brief closure, a moment of near silence, so a join placed just before it is hard to hear. An s is noise, so a short crossfade inside it hides well, and a breath is a natural break. A cut in the middle of a vowel exposes every difference between the two takes.

## DAW experiment: comp against one take

1. Choose one section and listen to every full take without looking at waveforms or pitch graphs. Pick the one with the best delivery, even if it has a few mistakes.
2. Make that take the base of a new comp lane.
3. Mark only real problems: a wrong word, a pitch miss too large to correct, a noise.
4. Replace each marked line with the same whole line from one other take. Where a smaller swap is unavoidable, cut just before a hard consonant or in a breath and use a crossfade of about 5 to 10 ms.
5. Bounce the result and compare it with your word-by-word comp, with no tuning or compression on either, at matched level.
6. Listen closely to the last word of each line and to the entry into the chorus.

The base-take comp should hold together as one performance, with lines that build and land. The word-by-word comp may be cleaner on paper and still sound as if it has no direction.

## Common mistake: comping for pitch first

The most common mistake is choosing pieces by pitch accuracy. A great, emotional phrase gets cut up because one note is slightly flat, and the note is replaced with an in-tune one from a weaker take. Pitch on one note can be corrected afterwards. The delivery of a phrase cannot be added later.

The second mistake is comping with your eyes. Pitch graphs and waveforms show you which take is tidy, not which one is convincing. Choose by ear first, then look.

## Producer takeaway: start from the best whole take

Comp for delivery and meaning first, then fix pitch on the take you kept. Use whole lines from as few takes as you can, and keep at least two consecutive lines from one take where possible, so the breathing and tone carry through. Cut before hard consonants or in breaths, never in the middle of a vowel. Mike Senior's chapter on comping in *Mixing Secrets for the Small Studio* is a good companion to this workflow.

::figure workflow

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'Comp Vocals in Phrases, Not Syllables | VGP',
        description: 'Word-by-word vocal comps break the shape of a performance. Learn why takes do not splice cleanly and how to comp from whole lines of one strong take.',
        keywords: ['vocal comping', 'vocal editing tips', 'comp lanes', 'vocal tracking', 'crossfades', 'music production workflow'],
    },
};
