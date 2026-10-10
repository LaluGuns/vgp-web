import { BlogArticle } from '../blog-data';

export const post132: BlogArticle = {
    slug: 'mid-side-widening-moves-the-center-too',
    title: 'Mid/side widening moves the centre too',
    excerpt: 'A side boost raises every part that is not dead centre, by up to 4 dB at +6 dB of side. It changes your balance and your panning, and mono never hears it.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Treat a side boost as a balance move: at +6 dB it raises hard-panned and wide parts by about 4 dB against the centre.',
        'Level-match before you judge width, because the wider version is louder in stereo and identical in mono.',
        'Make small side moves and judge the decoded stereo and the mono fold, never the soloed side channel.',
    ],
    figures: {
        leak: {
            type: 'signal',
            caption:
                'A guitar panned hard left, before and after a +6 dB side boost, using L = M + S and R = M - S. The left channel grows to 1.5 times its level (+3.5 dB), and the silent right channel now plays an upside-down copy at 0.5, which is 9.5 dB below the left.',
            alt: 'Two plots of a sine wave. Before: the left channel has a wave and the right channel is a flat line. After: the left wave is taller, and the right channel has a smaller wave that peaks where the left dips.',
            rows: [
                {
                    label: 'Before',
                    traces: [
                        { kind: 'sine', cycles: 3, amp: 0.6, label: 'Left' },
                        { kind: 'sine', cycles: 3, amp: 0, label: 'Right', dashed: true },
                    ],
                },
                {
                    label: 'After side +6 dB',
                    traces: [
                        { kind: 'sine', cycles: 3, amp: 0.9, label: 'Left' },
                        { kind: 'sine', cycles: 3, amp: 0.3, phase: 180, label: 'Right', dashed: true },
                    ],
                },
            ],
        },
        balance: {
            type: 'bars',
            caption:
                'How much louder each part gets in stereo, summed over both channels, when the side is raised by 6 dB. The further a part sits from the centre, the more it gains, up to 4 dB. The centred vocal does not change, and in mono no part changes at all.',
            alt: 'Five bars. Centred vocal 0 dB. Guitar halfway left +1.6 dB. Guitar hard left +4 dB. Wide reverb +4 dB. Any part in mono 0 dB.',
            min: 0,
            max: 6,
            unit: 'dB',
            bars: [
                { label: 'Centred vocal', value: 0, display: '0 dB' },
                { label: 'Guitar, half left', value: 1.6, display: '+1.6 dB' },
                { label: 'Guitar, hard left', value: 4, display: '+4 dB' },
                { label: 'Wide reverb', value: 4, display: '+4 dB' },
                { label: 'Any part, in mono', value: 0, display: '0 dB', dim: true },
            ],
        },
        pan: {
            type: 'scale',
            caption:
                'The level difference between the channels for a guitar panned halfway left, before and after a +6 dB side boost. It grows from 7.7 dB to 20.6 dB, so the guitar moves most of the way to the left speaker without anyone touching its pan control.',
            alt: 'A line from 0 to 24 dB with a marker at 7.7 dB labelled before and a marker at 20.6 dB labelled after, joined by an arrow.',
            min: 0,
            max: 24,
            unit: 'dB',
            ticks: [0, 6, 12, 18, 24],
            markers: [
                { value: 7.7, label: 'Before 7.7' },
                { value: 20.6, label: 'After 20.6', strong: true },
            ],
            arrows: [{ from: 7.7, to: 20.6 }],
        },
    },
    quiz: [
        {
            q: 'A synth is panned hard left. You raise the side by 6 dB (M and S defined as half the sum and half the difference). What comes out of the right speaker?',
            options: [
                'Nothing, because the synth is only in the left channel',
                'A copy at the same level, so the synth moves to the centre',
                'An upside-down copy at half the synth\'s original level',
                'A delayed copy that turns into a comb filter in mono',
            ],
            answer: 2,
            why: 'Hard left gives M = S = x/2. With the side doubled, R = M - 2S = -x/2: an inverted copy at half the original level.',
        },
        {
            q: 'A widener only raises the side gain. How does the mono fold of the widened mix compare with the mono fold of the original?',
            options: [
                'It is identical, because the mono fold is the mid signal',
                'It is louder, because the boosted side adds to the sum',
                'It is quieter, because the side boost cancels some mid',
                'It is hollow, because the boost adds a short delay',
            ],
            answer: 0,
            why: '(L + R) / 2 equals M, and the side gain never touches M. Bounce both mono folds, flip one, and they null.',
        },
        {
            q: 'A reverb return has equal, unrelated signals in left and right. You raise the side by 6 dB. How much louder is the reverb in stereo?',
            options: ['About +2 dB', 'About +4 dB', 'About +6 dB', 'About +12 dB'],
            answer: 1,
            why: 'Unrelated equal channels split their power evenly between M and S. Doubling S multiplies S power by 4, so the total goes from 1 + 1 to 1 + 4, which is 10 log(5/2), about +4 dB.',
        },
    ],
    content: `## Hook: the wider master with the smaller singer

You put a stereo imager on the mix bus and push the width a little. The pads open out, the room around the drums gets bigger, the chorus feels expensive. Ten minutes later you notice the vocal sounds further away than it did, and the snare has lost some of its crack. You did not touch either of them.

The width control turned them down relative to everything around them, which makes it a balance control with a different label. The mid/side maths shows why, and it is simpler than the plugin graphics suggest.

## Why it matters: the side signal is full of instruments

Mid/side is another way of writing the same two channels. The idea goes back to Blumlein's stereo patent, and the sum-and-difference matrix is the basis of M-S microphone recording (Dooley and Streicher, 1982). This lesson uses the convention

$$\\begin{aligned} M &= \\frac{L + R}{2}, & S &= \\frac{L - R}{2} \\\\ L &= M + S, & R &= M - S \\end{aligned}$$

Some tools scale both by $1/\\sqrt{2}$ instead of 1/2. That changes the numbers on the M and S meters, but none of the conclusions below.

A part in dead centre has $L = R$, so it lives entirely in $M$ and $S = 0$. Anything else has some side. A guitar panned hard left is $L = x$, $R = 0$, which gives $M = S = x/2$: half of that guitar is side signal. So the side channel holds far more than reverb and air. Every panned instrument, stereo synth patch and room mic is in there, in proportion to how far from the centre it sits, so a width move on the mix bus is a level move on all of them.

## Science model: what a side boost does to each part

Multiply $S$ by a gain $g$ and decode. For the hard-left guitar with $g = 2$, a 6 dB side boost:

$$\\begin{aligned} L' &= \\frac{x}{2} + 2 \\cdot \\frac{x}{2} = 1.5x \\\\ R' &= \\frac{x}{2} - 2 \\cdot \\frac{x}{2} = -0.5x \\end{aligned}$$

The left channel rises 3.5 dB, and the right speaker, silent before, now plays an inverted copy of the guitar 9.5 dB below the left. That inverted leak is where the extra width comes from, and it is one reason heavy side boosts can sound phasey.

::figure leak

Now sum the power over both channels. Because $L^2 + R^2 = 2(M^2 + S^2)$, raising $S$ raises every part by an amount that depends on how much of it is side. The centred vocal has no side and does not change. The hard-left guitar has equal M and S power, so it gains $10 \\log_{10}(5/2) \\approx 4$ dB. A reverb with unrelated left and right channels also splits its power evenly and gains the same 4 dB.

::figure balance

So the centre moves without its level changing: everything around it came up by as much as 4 dB, and the vocal, kick, snare and bass now sit relatively lower. Some wideners also turn the mid down to keep overall loudness steady, and then the centre drops in absolute level as well.

Panned parts move outward too. A guitar halfway left on a sine/cosine pan law has gains of 0.92 and 0.38, a 7.7 dB difference between the channels. After the same boost it is 1.19 and 0.11, a 20.6 dB difference.

::figure pan

The mono fold is the one thing that does not move. $(L' + R')/2 = M$ for any $g$, so the widened mix and the original fold to exactly the same mono signal. That is why a side boost [disappears in mono](/blog/why-mono-reveals-what-stereo-hides): a hard-panned guitar now drops 4 dB more between stereo and mono than it did before the boost.

In the demo, listen for two things: whether the centre feels smaller as the side comes up, and how the correlation meter moves when it does.

::demo width

## DAW experiment: measure your width move

You need a mid/side utility with a side gain control. Several DAWs have one built in.

1. Put a mid/side utility on the mix bus with a side gain control, followed by a loudness meter and a mono switch.
2. Loop the chorus and note the short-term loudness and how present the vocal feels.
3. Raise the side by 6 dB. Read the loudness again: it rises, more on a wide mix than a narrow one.
4. Pull the output down until the loudness matches the original, then compare. Listen to the vocal and snare, not the pads.
5. Bounce the original and the widened version folded to mono. Flip the polarity of one and play them together: they null to silence if the tool only scales the side.
6. In a test session, pan one synth hard left, keep the side boost on its bus and listen to the right channel alone. That is the inverted copy the boost created.
7. Bring the side back to between +1 and +2 dB, or limit the boost to the upper bands, and repeat steps 3 and 4.

Often the width you liked at +6 dB came with a quieter vocal you would never have chosen on purpose.

## Common mistake: judging width at a higher level

The wider version is louder in stereo, by up to 4 dB on wide material at +6 dB of side. [Louder tends to sound better](/blog/why-louder-is-not-always-bigger) in a quick A/B, so an unmatched comparison votes for more width. Match the loudness first.

The other mistake is judging the side channel on its own. Soloed side sounds hollow on almost any mix, because it is only the difference between the channels, and it tells you little about the decoded stereo. Make the call on the normal stereo output and the mono fold. Keep the low end out of the boost unless you have checked what it does there; the [lesson on stereo low end](/blog/stereo-low-end-is-a-translation-decision) covers what to listen for.

## Producer takeaway: width is a balance decision

Before you raise the side, ask which parts you are really turning up against the vocal. Often the answer is a pad or a room mic, and its own fader or its own stereo width does the job without moving the centre. When you do use mid/side on a bus, keep moves small, match loudness, and check that the mono fold still holds the song.

## References

- Blumlein, A. D. (1933). *Improvements in and relating to sound-transmission, sound-recording and sound-reproducing systems*. British Patent 394,325.
- Dooley, W. L., & Streicher, R. D. (1982). M-S stereo: A powerful technique for working in stereo. *Journal of the Audio Engineering Society*, 30(10), 707-718.
`,
    seo: {
        title: 'Mid/side widening moves the centre too | VGP Studio',
        description: 'A side boost raises every off-centre part against the vocal and pushes pans outward, while mono stays the same. The maths, the balance shift and a test.',
        keywords: ['mid side processing', 'stereo widening', 'side boost', 'stereo imager', 'mono compatibility', 'mix bus width'],
    },
};
