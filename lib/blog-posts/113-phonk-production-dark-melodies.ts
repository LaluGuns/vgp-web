import { BlogArticle } from '../blog-data';

export const post113: BlogArticle = {
    slug: 'phonk-production-dark-melodies',
    title: 'Phonk: a cowbell lead, a distorted 808 and grit you choose',
    excerpt: 'Where phonk comes from, how the 808 cowbell and distorted bass carry it, and how to make it loud and dirty without the mix turning into noise.',
    category: 'genre-guides',
    publishedAt: '2026-01-22',
    updatedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Phonk takes its sound from 1990s Memphis rap tapes and the slowed, chopped and screwed style. Drift phonk is a faster, cowbell-led offshoot.',
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
            alt: 'Arrangement grid for intro, drop, break and second drop. Cowbell is quiet in the intro, full in both drops and silent in the break. Drums, hats and 808 play only in the drops. The vocal sample runs throughout. A second melody plays in the break and at a lower level in the second drop.',
            density: true,
            sections: [
                { label: 'Intro', bars: 8 },
                { label: 'Drop', bars: 16 },
                { label: 'Break', bars: 8 },
                { label: 'Drop 2', bars: 16 },
            ],
            layers: [
                { label: 'Cowbell', levels: [0.4, 1, 0, 1] },
                { label: 'Vocal', focus: true, levels: [0.8, 0.5, 0.8, 0.6] },
                { label: 'Drums', levels: [0, 1, 0, 1] },
                { label: 'Hats', levels: [0, 0.8, 0, 0.9] },
                { label: '808', levels: [0, 1, 0, 1] },
                { label: 'Melody 2', levels: [0, 0, 0.8, 0.4] },
            ],
        },
    },
    quiz: [
        {
            q: 'A cowbell hit lasts 300 ms. Your sampler transposes by playback speed. How long does the note last an octave up?',
            options: ['75 ms', '150 ms', '300 ms', '600 ms'],
            answer: 1,
            why: 'An octave up doubles the playback speed, so the sample plays in half the time: 150 ms. An octave down would stretch it to 600 ms.',
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
    content: `## Hook: the cowbell line that falls apart

You load an 808 cowbell into a sampler and play a dark minor riff across two octaves, the way you would on a piano patch. The low notes drag and boom, the top notes turn into short clicks, and once the distorted 808 and the drums come in, the whole drop turns into fizz on a phone speaker.

Every part of that is fixable, and each fix comes from how the sounds are made.

## Why it matters: the cowbell is the lead

Phonk takes its sound from early-1990s Memphis rap: slow, half-time beats from drum machines and samplers, dark melodic samples and the 808's synthesized cowbell, much of it spread on small runs of self-made cassettes whose hazy, worn sound is now part of the style. It also borrows slowed, pitched-down vocals from DJ Screw's chopped and screwed remixes (Much, 2024). Drift phonk, a faster offshoot built around melodic cowbells and heavy distortion, found a large audience on TikTok and YouTube.

In a lot of phonk the cowbell carries the melody and a distorted 808 carries the low end. If either one breaks, there is no other part to cover for it.

## Science model: a two-pitch bell, a speed-based sampler and placed distortion

The TR-808 cowbell is built from two of the machine's pulse-wave oscillators at fixed pitches, mixed through a band-pass filter and shaped by one envelope (Reid, 2002). Because it holds two pitches at once, it sounds clangy and metallic rather than like a clean note. Play a cowbell sample across the keyboard and both pitches move together, so the melody keeps that metallic colour.

A sampler that transposes by changing playback speed changes length too. Up $n$ semitones, the sample plays $2^{n/12}$ times faster: an octave up, a 300 ms hit lasts 150 ms; an octave down, 600 ms. That is why the top of a wide riff clicks and the bottom drags. Keep the line within about an octave of the root.

Rhythm matters as much as the notes. Straight 8ths land with the pulse. Grouping 16ths as 3+3+2 puts notes between the beats, so the line pushes against the kick.

::figure cowbell

The bass is usually a distorted 808, pushed until it growls. Distortion adds harmonics above the note, which is what lets a phone speaker suggest a bass it cannot play; the [lesson on the trap 808](/blog/trap-beats-anatomy-of-the-perfect-808) goes through the maths. Distortion you place on the bass and drums can be shaped and oversampled. Clipping at the final output distorts everything at once, and a hard clipper without oversampling adds aliasing: harmonics that fold back to pitches unrelated to the song.

The Memphis vocal sound is slowed, dark and narrow. Pitch a vocal down without formant correction and its formants drop with it, so the voice sounds bigger and darker; varispeed lowers tempo and pitch together, the screwed sound. A high-pass around 300 Hz and a low-pass around 3 to 4 kHz give the boxed tone of a small speaker, close to the classic telephone band of about 300 Hz to 3.4 kHz.

Streaming services turn loud tracks down to a similar playback level, so past a point more limiting only costs punch. Drive a limiter here at matched loudness and listen for the moment the drums flatten.

::demo limiter

## DAW experiment: build a phonk drop with grit you chose

1. Load a cowbell sample into a sampler, set the root note to the sample's real pitch, and write a four-bar minor riff that stays within one octave.
2. Program it twice: straight 8ths, then 16ths grouped 3+3+2. Keep the version that pulls against the kick the way you want.
3. Add a distorted 808: duplicate it, high-pass the copy around 100 Hz after the distortion, and keep the clean sub in mono.
4. Duck the 808 and the cowbell from the kick with a sidechain compressor for the pumping bounce. Leave the vocal sample out of the sidechain.
5. Process a vocal: pitch it down two to four semitones, high-pass around 300 Hz and low-pass around 3 to 4 kHz, then add a little hiss and slow pitch wobble for tape wear.
6. Saturate the bass and cowbell, run the drum bus into a clipper with oversampling on, then put a limiter on the master. Check the master never clips.
7. Arrange it: filtered cowbell and vocal in the intro, everything in the drop, a break without drums, then a second drop with one new element.

## Common mistake: letting the output decide the distortion

The common mistake is pushing the master until it breaks up. Clipping in the converter or in the bounced file distorts every part at once, including the vocal and the cowbell's attack, and you cannot shape it afterwards.

The second is reaching for a bitcrusher to sound like tape. A cassette has no bit depth. Tape wear is hiss, lost highs and slow and fast pitch wobble, called wow and flutter. A bitcrusher sounds like an early sampler, which can fit the style too, but it is a different sound.

The third is sampling old Memphis vocals without clearance. Using a recording that is not yours needs permission from the owners of the recording and the song before you release it. Recording your own lines in that style avoids the problem and gives you a voice nobody else has.

::figure arrange

## Producer takeaway: put the dirt where you want it

Keep the cowbell riff within an octave and let its rhythm do the pushing. Distort the 808 and the drums on purpose, with oversampling, and keep the final output clean. Give the arrangement room to breathe between drops so each one lands. The [lesson on loud masters after normalization](/blog/why-loud-masters-can-sound-smaller-after-normalization) explains why the last few decibels of limiting rarely pay off.

## References

- Much, V. (2024, January 17). How Memphis rap created phonk. *Splice*. https://splice.com/blog/what-is-phonk-music/
- Reid, G. (2002, September). Synthesizing cowbells & claves. *Sound On Sound*, Synth Secrets series.
`,
    seo: {
        title: 'Phonk: a cowbell lead and grit you choose | VGP Studio',
        description: 'Phonk from its Memphis and Houston roots to drift phonk: the 808 cowbell, distorted 808 bass, Memphis-style vocal processing and loud masters without noise.',
        keywords: ['phonk production', 'drift phonk', 'Memphis rap', '808 cowbell', 'phonk vocals', 'distorted 808'],
    },
};
