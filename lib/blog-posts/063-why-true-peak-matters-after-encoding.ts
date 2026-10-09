import { BlogArticle } from '../blog-data';

// A tone at a quarter of the sample rate: 2 cycles, 8 samples across the plot.
const TONE = { kind: 'sine' as const, cycles: 2, amp: 1, muted: true, label: 'Wave the converter rebuilds' };

export const post063: BlogArticle = {
    slug: 'why-true-peak-matters-after-encoding',
    title: 'True peak bites after encoding',
    excerpt: 'A master can read -0.1 dBFS and still clip on a phone. Why the wave between samples and the lossy encode both peak higher, and which ceiling to set.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'A sample-peak meter reads the samples, but the speaker plays the continuous wave between them, which can crest higher.',
        'Lossy encoding changes the waveform again, so the decoded file can peak above a master that looked clean.',
        'Set the final limiter in true-peak mode at -1 dBTP, or -2 dBTP for Spotify masters louder than -14 LUFS, and meter an encoded copy.',
    ],
    figures: {
        between: {
            type: 'signal',
            caption:
                'The same tone at a quarter of the sample rate, sampled twice. When the samples land on the crests, the highest sample is the true peak. Shift the timing by 45 degrees and every sample sits at 0.707 of the crest, so a sample-peak meter reads 3 dB low.',
            alt: 'Two plots of a sine wave with sample dots. In the first, the dots sit on the crests. In the second, every dot sits below the crests at the same height, marked by a dashed line labelled sample peak.',
            rows: [
                { label: 'Samples on the crests', traces: [{ ...TONE, phase: 90 }], samples: { count: 8 } },
                {
                    label: 'Samples 45 degrees off the crests',
                    traces: [{ ...TONE, phase: 45, muted: false }],
                    samples: { count: 8 },
                    lines: [{ y: 0.707, label: 'Sample peak' }],
                },
            ],
        },
        ceilings: {
            type: 'scale',
            caption:
                'True-peak ceilings from the documents that set them. EBU R 128 allows -1 dBTP for PCM in production and its guidelines suggest -2 dBTP for some codecs. Spotify asks for -1 dBTP, and -2 dBTP once a master is louder than -14 LUFS.',
            alt: 'A number line from -3 to +1 dBTP. Full scale is marked at 0, the EBU and Spotify ceiling at -1, and the ceiling for codecs and loud Spotify masters at -2. The region above 0 is shaded as clipping.',
            min: -3,
            max: 1,
            unit: 'dBTP',
            ticks: [-3, -2, -1, 0, 1],
            markers: [
                { value: 0, label: 'Full scale', strong: true },
                { value: -1, label: 'R 128, Spotify' },
                { value: -2, label: 'Codecs, loud masters' },
            ],
            ranges: [{ from: 0, to: 1, label: 'Clips' }],
        },
    },
    quiz: [
        {
            q: 'Why can a file whose highest sample is -0.1 dBFS still clip on playback?',
            options: [
                'Dither noise can add a full 1 dB to each peak',
                'The streaming service can add gain to each track',
                'The peak meter hides overs shorter than 1 ms',
                'The rebuilt wave can crest between the samples',
            ],
            answer: 3,
            why: 'The samples are points on a wave. The rebuilt wave can rise above them, and lossy decoding can push it higher still.',
        },
        {
            q: 'A tone at a quarter of the sample rate is sampled 45 degrees off its crests. How far does a sample-peak meter under-read?',
            options: ['About 1 dB', 'About 6 dB', 'About 3 dB', 'About 0.7 dB'],
            answer: 2,
            why: 'Every sample lands at sin 45°, 0.707 of the crest, and 20 log10(0.707) is about -3 dB.',
        },
        {
            q: 'Your master measures -9 LUFS and goes to Spotify. Which true-peak ceiling does Spotify recommend?',
            options: ['-1 dBTP', '-2 dBTP', '-0.1 dBTP', '0 dBTP'],
            answer: 1,
            why: 'Spotify asks for true peak below -1 dBTP in general and below -2 dBTP for masters louder than -14 LUFS, because louder tracks distort more easily when they are encoded.',
        },
    ],
    content: `## Hook: clean in the session, crackling on the phone

You bounce a master and the peak meter reads -0.1 dBFS. It sounds clean on your monitors. Weeks later, on a phone, the hi-hats fizz and the loudest snare hits carry a faint crackle. Nothing in your session changed.

Between your bounce and that phone, the file was turned back into a continuous wave and passed through a lossy codec. Both steps can create peaks your meter never showed you.

## Why it matters: the meter reads samples, the speaker plays a wave

An ordinary peak meter reports the largest sample value. A digital file is a list of samples, but what reaches the speaker is the continuous wave those samples describe, rebuilt by the reconstruction filter in a converter. That wave can crest between two samples, higher than either of them. These are inter-sample peaks.

How far off a sample meter is depends on where the samples happen to fall. ITU-R BS.1770 gives the textbook case: a tone at a quarter of the sample rate, sampled 45 degrees away from its crests, reads 3 dB low. For short transients with a lot of high-frequency content, the standard says the under-read can commonly be several decibels.

::figure between

A dense, heavily limited master is the worst case. Many samples sit right at the ceiling, so the rebuilt wave gets many chances to rise above it. Anything above full scale clips in whatever stage has to hold the signal within a fixed range: a digital-to-analog converter, a sample rate converter, or a decoder that writes fixed-point audio. EBU Tech 3343 lists exactly those places.

## Science model: true peak and what encoding adds

A true-peak meter estimates the continuous wave by oversampling. BS.1770 describes the reference method: raise a 48 kHz signal four times, to 192 kHz, with an interpolating low-pass filter, then take the largest absolute value. The result is reported in dBTP. Even this meter can miss a little, and the standard gives the worst case:

$$\\Delta_{\\max} = 20 \\log_{10}\\left( \\cos \\frac{\\pi f_{\\text{norm}}}{n} \\right)$$

Here $n$ is the oversampling ratio and $f_{\\text{norm}}$ the highest frequency as a fraction of the sample rate. With $n = 4$ and $f_{\\text{norm}} = 0.5$, that is about -0.69 dB. EBU R 128 therefore sets the production ceiling at -1 dBTP rather than 0: its guidelines explain that 1 dB of headroom covers the possible under-read of a 4x meter.

Lossy encoding adds a second problem. An MP3, AAC or Ogg Vorbis encoder does not store your waveform. It stores an approximation that should sound the same, and the decoded wave is a different wave, which can peak higher than the original. EBU Tech 3343 names lossy coding as a cause of peaks above the sample level, and Apple's mastering guide warns that "levels that don't show overs on PCM can still cause clipping when encoded" (Apple, 2021).

That is why ceilings for encoded delivery are lower. The EBU recommends -2 dBTP for the broadcast codecs MPEG-1 Layer 2 and Dolby AC-3. Spotify recommends below -1 dBTP in general and below -2 dBTP for masters louder than -14 LUFS, because louder tracks are more likely to distort when they are transcoded.

::figure ceilings

## DAW experiment: meter the encoded file

1. Put a true-peak meter on your master bus after the limiter. Any BS.1770 loudness meter shows dBTP.
2. Set the limiter ceiling to -0.1 dB with its true-peak or ISP mode off. Play the loudest chorus and note the sample-peak and true-peak readings.
3. Bounce that chorus as a 24-bit WAV, then convert the same section to a 128 kbps MP3 or AAC.
4. Import both files to two tracks, put the same true-peak meter on each, and play them.
5. Compare the readings. Anything above 0 dBTP on the encoded file will clip in a fixed-point playback chain.
6. Switch the limiter's true-peak mode on, set the ceiling to -1 dBTP (or -2 dBTP if the master is louder than -14 LUFS), and repeat steps 3 to 5.

On a loud master the encoded file often reads higher than the WAV, and on a dense chorus it can pass 0 dBTP when the WAV did not. With the lower true-peak ceiling, the encoded copy should stay below 0. On a Mac, Apple's AURoundTripAAC plugin compares your audio with its AAC encode and flags clipping in real time.

## Common mistake: trusting the sample meter

Setting the limiter to 0 or -0.1 dB in sample-peak mode leaves no room for reconstruction or the codec. Your DAW still looks clean, because the overs appear later, in a converter or decoder you do not control.

The second mistake is expecting a lower ceiling to rescue an over-limited master. -1 dBTP gives the codec room. It does not restore the flattened transients. Spotify asks louder masters for the extra decibel because they are more prone to distortion when they are encoded.

## Producer takeaway: set the ceiling in true peak

Turn on true-peak detection in your final limiter and set the ceiling to -1 dBTP, or -2 dBTP for masters louder than -14 LUFS going to Spotify. Then check an encoded copy as well as the WAV, because the encoded file is the one your listener hears. The rest of the delivery chain is covered in [why delivery specs save the song](/blog/why-delivery-specs-save-the-song).

## References

- Apple. (2021). *Apple Digital Masters* [Technology brief]. https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf
- European Broadcasting Union. (2023). *EBU R 128: Loudness normalisation and permitted maximum level of audio signals*. EBU. https://tech.ebu.ch/publications/r128/
- European Broadcasting Union. (2023). *Tech 3343: Guidelines for production of programmes in accordance with EBU R 128*. EBU. https://tech.ebu.ch/docs/tech/tech3343.pdf
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'True peak bites after encoding | VGP Studio',
        description: 'Why inter-sample peaks and lossy encoding make a clean master clip on playback, how true-peak meters work, and which dBTP ceiling to set for streaming.',
        keywords: ['true peak', 'inter-sample peaks', 'dBTP', 'lossy encoding', 'ITU-R BS.1770', 'limiter ceiling'],
    },
};
