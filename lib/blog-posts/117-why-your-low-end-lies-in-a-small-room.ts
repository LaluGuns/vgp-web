import { BlogArticle } from '../blog-data';

const C = 343; // speed of sound in m/s at room temperature
const wave = (f: number) => ({ label: f >= 1000 ? '1 kHz' : `${f} Hz`, value: C / f, display: `${(C / f).toFixed(C / f < 1 ? 2 : 1)} m` });

export const post117: BlogArticle = {
    slug: 'why-your-low-end-lies-in-a-small-room',
    title: 'Why your low end lies in a small room',
    excerpt: 'Below about 200 Hz a small room boosts some notes and swallows others, depending on where you sit. EQ cannot fill a null, so work out your room modes first.',
    category: 'audio-science',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Bass wavelengths are as long as the room, so a small room turns into a set of resonances, the room modes, at f = n × 343 / (2L).',
        'Each mode is loud at the walls and has nulls at fixed places, so what you hear at the desk depends on where the desk is.',
        'EQ cannot fill a null. Know your modes, treat the corners, move the chair and check bass decisions away from the room.',
    ],
    figures: {
        wavelength: {
            type: 'bars',
            caption:
                'Wavelength is 343 m/s divided by frequency. Every note below about 86 Hz has a wavelength longer than a 4 m room, so the room acts as a resonator instead of a set of walls that sound bounces off.',
            alt: 'Bars of wavelength for five frequencies: 30 Hz 11.4 m, 50 Hz 6.9 m, 100 Hz 3.4 m, 200 Hz 1.7 m, 1 kHz 0.34 m. A dimmed bar shows a 4 m room length for comparison; the 30 and 50 Hz bars are longer.',
            min: 0,
            max: 12,
            unit: 'm',
            bars: [
                ...[30, 50].map(wave),
                { label: 'Length of a small room', value: 4, display: '4 m', dim: true },
                ...[100, 200, 1000].map(wave),
            ],
        },
        modes: {
            type: 'signal',
            caption:
                'Pressure along a 4 m room, front wall to back wall, for the first two length modes. The two lines show the extremes of each standing wave. Both are loudest at the walls. The first vanishes in the middle, the second at 1 m and 3 m, so a chair 1 m from the wall hears almost no 86 Hz.',
            alt: 'Two plots across the length of a room. The first shows a half-wave shape, largest at both ends and crossing zero in the middle. The second shows a full-wave shape, largest at both ends and the middle, crossing zero at a quarter and three quarters of the way.',
            rows: [
                {
                    label: 'First length mode, 43 Hz',
                    traces: [
                        { kind: 'sine', cycles: 0.5, phase: 90, amp: 0.85 },
                        { kind: 'sine', cycles: 0.5, phase: 270, amp: 0.85, muted: true },
                    ],
                    marks: [{ t: 0.5, label: 'Null at 2 m' }],
                },
                {
                    label: 'Second length mode, 86 Hz',
                    traces: [
                        { kind: 'sine', cycles: 1, phase: 90, amp: 0.85 },
                        { kind: 'sine', cycles: 1, phase: 270, amp: 0.85, muted: true },
                    ],
                    marks: [
                        { t: 0.25, label: 'Null at 1 m' },
                        { t: 0.75, label: 'Null at 3 m' },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A room is 5 m long. Where is its first length mode?',
            options: ['About 69 Hz', 'About 17 Hz', 'About 34 Hz', 'About 343 Hz'],
            answer: 2,
            why: 'f = 343 / (2 × 5) ≈ 34 Hz. The next length modes follow at about 69 Hz and 103 Hz.',
        },
        {
            q: 'You sit in a null at 65 Hz and boost 65 Hz by 6 dB. What happens?',
            options: [
                'The null stays, and 65 Hz grows elsewhere',
                'The null fills in and the bass becomes even',
                'The null moves a metre closer to the wall',
                'The room mode shifts up to a new frequency',
            ],
            answer: 0,
            why: 'A null is a cancellation between waves that both come from your speakers. Boosting raises both by the same amount, so they still cancel at your chair, and the boost goes everywhere else, including your mix.',
        },
        {
            q: 'Why do bass traps go in the corners?',
            options: [
                'Corners are where the speakers usually point',
                'Each mode peaks in pressure where walls meet',
                'Thin foam works best when it is in a corner',
                'Corners reflect less sound than flat walls',
            ],
            answer: 1,
            why: 'Pressure in every mode peaks at the boundaries, and most of all where boundaries meet. Thick absorption across a corner reaches the most low-frequency energy for its size.',
        },
    ],
    content: `## Hook: the car test

You spend two hours on the low end. The kick and the 808 sit together, and the sub feels warm and full. You bounce the track, walk to the car, press play, and the bass is overwhelming. Or the opposite happens: what felt like a wall of bass at the desk turns thin and hollow in the car.

Your speakers and interface are probably fine, and the room is the likely cause. Below a couple of hundred hertz, a small room boosts some bass notes and cancels others, and the pattern changes when you move.

## Why it matters: bass waves are bigger than the room

Every frequency has a wavelength:

$$\\lambda = \\frac{c}{f}$$

where $c$ is the speed of sound, about 343 m/s at room temperature. A 1 kHz tone has a wavelength of 34 cm. A 50 Hz bass note has a wavelength of 6.9 m, longer than most home studios. At these sizes the whole room behaves as a resonator with a handful of strong resonances, and what you hear at the desk depends on where the desk sits inside that pattern.

::figure wavelength

That is why low-end decisions made at the desk do not translate. Sit where the room cancels 65 Hz and the kick sounds thin, so you boost it. In the car there is no such cancellation, and the boost is simply too much 65 Hz.

## Science model: room modes

Between two parallel walls a distance $L$ apart, sound reflecting back and forth builds standing waves at the frequencies where a whole number of half wavelengths fits between the walls. These are the axial modes:

$$f_n = \\frac{n\\,c}{2L}, \\quad n = 1, 2, 3, \\dots$$

For a room 4 m long, the first is $343 / (2 \\times 4) \\approx 43$ Hz, then 86 Hz and 129 Hz. Each pair of surfaces, front and back, side and side, floor and ceiling, has its own series. A room 4 m long, 3.5 m wide and 2.5 m high has these:

| Dimension | Length | First mode | Second mode |
| --- | --- | --- | --- |
| Length | 4.0 m | 43 Hz | 86 Hz |
| Width | 3.5 m | 49 Hz | 98 Hz |
| Height | 2.5 m | 69 Hz | 137 Hz |

Modes that bounce between two or three pairs of surfaces also exist, but the axial ones are usually the strongest.

A standing wave has a fixed shape. For mode $n$, the pressure varies along the room as $\\cos(n \\pi x / L)$, where $x$ is the distance from one wall. Pressure is always highest at the walls and in the corners, which is why bass builds up there. The first mode has a null in the middle of the room. The second has nulls at a quarter and three quarters of the length. At a null that frequency almost disappears, and a metre away it can be loud.

::figure modes

Put a desk 1 m from the front wall of the 4 m room and you sit on the null of the 86 Hz mode while 43 Hz is still strong. 43 Hz sounds boomy, so you turn the sub down; 86 Hz sounds weak, so you push it up. In the car both decisions are wrong.

The speakers have their own version of this. Sound from a woofer also reflects off the wall behind it, and at the frequency where that detour is half a wavelength, the reflection cancels the direct sound: $f = c / (4d)$, where $d$ is the distance from the woofer to the wall. A speaker 0.5 m from the wall gets a dip near 170 Hz.

Higher up, the modes crowd together and blur into ordinary reverberation. A common estimate of where that happens is the Schroeder frequency, $f_S \\approx 2000 \\sqrt{T_{60} / V}$, with reverb time $T_{60}$ in seconds and room volume $V$ in cubic metres (Schroeder, 1996). For the 35 m³ room above with a reverb time of 0.4 s, that is about 210 Hz. Below it, think in modes.

## DAW experiment: map your room

1. Measure your room's length, width and height. For each one, divide 343 by twice the dimension in metres to get the first mode, then double it for the second.
2. Insert a sine generator on a track at 40 Hz and set your monitors to a moderate level.
3. Sit at your mix position and note how loud it feels. Then walk slowly from the front wall to the back wall and listen to the level rise and fall.
4. Set the generator to your first length mode, 43 Hz in a 4 m room. Walk the length again: loud at both walls, weakest in the middle.
5. Set it to the second length mode, 86 Hz in a 4 m room. Now it is weak a quarter and three quarters of the way along, and stronger in the middle.
6. Go back to your chair and sweep slowly from 30 to 150 Hz. Note every frequency that jumps out or nearly vanishes, and compare them with your list.
7. If you have a measurement microphone, measure the listening position with Room EQ Wizard, which is free.

The loud and quiet frequencies sit close to the modes you calculated, and they move when you move. That is the room, not the mix.

## Common mistake: trying to EQ out a null

A null is a cancellation. Boost that frequency, in the mix or with room correction, and you feed more energy into both of the waves that are cancelling. They still cancel at your chair, and the frequency gets louder everywhere else. Room correction can usefully pull down peaks, which are excess energy, but it cannot fill a null.

The other mistake is buying thin foam for bass. A 2.5 cm foam tile does very little below a few hundred hertz, and a 43 Hz wave is 8 m long. What helps is thick porous absorption across the corners, where the pressure of every mode is highest, and a listening position away from the exact middle of the room and away from the quarter points.

## Producer takeaway: make bass decisions with more than one ear

Keep a list of your room's modes by the desk, so you know which notes the room exaggerates and which it hides. Treat the corners if you can, move the chair off the middle and the quarter points, and place the speakers symmetrically between the side walls. Then check every low-end decision somewhere the room cannot reach: good headphones, a car, a reference track whose bass you know well. If the reference sounds thin at your desk too, the room has a dip there, and your mix does not need a boost.

## References

- Schroeder, M. R. (1996). The "Schroeder frequency" revisited. *The Journal of the Acoustical Society of America*, 99(5), 3240-3241.
- Toole, F. E. (2017). *Sound Reproduction: The Acoustics and Psychoacoustics of Loudspeakers and Rooms* (3rd ed.). Routledge.
- MIT OpenCourseWare. *8.03SC Physics III: Vibrations and Waves*, Fall 2016. https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/
`,
    seo: {
        title: 'Why your low end lies in a small room | VGP Studio',
        description: 'How room modes and wavelengths make bass unreliable in small rooms, how to calculate your modes, and how to mix low end that translates to other systems.',
        keywords: ['room modes', 'standing waves', 'small room acoustics', 'bass mixing', 'bass traps', 'speaker boundary interference'],
    },
};
