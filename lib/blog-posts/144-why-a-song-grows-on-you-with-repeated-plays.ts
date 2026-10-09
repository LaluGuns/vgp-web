import { BlogArticle } from '../blog-data';

export const post144: BlogArticle = {
    slug: 'why-a-song-grows-on-you-with-repeated-plays',
    title: 'Why a song grows on you with repeated plays',
    excerpt: 'Liking for a new track often climbs over everyday plays, and remembering a hook is a separate thing from liking it. What the studies found, and how to test a demo.',
    category: 'music-psychology',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Judge a new idea after several plays in the background, because liking for unfamiliar music tends to keep rising over everyday listening.',
        'Weigh a cold reaction by how well the listener knows the style, since familiarity with the style was the strongest predictor of liking in a four-week study.',
        'Ask "have you heard this?" and "do you want it again?" as separate questions, because recognition and liking respond to exposure differently.',
    ],
    figures: {
        weights: {
            type: 'bars',
            caption:
                'Standardized weights from Madison and Schiölde\'s (2017) regression on mean liking for 40 excerpts at four rating sessions. How much listeners said, on day one, that they listen to music like each excerpt weighed more than the number of plays, and complexity weighed least. Together the three explained 57% of the variance.',
            alt: 'Three horizontal bars on a scale from 0 to 0.6. Listens to similar music reaches 0.55, number of plays 0.46 and complexity level 0.23.',
            min: 0,
            max: 0.6,
            bars: [
                { label: 'Similar music', value: 0.551, display: '0.55' },
                { label: 'Number of plays', value: 0.464, display: '0.46' },
                { label: 'Complexity', value: 0.226, display: '0.23', dim: true },
            ],
        },
        split: {
            type: 'curve',
            caption:
                'The pattern Green and colleagues (2012) reported after one lab session of focused listening. Recognition climbed at every step from no plays to 32. Liking rose slowly, and only 32 plays against none was a reliable difference. A sketch of the two shapes on separate rating scales, not their data.',
            alt: 'Two curves over four exposure levels: never heard, 2 plays, 8 plays and 32 plays. The recognition curve rises steeply and keeps rising. The dashed liking curve stays nearly flat and lifts a little at 32 plays.',
            x: ['Never heard', '2 plays', '8 plays', '32 plays'],
            xShort: ['None', '2', '8', '32'],
            xLabel: 'Plays before the test',
            yLabel: 'Rise with exposure',
            series: [
                { label: 'Recognition', values: [0.05, 0.5, 0.78, 0.92] },
                { label: 'Liking', values: [0.05, 0.1, 0.16, 0.3], dashed: true },
            ],
        },
    },
    quiz: [
        {
            q: 'After one listen, a friend who listens to jazz daily gives your dense jazz-rap instrumental an 8 out of 10, and one who mostly listens to EDM gives it a 3. Going by Madison and Schiölde (2017), how should you read the 3?',
            options: [
                'As proof the arrangement is too complex, so simplify it',
                'Partly as their distance from the style, the top predictor',
                'As the lasting verdict, since first reactions hold over time',
                'As noise, since liking in the study followed no factor at all',
            ],
            answer: 1,
            why: 'How much listeners said they listen to similar music had the largest weight on liking (0.55), ahead of the number of plays (0.46) and complexity (0.23), and liking rose with plays at every complexity level. A cold score from outside the style says a lot about the listener\'s history.',
        },
        {
            q: 'Last week a friend heard your demo with the hook on piano. This week you play the same hook on a synth, mixed in with some new hooks. Going by Peretz and colleagues (1998), what should you expect?',
            options: [
                'They are less likely to recognize it but like it about as much',
                'They like it less and recognize it less, so keep the piano',
                'They recognize it just as well but like it less, as the sound is new',
                'Nothing changes, since the notes and the rhythm are the same',
            ],
            answer: 0,
            why: 'A change of timbre between the first hearing and the test had a marked effect on recognition and little effect on liking. Peretz and colleagues read this as two forms of memory: one the listener can report, and one that shows up as preference.',
        },
        {
            q: 'You play two hooks once to five friends. The next day four of them can hum hook A. What can you conclude?',
            options: [
                'Hook A is the better hook and belongs in the chorus',
                'Hook B failed because the group disliked it',
                'Hook A will keep growing on them with more plays',
                'Hook A stuck in memory, and liking needs its own question',
            ],
            answer: 3,
            why: 'Recall shows the hook got into memory. Recognition and liking respond to exposure differently, so whether they want to hear it again has to be asked separately.',
        },
    ],
    content: `## Hook: the friend who changed their mind

You send a new instrumental to a friend who mostly listens to rap. The reply is "it's fine, a bit busy." Three weeks later the track has been playing in the background of your shared room most afternoons, and the same friend asks what it is called and whether it is finished. It is the same file you sent the first time.

Memory misleads in a different way. You play two hooks to a few people and ask which one they remember. Hook A wins, so you assume it is the one they like, and build the chorus on it.

## Why it matters: first reactions and memory tests mislead

Most demo feedback rests on two habits. The first is treating one cold listen as the verdict on a track. The second is treating "which one stuck?" as a vote for the better idea. Research on repeated listening gives reasons to doubt both. Liking for unfamiliar music tends to climb over repeated everyday plays, and how much a listener remembers a piece and how much they like it are separate measurements that respond to exposure in different ways.

## Science model: exposure, style history and two kinds of memory

Zajonc (1968) described the mere exposure effect: repeated exposure alone can make people like a stimulus more. The lesson on [mixing while attached to the demo](/blog/danger-of-mixing-attached-to-the-demo) covers how it traps you on your own rough mix, and the one on [hooks that wear out](/blog/why-a-hook-must-be-predictable-and-unstable) covers how liking can rise and then fall when people listen closely.

Madison and Schiölde (2017) ran a long test outside the lab. Fifteen adults received 40 instrumental excerpts, 38 to 75 seconds long, drawn from pop, rock, jazz and world-music records, none of which they had heard before. Each excerpt played about once a day for four weeks, 28 times in all, and most listening happened while people did chores, ate, drove or worked. Experts had sorted the excerpts into four levels of complexity. Liking rose with plays at every level, from the simplest excerpts to the most complex, with no rise and fall. The strongest predictor of liking was familiarity with the style: how much listeners said, on the first day, that they listen to music like each excerpt. That is the same [learned style knowledge](/blog/listeners-bring-genre-expectations-into-your-song) that decides what sounds surprising.

::figure weights

The study has limits. Fifteen people is a small sample. They were recruited through one author's contacts among music professionals, they were more involved with music than most people, and the excerpts came from the authors' own record collections. Four listeners showed a small dip late in the series, almost all of it in the two simplest levels, though none of those dips was statistically reliable. The study speaks to half-attentive everyday listening and says little about one focused A/B in your studio.

Remembering and liking also come apart. Peretz, Gaudreau and Bonnel (1998) played listeners a set of familiar and unfamiliar melodies, then mixed them with new ones at test. Half the listeners rated how much they liked each melody. The other half said whether they had heard it before. Exposure raised liking for the unfamiliar melodies. The recognition effect lasted longer over delays than the liking effect. Changing the instrument timbre between the first hearing and the test, or changing what listeners did while they first heard the melodies, had a marked effect on recognition and little effect on liking. The authors read this as two forms of memory: an explicit one you can report, and an implicit one that shows up as preference.

Green and colleagues (2012) found a similar split in a scanner study. Twenty-one non-musicians heard unfamiliar 13-second melodies either never, 2, 8 or 32 times, all in one session of about an hour, while they listened for an occasional out-of-tune note. Recognition rose at every step. Liking rose modestly, and only 32 plays against none was a reliable difference. Frontal and parietal areas that the authors tie to memory retrieval were more active for well-known melodies even while people were only judging liking, which the authors take as a sign that liking leans on memory. They used an uncorrected statistical threshold, so treat the brain result as preliminary.

::figure split

For a producer, two things follow. A listener's first reaction partly measures their history with the style. And a hook can become easy to recognize after a few plays while liking for it has barely moved.

## DAW experiment: a ten-day listening log

1. Bounce 45-second clips of two ideas you started this week and one track in a style you rarely listen to. Name them A, B and C so the titles do not steer you.
2. Put the three clips back to back in a new session with a marker or notes track. Play them once and rate each clip from 0 to 10 twice: "I like this" and "I listen to music like this." Type the numbers into the markers.
3. Every day for the next ten days, play the session once while you do something else, such as email or cleaning. Do not stop to analyse it.
4. On day 5 and day 10, before you press play, write whether you can hum the main idea of each clip from memory. Then play the session and rate liking again.
5. Compare the logs. Note which clip's liking moved most, and whether it was the one with the lowest "music like this" score.
6. For other ears, play a friend six short hooks in a shuffled order: three from a demo they heard last week and three new ones in the same style. On one pass ask "heard before, yes or no." On a second pass ask "like it, 0 to 10."
7. Render one of the familiar hooks on a different instrument and slip it into the second set. Peretz's result predicts that a timbre change hurts recognition more than liking, so check whether your friend follows that pattern.

One person's log proves nothing general, but it shows how far your own first reaction moved, and whether the hook people recall is the one they rate highest.

## Common mistake: the cold listen as a verdict

The first mistake is binning or simplifying an idea after one reaction, especially from someone who does not listen to that style. In the Madison and Schiölde data, familiarity with the style counted for more than the music's complexity, and the more complex excerpts were, if anything, liked slightly more. Before you strip a dense arrangement, get a reaction from someone who knows the genre, or let the track play a few more times in the background.

The second mistake is asking "which one do you remember?" and counting the answer as a vote. Recall tells you the hook got into memory. Whether the listener wants it again is a different question, and it deserves its own pass.

Repetition does not rescue everything either. Under close, attentive listening a simple loop can wear out, which is the point of the [hook lesson](/blog/why-a-hook-must-be-predictable-and-unstable).

## Producer takeaway: give it plays, then ask two questions

Do not decide on a new idea from one focused listen. Let it play in the background for a few days, then judge it again. When you test with other people, note what they usually listen to, and ask whether they have heard the hook and whether they want it again as two separate questions. A track that the right listeners like more on the fifth play is worth finishing, even if the first reaction was a shrug.

## References

- Green, A. C., Bærentsen, K. B., Stødkilde-Jørgensen, H., Roepstorff, A., & Vuust, P. (2012). Listen, learn, like! Dorsolateral prefrontal cortex involved in the mere exposure effect in music. *Neurology Research International*, 2012, 846270.
- Madison, G., & Schiölde, G. (2017). Repeated listening increases the liking for music regardless of its complexity: Implications for the appreciation and aesthetics of music. *Frontiers in Neuroscience*, 11, 147.
- Peretz, I., Gaudreau, D., & Bonnel, A.-M. (1998). Exposure effects on music preference and recognition. *Memory & Cognition*, 26(5), 884-902.
- Zajonc, R. B. (1968). Attitudinal effects of mere exposure. *Journal of Personality and Social Psychology Monograph Supplement*, 9(2, Pt. 2), 1-27.
`,
    seo: {
        title: 'Why a song grows on you with repeated plays | VGP Studio',
        description: 'Liking for new music rises over everyday plays, and recognition is not liking. What exposure studies found and how to test a demo with listeners.',
        keywords: ['mere exposure effect', 'repeated listening', 'music familiarity', 'demo feedback', 'music recognition', 'music psychology'],
    },
};
