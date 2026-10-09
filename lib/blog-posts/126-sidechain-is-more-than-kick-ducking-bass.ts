import { BlogArticle } from '../blog-data';

// One bar at 120 BPM (2000 ms) across the plot, so the kicks land 500 ms apart.
const KICKS = [0.02, 0.27, 0.52, 0.77];

// Bass level under a kick-keyed duck: an instant cut of depthDb at each kick,
// then the cut fades exponentially with time constant tau (a fraction of the bar).
function duck(depthDb: number, tau: number): [number, number][] {
    const points: [number, number][] = [];
    for (let i = 0; i <= 400; i++) {
        const t = i / 400;
        const last = KICKS.filter((k) => k <= t).pop();
        const cut = last === undefined ? 0 : depthDb * Math.exp(-(t - last) / tau);
        points.push([t, 0.8 * 10 ** (-cut / 20)]);
    }
    return points;
}

export const post126: BlogArticle = {
    slug: 'sidechain-is-more-than-kick-ducking-bass',
    title: 'Sidechain lets one track control another',
    excerpt: 'A sidechain feeds one signal to the detector and turns down another. The same routing drives kick and bass ducking, de-essing, bus compression and ghost triggers.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 8,
    summary: [
        'Ask two questions of every sidechain: which signal should decide when the processor acts, and which track should get quieter.',
        'For kick and bass, set the release so the bass is back at full level just before the next kick, which at 120 BPM means within 500 ms.',
        'A filter in the key changes only what triggers the processor, so use it to stop the lows from driving a bus compressor or to aim a de-esser at sibilance.',
    ],
    figures: {
        path: {
            type: 'flow',
            caption:
                'A sidechain splits the processor into two paths. The key and its filter decide when the gain changes. The gain stage decides which sound gets quieter.',
            alt: 'Four steps from top to bottom: a key input such as a kick, vocal or silent ghost track; a detector filter; a gain computer with threshold, ratio, attack and release; and a gain stage on a different track.',
            steps: [
                { label: 'Key input', note: 'A kick, a vocal or a silent ghost track', focus: true },
                { label: 'Detector filter', note: 'Optional. Sets which part of the key the detector hears', focus: true },
                { label: 'Gain computer', note: 'Threshold, ratio, attack and release' },
                { label: 'Gain stage', note: 'On the bass, a pad or a whole bus' },
            ],
        },
        duck: {
            type: 'signal',
            caption:
                'One bar at 120 BPM, drawn from a simple model: each kick cuts the bass by 9 dB and the cut fades away exponentially. With a 50 ms time constant the bass is back within half a decibel about 150 ms after each kick. With 400 ms it is still about 2.6 dB down when the next kick lands, so it never reaches full level.',
            alt: 'Three level plots over one bar. The top shows four kick hits a beat apart. The middle shows a bass level that drops at each kick and climbs back to full level well before the next one. The bottom shows a bass level that drops at each kick and is still climbing when the next kick pulls it down again.',
            rows: [
                {
                    label: 'Kick (the key)',
                    unipolar: true,
                    traces: [{ kind: 'hits', at: KICKS, decay: 25, outline: true }],
                    marks: [
                        { t: 0.02, label: 'Beat 1' },
                        { t: 0.27, label: 'Beat 2' },
                        { t: 0.52, label: 'Beat 3' },
                        { t: 0.77, label: 'Beat 4' },
                    ],
                },
                {
                    label: 'Bass, fast release',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: [[0, 0.8], [1, 0.8]], muted: true, label: 'No duck' },
                        { kind: 'envelope', points: duck(9, 0.025), label: 'Ducked' },
                    ],
                },
                {
                    label: 'Bass, slow release',
                    unipolar: true,
                    traces: [
                        { kind: 'envelope', points: [[0, 0.8], [1, 0.8]], muted: true, label: 'No duck' },
                        { kind: 'envelope', points: duck(9, 0.2), label: 'Ducked' },
                    ],
                },
            ],
        },
        detector: {
            type: 'spectrum',
            mode: 'gain',
            dbRange: [-36, 6],
            caption:
                'Two detector filters, drawn from the real filter maths. A 12 dB per octave high-pass at 100 Hz hears a 50 Hz kick fundamental about 12 dB quieter. One at 5 kHz, a simple stand-in for a de-esser detector, hears 1 kHz about 29 dB quieter, so vowels barely reach it and sibilance does.',
            alt: 'Gain over frequency for two high-pass filters. The first falls away below 100 Hz and is flat above about 200 Hz. The second, dashed, falls away below 5 kHz and is far down through the midrange.',
            marks: [
                { f: 50, label: 'Kick' },
                { f: 1000, label: 'Vowels' },
            ],
            curves: [
                { kind: 'eq', label: 'Bus compressor key, HPF 100 Hz', bands: [{ type: 'highpass', freq: 100 }] },
                { kind: 'eq', label: 'De-esser key, HPF 5 kHz', dashed: true, bands: [{ type: 'highpass', freq: 5000 }] },
            ],
        },
    },
    quiz: [
        {
            q: 'A kick plays on every beat at 128 BPM and ducks the bass. About how long does the bass have to recover before the next kick?',
            options: ['235 ms', '469 ms', '780 ms', '128 ms'],
            answer: 1,
            why: 'One beat lasts 60,000 / 128 = 469 ms, so the release has to bring the bass back within that time.',
        },
        {
            q: 'You switch on a 100 Hz high-pass in the sidechain of a mix bus compressor. What changes?',
            options: [
                'The bus output loses its low end below 100 Hz',
                'The ratio drops for bass notes but not for vocals',
                'The attack gets slower on low notes than on high ones',
                'The kick reaches the detector quieter and triggers less',
            ],
            answer: 3,
            why: 'The filter sits in the control path only. The audio through the bus is unfiltered; the detector just hears less of the lows, so they pull the gain down less often.',
        },
        {
            q: 'Why key a pad from a silent copy of the kick instead of the audible kick?',
            options: [
                'So the pumping continues where the audible kick stops',
                'So the pad ducks deeper than the kick level allows',
                'So the sidechain adds no latency to the pad track',
                'So the kick sounds louder against the pumping pad',
            ],
            answer: 0,
            why: 'The ghost track keeps sending its pattern to the detector even in a breakdown where the real kick drops out, so the movement stays steady.',
        },
    ],
    content: `## Hook: filed under dance music

The mix bus compressor dips the cymbals and the vocal every time the kick lands, and you have lowered its ratio twice without fixing it. The only sidechain in the session is the one from the first tutorial you watched: the kick on the key input of a compressor on the bass, pumping like a club record. Every other key input in the session sits unused.

Kick and bass is one use of a more general idea: a sidechain lets a processor listen to one signal and act on another. The same routing explains how a de-esser knows when to work, and how to stop that bus compressor reacting to every kick.

## Why it matters: one path decides when, the other decides what

Every compressor, expander and gate has two paths. The audio path carries the sound you hear through a gain stage. The control path, the sidechain, measures a level and tells the gain stage how far to turn down. On a normal insert the control path listens to the same audio it is processing. The sidechain input, often labelled key, lets you feed it something else.

::figure path

That split gives you two decisions. What goes into the control path sets when the processor acts. Where the gain stage sits sets what gets quieter. A lot of sidechain trouble comes from mixing the two up: filtering the key and expecting the output tone to change, or keying from the right source and ducking the wrong track.

## Science model: gain computed from somewhere else

A feed-forward compressor turns its input $x(t)$ down by a gain it computes from a detected level. Giannoulis, Massberg and Reiss (2012) break that computation into a level detector, a gain computer that applies threshold and ratio, and smoothing set by attack and release. With $g$ standing for that whole chain:

$$y(t) = x(t) \\cdot g\\left( k(t) \\right)$$

On an ordinary insert the key $k(t)$ is $x(t)$ itself. With a sidechain it is another signal, or the same signal through a filter. Expanders and noise gates share this structure and differ only in the gain computer (Reiss and McPherson, 2014; Zölzer, 2011). Change only $k(t)$ and one compressor does three different jobs; swap its gain computer for a gate's and you get a fourth.

The familiar one keys a compressor on the bass from the kick. Attack sets how fast the bass gets out of the way, and release sets how it comes back, which you hear as the groove. At 120 BPM a beat lasts 60,000 / 120 = 500 ms, so the bass has half a second to recover before the next kick moves it again.

::figure duck

In the demo, change the release and listen for the setting where the bass swells back up just in time for each kick. Then switch to ducking only the low end and compare.

::demo sidechain

The second tool filters the key. A bus compressor that hears the full mix reacts mostly to the kick and bass, because the low end usually carries the most energy. A high-pass in the sidechain, often a switch marked SC HPF, makes the detector less sensitive to the lows. When the compressor does act, it still turns the whole bus down; the filter only changes what triggers it. A de-esser takes the same idea further. Its detector hears mainly the sibilance range, so it reacts to "s" and "t" and ignores the vowels. In wideband mode it then turns down the whole vocal, in split-band mode only the highs.

::figure detector

The third uses a key nobody hears. A silent copy of the kick, its output switched off but still feeding the sidechain, keeps a pad pumping through a breakdown where the real kick stops, or pumps it on a rhythm the kick never plays.

The fourth swaps the compressor for a gate, so the key opens the processor instead of pushing it down. Key a gate on a noise track from the snare and the noise sounds only with the snare hits, shaped by the gate's hold and release. A vocal keying a dynamic EQ band on the instruments is the same routing again. The [lesson on vocal pockets](/blog/the-mix-decision-that-makes-vocals-feel-expensive) builds that one step by step, and the [lesson on dynamic EQ and multiband compression](/blog/dynamic-eq-vs-multiband-compression) helps you pick the processor.

## DAW experiment: four keys, one session

1. Program a kick on every beat and a sustained bass note under it for four bars. Work out one beat in milliseconds: 60,000 divided by the tempo (500 ms at 120 BPM).
2. Insert a compressor on the bass and set its sidechain input to the kick. Use the fastest attack, a ratio of 4:1 or more, and lower the threshold until each kick pulls 6 to 8 dB of gain reduction.
3. Turn the release all the way up, then shorten it while watching the gain reduction meter. Stop where it returns to zero just before the next kick, and compare that setting with your beat length.
4. Duplicate the kick, set the copy's output to none or to an unused bus so you cannot hear it, and key the bass compressor from the copy. Delete two bars of the audible kick. The bass keeps moving through the gap.
5. On a drum or mix bus compressor, set about 3 dB of gain reduction in the busiest section. Switch on the sidechain high-pass, or put an EQ in the key path, at around 100 Hz, and watch the meter on the kicks.
6. Swap the bass compressor for a gate on a noise track, keyed from the snare. Set hold and release so the noise lasts about as long as the snare's body.

The release that fits the beat lets the bass swell back into each kick instead of sounding held down. With the key filtered, the bus compressor dips the whole mix less on each kick, so the cymbals and vocal pulse less with it.

## Common mistake: a key that moves when you mix

If the key is tapped after the kick's fader or its own compressor, every change you make to the kick changes how far the bass ducks. Ride the kick down 2 dB in the verse and the bass ducks less there, so it creeps up against the kick. Take the key before the fader where your DAW allows it, or use a ghost copy whose level never changes.

The other mistake is ducking the whole bass when only its lows collide with the kick. A full-band duck also dips the upper harmonics, the part of the bass line you hear on small speakers, so the whole note pumps. Key a low band instead, with a dynamic EQ or the low band of a multiband compressor, and the kick gets its room while the rest of the bass stays steady. The demo above lets you compare the two.

## Producer takeaway: say the sentence first

Before you open a sidechain menu, finish this sentence: when this happens, turn that down, by this much, and let it come back by then. "When the kick hits, turn the bass down 6 dB and let it back before the next beat" is a setting you can dial in. If you cannot fill in the first two blanks, you do not need the routing yet. When you can, the sentence already names the key, the track to process and the release.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Reiss, J. D., & McPherson, A. (2014). *Audio Effects: Theory, Implementation and Application*. CRC Press.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Sidechain lets one track control another | VGP Studio',
        description: 'A sidechain feeds one signal to the detector and turns down another. Set kick and bass release to the tempo, filter the key, and use ghost triggers.',
        keywords: ['sidechain compression', 'sidechain routing', 'kick and bass ducking', 'sidechain filter', 'de-esser', 'ghost trigger'],
    },
};
