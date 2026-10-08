import { BlogArticle } from '../blog-data';

// A plot 50 ms wide. The voice reaches the singer through the head at t = 0.1.
const HEAD = { kind: 'hits' as const, at: [0.1], decay: 22, cycles: 30, label: 'Through the head' };

export const post050: BlogArticle = {
    slug: 'how-headphone-balance-changes-performance',
    title: 'Headphone balance changes the take',
    excerpt: "A singer tunes and times against what the headphones tell them. Set their own voice, the reverb and the latency in the cue before you blame the take.",
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'While singing, the cue is the only reference a singer has for pitch and timing, so a misleading cue gives you a misleading take.',
        'Closed headphones make a singer\'s own voice sound boomy, and monitoring through the DAW makes it arrive late.',
        'Build the cue from the dry voice up, keep latency low, and add reverb only if the singer asks for it.',
    ],
    seo: {
        title: 'Headphone Balance Changes the Take | VGP Studio',
        description: 'A headphone cue mix shapes a singer\'s pitch and timing. Learn how own-voice level, reverb, occlusion and monitoring latency affect a vocal take.',
        keywords: ['headphone mix', 'cue mix', 'monitoring latency', 'buffer size', 'recording vocals', 'intonation'],
    },
    figures: {
        arrivals: {
            type: 'signal',
            caption:
                'The start of a sung note as the singer hears it, in a plot 50 ms wide. The voice reaches them through the head at once. With direct monitoring the headphone copy lands almost with it. Through a 256-sample buffer at 48 kHz it lands about 10.7 ms later, so they hear their voice twice.',
            alt: 'Two plots of a short burst heard twice. In the first, the headphone burst starts almost on top of the burst through the head. In the second, the headphone burst starts clearly later.',
            rows: [
                {
                    label: 'Direct monitoring',
                    traces: [HEAD, { ...HEAD, at: [0.11], amp: [0.75], dashed: true, label: 'Headphones' }],
                },
                {
                    label: 'Through a 256-sample buffer',
                    traces: [HEAD, { ...HEAD, at: [0.313], amp: [0.75], dashed: true, label: 'Headphones' }],
                },
            ],
        },
        buffers: {
            type: 'bars',
            min: 0,
            max: 45,
            unit: 'ms',
            caption:
                'Delay added by the input and output buffers alone at 48 kHz: two buffers of N samples, each lasting N / 48,000 seconds. Converters and drivers add a little more, so check the round-trip figure your DAW reports.',
            alt: 'Bars of round-trip buffer delay at 48 kHz: 2.7 ms at 64 samples, 5.3 ms at 128, 10.7 ms at 256, 21.3 ms at 512 and 42.7 ms at 1024.',
            bars: [
                { label: '64 samples', value: 2.7 },
                { label: '128 samples', value: 5.3 },
                { label: '256 samples', value: 10.7 },
                { label: '512 samples', value: 21.3 },
                { label: '1024 samples', value: 42.7 },
            ],
        },
    },
    quiz: [
        {
            q: 'At 48 kHz, what delay do a 256-sample input buffer and a 256-sample output buffer add, before converter time?',
            options: ['About 2.7 ms', 'About 5.3 ms', 'About 10.7 ms', 'About 21.3 ms'],
            answer: 2,
            why: 'One buffer lasts 256 / 48,000 seconds, about 5.3 ms. Monitoring through the DAW passes through two of them, so about 10.7 ms.',
        },
        {
            q: 'Why do many singers slide one earcup off?',
            options: [
                'To keep the click on one side and their voice on the other',
                'To stop closed headphones distorting at singing levels',
                "To cut the cue's latency by hearing half of it in the room",
                'To hear their own voice without the boom of a sealed ear',
            ],
            answer: 3,
            why: 'Sealing the ear canal traps the low end of the voice conducted through the head, the occlusion effect. One open ear gives back the sound they are used to.',
        },
        {
            q: 'Why can a big reverb in the cue make pitch worse even when the singer likes it?',
            options: [
                'It blurs each note into the last, so small slips go unheard',
                'Its modulation detunes the voice, so the singer tunes to it',
                'It delays the dry voice in the cue by its pre-delay time',
                'It masks the backing, so the singer loses the key of the song',
            ],
            answer: 0,
            why: 'A reverb does not delay the dry voice, but its tail smears every note into the next. The singer loses the clear reference they need to hear and fix small errors.',
        },
    ],
    content: `## Hook: fine in the warm-up, lost in the take

The singer warms up in the booth and sounds great. You hit record, the backing track starts, and the performance comes apart. Some notes go flat, the high ones get pushed and sharp, and the phrasing drags behind the beat. You stop and ask for more focus on the tuning. The next take is the same, and you start planning hours of pitch correction.

Often the headphones are the problem. While singing, what comes through the headphones is the only reference a singer has for pitch and timing. Give them a misleading reference and they follow it.

## Why it matters: the cue is the singer's reference

The most common fault is the balance. If the backing is loud and the singer's own voice is quiet, they cannot hear themselves, so they push harder and tune less accurately. That loop is covered in [Why a great vocal starts before the microphone](/blog/why-a-great-vocal-starts-before-the-microphone).

The second is reverb. A large reverb on the cue vocal sounds flattering, which is why singers ask for it. It also blurs the start and the pitch of every note into the tail of the last one, so the singer cannot hear small pitch slips or timing drift, and errors they cannot hear do not get corrected.

The third is easy to miss because the engineer in the control room does not hear it: the singer's own voice arriving late in their headphones.

## Science model: how a singer hears themselves

A singer hears their voice by two routes at once: through the air into the ears, and through the bones of the head. Both are effectively instant. Headphones change both routes. Closed-back headphones seal the ear canal and trap the low frequencies conducted through the head, so the singer's voice sounds boomy and muffled to them. This is the occlusion effect, the reason your voice sounds different with your fingers in your ears. It is why many singers slide one earcup off: it gives them back the open-ear sound of their own voice.

The headphones add a third route, the mic signal coming back through the interface. If the backing masks it, the singer loses their best reference. When singers' hearing of their own voice was masked with noise, their intonation got worse (Mürbe and colleagues, 2002).

If that route passes through the DAW, it is also late. A buffer of $N$ samples at sample rate $f_s$ holds this much time:

$$t = \\frac{N}{f_s}$$

Monitoring through the DAW passes through an input buffer and an output buffer, so a 256-sample buffer at 48 kHz adds about 2 × 5.3 = 10.7 ms before converter time. The singer hears their voice twice, instantly inside the head and late in the headphones. Small delays change the tone of the combined sound through comb filtering. Longer ones sound like a slap echo and pull the timing.

::figure arrivals

Performers differ in how much of this they tolerate. In listening tests with players of several instruments, Lester and Boley (2007) found the acceptable latency ranged from 42 ms down to possibly less than 1.4 ms, depending on the instrument and the monitoring, and in-ear monitors were less forgiving than floor wedges. Closed headphones in a booth are closer to the in-ear case.

::figure buffers

::demo latency

## DAW experiment: build the cue from the voice up

1. Create a dedicated cue bus fed by pre-fader sends. Do not send the singer the main mix.
2. Turn on direct monitoring on your interface, or set the buffer to 64 or 128 samples while tracking, and bypass plugins that add latency on the record path, such as lookahead limiters and linear-phase EQ.
3. Start with only the singer's mic in the cue, dry, and let them set a comfortable headphone level while singing on their own.
4. Bring the backing up under the voice until they can pitch and time against it, not until it sounds like the finished record.
5. If they ask for reverb, add a short plate on a send at a low level, with a decay under about 1.5 seconds.
6. Record a take. Then offer the one-ear-off option, turn down that side of the cue so it does not leak into the mic, and record another. Compare the held notes and the timing.

Built this way, the cue usually lets a singer lock onto pitch and pocket in fewer takes than the full mix with a big reverb does.

## Common mistake: a big reverb and a heavy session

The common mistake is loading a large reverb on the monitor vocal so the singer feels good. It works, in the sense that they like what they hear, and it hides exactly the slips you will be fixing later.

The other is tracking into a mix session full of plugins at a large buffer. At 1024 samples, monitoring through the DAW adds over 40 ms, which a singer feels as dragging behind the beat. Use direct monitoring or a small buffer while recording, and if the session is too heavy, bounce the backing to a stereo file and track against that.

## Producer takeaway: check the headphones before the singer

Before you blame the singer, put their headphones on and listen. Their own voice should be clear above the track, dry or nearly dry, and on time. Give them the choice of one ear off. A singer who can hear themselves accurately sings more accurately, and you spend the session recording instead of repairing.

## References

- Lester, M., & Boley, J. (2007). The effects of latency on live sound monitoring. *Audio Engineering Society Convention 123*, paper 7198.
- Mürbe, D., Pabst, F., Hofmann, G., & Sundberg, J. (2002). Significance of auditory and kinesthetic feedback to singers' pitch control. *Journal of Voice*, 16(1), 44-51.
`,
};
