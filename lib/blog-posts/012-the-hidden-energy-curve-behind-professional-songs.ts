import { BlogArticle } from '../blog-data';

export const post012: BlogArticle = {
    slug: 'the-hidden-energy-curve-behind-professional-songs',
    title: 'Draw the energy curve before you mix',
    excerpt: 'When verse and chorus are equally full, no master chain can make the chorus bigger. Rate each section, draw the curve, and fix it in the arrangement.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'A chorus feels big because of the step up from the section before it, and the arrangement has to leave room for that step.',
        'Listeners remember a song by its peaks, its end and the moments that rise above what came just before, so a flat song gives them little to hold on to.',
        'Rate every section from 1 to 5, draw the line, and mute verse parts until the chorus sits a clear step above.',
    ],
    figures: {
        curve: {
            type: 'curve',
            caption:
                'A sketch, not a measurement. The shaped song drops back after each chorus so the next step up has somewhere to go, and saves its biggest step for the end. The flat one hovers near the same level all the way through.',
            alt: 'Two lines over nine sections from intro to final chorus. The solid shaped line rises into each chorus, falls back in verse 2 and the bridge, and peaks at the final chorus. The dashed flat line stays almost level.',
            x: ['Intro', 'Verse 1', 'Pre', 'Chorus 1', 'Verse 2', 'Pre', 'Chorus 2', 'Bridge', 'Final'],
            xShort: ['In', 'V1', 'Pre', 'C1', 'V2', 'Pre', 'C2', 'Br', 'C3'],
            yLabel: 'Energy',
            series: [
                { label: 'Shaped', values: [0.25, 0.35, 0.55, 0.8, 0.4, 0.6, 0.85, 0.45, 1] },
                { label: 'Flat', dashed: true, values: [0.6, 0.64, 0.66, 0.7, 0.65, 0.66, 0.7, 0.64, 0.72] },
            ],
        },
        map: {
            type: 'arrangement',
            caption:
                'One arrangement that draws the shaped curve. Each step up adds parts or raises them, the bridge strips back to keys, pad and vocal, and the final chorus adds harmonies on top of the full chorus.',
            alt: 'Arrangement grid across intro, verse, pre-chorus, chorus, bridge and final chorus. Density rises from intro to chorus, falls in the bridge and is highest in the final chorus, where harmonies join.',
            density: true,
            sections: [
                { label: 'Intro', short: 'In', bars: 4 },
                { label: 'Verse', bars: 8 },
                { label: 'Pre', bars: 4 },
                { label: 'Chorus', bars: 8 },
                { label: 'Bridge', short: 'Br', bars: 4 },
                { label: 'Final', bars: 8 },
            ],
            layers: [
                { label: 'Drums', levels: [0, 0.6, 0.7, 1, 0, 1] },
                { label: 'Bass', levels: [0, 0.7, 0.7, 1, 0, 1] },
                { label: 'Keys', levels: [0.8, 0.6, 0.6, 0.7, 0.8, 0.8] },
                { label: 'Guitar', levels: [0, 0, 0.5, 0.8, 0, 0.9] },
                { label: 'Pad', levels: [0, 0, 0.4, 0.7, 0.6, 0.8] },
                { label: 'Vocal', levels: [0, 0.8, 0.8, 1, 0.7, 1] },
                { label: 'Harmony', levels: [0, 0, 0, 0, 0, 0.9] },
            ],
        },
    },
    quiz: [
        {
            q: 'Verse and chorus are equally dense and both push the master limiter. What does that do to the chorus?',
            options: [
                'It sounds bigger, because the limiter works harder',
                'It gets raised by the limiter to balance the verse',
                'It gets wider, as the limiter lifts the side signal',
                'It comes out as full as the verse, with no step up',
            ],
            answer: 3,
            why: 'A limiter holds both sections under the same ceiling. If they are equally full going in, they come out much the same, and the difference has to come from what the verse leaves out.',
        },
        {
            q: 'A label rep will hear your song once on the drive home and tell you the next day how big it felt. Which edit does most for the intensity they will remember?',
            options: [
                'Repeat the final chorus twice more so the big part lasts longer',
                'Lift the verses to chorus level so the song stays loud throughout',
                'Thin the bar before the final chorus so the chorus rises out of it',
                'Fade out across the final chorus so the ending feels relaxed',
            ],
            answer: 2,
            why: 'In Rozin and colleagues\' study, remembered intensity leaned on the peak, the end and the moments that rose above the ones just before, while length made little difference. Extra repeats only add time, louder verses take away the rise, and a fade turns down the end.',
        },
        {
            q: 'Your rating sheet reads verse 4, pre-chorus 4, chorus 4. What is the first fix to try?',
            options: [
                'Mute two supporting parts in the verse',
                'Add a riser and a crash into the chorus',
                'Push the limiter harder in the chorus',
                'Add another synth layer to the chorus',
            ],
            answer: 0,
            why: 'The chorus has no room to grow because the verse already fills it. Lowering the verse creates the step without making the chorus more crowded.',
        },
    ],
    content: `## Hook: the flat mix that puts listeners to sleep

You finish a mix with clean transients and a solid low end. Then you listen from start to finish and the song feels like a flat line. You expect the chorus to explode, and it sounds like a slightly louder version of the verse. Every sound works on its own, so the fault is in the shape of the whole song.

You can keep adding plugins, but no compressor will fix a song that does not move.

## Why it matters: the master cannot create the step

Energy is what a listener feels as the size of a section. It comes from several things at once: loudness, how many parts are playing, how busy the rhythm is, how high the melody sits and how wide the stereo image is. You cannot read it off one meter, but you can rate it by ear.

When the verse is as full as the chorus, both sections hit the bus compressor and the master limiter the same way. A limiter holds everything under one ceiling, so two equally full sections come out about equally loud and equally dense. The chorus can only feel bigger if the verse leaves something out. That is an arrangement decision, and it has to be made before the mix.

::figure curve

## Science model: habituation, expectation and remembered peaks

The ear responds less to a sound that does not change. This is habituation, and it is why a section that keeps the same parts at the same level for a long time starts to fade from attention even while it plays.

Huron (2006) describes listening as constant prediction. Tension builds while an expected change has not arrived yet, and the arrival feels better because of the tension before it. A pre-chorus that holds back and a chorus that delivers use that contrast. A flat song gives the listener nothing to anticipate.

Memory works the same way. Rozin, Rozin and Goldberg (2004) had listeners press a pressure-sensitive button to show how intense the music felt from moment to moment, then asked them later how intense each piece had been. The remembered intensity leaned on the peak, the end and the moments that were more intense than the moments just before. How long a passage lasted made little difference. A step up into a chorus is exactly the kind of moment listeners keep. A record needs a road, not a pile of moments.

::figure map

## DAW experiment: the energy rating test

1. Put a marker at the start of every section: intro, verse, pre-chorus, chorus, bridge and final chorus.
2. Play each section on its own and rate its energy from 1 to 5. Judge how full, loud and busy it feels, not how good it is.
3. Write the ratings down in order and sketch them as a line on paper. Two neighbouring sections with the same number, where you want a lift, are the problem.
4. If the verse and the chorus share a rating, mute two supporting parts in the verse, such as a rhythm guitar and a pad.
5. Rate the verse again. It should now sit a clear step below the chorus.
6. Put a loudness meter on the master and read short-term LUFS in the middle of the verse and the middle of the chorus. The verse should now read lower, so the gap to the chorus is wider than before.
7. For a smaller version of the same move, automate the instrument bus 1 dB down through the verse and back to 0 dB on the chorus downbeat.

Play the song through. The chorus should feel like an arrival, and nothing on the master chain has changed.

## Common mistake: making the verse bigger to keep it interesting

The most common mistake is stacking parts to make a verse feel more exciting. It works for a few bars, then the chorus arrives with nowhere left to go. Extra layers in the verse also fill the range the vocal needs.

The second mistake is keeping the drum pattern identical from the first bar to the last. Drums carry a lot of the energy, so a pattern that never changes keeps the curve flat even when other parts come and go. Change the hi-hat part, open the snare up in the pre-chorus or drop the kick in the bridge.

A flat line is not always wrong. Ambient, lo-fi and some techno move through small changes over long spans. The curve there is gentle, but it still moves.

## Producer takeaway: design a road instead of a pile of moments

Plan the energy of every section before you touch a mixing fader. Keep the verses lean, let the choruses own the highest step and save one more step for the final chorus. If you can draw the curve of your song on paper and it goes somewhere, the mix has something to work with.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Rozin, A., Rozin, P., & Goldberg, E. (2004). The feeling of music past: How listeners remember musical affect. *Music Perception*, 22(1), 15-39.
`,
    seo: {
        title: 'Draw the energy curve before you mix',
        description: 'A chorus feels big because of the step up from the verse. Rate each section, draw the energy curve and fix a flat song in the arrangement.',
        keywords: ['song energy curve', 'arrangement density', 'song structure', 'verse and chorus contrast', 'habituation'],
    },
};
