import { BlogArticle } from '../blog-data';

export const post108: BlogArticle = {
    slug: 'understanding-bpm-and-key-matching',
    title: 'Matching tempo and key between beats, vocals and samples',
    excerpt: 'Why a vocal, a sample and a beat fit together or clash, with the maths for stretching, transposing and setting pitch correction to the right key.',
    category: 'production-tips',
    publishedAt: '2026-01-20',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'One beat lasts 60,000 divided by the BPM in milliseconds, and a tempo exactly half or double keeps every beat on the same grid.',
        'Keys next to each other on the Camelot wheel share six or seven of their seven notes, which is why they sit together without clashing.',
        'Set pitch correction to the beat\'s key and scale, then check for borrowed notes such as the G♯ in a harmonic minor melody in A minor.',
    ],
    figures: {
        halftime: {
            type: 'rhythm',
            caption:
                'One bar at 140 BPM. With the snare on beats 2 and 4 you nod at 140. Move it to beat 3 only and it lands where beats 2 and 4 of a 70 BPM bar would fall, so the same grid feels half as fast.',
            alt: 'Three lanes on a 16-step grid. The hi-hat plays every second step. One snare lane hits on beats 2 and 4. The other snare lane hits once, on beat 3.',
            rows: [
                { label: 'Hi-hat', hits: [0, 2, 4, 6, 8, 10, 12, 14], note: 'eighths' },
                { label: 'Snare on 2 and 4', hits: [4, 12], note: 'feels like 140' },
                { label: 'Snare on 3', hits: [8], note: 'feels like 70' },
            ],
        },
        varispeed: {
            type: 'scale',
            caption:
                'Varispeed ties tempo to pitch. Each semitone multiplies the tempo by 1.0595, so a 140 BPM beat plays at 148.3 BPM one semitone up and at 132.1 BPM one semitone down.',
            alt: 'A tempo line from 120 to 160 BPM. The original sits at 140. Markers at 124.7 and 132.1 show two and one semitones down, and markers at 148.3 and 157.1 show one and two semitones up.',
            min: 120,
            max: 160,
            unit: 'BPM',
            ticks: [120, 130, 140, 150, 160],
            markers: [
                { value: 124.7, label: '-2 st' },
                { value: 132.1, label: '-1 st' },
                { value: 140, label: 'Original', strong: true },
                { value: 148.3, label: '+1 st' },
                { value: 157.1, label: '+2 st' },
            ],
        },
        shared: {
            type: 'bars',
            min: 0,
            max: 7,
            caption:
                'Notes each key shares with A minor (8A). The relative major shares all seven and a neighbour on the wheel shares six. A major, the same home note with a major scale, shares four. E♭ minor, opposite on the wheel, shares two.',
            alt: 'Bars for five keys. C major 7 of 7, D minor 6 of 7, E minor 6 of 7, A major 4 of 7, E flat minor 2 of 7.',
            bars: [
                { label: 'C major (8B)', value: 7, display: '7 of 7' },
                { label: 'D minor (7A)', value: 6, display: '6 of 7' },
                { label: 'E minor (9A)', value: 6, display: '6 of 7' },
                { label: 'A major (11B)', value: 4, display: '4 of 7', dim: true },
                { label: 'E♭ minor (2A)', value: 2, display: '2 of 7', dim: true },
            ],
        },
    },
    quiz: [
        {
            q: 'A vocal was recorded over a 140 BPM beat. Which new beat can it sit on without any stretching?',
            options: ['A beat at 120 BPM', 'A beat at 150 BPM', 'A beat at 90 BPM', 'A beat at 70 BPM'],
            answer: 3,
            why: 'One beat at 70 BPM lasts exactly two beats at 140, so every syllable still lands on the grid. The vocal now feels double-time over the slower beat.',
        },
        {
            q: 'A beat is in A minor (8A). Which key uses exactly the same seven notes?',
            options: ['A major', 'C major', 'E minor', 'D minor'],
            answer: 1,
            why: 'C major is the relative major, 8B, built from the same notes. E minor and D minor are neighbours that share six, and A major shares only four.',
        },
        {
            q: 'Your A minor melody uses G♯, but pitch correction is set to A natural minor. What happens to that note?',
            options: [
                'It passes through with no change',
                'It gets muted as an off-key note',
                'It is pulled to G or A instead',
                'It flips the plugin into A major',
            ],
            answer: 2,
            why: 'G♯ is not in A natural minor, so the plugin moves it to the nearest scale note, G or A. Add G♯ to the scale when the melody uses harmonic minor.',
        },
    ],
    content: `## Two parts that clash

You record a verse you love on one beat, then try it on another. Or you drop a sample into a session and it fights the chords. Each part sounds fine alone. Together they fall apart, because they disagree about one of two things: when the beats land, or which notes belong.

## Tempo is a grid

BPM counts beats per minute, so one beat lasts:

$$t_{\\text{beat}} = \\frac{60\\,000}{\\text{BPM}}\\ \\text{ms}$$

At 60 BPM a beat lasts one second. At 140 BPM it lasts 428.6 ms. Your flow, your breaths and the gaps between lines all sit on that grid. Move a verse recorded at 140 BPM onto a 90 BPM beat and every syllable lands in the wrong place. Stretching it to fit would make it 56 percent longer, far more than any algorithm can hide. Re-record it.

The exception is a tempo exactly half or double. At 70 BPM one beat lasts exactly two beats at 140, so a vocal recorded at 140 still lands on the grid and now feels double-time over the slower beat. Trap uses the same relationship from the other side. It is usually written around 140 BPM with the snare on beat 3, so it feels like 70.

::figure halftime

::demo tempo

## Stretching and varispeed

Time-stretching changes length without changing pitch. A change of a few percent is usually clean with a modern algorithm. The further you go, the more you hear smeared transients and a hollow, phasey tone, and vocals show it first. Work out the change as a ratio: going from 140 to 145 BPM is 145 / 140 = 1.036, a change of 3.6 percent.

Varispeed, the tape method that many samplers still use, changes speed and pitch together, like playing a record faster. Changing the tempo by a ratio moves the pitch by this many semitones:

$$n = 12 \\log_2 \\frac{\\text{BPM}_{\\text{new}}}{\\text{BPM}_{\\text{old}}}$$

One semitone is a ratio of $2^{1/12} \\approx 1.0595$, close to 6 percent. Slowed and pitched-down edits are this effect: slow a track down and it drops in pitch by the same rule.

::figure varispeed

## Key decides which notes belong

A key is a home note plus a scale. A minor uses A, B, C, D, E, F and G, and every chord in an A minor beat is built from those notes, so a hook that uses them fits. A common mistake is singing the major version of the key without noticing. A hook in A major uses C♯, which rubs against the C in the chords on every bar.

DJs use the Camelot wheel from Mixed In Key to find keys that mix well. It numbers the twelve keys like a clock, with A for minor and B for major. Keys with the same number are relative keys with the same seven notes, such as 8A, A minor, and 8B, C major. One step around the wheel is a fifth up or down, and those keys share six of their seven notes: 7A is D minor and 9A is E minor.

::figure shared

The further around the wheel you go, the fewer notes two keys share. If you are choosing beats for an EP, neighbouring keys make the jump from one song to the next feel smaller.

Key detection, in your DAW or an online tool, can report the relative major instead of the minor, because the notes are the same. For pitch correction that does not matter. For writing it does, so play the detected root under the beat and listen for the note that sounds like home.

## Pitch correction needs the right key

Pitch correction pulls each sung note to the nearest note in the scale you give it. Set the wrong key and it drags good notes to wrong ones, which sounds like a warble rather than a style.

1. Find the beat's key. It is often in the filename or the store listing, such as Cmin. Confirm it by ear.
2. Set the key and scale in the plugin, here C and minor.
3. Set the retune speed. The fastest setting gives the hard-tuned effect; slower settings correct gently. The numbers differ between plugins, so set it by ear.
4. Check for notes outside the scale. Minor-key trap and drill melodies often borrow the raised seventh of harmonic minor: G♯ in A minor, B natural in C minor. A natural minor setting pulls that note to a neighbour, so add it to the scale.

There is more on how correction changes a performance in [how pitch correction changes perceived confidence](/blog/how-pitch-correction-changes-perceived-confidence).

## Transposing a beat to fit your voice

If the hook sits too high for you, move the beat down a semitone or two. Each semitone multiplies every frequency by 1.0595. Two semitones down, an 808 on F1 at 43.7 Hz drops to D♯1 at 38.9 Hz, so pitching a beat down also pushes the bass toward the bottom of what speakers can play. Ask the producer to transpose in the project rather than pitch-shifting the finished file. The drums keep their tuning, and parts played from MIDI move without artifacts.

## Matching a sample to your session

1. Find the sample's tempo. Count the beats in the loop and time it: $\\text{BPM} = 60 \\times \\text{beats} / \\text{seconds}$. A four-bar loop has 16 beats, so if it lasts 6.86 seconds it is at about 140 BPM.
2. Find its key with detection, then confirm by humming or playing the root.
3. Stretch it to your tempo, or varispeed it if you like the change in tone.
4. Transpose by the smallest move. A sample in B minor needs 2 semitones down for an A minor session. A sample in C major needs nothing, because it already uses every note of A minor.
`,
    seo: {
        title: 'Matching tempo and key between beats, vocals and samples | VGP Studio',
        description: 'Tempo as a grid, half and double time, time-stretching and varispeed maths, relative keys and the Camelot wheel, and setting pitch correction to the right scale.',
        keywords: ['BPM', 'key matching', 'Camelot wheel', 'half-time', 'time-stretching', 'pitch correction key'],
    },
};
