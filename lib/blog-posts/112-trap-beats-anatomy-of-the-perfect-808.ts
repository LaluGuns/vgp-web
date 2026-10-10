import { BlogArticle } from '../blog-data';

export const post112: BlogArticle = {
    slug: 'trap-beats-anatomy-of-the-perfect-808',
    title: 'Anatomy of a trap 808: pitch, tail and distortion',
    excerpt: 'An 808 is a tuned bass note that hits like a drum. How to set its pitch, make it audible on a phone and keep it from fighting the kick.',
    category: 'genre-guides',
    publishedAt: '2026-02-03',
    updatedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'An 808 plays notes, so set the sampler\'s root note to the sample\'s real pitch and play it in the key of the beat.',
        'Distortion adds harmonics at whole-number multiples of the note, and on a phone those harmonics carry the bass line the speaker cannot play.',
        'Line up the kick and the 808 so their low ends push the same way, or duck the 808 for the length of the kick.',
    ],
    figures: {
        harmonics: {
            type: 'spectrum',
            mode: 'level',
            range: [20, 2000],
            caption:
                'A saturated 808 on F1, drawn as one line per harmonic. The fundamental at 43.7 Hz is what you feel on a big system. The harmonics at 87.3, 131, 174.6 Hz and up carry the note on small speakers, which play mostly the upper ones, and their even spacing tells the ear which note it is.',
            alt: 'Spectrum from 20 Hz to 2 kHz with vertical lines at 43.7 Hz and every multiple of it, each shorter than the last, up to about 520 Hz. A shaded band labelled harmonics covers 80 to 600 Hz.',
            curves: [{ kind: 'harmonics', f0: 43.65, count: 12, rolloff: 1.2 }],
            marks: [{ f: 43.65, label: 'F1' }],
            bands: [{ from: 80, to: 600, label: 'Harmonics' }],
        },
        clip: {
            type: 'signal',
            caption:
                'Two cycles of the same 808 note. Soft saturation rounds the wave toward a square; hard clipping cuts its peaks flat. The squarer the wave, the more energy it carries in high harmonics.',
            alt: 'Three waveform plots. A clean sine wave. The same wave soft-saturated, with rounded, wider tops. The same wave hard-clipped, with flat tops. The clean wave is drawn faintly behind the second and third plots.',
            rows: [
                { label: 'Clean', traces: [{ kind: 'sine', cycles: 2, amp: 0.85 }] },
                {
                    label: 'Soft saturation',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.85, muted: true },
                        { kind: 'sine', cycles: 2, amp: 0.85, gain: 2.2, clip: 0.85, soft: true },
                    ],
                },
                {
                    label: 'Hard clipping',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.85, muted: true },
                        { kind: 'sine', cycles: 2, amp: 0.85, gain: 2.2, clip: 0.85 },
                    ],
                },
            ],
        },
        pattern: {
            type: 'rhythm',
            steps: 32,
            perBeat: 8,
            caption:
                'One bar at 140 BPM on a 32nd-note grid. The snare on beat 3 gives the half-time feel. The hats run in 8ths and break into quieter 32nd rolls, and the 808 shares two hits with the kick and adds one of its own.',
            alt: 'Four lanes on a 32-step grid. Hi-hats on every eighth note with fast quiet rolls before beat 3 and at the end of the bar. One snare on beat 3. Kick on the downbeat and late in beat 3. The 808 on the downbeat, late in beat 2 and with the second kick.',
            rows: [
                {
                    label: 'Hi-hat',
                    note: 'with rolls',
                    hits: [
                        0,
                        4,
                        8,
                        12,
                        { step: 13, level: 0.5 },
                        { step: 14, level: 0.5 },
                        { step: 15, level: 0.5 },
                        16,
                        20,
                        24,
                        { step: 26, level: 0.5 },
                        28,
                        { step: 29, level: 0.5 },
                        { step: 30, level: 0.5 },
                        { step: 31, level: 0.5 },
                    ],
                },
                { label: 'Snare', hits: [16], note: 'beat 3' },
                { label: 'Kick', hits: [0, 22] },
                { label: '808', focus: true, hits: [0, 14, 22], note: 'long notes' },
            ],
        },
    },
    quiz: [
        {
            q: 'Your 808 sample is really an F♯, but the sampler\'s root note is set to C. You press C. What do you hear?',
            options: [
                'A C, retuned by the sampler',
                'A C, pitched down by one octave',
                'The note the kick is tuned to',
                'An F♯, the sample\'s own pitch',
            ],
            answer: 3,
            why: 'The sampler plays the sample unchanged on its root note. Every other key is shifted from there, so the whole line comes out six semitones off.',
        },
        {
            q: 'An 808 on F1 has its fundamental at 43.7 Hz. Where is its 3rd harmonic?',
            options: ['87.3 Hz', '65.4 Hz', '131 Hz', '174.6 Hz'],
            answer: 2,
            why: 'Harmonics sit at whole-number multiples of the fundamental: 3 × 43.65 = 131 Hz. 87.3 Hz is the 2nd harmonic and 174.6 Hz the 4th.',
        },
        {
            q: 'You split an 808 into a clean layer and a distorted layer. Why put the high-pass after the distortion, not before?',
            options: [
                'Distortion needs the note to make harmonics',
                'The filter cuts more cleanly on a hot signal',
                'It keeps the distorted layer wider in stereo',
                'Filtering first would make the 808 much louder',
            ],
            answer: 0,
            why: 'The harmonics are multiples of the note, so the distortion has to see the note. Filter first and there is almost nothing left to distort.',
        },
    ],
    content: `## Hook: the 808 that disappears on a phone

The beat sounds huge in the car. The 808 slides between notes, the floor shakes and the kick punches through. You send it to a friend, who plays it on a phone, and the bass line is gone: drums and hats over a hole. Back in the studio you notice something else. On the bars where the kick and the 808 hit together, the punch is thinner than on the bars where the kick plays alone.

Both problems come from what an 808 is: a low, almost pure tone that plays notes and hits like a drum.

## Why it matters: the 808 is a bass instrument

The name comes from the Roland TR-808 drum machine, released in 1980. Its bass drum is an oscillator circuit that rings when triggered and dies away on its own; turn up the decay and it rings for a long time, going slightly flat as it does (Reid, 2002). Hip-hop producers tuned that long boom and played it as a bass line, and trap made it the main low-end sound. Today an 808 usually means a sample or synth patch built the same way: a tone close to a sine wave, a short click at the start and a long decaying tail.

So it has to be in the key of the beat, it has to be heard on small speakers that cannot play its fundamental, and it shares the lowest octave with the kick. Each of those is a separate job.

## Science model: pitch, harmonics and polarity

Pitch first. A sampler plays a sample unchanged on its root note and shifts every other key from there. If a sample is really an F♯ and the sampler thinks it is a C, every note comes out six semitones off. The common rule that every 808 must be tuned to C is a convenience: it lets you leave the root note on C. What matters is that the root note matches the sample's real pitch. Find it with a tuner on the tail, after the click, because the attack often starts higher and drops.

The note decides where the energy sits. An 808 on F1 has its fundamental at 43.7 Hz, on A1 at 55 Hz and on C2 at 65.4 Hz. A phone speaker cannot move enough air to play 43.7 Hz, so a clean 808 nearly vanishes there. Distortion adds harmonics at whole-number multiples of the note:

$$f_n = n \\times f_0$$

On F1 they land at 87.3, 131, 174.6 and 218.3 Hz and up. A phone plays the upper ones, and the ear infers the low note from their even spacing, the missing fundamental (Moore, 2012).

::figure harmonics

Soft saturation rounds the peaks and adds mostly lower harmonics. Hard clipping flattens them and adds stronger high harmonics, which sounds brighter and more aggressive. A clipper that treats both halves of the wave the same adds only odd harmonics; asymmetric, tube-style saturation adds even ones as well. Compare at matched level, because the louder version tends to win at first.

::figure clip

::demo saturation

Polarity last. The kick and the 808 share the same low range, so when they hit together, how their waves line up decides whether they add or partly cancel. If one pushes the speaker out while the other pulls it in, the low end of the hit thins out. It rarely goes silent, because the two sounds have different pitches and decays, but the punch you expected is gone. The [lesson on phase and polarity](/blog/phase-vs-polarity-kick-bass-will-thank-you) shows the cancellation in detail.

## DAW experiment: build an 808 and test it on a phone

1. Load one sine oscillator in a synth, in mono mode with glide on. Set the amp envelope to an attack near 0 ms, sustain at or near zero and a decay long enough to reach the next note.
2. Add a pitch envelope that starts about an octave above the note and falls to it in the first few tens of milliseconds. That drop gives the attack its punch.
3. Play a line in the key of your beat on F1 and A1, and check the pitch of the tail with a tuner.
4. Duplicate the 808. Distort the copy, then high-pass it around 100 Hz after the distortion, so it adds only harmonics above the clean sub. Keep everything below about 100 Hz in mono.
5. Bounce a few bars and play them on a phone. Mute the distorted copy and play them again. Listen for the bass line coming and going.
6. Put a kick on the same beat as an 808 note. Zoom in on the first cycle of each and flip the 808's polarity. Keep whichever version sounds fuller.
7. Add a sidechain compressor on the 808, keyed from the kick: a few dB of reduction, fast attack, and a release short enough that the 808 is back up as the kick dies away.

## Common mistake: filtering before the distortion

A frequent mistake is putting the high-pass in front of the distortion to keep the low end clean. The harmonics are multiples of the note, so the distortion has to see the note. Filter first and there is almost nothing left to distort.

Another is a fixed EQ slot, such as boosting the kick at 60 Hz and cutting the 808 there. It stops working the moment the 808 plays a different note. Give each sound a job instead: a kick that is mostly click with a short low end leaves the sustained bass to the 808, and on some beats the 808 is the kick.

Hard clipping also creates harmonics above the Nyquist limit that fold back as [aliasing](/blog/why-aliasing-is-a-ghost-frequency-problem). Turn on the clipper's oversampling if it has one.

## Producer takeaway: tune it, distort it, line it up

Treat the 808 as a bass instrument that hits like a drum. Match the root note to the sample's real pitch, distort a copy so small speakers can hear the line, and check its polarity against the kick. Then program it with the drums: at 140 BPM a beat lasts 428.6 ms, so a tail that rings for a second covers more than two beats. Sparse patterns can use it; busy ones need a shorter decay. Let the 808 share some hits with the kick and answer in the gaps.

::figure pattern

## References

- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Reid, G. (2002, February). Practical bass drum synthesis. *Sound On Sound*, Synth Secrets series.
`,
    seo: {
        title: 'Anatomy of a trap 808: pitch, tail and distortion | VGP Studio',
        description: 'How a trap 808 works: tuning the sample to the key, decay and glide, distortion and the missing fundamental, and keeping the kick and 808 from cancelling.',
        keywords: ['trap 808', '808 tuning', '808 distortion', 'kick and 808', 'missing fundamental', 'trap production'],
    },
};
