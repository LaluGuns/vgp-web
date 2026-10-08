import { BlogArticle } from '../blog-data';

export const post091: BlogArticle = {
    slug: 'sampling-is-taking-photos-of-air',
    title: 'Sampling is taking photos of air',
    excerpt: 'Digital audio is not a staircase. The sample rate sets the highest frequency a file can hold, and the converter plays one smooth wave through the samples.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'A sample rate sets the highest frequency a file can hold, half the rate. It does not make the audible range smoother.',
        'The converter plays one smooth wave through the samples. The staircase is only a drawing, and its steps are filtered away.',
        'Use 48 kHz by default, 96 kHz for sounds you will slow down a long way, and check masters with a true-peak meter.',
    ],
    figures: {
        rates: {
            type: 'bars',
            caption:
                'The Nyquist frequency is half the sample rate. Every common rate already stores everything up to the 20 kHz limit of hearing. Higher rates only add room above it.',
            alt: 'Bars for four sample rates. 44.1 kHz reaches 22.05 kHz, 48 kHz reaches 24 kHz, 96 kHz reaches 48 kHz and 192 kHz reaches 96 kHz. A line marks the 20 kHz limit of hearing, and every bar passes it.',
            min: 0,
            max: 100,
            unit: 'kHz',
            bars: [
                { label: '44.1 kHz session', value: 22.05, display: '22.05 kHz' },
                { label: '48 kHz session', value: 24, display: '24 kHz' },
                { label: '96 kHz session', value: 48, display: '48 kHz' },
                { label: '192 kHz session', value: 96, display: '96 kHz' },
            ],
            reference: { value: 20, label: 'Limit of hearing' },
        },
        stairs: {
            type: 'signal',
            caption:
                'The same 16 samples drawn two ways. The steps exist only in the drawing. Their sharp corners are energy above the Nyquist frequency, which the converter filters out, leaving the smooth wave through the dots.',
            alt: 'Two plots of the same sampled sine wave. In the first, the sample dots are joined by flat steps. In the second, a smooth sine passes through every dot.',
            rows: [
                {
                    label: 'Drawn as a staircase',
                    traces: [{ kind: 'sine', cycles: 2, amp: 0.85, muted: true }],
                    samples: { count: 16, hold: true },
                },
                {
                    label: 'What the converter plays',
                    traces: [{ kind: 'sine', cycles: 2, amp: 0.85 }],
                    samples: { count: 16 },
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A 48 kHz recording is pitched down an octave by playing it at half speed. Where does its top end now stop?',
            options: ['12 kHz', '24 kHz', '20 kHz', '48 kHz'],
            answer: 0,
            why: 'The file holds nothing above 24 kHz. Half speed halves every frequency, so its highest content lands at 12 kHz and the top octave of hearing is empty.',
        },
        {
            q: 'Why do sample rates leave a margin between 20 kHz and the Nyquist frequency?',
            options: [
                'Frequencies above 20 kHz carry the stereo image',
                'The margin leaves room for inter-sample peaks',
                'Most speakers roll off before reaching 20 kHz',
                'The anti-aliasing filter needs room to roll off',
            ],
            answer: 3,
            why: 'The converter must remove everything above the Nyquist frequency before sampling. No filter drops from full level to nothing at once, so it needs a band to work in: 20 to 22.05 kHz at 44.1 kHz.',
        },
        {
            q: 'Every sample of a master stops at 0 dBFS. How can it still clip on playback?',
            options: [
                'Dither adds level to every sample on export',
                'The wave between samples can peak above them',
                'The converter\'s stair steps overshoot 0 dBFS',
                'Streaming players can boost the bass on playback',
            ],
            answer: 1,
            why: 'The reconstructed wave passes through every sample but can rise between them. A sine at a quarter of the sample rate, sampled 45 degrees off its peaks, peaks 3 dB above its samples.',
        },
    ],
    content: `## Hook: the staircase in the textbook

Many audio textbooks show the same drawing: a smooth analog wave next to a blocky digital copy that looks like a staircase. It suggests that digital audio is jagged and that something is missing between the samples, so the obvious fix seems to be more samples per second.

The drawing is wrong about what you hear. A converter measures air pressure at regular instants, like a camera taking photos of moving air. On playback it does not hold each value as a flat step. It draws a smooth curve through the points, and if the photos were taken fast enough for the frequencies in the sound, that curve is the original wave.

## Why it matters: choosing a sample rate for the wrong reason

If you believe in the staircase, 192 kHz looks like a smoother picture. It is not. The sample rate sets how high a frequency the file can hold, nothing more. Every common rate already covers the full range of hearing, and each doubling of the rate doubles the disk space and the work every plugin has to do.

::figure rates

Higher rates do have real uses, and they all involve content above 20 kHz. Record at 96 kHz with a microphone that reaches past 20 kHz and you capture ultrasonic detail. Slow that recording down by an octave and the detail between 20 and 40 kHz drops into the range you can hear. A 48 kHz recording has nothing above 24 kHz, so after the same octave drop its top end stops at 12 kHz and it sounds dull. A higher internal rate also gives distortion plugins room to create harmonics without aliasing, which is what oversampling does.

## Science model: the sampling theorem

The Nyquist-Shannon sampling theorem says a signal can be rebuilt exactly from its samples if it contains no frequency at or above half the sample rate (Shannon, 1949):

$$f_s > 2 f_{\\max}$$

Here $f_s$ is the sample rate and $f_{\\max}$ the highest frequency in the signal. Half the sample rate is the Nyquist frequency: 22.05 kHz at 44.1 kHz, 24 kHz at 48 kHz. Hearing tops out around 20 kHz, so 40 kHz would be the bare minimum. The margin above that is for the anti-aliasing filter. The converter must remove everything above the Nyquist frequency before it samples, and a filter needs a band in which to roll off. At 44.1 kHz that band is the narrow stretch from 20 to 22.05 kHz. Anything above the limit that gets past the filter does not vanish. It is stored as a false, lower frequency.

::demo aliasing

On the way out, the converter turns the numbers back into a voltage. Its first stage may hold each value for a moment, which really is a staircase, but the steps themselves are energy above the Nyquist frequency. The reconstruction filter removes that energy, and what remains is the one smooth wave, with nothing above the Nyquist frequency, that passes through every sample. Its accuracy is set by the filters and the bit depth, not by anything missing between the samples.

::figure stairs

The smooth curve also explains inter-sample peaks. The true peak of the wave can fall between two samples and be higher than either of them. Take a sine at a quarter of the sample rate, sampled 45 degrees away from its peaks: every sample sits at 71% of the true peak. If those samples just touch 0 dBFS, the wave itself peaks at +3 dB. A sample-peak meter misses it. A true-peak meter, which oversamples to estimate the wave between samples, catches it.

## DAW experiment: see the samples, then slow them down

1. Create a 48 kHz session. Insert a test tone generator, set it to a 1 kHz sine at -6 dBFS and bounce two seconds to a new audio track.
2. Zoom in on the waveform until you can see individual samples. One cycle holds 48 of them.
3. Change the generator to 12 kHz and bounce again. Zoom in: there are only four samples per cycle. If your DAW joins them with straight lines, the wave looks like a triangle or a square, depending on where the samples fall.
4. Put a spectrum analyzer on the 12 kHz track and play it. There is a single peak at 12 kHz and no harmonics above it.
5. Generate four seconds of white noise in this session and bounce it. Then create a 96 kHz project, generate the same noise there and bounce it.
6. In each project, transpose the noise down 12 semitones with a pitch mode that resamples, often called varispeed or repitch, so the clip plays at half speed.
7. Compare the two on the analyzer. The 48 kHz version stops at 12 kHz. The 96 kHz version still reaches past 20 kHz.

The jagged 12 kHz wave sounds like a pure tone and the analyzer shows one line, because the converter plays a sine whatever the display draws. After the octave drop the 48 kHz noise sounds dull, while the 96 kHz noise keeps its top end: it had content up to 48 kHz to move down.

## Common mistake: running every session at 192 kHz

The most common mistake is recording and mixing everything at 96 or 192 kHz because it seems to raise quality across the board. For ordinary recording it adds no audible detail below 20 kHz. It does cost you: the computer processes two or four times as many samples, files grow, and ultrasonic content can cause intermodulation distortion in playback gear that was not built to reproduce it. Converting a finished 48 kHz file up to 96 kHz does not help either, because upsampling cannot create content the original never captured.

The second mistake is trusting a sample-peak meter on the master. A master whose samples stop at 0 dBFS can still clip in a playback converter or a lossy encoder because of inter-sample peaks. Check the master with a true-peak meter and leave headroom below 0 dBTP. A common target is -1 dBTP.

## Producer takeaway: pick the rate for the job

Use 48 kHz as your default. It covers hearing with margin, it is the standard for video, and it keeps CPU and disk use reasonable. Move to 96 kHz when you record sounds you plan to slow down or pitch down a long way, or when a session leans hard on distortion plugins that cannot oversample. Whatever the rate, finish with a true-peak check before you export.

## References

- Shannon, C. E. (1949). Communication in the presence of noise. *Proceedings of the IRE*, 37(1), 10-21.
- MIT OpenCourseWare. *6.003 Signals and Systems*, Fall 2011. https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/
`,
    seo: {
        title: 'Sampling is taking photos of air | VGP Studio',
        description: 'How the Nyquist-Shannon theorem rebuilds smooth waveforms from samples, why the staircase is a myth, and when a higher sample rate really helps.',
        keywords: ['sampling audio', 'nyquist shannon theorem', 'sample rate', 'stair step myth', 'digital audio basics', 'inter-sample peaks'],
    },
};
