import { BlogArticle } from '../blog-data';

export const post113: BlogArticle = {
    slug: 'phonk-production-dark-melodies',
    title: 'Phonk production: the cowbell, the bass and the Memphis roots',
    excerpt: 'Where phonk comes from, how the 808 cowbell and distorted bass carry it, and how to make it loud and dirty without the mix turning into noise.',
    category: 'genre-guides',
    publishedAt: '2026-01-22',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Phonk takes its sound from 1990s Memphis rap tapes and Houston\'s chopped and screwed style. Drift phonk is a faster, cowbell-led offshoot from the late 2010s.',
        'The cowbell often carries the melody, so set the sample\'s root note, keep the line within about an octave and phrase it against the drums.',
        'Put the grit where you choose, with saturation and a clipper on the bass and drums, never by clipping the final output.',
    ],
    figures: {
        cowbell: {
            type: 'rhythm',
            caption:
                'The same cowbell in two rhythms. Straight eighths land with the pulse. Grouped 3+3+2, four of the six notes fall between the beats, so the line pulls against the kick.',
            alt: 'Three lanes on a 16-step grid. Straight eighths hit every second step with accents on the beats. The 3+3+2 lane hits on steps 1, 4, 7, 9, 12 and 15. The kick hits on beats 1 and 3.',
            rows: [
                {
                    label: 'Straight eighths',
                    note: 'with the pulse',
                    hits: [0, { step: 2, level: 0.5 }, 4, { step: 6, level: 0.5 }, 8, { step: 10, level: 0.5 }, 12, { step: 14, level: 0.5 }],
                },
                { label: '3+3+2', focus: true, note: 'against the pulse', hits: [0, 3, 6, 8, 11, 14] },
                { label: 'Kick', hits: [0, 8] },
            ],
        },
        arrange: {
            type: 'arrangement',
            caption:
                'Density is lowest in the intro and the break, so each drop lands as an arrival. The vocal sample runs through every section and ties the parts together.',
            alt: 'Arrangement grid for intro, drop, break and second drop. Cowbell is quiet in the intro, full in both drops and silent in the break. Drums, hats and 808 play only in the drops. The vocal sample runs throughout. A second melody plays in the break and quietly in the second drop.',
            density: true,
            sections: [
                { label: 'Intro', bars: 8 },
                { label: 'Drop', bars: 16 },
                { label: 'Break', bars: 8 },
                { label: 'Drop 2', bars: 16 },
            ],
            layers: [
                { label: 'Cowbell', levels: [0.4, 1, 0, 1] },
                { label: 'Vocal', levels: [0.8, 0.5, 0.8, 0.6] },
                { label: 'Drums', levels: [0, 1, 0, 1] },
                { label: 'Hats', levels: [0, 0.8, 0, 0.9] },
                { label: '808', levels: [0, 1, 0, 1] },
                { label: 'Melody 2', levels: [0, 0, 0.8, 0.4] },
            ],
        },
    },
    quiz: [
        {
            q: 'Where does the sound of phonk come from?',
            options: [
                'Brazilian funk automotivo from the 2020s',
                '1990s Memphis tapes and Houston screw mixes',
                'American funk and soul records from the 1970s',
                'Japanese city pop and synth pop of the 1980s',
            ],
            answer: 1,
            why: 'Memphis producers of the early 1990s gave phonk its half-time drums, 808 cowbells and dark samples. Houston\'s chopped and screwed mixes gave it the slowed, pitched-down vocals.',
        },
        {
            q: 'You want a vocal to sound like it came off a worn cassette. Which processing fits?',
            options: [
                'Bit reduction to 8 bits and a low sample rate',
                'A bright plate reverb and a short pre-delay',
                'Tape hiss, lost highs and slow pitch wobble',
                'A wide stereo chorus and a fast tremolo',
            ],
            answer: 2,
            why: 'Tape has no bit depth. Its wear is hiss, rolled-off highs and wow and flutter. A bitcrusher sounds like an early sampler instead.',
        },
        {
            q: 'Where should the distortion in a loud phonk master come from?',
            options: [
                'Saturating and clipping the bass and drums',
                'Letting the final output clip past 0 dBFS',
                'Turning the master fader up until it breaks up',
                'Lowering the bit depth of the final bounce',
            ],
            answer: 0,
            why: 'Distortion you place is distortion you can shape and oversample. Clipping the output or the file distorts everything at once, in ways you did not choose.',
        },
    ],
    content: `## Where phonk comes from

In the early 1990s, rap producers in Memphis built slow, half-time beats on drum machines and samplers, with dark melodic samples and the 808's synthesized cowbell. Much of that music circulated on small runs of self-made cassette tapes, and their hazy, worn sound is now part of the style (Much, 2024). In Houston, DJ Screw's chopped and screwed mixes slowed records down, which dropped their pitch, and repeated phrases for effect.

The name phonk took hold in the early 2010s, when underground rappers and producers revived the Memphis sound online. Drift phonk emerged in Russia in the late 2010s. It is faster, built around melodic 808 cowbells and heavy distortion, and it spread worldwide as the soundtrack to car drifting videos on short-form platforms. Funk automotivo from Brazil is often called Brazilian phonk abroad, but it is a style of Brazilian funk with its own history.

If you make phonk, listen to the Memphis tapes it comes from, not only the playlists it became. The drums, the cowbell and the vocal treatment make more sense once you hear where they started.

## The cowbell

The TR-808 cowbell is built from two of the machine's pulse-wave oscillators at fixed pitches, mixed through a band-pass filter and shaped by one envelope (Reid, 2002). Because it holds two pitches at once, it sounds clangy and metallic rather than like a clean note. Load a cowbell sample into a sampler and play it across the keyboard, and both pitches move together, so the melody keeps that metallic colour.

A sampler that transposes by changing playback speed also changes the length: higher notes get shorter and lower notes longer. Keep the melody within about an octave of the root, or the top notes turn thin and clicky and the low ones drag. In drift phonk the cowbell often plays the lead, so saturate it enough to cut through a distorted bass.

Rhythm matters as much as the notes. Straight eighths drive forward. Grouping sixteenths as 3+3+2 puts some notes between the beats, so the line pushes against the drums. Try both over the same chords.

::figure cowbell

## Bass and drums

Phonk bass is usually a distorted 808, pushed until it growls. The same rules as in trap apply: set the sample's root note, distort a copy and high-pass it so its harmonics sit on top of a clean sub, and keep the low end mono. [Anatomy of a trap 808](/blog/trap-beats-anatomy-of-the-perfect-808) covers each step.

Keep the kick short and clicky so it cuts through the 808, and the snare or clap dry and tight. Vary the hi-hat velocities so the hats move rather than buzz. Sidechain ducking from the kick to the bass and the cowbell gives the track its pumping bounce. Duck the music, not the vocal sample: when the words pump, they get harder to follow.

## Vocals and samples

The Memphis vocal sound is slowed, dark, narrow and worn. You can build it in a few moves.

1. **Lower the pitch.** Pitch the vocal down a few semitones. Without formant correction the formants drop too, which makes the voice sound bigger and darker. Slowing it with varispeed lowers tempo and pitch together, the screwed sound.
2. **Narrow the band.** A high-pass around 300 Hz and a low-pass around 3 to 4 kHz give a boxed, small-speaker tone, close to the classic telephone band of roughly 300 Hz to 3.4 kHz.
3. **Wear it out.** Cassette wear comes from tape hiss, lost highs, and slow and fast pitch wobble called wow and flutter. A cassette has no bit depth, so a bitcrusher does not sound like tape. It sounds like an early sampler, which can also fit the style.

Many phonk tracks sample old Memphis vocals. Using a recording that is not yours needs clearance from the people who own the recording and the song before you release it. Record your own lines in that style, or work with a vocalist, and you avoid the problem and get a voice nobody else has.

## Loud without turning to noise

Phonk masters are loud and dirty, but the dirt should come from where you put it. Saturate the bass and the cowbell, run the drum bus into a clipper, then let a limiter catch what is left. Do not let the final output clip. Clipping in the converter or in the bounced file is distortion you did not choose. A hard clipper without oversampling also adds aliasing: harmonics that fold back to pitches unrelated to the song, explained in [why aliasing is a ghost frequency problem](/blog/why-aliasing-is-a-ghost-frequency-problem).

Streaming services turn loud tracks down to a similar playback level, so past a point extra limiting only costs punch. See [why loud masters can sound smaller after normalization](/blog/why-loud-masters-can-sound-smaller-after-normalization).

## Arrangement

A simple structure that suits the style: an intro with the filtered cowbell and the vocal and no drums, a drop with everything, a break that pulls the drums and brings in a second melody, then a second drop with a new vocal chop or cowbell variation so the repeat still moves.

::figure arrange

## References

- Much, V. (2024, January 17). How Memphis rap created phonk. *Splice*. https://splice.com/blog/what-is-phonk-music/
- Reid, G. (2002, September). Synthesizing cowbells & claves. *Sound On Sound*, Synth Secrets series.
`,
    seo: {
        title: 'Phonk production: the cowbell, the bass and the Memphis roots | VGP Studio',
        description: 'Phonk from its Memphis and Houston roots to drift phonk: the 808 cowbell, distorted 808 bass, Memphis-style vocal processing and loud masters without noise.',
        keywords: ['phonk production', 'drift phonk', 'Memphis rap', '808 cowbell', 'phonk vocals', 'distorted 808'],
    },
};
