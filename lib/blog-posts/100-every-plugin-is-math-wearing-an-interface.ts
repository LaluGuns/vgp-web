import { BlogArticle } from '../blog-data';

export const post100: BlogArticle = {
    slug: 'every-plugin-is-math-wearing-an-interface',
    title: 'Every plugin is maths with knobs',
    excerpt: 'Under every plugin interface is an equation that turns input samples into output samples. A null test against your stock tools shows what a plugin really adds.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'A plugin computes each output sample from current and past samples. The knobs only change the numbers in that equation.',
        'Every plugin changes level, spectrum, time or the shape of the wave. Faders, delays and EQs add no new frequencies; bending the wave does.',
        'A null test against your stock tools shows exactly what a plugin adds, and whether that difference grows with level.',
    ],
    figures: {
        biquad: {
            type: 'flow',
            caption:
                'What one EQ band computes for every sample. The knobs only set five numbers. The same multiply-and-add runs whatever the faceplate looks like.',
            alt: 'Four steps: knobs for frequency, gain and Q set five coefficients; each sample is multiplied and added with two past inputs and two past outputs; the result is the output sample, which is also fed back into the next two calculations.',
            steps: [
                { label: 'Knobs', note: 'Frequency, gain, Q' },
                { label: 'Five coefficients', note: 'b0, b1, b2, a1, a2' },
                { label: 'Multiply and add', focus: true, note: 'This input, two past inputs, two past outputs' },
                { label: 'Output sample', note: 'Also fed back into the next two calculations' },
            ],
        },
        bell: {
            type: 'spectrum',
            mode: 'gain',
            range: [200, 20000],
            dbRange: [-3, 6],
            caption:
                'One equation, two sets of coefficients: a 3 dB bell at 5 kHz with Q 0.7 and with Q 2. An octave below, at 2.5 kHz, the wide band still adds about 1.4 dB and the narrow one about 0.3 dB.',
            alt: 'Gain against frequency for two bell boosts of 3 dB at 5 kHz. The Q 0.7 curve is a broad hill spanning several octaves. The Q 2 curve is a narrow peak.',
            curves: [
                { kind: 'eq', label: 'Q 0.7', dashed: true, bands: [{ type: 'bell', freq: 5000, gain: 3, q: 0.7 }] },
                { kind: 'eq', label: 'Q 2', bands: [{ type: 'bell', freq: 5000, gain: 3, q: 2 }] },
            ],
            marks: [{ f: 2500, label: '2.5 kHz' }],
        },
        curve: {
            type: 'transfer',
            domain: 'linear',
            caption:
                'A saturator is a curve from input to output, applied to every sample. Quiet samples pass almost unchanged and loud ones are bent down. That bending is what creates new harmonics.',
            alt: 'Input against output from minus one to one. A straight diagonal line shows a clean path. A second curve follows it near zero and flattens smoothly toward the top and bottom.',
            curves: [
                { kind: 'linear', label: 'Clean' },
                { kind: 'softclip', ceiling: 0.6, label: 'Saturator' },
            ],
        },
    },
    quiz: [
        {
            q: 'You change the Q of a digital EQ band. What changes inside the plugin?',
            options: ['The equation it runs on every sample', 'The coefficients it multiplies by', 'The sample rate it runs the band at', 'The number of past samples it reads'],
            answer: 1,
            why: 'A biquad always computes the same multiply-and-add. Frequency, gain and Q set its coefficients, and those numbers decide the curve.',
        },
        {
            q: 'In a null test, you lower the input by 10 dB and the residual drops by 25 dB. What does that tell you?',
            options: [
                'The difference is distortion that grows with level',
                'The difference is a slightly different EQ curve',
                'The difference is a latency offset between the two',
                'The difference is noise that stays at one level',
            ],
            answer: 0,
            why: 'A linear difference, such as a slightly different curve, drops exactly as much as the input. A residual that falls faster than the input is nonlinear, like added harmonics.',
        },
        {
            q: 'Which of these plugins changes the shape of the waveform rather than its level, spectrum or timing?',
            options: ['A fader', 'A digital delay', 'A parametric EQ', 'A saturator'],
            answer: 3,
            why: 'A saturator passes each sample through a curve, so loud parts are bent more than quiet ones. That is a nonlinear change, and it creates new harmonics. A fader, a delay and an EQ are linear, so they cannot.',
        },
    ],
    content: `## Hook: the wooden panel

An EQ plugin on your screen has wooden side panels and a VU meter with a glowing needle. It promises the character of a rare 1960s console. You load it on a vocal, add a little high shelf and the vocal sounds expensive. It is tempting to think the software has something your stock EQ does not.

Maybe it does. But whatever it has, it is not in the wood or the needle. Behind the faceplate the plugin receives a stream of numbers, calculates a new stream and passes it on. Everything it does to the sound is in that calculation.

## Why it matters: judge the calculation, not the faceplate

When plugins feel like objects with personalities, chains grow. Three compressor emulations go on a vocal, each for its supposed character, and soon nobody can say which one is doing what. Gain staging drifts, transients get flatter with each stage, and the chain stays because removing it feels risky.

Every plugin, however it looks, makes one or more of four kinds of change: to level, to the spectrum, to time, or to the shape of the waveform through a nonlinear curve. Name the change and you can judge the plugin by what it does to the signal.

## Science model: difference equations

A digital processor computes each output sample $y[n]$ from the current input sample $x[n]$, earlier inputs and, in many cases, earlier outputs. A fader is the simplest:

$$y[n] = g\\, x[n]$$

where $g$ is the gain as a multiplier. A delay of $d$ samples is

$$y[n] = x[n - d]$$

A parametric EQ band is usually a biquad, which combines the current input and the two before it with the two previous outputs:

$$
\\begin{aligned}
y[n] = {} & b_0 x[n] + b_1 x[n-1] + b_2 x[n-2] \\\\
& - a_1 y[n-1] - a_2 y[n-2]
\\end{aligned}
$$

The frequency, gain and Q knobs do not change this equation. They change the five coefficients $b_0, b_1, b_2, a_1, a_2$, and those numbers decide the curve. Feeding past outputs back in is what lets five numbers draw a resonant bell or a smooth shelf.

::figure biquad

::figure bell

Changes like these are linear: double the input and the output doubles, at every frequency. Character usually lives in the fourth kind of change, which is nonlinear. A compressor sits between the two: it changes level, but because the gain follows the signal, a fast one also bends single cycles and adds harmonics. A saturator passes each sample through a curve that bends near the top, so loud parts are squashed more than quiet ones and new harmonics appear. Emulations of analog gear range from simple curves like this to circuit models that solve the equations of the original components sample by sample. A good model also includes the parts of the hardware that are not filters at all, such as noise, transformer saturation and behaviour that changes with level.

::figure curve

## DAW experiment: null your expensive EQ

1. Put a drum loop on track A and duplicate it to track B. Flip B's polarity and confirm the two cancel to silence.
2. On A, insert your vintage-style EQ with a 3 dB boost at 5 kHz, or the nearest setting it offers.
3. On B, insert your stock EQ with the same type, frequency and gain. Adjust its Q or shape until the leftover sound on the master is as quiet as you can get it.
4. Listen to the leftover on its own. That is everything the vintage EQ does that your stock EQ does not, at this setting.
5. Lower the loop by 10 dB with clip gain on both tracks. If the leftover also drops by about 10 dB, the difference is linear: a curve you could match more closely. If it drops much further, the difference is mostly distortion that grows with level.
6. If the vintage EQ has a drive, transformer or noise option, switch it on and off and listen to the leftover change.

The leftover is the plugin's character with everything else removed. Sometimes it is a slightly different curve, sometimes added harmonics or noise. Either way you now know what you are choosing, and whether it earns its CPU.

## Common mistake: stacking the same change

The common mistake is stacking several plugins that make the same kind of change without a plan: three EQs that all reshape the spectrum, or two compressors described as warmth and punch. Serial compression, where two compressors each do a little, is a real technique, but it works when you know what each stage is for. If you cannot say what a plugin changes, bypass it at matched level and listen. If nothing gets worse, take it out.

## Producer takeaway: name the change

Look at an insert chain and strip the branding off each plugin. Ask whether it changes level, spectrum, time or shape. Faders and gates change level, and compressors change level over time. EQs and filters change the spectrum. Delays, reverbs and chorus change time. Saturators, clippers and limiters change the shape. Two plugins doing the same job in a row need a reason. Choose plugins for what their equations do to your track, and run the null test when you are not sure.

## References

- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
- MIT OpenCourseWare. *6.003 Signals and Systems*, Fall 2011. https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/
`,
    seo: {
        title: 'Every plugin is maths with knobs | VGP Studio',
        description: 'The difference equations behind faders, delays and EQs, why saturation is the nonlinear part, and how a null test shows what a plugin really adds.',
        keywords: ['audio plugins math', 'digital signal processing', 'biquad filter', 'null test', 'difference equation', 'saturation'],
    },
};
