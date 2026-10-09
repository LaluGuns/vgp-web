import { BlogArticle } from '../blog-data';

// Round trip through two buffers at 48 kHz: 2 × N / 48,000 seconds.
const roundTrip = (n: number) => (2 * n * 1000) / 48000;

export const post098: BlogArticle = {
    slug: 'why-latency-changes-performance-feel',
    title: 'Latency changes how a take feels',
    excerpt: 'A few milliseconds of monitoring delay can make a good player sound stiff. Track at a small buffer or with direct monitoring, and raise the buffer again to mix.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'One buffer takes its size divided by the sample rate. Monitoring through the DAW costs at least two buffers, plus converters and plugins.',
        'Singers notice small monitoring delays most, because they also hear their own voice through the skull.',
        'Track at 64 or 128 samples with light plugins, or use direct monitoring, and raise the buffer again for mixing.',
    ],
    figures: {
        trip: {
            type: 'flow',
            caption:
                'The monitoring round trip. The sound waits for one buffer on the way in and another on the way out, so the round trip is at least twice the buffer time, plus the converters and any plugin delay.',
            alt: 'Five steps in a row: input converter, input buffer of N samples, plugins, output buffer of N samples, output converter to the headphones.',
            steps: [
                { label: 'Input converter', note: 'Voice or guitar becomes samples' },
                { label: 'Input buffer', focus: true, note: 'N samples' },
                { label: 'Plugins', note: 'Look-ahead adds more' },
                { label: 'Output buffer', focus: true, note: 'N samples' },
                { label: 'Output converter', note: 'Back to the headphones' },
            ],
        },
        buffers: {
            type: 'bars',
            caption:
                'Round-trip delay from the two buffers alone at 48 kHz. A 128-sample buffer costs about as much delay as standing 2 m from your amp. Converters and plugins add to every buffer figure.',
            alt: 'Bars for five buffer sizes at 48 kHz: 64 samples 2.7 ms, 128 samples 5.3 ms, 256 samples 10.7 ms, 512 samples 21.3 ms, 1024 samples 42.7 ms. A dimmed bar at 5.8 ms shows the delay of hearing an amp from 2 m away.',
            min: 0,
            max: 45,
            unit: 'ms',
            bars: [
                ...[64, 128].map((n) => ({ label: `${n} samples`, value: roundTrip(n), display: `${roundTrip(n).toFixed(1)} ms` })),
                { label: 'Amp 2 m away, through air', value: 5.8, display: '5.8 ms', dim: true },
                ...[256, 512, 1024].map((n) => ({ label: `${n} samples`, value: roundTrip(n), display: `${roundTrip(n).toFixed(1)} ms` })),
            ],
        },
    },
    quiz: [
        {
            q: 'What is the delay of one 256-sample buffer at 48 kHz?',
            options: ['2.7 ms', '5.3 ms', '10.7 ms', '25.6 ms'],
            answer: 1,
            why: '256 / 48,000 = 0.0053 s. Monitoring through the DAW needs an input and an output buffer, so the round trip is at least 10.7 ms.',
        },
        {
            q: 'A singer says their voice sounds phasey in the headphones at a 256-sample buffer. What is the most direct fix?',
            options: [
                'Add reverb to the singer\'s headphone mix',
                'Raise the buffer size to 1024 samples',
                'Use the interface\'s direct monitoring',
                'Turn the click up in the headphone mix',
            ],
            answer: 2,
            why: 'Direct monitoring sends the input to the headphones before it reaches the computer, so the buffers and plugins are skipped. A singer hears their voice through the skull at once, so any delay in the headphones stands out.',
        },
        {
            q: 'Why does plugin delay compensation not fix monitoring latency?',
            options: [
                'It works at 44.1 kHz but not at higher rates',
                'It doubles the buffer size while it is active',
                'It skips plugins that report their latency',
                'It cannot make a live input arrive earlier',
            ],
            answer: 3,
            why: 'Compensation delays everything else to match the slowest path. A live input cannot be moved earlier, so any plugin latency on the monitored path reaches the performer.',
        },
    ],
    content: `## Hook: the guitarist who keeps rushing

You are recording a guitarist on a tight rhythm part. They seem locked in while they play, but on playback the notes sit ahead of the beat. You ask them to lay back. The second take is just as stiff, and you start to wonder about their timing.

Often the player is fine and the headphones are late. They hear their own guitar a few milliseconds after they play it, and their body adjusts to that delay without being asked.

## Why it matters: players hear and feel at the same time

When you play or sing, you expect the sound at the moment you make it. You feel the pick hit the string or the voice in your throat, and you hear the result. A singer hears their own voice through the bones of the skull almost instantly, so in headphones even a small delay on the monitored voice mixes with that inner sound and turns it phasey and distant. Instrumentalists usually tolerate more. A guitarist standing 2 m from an amp already hears it about 6 ms late, because sound travels about 34 cm per millisecond.

When the delay grows past what feels natural, players compensate. In tapping experiments, delaying the sound of each tap makes people tap further ahead of the beat, and the shift grows with the delay (Aschersleben and Prinz, 1997). Other players stiffen up and play carefully instead. Either way the take loses its ease, and if you judge a performance under heavy monitoring latency, you are judging the player's fight with the delay.

::demo latency

## Science model: buffers, round trips and plugins

Most monitoring latency comes from the audio driver's buffer, the block of samples the computer collects before it processes them. One buffer takes

$$t = \\frac{N}{f_s}$$

seconds, where $N$ is the buffer size in samples and $f_s$ the sample rate. At 48 kHz, 64 samples take 1.3 ms and 1024 samples take 21.3 ms. The same buffer size at 96 kHz takes half as long.

Monitoring through the DAW is a round trip. The sound passes through the input converter, an input buffer, your plugins, an output buffer and the output converter before it reaches the headphones.

::figure trip

The two buffers alone make the round trip at least twice the one-buffer figure: 2.7 ms at 64 samples, 42.7 ms at 1024. Converters and driver safety buffers add a little more. Your DAW or the interface's control panel shows the real total.

::figure buffers

Plugins add their own delay on top. A look-ahead limiter has to see the signal before it acts on it, and a linear-phase EQ or a heavily oversampled plugin can add tens of milliseconds. Delay compensation keeps the playback tracks lined up with each other, but it cannot make a live input arrive any earlier, so every bit of plugin delay on the monitored path lands in the performer's ears.

## DAW experiment: feel the buffer

1. Set the session to 48 kHz and the buffer to 64 samples. Note the round-trip latency the DAW or interface reports.
2. Arm a track with software monitoring on, start a click at 90 BPM and record four bars of steady eighth notes: hand claps into a mic, a muted guitar or a drum pad.
3. Set the buffer to 1024 samples. The reported round trip should now be over 40 ms. Record the same four bars on a new track.
4. Put a linear-phase EQ or a mastering limiter on the master bus, check the reported latency again and record a third take.
5. Turn off software monitoring, switch on your interface's direct monitoring and record a fourth take.
6. Compare how each take felt to play, then zoom in and see where the transients sit against the grid.

The high-latency takes feel sluggish to play, and they tend to drift against the click or sound careful. The direct-monitored take feels like playing an acoustic instrument.

## Common mistake: tracking through the mastering chain

The most common tracking mistake is leaving the master bus loaded with a limiter, a linear-phase EQ or a tape emulation while recording. The rough mix sounds great, and the performer is playing through every millisecond of look-ahead those plugins need. A 64-sample buffer does not help when one plugin on the master adds more delay than the buffer does. Bypass high-latency plugins while you track, or use your DAW's low-latency monitoring mode if it has one, and bring them back for mixing.

## Producer takeaway: track for speed, mix for quality

Treat tracking and mixing as two different setups. While recording, keep the buffer at 64 or 128 samples, monitor through light plugins and leave the heavy processing for later. If the computer cannot keep up at a small buffer, or the singer still feels the delay, monitor through the interface's direct monitoring, which skips the computer entirely. Raise the buffer again when you start mixing. There, latency hardly matters and stability does.

## References

- Aschersleben, G., & Prinz, W. (1997). Delayed auditory feedback in synchronization. *Journal of Motor Behavior*, 29(1), 35-46.
`,
    seo: {
        title: 'Latency changes how a take feels | VGP Studio',
        description: 'How buffer size and sample rate set monitoring latency, why singers feel it first, and how to set up a session for tracking without lag.',
        keywords: ['audio latency', 'buffer size', 'round-trip latency', 'direct monitoring', 'tracking setup', 'plugin delay compensation'],
    },
};
