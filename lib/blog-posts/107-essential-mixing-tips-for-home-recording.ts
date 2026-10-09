import { BlogArticle } from '../blog-data';

export const post107: BlogArticle = {
    slug: 'essential-mixing-tips-for-home-recording',
    title: 'Mixing rap vocals recorded at home',
    excerpt: 'A bedroom vocal sounds distant because the room is recorded with it. How mic distance sets the room sound, and the chain order that keeps compressors reacting to the voice.',
    category: 'production-tips',
    publishedAt: '2026-01-28',
    updatedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Each doubling of the distance to the mic costs about 6 dB of direct voice against the room, so record close, in the softest corner you have.',
        'Clean first, then control: high-pass, cut what sounds bad in context, de-ess, then let two compressors each do a little.',
        'Time delays to the tempo, 60,000 divided by the BPM for a quarter note in milliseconds, and filter the reverb so space never turns into mud.',
    ],
    figures: {
        distance: {
            type: 'bars',
            min: -20,
            max: 0,
            unit: 'dB',
            caption:
                'Direct sound from the voice at the mic, relative to 10 cm, from the inverse square law: 20 log10 of the distance ratio. Each doubling costs 6 dB. The room\'s reflections arrive at roughly the same level wherever you stand in a small room, so the voice loses 6 dB against the room with every doubling.',
            alt: 'Four bars for mic distance. 10 cm at 0 dB, 20 cm at minus 6 dB, 40 cm at minus 12 dB and 80 cm at minus 18.1 dB. The 10 cm bar is in the accent.',
            bars: [
                { label: '10 cm', value: 0, display: '0 dB' },
                { label: '20 cm', value: -6, display: '-6.0 dB', dim: true },
                { label: '40 cm', value: -12, display: '-12.0 dB', dim: true },
                { label: '80 cm', value: -18.1, display: '-18.1 dB', dim: true },
            ],
        },
        eq: {
            type: 'spectrum',
            mode: 'gain',
            db: 6,
            caption:
                'A typical vocal EQ, computed: a high-pass at 90 Hz, a 3 dB dip at 400 Hz for boxiness and a 2 dB high shelf at 10 kHz for air. The moves are small. Most of the voice passes untouched.',
            alt: 'EQ curve from 20 Hz to 20 kHz. It falls steeply below 90 Hz, dips gently around 400 Hz, runs flat through the midrange and rises slightly above 10 kHz.',
            curves: [
                {
                    kind: 'eq',
                    bands: [
                        { type: 'highpass', freq: 90, q: 0.71 },
                        { type: 'bell', freq: 400, gain: -3, q: 1.4 },
                        { type: 'highshelf', freq: 10000, gain: 2, q: 0.71 },
                    ],
                },
            ],
            marks: [
                { f: 90, label: 'Rumble' },
                { f: 400, label: 'Box' },
                { f: 10000, label: 'Air' },
            ],
        },
        delays: {
            type: 'bars',
            min: 0,
            max: 450,
            unit: 'ms',
            caption: 'Delay times at 140 BPM, from 60,000 / 140 = 428.6 ms per beat. The sixteenth is short enough for a slapback; the quarter is a clear echo to throw on the last word of a line.',
            alt: 'Four bars: quarter note 428.6 ms, dotted eighth 321.4 ms, eighth note 214.3 ms and sixteenth note 107.1 ms.',
            bars: [
                { label: 'Quarter', value: 428.6, display: '428.6 ms' },
                { label: 'Dotted eighth', value: 321.4, display: '321.4 ms', dim: true },
                { label: 'Eighth', value: 214.3, display: '214.3 ms', dim: true },
                { label: 'Sixteenth', value: 107.1, display: '107.1 ms' },
            ],
        },
    },
    quiz: [
        {
            q: 'Your beat runs at 90 BPM. What delay time gives a quarter-note echo?',
            options: ['About 333 ms', 'About 667 ms', 'About 900 ms', 'About 1,500 ms'],
            answer: 1,
            why: 'A quarter note lasts 60,000 / 90 = 666.7 ms. Half of that, 333 ms, would be an eighth note.',
        },
        {
            q: 'Why put the de-esser before the main compressor?',
            options: [
                'So the reverb send comes out brighter and wider',
                'So the compressor can clear out any sibilance left',
                'So the high-pass filter does not cut the S sounds',
                'So the compressor does not clamp down on every S',
            ],
            answer: 3,
            why: 'Loud S sounds trigger gain reduction and pull down the word around them. Taming them first lets the compressor respond to the voice instead.',
        },
        {
            q: 'You record a take at 15 cm, then step back to 60 cm in the same room. How much direct voice do you lose against the room sound?',
            options: ['About 6 dB', 'About 9 dB', 'About 12 dB', 'About 24 dB'],
            answer: 2,
            why: '60 cm is two doublings of 15 cm. The direct sound drops 6 dB per doubling while the room stays at about the same level, so the voice loses about 12 dB against the room.',
        },
    ],
    content: `## Hook: the vocal that sounds like a bedroom

You record a verse in your bedroom with the mic on a stand in the middle of the room. Against the beat it sounds boxy and a step behind the music. You add an EQ boost for presence, a compressor, a bright reverb. The vocal gets louder and harsher and still sounds like it was recorded in a bedroom.

That is because it was. The room is in the recording, mixed into every word, and every plugin after it works on the room as well as the voice.

## Why it matters: the room gets recorded with the voice

A mic picks up two things: the direct sound from your mouth and the sound that bounced off the walls, desk and ceiling before it arrived. In a small, bare room those reflections come back fast and strong, and they colour the voice in ways no plugin can separate out cleanly. EQ can turn a boxy band down, but it turns the voice down there too.

What you can control is the balance between the two when you record, and the order of the processing afterwards, so each stage reacts to the voice instead of to rumble or sharp S sounds.

## Science model: distance, then the chain

The direct sound from a source falls with distance by the inverse square law: its level drops by $20 \\log_{10}(d_2/d_1)$ dB, about 6 dB for every doubling (Everest and Pohlmann, 2015). In a small room the reflected sound reaches the mic at roughly the same level wherever you stand. So every doubling of distance costs about 6 dB of voice against the room.

::figure distance

That is why close miking, a hand's width away with a pop filter, is the first fix, and why soft furnishings around you help: a closet of clothes, a duvet hung behind you, curtains and a sofa. Being close has a side effect. Most vocal mics are directional, and a directional mic boosts the bass as the source gets closer, the proximity effect. Set the input so your loudest words peak around -10 dBFS at 24-bit: plenty of headroom, and still far above the interface's noise. A take that clipped on the way in stays clipped.

Then the chain. A compressor reacts to whatever level it sees, including rumble below the voice and loud S sounds. Put it first and it turns the voice down every time a truck passes or an S arrives. Clean up first, then control:

1. A high-pass filter around 80 to 100 Hz for rumble and the proximity boost.
2. Small cuts where the room or voice sounds bad in context, often boxiness around 300 to 500 Hz.
3. A de-esser, so S and T sounds, usually somewhere between 4 and 10 kHz, do not trigger the compressor.
4. Compression, then tone: presence, air, gentle saturation.
5. Reverb and delay on sends.

::figure eq

A common way to compress a rap vocal is two compressors each doing a little: a fast one catching only the loudest words by 2 to 4 dB, then a slower one levelling the performance by another 2 to 3 dB. Neither has to work hard enough to be heard. The [lesson on compression and motion](/blog/how-compression-changes-motion-not-level) explains how attack and release shape each word.

Time the delays to the beat. A quarter note lasts 60,000 / BPM milliseconds; halve it for an 8th, halve again for a 16th, and multiply the 8th by 1.5 for a dotted 8th.

::figure delays

A short reverb with a few tens of milliseconds of pre-delay keeps the start of each word dry. Try pre-delay, decay and level here, and listen for the point where the voice moves back.

::demo reverb

## DAW experiment: hear the room, then build the chain

1. Record the same two lines twice: once with your mouth about 10 cm from the mic, once at about 40 cm. Match their levels and compare. The far take carries 12 dB more room against the voice.
2. Move to the softest corner you have, hang a duvet behind you, and record the close take again. Compare it with the first close take.
3. On the best take, add a high-pass filter. Raise it until the voice thins, then back it off a little.
4. Boost a narrow band by 8 dB and sweep 200 Hz to 1 kHz with the beat playing. Where the box jumps out, turn it into a 2 to 4 dB cut.
5. Add a de-esser and set it so the loudest S sounds drop by a few dB.
6. Add the two compressors and watch each meter. Bypass both at matched loudness and check that the vocal sounds better at the same level.
7. Send to a filtered reverb and a delay timed to the tempo. Automate the delay send up on the last word of a line.

## Common mistake: fixing the room with plugins

The common mistake is recording far from the mic in a bare room and expecting EQ and reverb to fix it later. Boosting presence on a roomy take brings the reflections up with the voice. Adding reverb to a take that already has a room on it stacks two spaces, and the vocal moves further back.

The second is a single compressor working hard. On a rap vocal it tends to pump and flatten the delivery, and with no de-esser in front it pulls whole words down on every S.

The third is an unfiltered reverb return. High-pass it around 200 to 300 Hz and low-pass it around 6 to 8 kHz, so the space adds depth without mud or extra sibilance.

## Producer takeaway: fix the distance before the chain

Get the mic close and the room soft before you record, because that balance is fixed once it is on the take. Then clean before you control: filter, cut and de-ess first, so the compressors react to the voice. Time the echoes to the tempo and filter the space. If someone else will master the song, leave the mix peaking a few dB below 0 dBFS with no limiter on the mix bus.

## References

- Everest, F. A., & Pohlmann, K. C. (2015). *Master Handbook of Acoustics* (6th ed.). McGraw-Hill Education.
- Izhaki, R. (2023). *Mixing Audio: Concepts, Practices, and Tools* (4th ed.). Focal Press.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'Mixing rap vocals recorded at home | VGP Studio',
        description: 'Why bedroom vocals sound distant: mic distance and the room. Then the chain order that keeps compressors reacting to the voice, and delays timed to the beat.',
        keywords: ['home recording', 'mixing vocals', 'rap vocal chain', 'vocal EQ', 'serial compression', 'delay time calculator'],
    },
};
