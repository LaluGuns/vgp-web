import { BlogArticle } from '../blog-data';

export const post137: BlogArticle = {
    slug: 'reverb-on-bass-is-not-forbidden',
    title: 'How to put reverb on bass without mud',
    excerpt: '"No reverb on bass" protects you from three real problems. Learn what they are, and how a filtered, short, narrow return lets the bass share the room with the band.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'High-pass the bass reverb return around 250 Hz so the room hears the harmonics and string noise while the fundamental stays dry.',
        'Keep the return short and narrow: a long low tail blurs the next note, and a wide one puts low end in the sides where mono playback loses it.',
        'Automate a longer tail only where the bass leaves space, such as the last note before a break.',
    ],
    figures: {
        comb: {
            type: 'spectrum',
            mode: 'gain',
            range: [20, 1000],
            caption:
                'One reflection 5 ms after the dry bass, at half its level, drawn from the real maths. Notches fall at 100 Hz and 300 Hz, 6 dB deep, with 3.5 dB peaks at 200 Hz and 400 Hz. A bass note near 100 Hz loses level; one near 200 Hz gains it.',
            alt: 'Gain over frequency from 20 Hz to 1 kHz. The curve starts near +3 dB, dips to -6 dB at 100 Hz, rises to +3.5 dB at 200 Hz, dips again at 300 Hz and peaks at 400 Hz.',
            marks: [
                { f: 100, label: '100 Hz' },
                { f: 300, label: '300 Hz' },
            ],
            curves: [{ kind: 'comb', delayMs: 5, mix: 0.5, label: 'Dry plus one reflection' }],
        },
        highpass: {
            type: 'spectrum',
            mode: 'gain',
            range: [20, 2000],
            dbRange: [-30, 6],
            caption:
                'A 12 dB per octave high-pass at 250 Hz on the reverb return, drawn from the real filter maths, with the harmonics of an A1 bass note marked. The reverb gets the 55 Hz fundamental 26 dB down and the second harmonic 14 dB down, while the eighth harmonic at 440 Hz is almost untouched.',
            alt: 'Gain over frequency from 20 Hz to 2 kHz. A curve rises from far below -30 dB at 20 Hz to about 0 dB above 400 Hz. Marks at 55, 110, 220 and 440 Hz show the curve at about -26, -14, -4 and 0 dB.',
            marks: [
                { f: 55, label: 'A1' },
                { f: 110, label: '2nd' },
                { f: 220, label: '4th' },
                { f: 440, label: '8th' },
            ],
            curves: [{ kind: 'eq', label: 'Return high-pass', bands: [{ type: 'highpass', freq: 250 }] }],
        },
    },
    quiz: [
        {
            q: 'A reverb on a bass line has a 2.5 s decay. The notes are eighth notes at 120 BPM. How far has each note\'s tail fallen when the next note starts?',
            options: ['About 6 dB', 'About 15 dB', 'About 25 dB', 'About 60 dB'],
            answer: 0,
            why: 'An eighth note at 120 BPM lasts 0.25 s. The tail falls 60 dB in 2.5 s, so after 0.25 s it is only 60 × 0.25 / 2.5 = 6 dB down, under a note of a different pitch.',
        },
        {
            q: 'Why do two low bass notes a tone apart blur together when one rings into the other?',
            options: [
                'Low notes always cancel each other out',
                'They fall inside one critical band and beat',
                'The reverb shifts both notes slightly flat',
                'The ear cannot hear pitch below 100 Hz',
            ],
            answer: 1,
            why: 'Below about 500 Hz a critical band is roughly 100 Hz wide, so 55 Hz and 61.7 Hz are hard to hear as separate notes. They beat at the difference, about 7 times a second.',
        },
        {
            q: 'You high-pass the bass reverb return at 250 Hz, 12 dB per octave. What does the reverb still receive?',
            options: [
                'Only the fundamental of each note',
                'Nothing below 1 kHz at all',
                'The upper harmonics and string noise',
                'The same signal as before, quieter',
            ],
            answer: 2,
            why: 'The filter takes the fundamental and lowest harmonics down by 14 to 26 dB for an A1, but passes the range from about 400 Hz up almost unchanged.',
        },
    ],
    content: `## Hook: the bass that lives outside the room

The drums are in a room, the keys have a plate, the vocal has a hall, and the bass is a dry DI that seems to sit in front of the speakers. In a dense track that can go unnoticed. In a sparse ballad or a slow jazz tune, the bass sounds like it was recorded somewhere else. Then you remember the rule, no reverb on bass, and leave it.

The rule protects you from real problems. Put a full-range hall on the bass and the low end turns to porridge. But the problems sit in specific places, and once you know where, you can give the bass a room and keep the low end clean.

## Why it matters: three ways a bass reverb goes wrong

The first is overlap. A long tail is still ringing when the next note starts, and two low notes at once do not separate the way two high notes do. The second is colouration. The early reflections are short delayed copies of the bass, and a delayed copy added to the dry signal cancels some frequencies and boosts others. The third is width. A stereo reverb spreads its output across both channels, and low end in the sides is the part that suffers when the mix is folded to mono, as the [lesson on stereo low end](/blog/stereo-low-end-is-a-translation-decision) explains.

Each of these has its own fix, and none of them requires the bass to stay dry.

## Science model: critical bands, combs and harmonics

The overlap problem comes from how the ear splits sound into bands. Below about 500 Hz, a critical band is roughly 100 Hz wide (Fastl and Zwicker, 2007). Two tones inside one band are hard to hear as two clear pitches. A few hertz apart they beat at the difference between their frequencies, and further apart the beating speeds up into roughness. A1 is 55 Hz and B1 is 61.7 Hz, so a tail of A1 under a new B1 beats about 7 times a second.

How loud the old tail still is depends on the decay time $T$ and the note length $d$. A tail falls 60 dB in $T$ seconds, so by the next note it is down:

$$\\Delta L = \\frac{60\\,d}{T} \\;\\text{dB}$$

For eighth notes at 120 BPM, $d$ is 0.25 s. A 2.5 s hall is only 6 dB down when the next note arrives. A 0.5 s room is 30 dB down.

The colouration problem is a comb filter. Add a copy delayed by $\\tau$ at relative level $a$, and the response is $|1 + a\\,e^{-j 2\\pi f \\tau}|$ (Zölzer, 2011). Notches fall where the copy arrives half a cycle late, at $f = 1/(2\\tau)$ and its odd multiples. For a 5 ms reflection that is 100 Hz, 300 Hz and 500 Hz. At half level the notches are $20 \\log_{10}(1 - 0.5) \\approx -6$ dB deep and the peaks $20 \\log_{10}(1.5) \\approx +3.5$ dB high.

::figure comb

A real reverb has many reflections at many delays, so instead of one tidy comb you get a ragged response, and with a moving bass line each note lands somewhere different on it. That is part of why reverbed bass sounds uneven from note to note. The demo uses an equal-level copy, which makes the effect much stronger than one reflection would. Try a few milliseconds of delay and listen to the low end thin out.

::demo phase

The fix for both problems is the same: keep the fundamental out of the reverb. For a bass with a saw-like spectrum, where harmonic $n$ has amplitude $1/n$, the first two harmonics hold about 76% of the power. A high-pass on the return removes most of what overlaps and combs, and the reverb still hears the upper harmonics, the string noise and the attack. Those are what tell the ear the bass is in the same room as the drums.

::figure highpass

## DAW experiment: give the bass a room it can live in

1. Pick a sparse section where the bass plays a moving line. Send the bass to a return with a full-range hall, 2.5 s decay, and raise the send until you clearly hear it.
2. Listen to the note changes, then switch the mix to mono. Note where the low end blurs, swells or drops.
3. Swap the hall for a small room with a decay of about 0.4 to 0.6 s.
4. Put a high-pass on the return at 250 Hz, 12 dB per octave, and a low-pass at about 5 kHz.
5. Narrow the return to mono, or close to it, so its low mids stay in the centre.
6. Raise the send until the bass sounds like it is in the same space as the drums, then switch the return off and on at the same bass level.
7. Automate a longer, wider tail only on the last note before a break or a drop, where nothing follows it.

The full-range hall blurs the line and changes in mono. The filtered, short, narrow room makes the bass sound like part of the band, and the low end barely moves when you switch the return off and on.

## Common mistake: filtering the bass instead of the reverb

When reverbed bass gets muddy, the reflex is to high-pass or cut the bass track itself. That thins the dry bass and leaves the reverb's low end untouched. Filter the send or the return, so the dry signal keeps its weight and only the reverb loses its lows.

The second mistake is judging bass reverb on speakers in an untreated room. The room's own modes already blur and colour the low end, so you cannot tell which smear is yours. Check on good headphones too, as the [lesson on low end in a small room](/blog/why-your-low-end-lies-in-a-small-room) suggests.

## Producer takeaway: reverb the harmonics, keep the fundamental dry

I treat "no reverb on bass" as "no reverb on the fundamental". High-pass the return, keep it short and narrow, and the bass joins the room without paying for it in the low end. Save the long tail for the spots where the bass has the floor to itself.

## References

- Fastl, H., & Zwicker, E. (2007). *Psychoacoustics: Facts and Models* (3rd ed.). Springer.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'How to put reverb on bass without mud | VGP Studio',
        description: 'Reverb on bass fails through overlap, comb filtering and width. A filtered, short, narrow return lets the bass share the room and keeps the low end clean.',
        keywords: ['reverb on bass', 'bass reverb high-pass', 'comb filtering bass', 'critical bands', 'low end mixing', 'bass in mono'],
    },
};
