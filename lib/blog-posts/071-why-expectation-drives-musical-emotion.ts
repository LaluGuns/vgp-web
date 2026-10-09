import { BlogArticle } from '../blog-data';

export const post071: BlogArticle = {
    slug: 'why-expectation-drives-musical-emotion',
    title: 'Why expectation drives musical emotion',
    excerpt: 'A chorus hits harder when the listener can feel it coming. How prediction, delay and release shape the moment a section lands, and where waiting stops working.',
    category: 'music-psychology',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 6,
    featured: true,
    summary: [
        'Listeners predict what comes next all the time, and the moment just before an expected event is when attention and arousal peak.',
        'A short delay before a predictable arrival sharpens the pull toward it. A long delay with no clear target turns into a stall.',
        'Hold back the arrival by half a bar or one bar, keep the target obvious, and compare versions against the direct entry.',
    ],
    figures: {
        pull: {
            type: 'curve',
            caption:
                'A sketch of the idea, not a measurement. Holding the last bar back makes the listener lean toward a downbeat they can already predict, so the chorus lands as a release. The direct entry never builds that pull.',
            alt: 'Two curves over four pre-chorus bars and two chorus bars. The held-back version rises steeply in the last bar and drops when the chorus lands. The dashed direct version stays almost flat throughout.',
            x: ['Pre-chorus 1', 'Bar 2', 'Bar 3', 'Last bar', 'Chorus', 'Chorus bar 2'],
            xShort: ['Bar 1', '2', '3', 'Last', 'Chorus', '+1'],
            yLabel: 'Anticipation',
            series: [
                { label: 'Held back', values: [0.3, 0.4, 0.52, 0.9, 0.32, 0.28] },
                { label: 'Direct entry', values: [0.3, 0.35, 0.4, 0.45, 0.38, 0.34], dashed: true },
            ],
            marks: [{ at: 4, label: 'Chorus lands' }],
        },
        itpra: {
            type: 'flow',
            caption:
                'Huron\'s five expectation responses around one event. Imagination and tension come before it. Tension is the rise in arousal and attention just before the moment, and a held-back arrival stretches it out. Prediction, reaction and appraisal follow it.',
            alt: 'Five boxes in a row: imagination, tension, prediction, reaction, appraisal, each with a short note on when it happens and what it does.',
            steps: [
                { label: 'Imagination', note: 'Long before: picturing the outcome' },
                { label: 'Tension', focus: true, note: 'Just before: arousal and attention rise' },
                { label: 'Prediction', note: 'Was the guess right?' },
                { label: 'Reaction', note: 'Fast and automatic' },
                { label: 'Appraisal', note: 'Slower, conscious judgment' },
            ],
        },
    },
    quiz: [
        {
            q: 'You leave half a bar of silence before the chorus, and for a moment it sounds as if the track has stopped. Then the downbeat lands. In Huron\'s ITPRA account, why can that arrival feel better than an on-time chorus?',
            options: [
                'A correct prediction gets rewarded twice, before and after the gap',
                'A fast negative reaction is overturned by a positive appraisal',
                'Imagination fills the gap with a picture of a bigger chorus',
                'Appraisal works alone, since a short silence draws no reaction',
            ],
            answer: 1,
            why: 'Huron calls this contrastive valence: the silence briefly reads as the music stopping, and when the downbeat proves it has not, the slower positive appraisal overturns that first reaction. He argues the result can feel better than a plain correct guess.',
        },
        {
            q: 'Why does a half-bar gap before the chorus often make the same chorus feel bigger?',
            options: [
                'The downbeat stays predictable, so the gap sharpens the wait',
                'The limiter recovers during the gap, so the chorus hits louder',
                'Silence resets the sense of tempo, so the chorus feels faster',
                'The gap masks small timing errors at the edit into the chorus',
            ],
            answer: 0,
            why: 'The delay works because the target is still predictable. The listener leans toward a downbeat they can feel coming, and the arrival resolves that tension.',
        },
        {
            q: 'What happens if you keep extending the delay before a chorus?',
            options: [
                'Anticipation keeps growing in proportion to the length of the wait',
                'Nothing changes as long as a riser keeps playing underneath it',
                'The chorus reads louder on the meter because of the longer gap',
                'Past a point the listener stops predicting it and the wait stalls',
            ],
            answer: 3,
            why: 'In studies of musical pleasure, liking tends to peak at moderate levels of predictability. A delay only builds tension while the listener can still predict what is coming.',
        },
    ],
    content: `## Hook: the drop that lands on time and still feels flat

You program a build into the chorus. The riser climbs, the snare roll speeds up, and the chorus snaps in on the first beat. The edit is clean, but the moment has no weight. You add an impact sample, a sub drop and a wider stereo image, and it still feels flat.

The extra sounds rarely help, because the listener knew exactly when the chorus would arrive and what it would sound like, and nothing in the last bar made them want it. Musical emotion depends heavily on what the listener expects, and on how you handle the moment before that expectation is met.

## Why it matters: an arrival needs a wait

Juslin and Västfjäll (2008) list musical expectancy as one of the main routes by which music stirs emotion. Listeners predict constantly, mostly without noticing. After a few bars they expect the next downbeat, the next chord and roughly when the chorus will start. A prediction that comes true feels good in a small way. When the arrival is held back by a beat or two while the target stays obvious, the wait becomes part of the experience.

If every section starts the instant the listener expects it, nothing builds, and the track slides into the background. If a section is delayed with no clear target, the listener stops predicting and the delay sounds like a mistake.

::figure pull

## Science model: the five expectation responses

Huron (2006) describes expectation as five responses around a single event, known as ITPRA:

- **Imagination**: picturing an outcome before it is likely to happen.
- **Tension**: arousal and attention rise just before the expected moment.
- **Prediction**: a small reward when the guess turns out right, a small penalty when it does not.
- **Reaction**: a fast, automatic response to what arrived.
- **Appraisal**: a slower, conscious judgment of the outcome.

The gap between what the listener expected and what arrived is called a prediction error. Huron argues that a fast negative reaction, overturned a moment later by a positive appraisal, can make an outcome feel better than a plain correct guess. He calls this contrastive valence. A half bar of silence before a chorus can work partly like this: for a moment it sounds as if the music has stopped, and then the downbeat proves it has not.

::figure itpra

There is neural evidence that anticipation carries reward of its own. Salimpoor and colleagues (2011) scanned listeners with music they had chosen because it reliably gave them chills. PET imaging showed dopamine release in the striatum. fMRI with the same listeners showed one part of it, the caudate, more involved while they waited for a favourite moment, and another, the nucleus accumbens, more involved at the moment itself. This does not mean a longer build gives a bigger reward. When researchers varied how predictable short musical passages were, liking was highest at intermediate levels of predictability and uncertainty and fell off at both extremes (Gold et al., 2019).

## DAW experiment: three ways into the same chorus

Use a song where the pre-chorus runs straight into the chorus.

1. Copy the last four bars of the pre-chorus and the first four bars of the chorus to an empty part of the timeline four times, so you have versions A to D side by side.
2. Leave version A as it is: the direct entry.
3. In version B, mute every track except one for the last half bar before the chorus. Keep a vocal pickup or a snare roll. Do not touch the chorus downbeat.
4. In version C, insert a low-pass filter on the instrument bus. Automate the cutoff from 20 kHz down to 300 Hz across the last bar, then back to 20 kHz exactly on the chorus downbeat.
5. In version D, repeat the last bar of the pre-chorus once, so the chorus arrives one bar late. Then try it with two extra bars.
6. Play each version from the start, at the same monitor level, and listen only to the first beat of the chorus.
7. Play them to someone who has not heard the song and ask which chorus felt biggest.

B and C usually make the same chorus feel heavier, because the last bar points at a downbeat the listener can predict. D shows the limit: one extra bar can strengthen the pull, while two extra bars often sound like the arrangement lost its place.

## Common mistake: resolving everything at once, or never

The first mistake is meeting every expectation the instant it forms. If every phrase resolves to the home chord on the strong beat and every section starts exactly on the bar line, the listener has nothing to wait for. Keep most of the song predictable, and choose one or two arrivals to hold back.

The opposite mistake is delaying with no clear target. A long breakdown with no pulse, or a build that never signals where the downbeat is, removes the prediction that made the wait meaningful. A related habit is stacking more layers into the build. A crowded build leaves the chorus nothing new to add, so the arrival brings less contrast.

## Producer takeaway: make the target obvious, then hold it back

Let the listener predict where the next important moment is, then make them wait a little for it. Use silence, a filter or one extra bar of the pre-chorus, not all three. Keep the delay short enough that the downbeat still feels inevitable. If the chorus feels earned, keep it. If it feels late, cut the delay in half.

## References

- Gold, B. P., Pearce, M. T., Mas-Herrero, E., Dagher, A., & Zatorre, R. J. (2019). Predictability and uncertainty in the pleasure of music: A reward for learning? *Journal of Neuroscience*, 39(47), 9397-9409.
- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Juslin, P. N., & Västfjäll, D. (2008). Emotional responses to music: The need to consider underlying mechanisms. *Behavioral and Brain Sciences*, 31(5), 559-575.
- Salimpoor, V. N., Benovoy, M., Larcher, K., Dagher, A., & Zatorre, R. J. (2011). Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. *Nature Neuroscience*, 14(2), 257-262.
`,
    seo: {
        title: 'Why expectation drives musical emotion | VGP Studio',
        description: 'How listener prediction shapes the moment a chorus lands: Huron\'s ITPRA model, anticipation and reward, and a DAW test for delaying a resolution.',
        keywords: ['music expectation', 'ITPRA theory', 'musical anticipation', 'delayed resolution', 'arrangement tips', 'music psychology'],
    },
};
