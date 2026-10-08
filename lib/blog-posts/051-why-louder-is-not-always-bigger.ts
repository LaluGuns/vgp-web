import { BlogArticle } from '../blog-data';

export const post051: BlogArticle = {
    slug: 'why-louder-is-not-always-bigger',
    title: 'Why louder is not always bigger in a mix',
    excerpt: 'A plugin that adds one decibel sounds like an upgrade even when it changes nothing else. Level-match every A/B so you keep only the moves that help.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'A version that is about 1 dB louder tends to sound fuller and better, so an A/B that is not level-matched tells you nothing about the processing.',
        'At moderate levels, 10 dB more sounds roughly twice as loud, and the low end grows fastest, which is why louder reads as bigger.',
        'Match loudness within a fraction of a decibel before every bypass test, and mix at one fixed monitoring level.',
    ],
    figures: {
        bias: {
            type: 'flow',
            caption:
                'How loudness bias builds up in a session. Each step feels like an improvement, but what you keep rewarding is level, and the headroom shrinks every round.',
            alt: 'Four steps in a loop: insert a compressor, EQ or saturator, its output comes out slightly louder, the A/B sounds better, you keep it and add the next plugin, then back to the first step.',
            steps: [
                { label: 'Insert a compressor, EQ or saturator' },
                { label: 'Output comes out a little louder', note: 'Sometimes by less than 1 dB' },
                { label: 'A/B: it sounds better', note: 'Fuller, closer, more exciting' },
                { label: 'Keep it and add the next plugin' },
            ],
            loop: { to: 0, label: 'Headroom shrinks each round' },
        },
        sones: {
            type: 'bars',
            caption:
                'Perceived loudness for a level rise, from the rule that 10 dB more sounds about twice as loud. One extra decibel makes a sound only about 7 percent louder, close to the smallest change most people can detect.',
            alt: 'Four bars on a scale from 1 to 2 times as loud. Plus 1 dB is 1.07 times, plus 3 dB is 1.23 times, plus 6 dB is 1.52 times and plus 10 dB is 2 times.',
            min: 1,
            max: 2,
            bars: [
                { label: '+1 dB', value: 1.07, display: '1.07 ×' },
                { label: '+3 dB', value: 1.23, display: '1.23 ×' },
                { label: '+6 dB', value: 1.52, display: '1.52 ×' },
                { label: '+10 dB', value: 2, display: '2 ×' },
            ],
        },
    },
    quiz: [
        {
            q: 'A plugin raises the output by 1 dB. By the 10 dB rule of thumb, how much louder does it sound?',
            options: ['About 7 percent louder', 'About 10 percent louder', 'About 12 percent louder', 'About 26 percent louder'],
            answer: 0,
            why: 'Loudness doubles for every 10 dB, so 1 dB gives 2 to the power 0.1, about 1.07. That is small enough to be heard as "better" rather than "louder".',
        },
        {
            q: 'Why does a slightly louder version tend to sound fuller, not only louder?',
            options: [
                'Plugins add harmonics as soon as their output gain is raised',
                'Louder signals seem to spread wider across the stereo field',
                'A gain rise lifts the upper harmonics more than the fundamental',
                'Loudness in the bass grows faster with level than in the mids',
            ],
            answer: 3,
            why: 'The equal-loudness contours bunch together in the bass, so a small rise in level adds more perceived low end than midrange.',
        },
        {
            q: 'At matched loudness you cannot pick the compressed version in a blind test. What does that tell you?',
            options: [
                'It needs more makeup gain before the difference is audible',
                'The compressor is not helping, so ease off or remove it',
                'The attack should be faster so it reaches the transients',
                'The monitors need turning up until the compression shows',
            ],
            answer: 1,
            why: 'Once level is out of the comparison, only the processing is left. If you cannot hear it helping, it is not earning its place.',
        },
    ],
    content: `## Hook: the one-decibel upgrade

You load a compressor on a lead vocal, nudge the output up and the performance suddenly sounds warmer and closer. The same thing happens on drums, pads and the master bus. Every time a new plugin adds a little gain, your brain registers an upgrade.

A few minutes later the effect wears off, so you reach for the next plugin. By the end of the session the master meter is pinned, the headroom is gone and the mix sounds flat and crowded. Nothing got bigger. Everything got louder, and your ears kept rewarding the level.

## Why it matters: you keep rewarding level

When you compare a processed sound with its bypassed version and the processed one is louder, the comparison is rigged. You will keep a setting because it is louder, even if it added a harsh resonance or flattened the transients. Across a full session the small gains add up, and you end up pulling the master fader down or squashing the stereo bus with a limiter to make room.

::figure bias

Try it yourself. One side of this test is 1 dB louder. Pick the one you prefer before you check which it was.

::demo loudness-bias

## Science model: how level turns into loudness

Perceived loudness does not follow level in a straight line. Stevens (1955) found that, at moderate levels, loudness grows as a power of sound intensity, which works out to a handy rule of thumb: 10 dB more sounds about twice as loud. For a level change $\\Delta L$ in decibels, the loudness ratio is roughly:

$$\\frac{N_2}{N_1} = 2^{\\Delta L / 10}$$

Here $N$ is loudness in sones. One extra decibel gives $2^{0.1} \\approx 1.07$, a sound about 7 percent louder. The smallest level change most people can detect is roughly 0.5 to 1 dB (Moore, 2012), so a 1 dB jump sits right at the edge of what you notice as louder. It tends to register as fuller or clearer instead.

::figure sones

The fullness has a cause. The ear is not equally sensitive at all frequencies, and the shape of that sensitivity changes with level, as the equal-loudness contours show (Fletcher and Munson, 1933; ISO 226:2023). In the bass the contours bunch together, so loudness there grows faster with level than in the midrange. Turn a mix up a little and the low end seems to grow more than the rest. That is why louder so easily reads as bigger.

## DAW experiment: the level-matched bypass test

This takes ten minutes and shows you how strong the bias is on your own material.

1. Insert a compressor on a vocal or a drum bus. Set the ratio to 4:1, attack 10 ms, release 100 ms, and lower the threshold until you see 4 to 6 dB of gain reduction. Turn off any auto makeup gain.
2. Put a loudness meter after the compressor and loop the loudest eight bars. Note the short-term loudness with the compressor bypassed.
3. Enable the compressor and raise the makeup gain until the reading matches the bypassed one within 0.2 LU.
4. Now add 1 dB more makeup gain and toggle bypass a few times. Notice which version you prefer.
5. Remove that extra 1 dB. Ask someone to toggle bypass for you, or toggle until you lose track, and pick the better version with your eyes closed. Do ten rounds and write down your picks.
6. If you could not pick the compressed version reliably, raise the threshold or lower the ratio until you can hear it helping, or take it out.

With the extra decibel, the processed version wins almost every time. At matched level the choice gets harder, and the answer you get is about the compression itself.

## Common mistake: judging in solo and too loud

The first mistake is setting processors in solo. A kick boosted on its own sounds huge, but once the bass, guitars and vocal return that low-end boost turns into mud and you pull the fader down anyway. You spent headroom on a sound that does not fit the mix.

The second is monitoring too loud. At high levels the ear's response is flatter, so the bass and the extreme top sound fuller than they will at a normal listening level. Mix there and you tend to hold back the low end, and the track sounds thin when someone plays it quietly.

## Producer takeaway: make every comparison fair

Treat every bypass button as a loudness test until you have matched the levels. Most plugins have an output control for this; use it before you decide anything. Pick one moderate monitoring level, mark it on your volume knob and come back to it, so your sense of balance has a stable reference.

Size in a mix comes from contrast between quiet and loud, narrow and wide, not from pushing everything to the ceiling. If you want the chorus to feel big, make sure the verse before it leaves room for it to grow.

## References

- Fletcher, H., & Munson, W. A. (1933). Loudness, its definition, measurement and calculation. *Journal of the Acoustical Society of America*, 5, 82-108.
- ISO 226:2023. *Acoustics: Normal equal-loudness-level contours*. International Organization for Standardization.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
- Stevens, S. S. (1955). The measurement of loudness. *Journal of the Acoustical Society of America*, 27(5), 815-829.
`,
    seo: {
        title: 'Why louder is not always bigger in a mix | VGP Studio',
        description: 'Loudness bias makes a plugin that adds 1 dB sound like an upgrade. How level becomes loudness, and how to level-match every A/B so you judge the processing.',
        keywords: ['loudness bias', 'level matching', 'gain matching', 'equal loudness contours', 'Fletcher Munson', 'mixing psychology'],
    },
};
