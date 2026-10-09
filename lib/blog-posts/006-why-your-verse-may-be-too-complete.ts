import { BlogArticle } from '../blog-data';

export const post006: BlogArticle = {
    slug: 'why-your-verse-may-be-too-complete',
    title: 'The verse is stealing the chorus',
    excerpt: 'A verse that ends on the home chord with its story told leaves the chorus nothing to do. Leave it open and the chorus becomes the answer.',
    category: 'songwriting',
    publishedAt: '2026-06-03',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'A verse that cadences on the I chord with its story told gives the listener the payoff before the chorus arrives.',
        'Ending the verse on V sets up a strong expectation of I, and the chorus gets the job of delivering it.',
        'Hold back the title, the hook sound and the ad-libs so the chorus has something new to give.',
    ],
    figures: {
        tension: {
            type: 'curve',
            caption:
                'A sketch, not a measurement. A verse that cadences on I releases its tension a bar before the chorus, so the chorus has nothing to resolve. Ending on V holds the tension until the chorus downbeat delivers I.',
            alt: 'Two lines from the start of the verse to the chorus downbeat. A solid line for a verse ending on V rises to a peak at the last bar and drops at the chorus. A dashed line for a verse ending on I falls at the last bar and rises a little at the chorus.',
            x: ['Verse starts', 'Halfway', 'Last bar', 'Chorus downbeat'],
            xShort: ['Start', 'Half', 'Last bar', 'Chorus'],
            yLabel: 'Tension',
            series: [
                { label: 'Verse ends on V', values: [0.3, 0.45, 0.85, 0.25] },
                { label: 'Verse ends on I', values: [0.3, 0.45, 0.15, 0.3], dashed: true },
            ],
        },
        payout: {
            type: 'arrangement',
            caption:
                'The premature payout. The synth hook and the ad-libs already play in the verse, so the chorus adds almost nothing and its density barely rises. Move those two rows so they start at the chorus.',
            alt: 'Arrangement grid for a verse and a chorus. Drums, bass, chords, lead vocal, synth hook and ad-libs all play in both sections at similar levels, and the density bar is nearly the same height for both.',
            density: true,
            sections: [
                { label: 'Verse', bars: 8 },
                { label: 'Chorus', bars: 8 },
            ],
            layers: [
                { label: 'Drums', levels: [0.75, 0.85] },
                { label: 'Bass', levels: [0.7, 0.8] },
                { label: 'Chords', levels: [0.7, 0.75] },
                { label: 'Vocal', levels: [0.85, 0.9] },
                { label: 'Synth hook', focus: true, levels: [0.8, 0.8] },
                { label: 'Ad-libs', focus: true, levels: [0.6, 0.6] },
            ],
        },
    },
    quiz: [
        {
            q: 'Your verse ends on a C chord in C major, right before a chorus that starts on C. What is the simplest fix?',
            options: [
                'Push the last verse bar up 2 dB',
                'End the verse on G, which is V',
                'Turn the last C into a Cmaj7',
                'Start the chorus on the F chord',
            ],
            answer: 1,
            why: 'G is the V chord in C. It points strongly back to C, so the listener waits for the chorus to deliver the home chord instead of hearing it a bar early.',
        },
        {
            q: 'Why does a verse that ends on V make the chorus feel necessary?',
            options: [
                'V takes the song into a new key for a bar',
                'V is the least pleasant chord in the key',
                'V predicts I, and the chorus delivers it',
                'V clashes with the melody until the chorus',
            ],
            answer: 2,
            why: 'V to I is one of the most expected moves in tonal music. Ending on V sets up that expectation and leaves it open, and the chorus downbeat resolves it.',
        },
        {
            q: 'Your best synth hook first plays in verse one. What does this cost the chorus?',
            options: [
                'Its new element, as the hook is already known',
                'Nothing, as long as the chorus is mixed louder',
                'Its clarity, because the synth masks the vocal',
                'Its key, because the hook already sets the tonic',
            ],
            answer: 0,
            why: 'A chorus feels like an arrival partly because something new arrives with it. If the hook sound is already familiar from the verse, the chorus has to rely on level and layering instead.',
        },
    ],
    content: `## Hook: the satisfying verse

You spend hours on your verse. You write a beautiful chord progression and a vocal melody that opens with a question and settles on the home chord at the end of the eighth bar.

Played from the top, the verse feels like a complete song. Then the chorus arrives and sounds flat and unnecessary. The listener got the payoff in the first thirty seconds. Your verse is stealing the chorus.

## Why it matters: a finished verse leaves the chorus nothing to do

A song works as a sequence, where each section sets up the next. If the verse wraps up its harmony, its melody and its story, the chorus arrives as a second song instead of an answer.

In a session the symptom is a chorus you keep thickening because it feels small, when the problem is eight bars earlier. The verse resolved, so the chorus has no tension to release, and no amount of layering replaces that.

## Science model: cadences close, V points forward

In tonal music, a phrase that ends on the I chord, especially through V to I, is heard as closed. A phrase that ends on V is heard as open. Huron (2006) explains this through learned expectation: V is followed by I so often that hearing V makes the listener predict I. Meyer (1956) argued that much of the feeling in music comes from expectations that are set up and then delayed. A verse that ends on V sets up the strongest expectation in the key and leaves it hanging. The chorus downbeat, on I, resolves it.

::demo cadence

Huron's ITPRA theory also describes a tension response before an expected event: as the moment approaches, the listener's attention and arousal rise in preparation. A verse ending on V gives that response somewhere to go. A verse ending on I spends it a bar early.

::figure tension

You will often read that this works because of the Zeigarnik effect, the claim that people remember unfinished tasks better than finished ones. A 2025 meta-analysis found no reliable memory advantage for unfinished tasks, only a general tendency to go back to them (Ghibellini and Meier, 2025). You do not need it here. Musical expectation explains the pull on its own.

The same logic applies to the lyric. If the last verse line already states the main idea of the song, the chorus has to repeat it rather than reveal it.

## DAW experiment: the open verse

1. Loop the last four bars of the verse into the first bar of the chorus.
2. Find the last chord of the verse. If it is I (C in C major), change it to V (G), or play Gsus4 for two beats and resolve to G for the last two.
3. Change the last melody note of the verse to 2 or 7 (D or B in C major), which both sit inside the G chord.
4. Check that the chorus starts on the I chord, so the resolution lands on its downbeat.
5. Read the last verse line on its own. If it states the title or the main idea, move that line into the chorus and write a verse line that sets it up: a question, a situation or a detail.
6. If an instrumental hook or an ad-lib first appears in the verse, mute it there so it first appears in the chorus.
7. Play the old and new versions back to back from the start of the verse.

The new verse should pull toward the chorus, and the I chord and the title should land as the answer. The old version sounds finished a bar too soon.

## Common mistake: the premature payout

The most common mistake is giving away the best sound or the best ad-lib in the verse. A great sound shows up early in the writing process, so it ends up in the first section. When the chorus arrives, there is nothing fresh left to introduce.

::figure payout

The second mistake is resolving the lyric story in the verse. If the first verse explains the whole message, the chorus can only restate it.

## Producer takeaway: a verse is a runway

A verse should move toward the chorus, not finish the record early. Keep the end of the progression open, usually on V, and avoid landing on the home chord until the chorus downbeat. Save the title, the hook sound and the best ad-libs for the chorus, and give the chorus its job: to answer what the verse asked.

## References

- Ghibellini, R., & Meier, B. (2025). Interruption, recall and resumption: A meta-analysis of the Zeigarnik and Ovsiankina effects. *Humanities and Social Sciences Communications*, 12, 962. https://doi.org/10.1057/s41599-025-05000-w
- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Meyer, L. B. (1956). *Emotion and Meaning in Music*. University of Chicago Press.
`,
    seo: {
        title: 'The verse is stealing the chorus',
        description: 'A verse that ends on the home chord with its story told leaves the chorus nothing to do. End it on V and hold back the hook so the chorus answers it.',
        keywords: ['verse writing', 'half cadence', 'song structure', 'musical expectation', 'songwriting tips'],
    },
};
