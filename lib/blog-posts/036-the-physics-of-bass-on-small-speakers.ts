import { BlogArticle } from '../blog-data';

export const post036: BlogArticle = {
    slug: 'the-physics-of-bass-on-small-speakers',
    title: 'Small speakers need bass harmonics',
    excerpt: 'A phone cannot play a 50 Hz sub, but it can play the harmonics above it, and the ear rebuilds the pitch from them. Design bass that survives small speakers.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'A small speaker cannot move enough air for deep bass: each octave down needs four times the cone movement for the same level.',
        'The ear hears the pitch of a bass note from its harmonics, even when the fundamental is missing.',
        'Keep the sub clean, add harmonics in parallel, and check through a high-pass filter and on a real phone.',
    ],
    figures: {
        periodic: {
            type: 'signal',
            caption:
                'Thirty milliseconds of a 100 Hz tone above, and of four of its harmonics below, with no energy at 100 Hz. Both waves repeat every 10 ms, and that repetition rate is the pitch you hear.',
            alt: 'Two waveforms over 30 milliseconds. The top one is a smooth sine with three cycles. The bottom one is a jagged wave made of four sines that repeats the same shape three times, at the same 10 ms spacing.',
            rows: [
                {
                    label: '100 Hz sine',
                    traces: [{ kind: 'sine', cycles: 3, amp: 0.8 }],
                    marks: [
                        { t: 1 / 3, label: '10 ms' },
                        { t: 2 / 3, label: '20 ms' },
                    ],
                },
                {
                    label: '200 + 300 + 400 + 500 Hz, no 100 Hz',
                    traces: [
                        {
                            kind: 'sum',
                            parts: [
                                { cycles: 6, amp: 0.22 },
                                { cycles: 9, amp: 0.22 },
                                { cycles: 12, amp: 0.22 },
                                { cycles: 15, amp: 0.22 },
                            ],
                        },
                    ],
                    marks: [
                        { t: 1 / 3, label: '10 ms' },
                        { t: 2 / 3, label: '20 ms' },
                    ],
                },
            ],
        },
        lines: {
            type: 'spectrum',
            mode: 'level',
            range: [20, 2000],
            caption:
                'A 50 Hz sub after saturation, sketched. The first line is the sub itself, below anything a phone can play. The lines inside the shaded band are what the phone does play, and their spacing still says 50 Hz. The shaded band stands in for a small speaker\'s working range, which varies by device.',
            alt: 'Harmonic lines at multiples of 50 Hz, getting shorter with frequency. A shaded band covers the range from a few hundred hertz upward, leaving the first lines outside it.',
            bands: [{ from: 300, to: 2000, label: 'Small speaker range' }],
            curves: [{ kind: 'harmonics', f0: 50, count: 40, rolloff: 1, label: 'Saturated 50 Hz sub' }],
        },
    },
    quiz: [
        {
            q: 'A speaker plays 200, 300, 400 and 500 Hz, and nothing at 100 Hz. What pitch do you hear?',
            options: ['100 Hz', '200 Hz', '500 Hz', 'No clear pitch'],
            answer: 0,
            why: 'The four tones are the 2nd to 5th harmonics of 100 Hz. Together they repeat every 10 ms, and the ear hears that repetition as a 100 Hz pitch.',
        },
        {
            q: 'Why can a phone not play a 50 Hz sub at a useful level?',
            options: [
                'The streaming codec cuts the band below 100 Hz',
                'A 50 Hz tone sits below the range of hearing',
                'Mono playback on the phone cancels the sub',
                'Its small cone would have to move too far',
            ],
            answer: 3,
            why: 'At low frequencies, pressure depends on cone area times movement times frequency squared. Each octave down needs four times the movement, and a phone speaker runs out long before 50 Hz.',
        },
        {
            q: 'In the parallel setup, why high-pass the saturated copy?',
            options: [
                'To make the copy louder than the clean sub',
                'To blend its harmonics without its low end',
                'To remove the harmonics before the master',
                'To stop the copy from clipping the master bus',
            ],
            answer: 1,
            why: 'The copy is there for its harmonics. Filtering out its low end leaves the clean sub alone to carry the weight on systems that can play it.',
        },
    ],
    content: `## Hook: the disappearing bass line

In the studio the 808 shakes the desk and the kick hits you in the chest. You export, play the mix on your phone, and the bass line is gone. What is left is hi-hats, a dry vocal and a thin, hollow track.

Nothing broke in the export. A phone speaker produces very little deep bass, so a bass sound made almost entirely of its fundamental frequency leaves it nothing to play. To make the bass translate, you have to give the speaker something it can play and give the ear enough to rebuild the rest.

## Why it matters: the speaker cannot move enough air

At low frequencies, the sound pressure a small speaker makes depends on how much air its cone pushes and how fast that air accelerates:

$$p \\propto S_d \\, x \\, f^2$$

$S_d$ is the cone area, $x$ how far the cone moves and $f$ the frequency. Each octave down needs four times the movement for the same level, so 55 Hz needs sixteen times the movement of 220 Hz. A phone speaker has a tiny cone that can only move a short distance, so in the deep bass it produces almost nothing. That conflict between bass output and speaker size is the starting point of Larsen and Aarts (2002).

Turning the sub up does not change that. The phone still cannot play it, and the extra level eats headroom on every system that can. On a club rig the boosted sub swamps the mix. The fix is to put the identity of the bass where the phone works: in its harmonics.

## Science model: the missing fundamental

A pitched bass note is a fundamental $f_0$ plus harmonics at whole-number multiples of it:

$$f_n = n \\, f_0$$

The ear does not need the fundamental to hear the pitch. Play 200, 300, 400 and 500 Hz together, with nothing at 100 Hz, and you hear a pitch of 100 Hz (Moore, 2012). The combined wave repeats every 10 ms, exactly as a 100 Hz tone does, and the auditory system takes the pitch from that repetition. The low-numbered harmonics carry it most strongly.

::figure periodic

Virtual bass processing for small speakers is built on this effect: it generates harmonics of the bass and plays them where the speaker works, so listeners hear bass pitch the speaker never produced (Larsen and Aarts, 2002, 2004). Saturation gets you there too. Drive a 50 Hz sub and it gains lines at multiples of 50 Hz, such as 100, 150 and 200 Hz, depending on the curve. The phone plays those, and the ear supplies the 50.

What you get is pitch and rhythm, not weight. A phone still cannot shake the room, and the harmonic version is a different sound from a deep sub. On small speakers, a bass you can follow beats a bass you cannot hear.

::figure lines

::demo saturation

## DAW experiment: the small-speaker bass test

Build a bass that keeps its melody when the low end is taken away.

1. Program a bass line with notes between E1 (41 Hz) and E2 (82 Hz) on a pure sine sub.
2. As a rough small-speaker check, put a high-pass filter at 200 Hz, 24 dB per octave, as the last plugin on the master. Play the song and listen to the bass line all but disappear.
3. Duplicate the bass track. On the copy, insert a saturator and drive it hard, then add a high-pass filter at 120 Hz, 24 dB per octave, so only the harmonics remain.
4. Leave the original sub clean and in mono. Blend the harmonic copy in until you can follow the bass melody through the 200 Hz check filter.
5. Put a spectrum analyzer on the copy and check that its lines sit at whole multiples of each note.
6. Remove the check filter and compare the full-range mix with and without the copy, at matched short-term LUFS.
7. Play the bounce on a real phone and on a laptop.

Through the check filter and on the phone, the bass melody comes back although almost none of the fundamental gets through. On full-range speakers the bass sounds more defined without much more sub.

## Common mistake: boosting the sub

Boosting 40 Hz to make a quiet bass audible on small speakers does not work. The phone still cannot play that frequency, so nothing changes there, while every system that can play it gets a louder sub and a master limiter that works harder.

The second mistake is saturating the whole bass, sub included, on one track. The deep end gets distorted along with everything else and turns woolly. Parallel saturation with a high-pass on the copy keeps the sub clean and puts the harmonics where they help.

## Producer takeaway: design the bass for both speakers

Write the bass for a phone and a club at the same time. Keep the sub clean and in mono for the systems that can play it. Add harmonics, through saturation, a wavefolder or a second oscillator an octave or two up, so the pitch survives where the sub cannot. Check through a high-pass on the master, then on a real phone, before you call the low end finished.

## References

- Larsen, E., & Aarts, R. M. (2002). Reproducing low-pitched signals through small loudspeakers. *Journal of the Audio Engineering Society*, 50(3), 147-164.
- Larsen, E., & Aarts, R. M. (2004). *Audio Bandwidth Extension: Application of Psychoacoustics, Signal Processing and Loudspeaker Design*. Wiley.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
`,
    seo: {
        title: 'Small speakers need bass harmonics | VGP Studio',
        description: 'Why phones cannot play deep bass, how the missing fundamental lets the ear rebuild bass pitch from harmonics, and a parallel saturation setup that translates.',
        keywords: ['bass translation', 'missing fundamental', 'small speakers', 'sub bass', 'parallel saturation', 'psychoacoustics'],
    },
};
