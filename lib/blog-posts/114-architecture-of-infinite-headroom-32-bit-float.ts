import { BlogArticle } from '../blog-data';

// Full scale is drawn at 0.5. A wave of 0.9 peaks 20 × log10(0.9 / 0.5) ≈ 5 dB over it.
const FULL_SCALE = [{ y: 0.5, label: '0 dBFS' }];

export const post114: BlogArticle = {
    slug: 'architecture-of-infinite-headroom-32-bit-float',
    title: 'Where 32-bit float headroom ends',
    excerpt: 'In a 32-bit float mix, levels over 0 dBFS survive between plugins. They clip at the exits: a fixed-point export, the interface and plugins built to clip.',
    category: 'audio-science',
    publishedAt: '2026-02-15',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'In 32-bit float, levels above 0 dBFS survive between plugins, and rounding stays at about 24-bit precision at any level.',
        'Overs clip at the exits: fixed-point exports, the interface output and any plugin that clips or models a circuit.',
        'Gain-stage anyway, bring the master below 0 dBTP before export, and do not hand out float stems with overs.',
    ],
    figures: {
        overs: {
            type: 'signal',
            caption:
                'A wave peaking about 5 dB over full scale. Float keeps the whole wave. A 24-bit export cuts off everything above 0 dBFS, and turning the file down later only makes the flat tops quieter.',
            alt: 'Three plots with a dashed line marking 0 dBFS. In the first, a sine rises above the line intact. In the second, the same sine is cut flat at the line. In the third, both versions are turned down: the float one is a clean sine and the exported one still has flat tops.',
            rows: [
                { label: 'Inside a float mix', traces: [{ kind: 'sine', cycles: 2, amp: 0.9 }], lines: FULL_SCALE },
                {
                    label: 'Exported to 24-bit',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.9, muted: true, label: 'Before export' },
                        { kind: 'sine', cycles: 2, amp: 0.9, clip: 0.5, label: 'In the file' },
                    ],
                    lines: FULL_SCALE,
                },
                {
                    label: 'Both turned down 6 dB afterwards',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.45, dashed: true, label: 'Float' },
                        { kind: 'sine', cycles: 2, amp: 0.45, clip: 0.25, label: '24-bit export' },
                    ],
                    lines: FULL_SCALE,
                },
            ],
        },
        span: {
            type: 'bars',
            caption:
                'Range from the largest value down to one step for fixed point, or to the smallest normal value for float. Fixed-point formats gain about 6 dB per bit. 32-bit float spans about 1,530 dB and still keeps 24 bits of precision at every level.',
            alt: 'Bars on one scale: 16-bit fixed at 96 dB, 24-bit fixed at 144 dB, and 32-bit float at about 1,530 dB, more than ten times longer than the 24-bit bar.',
            min: 0,
            max: 1700,
            unit: 'dB',
            bars: [
                { label: '16-bit fixed', value: 96.3, display: '96 dB', dim: true },
                { label: '24-bit fixed', value: 144.5, display: '144 dB', dim: true },
                { label: '32-bit float', value: 1529, display: '1,530 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'A track reaches +8 dBFS between two plugins in a float mix, and the second plugin turns it down 10 dB. What comes out?',
            options: ['A clean signal peaking at -2 dBFS', 'A signal clipped flat by 8 dB', 'A signal the DAW limited on its own', 'A signal buried in rounding noise'],
            answer: 0,
            why: 'Float stores the over, so turning it down restores the whole wave, as long as neither plugin clips internally.',
        },
        {
            q: 'Where does a float mix clip?',
            options: [
                'At channel faders that are pushed past 0 dB',
                'Between plugins once the level passes 0 dBFS',
                'At fixed exports, the interface and clippers',
                'On a computer with a 32-bit operating system',
            ],
            answer: 2,
            why: 'The float engine itself keeps overs. They are cut off when the signal is converted to a fixed format, or by a plugin that clips or models a circuit with a real ceiling.',
        },
        {
            q: 'Why is 32-bit float described as having 24-bit precision?',
            options: [
                'It drops the lowest 8 bits when it exports',
                'Its 24-bit significand holds the detail',
                'Its noise floor sits fixed at -144 dBFS',
                'Only 24 of its 32 bits reach the converter',
            ],
            answer: 1,
            why: 'The exponent moves the scale and the 24-bit significand holds the detail. The error is relative to the value, so a quiet signal keeps the same precision as a loud one.',
        },
    ],
    content: `## Hook: the red meter that does not distort

A channel meter in your DAW is in the red, +6 dBFS on the peak display, and the track sounds clean. Years of advice say that anything over 0 dBFS is clipped and ruined, and this track is not.

The number format the DAW uses inside explains it. Most mix engines work in 32-bit floating point, and in floating point 0 dBFS is a reference level, not a wall. That headroom is real, but it ends at specific places, and those places are where overs turn into distortion.

## Why it matters: you need to know where the walls are

In a fixed-point format, such as a 24-bit WAV file, every sample is a whole number on a fixed grid of 16,777,216 levels. 0 dBFS is the largest number the format can hold. A calculation that produces a bigger value has nowhere to go and is clamped to full scale, which flattens the top of the wave. At the other end, very quiet signals use only a few of the levels, and rounding error becomes audible.

A float mix removes the top wall inside the DAW. You can be careless with levels between plugins and get away with it. You cannot get away with it at the exits: when the mix is converted back to fixed point for an export or for the interface, every over is clipped at once.

::figure overs

## Science model: a number with its own scale

A 32-bit float sample, as defined by the IEEE 754 standard (IEEE, 2019), is stored in binary scientific notation. One bit holds the sign, 8 bits hold an exponent and 23 bits hold the fraction, with one more leading bit implied, for 24 bits of significand. The exponent sets the scale, and the significand holds the detail at whatever scale the exponent picks.

The range is enormous. The largest value is about $3.4 \\times 10^{38}$ and the smallest normal value about $1.2 \\times 10^{-38}$, a span of about 1,530 dB. With 1.0 as 0 dBFS, the format can hold signals up to about +770 dBFS. No mix comes near either end.

The precision is also relative. Each calculation rounds to the nearest value the format can hold, and that error is at most $2^{-24}$ of the value itself, about 144 dB below the signal, whether the signal sits at -60 dBFS or +20 dBFS. In 24-bit fixed point a quiet signal gets fewer levels. In float it keeps the same precision. Some DAWs go further and mix in 64-bit float.

::figure span

The limits are at the edges of the float world. A 16-bit or 24-bit export clips every over. The interface's converters have a real maximum voltage, so anything above full scale is clipped on its way out. And a plugin is free to clip internally: a clipper does it by design, and an analog-modelled plugin is often built to expect a nominal level around -18 dBFS and distorts when driven far above it.

32-bit float recorders apply the same idea at the input. Some field recorders combine two converters, one set for quiet sounds and one for loud ones, and store the result as a 32-bit float file. The file cannot clip, so you can set the level afterwards. The microphone and the analog input still have a maximum level, though, and the noise floor is still the analog noise of the input.

## DAW experiment: find the walls

Step 6 needs a clipper plugin with a ceiling control, which not every DAW includes.

1. In a 48 kHz session, put a drum loop on a track that peaks around -6 dBFS.
2. Insert a gain plugin set to +18 dB, then a second gain plugin set to -18 dB. The signal between them peaks around +12 dBFS, but the output sounds clean.
3. Remove the second gain plugin and pull the master fader down 18 dB instead. It is still clean: the master fader is part of the float engine.
4. Turn your monitors down, set the master fader back to 0 dB and bounce the track offline with the +18 dB gain still on, once as a 24-bit WAV and once as a 32-bit float WAV.
5. Import both files and lower each by 18 dB. The 24-bit file is flat-topped and distorted. The float file matches the original.
6. Back on the original track, put the -18 dB gain plugin back after the +18 dB one and insert a clipper with its ceiling at 0 dB between them. The distortion is back, even inside the float engine.

Overs survive between float processes and come back clean when you turn them down. They clip at a fixed-point export, at the interface output and inside any plugin that clips.

## Common mistake: treating float as permission

The mistake is treating float as permission to ignore levels. The maths will hold the overs, but analog-modelled plugins respond to the level they receive, meters and faders get harder to read, and the final conversion clips anything you forgot to bring down. Gain-stage anyway. Keep tracks around the level your plugins expect and use the extra headroom as a safety net, not a working range.

The other mistake is sending float files with overs to someone else. A 32-bit float stem that peaks at +4 dBFS is intact, but if the next person's software reads it into a fixed format, it clips. Bring stems below 0 dBFS before you export them.

## Producer takeaway: the headroom is inside

Treat 0 dBFS as a line that matters at the exits: the master output, every fixed-point export and any plugin that models a real circuit. Inside the mix, float protects you from a moment of carelessness. Before you export, check the master with a true-peak meter, leave headroom below 0 dBTP, and dither if the file is 16-bit.

## References

- IEEE. (2019). *IEEE Standard for Floating-Point Arithmetic* (IEEE Std 754-2019).
- Goldberg, D. (1991). What every computer scientist should know about floating-point arithmetic. *ACM Computing Surveys*, 23(1), 5-48.
`,
    seo: {
        title: 'Where 32-bit float headroom ends | VGP Studio',
        description: 'How 32-bit floating point stores overs above 0 dBFS, why its precision is relative, and where clipping still happens: exports, converters and plugins.',
        keywords: ['32-bit float', 'floating point audio', 'IEEE 754', 'headroom', 'gain staging', 'clipping'],
    },
};
