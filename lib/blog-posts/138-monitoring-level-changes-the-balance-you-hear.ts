import { BlogArticle } from '../blog-data';

// Contour values: sound pressure level a pure tone needs to match a 1 kHz tone, minus the
// 1 kHz level, from the ISO 226:2003 equations (the 2023 edition differs by at most 0.3 dB
// above 10 phon). Octave points, so the x axis is evenly spaced in log frequency.
// Plotted as (dB + 10) / 60.

export const post138: BlogArticle = {
    slug: 'monitoring-level-changes-the-balance-you-hear',
    title: 'Monitoring level changes the balance you hear',
    excerpt: 'Turn the speakers down and the bass fades faster than the mids. What the equal-loudness contours say, and how to pick a home level and use quiet checks without fooling yourself.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Pick one moderate monitoring level, mark it on the volume control, and make every EQ and low-end decision there.',
        'Use a quiet level to check whether the vocal, snare and lead still read, and never to decide how much bass the mix needs.',
        'Compare against a loudness-matched reference at the same monitor level, because the ear\'s level-dependent bias then applies to both equally.',
    ],
    figures: {
        contours: {
            type: 'curve',
            caption:
                'How much more level a tone needs than a 1 kHz tone to sound equally loud, at a quiet and a loud listening level, from the ISO 226 equations at octave steps. Below 1 kHz the gap between the curves widens: the lower the tone, the more extra level it needs when you listen quietly. From 1 to 8 kHz the two curves almost meet.',
            alt: 'Two curves across octave steps from 31.5 Hz to 8 kHz. Both are high at the left, fall to zero extra level at 1 kHz, dip slightly below it around 4 kHz and rise again at 8 kHz. The solid 40 phon curve sits well above the dashed 80 phon curve in the bass, and the two nearly overlap from 1 kHz up.',
            x: ['31.5 Hz', '63 Hz', '125 Hz', '250 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz', '8 kHz'],
            xShort: ['31', '63', '125', '250', '500', '1k', '2k', '4k', '8k'],
            xLabel: 'Frequency',
            yLabel: 'Extra level needed',
            series: [
                { label: 'Quiet (40 phon)', values: [0.969, 0.718, 0.51, 0.34, 0.217, 0.167, 0.154, 0.111, 0.363] },
                { label: 'Loud (80 phon)', values: [0.661, 0.472, 0.335, 0.238, 0.181, 0.167, 0.176, 0.138, 0.357], dashed: true },
            ],
        },
        bass: {
            type: 'bars',
            caption:
                'Extra level a pure tone needs over a 1 kHz tone to sound equally loud, worked out from the ISO 226 equations. From loud to quiet listening, 50 Hz falls behind the midrange by about 16 dB and 100 Hz by about 12 dB.',
            alt: 'Horizontal bars on a scale from 0 to 40 dB. At 50 Hz the extra level is 37.8 dB at 40 phon, 30.0 dB at 60 phon and 21.7 dB at 80 phon. At 100 Hz it is 24.4, 18.6 and 12.5 dB. The 100 Hz bars are dimmed.',
            min: 0,
            max: 40,
            unit: 'dB',
            bars: [
                { label: '50 Hz, 40 phon', value: 37.8, display: '37.8 dB' },
                { label: '50 Hz, 60 phon', value: 30.0, display: '30.0 dB' },
                { label: '50 Hz, 80 phon', value: 21.7, display: '21.7 dB' },
                { label: '100 Hz, 40 phon', value: 24.4, display: '24.4 dB', dim: true },
                { label: '100 Hz, 60 phon', value: 18.6, display: '18.6 dB', dim: true },
                { label: '100 Hz, 80 phon', value: 12.5, display: '12.5 dB', dim: true },
            ],
        },
    },
    quiz: [
        {
            q: 'At 40 phon a 50 Hz tone needs 37.8 dB more than 1 kHz to sound equally loud; at 80 phon it needs 21.7 dB more. Going from loud to quiet, how far does 50 Hz fall behind the midrange?',
            options: ['About 6 dB', 'About 10 dB', 'About 16 dB', 'About 40 dB'],
            answer: 2,
            why: 'The extra level needed grows from 21.7 dB to 37.8 dB, a difference of 37.8 - 21.7 = 16.1 dB. That is how much weaker the low bass seems, relative to the mids, at the quiet level.',
        },
        {
            q: 'Your mix sounds bass-light at a quiet level. What should you check before boosting the low end?',
            options: [
                'Whether the mix is louder than the reference',
                'Whether a matched reference sounds just as light',
                'Whether the bass is panned exactly to the centre',
                'Whether the bass is louder in mono than in stereo',
            ],
            answer: 1,
            why: 'Quiet listening takes bass away from every track. If a loudness-matched reference loses the same amount at the same level, your mix is fine and the boost would only make it boomy at normal levels.',
        },
        {
            q: 'Why can\'t you correct for the equal-loudness contours with a fixed EQ curve on the mix?',
            options: [
                'The shift depends on a playback level you do not control',
                'Loudness normalization on streaming removes any EQ tilt',
                'The contours only describe hearing below about 100 Hz',
                'Each speaker has its own contour, so no curve can fit',
            ],
            answer: 0,
            why: 'How far the bass falls behind depends on how loud the listener plays the song, which you cannot know. The contours also come from pure tones and average listeners, so they show a direction, not a correction.',
        },
    ],
    content: `## Hook: the late-night low end

You finish a mix in a flat with thin walls, speakers turned well down so the neighbours do not knock. The kick and bass feel a little thin, so you lift them until they feel right. The next afternoon you play it at a normal level and the low end is huge, and in the car it is worse.

Nothing in the file changed overnight. The level you listened at did, and your hearing does not weigh frequencies the same way at every level.

## Why it matters: every EQ move goes through your ears at one level

You never hear a mix's frequency balance directly. You hear it through ears whose sensitivity to bass, mids and top changes with how loud the playback is. Make all your low-end calls at a low level and you add bass the mix does not need. Make them all loud and you tend to hold the bass back, as the [lesson on loudness bias](/blog/why-louder-is-not-always-bigger) explains. Swing the volume knob between the two without noticing and every comparison you make is a little rigged.

## Science model: equal-loudness contours

An equal-loudness contour shows the sound pressure level a pure tone needs at each frequency to sound as loud as a 1 kHz tone. The level of that 1 kHz tone names the contour in phon, so the 60 phon contour passes through 60 dB at 1 kHz. ISO 226:2023 gives a family of these contours for young adults (18 to 25) with normal hearing, listening to tones from the front in a free field. Suzuki, Takeshima and Kurakata (2024) report that it differs from the 2003 edition by at most 0.6 dB, and by at most 0.3 dB above 10 phon, so the numbers below are worked out from the published 2003 equations.

::figure contours

On the usual chart, drawn in absolute level, the contours crowd together in the bass: going from 40 to 80 phon takes 40 dB at 1 kHz but only about 24 dB at 50 Hz. Drawn relative to 1 kHz, as here, the same fact shows up as curves that fan apart toward the low end. To sound as loud as the 1 kHz tone, a 50 Hz tone needs 21.7 dB more at 80 phon, 30.0 dB more at 60 phon and 37.8 dB more at 40 phon. Turn the playback down from about 80 to about 40 phon and 50 Hz falls behind the midrange by about 16 dB. At 100 Hz the shift is about 12 dB.

::figure bass

The top end moves much less. At 8 kHz the curves sit within half a decibel of each other across those levels. Only near 12.5 kHz, the top of the standard's range, do they spread again, by about 6 dB from 40 to 80 phon, which is the air you lose when you turn down.

Two limits keep this honest. The contours were measured with pure tones, and a mix is broadband sound where parts mask each other, so the numbers show the direction and rough size of the shift, not an EQ correction to apply. People also differ: the experimental equal-loudness data behind the standard typically scatter with a standard deviation of about 5 to 6 dB (Suzuki et al., 2024).

Play the same mix at three levels and listen to how much low end and air you hear at each one.

::demo monitor-level

A repeatable level keeps your comparisons fair. Katz (2000) calibrates each speaker so pink noise at -20 dBFS RMS reads 83 dB SPL, C-weighted, slow, at the listening position, and turns the gain down from that reference for more compressed material. You do not need his number to get the benefit. You need one level you can come back to. Keep the loud checks short; the [lesson on fresh ears](/blog/why-fresh-ears-are-a-real-production-tool) has the exposure limits.

## DAW experiment: find your home level, then test the quiet check

1. Play pink noise at -20 dBFS RMS through one speaker. Set the monitor control to a level that feels moderate and that you could work at for an hour, and mark the knob. If you have an SPL meter or a phone app, write down the reading.
2. Load a reference track whose low end you trust and match its loudness to your mix with a loudness meter.
3. At the marked level, switch between the reference and your mix. Note whether your bass sits above, below or level with the reference.
4. Turn the monitors down until you could talk over the music. Do not touch any EQ.
5. Switch between the two again. If both lose low end by a similar amount, your bass balance has not changed, only your hearing has.
6. Still at the quiet level, check the hierarchy: can you follow the vocal, the snare and the lead line? Write down anything that vanishes.
7. Return to the marked level before you fix anything on your list.

The quiet level is good at showing what disappears from the midrange balance. It is poor at telling you how much bass you need, which is why the reference has to come along.

## Common mistake: fixing the bass at whisper level

The most common mistake is boosting the low end because the mix sounds thin on speakers turned well down. At that level every track sounds thin, including the references. The boost feels right until the mix is played at a normal level, where it turns into boom.

The second is riding the volume knob without marks. A mix that sounds a little brighter or fuller after you turned up is not a better mix, and an A/B taken at two different monitor levels compares your hearing, not the two versions.

## Producer takeaway: one home level, quick trips away from it

I make tonal decisions at one marked, moderate level, and I compare against references at that same level. I turn down to check the hierarchy and turn up briefly to check the sub, and neither trip changes an EQ until I am back home.

## References

- ISO 226:2023. *Acoustics: Normal equal-loudness-level contours*. International Organization for Standardization.
- Katz, B. (2000). Integrated approach to metering, monitoring, and leveling practices, Part 1: Two-channel metering. *Journal of the Audio Engineering Society*, 48(9), 800-809.
- Suzuki, Y., Takeshima, H., & Kurakata, K. (2024). Revision of ISO 226 "Normal Equal-Loudness-Level Contours" from 2003 to 2023 edition: The background and results. *Acoustical Science and Technology*, 45(1), 1-8.
`,
    seo: {
        title: 'Monitoring level changes the balance you hear | VGP Studio',
        description: 'Equal-loudness contours show bass fading faster than mids as you turn down. How to pick a home monitoring level and use quiet checks without boosting the low end.',
        keywords: ['monitoring level', 'equal-loudness contours', 'ISO 226', 'mixing at low volume', 'reference track', 'monitor calibration'],
    },
};
