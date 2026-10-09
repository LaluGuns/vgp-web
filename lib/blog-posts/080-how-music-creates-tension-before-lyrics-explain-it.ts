import { BlogArticle } from '../blog-data';

// A four-bar snare build: the last bar is 16ths with velocity rising.
const RAMP = Array.from({ length: 16 }, (_, i) => ({ step: i, level: 0.4 + (0.6 * i) / 15 }));

export const post080: BlogArticle = {
    slug: 'how-music-creates-tension-before-lyrics-explain-it',
    title: 'Music sets up tension before the lyric explains it',
    excerpt: 'Loudness, pitch and note density build tension before a word is sung. What tension research shows, and how to make a build work with the vocal muted.',
    category: 'music-psychology',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Listeners hear tension rise with loudness and pitch, and with more notes per bar, whatever the words are saying.',
        'Several cues rising together build tension faster than one cue alone. Cues that pull in opposite directions blur it.',
        'Mute the vocal and play the build. If it does not pull toward the chorus on its own, fix the build before the lyric.',
    ],
    figures: {
        roll: {
            type: 'rhythm',
            caption:
                'A four-bar snare build drawn bar by bar. The number of hits doubles each bar until the last, where the 16ths stay and the velocity climbs. Rising note density is one of the cues listeners hear as rising tension.',
            alt: 'Four rows on a 16-step grid. Bar 1 has four hits, one per beat. Bar 2 has eight. Bar 3 has sixteen. Bar 4 has sixteen hits that grow from short to tall across the bar.',
            rows: [
                { label: 'Bar 1, quarters', hits: [0, 4, 8, 12] },
                { label: 'Bar 2, 8ths', hits: [0, 2, 4, 6, 8, 10, 12, 14] },
                { label: 'Bar 3, 16ths', hits: Array.from({ length: 16 }, (_, i) => i) },
                { label: 'Bar 4, rising', focus: true, hits: RAMP },
            ],
        },
        stack: {
            type: 'curve',
            caption:
                'A sketch based on Farbood (2012), not her data. When loudness, pitch and note density rise together, tension builds faster than when a filter opens on its own. The chorus downbeat releases it.',
            alt: 'Two curves over four build bars and the chorus. The solid curve for several cues rising together climbs steeply to a peak in bar 4 and drops at the chorus. The dashed curve for the filter alone rises gently.',
            x: ['Bar 1', 'Bar 2', 'Bar 3', 'Bar 4', 'Chorus'],
            yLabel: 'Tension',
            series: [
                { label: 'Cues rise together', values: [0.28, 0.45, 0.66, 0.93, 0.4] },
                { label: 'Filter only', values: [0.28, 0.34, 0.41, 0.5, 0.4], dashed: true },
            ],
        },
    },
    quiz: [
        {
            q: 'You only have time to automate one thing across a four-bar build. Based on Farbood\'s single-feature results, which is most likely to raise tension on its own?',
            options: [
                'Raise the instrument bus level steadily into the chorus',
                'Switch one bar of the build from 4/4 to 7/8',
                'Widen the stereo image of the pad bar by bar',
                'Lengthen the reverb tail on the snare build',
            ],
            answer: 0,
            why: 'Loudness and pitch height had the clearest effect when each changed alone, while rhythmic features such as metre changes showed little effect. Width and reverb length are not among the cues the study found, so a rising level is the safest single move.',
        },
        {
            q: 'A build gets busier but also quieter and darker. What did tension research suggest happens?',
            options: [
                'Tension still rises, because note density outweighs the rest',
                'Tension drops, since the falling level cancels the busier part',
                'The cues add up, so tension rises as fast as with matched cues',
                'The cues conflict, so listeners judge the tension less clearly',
            ],
            answer: 3,
            why: 'Farbood found that features changing in the same direction gave stronger tension than any one alone, while conflicting features made listeners\' judgments ambiguous.',
        },
        {
            q: 'What is the best test of whether a build carries the moment before the chorus?',
            options: [
                'Solo the riser and check that it climbs',
                'Mute the vocal and play the build alone',
                'Check the build in mono on one speaker',
                'Watch the meter climb across the build',
            ],
            answer: 1,
            why: 'If the instrumental build does not pull toward the chorus without the words, the lyric is being asked to do work the music should have done.',
        },
    ],
    content: `## Hook: the crisis over a flat track

You write a song with a dramatic story. The lyric is sharp and the vocal take is strong, but the backing stays the same from verse to chorus. You expect the words to carry the build. On playback the chorus barely lands. The lyric describes a crisis, and the music underneath sounds like nothing is happening.

The music reaches the listener before the words do. It sets the mood from the first bar, long before the first line is sung, and it keeps working while the listener is only half following the lyric. If the instrumental does not build on its own, the words land on flat ground.

## Why it matters: the music does its share first

Listeners pick up emotional cues from sound itself: tempo, loudness, register, density. Juslin and Västfjäll (2008) describe a fast brainstem reflex to sudden, loud or dissonant sounds, and an expectation mechanism that tracks where the music is heading. Neither needs a single word.

How much the lyric adds is less settled. Ali and Peynircioğlu (2006) found that melodies influenced listeners' emotional ratings more than lyrics did, and that lyrics strengthened sad and angry songs while weakening happy and calm ones. A preregistered replication did not reproduce several of those results (Ma et al., 2024). The safe conclusion for a producer is modest: the music has to carry its share of the emotion, and it is the part you control in the arrangement.

## Science model: the cues listeners hear as tension

Farbood (2012) asked listeners to judge musical tension while single features changed, then while several changed together. On their own, changes in loudness and pitch height had the clearest effect. Onset frequency, meaning how many notes start per second, tempo and harmony also moved tension, while rhythmic features such as metre changes did not. When several features moved in the same direction, tension rose more than with any one of them. When features pulled in opposite directions, listeners' judgments became ambiguous.

::figure roll

Granot and Eitan (2011) found something similar with short, atonal melodic sequences. Loudness had the strongest effect on tension, and the parameters interacted rather than simply adding up.

For a build, that gives a clear recipe. Raise several cues together: level, pitch and note density. Make sure none of them falls while the others rise.

::figure stack

## DAW experiment: the muted vocal build

You need a song with a build into the chorus and about fifteen minutes.

1. Mute the lead and backing vocals. Loop the four bars before the chorus and the first bar of the chorus.
2. Program a snare build: quarter notes in bar 1, 8th notes in bar 2, 16th notes in bars 3 and 4, with velocity rising from 60 to 120 across bar 4.
3. Automate the instrument bus gain from -6 dB at the start of the build to 0 dB on its last beat.
4. Add a noise or synth riser whose pitch climbs 12 semitones over the four bars.
5. Put a low-pass filter on the pad and automate its cutoff from 400 Hz to 20 kHz over the same four bars.
6. On the last 8th note before the chorus, mute everything except one short pickup.
7. Play the build. Then mute everything you added except the filter sweep and play it again.
8. Unmute the vocals and play from the start of the verse.

With all the cues rising together, the build should pull toward the chorus even without words. The filter alone moves it far less. With the vocal back in, the hook lands on a build that has already done its job.

## Common mistake: asking the lyric to do the build

The most common mistake is relying on the words to create the lift. A dramatic line over a static backing asks the listener to imagine an intensity the music is not giving them. Get the build working with the vocal muted first.

The second mistake is building with cues that fight each other. A build that adds hits while the level drops and the filter closes sends mixed signals, and tension research suggests listeners then judge it less clearly. If something has to fall, let it fall in the last beat before the chorus, as a gap, not across the whole build.

## Producer takeaway: let the music arrive first

Write the build so it works as an instrumental. Raise loudness, pitch and note density together, and keep them moving in the same direction until the chorus. Then let the lyric name what the listener already feels. If the build sounds tense with the vocal muted, keep it. If it only works with the words, the arrangement still has work to do.

## References

- Ali, S. O., & Peynircioğlu, Z. F. (2006). Songs and emotions: Are lyrics and melodies equal partners? *Psychology of Music*, 34(4), 511-534.
- Farbood, M. M. (2012). A parametric, temporal model of musical tension. *Music Perception*, 29(4), 387-428.
- Granot, R. Y., & Eitan, Z. (2011). Musical tension and the interaction of dynamic auditory parameters. *Music Perception*, 28(3), 219-246.
- Juslin, P. N., & Västfjäll, D. (2008). Emotional responses to music: The need to consider underlying mechanisms. *Behavioral and Brain Sciences*, 31(5), 559-575.
- Ma, Y., Baker, D. J., Vukovics, K. M., Davis, C. J., & Elliott, E. M. (2024). Lyrics and melodies: Do both affect emotions equally? A replication and extension of Ali and Peynircioğlu (2006). *Musicae Scientiae*, 28(1), 174-186.
`,
    seo: {
        title: 'Music sets up tension before the lyric explains it | VGP Studio',
        description: 'How loudness, pitch and note density build tension before the words arrive, what tension research shows, and a DAW test with the vocal muted.',
        keywords: ['musical tension', 'build-up', 'snare roll', 'filter sweep', 'arrangement tips', 'music psychology'],
    },
};
