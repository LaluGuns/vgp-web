import { BlogArticle } from '../blog-data';

export const post061: BlogArticle = {
    slug: 'why-lufs-is-not-a-magic-number',
    title: 'Stop treating LUFS like a target',
    excerpt: 'A loudness meter tells you how loud a song measures, not how good it sounds. What integrated LUFS averages, and why chasing a reading flattens your drums.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Integrated LUFS is one energy average for the whole song, K-weighted, measured in 400 ms blocks, with very quiet passages gated out.',
        'Two masters can read the same LUFS and sound completely different, because the number says nothing about peaks, punch or how the loudness moves.',
        'Set the level by ear at matched loudness, then use the meter to check what you deliver.',
    ],
    figures: {
        meter: {
            type: 'flow',
            caption:
                'How a BS.1770 meter turns a song into one integrated number. A snare crack lasting a few milliseconds is a tiny part of a 400 ms block, so it barely moves the result.',
            alt: 'Five steps in a row: K-weighting, mean square in 400 ms blocks, an absolute gate at -70 LUFS, a relative gate 10 LU below the average, and the integrated LUFS result.',
            steps: [
                { label: 'K-weighting', note: 'Treble up about 4 dB, deep bass reduced' },
                { label: 'Mean square per block', focus: true, note: '400 ms blocks overlapping by 75%' },
                { label: 'Absolute gate', note: 'Blocks below -70 LUFS dropped' },
                { label: 'Relative gate', note: 'Blocks 10 LU under the average dropped' },
                { label: 'Integrated LUFS', note: 'One average for the whole song' },
            ],
        },
        moves: {
            type: 'curve',
            caption:
                'Short-term loudness rises and falls with the arrangement. Integrated loudness is one flat average of it, so two masters with the same integrated reading can move very differently underneath.',
            alt: 'A curve of short-term loudness across a song, low in the intro, higher in each chorus and low again in the bridge and outro, with a flat dashed line for the integrated value.',
            x: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
            xShort: ['In', 'V', 'C', 'V', 'C', 'B', 'C', 'Out'],
            yLabel: 'Loudness',
            series: [
                { label: 'Short-term loudness', values: [0.3, 0.52, 0.84, 0.5, 0.86, 0.42, 0.9, 0.28] },
                { label: 'Integrated loudness', values: [0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68, 0.68], dashed: true },
            ],
        },
    },
    quiz: [
        {
            q: 'You limit a master harder and turn it up. Why does the integrated LUFS reading rise even though the peaks went down?',
            options: [
                'It counts how many peaks reach the limiter ceiling',
                'It weights short transients more than the sustain',
                'It averages energy, and the body of the sound rose',
                'Its gate ignores everything under the limiter threshold',
            ],
            answer: 2,
            why: 'Integrated LUFS is a K-weighted energy average over 400 ms blocks. Short peaks contribute little, so shaving them off and raising the gain lifts the reading.',
        },
        {
            q: 'Which part of a song can the integrated reading leave out completely?',
            options: [
                'Passages over 10 LU under the average',
                'Peaks shorter than a single 400 ms block',
                'Bass under the K-weighting high-pass',
                'Stereo content that cancels out in mono',
            ],
            answer: 0,
            why: 'BS.1770 drops blocks below -70 LUFS, then drops blocks more than 10 LU below the average of what is left. Very quiet passages do not count at all.',
        },
        {
            q: 'Two masters both read -10 LUFS integrated. What do you know for certain?',
            options: [
                'Their kick and snare hit with the same punch',
                'They both reach the same true peak in dBTP',
                'Their choruses hit the same short-term level',
                'A -14 LUFS service turns both down equally',
            ],
            answer: 3,
            why: 'Normalization works from integrated loudness alone, so both get the same 4 dB gain change. Peaks, punch and how the loudness moves are not in that number.',
        },
    ],
    content: `## Hook: the number you were told to hit

You finish a mix, put a limiter on the master and pull the threshold down while you watch the loudness meter. A tutorial said -8, so you stop when the display reads -8 LUFS. The number is right. The kick has lost its weight, the snare has stopped cracking, and the chorus no longer lifts out of the verse.

The meter did its job: it told you how loud the file measures. It never promised that a reading would make the master good. LUFS is a measurement, and treating it as a quality target pushes you to keep processing until the number arrives, whatever that costs the music.

## Why it matters: a target changes what you listen for

With a target on screen, your attention moves from the drums to the display. You stop asking whether the chorus still hits and start asking how much more gain reduction you need. Every decibel of limiting past the point where the song sounds right is paid for in transients and in the contrast between sections.

The reward for that cost is smaller than it looks. Spotify measures the integrated loudness of each track and, on its default setting, turns anything louder than -14 LUFS down to -14 during playback. A master pushed to -8 LUFS plays at the same loudness as one left at -11. You keep the side effects of the limiting and lose the level you paid for.

::demo normalization

## Science model: what the meter averages

Loudness meters follow ITU-R BS.1770. First the signal goes through K-weighting: a shelf that lifts the upper frequencies by about 4 dB to model the effect of the head, then a high-pass stage that reduces the weight of deep bass. The meter squares the weighted signal and averages it over blocks of 400 ms that overlap by 75%. For a stereo file the loudness of one block is:

$$L = -0.691 + 10 \\log_{10}\\left( z_L + z_R \\right)$$

Here $z_L$ and $z_R$ are the mean squares of the K-weighted left and right channels. The constant -0.691 cancels the gain of the K-weighting filter at 997 Hz. One LU, a loudness unit, is the same size as one decibel.

Integrated loudness then applies two gates. Blocks below -70 LUFS are ignored. The meter averages the rest, drops every block more than 10 LU below that average, and averages again. What is left is one number for the whole song.

::figure meter

Three consequences follow from that design:

- **It is an energy average.** A snare crack lasting a few milliseconds is a tiny part of a 400 ms block. Limit those peaks off and raise the gain, and the reading goes up, because the body of every sound rose with the gain. The meter rewards the process that removes punch.
- **It hides movement.** One number cannot tell you how far the chorus rises over the verse. Short-term loudness (a 3 second window) and momentary loudness (400 ms), defined in EBU Tech 3341, show how the level moves.
- **It ignores peaks.** Peak level is a separate measurement. BS.1770 defines it too, as true peak.

::figure moves

## DAW experiment: same number, different master

1. Put a BS.1770 loudness meter last on your master bus. Most DAWs include one, and free meters exist.
2. Bounce your mix with no master limiter, import it, and play it from the first bar to the last. Note the integrated LUFS and the short-term reading in the biggest chorus.
3. Duplicate the track. On the copy, insert a limiter with a -1 dBTP ceiling and raise its input until the integrated reading is 4 LU higher than the original.
4. Add a gain plugin after the limiter on the copy and set it to -4 dB, so both tracks read the same integrated LUFS.
5. Ask someone to switch between the two tracks at the chorus without telling you which is which.
6. Play the verse into the chorus on each and watch how far the short-term reading rises.

At the same integrated reading, the limited copy usually sounds flatter: the drums have less snap and the chorus rises less on the short-term meter. The numbers matched. The music did not.

## Common mistake: one number for every song

The usual mistake is carrying one target across every genre and arrangement. A dense electronic track with sustained synths can take more limiting before it falls apart than a sparse acoustic song, where the space between notes is part of the sound. A number from a tutorial knows nothing about your song.

The opposite mistake is deciding that, because services normalize, -14 LUFS is now the rule. Spotify does suggest -14 LUFS integrated in its mastering tips, but nothing breaks when a master is louder. It is turned down, and it should keep its true peak below -2 dBTP, as covered in [the streaming loudness myths](/blog/the-streaming-loudness-myth-that-refuses-to-die).

## Producer takeaway: decide by ear, check with the meter

Decide how loud the master should be by listening at matched loudness. Push the limiter only while the song keeps its punch and its lift. Then read the meter to confirm what you are delivering: the integrated loudness, how far the short-term level moves, and a true peak under your ceiling. The meter is the right tool for checking a master and the wrong one for deciding how it should sound.

## References

- European Broadcasting Union. (2023). *Tech 3341: Loudness metering: 'EBU Mode' metering to supplement EBU R 128 loudness normalization*. EBU. https://tech.ebu.ch/docs/tech/tech3341.pdf
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'Stop treating LUFS like a target | VGP Studio',
        description: 'What integrated LUFS actually measures, why the same reading can hide very different masters, and how to set loudness by ear at matched level.',
        keywords: ['LUFS', 'integrated loudness', 'ITU-R BS.1770', 'K-weighting', 'mastering loudness', 'loudness normalization'],
    },
};
