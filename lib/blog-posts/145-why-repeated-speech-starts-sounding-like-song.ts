import { BlogArticle } from '../blog-data';

export const post145: BlogArticle = {
    slug: 'why-repeated-speech-starts-sounding-like-song',
    title: 'Why repeated speech starts to sound like song',
    excerpt: 'Loop a spoken phrase and it can start to sound sung, with no change to the audio. What makes a phrase turn, who hears it, and how to mine it for a hook.',
    category: 'music-psychology',
    publishedAt: '2026-10-09',
    readingTime: 8,
    summary: [
        'Loop a short spoken line exactly, with no pitch shifts or reordering, and hum the tune you start to hear: that tune already fits the words.',
        'Phrases with steady pitch inside each syllable turn into song most readily, so choose or edit spoken samples with that in mind.',
        'A melody you hear after an hour of looping may be inaudible to someone who hears the line once, so support it with an instrument or a sung version.',
    ],
    figures: {
        conditions: {
            type: 'bars',
            caption:
                'Mean ratings in Deutsch, Henthorn and Lapidis\'s (2011) first experiment, read approximately from their Figure 2, on a scale from 1 (exactly like speech) to 5 (exactly like singing). The first and tenth hearings were the same recording in every condition. With exact repeats in between, the tenth hearing crossed into song. Slightly transposed repeats moved it a little toward song but left it on the speech side, and with jumbled syllables it barely moved.',
            alt: 'Six horizontal bars on a scale from 1 to 5 with a reference line at 3. Exact repeats go from about 1.3 at the first hearing to 3.8 at the tenth. Transposed repeats go from about 1.1 to 1.9. Jumbled repeats go from about 1.5 to 1.6.',
            min: 1,
            max: 5,
            reference: { value: 3, label: 'Midpoint' },
            bars: [
                { label: 'Exact, first', value: 1.33, display: '1.3', dim: true },
                { label: 'Exact, tenth', value: 3.83, display: '3.8' },
                { label: 'Transposed, first', value: 1.1, display: '1.1', dim: true },
                { label: 'Transposed, tenth', value: 1.94, display: '1.9' },
                { label: 'Jumbled, first', value: 1.5, display: '1.5', dim: true },
                { label: 'Jumbled, tenth', value: 1.55, display: '1.6' },
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
            q: 'You loop a spoken line as a hook and pitch each repeat a semitone up or down so it follows the chords. What do the studies predict for the melody you hoped people would hear in it?',
            options: [
                'It is less likely to appear than with exact repeats',
                'It appears sooner, because the pitches now fit the key',
                'Nothing changes, because the words and timing are the same',
                'It appears only if the syllables are reordered as well',
            ],
            answer: 0,
            why: 'In Deutsch and colleagues\' transposed condition, repeats shifted by two-thirds of a semitone or more moved ratings only slightly toward song, and they stayed on the speech side. Vanden Bosch der Nederlanden and colleagues also found that transposing the repeats disrupts the effect. Keep at least one exact repeat if you want the tune.',
        },
        {
            q: 'You have two spoken lines from one narrator to loop for a hook. In the pitch editor, line A slides up or down inside most syllables, while line B holds a fairly level pitch on each syllable and steps between them. Which is more likely to start sounding sung?',
            options: [
                'Line A, because its pitch already moves like a melody',
                'Whichever has the more even gaps between stressed syllables',
                'Either, once you tune the steps between syllables to a scale',
                'Line B, because level syllables give the ear notes to hold',
            ],
            answer: 3,
            why: 'In Tierney and colleagues\' audiobook phrases, the ones that turned into song glided less inside each syllable, 27.6 against 40 semitones per second on average, and their stressed syllables were only slightly more regular in timing. Falk and colleagues found that level pitch on the syllables did more than fitting the steps to a scale.',
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

Hearing some spoken phrases over and over is enough to make them sound sung, with no change to the audio.

## Why it matters: a tool and a trap

The effect gives you something useful. A looped spoken line can hand you a melody and a rhythm that already fit the words, which is hard to get by writing a tune first and forcing a lyric onto it. The lesson on [lyric rhythm](/blog/how-lyric-rhythm-carries-emotion-before-meaning) explains why that fit matters.

It also misleads you. After an hour of looping, you hear a tune that a first-time listener may not hear at all, so a vocal chop that sounds like a hook in your session can sound like stray dialogue to everyone else.

## Science model: exact repeats, level syllables and the listener

Diana Deutsch came across the effect in 1995 while preparing the spoken commentary for a CD of musical illusions: a phrase from it, "sometimes behave so strangely", started to sound sung after she had played it several times. Deutsch, Henthorn and Lapidis (2011) then tested it. In the first experiment, listeners heard the phrase ten times and rated it on a five-point scale from "exactly like speech" to "exactly like singing". When every repeat was identical, the mean rating rose from about 1.3 to about 3.8, well past the midpoint. When the repeats in between were transposed by two-thirds of a semitone or more, up or down, the rating moved only slightly toward song, to about 1.9, and stayed on the speech side. When the syllables came in a jumbled order, the last hearing still sounded like speech. Neither condition produced the illusion, and the two did not differ reliably from each other.

::figure conditions

In the second experiment, listeners heard the phrase once or ten times and then said it back. After one hearing they spoke it. After ten they sang it, and their pitches matched the original speech more closely than after one hearing. The sung versions were closer still to a simple tune in a key. Ten repeats left listeners with specific notes in their heads. Deutsch's listeners had musical training, but Vanden Bosch der Nederlanden, Hannon and Snyder (2015) replicated the effect in casual listeners with none, and confirmed that transposing the repeats disrupts it.

Not every phrase turns. Tierney, Dick, Deutsch and Sereno (2013) searched audiobooks and found 24 phrases that most listeners heard as song when repeated and 24 that stayed speech, both sets taken from the same three readers in the same proportions. The clearest acoustic difference was pitch movement inside syllables: the song-like phrases glided less. Their stressed syllables were only slightly more regular in timing, a difference that was not statistically reliable. Falk, Rathcke and Dalla Bella (2014) compared spoken phrases that differed in specific pitch and timing properties. Level pitch targets on the syllables made the transformation happen more often and sooner than making the steps between syllables match a musical scale, and recurring contrasts between long and short syllables helped. A regular beat within and across repeats did not help.

::figure glide

The listener matters as well. Margulis, Simchy-Gross and Black (2015) played 24 native English speakers, most without music training, a segment of under three seconds cut from the same passage read in seven languages, each repeated ten times. Languages that are hard for English speakers to pronounce shifted most toward song. English shifted least, and that change was not statistically reliable. Regular or irregular gaps between repeats made no difference. The ratings also show the size of the effect: on average, even the strongest shift stayed on the speech side of the scale. In a study of 20 adults, Jaisin and colleagues (2016) found a weaker effect in native speakers of tonal languages such as Thai and Mandarin, where pitch carries word meaning.

::figure ratings

A reading that fits these results, and close to the one Margulis and colleagues give for the language effect, is that the more readily a phrase is processed as speech, the harder it is to hear as song. Level syllables then give the ear notes to hold. Each finding rests on small samples and a handful of phrases, so expect your own lines to vary.

## DAW experiment: mine a spoken line for its tune

1. Record yourself saying a short line of five to eight syllables in a natural speaking voice, or take one from a voice memo you own. Trim it to about two seconds.
2. Loop it ten times with about one second of silence between repeats, with no beat underneath. Rate it from 1 (speech) to 5 (song) after the first and the tenth repeat.
3. On the tenth repeat, hum along and record the hum on a new track.
4. Convert the hum to MIDI with your DAW's audio-to-MIDI function, or find the notes by ear on a keyboard. Open the spoken take in a pitch editor (a free one will do if your DAW has none) and compare where each syllable sits and how far it glides.
5. Duplicate the loop and transpose each repeat between the first and the last by about one semitone, alternating up and down, with formants preserved. Listen for whether the tune fades, as it did in Deutsch's transposed condition.
6. Try a second line that glides a lot, such as an excited question, and compare how quickly each one turns.
7. Write a sung hook from the MIDI notes with the same words. Play the spoken loop and the sung hook once each to someone who has not heard either, and ask what they heard in each.

## Common mistake: trusting a tune only you can hear

After an hour of looping, a spoken sample sounds melodic to you, so you build the hook on it. Your listeners hear it far fewer times before the next section starts. If the tune matters, double it with an instrument, sing it, or let the sample repeat several times before the part that depends on it.

The second mistake is chopping a spoken phrase into a new order every bar, or pitching each repeat to follow the chords, and then wondering why it stopped sounding like a melody. Those edits are close to Deutsch's jumbled and transposed conditions. Keep at least one exact, untouched repeat if you want the effect.

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
