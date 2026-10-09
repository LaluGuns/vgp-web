import { BlogArticle } from '../blog-data';

export const post146: BlogArticle = {
    slug: 'listeners-bring-genre-expectations-into-your-song',
    title: 'Listeners bring genre expectations into your song',
    excerpt: 'Whether a move sounds fresh or wrong depends on what the listener has heard before. How style knowledge shapes surprise, and how to test a crossover.',
    category: 'music-psychology',
    publishedAt: '2026-10-09',
    readingTime: 4,
    summary: [
        'Before you call a move too strange or too safe, ask which listeners you mean, because each one judges it against the styles they know.',
        'Test risky bars on at least one listener from inside the style and one from outside it, and ask them to tap along as well as react.',
        'In a crossover, keep one parent style\'s frame steady so both audiences have something they can predict.',
    ],
    figures: {
        meter: {
            type: 'rhythm',
            steps: 14,
            perBeat: 7,
            caption:
                'Two bars of a seven-count meter grouped 2+2+3, so the last beat is longer than the others by a ratio of 3:2. An even beat laid over it expects a beat in the middle of the long one, then misses the next bar line. Hannon and Trehub found that North American adults tended to hear rhythms like the top row through that even frame.',
            alt: 'A grid of 14 steps split into two bars of seven. The top row has accented hits on steps 1, 3 and 5 of each bar, so the third beat in each bar is longer. The bottom row has an even hit every two steps, which falls out of line with the top row after the third beat.',
            rows: [
                { label: '7 counts, 2+2+3', hits: [{ step: 0 }, { step: 2, level: 0.7 }, { step: 4, level: 0.7 }, { step: 7 }, { step: 9, level: 0.7 }, { step: 11, level: 0.7 }] },
                { label: 'Even beat', hits: [{ step: 0 }, { step: 2, level: 0.7 }, { step: 4, level: 0.7 }, { step: 6, level: 0.7 }, { step: 8, level: 0.7 }, { step: 10, level: 0.7 }, { step: 12, level: 0.7 }], note: 'Drifts after beat 3' },
            ],
        },
        accuracy: {
            type: 'scale',
            min: -0.5,
            max: 2,
            ticks: [-0.5, 0, 0.5, 1, 1.5, 2],
            caption:
                'Mean accuracy of 40 North American adults in Hannon and Trehub\'s (2005) adult experiment, scored as how much less similar they rated meter-breaking changes than meter-keeping ones. Zero is chance. They were accurate in Western meter and slightly below zero in Balkan meter. The group that listened to Balkan music at home scored 0.22 in the second session, still at chance.',
            alt: 'A number line from minus 0.5 to 2 with a strong marker at 0 for chance. Balkan meter sits at minus 0.27, Balkan after home listening at 0.22, and Western meter at 1.79.',
            markers: [
                { value: 0, label: 'Chance', strong: true },
                { value: -0.27, label: 'Balkan meter' },
                { value: 0.22, label: 'Balkan, later' },
                { value: 1.79, label: 'Western meter' },
            ],
        },
    },
    quiz: [
        {
            q: 'In Hannon and Trehub\'s (2005) study, how did North American adults handle changes to Balkan folk melodies in a complex meter?',
            options: [
                'They caught changes in both kinds of meter equally well',
                'They caught them only after a few repeats of each melody',
                'They missed changes that broke the complex meter',
                'They rated every change as a complete departure',
            ],
            answer: 2,
            why: 'The North American adults told meter-breaking from meter-keeping changes apart in simple meter but not in the complex meter. Adults of Bulgarian or Macedonian origin, and 6-month-old infants, did it in both.',
        },
        {
            q: 'Hansen, Vuust and Pearce (2016) played Charlie Parker phrases to jazz musicians, classical musicians and non-musicians. What set the jazz musicians apart?',
            options: [
                'Their conscious sense of certainty matched a bebop-trained model',
                'They were the only group whose expectedness ratings fit bebop',
                'They judged the phrases against a general tonal model instead',
                'They found every continuation equally likely and unsurprising',
            ],
            answer: 0,
            why: 'Both musician groups rated expectedness in line with the bebop model better than non-musicians did. Only the jazz musicians\' explicit certainty ratings tracked the model\'s estimates.',
        },
        {
            q: 'Your track pairs a drill rhythm with jazz harmony. Jazz listeners call the drums odd and drill listeners call the chords odd. What is the best reading?',
            options: [
                'Both groups are wrong because the track is new',
                'The chords are odd, so the jazz listeners are right',
                'The mix hides the parts each group is missing',
                'Each group hears the half outside its own style as odd',
            ],
            answer: 3,
            why: 'Each listener judges a move against the style they have learned. A crossover activates two sets of expectations, and each audience notices the part its own style does not predict.',
        },
    ],
    content: `## Hook: one bar, two verdicts

You shorten the last bar of a loop by one eighth note, so it runs seven counts instead of eight. A friend who grew up on Balkan brass hears nothing unusual. A friend who listens to pop and house stops nodding and asks whether the edit slipped, although both heard the same file.

Neither friend is wrong. Each one heard the bar against the music they already know.

## Why it matters: surprising for whom?

When you decide that a move is too strange, too safe or just right, you consult your own expectations, and those were built by your listening. If you have spent years inside one genre, your sense of normal is deep there and shallow elsewhere. Your audience may have a different history, and a crossover track may have two audiences with two different histories. Feedback on a risky bar says as much about the listener as about the bar.

## Science model: expectations are learned from a style

Pearce (2018) reviews the case that listeners absorb the statistical regularities of the music they hear and use them to predict what comes next. In that work, a computer model trained on one culture's music simulates the expectations of listeners from that culture, and training it on other music plausibly simulates listeners with other backgrounds. The probabilities come from each listener's own history. The lesson on [surprise](/blog/how-surprise-works-without-confusing-the-listener) shows how such predictions turn into a measure of surprise.

Rhythm gives a clean test. Hannon and Trehub (2005a) played folk melodies in simple meters and in complex meters common in Balkan music, then tested listeners on altered versions that either kept or broke the original meter. North American adults told the two kinds of change apart in simple meter but not in the complex one. Adults of Bulgarian or Macedonian origin managed both, and so did 6-month-old infants. A follow-up (Hannon & Trehub, 2005b) tested 40 North American college students in two sessions one to two weeks apart, and some of them listened to Balkan music at home in between. Their accuracy on the complex meter improved slightly and stayed at chance. The authors concluded that the adults fitted the rhythms into a Western even-beat frame.

::figure meter

::figure accuracy

Expertise inside a genre matters too. Hansen, Vuust and Pearce (2016) played phrases from Charlie Parker solos to 22 jazz musicians, 20 classical musicians and 20 non-musicians. Listeners rated how expected each of nine possible next notes was, and how certain they felt about what would come next. Both musician groups rated expectedness more in line with a model trained on bebop than non-musicians did. Only the jazz musicians' sense of certainty tracked that model. Specialists seem to know consciously what the style predicts. The groups were small, differed in gender balance and main instrument, and the analyses were not corrected for multiple comparisons, so treat the details with care.

Harmony gives a test you can hear right now. For most listeners raised on Western pop, a phrase that stops on the V chord sounds like a question, and the I chord sounds like the answer. On the statistical-learning account that Pearce reviews, the sense of closure comes from having heard V move to I countless times. Listen for how open the V ending sounds next to the I ending, and keep in mind that this pull is your learned expectation, shared by your audience only if they learned it too.

::demo cadence

## DAW experiment: test a bar on two kinds of listener

1. Take a four-bar loop in a style you know well and duplicate it twice.
2. In the first copy, shorten bar 4 by one eighth note, so it has seven counts grouped 2+2+3. Move the drum hits so the long count falls on the last beat.
3. In the second copy, keep the meter and change only the last chord to V, so the phrase stops on the dominant.
4. Before you play them to anyone, write down which bar you expect each listener to call odd and which to call normal.
5. Play all three versions to someone who listens deeply in the style of the loop and to someone who does not. Ask them to tap along with the beat.
6. Watch where the tapping breaks down in the seven-count bar, then ask a separate question: does each change sound intended or like a mistake?
7. Compare their answers with your predictions from step 4.

## Common mistake: trusting your own sense of normal

The first mistake is ruling on a move from your own expectations alone. If you live inside one genre, a move it uses all the time can sound bland to you and baffling to an outsider. Ask a listener who does not share your background before you decide.

The second mistake is expecting an outsider audience to learn a foreign meter from one intro. One to two weeks of home listening did not get Hannon and Trehub's adults to native-like performance. In a crossover, keep one parent style's frame steady, such as the drum pattern, while you borrow the harmony or melody from the other. Each audience then has something it can predict.

## Producer takeaway: name the listener before you judge the move

"Too weird" and "too safe" only make sense for a particular listener. Decide who the track is for, test risky bars on people inside and outside that style, and watch whether they can still tap along. If insiders hear a move as intended and outsiders lose the beat, decide which group you are writing for, and give the other group a steady frame to hold on to.

## References

- Hannon, E. E., & Trehub, S. E. (2005a). Metrical categories in infancy and adulthood. *Psychological Science*, 16(1), 48-55.
- Hannon, E. E., & Trehub, S. E. (2005b). Tuning in to musical rhythms: Infants learn more readily than adults. *Proceedings of the National Academy of Sciences*, 102(35), 12639-12643.
- Hansen, N. C., Vuust, P., & Pearce, M. (2016). "If you have to ask, you'll never know": Effects of specialised stylistic expertise on predictive processing of music. *PLOS ONE*, 11(10), e0163584.
- Pearce, M. T. (2018). Statistical learning and probabilistic prediction in music cognition: Mechanisms of stylistic enculturation. *Annals of the New York Academy of Sciences*, 1423(1), 378-395.
`,
    seo: {
        title: 'Listeners bring genre expectations into your song | VGP Studio',
        description: 'Whether a move sounds fresh or wrong depends on the listener\'s musical history. How style learning shapes surprise, and how to test a crossover.',
        keywords: ['musical expectation', 'genre expectations', 'enculturation', 'odd meter', 'genre crossover', 'music psychology'],
    },
};
