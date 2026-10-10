import { BlogArticle } from '../blog-data';

export const post108: BlogArticle = {
    slug: 'understanding-bpm-and-key-matching',
    title: 'Matching tempo and key between beats, vocals and samples',
    excerpt: 'Why a vocal, a sample and a beat fit together or clash, with the maths for stretching, transposing and setting pitch correction to the right key.',
    category: 'production-tips',
    publishedAt: '2026-01-20',
    updatedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'One beat lasts 60,000 divided by the BPM in milliseconds, and a tempo exactly half or double keeps every beat on the same grid.',
        'Keys next to each other on the Camelot wheel share six or seven of their seven notes, which is why they sit together without clashing.',
        'Set pitch correction to the beat\'s key and scale, then check for borrowed notes such as the G♯ in a harmonic minor melody in A minor.',
    ],
    figures: {
        halftime: {
            type: 'rhythm',
            caption:
                'One bar at 140 BPM. With the snare on beats 2 and 4 you nod at 140. Move it to beat 3 only and the bar holds two beats at 70 BPM with the snare on the second, a backbeat at half the tempo, so the same grid feels half as fast.',
            alt: 'Three lanes on a 16-step grid. The hi-hat plays every second step. One snare lane hits on beats 2 and 4. The other snare lane hits once, on beat 3.',
            rows: [
                { label: 'Hi-hat', hits: [0, 2, 4, 6, 8, 10, 12, 14], note: 'eighths' },
                { label: 'Snare on 2 and 4', hits: [4, 12], note: 'feels like 140' },
                { label: 'Snare on 3', hits: [8], note: 'feels like 70', focus: true },
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
                { value: 124.7, label: '-2 semitones' },
                { value: 132.1, label: '-1 semitone', strong: true },
                { value: 140, label: 'Original' },
                { value: 148.3, label: '+1 semitone', strong: true },
                { value: 157.1, label: '+2 semitones' },
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
    content: `## Hook: the verse that fits one beat and fights another

You record a verse you love over one beat, then the producer sends a better one and you drop the vocal on top. Every syllable lands a little off the grid, and the hook rubs against the chords on every bar. Or you pull a sample into a session and it clashes with the keys even though both sound fine alone.

The parts disagree about one of two things: when the beats land, or which notes belong.

## Why it matters: tempo and key are fixed in the take

A sung or rapped take carries its tempo and its key with it. Flow, breaths and the gaps between lines sit on the grid it was recorded to, and every note sits on a pitch. Move the take to a new beat and both have to match, or something has to be stretched, transposed or re-recorded. Knowing which moves are clean and which ones damage the take saves sessions.

## Science model: two grids, one for time and one for pitch

BPM counts beats per minute, so one beat lasts:

$$t_{\\text{beat}} = \\frac{60\\,000}{\\text{BPM}}\\ \\text{ms}$$

At 140 BPM a beat lasts 428.6 ms. Move a verse recorded at 140 onto a 90 BPM beat and every syllable lands in the wrong place; stretching it to fit makes it 56 percent longer. The exception is a tempo exactly half or double. At 70 BPM one beat lasts exactly two beats at 140, so the vocal still lands on the grid and now feels double-time. Trap uses the same relationship: written around 140 with the snare on beat 3, it feels like 70.

::figure halftime

Time-stretching changes length without changing pitch, by cutting the audio into short overlapping frames and laying them out again at a new spacing. Small changes are clean. Larger ones smear transients and give sustained sounds a hollow, phasey tone, the typical artefacts of these methods (Driedger and Müller, 2016). Work out the change as a ratio: 140 to 145 BPM is 145 / 140 = 1.036, a 3.6 percent stretch.

Varispeed, the tape method many samplers still use, changes speed and pitch together. Changing the tempo by a ratio moves the pitch by:

$$n = 12 \\log_2 \\frac{\\text{BPM}_{\\text{new}}}{\\text{BPM}_{\\text{old}}}$$

One semitone is a ratio of $2^{1/12} \\approx 1.0595$, close to 6 percent. Slowed and pitched-down edits are this effect.

::figure varispeed

The pitch grid is the key: a home note plus a scale. A minor uses A, B, C, D, E, F and G, and a hook built from those notes fits an A minor beat. The Camelot wheel from Mixed In Key numbers the twelve keys like a clock, A for minor and B for major. Keys with the same number share all seven notes (8A, A minor, and 8B, C major). One step around the wheel is a fifth away and shares six.

::figure shared

Hear the grid side of this: the same beat from 60 to 160 BPM. Notice which tempos feel like halves or doubles of each other.

::demo tempo

## DAW experiment: match a sample, then set pitch correction

Steps 5 to 7 need a pitch corrector with key and scale settings, which several DAWs include.

1. Find the sample's tempo. Count the beats in the loop and time it: $\\text{BPM} = 60 \\times \\text{beats} / \\text{seconds}$. A four-bar loop has 16 beats, so if it lasts 6.86 seconds it is at about 140 BPM.
2. Find its key with your DAW's detection or an online tool, then confirm by playing the root under it. Detection can report the relative major instead of the minor, because the notes are the same.
3. Stretch it to your session tempo. Try a 3 percent change and a 10 percent change and listen to the drums in the sample for smearing.
4. Transpose by the smallest move. A sample in B minor needs 2 semitones down for an A minor session. One in C major needs nothing: it already uses every note of A minor.
5. On your vocal, set the pitch correction key and scale to the beat's, such as C minor.
6. Sing a line that uses the raised seventh, B natural in C minor. With the plugin on natural minor, listen to it drag that note to a neighbour. Add the note to the scale and listen again.
7. Set the retune speed by ear: fastest for the hard-tuned effect, slower for gentle correction.

## Common mistake: trusting the detector and the default scale

The common mistake is setting pitch correction to whatever the key detector reported and leaving the scale on natural minor. Minor-key trap and drill melodies often borrow the raised seventh of harmonic minor, G♯ in A minor. A natural minor setting pulls it to G or A, and the line warbles. Check the melody's notes against the scale before you blame the singer.

The second is stretching too far. Past a few percent, re-recording the part at the new tempo usually sounds better than any algorithm. And when a hook sits too high, ask the producer to transpose the beat in the project rather than pitch-shifting the finished file: each semitone multiplies every frequency by 1.0595, so two semitones down takes an 808 on F1 from 43.7 Hz to D♯1 at 38.9 Hz, and the drums would be retuned with it.

## Producer takeaway: check both grids before you commit

Before you move a part between projects, check the tempo ratio and the key. Exact halves and doubles keep the grid; small stretches are clean; anything bigger wants a new take. Neighbouring keys share six notes, relative keys share all seven, and pitch correction needs the scale the melody really uses. More on how correction changes a performance is in the [lesson on pitch correction and confidence](/blog/how-pitch-correction-changes-perceived-confidence).

## References

- Driedger, J., & Müller, M. (2016). A review of time-scale modification of music signals. *Applied Sciences*, 6(2), 57.
`,
    seo: {
        title: 'Matching tempo and key across beats and vocals | VGP Studio',
        description: 'Tempo as a grid, half and double time, stretching and varispeed maths, relative keys on the Camelot wheel, and pitch correction set to the right scale.',
        keywords: ['BPM', 'key matching', 'Camelot wheel', 'half-time', 'time-stretching', 'pitch correction key'],
    },
};
