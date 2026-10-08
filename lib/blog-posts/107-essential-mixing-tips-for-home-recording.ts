import { BlogArticle } from '../blog-data';

export const post107: BlogArticle = {
    slug: 'essential-mixing-tips-for-home-recording',
    title: 'Mixing rap vocals recorded at home',
    excerpt: 'A vocal chain for home recordings, in the order that works: clean-up EQ, de-essing, two gentle compressors, tone, then reverb and delay timed to the beat.',
    category: 'production-tips',
    publishedAt: '2026-01-28',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Most home vocal problems are recorded in, so record close to the mic in the softest corner you have before you reach for plugins.',
        'Clean first, then control: high-pass, cut what sounds bad in context, de-ess, then let two compressors each do a little.',
        'Time delays to the tempo, 60,000 divided by the BPM for a quarter note in milliseconds, and filter the reverb so space never turns into mud.',
    ],
    figures: {
        chain: {
            type: 'flow',
            caption: 'The vocal chain in order. Each stage hands a cleaner signal to the next, so the compressors react to the voice rather than to rumble or sharp S sounds.',
            alt: 'Five steps in a row: clean-up EQ, de-esser, two compressors, tone, and sends to reverb and delay.',
            steps: [
                { label: 'Clean-up EQ', note: 'High-pass, cut boxiness' },
                { label: 'De-esser', note: 'Tame S and T sounds' },
                { label: 'Two compressors', note: 'Fast for peaks, slower to level' },
                { label: 'Tone', note: 'Presence, air, saturation' },
                { label: 'Sends', note: 'Reverb and delay' },
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
                { label: 'Dotted eighth', value: 321.4, display: '321.4 ms' },
                { label: 'Eighth', value: 214.3, display: '214.3 ms' },
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
            q: 'Why use two gentle compressors instead of one working hard?',
            options: [
                'Each does a little, so neither pumps the voice',
                'Two in a row make the vocal sound louder overall',
                'The second one removes the distortion of the first',
                'Two stages let you skip the de-esser entirely',
            ],
            answer: 0,
            why: 'The fast one catches the peaks, so the slow one is not thrown around by them and can level the performance smoothly. Neither has to work hard enough to be heard.',
        },
    ],
    content: `## Fix it before the mix

Most problems in a home vocal are recorded in, and the room causes more of them than the microphone does. A small, bare room adds short reflections that blur the words, and no plugin removes them cleanly. Record in the softest spot you have: a closet full of clothes, a duvet hung behind you, curtains and a sofa nearby. Stay close to the mic, about a hand's width away, with a pop filter in between.

Being close has a side effect. Most vocal mics are directional, and a directional mic boosts the bass as the source gets closer, the proximity effect. That is one reason the chain below starts with a filter.

Set the input so your loudest words peak well below 0 dBFS. At 24-bit, peaks around -10 dBFS leave plenty of headroom and still sit far above the noise of the interface. A take that clipped on the way in cannot be repaired later.

## The chain, in order

The order matters more than the brand of each plugin.

::figure chain

## Clean up: filter, cut, de-ess

**High-pass filter.** Rumble from footsteps, traffic, the mic stand and the proximity boost sits below the voice. Start a high-pass filter around 80 Hz and raise it until the voice begins to sound thin, then back it off a little. A deep voice may need it lower.

**Cut what sounds bad in context.** Boxiness often sits around 300 to 500 Hz and harshness around 2 to 4 kHz, but every voice and room is different. To find a problem, boost a narrow band by 8 to 10 dB and sweep it slowly. Stop where the problem jumps out, then turn the boost into a cut of 2 to 4 dB. Work quickly and check with the beat playing: after a few minutes of sweeping boosts, almost everything starts to sound wrong.

::figure eq

**De-esser.** S, T and Ch sounds, the sibilants, carry a lot of high-frequency energy, usually somewhere between 4 and 10 kHz depending on the voice. Put a de-esser before the main compression so the compressor does not clamp down every time an S arrives, and set it so the loudest S sounds drop by a few dB. Too much and the voice sounds like it has a lisp. If compression brings the S sounds back up, a second, gentle de-esser after it can catch them.

## Control: two compressors, each doing a little

One compressor working hard on a rap vocal tends to pump and flatten the delivery. Two working gently sound more natural, because each one does only part of the job.

1. **Peak catcher.** A fast compressor, FET-style if you have one. Ratio 4:1, attack under 1 ms, release around 50 to 100 ms. Set the threshold so only the loudest words get 2 to 4 dB of gain reduction.
2. **Leveler.** A slower compressor, optical-style if you have one. Ratio 2:1 to 3:1, attack around 10 ms, release around 100 ms or auto. Aim for 2 to 3 dB of steady gain reduction through the verse.

Because the first stage has already caught the peaks, the second is not thrown around by them and can ride the overall level smoothly. Compare against the bypassed vocal at matched loudness. Louder almost always sounds better at first, so makeup gain can hide a setting that made the vocal worse. There is more on this in [Compression changes motion before level](/blog/how-compression-changes-motion-not-level).

## Tone: presence, air and saturation

Shape the tone only now, once the clean-up has removed what you would otherwise be boosting.

- If the words get lost in the beat, a broad boost of 1 to 3 dB somewhere around 3 to 5 kHz brings the consonants forward. Often the better fix is a cut in the beat where the vocal needs room, as explained in [why vocals drown even when the fader goes up](/blog/masking-why-vocals-drown-even-when-fader-goes-up).
- A high shelf of 1 to 2 dB above about 10 kHz adds air. Check afterwards that the S sounds have not come back.
- Gentle saturation adds harmonics, which makes the vocal sound denser and helps it read on small speakers. Drive it lightly and level-match before you judge it.

## Space: reverb and delay on the beat

A completely dry vocal can sound pasted on top of the beat. Use sends, so one reverb and one delay serve every vocal track.

**Reverb.** A plate is a common choice for vocals: bright and dense. Keep the decay short for rap, under about 1.5 seconds, and longer for sung hooks. Filter the reverb return with a high-pass around 200 to 300 Hz and a low-pass around 6 to 8 kHz, so it adds space without mud or extra sibilance. A short pre-delay of a few tens of milliseconds keeps the start of each word dry and clear.

**Delay.** Time it to the tempo so the echoes land on the grid. A quarter note in milliseconds is:

$$t_{\\text{quarter}} = \\frac{60\\,000}{\\text{BPM}}$$

Halve it for an eighth note, halve again for a sixteenth, and multiply the eighth by 1.5 for a dotted eighth.

::figure delays

A sixteenth at 140 BPM, 107 ms, works as a slapback: one short echo that thickens the voice without washing it out. Longer delays work best as throws. Automate the send up on the last word of a line so it echoes into the gap, then bring it back down.

## The vocal bus and the last check

Route the lead, doubles and ad-libs to one vocal bus. A little bus compression, 2:1 with a slow attack and about 1 dB of gain reduction, helps them sit together. Then check:

- The high-pass is on every vocal track, not only the lead.
- The S sounds are under control at loud and at quiet playback.
- The reverb and delay returns are filtered.
- If someone else will master the song, the mix peaks a few dB below 0 dBFS with no limiter on the mix bus.

Inside a 32-bit float DAW the faders do not clip, but a 24-bit bounce and your audio interface do, so that last margin matters.
`,
    seo: {
        title: 'Mixing rap vocals recorded at home | VGP Studio',
        description: 'A home vocal chain in order: recording level, high-pass and clean-up EQ, de-essing, serial compression, tone, and reverb and delay timed to the tempo.',
        keywords: ['home recording', 'mixing vocals', 'rap vocal chain', 'vocal EQ', 'serial compression', 'delay time calculator'],
    },
};
