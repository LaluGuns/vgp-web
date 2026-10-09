import { BlogArticle } from '../blog-data';

// Eight syllables of a vocal phrase; the fourth is a shout.
const AT = [0.03, 0.15, 0.27, 0.39, 0.51, 0.63, 0.75, 0.87];
const PHRASE = [0.4, 0.36, 0.42, 1, 0.38, 0.4, 0.36, 0.4];
const TRIMMED = [0.4, 0.36, 0.42, 0.5, 0.38, 0.4, 0.36, 0.4];
const COMP = { threshold: 0.3, ratio: 4, attack: 0.01, release: 0.2 };

export const post122: BlogArticle = {
    slug: 'clip-gain-and-automation-before-compression',
    title: 'Fix the loud word before the compressor hears it',
    excerpt: 'One shouted word can set how hard a vocal compressor works for the whole phrase. Trim outliers with clip gain first, then let the compressor handle the rest.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Lower single loud words with clip gain before the compressor, so its settings can be chosen for the phrase instead of the exception.',
        'A big outlier costs more than its own gain reduction: the release carries that reduction into the next words.',
        'Fader automation usually sits after the inserts, so use it for musical rides on the finished sound and clip gain for what the compressor should hear.',
    ],
    figures: {
        shout: {
            type: 'signal',
            caption:
                'Eight syllables through the same 4:1 compressor, drawn from a simulation. On its own, the shout gets most of its front edge past the attack, and the word after it starts while the compressor is still releasing, so that word peaks about 4 dB lower than it went in. Trim the shout 6 dB with clip gain first and the next word loses about 1.5 dB, close to the rest of the phrase.',
            alt: 'Three level plots of a vocal phrase with eight syllables. In the first, the fourth syllable stands far above the threshold line. In the second, the compressed phrase is drawn over the grey original, and the syllable after the shout sits clearly lower than its neighbours. In the third, the shout starts at half its height and every compressed syllable sits close to its original.',
            rows: [
                {
                    label: 'Raw phrase',
                    unipolar: true,
                    lines: [{ y: 0.3, label: 'Threshold' }],
                    traces: [{ kind: 'hits', at: AT, amp: PHRASE, decay: 20, outline: true }],
                },
                {
                    label: 'Compressor alone',
                    unipolar: true,
                    lines: [{ y: 0.3, label: 'Threshold' }],
                    traces: [
                        { kind: 'hits', at: AT, amp: PHRASE, decay: 20, outline: true, muted: true, label: 'Before' },
                        { kind: 'hits', at: AT, amp: PHRASE, decay: 20, outline: true, compress: COMP, label: 'After' },
                    ],
                },
                {
                    label: 'Clip gain -6 dB on the shout, then compressor',
                    unipolar: true,
                    lines: [{ y: 0.3, label: 'Threshold' }],
                    traces: [
                        { kind: 'hits', at: AT, amp: TRIMMED, decay: 20, outline: true, muted: true, label: 'Before' },
                        { kind: 'hits', at: AT, amp: TRIMMED, decay: 20, outline: true, compress: COMP, label: 'After' },
                    ],
                },
            ],
        },
        reduction: {
            type: 'bars',
            caption:
                'Static gain reduction at 4:1 with the threshold at -22 dBFS, computed as overshoot × (1 - 1/4). The shout at -8 dBFS takes 10.5 dB, more than three times what a normal word takes. After 6 dB of clip gain it takes 6 dB.',
            alt: 'Three bars on a scale from 0 to 12 dB. A normal word at -18 dBFS gets 3 dB of gain reduction. The shout at -8 dBFS gets 10.5 dB. The shout after 6 dB of clip gain gets 6 dB.',
            min: 0,
            max: 12,
            unit: 'dB',
            bars: [
                { label: 'Normal word, -18 dBFS', value: 3, display: '3 dB' },
                { label: 'Shout, -8 dBFS', value: 10.5, display: '10.5 dB' },
                { label: 'Shout after -6 dB clip gain', value: 6, display: '6 dB' },
            ],
        },
        path: {
            type: 'flow',
            caption:
                'The usual order of gain stages on a DAW channel. Clip gain changes what the compressor hears. The fader, and its automation, comes after the inserts in most DAWs, so it changes only what leaves the channel.',
            alt: 'Four steps from top to bottom: clip gain on the audio region, the insert compressor, fader automation, and the output to the bus.',
            steps: [
                { label: 'Clip gain on the region', note: 'Changes what every insert receives' },
                { label: 'Insert compressor', note: 'Reacts to whatever level arrives' },
                { label: 'Fader automation', note: 'Rides the finished sound' },
                { label: 'Out to the bus' },
            ],
        },
    },
    quiz: [
        {
            q: 'Threshold -22 dBFS, ratio 4:1. A shout peaks at -8 dBFS. You lower it 6 dB with clip gain. How much gain reduction does it now get?',
            options: ['10.5 dB', '6 dB', '4.5 dB', '8 dB'],
            answer: 1,
            why: 'The shout now peaks at -14 dBFS, 8 dB over the threshold. At 4:1 the compressor removes 8 × 3/4 = 6 dB.',
        },
        {
            q: 'A vocal compressor handles one shout fine, but the word right after it sounds ducked. What is the most likely cause?',
            options: [
                'The ratio is too low to catch the shout in time',
                'The knee is too soft, so compression starts early',
                'The release is still recovering from the shout',
                'The makeup gain is set too high for the phrase',
            ],
            answer: 2,
            why: 'The shout triggered a lot of gain reduction, and the release takes time to bring it back. Any word that starts during that recovery is turned down along with it.',
        },
        {
            q: 'Why does riding the channel fader usually not change how hard an insert compressor works?',
            options: [
                'The fader comes after the inserts on most DAW channels',
                'Fader automation is read only once per bar by the DAW',
                'Compressors ignore any change smaller than about 3 dB',
                'The fader changes loudness but leaves the peaks alone',
            ],
            answer: 0,
            why: 'In most DAWs the inserts sit before the fader, so the compressor has already reacted by the time the fader moves. Clip gain or a gain plugin before the compressor changes what it hears.',
        },
    ],
    content: `## Hook: one word sets the compressor

The verse sits well until the singer leans into one word. That word jumps out, so you pull the threshold down until the meter catches it. Now the shout is under control and the rest of the verse sounds flat and pressed, with the word after the shout sounding as if someone briefly turned the vocal down.

A compressor has one set of rules for the whole track. When a single event is far louder than everything else, the rules you set for it are wrong for the rest of the performance, and the rules that suit the performance do little to the event.

## Why it matters: outliers cost more than their own gain reduction

The detector does not know which word is a mistake and which is the performance. It reacts to level. Give it a phrase of words around -18 dBFS and one shout at -8 dBFS, and you have two problems that need different settings.

Set the threshold for the phrase and the shout gets hammered. Set it for the shout and the phrase passes untouched. A middle setting does a bit of both, and it has a side effect in time: the gain reduction the shout triggers has to recover through the release, and the words that follow are turned down while it does.

::figure shout

The demo uses a drum loop, but the release behaves the same way on a vocal. Pull the threshold down until the meter moves, then lengthen the release and listen to what happens to the sound between hits.

::demo compressor

## Science model: overshoot, then recovery

Above the threshold, a hard-knee compressor's target gain reduction is the overshoot times $1 - 1/R$, where $R$ is the [ratio](/blog/compression-ratio-what-4-to-1-actually-means). With the threshold at -22 dBFS and a 4:1 ratio, a normal word at -18 dBFS is 4 dB over and gets 3 dB of reduction. The shout at -8 dBFS is 14 dB over and gets 10.5 dB.

::figure reduction

The release then decides how long that reduction lasts. A common digital design smooths the gain reduction in decibels with a one-pole filter (Giannoulis, Massberg and Reiss, 2012), so after the peak it falls back exponentially:

$$GR(t) = GR_0 \\, e^{-t/\\tau_r}$$

Solve for the time it takes to drop to 1 dB and you get $t = \\tau_r \\ln(GR_0)$, with $GR_0$ in decibels. From 3 dB that is about $1.1\\,\\tau_r$. From 10.5 dB it is about $2.35\\,\\tau_r$, more than twice as long. With a 100 ms release time constant, the shout keeps the vocal more than 1 dB down for about 235 ms, against about 110 ms after a normal word. Any word that starts inside that window is turned down for something it did not do. Trim the shout by 6 dB first and it takes 6 dB of reduction, which clears in about 180 ms.

Clip gain changes the input to that whole calculation. It is a fixed gain on one region of audio, applied before any insert, so the compressor never sees the shout at full level. The compressor's job shrinks back to the moment-to-moment movement of the phrase, which is what it is good at.

## DAW experiment: trim, compress, then ride

Pick a vocal take with one or two words that jump out.

1. Insert a compressor on the vocal and set it the way you normally would, threshold pulled down until the loudest word is controlled. Bounce or record four bars as version A.
2. Bypass the compressor. Find the words that peak well above the rest of the phrase and lower each one with clip gain until its peak sits near the others. Split the region at the word's edges, in a breath or a consonant, so the gain change does not click. If your DAW has no clip gain, put a gain plugin first in the chain and automate that instead.
3. Re-enable the compressor and raise the threshold until the meter shows a few dB of reduction on the phrase as a whole. Bounce version B.
4. Match the loudness of A and B with a gain plugin on the playback tracks.
5. Listen to the word right after each trimmed outlier, and to the breaths and consonants across the phrase.
6. Play B with the full mix and add fader automation only where a line needs to sit higher or lower for the song: a chorus line lifted, a pickup tucked in.

Version B usually keeps more of the singer's articulation, because the compressor is doing less and doing it evenly. If B sounds too even, the clip gain went too far; leave the outliers a little louder than the phrase.

## Common mistake: fixing a one-off with a global setting

The reflex when a word jumps out is to lower the threshold or raise the ratio. Both settings apply to every word in the take, so you change the whole performance to manage one moment. A fast limiter in front of the compressor can catch the shout, but it reacts to level too, so it also grabs any other word that crosses its threshold and squashes the front edge of the shout where clip gain would simply lower the whole word.

The other mistake is reaching for fader automation to tame a word before the compressor. On most DAW channels, as on a console, the inserts come before the fader (Izhaki, 2023), so the compressor has already reacted by the time the fader moves.

::figure path

## Producer takeaway: split the work by what each tool sees

Clip gain is for events: the shout, the plosive that peaks high, the line sung further from the mic. Fix those first, before any processing, so the compressor hears a performance that is already roughly even. The compressor then handles the fast, repeated movement no hand could follow. Fader automation comes last and serves the song: which line leads, which word sits back. I would rather spend the time on a clip gain pass and run a lighter compressor than ask one compressor to manage both the shouts and the whispers. Judge each step at matched level, as the [lesson on loudness bias](/blog/why-louder-is-not-always-bigger) explains.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Izhaki, R. (2023). *Mixing Audio: Concepts, Practices, and Tools* (4th ed.). Focal Press.
`,
    seo: {
        title: 'Clip gain before compression on vocals | VGP Studio',
        description: 'One loud word can set how hard a vocal compressor works. Trim outliers with clip gain first, then compress, then ride the fader for the song.',
        keywords: ['clip gain', 'vocal compression', 'gain automation', 'compressor release', 'vocal mixing', 'gain staging'],
    },
};
