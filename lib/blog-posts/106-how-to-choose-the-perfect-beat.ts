import { BlogArticle } from '../blog-data';

export const post106: BlogArticle = {
    slug: 'how-to-choose-the-perfect-beat',
    title: 'How to choose a beat that fits your voice',
    excerpt: 'Check tempo, key, space for the vocal and the mix, then record a scratch demo. A practical order for testing a beat before you buy it.',
    category: 'production-tips',
    publishedAt: '2026-02-01',
    updatedAt: '2026-10-08',
    readingTime: 6,
    featured: true,
    summary: [
        'Judge tempo by feel, not by the number: a 140 BPM trap beat with the snare on beat 3 feels like 70.',
        'Hum your hook over the beat before you buy it. If the top note strains, ask for a version a semitone or two lower.',
        'Record a rough verse and hook, then listen again the next day on a phone and in a car before you decide.',
    ],
    figures: {
        check: {
            type: 'flow',
            caption: 'The order that saves the most time. Each check takes a minute. A no at any step sends the beat back to the list before you spend money or studio time on it.',
            alt: 'Five steps in a row: tempo, key, space, mix and scratch demo, each with the question to ask at that step.',
            steps: [
                { label: 'Tempo', note: 'Does the pocket feel natural?' },
                { label: 'Key', note: 'Can you reach the top note?' },
                { label: 'Space', note: 'Does the verse leave room?' },
                { label: 'Mix', note: 'Clear on a phone?' },
                { label: 'Scratch demo', note: 'Still good the next day?' },
            ],
        },
        tempo: {
            type: 'scale',
            caption:
                'Rough, typical tempo ranges. Many records sit outside them. Trap is usually written around 140 BPM but its snare lands once a bar, so it is felt at 70, the same pulse as a slow R&B song.',
            alt: 'A tempo line from 50 to 160 BPM with ranges for slow R&B, lo-fi, boom bap, pop, house and trap. An arrow runs from 140, where trap is written, down to 70, where it is felt.',
            min: 50,
            max: 160,
            unit: 'BPM',
            ticks: [60, 90, 120, 150],
            markers: [
                { value: 70, label: 'Felt: 70' },
                { value: 140, label: 'Written: 140', strong: true },
            ],
            arrows: [{ from: 140, to: 70 }],
            ranges: [
                { from: 60, to: 80, label: 'Slow R&B' },
                { from: 70, to: 90, label: 'Lo-fi' },
                { from: 85, to: 100, label: 'Boom bap' },
                { from: 100, to: 130, label: 'Pop' },
                { from: 120, to: 130, label: 'House' },
                { from: 130, to: 150, label: 'Trap' },
            ],
        },
        space: {
            type: 'arrangement',
            caption: 'A beat that leaves room. The lead melody carries the intro, steps out while you rap or sing the verse, and comes back with the hook, so your voice never competes with it.',
            alt: 'Arrangement grid for intro, verse and hook. The lead melody plays in the intro and hook but not the verse. Your vocal plays in the verse and hook. Drums play lightly in the intro and fully from the verse, where the 808 enters.',
            sections: [
                { label: 'Intro', bars: 4 },
                { label: 'Verse', bars: 16 },
                { label: 'Hook', bars: 8 },
            ],
            layers: [
                { label: 'Lead', levels: [0.9, 0, 0.9] },
                { label: 'Chords', levels: [0.7, 0.5, 0.7] },
                { label: 'Drums', levels: [0.3, 0.8, 1] },
                { label: '808', levels: [0, 0.8, 1] },
                { label: 'Your vocal', levels: [0, 0.9, 0.9] },
            ],
        },
    },
    quiz: [
        {
            q: 'A trap beat is listed at 140 BPM and the snare lands once per bar, on beat 3. What tempo does it feel like?',
            options: [
                'About 140 BPM, the listed tempo',
                'About 105 BPM, halfway between',
                'About 70 BPM, under fast hats',
                'About 280 BPM, set by the hats',
            ],
            answer: 2,
            why: 'One snare per bar makes each bar feel like one slow cycle. The pulse you nod to is half the written tempo, while the hi-hats keep the 140 grid.',
        },
        {
            q: 'Your hook strains on its top note over a beat you love. Which fix usually sounds cleanest?',
            options: [
                'Ask the producer to transpose it in the project',
                'Pitch-shift the finished beat down two semitones',
                'Sing it anyway and fix it with pitch correction',
                'Turn the beat down so you can hear yourself',
            ],
            answer: 0,
            why: 'In the project the producer can move the melody and bass and leave the drums alone. A pitch shifter on a mixed file retunes the drums too and can add artifacts.',
        },
        {
            q: 'Why is a bright lead synth playing through the verse a warning sign?',
            options: [
                'It pushes the 808 out of tune with your vocal',
                'It masks the consonants that make words clear',
                'It makes the verse feel slower than its real BPM',
                'It leaves too little headroom for the vocal',
            ],
            answer: 1,
            why: 'Two sounds in the same range hide each other. The consonants that make words clear live in the upper midrange, exactly where a bright lead plays.',
        },
    ],
    content: `## Why the beat decides so much

The beat sets the tempo you rap or sing at, the key your melody has to live in and how much room is left for your voice. Change any of those and the song changes with it. A strong verse on the wrong beat still sounds like a fight, and no amount of vocal mixing fixes that later.

So test a beat with your own voice on it before you pay for it. The checks below are in the order that saves the most time.

::figure check

## Tempo: find your pocket

Every vocalist has a range of tempos where the words sit comfortably. Find yours before you start scrolling. Put a metronome on at 70 BPM and freestyle or sing a few bars, then try 85, 100 and 140. Notice where you lock in and where you run out of breath or start rushing to fill space.

Styles cluster around typical tempos, which helps you shortlist. Treat the ranges below as a rough map.

::figure tempo

The number on the beat can mislead you. Trap is usually written around 140 BPM, but the snare lands once per bar on beat 3, so the music feels like 70 with fast hi-hats on top. You can ride it in a slow, spacious pocket or double up into a fast triplet flow. When a beat feels slower or faster than its number, trust the feel. The [tempo and key guide](/blog/understanding-bpm-and-key-matching) explains why half and double tempos line up.

## Key: check your range first

The key decides which notes your melody can use and how high the hook sits. Most beat stores list the key next to the BPM, and the [beat store](/studio/beats) here lets you filter by both.

Hum the hook you have in mind over the beat. If the highest note strains, the beat is too high for that melody. You can move the melody down, choose another beat or ask the producer for a transposed version. In the project, a producer can move the melody and the bass and leave the drums alone, which sounds far cleaner than a pitch shifter on the finished file. One or two semitones is often enough to bring a hook into a comfortable range.

## Space: does the beat leave room for you?

A beat built to stand alone often fills every gap with melody. It sounds impressive on its own and crowded with a voice on top. Listen for a verse where the main melody steps back or drops out, and a hook where it returns or something new arrives.

::figure space

Then listen to where the busiest instrument sits. The consonants that make your words clear live in the upper midrange. A bright lead synth, a vocal sample or a guitar riff in that range hides them, an effect called masking, and your engineer will end up turning the beat down to rescue the words. Deep bass, low pads and hi-hats leave the middle open.

Contrast helps too. A deep voice stands out against higher melodic sounds such as bells, flutes or plucks. A high voice stands out against darker, lower pads.

If the beat is one four-bar loop with nothing dropping in or out for three minutes, the arrangement work falls on you. That can be fine if you plan to build the song yourself, but you will need the separate tracks, the stems, to do it.

## Fit: does it belong with your songs?

Put the beats you are considering in a playlist next to your released songs and play it through. If one sounds like it belongs to a different artist, decide whether that change is deliberate. A new direction can be right. An accidental one makes a project feel scattered.

## Mix: check it on three systems

Before buying, play the beat on a phone speaker, in a car and on headphones.

- On the phone, can you still hear the melody and the snare?
- In the car, does the 808 hit cleanly, without distorting or booming?
- On headphones, is anything harsh, or so wide that it pulls your attention to one side?

Muddy low end or harsh highs are baked into a stereo beat file. Your engineer can EQ the whole file, but every fix also moves everything else in that range.

## Before you buy

Record a scratch verse and hook on the preview. Rough is fine: you are testing fit, not performance. Listen the next morning, on your phone and in the car. If you still want to hear it, it is a contender.

Then check the license before you record the final take, and compare what each tier includes with your release plan. If an engineer will mix your vocal inside the beat, choose a tier that includes stems. The current tiers:

::licenses

The terms are explained in plain language in [Beat licensing explained](/blog/beat-licensing-explained).
`,
    seo: {
        title: 'How to choose a beat that fits your voice | VGP Studio',
        description: 'Test a beat before you buy it: tempo and felt tempo, key and vocal range, space for the voice, mix quality on three systems and a scratch demo.',
        keywords: ['choose a beat', 'beat selection', 'beat for vocals', 'BPM', 'vocal range', 'buying beats'],
    },
};
