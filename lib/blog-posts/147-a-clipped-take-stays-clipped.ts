import { BlogArticle } from '../blog-data';

// One sung phrase drawn as a simple, slightly lopsided wave. Its unscaled peaks are +0.58 and -0.71.
const VOICE = {
    kind: 'sum' as const,
    parts: [
        { cycles: 3, amp: 0.55 },
        { cycles: 6, amp: 0.2, phase: 30 },
    ],
};
// Full scale sits at 0.8 of the plot height.
const FULL_SCALE = [
    { y: 0.8, label: '0 dBFS' },
    { y: -0.8, label: '0 dBFS' },
];

export const post147: BlogArticle = {
    slug: 'a-clipped-take-stays-clipped',
    title: 'A clipped take stays clipped after the fader',
    excerpt: 'Clipping at the preamp or converter is written into the file. The fader only scales playback, so the distortion gets quieter and stays.',
    category: 'vocal-production',
    publishedAt: '2026-10-09',
    readingTime: 8,
    summary: [
        'Set input gain on the loudest section of the song, sung for real, because anything that clips at the preamp or converter is written into the file.',
        'Fader, clip gain and normalizing multiply every sample by the same number, so they turn the distortion down by exactly as much as the vocal.',
        'When a take clips, lower the gain upstream and record again, and save the declipper for a few words on a take you cannot replace.',
    ],
    figures: {
        path: {
            type: 'flow',
            caption:
                'A typical recording chain, in order. The preamp gain decides what reaches the converter. The fader sits after the file, so it changes playback and nothing that was recorded.',
            alt: 'Five steps from top to bottom: microphone, preamp, A/D converter, recorded file, then inserts and fader, each with a short note on what it does.',
            steps: [
                { label: 'Microphone', note: 'Louder or closer singing raises its output' },
                { label: 'Preamp', note: 'Sets the level, and has its own maximum', focus: true },
                { label: 'A/D converter', note: 'Anything above full scale is written as full scale' },
                { label: 'Recorded file', note: 'Keeps whatever the converter wrote' },
                { label: 'Inserts and fader', note: 'Playback only, too late for the take' },
            ],
        },
        fader: {
            type: 'signal',
            caption:
                'The same phrase three ways. Sung louder, its peaks pass full scale and the converter writes them flat. Turned down 6 dB afterwards, the flat tops sit at half height with the same shape, and the grey line shows the peaks that were never recorded.',
            alt: 'Three waveform plots with dashed lines marking full scale, 0 dBFS, at the top and bottom. The first wave stays inside the lines. The second is larger and cut flat where it meets both lines. The third is the second at half the height: its flat tops sit well inside the lines, with a grey curve above them showing the rounded peaks the wave should have had.',
            rows: [
                { label: 'Sung at soundcheck level', lines: FULL_SCALE, traces: [VOICE] },
                {
                    label: 'Sung louder: clipped at the converter',
                    lines: FULL_SCALE,
                    traces: [
                        { ...VOICE, gain: 1.6, muted: true, label: 'Before the converter' },
                        { ...VOICE, gain: 1.6, clip: 0.8, label: 'In the file' },
                    ],
                },
                {
                    label: 'Same file, fader down 6 dB',
                    lines: FULL_SCALE,
                    traces: [
                        { ...VOICE, gain: 0.8, muted: true },
                        { ...VOICE, gain: 0.8, clip: 0.4 },
                    ],
                },
            ],
        },
        gap: {
            type: 'bars',
            min: -40,
            max: 0,
            unit: 'dB',
            caption:
                'A sine driven 3 dB past full scale and clipped, with its harmonic levels computed and shown relative to the clipped note. Before and after a 6 dB fader cut, the third harmonic sits 17.8 dB under the note, so the amount of distortion has not changed.',
            alt: 'Four bars. The note as recorded is at 0 dB and its third harmonic at -17.8 dB. After the fader, the note is at -6 dB and the third harmonic at -23.8 dB. The gap between note and harmonic is the same in both cases.',
            bars: [
                { label: 'Note, as recorded', value: 0, display: '0 dB', dim: true },
                { label: '3rd harmonic, as recorded', value: -17.8, display: '-17.8 dB' },
                { label: 'Note, fader -6 dB', value: -6, display: '-6 dB', dim: true },
                { label: '3rd harmonic, fader -6 dB', value: -23.8, display: '-23.8 dB' },
            ],
        },
    },
    quiz: [
        {
            q: 'The loudest chorus lines clip at the interface. Which change protects the next take?',
            options: [
                'Pull the track fader down while recording',
                'Lower the preamp gain or switch in the pad',
                'Put a limiter on the record-armed track',
                'Switch the session to 32-bit float files',
            ],
            answer: 1,
            why: 'The clipping happens at the preamp or the converter, before the file is written. Only a change at or before that point keeps the peaks below full scale; the fader and the inserts come after the file.',
        },
        {
            q: 'In a clipped note the third harmonic sits 17.8 dB below the note. You pull the fader down 10 dB. How far below the note is the harmonic now?',
            options: ['7.8 dB', '10 dB', '17.8 dB', '27.8 dB'],
            answer: 2,
            why: 'The fader multiplies every sample by the same number, so the note and the harmonic both drop 10 dB. The gap between them, which is the amount of distortion, stays 17.8 dB.',
        },
        {
            q: 'You track through a 24-bit interface into a 32-bit float session, and the converter clips. What does the float file hold?',
            options: [
                'The full peaks, since float has room above 0 dBFS',
                'The full peaks, but at 24-bit resolution only',
                'Silence wherever the input went past full scale',
                'Flat tops at full scale, stored exactly in float',
            ],
            answer: 3,
            why: 'The converter delivered full-scale values for the clipped samples. Float stores those values perfectly, but it has no way to know what the peaks would have been.',
        },
    ],
    content: `## Hook: the chorus that crackles

The verses went down clean. In the last chorus the singer opened up, the interface's clip light blinked on two words, and nobody stopped the take because it felt like the one. In the mix those two words have a fizzy edge on the vowel. You pull the vocal fader down 6 dB. The edge gets quieter along with everything else and stays exactly as rough.

The converter flattened those peaks before the take reached the disk, so every later move, the fader included, works on a wave whose tops are already gone.

## Why it matters: the file holds what the converter saw

In a typical recording chain the microphone feeds a preamp, the preamp feeds the analog-to-digital converter, and the converter's numbers are written to the file. The channel's inserts and fader come after that, on playback, which is why recording level is set at the preamp and not at the fader (Nichols, 2018). Moving the fader during a take changes what you hear and leaves the file alone.

::figure path

A converter with fixed-point output has a largest number it can report: full scale, or 0 dBFS. When the voltage from the preamp asks for more, every sample past that point is written as the maximum value and the top of the wave comes out flat (Pohlmann, 2011). The preamp has a ceiling of its own, its maximum output voltage, and a preamp driven past it flattens the wave before the converter ever sees it. Either way the damage is in the recording, and the DAW meter only reports it afterwards.

That is also why a 32-bit float session does not rescue the take. A typical interface converter delivers fixed-point samples, so a clipped sample arrives as full scale, and float stores that full-scale value perfectly. [Float headroom](/blog/architecture-of-infinite-headroom-32-bit-float) protects you between plugins inside the DAW. It starts after the converter, which is where this problem began. Field recorders that merge two converters into one float file are the exception, which the float headroom lesson also covers.

## Science model: a fader is one multiplication

Turning a fader down by $G$ dB multiplies every sample by the same number:

$$g = 10^{-G/20}$$

For 6 dB, $g \\approx 0.5$. Every sample is halved, the flat ones included. A flat top at full scale becomes a flat top near -6 dBFS with exactly the same shape. A peak meter now shows no clipping at all, which is how a turned-down clipped take slips through a session unnoticed. Gain cannot tell which samples were clipped, and even if it could, the true values are gone: the file only says they were at least full scale.

::figure fader

The shape is what you hear. A flat top has sharp corners the original wave never had, and corners mean new frequencies. Clipping that treats both halves of the wave the same way adds odd harmonics, the same ones a [clipper plugin](/blog/saturation-clipping-limiting-three-flavors-of-loud) adds on purpose. Work it through for a sine driven 3 dB past full scale and the third harmonic comes out 17.8 dB below the note. A voice is not a sine, so its exact numbers differ, but the next step does not depend on them.

Now pull that clipped note down 6 dB. The note drops 6 dB, the harmonic drops 6 dB, and the gap between them, which is how much distortion there is, stays at 17.8 dB. The same holds for clip gain and for normalizing, because each of them is one multiplication.

::figure gap

In the demo, listen to the edge on the loudest notes, not the overall level. When the clipped phrase is turned down, ask whether the rough edge went away or only got quieter.

::demo clip-recover

Repair tools exist. A declipper looks at the samples that did not clip and estimates what the flattened peaks would have been, using assumptions about how audio usually behaves, such as a sparse spectrum. Záviška and colleagues (2021) reviewed the popular methods and tested them on real audio. Because the estimate is built from the samples that survived, the more of a phrase is clipped, the less a declipper has to go on. A declipper can rescue a few clipped syllables. What it gives you is an estimate, so a retake is still the better fix while the singer is in the room.

## DAW experiment: clip a take on purpose

1. Arm a mono track with a microphone, turn your speakers or headphones down, and set the preamp so a spoken phrase peaks well below 0 dBFS. Record it.
2. Raise the preamp gain until the interface's clip light flashes on the loudest syllables, and record the same phrase at the same loudness.
3. Zoom in on the loudest syllable of the second take. The peaks run flat along the top and bottom of the scale.
4. Pull that track's fader down 6 dB and listen. The phrase is quieter and the edge on the loud syllables is still there.
5. Lower the clip itself by 6 dB with clip gain and zoom in again. The flat tops now sit 6 dB below full scale with the same shape.
6. Match the clean take to the clipped one by ear with clip gain and switch between them.
7. If you have a declipping plugin, run it on the clipped take and compare the result with the clean take.

Fader, clip gain and declipper all change the clipped take after the fact. The clean take is clean because its gain was set before the converter.

## Common mistake: setting the gain on a polite run-through

The usual cause is a level set while the singer marks the part. They sing softly for the soundcheck, then give the real take everything they have. A singer who cannot hear themselves in the cue pushes even harder, which is one more reason to [get the headphone balance right first](/blog/how-headphone-balance-changes-performance). Set the gain while they sing the loudest section of the song at full performance level, and check the peaks again after the first real take.

The opposite mistake is treating 0 dBFS as a target, as if a hot take were a better take. At 24-bit the format's floor sits about 144 dB below full scale, and the noise of the mic, the preamp and the room is far louder than that, so leaving clear room between your peaks and full scale [costs you almost nothing](/blog/bit-depth-is-about-noise-not-magic-warmth). Peaks around -18 to -12 dBFS are a common starting point, with more room for a dynamic singer.

## Producer takeaway: fix it where it happened

When a take clips, go upstream: lower the preamp gain, switch in a pad if the mic or interface has one, or ask the singer to step back a little. Then record again. Check the loudest moments of each take as you go, because the clip light only flashes for a moment while the file keeps the flat tops. If the clipped take has the best performance, comp the damaged words from another take or try a declipper on just those words before you give up on it.

## References

- Nichols, P. (2018, January 7). Downloadable charts to understand audio signal flow in a DAW. *iZotope*. https://www.izotope.com/community/blog/understanding-audio-signal-flow-in-a-daw
- Pohlmann, K. C. (2011). *Principles of Digital Audio* (6th ed.). McGraw-Hill.
- Záviška, P., Rajmic, P., Ozerov, A., & Rencker, L. (2021). A survey and an extensive evaluation of popular audio declipping methods. *IEEE Journal of Selected Topics in Signal Processing*, 15(1), 5-24.
`,
    seo: {
        title: 'A clipped take stays clipped after the fader | VGP Studio',
        description: 'Converter clipping is written into the file. Why the fader, clip gain and float cannot undo it, and how to set vocal input gain so takes stay clean.',
        keywords: ['clipped vocal recording', 'input gain staging', 'converter clipping', 'fix clipped audio', 'recording headroom', 'declipping'],
    },
};
