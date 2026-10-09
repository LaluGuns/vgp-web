import { BlogArticle } from '../blog-data';

export const post133: BlogArticle = {
    slug: 'stereo-low-end-is-a-translation-decision',
    title: 'Stereo low end is a translation decision',
    excerpt: 'Some stereo bass survives a mono sum and some cancels. Learn which kinds of left-right difference are safe in the low end and where your bass gets summed.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Ask what kind of difference sits between the channels in your low end: a level difference sums safely, a detune or an anti-phase part does not.',
        'Split the bass into a centred sub and wider harmonics instead of collapsing the whole sound to mono.',
        'Check the low end through every path that sums it, including a mono fold, a single speaker and a sub fed from both channels.',
    ],
    figures: {
        split: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'The harmonics of a bass note on A1 (55 Hz). The fundamental and the second harmonic sit in the sub band, while the harmonics that give the note its character run on up through the low mids. A split around 120 Hz is a common starting point, not a rule.',
            alt: 'A row of harmonic lines starting at 55 Hz and falling in level up to about 900 Hz. A dashed line at 120 Hz divides a shaded band labelled sub, from 20 to 120 Hz, from a band labelled harmonics, from 120 Hz to 1.5 kHz.',
            bands: [
                { from: 20, to: 120, label: 'Sub' },
                { from: 120, to: 1500, label: 'Harmonics' },
            ],
            marks: [{ f: 120, label: '120 Hz' }],
            curves: [{ kind: 'harmonics', f0: 55, count: 16, rolloff: 1, level: 0.9, label: 'Bass, A1' }],
        },
        beat: {
            type: 'signal',
            caption:
                'Left and right play the same note a small detune apart, drawn with the detune exaggerated. Summed to mono, they reinforce while their cycles line up and cancel to silence when they are half a cycle apart. That happens once every 1 / Δf seconds: every 2 seconds for a 0.5 Hz detune.',
            alt: 'Three wave plots. The left channel and the slightly faster right channel start together. Their mono sum starts at full height, shrinks to nothing in the middle of the plot and grows back by the end.',
            rows: [
                { label: 'Left', traces: [{ kind: 'sine', cycles: 10, amp: 0.8 }] },
                { label: 'Right, detuned up', traces: [{ kind: 'sine', cycles: 11, amp: 0.8 }] },
                {
                    label: 'Mono sum',
                    traces: [
                        {
                            kind: 'sum',
                            parts: [
                                { cycles: 10, amp: 0.45 },
                                { cycles: 11, amp: 0.45 },
                            ],
                        },
                    ],
                    marks: [{ t: 0.5, label: 'Cancels' }],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A unison bass plays 55 Hz in the left channel and 55.5 Hz in the right. In a mono fold, how often does the note cancel?',
            options: ['Every 0.5 seconds', 'Every 2 seconds', 'Every 18 milliseconds', 'Never, the notes differ'],
            answer: 1,
            why: 'The two channels drift through a full cycle against each other at the difference frequency, 0.5 Hz. They are half a cycle apart, and cancel, once every 1 / 0.5 = 2 seconds.',
        },
        {
            q: 'Which kind of left-right difference in a bass sums to mono with no cancellation at all?',
            options: [
                'A slow chorus with a different rate in each channel',
                'A side boost from a stereo widener on the bass bus',
                'A detuned second oscillator in the right channel',
                'A level difference, with the same waveform in both',
            ],
            answer: 3,
            why: 'If both channels carry the same waveform at different levels, adding them only adds. Chorus, detune and side boosts all put timing or polarity differences between the channels, and those can cancel.',
        },
        {
            q: 'A club rig feeds its subs from L + R. Your sub has a strong side component from a widener. What reaches the subs?',
            options: [
                'Only the mid part: the side component cancels in the sum',
                'Both parts, so the subs play the sub louder than before',
                'Only the side part, as the subs follow the stereo width',
                'Both parts, but delayed so they form a comb filter',
            ],
            answer: 0,
            why: 'L + R = 2M, so anything that lives only in the side signal cancels before it reaches a summed sub. The width you heard at the desk is not on the subs at all.',
        },
    ],
    content: `## Hook: the bass that breathes in mono

You layer a sub under a synth bass, open the unison and spread the voices for a wide, warm low end. On headphones it is huge. Then the track plays on a single Bluetooth speaker and the bass swells and fades on its own, loud on one bar, nearly gone on the next, although every note was programmed at the same velocity.

Nobody touched the bass. The speaker added left and right together, and the bass you built has two channels that do not agree.

## Why it matters: low end gets summed in many places

The usual advice is to keep everything under about 120 Hz in mono, and the [lesson on mono](/blog/why-mono-reveals-what-stereo-hides) explains why some width tricks fail there. That advice is about translation, so it helps to know exactly what it protects against.

Plenty of playback adds the channels in the low end, even when it plays the rest in stereo. Single-speaker phones and smart speakers sum everything. A 2.1 system or a home cinema with bass management sends the lows of both channels to one sub. Many club rigs feed their subs a mono sum. Vinyl does it mechanically: in the 45/45 stereo groove that Blumlein's patent described, the sum of the channels moves the stylus sideways and the difference moves it up and down, so large out-of-phase bass makes for a deep, hard-to-track groove. Each of these hears $L + R$, or $2M$ in mid/side terms, and anything that exists only in the side signal is not there.

## Science model: four kinds of stereo bass

Whether stereo bass survives depends on what differs between the channels.

A level difference is safe. If the right channel carries the same waveform as the left at a lower level, the sum only adds. A bass panned off-centre never cancels.

A small time difference is nearly safe in the sub. The phase shift is $360^\\circ \\times f \\times \\Delta t$, so 1 ms between the channels is only 20 degrees at 55 Hz, and the sum loses about 0.1 dB. The same 1 ms is 180 degrees at 500 Hz, which is why [time offsets](/blog/phase-vs-polarity-kick-bass-will-thank-you) hurt the harmonics and the click long before the sub.

A detune is not safe. Unison voices, a chorus, or a different oscillator in each channel drift in and out of step. Two equal voices cancel completely in mono once every $1/\\Delta f$ seconds, where $\\Delta f$ is the frequency difference. With more voices the dips are less regular, but they are still there. That is the breathing in the hook.

::figure beat

Anti-phase content is the worst case. A side boost, a polarity flip on one channel or a phase-rotating widener puts some or all of the bass in opposite polarity on each side, and that part cancels in any sum, as the [mid/side lesson](/blog/mid-side-widening-moves-the-center-too) works out.

Mono bass is often justified by saying the ear cannot locate low frequencies. That is only partly true. For sounds that contain low frequencies, the timing difference between the two ears is the cue listeners follow for direction; with the low frequencies removed, level and pinna cues take over (Wightman and Kistler, 1992). The ear can use those timing cues below roughly 1.5 kHz (Moore, 2012), which is where the harmonics of a bass sit. In the deepest octave, a small room adds its own pattern on top: the [room modes](/blog/why-your-low-end-lies-in-a-small-room) mix the output of both speakers, so a stereo difference down there tends to show up as a level change at your chair.

::figure split

That gives a practical split. The sub carries the weight and most of the risk. The harmonics carry the character, the ear can place them, and they cost far less in mono. With a detune measured in cents, the nth harmonic beats n times as fast as the fundamental, so the harmonics drift in and out of step at different moments instead of all vanishing together.

The demo plays two copies of one bass note. Adding them is exactly what a mono fold does to a bass whose channels differ by a delay or a flip, so listen for how fast the low end thins out.

::demo phase

## DAW experiment: split the bass and test each half

Use a stereo bass patch with unison or chorus, playing a part with long notes.

1. Put a mono switch and a spectrum analyzer on the master. Loop eight bars and toggle mono. Note any notes that swell or fade.
2. On the bass, insert a utility with a bass-mono setting, or a crossover that splits it into two bands that add back to the original. Set the split to 120 Hz.
3. Make the band below the split mono and leave the band above it stereo.
4. Toggle mono again. The sub should now hold steady, and the band above should change far less than the full bass did.
5. Move the split to 80 Hz, then to 200 Hz. Pick the lowest split where the long notes stay steady in mono.
6. Check the result on headphones, on a single speaker and, if you can, on a system with a sub.

On headphones the split version often sounds nearly as wide as the original, because most of the width you heard was in the harmonics.

## Common mistake: collapsing all of it, or none of it

One mistake is a mono-maker on the whole bass, or a blanket mono below 300 Hz on the master. The sub becomes safe, but you lose the stereo character in the harmonics, which the ear can place and which mostly survive a fold.

The opposite mistake is trusting headphones. On headphones there is no summing anywhere, so a detuned sub sounds steady and wide. It only breathes when something adds the channels, and that happens on the systems you do not mix on.

## Producer takeaway: decide what each band may do

Keep the sub's two channels close to identical, set the split by listening in mono rather than by a fixed number, and let the harmonics carry the width. When a sound design move puts detune or anti-phase content into the bottom octave, treat it as a deliberate choice and check it on a summed system before it ships.

## References

- Blumlein, A. D. (1933). *Improvements in and relating to sound-transmission, sound-recording and sound-reproducing systems*. British Patent 394,325.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Wightman, F. L., & Kistler, D. J. (1992). The dominant role of low-frequency interaural time differences in sound localization. *The Journal of the Acoustical Society of America*, 91(3), 1648-1661.
`,
    seo: {
        title: 'Stereo low end is a translation decision | VGP Studio',
        description: 'Which kinds of stereo bass survive a mono sum and which cancel, where playback adds the channels, and how to split sub and harmonics for width that translates.',
        keywords: ['stereo bass', 'mono bass', 'low end translation', 'unison detune', 'mid side bass', 'mono compatibility'],
    },
};
