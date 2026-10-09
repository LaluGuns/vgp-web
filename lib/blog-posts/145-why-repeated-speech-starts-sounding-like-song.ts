import { BlogArticle } from '../blog-data';

export const post145: BlogArticle = {
    slug: 'why-repeated-speech-starts-sounding-like-song',
    title: 'Why repeated speech starts to sound like song',
    excerpt: 'Loop a spoken phrase and it can start to sound sung, with no change to the audio. What makes a phrase turn, who hears it, and how to mine it for a hook.',
    category: 'music-psychology',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Loop a short spoken line exactly, with no pitch shifts or reordering, and hum the tune you start to hear: that tune already fits the words.',
        'Phrases with steady pitch inside each syllable turn into song most readily, so choose or edit spoken samples with that in mind.',
        'A melody you hear after an hour of looping may be inaudible to someone who hears the line once, so support it with an instrument or a sung version.',
    ],
    figures: {
        conditions: {
            type: 'curve',
            caption:
                'The direction of Deutsch, Henthorn and Lapidis\'s (2011) first experiment. The first and tenth hearings were the same recording. Exact repeats in between moved listeners from speech to song, slightly transposed repeats moved them only a little, and jumbled syllables did not move them. A sketch, not their data.',
            alt: 'Three straight lines from first hearing to tenth hearing on a speech-to-song axis. The exact repeats line climbs steeply toward song. The transposed line rises slightly. The dashed jumbled line stays flat near speech.',
            x: ['First hearing', 'Tenth hearing'],
            xShort: ['First', 'Tenth'],
            yLabel: 'Sounds like song',
            straight: true,
            series: [
                { label: 'Exact repeats', values: [0.15, 0.82] },
                { label: 'Transposed repeats', values: [0.15, 0.3] },
                { label: 'Jumbled syllables', values: [0.15, 0.15], dashed: true },
            ],
        },
        glide: {
            type: 'signal',
            caption:
                'An exaggerated sketch of pitch over one five-syllable phrase. In Tierney and colleagues\' (2013) audiobook phrases, the ones that turned into song moved on average 27.6 semitones per second within a syllable, against 40 for the ones that stayed speech. Level syllables give the ear notes to hold on to.',
            alt: 'Two pitch tracks over a short phrase. In the top one, the pitch slides up or down inside every syllable. In the bottom one, each syllable holds a level pitch and the line steps between them.',
            rows: [
                {
                    label: 'Gliding syllables',
                    unipolar: true,
                    traces: [
                        {
                            kind: 'envelope',
                            points: [
                                [0.02, 0.55], [0.2, 0.42], [0.22, 0.48], [0.4, 0.72], [0.42, 0.7],
                                [0.6, 0.48], [0.62, 0.56], [0.8, 0.38], [0.82, 0.44], [0.98, 0.2],
                            ],
                        },
                    ],
                },
                {
                    label: 'Level syllables',
                    unipolar: true,
                    traces: [
                        {
                            kind: 'envelope',
                            points: [
                                [0.02, 0.5], [0.2, 0.5], [0.22, 0.62], [0.4, 0.62], [0.42, 0.7],
                                [0.6, 0.7], [0.62, 0.55], [0.8, 0.55], [0.82, 0.38], [0.98, 0.38],
                            ],
                        },
                    ],
                },
            ],
        },
        ratings: {
            type: 'bars',
            caption:
                'Mean ratings from Margulis, Simchy-Gross and Black (2015), on a scale from 1 (exactly like speech) to 5 (exactly like singing), before and after ten repeats. Languages that are hard for English speakers to pronounce shifted most. English shifted least, and even the largest shift stayed below the midpoint.',
            alt: 'Six horizontal bars on a scale from 1 to 5 with a reference line at 3. English goes from 1.08 before to 1.33 after, easy languages from 1.38 to 1.86, hard languages from 1.56 to 2.40.',
            min: 1,
            max: 5,
            reference: { value: 3, label: 'Midpoint' },
            bars: [
                { label: 'English, before', value: 1.08, display: '1.08', dim: true },
                { label: 'English, after', value: 1.33, display: '1.33' },
                { label: 'Easy, before', value: 1.38, display: '1.38', dim: true },
                { label: 'Easy, after', value: 1.86, display: '1.86' },
                { label: 'Hard, before', value: 1.56, display: '1.56', dim: true },
                { label: 'Hard, after', value: 2.4, display: '2.40' },
            ],
        },
    },
    quiz: [
        {
            q: 'In Deutsch and colleagues\' first experiment, which change to the repeats stopped the phrase from turning into song?',
            options: [
                'Shifting each repeat slightly up or down in pitch',
                'Leaving a short silence between the repeats',
                'Playing the phrase ten times instead of five',
                'Using a phrase spoken in the listeners\' own language',
            ],
            answer: 0,
            why: 'With slightly transposed repeats the ratings stayed in the speech range. The transformation needed the same phrase at the same pitch, with the syllables in the same order.',
        },
        {
            q: 'Tierney and colleagues compared audiobook phrases that turned into song with matched phrases that did not. What set the song-like ones apart?',
            options: [
                'Louder stressed syllables',
                'A faster syllable rate',
                'Steadier pitch within each syllable',
                'Longer pauses between the words',
            ],
            answer: 2,
            why: 'The song-like phrases had less pitch movement inside each syllable, 27.6 against 40 semitones per second on average. Duration and syllable rate did not differ reliably.',
        },
        {
            q: 'You have looped a spoken sample for an hour and hear a clear melody in it. A friend hears it twice and says it is just someone talking. What is the most likely reason?',
            options: [
                'Their monitors hide the pitch of the voice',
                'Repetition changed what you hear, and they have not had it',
                'The sample needs more compression to bring out pitch',
                'Spoken phrases cannot carry a melody at all',
            ],
            answer: 1,
            why: 'In Deutsch\'s second experiment, listeners who heard the phrase once repeated it back as speech, while those who heard it ten times sang it. Your hour of looping put you in the second group.',
        },
    ],
    content: `## Hook: the voice memo that started singing

You pull a spoken line from an old voice memo for an intro and loop it while you build the beat. Twenty minutes later you cannot hear it as talking any more. The words seem to sit on notes, and you are humming them. Then a friend walks in, hears the loop twice and asks who is talking.

Nothing in the audio changed. You heard it many more times than your friend did, and for some phrases, repetition alone is enough to turn speech into song.

## Why it matters: a tool and a trap

The effect gives you something useful. A looped spoken line can hand you a melody and a rhythm that already fit the words, which is hard to get by writing a tune first and forcing a lyric onto it. The lesson on [lyric rhythm](/blog/how-lyric-rhythm-carries-emotion-before-meaning) explains why that fit matters.

It also misleads you. After an hour of looping, you hear a tune that a first-time listener may not hear at all, so a vocal chop that sounds like a hook in your session can sound like stray dialogue to everyone else.

## Science model: exact repeats, level syllables and the listener

Diana Deutsch found the effect in 1995 while editing spoken commentary for a CD and looping the phrase "sometimes behave so strangely". Deutsch, Henthorn and Lapidis (2011) then tested it. In the first experiment, listeners heard the phrase ten times and rated it on a five-point scale from "exactly like speech" to "exactly like singing". When every repeat was identical, ratings moved firmly toward song. When the repeats in between were transposed slightly, or when the syllables came in a jumbled order, the shift did not happen.

::figure conditions

In the second experiment, listeners heard the phrase once or ten times and then said it back. After one hearing they spoke it. After ten they sang it, and their pitches matched the original speech more closely than after one hearing. The sung versions were closer still to a simple tune in a key. Repetition did more than make the phrase feel musical: listeners heard and reproduced specific notes. Deutsch's listeners had musical training, but Vanden Bosch der Nederlanden, Hannon and Snyder (2015) replicated the effect in casual listeners with none, and confirmed that transposing the repeats disrupts it.

Not every phrase turns. Tierney, Dick, Deutsch and Sereno (2013) searched audiobooks and found 24 phrases that most listeners heard as song when repeated, then matched each with a phrase from the same speaker that stayed speech. The clearest acoustic difference was pitch movement inside syllables: the song-like phrases glided less. Their stressed syllables were only slightly more regular in timing, a difference that was not statistically reliable. Falk, Rathcke and Dalla Bella (2014) edited the pitch and timing of spoken phrases directly. Stable pitch targets made the transformation happen more often and sooner than scalar intervals did, and recurring contrasts between long and short syllables helped. Making the beat perfectly regular did not.

::figure glide

The listener matters as well. Margulis, Simchy-Gross and Black (2015) played 24 native English speakers, most without music training, the same short passage read in seven languages, each repeated ten times. Languages that are hard for English speakers to pronounce shifted most toward song. English shifted least, and that change was not statistically reliable. Regular or irregular gaps between repeats made no difference. The ratings also show the size of the effect: on average, even the strongest shift stayed on the speech side of the scale. In a study of 20 adults, Jaisin and colleagues (2016) found a weaker effect in native speakers of tonal languages such as Thai and Mandarin, where pitch carries word meaning.

::figure ratings

The picture that fits these results: once the words stop demanding attention, the ear treats the pitch pattern as a tune, and level syllables give it notes to hold. A small study set and a few phrases sit behind each finding, so expect your own phrases to vary.

## DAW experiment: mine a spoken line for its tune

1. Record yourself saying a short line of five to eight syllables in a natural speaking voice, or take one from a voice memo you own. Trim it to about two seconds.
2. Loop it ten times with about one second of silence between repeats, with no beat underneath. Rate it from 1 (speech) to 5 (song) after the first and the tenth repeat.
3. On the tenth repeat, hum along and record the hum on a new track.
4. Convert the hum to MIDI with your DAW's audio-to-MIDI function, or find the notes by ear on a keyboard. Open the spoken take in a pitch editor and compare where each syllable sits and how far it glides.
5. Duplicate the loop and transpose every second repeat up one semitone with formants preserved. Listen whether the tune fades, as it did in Deutsch's transposed condition.
6. Try a second line that glides a lot, such as an excited question, and compare how quickly each one turns.
7. Write a sung hook from the MIDI notes with the same words. Play the spoken loop and the sung hook once each to someone who has not heard either, and ask what they heard in each.

## Common mistake: trusting a tune only you can hear

The first mistake is building a hook on a spoken sample because it sounds melodic after an hour of looping. Your listeners hear it far fewer times before the next section starts. If the tune matters, double it with an instrument, sing it, or let the sample repeat several times before the part that depends on it.

The second mistake is chopping a spoken phrase into a new order every bar, or pitching each repeat to follow the chords, and then wondering why it stopped sounding like a melody. Deutsch's jumbled and transposed conditions are exactly those edits. Keep at least one exact, untouched repeat if you want the effect.

Repetition is doing other work here too. The lesson on [repetition](/blog/why-repetition-becomes-addictive-instead-of-boring) covers how it changes attention to a hook in general.

## Producer takeaway: let the loop write the first draft

Before you write a melody for a line, speak it, loop it and listen for the tune it already has. Pick lines whose syllables hold their pitch, keep the repeats exact, and transcribe what you hum. Then check it on fresh ears: if the tune only exists after twenty loops, give it an instrument or a voice that carries it from the first bar.

## References

- Deutsch, D., Henthorn, T., & Lapidis, R. (2011). Illusory transformation from speech to song. *Journal of the Acoustical Society of America*, 129(4), 2245-2252.
- Falk, S., Rathcke, T., & Dalla Bella, S. (2014). When speech sounds like music. *Journal of Experimental Psychology: Human Perception and Performance*, 40(4), 1491-1506.
- Jaisin, K., Suphanchaimat, R., Figueroa Candia, M. A., & Warren, J. D. (2016). The speech-to-song illusion is reduced in speakers of tonal (vs. non-tonal) languages. *Frontiers in Psychology*, 7, 662.
- Margulis, E. H., Simchy-Gross, R., & Black, J. L. (2015). Pronunciation difficulty, temporal regularity, and the speech-to-song illusion. *Frontiers in Psychology*, 6, 48.
- Tierney, A., Dick, F., Deutsch, D., & Sereno, M. (2013). Speech versus song: Multiple pitch-sensitive areas revealed by a naturally occurring musical illusion. *Cerebral Cortex*, 23(2), 249-254.
- Vanden Bosch der Nederlanden, C. M., Hannon, E. E., & Snyder, J. S. (2015). Everyday musical experience is sufficient to perceive the speech-to-song illusion. *Journal of Experimental Psychology: General*, 144(2), e43-e49.
`,
    seo: {
        title: 'Why repeated speech starts to sound like song | VGP Studio',
        description: 'The speech-to-song illusion: why a looped spoken phrase starts to sound sung, what makes a phrase turn, and how to mine a spoken line for a hook.',
        keywords: ['speech-to-song illusion', 'Diana Deutsch', 'vocal chops', 'melody writing', 'music perception', 'music psychology'],
    },
};
