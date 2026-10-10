import { BlogArticle } from '../blog-data';

// The word "street": a soft consonant hiss, then the loud vowel. Times are fractions of the plot.
const WORD_LATE: [number, number][] = [
    [0, 0],
    [0.31, 0],
    [0.32, 0.2],
    [0.45, 0.24],
    [0.48, 0.95],
    [0.56, 0.8],
    [0.8, 0.45],
    [0.9, 0],
    [1, 0],
];
// The same word moved 0.16 earlier, so the vowel starts on the beat.
const WORD_ON_TIME: [number, number][] = [
    [0, 0],
    [0.15, 0],
    [0.16, 0.2],
    [0.29, 0.24],
    [0.32, 0.95],
    [0.4, 0.8],
    [0.64, 0.45],
    [0.74, 0],
    [1, 0],
];

export const post010: BlogArticle = {
    slug: 'how-lyric-rhythm-carries-emotion-before-meaning',
    title: 'Lyric rhythm carries the feeling',
    excerpt: 'A lyric that fights the beat sounds forced, however good the words. Put stresses on strong beats, open vowels on high notes and vowels on the grid.',
    category: 'songwriting',
    publishedAt: '2026-06-03',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Listeners hear emotion in a voice from its tempo, loudness and pitch, the same cues music uses, apart from what the words mean.',
        'Put stressed syllables on strong beats, and line up the start of the vowel, not the first consonant, with the grid.',
        'Give the highest notes open vowels such as "ah", because closed vowels like "ee" and "oo" have to be opened up there.',
    ],
    figures: {
        stress: {
            type: 'rhythm',
            caption:
                'The phrase "(I) can\'t forget you tonight" in one bar. Tall bars are stressed syllables. Matched, can\'t, get and night fall on beats. Mismatched, the same rhythm moved an 8th note later puts for, you and to on the beats and pushes the stresses between them.',
            alt: 'Two rows on a 16-step grid with the same six syllables. In the matched row, the three tall bars sit on beats 1, 2 and 4. In the mismatched row, short bars sit on beats 2, 3 and 4 and the tall bars fall between the beats.',
            rows: [
                {
                    label: 'Matched stress', focus: true,
                    note: 'can\'t, get, night',
                    hits: [{ step: 0, level: 1 }, { step: 2, level: 0.35 }, { step: 4, level: 1 }, { step: 6, level: 0.35 }, { step: 10, level: 0.35 }, { step: 12, level: 1 }],
                },
                {
                    label: 'Mismatched stress',
                    note: 'for, you, to',
                    hits: [{ step: 2, level: 1 }, { step: 4, level: 0.35 }, { step: 6, level: 1 }, { step: 8, level: 0.35 }, { step: 12, level: 0.35 }, { step: 14, level: 1 }],
                },
            ],
        },
        landing: {
            type: 'signal',
            caption:
                'The level of the word "street" over time. The soft "str" comes before the vowel. Put the start of the word on the beat and the vowel lands after it, so the word sounds late. Put the vowel on the beat and it sounds on time.',
            alt: 'Two level plots of the same word with a beat line. In the first, the low hiss of the consonants starts on the beat and the loud vowel begins after it. In the second, the hiss starts before the beat and the vowel begins on it.',
            rows: [
                {
                    label: 'Consonant on the beat: sounds late',
                    unipolar: true,
                    traces: [{ kind: 'envelope', points: WORD_LATE }],
                    marks: [
                        { t: 0.32, label: 'Beat' },
                        { t: 0.48, label: 'Vowel' },
                    ],
                },
                {
                    label: 'Vowel on the beat: sounds on time',
                    unipolar: true,
                    traces: [{ kind: 'envelope', points: WORD_ON_TIME }],
                    marks: [{ t: 0.32, label: 'Beat' }],
                },
            ],
        },
        vowels: {
            type: 'bars',
            caption:
                'First formant of three vowels, averages for adult men (Peterson and Barney, 1952), against a sung A4 at 440 Hz. The note sits above the first formant of "ee" and "oo", so singers have to open those vowels; "ah" still has room. Women\'s averages are higher, but the order is the same.',
            alt: 'Three horizontal bars on a scale from 0 to 800 Hz with a dashed line at 440 Hz. "ee" reaches 270 Hz and "oo" 300 Hz, both short of the line. "ah" reaches 730 Hz, well past it.',
            min: 0,
            max: 800,
            unit: 'Hz',
            bars: [
                { label: '"ee" as in heed', value: 270, display: '270' },
                { label: '"oo" as in who\'d', value: 300, display: '300' },
                { label: '"ah" as in hod', value: 730, display: '730' },
            ],
            reference: { value: 440, label: 'A4 sung, 440 Hz' },
        },
    },
    quiz: [
        {
            q: 'You edit the word "street" so the "s" starts exactly on the snare. Why does it sound late?',
            options: [
                'The s is too bright and blends into the snare',
                'The word lands at its vowel, after the beat',
                'The snare attack is faster than any consonant',
                'Long words take longer for the ear to process',
            ],
            answer: 1,
            why: 'A syllable is heard as landing near the start of its vowel, its perceptual centre. With the "str" on the beat, the vowel arrives after it, so the word drags.',
        },
        {
            q: 'Which setting gives "come back" the most natural stress?',
            options: [
                '"come" just before beat 1, "back" on beat 1',
                '"come" on beat 1, "back" on the 16th after it',
                '"come" and "back" both on weak 16th notes',
                '"come" on beat 3, "back" on the "and" of 3',
            ],
            answer: 0,
            why: 'Spoken naturally it is "come BACK", with the second syllable stronger. Putting "back" on the beat matches the stress of the words to the stress of the metre.',
        },
        {
            q: 'A male singer has to hold an A4 at the top of the chorus. Which vowel gives him the most room?',
            options: ['"ee" as in heed', '"oo" as in who\'d', '"ih" as in hid', '"ah" as in hod'],
            answer: 3,
            why: 'The first formant of "ah" averages around 730 Hz for men, well above 440 Hz. For "ee", "oo" and "ih" it sits near 270 to 390 Hz, below the note, so the singer has to open the vowel.',
        },
    ],
    content: `## Hook: the clunky message

You write a lyric line with a deep, poetic message. It looks beautiful on paper and the meaning is clear.

When you sing it over the beat, the groove disappears. The singer stumbles over the consonants and the rhythm feels clunky. You try to fix it in the mix with timing edits and compression, but the vocal still sounds forced. The words are right and the rhythm of the words is wrong, and the rhythm is what the listener feels first.

## Why it matters: the voice carries feeling apart from the words

Juslin and Laukka (2003) reviewed 104 studies of emotion in the voice and 41 studies of emotion in music performance. In both, listeners recognized the intended emotions well above chance, and the acoustic cues that signalled each emotion were similar: tempo, loudness, pitch level and movement, and timbre. Much of what a sung line feels like is carried by how it is delivered, separately from what the words say.

In a session, two things go wrong. Lines packed with consonant clusters, or with closed vowels on the high notes, make the singer work, and the effort shows as throat tension and late timing. And lines whose stressed syllables fall in weak positions sound wrong even to a listener who could not say why. Lyric-writing teachers such as Pattison (2009) treat this fit between spoken stress and musical stress as part of prosody: every element of a song working together to support what it says.

## Science model: stress, the moment a syllable lands, and vowels

**Stress meets metre.** In English, some syllables are stressed: louder, longer and often higher. Palmer and Kelly (1992) analysed songs and found that composers tend to put stressed syllables on strong metrical positions. When they tested singers, syllables were sung longer when they were stressed in the language or placed on a strong beat. When the two pull in different directions, the singer has to favour one of them, and the line tends to sound awkward.

::figure stress

**A syllable lands at its vowel.** The moment a syllable seems to happen is not the moment its sound starts. Morton, Marcus and Frankish (1976) called this moment the perceptual centre, or P-centre, and it sits near the start of the vowel. A word like "street" begins with a soft "str" that comes before the vowel. If you line the start of the word up with the beat, the vowel lands late and the word drags.

::figure landing

**Vowels and high notes.** Every vowel has resonances shaped by the mouth and throat, its formants, and the first formant sits at a different frequency for each vowel. Peterson and Barney (1952) measured averages for adult men of about 270 Hz for "ee", 300 Hz for "oo" and 730 Hz for "ah". When the sung note rises above a vowel's first formant, singers tend to open the jaw to raise that formant, which changes the vowel (Sundberg, 1987). Open vowels like "ah" have room at the top of a chorus. Closed vowels like "ee" and "oo" get modified or sound pinched.

::figure vowels

## DAW experiment: the spoken rhythm test

1. Loop the chorus beat at song tempo with only the drums playing.
2. Speak the chorus lyric over it in rhythm, on one pitch, and record it on a spare track.
3. Say each word on its own and mark its natural stress, for example "to-DAY", "BEAU-ti-ful", "come BACK".
4. Check the recording against the grid. Each stressed syllable should land on a beat or a strong 8th note, with unstressed syllables between. Where a stress falls on a weak position, change the word or move it.
5. Find the highest note of the sung chorus and its vowel. If it is "ee" or "oo", try a word with "ah" or "eh" there, or move that word to a lower note.
6. In your vocal edit, zoom in on a word that starts with a consonant cluster such as "str" or "sp". Line up the start of the vowel with the grid, not the start of the hiss, and compare it with the version where the consonant sits on the grid.
7. Sing the line again with the changes, or play back the edited take.

The words should now sit in the beat with less effort. The vowel-aligned edit sounds on time, while the consonant-aligned one drags behind the drums.

## Common mistake: the literal obsession

Some lines survive every edit because of what they literally say. Songwriters hold on to a line because it really happened, even when the words are hard to sing cleanly. A true line that cannot be sung well loses to a slightly different line that can.

The second mistake is putting closed vowels on the highest notes of the chorus. The singer has to open "ee" or "oo" up there anyway, so the word either changes shape or comes out thin and tense. Choose the word for the vowel the note needs.

## Producer takeaway: the mouth is a drum

The mouth is a drum when the lyric is honest. Write the rhythm of the line before you polish the words. Speak it over the beat and check the stresses, then give the high notes open vowels. When you edit, line up vowels, not consonants. If a word is hard to sing or breaks the groove, change it. If the rhythm of the words moves the body, the listener will stay to hear the story.

## References

- Juslin, P. N., & Laukka, P. (2003). Communication of emotions in vocal expression and music performance: Different channels, same code? *Psychological Bulletin*, 129(5), 770-814.
- Morton, J., Marcus, S., & Frankish, C. (1976). Perceptual centers (P-centers). *Psychological Review*, 83(5), 405-408.
- Palmer, C., & Kelly, M. H. (1992). Linguistic prosody and musical meter in song. *Journal of Memory and Language*, 31(4), 525-542.
- Pattison, P. (2009). *Writing Better Lyrics* (2nd ed.). Writer's Digest Books.
- Peterson, G. E., & Barney, H. L. (1952). Control methods used in a study of the vowels. *Journal of the Acoustical Society of America*, 24(2), 175-184.
- Sundberg, J. (1987). *The Science of the Singing Voice*. Northern Illinois University Press.
`,
    seo: {
        title: 'Lyric rhythm carries the feeling',
        description: 'Fit your lyric to the beat: stressed syllables on strong beats, vowels lined up with the grid and open vowels on the highest notes.',
        keywords: ['lyric rhythm', 'prosody in songwriting', 'vocal timing', 'vowels on high notes', 'songwriting tips'],
    },
};
