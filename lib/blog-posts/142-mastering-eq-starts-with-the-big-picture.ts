import { BlogArticle } from '../blog-data';

export const post142: BlogArticle = {
    slug: 'mastering-eq-starts-with-the-big-picture',
    title: 'Mastering EQ starts with the big picture',
    excerpt: 'Fix the overall tilt of a master before you chase analyzer peaks, many of which are the song\'s own notes, and pick references from the right era.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Describe the master against level-matched references in one broad word, such as darker or heavier, and try a gentle tilt before any narrow move.',
        'Before you cut an analyzer peak, play two sections with different chords: a peak that moves with the harmony is a note, and only a peak that stays put is a candidate for a narrow cut.',
        'Choose references from the same era and substyle as your record, because the amount of low end in hit records has changed over the decades.',
    ],
    figures: {
        peaks: {
            type: 'spectrum',
            mode: 'level',
            range: [30, 1000],
            caption:
                'An analyzer over a bass line. Under an A chord the tallest peaks sit at 55, 110 and 165 Hz, the bass note and its harmonics. Under a D chord they move to 73, 147 and 220 Hz. A ring that stays at 180 Hz under both chords is the kind of peak a narrow cut is for.',
            alt: 'Energy against frequency from 30 Hz to 1 kHz. A dotted series of falling peaks starts at 55 Hz and a dashed series starts at 73 Hz. A narrow solid bump at 180 Hz stands between them as a third curve.',
            marks: [
                { f: 55, label: 'A1' },
                { f: 73.4, label: 'D2' },
                { f: 180, label: 'Ring' },
            ],
            curves: [
                { kind: 'harmonics', f0: 55, count: 12, rolloff: 1.2, label: 'Bass on A', dotted: true },
                { kind: 'harmonics', f0: 73.4, count: 9, rolloff: 1.2, label: 'Bass on D', dashed: true },
                { kind: 'hump', center: 180, width: 0.08, level: 0.35, label: 'Ring under both' },
            ],
        },
        notes: {
            type: 'bars',
            caption:
                'How much a 4 dB cut at 55 Hz with a Q of 8 takes off each note of a bass line, from the filter maths. The A loses the full 4 dB, the B just under 1 dB, and the D and E almost nothing, so the cut changes the balance between the notes.',
            alt: 'Five horizontal bars on a scale from 0 to 4 dB. A1 at 55 Hz loses 4 dB, B1 at 62 Hz 0.9 dB, C sharp 2 at 69 Hz 0.3 dB, D2 at 73 Hz 0.2 dB, E2 at 82 Hz 0.1 dB.',
            min: 0,
            max: 4,
            unit: 'dB',
            bars: [
                { label: 'A1, 55 Hz', value: 4, display: '4.0 dB' },
                { label: 'B1, 62 Hz', value: 0.9, dim: true },
                { label: 'C♯2, 69 Hz', value: 0.3, dim: true },
                { label: 'D2, 73 Hz', value: 0.2, dim: true },
                { label: 'E2, 82 Hz', value: 0.1, dim: true },
            ],
        },
    },
    quiz: [
        {
            q: 'A bell with a Q of 8 spans about 0.18 octave. You cut 4 dB at 55 Hz on a master. What happens to a bass line that plays A1 (55 Hz) and D2 (73 Hz)?',
            options: [
                'Both notes lose about 4 dB, so the line stays even',
                'Only the D gets quieter, because 73 Hz is louder',
                'Neither changes, because the cut is too narrow to hear',
                'Every A gets about 4 dB quieter and the D barely changes',
            ],
            answer: 3,
            why: 'At 73 Hz the cut is only about 0.2 dB deep. The move changes the balance between the notes of the bass line, which is a mix decision made by accident.',
        },
        {
            q: 'An analyzer shows a peak at 147 Hz in the chorus. How do you tell whether it is a resonance?',
            options: [
                'Check whether it is louder than every other peak',
                'Play sections with other chords and see if it stays put',
                'Cut it 3 dB and see whether the analyzer looks smoother',
                'Compare it with the same frequency on a pink noise curve',
            ],
            answer: 1,
            why: 'Peaks from notes move when the harmony changes. A resonance or ring sits at the same frequency whatever is being played, and that is the kind of peak a narrow cut is for.',
        },
        {
            q: 'Your mix seems to have too little low end next to a reference. Before boosting, what should you check about the reference?',
            options: [
                'That it comes from the same era and substyle as your record',
                'That it was mastered louder than -14 LUFS integrated',
                'That its analyzer curve is smoother than your own mix',
                'That it uses the same tempo and the same key as your song',
            ],
            answer: 0,
            why: 'Chart data from 1955 to 2016 shows the low end growing relative to the rest over the decades, so a reference from another era or substyle can ask for a different amount of bass. Level-match it as well.',
        },
    ],
    content: `## Hook: the notch that ate the bass line

The master sounds a little dark and heavy. You open an analyzer and see a tall spike at 55 Hz and a few bumps in the low mids, so you notch each one. The analyzer looks smoother. The master sounds thinner, the bass line now jumps out on some notes and hides on others, and it still sounds dark.

The spike at 55 Hz was the bass player's A, the root of the song. The darkness was the slope of the whole spectrum, which no single notch can change.

## Why it matters: broad problems and narrow problems need different tools

On a master, the first question is which kind of problem you have. A broad one (too dark, too bright, too heavy) is heard all through the song and in every instrument. A narrow one, such as a ringing snare or a harsh resonance in a guitar, sits at one frequency whatever the music is doing. A broad problem wants a broad, gentle move. A narrow problem may justify a narrow cut, but only once you know it is a defect and not part of the song.

An analyzer cannot tell you which is which. It shows where the energy is, and in music much of that energy is the notes being played.

::figure peaks

## Science model: tilt, bandwidth and what a peak means

Released music shares a broad long-term shape. Pestana and colleagues (2013) analysed the long-term spectra of a large set of popular commercial recordings from 1950 to 2010 and found a consistent leaning toward a target curve shaped by industry practice. A master that sounds dark or bright usually differs from that shape in its slope, so the usual fix is a tilt: lower one end and raise the other around a pivot.

Bandwidth decides how much of the music a move touches. For a bell, Q and bandwidth $BW$ in octaves are related by (Toy, 2021):

$$\\frac{1}{Q} = 2 \\sinh\\left( \\frac{\\ln 2}{2} \\, BW \\right)$$

A Q of 0.7 spans about 1.9 octaves, the kind of small, broad move the [lesson on mastering and translation](/blog/how-mastering-changes-translation-not-personality) shows. A Q of 8 spans about 0.18 octave, roughly a whole tone. That is narrow enough to catch a single note, which is the problem: a 4 dB cut at 55 Hz turns down every A the bass plays and leaves the D at 73 Hz almost untouched. You have rebalanced the bass line from the master.

::figure notes

The test for a resonance is movement. A peak that comes from notes moves when the chords change. A peak that sits at the same frequency under every chord, and that you can hear as a ring or an edge, is a candidate for a narrow cut.

Level matters as much as shape. Loudness meters following ITU-R BS.1770 weight the upper frequencies up by about 4 dB before measuring, and a brighter master also tends to sound more exciting on first listen. A high-shelf boost therefore raises both the reading and the impression. Match short-term loudness after every EQ move before you judge it.

The demo plays chords through one filter with the spectrum drawn live. Watch the peaks the chord notes make, then sweep the cutoff: the whole sound gets darker or brighter together. Raise the resonance and one narrow region starts to stick out.

::demo filter

The reference you compare against sets the target slope, and that target has moved over time. Hove, Vuust and Stupacher (2019) measured songs from the Billboard Hot 100 between 1955 and 2016. Loudness rose over the period, and when they controlled for overall level, only the lowest frequency bands showed an increase. Two records with the same genre tag but thirty years apart can disagree about how much low end is right, so choose references from the era and substyle of the record you are making.

## DAW experiment: broad first, narrow only if it survives

1. Load your mix and two or three references from the same substyle and era. Level-match the choruses by short-term loudness, as the [lesson on reference tracks](/blog/why-reference-tracks-are-calibration-not-imitation) describes.
2. Switch between your mix and each reference and describe the difference in one broad word: darker, brighter, heavier, thinner or more forward in the mids.
3. Try a tilt to match that word: a low shelf and a high shelf at the same pivot, around 1 kHz, moving 1 dB in opposite directions. Put a gain plugin after the EQ and rematch the loudness.
4. Compare again with the references. If the difference is mostly gone, stop there.
5. Only now open an analyzer. Loop two sections with different chords and note which peaks move with the harmony and which stay put.
6. For a peak that stays put, sweep a narrow boost to find it by ear. Cut it only if you hear the ring on normal playback, starting with 1 to 2 dB and a Q around 4 to 8.
7. Bypass the whole EQ at matched loudness. Then swap in a reference from another decade of the same genre and notice how far your target moves.

In my sessions the tilt usually does most of the work, and the narrow cut, if one survives at all, is small.

## Common mistake: EQ-ing the picture

The common mistake is mastering to the analyzer: notching every peak or pulling the curve toward a smooth line. Peaks are often notes, and a smooth curve is not a goal in itself. Notch the notes and you change the arrangement from the master, where you cannot reach a single part.

The second mistake is choosing references by genre tag alone. A record from another decade, or another corner of the same genre, can make your mix seem short of bass or air when it is aimed somewhere else. Match the era and substyle first, then match the level, and only then trust the comparison.

## Producer takeaway: decide the slope, then look for defects

Start every mastering EQ pass by naming the broad difference against the right references and trying the gentlest tilt that fixes it. Look for narrow problems afterwards, and treat an analyzer peak as a question about the music before you treat it as a fault. I keep a narrow cut only when I can hear what it removes on a normal listen, at matched loudness.

## References

- Hove, M. J., Vuust, P., & Stupacher, J. (2019). Increased levels of bass in popular music recordings 1955-2016 and their relation to loudness. *The Journal of the Acoustical Society of America*, 145(4), 2247-2253.
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Pestana, P. D., Ma, Z., Reiss, J. D., Barbosa, A., & Black, D. A. A. (2013). Spectral characteristics of popular commercial recordings 1950-2010. *Audio Engineering Society Convention 135*, Paper 8960.
- Toy, R. (Ed.). (2021). *Audio EQ Cookbook*. W3C Working Group Note, adapted from R. Bristow-Johnson. https://www.w3.org/TR/audio-eq-cookbook/
`,
    seo: {
        title: 'Mastering EQ starts with the big picture | VGP Studio',
        description: 'Fix the overall tilt of a master before chasing analyzer peaks, tell notes from resonances, and choose references from the same era as your record.',
        keywords: ['mastering EQ', 'tilt EQ', 'EQ Q and bandwidth', 'analyzer peaks', 'reference tracks era', 'tonal balance mastering'],
    },
};
