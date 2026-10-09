import { BlogArticle } from '../blog-data';

export const post078: BlogArticle = {
    slug: 'emotion-felt-and-emotion-recognized-are-different',
    title: 'Hearing an emotion is not the same as feeling it',
    excerpt: 'A listener can hear sadness in a song and feel something else. What research shows about perceived and felt emotion, and how to test which one a mix reaches.',
    category: 'music-psychology',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Perceived emotion is what the listener hears the music express. Felt emotion is what changes in the listener. They often match, but far from always.',
        'Adding more sad cues raises what a song expresses. A listener feels it only when something engages them, such as a groove, a voice or a memory.',
        'Rate your mix twice, once for what it expresses and once for what you feel, and change the part that moves the second number.',
    ],
    figures: {
        match: {
            type: 'bars',
            min: 0,
            max: 100,
            unit: '%',
            caption:
                'Evans and Schubert (2008) asked 45 listeners what each piece expressed and what they felt. The two matched in 61% of cases. In the rest, the felt emotion was opposite, unrelated or absent.',
            alt: 'Two horizontal bars. Felt matched expressed: 61 percent. Felt differed: 39 percent.',
            bars: [
                { label: 'Felt matched expressed', value: 61, display: '61%' },
                { label: 'Felt differed', value: 39, display: '39%', dim: true },
            ],
        },
        routes: {
            type: 'flow',
            caption:
                'Recognizing an emotion stops at the second step. Feeling it needs a mechanism that engages the listener, and the producer can work on several of them directly.',
            alt: 'Four steps: cues in the music, the listener recognizes the emotion, a mechanism such as groove, voice or memory engages them, and the listener feels something.',
            steps: [
                { label: 'Cues in the music', note: 'Tempo, mode, voice, loudness' },
                { label: 'Emotion recognized', note: 'Perceived: this sounds sad' },
                { label: 'A mechanism engages', focus: true, note: 'Groove, voice, memory, expectation' },
                { label: 'Emotion felt', note: 'A change in the listener' },
            ],
        },
    },
    quiz: [
        {
            q: 'A listener says a song sounds heartbroken but leaves them cold. Which kind of emotion did the song reach?',
            options: ['Felt emotion only', 'Perceived emotion only', 'Both kinds equally', 'Neither of the two kinds'],
            answer: 1,
            why: 'They recognized the emotion the song expresses, which is perceived emotion. Nothing changed in them, so felt emotion was not reached.',
        },
        {
            q: 'You and a friend score six versions of a sad chorus from 1 to 7, once for the sadness each expresses and once for the sadness you feel. If your scores follow Hunter, Schellenberg and Schimmack (2010), what pattern should you expect?',
            options: [
                'Felt scores sit above expressed ones, because a voice adds feeling',
                'Felt scores move at random, with no link to the expressed ones',
                'Felt and expressed scores come out the same on every version',
                'Felt scores rise and fall with expressed ones but sit below them',
            ],
            answer: 3,
            why: 'The two ratings were closely related, but listeners heard more happiness or sadness in the music than they felt themselves. Schubert\'s review found felt ratings often the same as or lower than expressed ones, so felt scores below the expressed ones are the usual result.',
        },
        {
            q: 'Which change targets felt emotion rather than adding another sad cue?',
            options: [
                'Locking kick and bass so the groove invites movement',
                'Slowing the tempo so each line has more room to land',
                'Moving the song to a darker minor key for the chorus',
                'Adding a longer reverb tail to the lead vocal line',
            ],
            answer: 0,
            why: 'A groove engages rhythmic entrainment, one of the mechanisms that produce felt emotion. A slower tempo, a darker key and more reverb mostly change what the song expresses.',
        },
    ],
    content: `## Hook: sad on paper, cold in the room

You write a song about heartbreak. The lyrics are careful, the vocal take cracks in the right places and the tempo is slow. You expect the listener to feel the loss. They tell you it sounds very sad and a bit melodramatic, and you can see it did not touch them.

They recognized the emotion. They did not feel it. Music psychology treats those as two different things, and a producer can work on each of them separately.

## Why it matters: two kinds of emotion in one song

Gabrielsson (2002) separated perceived emotion, the emotion a listener hears the music express, from felt emotion, the change the music causes in the listener. The two can match, as when a sad song makes you sad. They can run opposite, as when a sad song gives you pleasure. Or they can be unrelated.

Evans and Schubert (2008) checked how often the two match, asking listeners about familiar pieces and pieces they had chosen themselves. Felt and expressed emotion were the same in 61% of cases.

::figure match

Hunter, Schellenberg and Schimmack (2010) varied tempo and mode in short excerpts and asked listeners both questions on the same scales. The two ratings were closely related, but listeners consistently heard more happiness or sadness in the music than they felt. Schubert (2013) reviewed comparisons like these and found felt ratings were often the same as or lower than expressed ones.

For a producer, that means more sad cues raise what the song expresses. They do not guarantee that anyone feels it.

## Science model: feeling needs a mechanism

Juslin (2013) describes eight mechanisms through which music can make a listener feel something. They include a fast reflex to sudden or loud sounds, rhythmic entrainment (the body locking to the beat), emotional contagion (mirroring the emotion in a voice or a voice-like line), memories, imagery, musical expectation and a judgment of the music's beauty. Recognizing an emotion needs none of them. Feeling one needs at least one to engage.

Several of these are directly in your hands. Entrainment depends on the groove. Janata, Tomic and Haberman (2012) found that music listeners rated high in groove made them want to move and made it easier to move in time with it. Contagion depends on how expressive the voice sounds: its dynamics, breaths, small pitch inflections and how close it feels. Expectation depends on the arrangement.

::figure routes

The practical test is to measure both kinds separately in your own track. A section that rates high for expressed emotion and low for felt emotion is telling you which half is missing.

## DAW experiment: two ratings per version

Do this after a break from the song, and allow about twenty minutes.

1. Bounce three 30-second clips of the same chorus: the full mix, the mix with all vocals muted, and the vocals with only a simple pad under them.
2. For each clip, write down two scores from 1 to 7: how strongly the music expresses the intended emotion, and how strongly you feel it.
3. If the instrumental clip feels flat, line up the kick and bass: zoom in and move the bass notes so each one starts with its kick, then check that the groove makes you want to move.
4. If the vocal clip feels flat, look at the vocal chain. Raise the compressor threshold until it does about 3 dB less gain reduction, restore any breaths a gate removed and lower the reverb send by 3 dB.
5. Bounce the three clips again and repeat the two scores.
6. Ask one listener who does not know the song to score the full mix the same way.

Notice which number moves. The expressed score often stays about the same, because the cues have not changed. The felt score is the one your changes can move.

## Common mistake: adding more sadness to make it felt

The most common mistake is answering a cold reaction with more sad cues: slower, darker, more reverb, a bigger performance. That raises what the song expresses and can push it further into melodrama, while the felt response stays where it was.

The second mistake is processing the expression out of the voice. Heavy compression, strict tuning and gated breaths make a vocal even and tidy, and remove the small changes that make a voice sound like a person feeling something.

## Producer takeaway: work on the feeling half

Treat expressed and felt emotion as two dials. The lyric, tempo and harmony set the first. The groove, the voice and the arrangement mostly decide the second. When a song sounds sad but leaves people cold, stop adding sadness. Find the mechanism that is not engaging, whether that is the groove, the voice or the build, and fix that part.

## References

- Evans, P., & Schubert, E. (2008). Relationships between expressed and felt emotions in music. *Musicae Scientiae*, 12(1), 75-99.
- Gabrielsson, A. (2002). Emotion perceived and emotion felt: Same or different? *Musicae Scientiae*, Special Issue 2001-2002, 123-147.
- Hunter, P. G., Schellenberg, E. G., & Schimmack, U. (2010). Feelings and perceptions of happiness and sadness induced by music: Similarities, differences, and mixed emotions. *Psychology of Aesthetics, Creativity, and the Arts*, 4(1), 47-56.
- Janata, P., Tomic, S. T., & Haberman, J. M. (2012). Sensorimotor coupling in music and the psychology of the groove. *Journal of Experimental Psychology: General*, 141(1), 54-75.
- Juslin, P. N. (2013). From everyday emotions to aesthetic emotions: Towards a unified theory of musical emotions. *Physics of Life Reviews*, 10(3), 235-266.
- Schubert, E. (2013). Emotion felt by the listener and expressed by the music: Literature review and theoretical perspectives. *Frontiers in Psychology*, 4, 837.
`,
    seo: {
        title: 'Hearing an emotion is not the same as feeling it | VGP Studio',
        description: 'The difference between perceived and felt emotion in music, what the research shows about how often they match, and a DAW test for which one your mix reaches.',
        keywords: ['music emotion', 'perceived vs felt emotion', 'emotional contagion', 'groove', 'songwriting', 'music psychology'],
    },
};
