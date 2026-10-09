import { BlogArticle } from '../blog-data';

export const post103: BlogArticle = {
    slug: 'cyberpunk-jazz-production-for-creator-videos',
    title: 'Cyberpunk Jazz: a human lead on a machine grid',
    excerpt: 'The genre lives on one contrast: synth layers locked to the grid and a jazz lead that leans against it. How to place each layer, and how far to push the lean.',
    category: 'genre-guides',
    publishedAt: '2026-07-19',
    updatedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Keep the synth layers on the grid. They are the reference that makes the human parts audible as human.',
        'Swing the ride and the lead together on the off-beats, and land the lead a few milliseconds behind the beats.',
        'Keep the offsets small and consistent: listeners rate exaggerated timing lower, and random humanizing on every part sounds sloppy.',
    ],
    figures: {
        layers: {
            type: 'rhythm',
            steps: 8,
            perBeat: 2,
            caption:
                'One bar of a slow cue in 8ths. The synth hats stay on the grid. The ride swings its off-beats. The lead swings with the ride and lands a little behind each beat, the pattern Friberg and Sundström (2002) measured in jazz soloists at slow tempos.',
            alt: 'Three lanes of eight steps. Synth hats on every 8th, exactly on the grid. Ride on beats 1, 2, 3 and 4 and on the off-beats after 2 and 4, with the off-beats drawn late. The lead on the beats drawn slightly late and on two off-beats drawn as late as the ride.',
            rows: [
                { label: 'Synth hats', note: 'on the grid', hits: [0, 1, 2, 3, 4, 5, 6, 7] },
                { label: 'Ride', note: 'swung', swing: 0.62, hits: [0, 2, 3, 4, 6, 7] },
                {
                    label: 'Lead',
                    note: 'behind the beat',
                    swing: 0.62,
                    focus: true,
                    hits: [{ step: 0, offset: 0.1 }, 1, { step: 2, offset: 0.1 }, { step: 4, offset: 0.1 }, 5, { step: 6, offset: 0.1 }],
                },
            ],
        },
        voice: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'Where a voiceover and a jazz lead overlap. The voice carries most of its energy below 1 kHz, but much of what makes words easy to follow sits between 1 and 4 kHz. A sax-like lead or bright keys centred there cover that band, so they are the parts to drop under talking.',
            alt: 'Frequency plot with a broad voiceover hump peaking around 500 Hz and reaching into the highs, a lead hump centred near 1.5 kHz drawn dashed, a low pad hump in grey, and a shaded band from 1 to 4 kHz.',
            curves: [
                { kind: 'hump', center: 500, width: 1.5, level: 0.85, label: 'Voiceover' },
                { kind: 'hump', center: 1500, width: 0.9, level: 0.7, label: 'Lead or keys', dashed: true },
                { kind: 'hump', center: 180, width: 1.2, level: 0.5, label: 'Pad', muted: true },
            ],
            bands: [{ from: 1000, to: 4000, label: 'Speech clarity' }],
        },
    },
    quiz: [
        {
            q: 'At 80 BPM an 8th note lasts 375 ms. You move the lead 15 ms behind each beat. What fraction of an 8th is that?',
            options: ['About 4 percent', 'About 15 percent', 'About 25 percent', 'About 40 percent'],
            answer: 0,
            why: '15 / 375 = 0.04. That is enough to feel laid back and small enough that nobody hears the lead as late.',
        },
        {
            q: 'Why keep the synth hats and arpeggio fully quantized?',
            options: [
                'Quantized synths use less CPU in the session',
                'Streaming services prefer quantized music',
                'They give the ear a grid to hear the lean against',
                'Swing only works on acoustic drum samples',
            ],
            answer: 2,
            why: 'A lean is heard against something steady. If every layer drifts, there is no reference left and the cue just sounds loose.',
        },
        {
            q: 'You set a humanize function to 40 percent on every track. What usually happens?',
            options: [
                'The cue grooves harder because nothing is on the grid',
                'The cue sounds sloppy because the offsets are random',
                'Nothing audible changes at that small an amount',
                'The tempo of the whole cue slowly drifts upward',
            ],
            answer: 1,
            why: 'Random offsets on every part do not share a direction, so they read as mistakes. In listening tests, exaggerated timing deviations lowered groove ratings.',
        },
    ],
    content: `## Hook: the cue that sounds like a preset demo

You build a Cyberpunk Jazz cue for a night-city edit: a filtered synth arpeggio, a dark pad, a ride cymbal and a sax-like lead playing a minor phrase. Every note is quantized. It sounds clean and expensive, and it also sounds like a demo of the synth you used. Nothing in it feels played.

So you select everything and hit humanize at 40 percent. Now it sounds as if the band had a long night. The arpeggio wobbles, the ride drifts against the hats, and the lead seems to be lost rather than relaxed.

## Why it matters: the genre is a contrast

Cyberpunk Jazz works when something human sits inside something built. The machine side is the synth arpeggio, the hats, the bass and the pad. The human side is the jazz part: a swung ride, comping keys, a lead that phrases like a horn player.

The contrast only works if each side stays itself. Quantize everything and there is no human side. Loosen everything and there is no machine side, so the ear has nothing steady to hear the lean against. The job is to decide which layers hold the grid and which layers lean, and by how much.

## Science model: how jazz players lean against the beat

Friberg and Sundström (2002) measured timing in jazz recordings. Drummers' ride patterns swung hard at slow tempos and moved toward even 8ths as the tempo rose. At slow tempos, soloists landed behind the drummer on the beats and in step with the drummer on the off-beats. The lean has a direction, and on the off-beats it lines up with the rhythm section.

::figure layers

Small offsets go a long way. At 80 BPM an 8th note lasts 60,000 / 80 / 2 = 375 ms, so a lead 15 ms behind the beat is 4 percent of an 8th late: felt as relaxed, not heard as late.

Bigger is not better. Senn et al. (2016) scaled the timing deviations of real bass and drum performances up and down. Fully quantized and original versions were rated about equally for groove, and exaggerated deviations lowered the ratings. Davies et al. (2013) found the same drop as deviations grew in short rhythms. Microtiming gives a part a direction to lean in. It does not add groove by itself.

The [lesson on swing](/blog/swing-explained-without-mystical-language) covers how a swing setting moves the off-beats. Try it on a beat here, and listen for the point where swing stops leaning and starts limping.

::demo swing

## DAW experiment: one grid, two kinds of time

Use a slow tempo, around 80 BPM, and a short minor phrase you can loop.

1. Program the synth hats or arpeggio in straight 8ths and quantize them fully. This is your grid.
2. Program a ride on beats 1, 2, 3 and 4 with off-beats after 2 and 4, and add swing to the 8ths until the off-beats lean late. Many DAWs call this 55 to 62 percent; set it by ear.
3. Play or program the lead phrase and quantize it with the same swing as the ride.
4. Select only the lead notes that fall on a beat and move them 10 to 20 ms late. Leave the off-beat notes with the ride.
5. Loop and compare three versions: lead straight, lead swung with the ride, and lead swung and late on the beats.
6. Push the late notes to 40 ms. Listen for the moment the lead stops sounding relaxed and starts sounding behind.
7. Raise the tempo to 120 BPM and keep the same swing. If the short off-beat notes start to sound clipped, reduce the swing, the way the drummers in the recordings did.

## Common mistake: humanizing every track

A humanize function adds random offsets, and random offsets point in every direction at once. Apply it to every track and the synth layers lose the precision that made them sound synthetic, while the jazz parts get scattered offsets with no direction.

The second mistake is making the lean too big because it is fun to hear. At 120 BPM an 8th lasts 250 ms, so a lead 50 ms behind is a fifth of an 8th late, and it sounds like a mistake. Keep the offsets small and consistent, and keep them on the parts that would be played by a person.

The third is forgetting the job of the cue. Under a creator's voiceover, the lead and the bright keys sit right in the band that carries the words.

::figure voice

Write the lead for the sections without talking, and let the grid layers and the ride carry the cue while someone speaks. The [lesson on City Pop under a voiceover](/blog/producing-city-pop-background-music-for-creators) shows how to dip that band when a part has to stay.

## Producer takeaway: decide who holds the grid

Before you touch timing, sort the layers into two groups. Synths, hats and bass hold the grid, quantized. Ride, keys and lead lean, by swing and a small, consistent lag on the beats. Check the lean against the grid, not in solo, and pull it back the moment it sounds like a mistake.

## References

- Davies, M., Madison, G., Silva, P., & Gouyon, F. (2013). The effect of microtiming deviations on the perception of groove in short rhythms. *Music Perception*, 30(5), 497-510.
- Friberg, A., & Sundström, A. (2002). Swing ratios and ensemble timing in jazz performance: Evidence for a common rhythmic pattern. *Music Perception*, 19(3), 333-349.
- Senn, O., Kilchenmann, L., von Georgi, R., & Bullerjahn, C. (2016). The effect of expert performance microtiming on listeners' experience of groove in swing or funk music. *Frontiers in Psychology*, 7, 1487.
`,
    seo: {
        title: 'Cyberpunk Jazz: a human lead on a machine grid | VGP Studio',
        description: 'Cyberpunk Jazz lives on one contrast: synths on the grid, a jazz lead that leans. Where to swing, how far to lag, and why random humanize fails.',
        keywords: ['cyberpunk jazz production', 'jazz swing timing', 'microtiming', 'behind the beat', 'humanize MIDI', 'cyberpunk music for videos'],
    },
};
