import { BlogArticle } from '../blog-data';

export const post004: BlogArticle = {
    slug: 'how-tension-makes-a-melody-ask-a-question',
    title: 'A melody needs a question mark',
    excerpt: 'Verse lines that all end on the home note close the story too early. End them on less settled notes and let the chorus deliver the tonic.',
    category: 'songwriting',
    publishedAt: '2026-06-03',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Listeners rate the tonic as the best fit in a key and the second and seventh among the weakest, so a phrase that stops on those notes sounds open.',
        'A verse whose lines all end on the tonic closes the story several times before the chorus has a chance to.',
        'End verse and pre-chorus lines on the second, fifth or seventh over a V chord, and save the tonic for the chorus downbeat.',
    ],
    figures: {
        stability: {
            type: 'bars',
            caption:
                'How well each note of a major scale fits after a key has been set up, rated by listeners from 1 to 7 (Krumhansl and Kessler, 1982). The bright bars are the notes of the tonic chord. The tonic fits best, the fifth and third come next, and the seventh fits least.',
            alt: 'Seven horizontal bars for the scale degrees of a major key. The tonic is longest at 6.35, then the fifth at 5.19, the third at 4.38, the fourth at 4.09, the sixth at 3.66, the second at 3.48 and the seventh at 2.88.',
            min: 1,
            max: 7,
            bars: [
                { label: '1 (tonic)', value: 6.35 },
                { label: '2', value: 3.48, dim: true },
                { label: '3', value: 4.38 },
                { label: '4', value: 4.09, dim: true },
                { label: '5', value: 5.19 },
                { label: '6', value: 3.66, dim: true },
                { label: '7', value: 2.88, dim: true },
            ],
        },
        ends: {
            type: 'notes',
            caption:
                'Two verse lines in C major. Line 1 ends on C, the tonic, over a C chord: a full stop. Line 2 used to end the same way (grey). Moved to D, the second degree, over a G chord, it stays open and points back to C.',
            alt: 'Piano roll of a four-bar melody with the chords C, C, A minor and G above it. The first phrase ends on a long C. The second phrase ends on a long D, with a grey C at the same time showing the old ending.',
            chords: [
                { at: 0, label: 'C' },
                { at: 4, label: 'C' },
                { at: 8, label: 'Am' },
                { at: 12, label: 'G' },
            ],
            notes: [
                { start: 0, length: 1, pitch: 64 },
                { start: 1, length: 1, pitch: 67 },
                { start: 2, length: 1, pitch: 64 },
                { start: 3, length: 1, pitch: 62 },
                { start: 4, length: 4, pitch: 60, label: '1' },
                { start: 8, length: 1, pitch: 64 },
                { start: 9, length: 1, pitch: 67 },
                { start: 10, length: 1, pitch: 69 },
                { start: 11, length: 1, pitch: 67 },
                { start: 12, length: 4, pitch: 60, label: 'was 1', muted: true },
                { start: 12, length: 4, pitch: 62, label: '2' },
            ],
        },
    },
    quiz: [
        {
            q: 'Your verse lines in C major all end on C. Which change does most to open up the last line?',
            options: [
                'Ending it on C an octave higher',
                'Putting a Cmaj7 chord under it',
                'Ending it on D over a G chord',
                'Doubling the last C with a synth',
            ],
            answer: 2,
            why: 'D is the second degree, one of the least settled notes in the key, and G is the V chord, which points back to C. An octave jump or a richer chord still leaves the melody on the tonic.',
        },
        {
            q: 'Why does a phrase that ends on the second degree carry tension into the next section?',
            options: [
                'It clashes with the chord, so it sounds wrong',
                'It moves the song into a new key for a moment',
                'It is rated the best fit after the tonic',
                'It sets up the tonic, then holds it back',
            ],
            answer: 3,
            why: 'The second degree sits a step from the tonic and is rated as one of the least finished notes. The listener expects the tonic next, and that expectation carries forward until it is met.',
        },
        {
            q: 'Where does a tonic ending cost the most momentum?',
            options: [
                'On the last note of verse line one',
                'On the last note of the pre-chorus',
                'On the first strong note of the chorus',
                'On the final note of the whole song',
            ],
            answer: 1,
            why: 'The pre-chorus exists to build toward the chorus. Resolving at its last note releases the tension one beat before the section that was meant to release it.',
        },
    ],
    content: `## Hook: the resolved verse

You write a melody for your verse. It starts on the root, moves up to the third and lands back on the root at the end of the second bar. You repeat the shape for the second half of the verse.

The melody is clean and stable, and the song does not move. The transition to the chorus has no pull, and the listener has no reason to lean forward. Each line has already answered its own question before the song asked one.

## Why it matters: every ending is a full stop

The tonic is the home note of the key. When a phrase lands on it, the ear hears a full stop. A verse whose four lines all end on the tonic is four full stops in a row, and the pre-chorus has to start building from nothing.

In a session this usually shows up as a pre-chorus that feels like a chore. The reflex fix is production: a drum fill, a riser, a crash on the downbeat. Those add energy, but they are working against a melody that keeps saying the story is over. The cheaper fix is to change a few notes.

## Science model: some notes sound finished

Krumhansl and Kessler (1982) measured this directly. Listeners heard a short passage that set up a key, then a single tone, and rated how well that tone fitted, from 1 to 7. In major keys the tonic was rated the best fit by a clear margin, followed by the fifth and the third. The fourth, sixth, second and seventh fitted less well, in that order, and notes outside the key least of all.

::figure stability

Huron (2006) argues that this sense of closure is learned. Phrases in Western music end on the tonic so often that the ear comes to expect it there, and a note that the ear does not expect at a phrase ending sounds unfinished. Meyer (1956) made the older point that a lot of the feeling in music comes from expectations that are set up and then delayed. A line that ends on the second or seventh degree sets up a strong expectation of the tonic and holds it back. The listener carries that expectation into the next section, waiting for it to be met.

The chord under the note matters too. The second and seventh degrees sit inside the V chord, so a line that ends on either over V sounds like a question that points home. The fifth over V sounds more like a comma: open, but at rest. Save the tonic over the I chord for the moment the song wants to answer, usually the chorus downbeat or the title.

::figure ends

## DAW experiment: the scale degree audit

1. Solo the verse melody, as MIDI or a pitch-edited vocal, with the chords playing.
2. Mark the last note of every phrase and write down its scale degree. In C major, C is 1, D is 2, G is 5 and B is 7.
3. Leave line 1 alone. Move the last note of line 2 from 1 to 5 (C to G), and the last note of line 4 from 1 to 2 (C to D).
4. Check the chord under each changed note. If it is still the I chord, change the last chord of that line to V (G in C major).
5. End the pre-chorus on 7 or 2 over a V chord, and hold the note into the bar line.
6. Make sure the first strong note of the chorus is the tonic, over the I chord, on the downbeat.
7. Play the old and new versions from the start of the verse into the chorus.

The new verse should lean forward into the pre-chorus, and the tonic at the chorus should feel like an answer. The old one sounds tidy, but it stops at the end of every line.

## Common mistake: the harmonic safety net

The most common mistake is expecting complex chords to fix a closed melody. Producers write a simple melody that keeps landing on the tonic, then add jazz extensions underneath to make it interesting. The melody is what most listeners follow, so if it still ends on the home note, the line still sounds finished.

The second mistake is resolving at the end of the pre-chorus. The pre-chorus exists to build toward the chorus. A tonic on its last note releases the tension one beat before the section that was meant to release it.

## Producer takeaway: spend the tonic carefully

Treat the tonic as a payoff. Keep one or two settled endings in the verse so the key stays clear, and leave the others open on the second, fifth or seventh. Let the pre-chorus end on a question over the V chord, then give the chorus downbeat the home note. When the answer finally arrives, it sounds like a reward.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Krumhansl, C. L., & Kessler, E. J. (1982). Tracing the dynamic changes in perceived tonal organization in a spatial representation of musical keys. *Psychological Review*, 89(4), 334-368.
- Meyer, L. B. (1956). *Emotion and Meaning in Music*. University of Chicago Press.
`,
    seo: {
        title: 'A melody needs a question mark',
        description: 'Verse lines that all end on the tonic close the story too early. End them on open scale degrees and let the chorus deliver the home note.',
        keywords: ['melodic tension', 'scale degrees', 'tonal stability', 'pre-chorus', 'vocal melody', 'songwriting tips'],
    },
};
