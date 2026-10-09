import { BlogArticle } from '../blog-data';

export const post003: BlogArticle = {
    slug: 'why-repetition-becomes-addictive-instead-of-boring',
    title: 'Repetition sticks when one detail changes',
    excerpt: 'Exact repetition builds a hook, then wears thin. One small change late in the pattern pulls the ear back in and makes the return feel earned.',
    category: 'songwriting',
    publishedAt: '2026-06-03',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Repetition is what makes a hook learnable, and a repeat the listener saw coming tends to feel good.',
        'A pattern that never changes loses its pull, because the response to an unchanging sound fades.',
        'Change one detail late in the pattern, such as the final note of the third pass, then return to the original.',
    ],
    figures: {
        response: {
            type: 'curve',
            caption:
                'A sketch of the idea, not a measurement. With exact copies the response tends to fade pass by pass. One changed detail on the third pass draws it back, and the fourth pass lands as a return.',
            alt: 'Two lines over four passes of a hook. A dashed line for exact copies falls steadily. A solid line for a changed third pass stays high, peaks at pass three and stays high at pass four.',
            x: ['Pass 1', 'Pass 2', 'Pass 3', 'Pass 4'],
            yLabel: 'Response',
            series: [
                { label: 'Third pass changed', values: [0.7, 0.72, 0.86, 0.8] },
                { label: 'Exact copies', values: [0.7, 0.6, 0.44, 0.32], dashed: true },
            ],
            marks: [{ at: 2, label: 'Change' }],
        },
        loop: {
            type: 'flow',
            caption:
                'How a hook keeps its pull. Each confirmed prediction is a small reward, exact repeats wear that reward down, and a small change that still fits resets the cycle.',
            alt: 'Four boxes with arrows: hear the line, correct prediction feels good, exact repeats make the response fade, one detail changes as a small surprise. An arrow loops from the last box back to the second, labelled back to the original.',
            steps: [
                { label: 'Hear the line', note: 'The first pass sets the pattern' },
                { label: 'Correct prediction feels good' },
                { label: 'Exact repeats', note: 'The response fades' },
                { label: 'One detail changes: a small surprise', focus: true },
            ],
            loop: { to: 1, label: 'Back to the original' },
        },
    },
    quiz: [
        {
            q: 'In Huron\'s model, why can the second pass of a hook feel better than the first?',
            options: [
                'A prediction error pulls the ear back to the hook',
                'The listener predicted it, and that is rewarded',
                'The listener has stopped attending to it closely',
                'Hearing it again makes it seem a little louder',
            ],
            answer: 1,
            why: 'Huron describes a prediction response: when what you expected arrives, the brain rewards the correct guess. That is part of why a known hook can feel better on the next pass.',
        },
        {
            q: 'You want to vary the third pass of a four-pass hook. Which change keeps its identity?',
            options: [
                'A new melody written for the whole third pass',
                'A new rhythm given to every note in the pass',
                'A key change for the third pass, then back',
                'One note near the end, moved within the key',
            ],
            answer: 3,
            why: 'A small change that makes sense in the key is a surprise the ear can absorb. Rewrite the whole pass and the listener loses the pattern that made the line catchy.',
        },
        {
            q: 'Why do you tend to get bored with a loop sooner than a listener would?',
            options: [
                'You have heard it far more often than they will',
                'Studio monitors reveal flaws that listeners miss',
                'Listeners follow the vocal, not the loop under it',
                'Producers are trained to dislike exact repeats',
            ],
            answer: 0,
            why: 'Habituation builds with exposure. After a long session your response to the hook is much weaker than a new listener\'s, so trust the pattern before rewriting it.',
        },
    ],
    content: `## Hook: the fourth time through

You write a line that feels right. The melody is catchy and the rhythm moves. You loop it four times for the chorus and call it a hook.

By the third pass the line has lost its pull, and by the fourth it sounds like a jingle. The line did not get worse. Your ear stopped needing to listen to it, because it already knew every note.

## Why it matters: repetition is the engine, sameness is the brake

Cutting repetition is the wrong fix. Margulis (2014) shows how central repetition is to music, which repeats far more than speech does. She argues that repetition changes how we listen: once a passage is known, we stop following it note by note and start anticipating it, singing along in our heads. In one of her studies, listeners with no special background in contemporary concert music heard one-minute excerpts by Berio and Carter, some with repeats spliced in. They rated the versions with repeats as more enjoyable, more interesting and more artistic than the originals (Margulis, 2013).

So the question is how long one pattern can repeat before the ear stops attending to it. In a session, the symptom is a hook that thrills you in the first hour and bores you by the end of the day. The tempting response is to rewrite it bar by bar, which throws away the repetition that made it catchy.

::figure response

## Science model: prediction, reward and habituation

Huron's ITPRA theory (2006) describes the brain as constantly predicting what comes next, with several responses around each event. One of them, the prediction response, rewards accuracy: when what you expected arrives, it tends to feel good. That is why the second pass of a hook can feel better than the first. You saw it coming.

A pattern that repeats with no change at all becomes completely predictable, and the response to it fades. This is habituation: the nervous system responds less and less to a stimulus that does not change, and responds again when something about it does.

A small change late in the pattern creates a prediction error. The line goes somewhere you did not quite expect. If the change still makes sense, a note that belongs to the key or a word that fits the line, it pulls attention back without breaking the pattern. Then the next pass returns to the original, which is predictable again and earns the prediction reward a second time. Repeat, repeat, change, return is a common shape for a hook because it uses both responses.

::figure loop

## DAW experiment: the mutation pass

1. Build an eight-bar chorus where one two-bar vocal or synth line repeats four times as exact copies. Duplicate the track so you can switch between versions.
2. On the copy, find the last note of the third pass. Move only that note to another note in the key: if it lands on the root, try the fifth above or the next scale step up. In MIDI, drag the note; on audio, use your pitch editor.
3. Leave the rhythm, the lyric and every other note unchanged.
4. Play both versions from the start of the chorus, two or three times each, at the same level.
5. Try a rhythmic change instead of a pitch change: on the third pass, move the last word a 16th note early, or leave out one note.
6. Now overdo it. Rewrite the whole third pass with a new melody and listen to the fourth pass.

With one detail changed, the fourth pass tends to feel like coming home rather than another copy. With the whole pass rewritten, the line starts to lose its identity, and the return feels less like a return.

## Common mistake: the nervous rewrite

The most common mistake is changing too much too soon. Producers write a new melody for every bar because they fear the listener will get bored. Without a pattern there is nothing to predict, so there is no reward when the line returns, and the hook is harder to remember.

Part of that fear comes from your own ears. You have heard the loop far more often than any listener will, so you have habituated to it more. Before you rewrite, play it to someone fresh or come back after a break.

The second mistake is dressing up an unchanging line with filter sweeps and automation. Production movement helps, but the listener follows the line itself. Change the line, a little, and the production can stay simple.

## Producer takeaway: keep the shape, change one thing

Repeat the hook enough for it to be learned. Then change one detail late in the pattern: a note, a word or a rhythm, one at a time. Come back to the original on the next pass. The repetition makes the hook familiar, and the small change keeps the listener paying attention to it.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Margulis, E. H. (2013). Aesthetic responses to repetition in unfamiliar music. *Empirical Studies of the Arts*, 31(1), 45-57.
- Margulis, E. H. (2014). *On Repeat: How Music Plays the Mind*. Oxford University Press.
`,
    seo: {
        title: 'Repetition sticks when one detail changes',
        description: 'Exact repetition builds a hook, then wears thin. Change one detail late in the pattern and the return to the original feels earned.',
        keywords: ['repetition in songwriting', 'hook writing', 'musical expectation', 'habituation', 'songwriting tips'],
    },
};
