import { BlogArticle } from '../blog-data';

// A chord as MIDI notes: one bass note and an upper voicing, two beats long. Context chords are greyed out.
const chord = (start: number, bass: number, upper: number[], muted = true) =>
    [bass, ...upper].map((pitch) => ({ start, length: 2, pitch, muted }));

export const post143: BlogArticle = {
    slug: 'major-happy-minor-sad-is-too-simple',
    title: 'A chord\'s mood depends on how you get there',
    excerpt: 'Major sounds happier than minor in some contexts and not in others. The progression into a chord, its role in the key and the listener\'s history change what it says.',
    category: 'music-psychology',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Listeners raised on Western tonal music tend to hear major as more pleasant than minor, but how strongly depends on their listening history and on the role the chord plays.',
        'The same chord sounds settled as the home chord and unfinished as a dominant or after a deceptive move, so change the progression into a chord before you change its mode.',
        'Test a target chord by keeping its voicing fixed, changing only the route into it, and scoring how pleasant, stable and tense it feels.',
    ],
    figures: {
        major: {
            type: 'notes',
            caption:
                'One C major chord, same voicing and same bass, ends both progressions. After C, F and G it is the home chord, I. After F, Bb and Gm it is V in F major, a chord that wants to move on, so the phrase stops on a question.',
            alt: 'Piano roll of two four-chord progressions, two beats per chord. The first plays C, F, G, C. The second plays F, Bb, Gm, C. The final C chord is drawn in colour and uses the same notes, C3, C4, E4 and G4, in both.',
            notes: [
                ...chord(0, 48, [60, 64, 67]),
                ...chord(2, 41, [60, 65, 69]),
                ...chord(4, 43, [59, 62, 67]),
                ...chord(6, 48, [60, 64, 67], false),
                ...chord(8, 41, [60, 65, 69]),
                ...chord(10, 46, [62, 65, 70]),
                ...chord(12, 43, [62, 67, 70]),
                ...chord(14, 48, [60, 64, 67], false),
            ],
            chords: [
                { at: 0, label: 'C' },
                { at: 2, label: 'F' },
                { at: 4, label: 'G' },
                { at: 6, label: 'C' },
                { at: 8, label: 'F' },
                { at: 10, label: 'Bb' },
                { at: 12, label: 'Gm' },
                { at: 14, label: 'C' },
            ],
        },
        minor: {
            type: 'notes',
            caption:
                'One A minor chord ends both progressions. After Dm and E it is home in A minor and sounds settled. After C, F and G the ear expects C, so the same A minor arrives as a swerve: the deceptive cadence.',
            alt: 'Piano roll of two four-chord progressions, two beats per chord. The first plays Am, Dm, E, Am. The second plays C, F, G, Am. The final A minor chord is drawn in colour and uses the same notes, A2, A3, C4 and E4, in both.',
            notes: [
                ...chord(0, 45, [57, 60, 64]),
                ...chord(2, 50, [57, 62, 65]),
                ...chord(4, 40, [56, 59, 64]),
                ...chord(6, 45, [57, 60, 64], false),
                ...chord(8, 48, [55, 60, 64]),
                ...chord(10, 41, [57, 60, 65]),
                ...chord(12, 43, [55, 59, 62]),
                ...chord(14, 45, [57, 60, 64], false),
            ],
            chords: [
                { at: 0, label: 'Am' },
                { at: 2, label: 'Dm' },
                { at: 4, label: 'E' },
                { at: 6, label: 'Am' },
                { at: 8, label: 'C' },
                { at: 10, label: 'F' },
                { at: 12, label: 'G' },
                { at: 14, label: 'Am' },
            ],
        },
    },
    quiz: [
        {
            q: 'A chorus in F major ends on C major, straight after Gm. Why can it sound unfinished even though it is a major chord?',
            options: [
                'In F major, C is the dominant and pulls toward F',
                'A major chord at the end of a chorus never resolves',
                'The Gm before it cancels the major third of the C',
                'C major is too low in register to sound resolved',
            ],
            answer: 0,
            why: 'The chord\'s role in the key decides how settled it sounds. In F major, C is V, so ending on it leaves a half cadence that points back to F.',
        },
        {
            q: 'In Zhang and colleagues\' 2025 rating study, when were major final chords clearly rated more pleasant than minor ones?',
            options: [
                'Only when chords were heard on their own',
                'After progressions that ended unstably',
                'After progressions that ended stably',
                'Only for listeners with musical training',
            ],
            answer: 2,
            why: 'After stable endings, major chords were rated more pleasant, more stable and less tense. After unstable endings, the differences were no longer significant.',
        },
        {
            q: 'What does the Papua New Guinea study by Smit and colleagues (2022) suggest about major cadences sounding happier?',
            options: [
                'It is a fixed acoustic property of the major triad',
                'It shows up for melodies but never for cadences',
                'It appears only in listeners with musical training',
                'It goes with exposure to Western-influenced music',
            ],
            answer: 3,
            why: 'Major cadences were heard as happier in every community except the one with minimal exposure to Western-like music. The authors tie the effect to exposure, although they cannot exclude a universal part.',
        },
    ],
    content: `## Hook: the sad chord that sounded like a question

You want the last line of the chorus to land sad, so you swap the final C major for A minor. Played after the G, it does not sound sad. It sounds as if the song swerved and is not over yet. Later you end a different song, in A minor, on the same A minor chord after an E major, and this time it sounds settled and dark.

Both times the chord had the same three notes in the same voicing. What changed was the progression leading into it, and that was enough to change what the chord said.

## Why it matters: mode is a tendency, the chord has a job

"Major is happy, minor is sad" is one of the first things many of us learn about harmony, and as a tendency it holds up. Parncutt (2014) treats the link between major and positive emotion, and minor and negative emotion, as well established in listeners, though no single explanation for it is accepted. He compares six partly related theories, among them dissonance, familiarity and the lower pitches of sad speech, and finds credible arguments for and against each.

The trouble starts when the tendency becomes a lookup table. In a song, every chord arrives with a role: the home chord, a step on the way, or a surprise. Pick the mode for the mood and ignore the role, and the chord can say something you never meant.

In the demo, listen for whether each arrival sounds like an ending or like a step on the way, and whether that changes how bright or dark the chord seems.

::demo chord-context

## Science model: the progression sets the role, the role shifts the feeling

Zhang and colleagues (2025) tested this directly. In a first experiment, listeners rated single major and minor chords for pleasantness, stability and tension. Major chords came out more pleasant and less tense, though no more stable. In a second experiment, the chords ended chord sequences. After progressions that ended stably, major endings were again rated more pleasant, more stable and less tense than minor ones. After progressions that ended unstably, the differences were no longer significant on any of the three scales. The authors conclude that the progression changes how stable and tense the last chord sounds, and that this changes how pleasant it seems. It is a single rating study, so read it as evidence that context can shrink the gap between major and minor, not as proof that it always does.

The route matters because a chord's stability depends partly on its function in the key. Bigand, Parncutt and Lerdahl (1996) had listeners rate the tension of a middle chord in sequences that started and ended on C major. The ratings reflected several influences at once: where the chord stands in the key's harmonic hierarchy, how dissonant it sounds and how the voices move into it. How much each one counted depended on the listener's musical training.

A C major triad is the home chord, I, in C major. In F major the same triad is V, the dominant, which in tonal music tends to move on to F. End a phrase on it and you get a half cadence, a pause that sounds unfinished. The notes are identical. What differs is the expectation they set up, the mechanism covered in the [lesson on expectation](/blog/why-expectation-drives-musical-emotion).

::figure major

Minor chords switch roles the same way. A minor is home in A minor. In C major it is vi, and G to A minor is the deceptive cadence: a listener who knows the style expects C and gets A minor instead.

::figure minor

How strongly the major and minor code applies also depends on who is listening. Dalla Bella and colleagues (2001) changed the tempo and the mode of happy and sad excerpts. Adults and children aged 6 to 8 used both cues to judge the mood. Five-year-olds used only tempo, and 3- and 4-year-olds could not tell happy from sad above chance. Smit and colleagues (2022) asked 170 listeners in remote communities in Papua New Guinea which of a major and a minor cadence made them happier. For cadences there was strong evidence that major was heard as happier in every community except one, the community with minimal exposure to Western-like music. The authors conclude that the emotional valence of major and minor is strongly associated with exposure to Western-influenced music, although they cannot exclude a universal part. Mode also shares the work with other cues: in the [tempo lesson](/blog/how-tempo-changes-perceived-emotion), changing tempo moved listeners' arousal while changing mode moved their mood.

## DAW experiment: one chord, two routes

1. Load a plain piano. At 90 BPM, write C, F, G, C, two beats each, with the root in the bass. Voice the last chord as C3 in the bass with C4, E4 and G4 above.
2. On a second clip, copy that final C exactly, same notes and same velocities, and write F, Bb and Gm in front of it.
3. Loop each clip twice. Score only the last chord from 1 to 7 on three scales: pleasant, stable and tense.
4. Build the minor pair the same way: Am, Dm, E, Am, and then C, F, G, Am, with the final A minor voiced as A2 under A3, C4 and E4 in both.
5. Score the two A minor endings on the same three scales.
6. Take the C ending that felt most finished and play its last chord an octave higher. Score it, then set it back and play the whole clip at 140 BPM. Score it again and note which scale moved each time.
7. Bounce all four endings, give them neutral names and ask someone who has not heard them to score them blind.

Compare the two home endings first, C in C major and A minor in A minor. That is where a gap between major and minor is most likely to show. Then compare the two away endings, C as V and A minor after G. If your scores look like the 2025 study's, the gap there is smaller and both endings mostly sound unfinished.

## Common mistake: changing the mode when the role is wrong

The common mistake is reaching for minor when a moment should feel final and sad. Placed after G in C major, A minor is a deceptive cadence, and listeners who know the style tend to hear it as a swerve rather than an ending. If you want it to land, make it the home chord: put E major before it and let the section sit in A minor.

The second mistake is treating a chart of chord moods as true for every listener. The major and minor code is strongly associated with listening history, so the listener's background and the genre they expect change how strongly it applies. The [lesson on genre expectations](/blog/listeners-bring-genre-expectations-into-your-song) picks that up.

## Producer takeaway: decide the job, then the colour

Before choosing major or minor, decide what a chord has to do: let the listener arrive, or make them lean forward. Then choose the mode for colour within that job, and try the tempo and register as well, because they change the feeling too. When a section ending feels wrong, I rewrite the chord before it first, and only then try a different final chord.

## References

- Bigand, E., Parncutt, R., & Lerdahl, F. (1996). Perception of musical tension in short chord sequences: The influence of harmonic function, sensory dissonance, horizontal motion, and musical training. *Perception & Psychophysics*, 58(1), 125-141.
- Dalla Bella, S., Peretz, I., Rousseau, L., & Gosselin, N. (2001). A developmental study of the affective value of tempo and mode in music. *Cognition*, 80(3), B1-B10.
- Parncutt, R. (2014). The emotional connotations of major versus minor tonality: One or more origins? *Musicae Scientiae*, 18(3), 324-353.
- Smit, E. A., Milne, A. J., Sarvasy, H. S., & Dean, R. T. (2022). Emotional responses in Papua New Guinea show negligible evidence for a universal effect of major versus minor music. *PLOS ONE*, 17(6), e0269597.
- Zhang, J., Li, L., Wei, L., & Wang, H. (2025). Moderating effects of chord progressions on the emotional experience of major and minor chords. *Acta Psychologica*, 253, 104690.
`,
    seo: {
        title: 'A chord\'s mood depends on how you get there | VGP Studio',
        description: 'Major is not always happy and minor is not always sad. How the progression, the chord\'s role in the key and listening history change what a chord says.',
        keywords: ['major and minor emotion', 'chord progression', 'harmonic context', 'deceptive cadence', 'songwriting harmony', 'music psychology'],
    },
};
