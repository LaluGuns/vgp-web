import { BlogArticle } from '../blog-data';

// A decaying note rounded to a deliberately coarse 3-bit grid (one step = 0.25). The undithered row uses
// the renderer's own rounding (quantize: 3). The dithered row adds triangular dither of plus or minus one
// step before rounding, computed here per sample.
const STEP = 0.25;
const COUNT = 220;
const note = (t: number) => 0.9 * Math.exp(-3 * t) * Math.sin(2 * Math.PI * 5 * t);
function dithered(): [number, number][] {
    let seed = 5;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    const points: [number, number][] = [];
    for (let k = 0; k < COUNT; k++) {
        const t = k / COUNT;
        const noise = (rand() - rand()) * STEP;
        const q = STEP * Math.round((note(t) + noise) / STEP);
        points.push([t, q], [(k + 1) / COUNT - 0.0001, q]);
    }
    return points;
}

const BITS = [8, 12, 16, 24];

export const post099: BlogArticle = {
    slug: 'bit-depth-is-about-noise-not-magic-warmth',
    title: 'Bit depth sets the noise floor',
    excerpt: 'More bits do not make audio warmer or more detailed. Each one lowers the noise floor by about 6 dB, and dither turns rounding error on quiet sounds into steady hiss.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Bit depth sets how far the noise floor sits below full scale, about 6 dB per bit: 96 dB at 16-bit and 144 dB at 24-bit.',
        'Undithered rounding turns into distortion on quiet sounds. Dither swaps it for a steady, low hiss.',
        'Record at 24-bit with headroom, mix in float, and dither once when you export to 16-bit.',
    ],
    figures: {
        range: {
            type: 'bars',
            caption:
                'The distance from full scale down to the size of one step, 6.02 dB per bit. A 24-bit file has about 48 dB more room under the music than a 16-bit file.',
            alt: 'Bars for four bit depths: 8-bit 48 dB, 12-bit 72 dB, 16-bit 96 dB and 24-bit 144 dB.',
            min: 0,
            max: 150,
            unit: 'dB',
            bars: BITS.map((n) => ({ label: `${n}-bit`, value: 20 * Math.log10(2 ** n), display: `${(20 * Math.log10(2 ** n)).toFixed(1)} dB`, dim: n < 16 })),
        },
        grain: {
            type: 'signal',
            caption:
                'A decaying note rounded to a deliberately coarse grid so the steps show. Without dither, once the note shrinks toward half a step it turns into square-edged steps and then silence: distortion that follows the note. With dither the error becomes noise that no longer follows the note, and on average the fading note is still there inside it.',
            alt: 'Three plots of a decaying sine. The first is smooth. The second is made of flat steps that turn into blocky pulses and then a flat line as the note fades. The third is rough and noisy but keeps following the fading sine to the end.',
            rows: [
                { label: 'The note', traces: [{ kind: 'sine', cycles: 5, amp: 0.9, decay: 3 }] },
                {
                    label: 'Rounded, no dither',
                    traces: [
                        { kind: 'sine', cycles: 5, amp: 0.9, decay: 3, muted: true },
                        { kind: 'sine', cycles: 5, amp: 0.9, decay: 3, quantize: 3 },
                    ],
                    lines: [{ y: STEP / 2, label: 'Half a step' }],
                },
                {
                    label: 'Rounded, with dither',
                    traces: [
                        { kind: 'sine', cycles: 5, amp: 0.9, decay: 3, muted: true },
                        { kind: 'envelope', points: dithered() },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'How much lower is the quantization noise floor of a 24-bit file than that of a 16-bit file?',
            options: ['48 dB', '8 dB', '24 dB', '96 dB'],
            answer: 0,
            why: 'Each bit is worth about 6 dB. Eight more bits is 8 × 6.02 ≈ 48 dB.',
        },
        {
            q: 'What does dither do when you reduce bit depth?',
            options: [
                'Removes the noise floor from the exported file',
                'Turns rounding distortion into a steady hiss',
                'Raises the quiet passages above the noise floor',
                'Adds soft harmonics that make a mix warmer',
            ],
            answer: 1,
            why: 'Without dither, the rounding error on a quiet signal follows its waveform and sounds like distortion. A little random noise before rounding makes the error independent of the signal.',
        },
        {
            q: 'Why record at 24-bit when a 16-bit master already has about 96 dB of range?',
            options: [
                '24-bit files capture more of the detail above 10 kHz',
                'Streaming services reject 16-bit files at upload',
                'Quiet tails tracked with headroom need finer steps',
                '24-bit recordings keep more warmth on playback',
            ],
            answer: 2,
            why: 'With peaks around -18 dBFS, a reverb tail 60 dB lower sits near -78 dBFS: only about four steps of a 16-bit grid. At 24-bit the grid is 256 times finer.',
        },
    ],
    content: `## Hook: the smoother staircase

You set up a session at 48 kHz and 24-bit and feel good about it. 24-bit must sound warmer than 16-bit, you think, with finer detail in the highs. More bits, smaller steps, a smoother wave.

That picture is wrong in a useful way. Bit depth has nothing to do with frequency response or warmth. It sets one thing: how far the noise floor sits below the loudest possible sample.

## Why it matters: quiet details live near the floor

Each sample is stored as a whole number on a grid of levels. Whatever the true value is, it gets rounded to the nearest level, and that rounding error is quantization noise. With enough bits the error is far below anything you can hear. With too few, or with a very quiet signal, it becomes audible.

On a finished master, 16-bit gives about 96 dB between full scale and the floor, which is plenty for playback. Recording is different. You track with headroom, peaks around -18 to -12 dBFS, and the quiet end of a performance, a fade or a reverb tail, can sit 60 dB below that. At 16-bit that leaves the tail only a few steps of the grid. At 24-bit the grid is 256 times finer, and the analog noise of the microphone and preamp is far louder than the rounding error. That is the case for recording at 24-bit.

::figure range

## Science model: 6 dB per bit

An $N$-bit fixed-point format has $2^N$ levels: 65,536 at 16-bit and 16,777,216 at 24-bit. Each added bit doubles the number of levels and halves the size of a step, which lowers the noise floor by 6.02 dB. The range from full scale down to one step is

$$20 \\log_{10}\\left(2^N\\right) \\approx 6.02\\,N \\ \\text{dB}$$

which gives 96.3 dB at 16-bit and 144.5 dB at 24-bit. Measured as a full-scale sine against the rounding noise, the figure is slightly higher, $6.02\\,N + 1.76$ dB, or about 98 dB at 16-bit.

Rounding error only behaves like noise while the signal is large compared with one step. On a very quiet signal it follows the waveform, and you hear distortion: a gritty, buzzy edge on the tail of a note that comes and goes with the note. Dither fixes this. Adding a tiny amount of random noise, on the order of one step, before rounding makes the error independent of the signal (Lipshitz, Wannamaker and Vanderkooy, 1992). You trade the distortion for a steady hiss at a slightly higher level, and the quiet note stays audible inside it.

::figure grain

::demo bit-depth

Inside the DAW, mixing usually happens in 32-bit floating point, which stores a scale factor with every sample. That keeps levels above 0 dBFS from clipping between plugins and holds rounding error at about 24-bit precision at any level. It is a working format, and the [lesson on 32-bit float headroom](/blog/architecture-of-infinite-headroom-32-bit-float) covers its limits.

## DAW experiment: make quantization audible

1. Put a soloed, clean piano or guitar recording on a track.
2. Insert a gain plugin and lower the level by 60 dB. The track is now barely audible.
3. Export it as a 16-bit WAV with dither turned off.
4. Import the file onto a new track, insert a gain plugin and raise it by 60 dB.
5. Listen to the ends of the notes. A gritty, buzzing noise follows each decay. That is undithered quantization error, raised 60 dB so you can hear it.
6. Repeat the export with dither on. The grit turns into a steady hiss, and the decays stay smooth under it.
7. Repeat once more as a 24-bit export. The rounding noise drops by about 48 dB, down to roughly the level of the hiss already in the recording.

The same quiet signal is grainy at 16-bit without dither, hissy with dither and clean at 24-bit. None of the versions sounds warmer. Only the noise changes.

## Common mistake: exporting to 16-bit without dither

The most common mistake is reducing a 24-bit or float mix to a 16-bit file without dither, on the idea that a clean export should not add noise. Without dither the rounding error becomes low-level distortion on fades and reverb tails. With dither it becomes a hiss around -96 dBFS that nobody hears at normal listening levels. Dither once, as the last step, whenever the bit depth goes down.

The opposite mistake is expecting more bits to change the tone. Between a 24-bit master and a properly dithered 16-bit copy of it, the only difference is noise around -96 dBFS.

## Producer takeaway: bits are margin

Record at 24-bit with peaks around -18 to -12 dBFS, so loud moments have headroom and quiet ones stay far above the grid. Mix in the DAW's float engine. When you export a 16-bit file, apply dither once at the end. If someone says a format sounds warmer because of its bit depth, ask what happened to the noise floor.

## References

- Lipshitz, S. P., Wannamaker, R. A., & Vanderkooy, J. (1992). Quantization and dither: A theoretical survey. *Journal of the Audio Engineering Society*, 40(5), 355-375.
`,
    seo: {
        title: 'Bit depth sets the noise floor | VGP Studio',
        description: 'What 16-bit and 24-bit really change, why each bit is worth about 6 dB, how dither turns rounding distortion into hiss, and when to use it.',
        keywords: ['bit depth', 'quantization noise', 'dither', 'dynamic range', 'noise floor', '24-bit recording'],
    },
};
