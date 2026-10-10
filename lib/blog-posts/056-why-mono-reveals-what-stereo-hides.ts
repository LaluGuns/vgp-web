import { BlogArticle } from '../blog-data';

export const post056: BlogArticle = {
    slug: 'why-mono-reveals-what-stereo-hides',
    title: 'Mono reveals what stereo hides',
    excerpt: 'Width made with delay, polarity or side boosts can thin out or vanish when a phone or a club folds your mix to one channel. Toggle mono while you mix to catch it.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Phones, smart speakers and many venue systems add left and right together, and some width tricks do not survive the sum.',
        'A phase difference between the channels costs 3 dB in mono at 90 degrees and everything at 180, and a delay makes that loss change with frequency.',
        'Toggle mono while you mix, keep the low end centred, and build width from different sources rather than from copies.',
    ],
    figures: {
        loss: {
            type: 'bars',
            caption:
                'How loud one frequency is after the mono sum when the right channel is shifted against the left, computed from A cos(θ/2). Small offsets cost little. At 90 degrees you lose 3 dB, at 120 you lose 6, and at 180 the frequency is gone.',
            alt: 'Six bars for the phase difference between the channels. 0 degrees keeps 0 dB, 60 degrees -1.2 dB, 90 degrees -3 dB, 120 degrees -6 dB, 150 degrees -11.7 dB, and 180 degrees is silent.',
            min: -24,
            max: 0,
            unit: 'dB',
            bars: [
                { label: '0°', value: 0, display: '0 dB' },
                { label: '60°', value: -1.2, display: '-1.2 dB' },
                { label: '90°', value: -3, display: '-3 dB' },
                { label: '120°', value: -6, display: '-6 dB' },
                { label: '150°', value: -11.7, display: '-11.7 dB' },
                { label: '180°', value: -24, display: 'silent', dim: true },
            ],
        },
        comb: {
            type: 'scale',
            caption:
                'A part widened with a 12 ms delay on one side, folded to mono. The first cancellation lands at 42 Hz and the next ones follow every 83 Hz, all the way up the spectrum. That row of notches is the hollow, phasey sound.',
            alt: 'A frequency line from 0 to 500 Hz with notch markers at 42, 125, 208, 292, 375 and 458 Hz. A bar below spans the 83 Hz between the first two notches.',
            min: 0,
            max: 500,
            unit: 'Hz',
            ticks: [0, 250, 500],
            markers: [
                { value: 42, label: '42', strong: true },
                { value: 125, label: '125', strong: true },
                { value: 208, label: '208', strong: true },
                { value: 292, label: '292', strong: true },
                { value: 375, label: '375', strong: true },
                { value: 458, label: '458', strong: true },
            ],
            ranges: [{ from: 42, to: 125, label: '83 Hz between notches' }],
        },
    },
    quiz: [
        {
            q: 'The right channel of a synth is 90 degrees behind the left at one frequency. What happens to that frequency in mono?',
            options: ['It drops by 6 dB', 'It rises by 3 dB', 'It cancels fully', 'It drops by 3 dB'],
            answer: 3,
            why: 'The mono level is A cos(θ/2). At 90 degrees that is cos 45°, about 0.71, which is 3 dB down.',
        },
        {
            q: 'One side of a pluck is delayed by 12 ms for width. Why does it sound hollow in mono?',
            options: [
                'The delay smears its attack, so the pluck loses its click',
                'Mono turns the delay into a slapback echo of the pluck',
                'The copies cancel at 42 Hz and every 83 Hz above it',
                'The delayed side is panned hard, so it drops in mono',
            ],
            answer: 2,
            why: 'A fixed delay is a different phase shift at every frequency. Wherever it reaches an odd multiple of 180 degrees, the two copies cancel: at 1/(2 × 0.012 s) = 42 Hz and then every 1/0.012 s = 83 Hz.',
        },
        {
            q: 'A wide pad was made with a mid-side widener that boosts the side signal. What happens to the boost in mono?',
            options: [
                'It cancels in the sum, so the pad loses the boost',
                'It doubles, as the boosted side is in both channels',
                'It turns into a comb filter, like a short delay would',
                'It moves to the centre, as the sum keeps all the energy',
            ],
            answer: 0,
            why: 'The side signal is the difference between left and right. Adding left and right cancels it, so only the mid part of the pad is left.',
        },
    ],
    content: `## Hook: the width that disappears

Your mix sounds huge on the studio monitors. The synths are spread wide, the backing vocals wrap around your head, and the effects build a big space. Then you play it on a phone, a small Bluetooth speaker or a club system, and the energy drains away. The lead synth goes thin, the backing vocals vanish and the chorus loses its lift.

On those systems the left and right channels are often added together into one. If part of your width was built from differences between the channels that cancel when they are added, that part of the mix goes with it.

## Why it matters: width tricks pay a price in mono

Plenty of everyday playback is mono: a single phone speaker, most smart speakers, and many venue and club rigs. A mix that holds up there is a mix that translates. A mix that relies on width tricks can sound like a different song.

Not every trick fails in the same way. A mid-side widener that boosts the side signal loses that boost completely, because the side signal is the difference between the channels and the sum removes it. A short delay on one side, the Haas trick, turns into a comb filter. A polarity flip or a phase shift between the channels cancels part or all of the sound. Hear the last two on a pluck while the kick, bass and snare stay in the middle:

::demo mono

## Science model: what happens in the sum

A simple mono fold adds the channels and halves the result:

$$S_{\\text{mono}}(t) = \\frac{1}{2} \\left( S_L(t) + S_R(t) \\right)$$

Take one frequency with amplitude $A$ in both channels, and shift the right channel by an angle $\\theta$. The mono amplitude is then:

$$A_{\\text{mono}} = A \\cos\\left(\\frac{\\theta}{2}\\right)$$

At 0 degrees nothing is lost. At 90 degrees the level drops by 3 dB, at 120 degrees by 6 dB, and at 180 degrees, a flipped polarity, the frequency cancels completely.

::figure loss

A delay makes it worse, because the same delay is a different phase shift at every frequency: $\\theta = 360^\\circ \\times f \\times \\tau$. Wherever $\\theta$ reaches 180 degrees, or 540, or any odd multiple, the two copies cancel. The notches fall at:

$$f_{\\text{notch}} = \\frac{2k + 1}{2\\tau}, \\quad k = 0, 1, 2, \\dots$$

A 12 ms delay puts the first notch at 42 Hz and the rest every 83 Hz above it. This regular row of notches is a comb filter (Smith, 2010), and it is the hollow, phasey sound a Haas-widened part takes on in mono.

::figure comb

## DAW experiment: a mono check routine

Set this up once and use it throughout the mix.

1. Insert a utility plugin with a mono switch at the very end of the master chain, after the limiter and before any meters. Map the switch to a key command.
2. Loop the chorus at a moderate monitoring level and toggle between stereo and mono every few seconds.
3. Add a correlation meter just before the mono switch, so it still sees both channels (if your DAW has none, install a free one). It reads +1 when both channels are identical, around 0 when they are unrelated, and below 0 when they are fighting each other.
4. Note every part that thins out or changes tone in mono. The parts in the centre should not change at all, and a part panned hard to one side drops by a few decibels, which is normal.
5. For each part that drops, stay in mono and bypass its widener, chorus or stereo delay one at a time until you find the cause.
6. Fix the cause: lower the side boost on a mid-side widener, change a Haas delay or replace it with a second take panned opposite, and make sure nothing below about 120 Hz is wider than mono.

The centre parts stay put when you toggle. The ones that thin out or shift tone are your width tricks, and now you know which ones cost too much.

## Common mistake: widening the whole master

A common mistake is a stereo imager on the master bus with the width pushed up. It feels bigger in the studio, but it raises the side signal across the whole spectrum, and everything you gain disappears in mono while the centre image gets weaker in stereo.

Another is giving the low end width. The kick and the bass carry most of a mix's energy, and a low end that partly cancels in mono loses its weight on exactly the systems where it matters. Keep everything below roughly 120 Hz centred.

## Producer takeaway: width that survives the fold

Lasting width comes from different sources, not from copies of one. Record two takes of a guitar part and pan them left and right. The natural differences in timing and tone make them sound wide in stereo, and because they are not copies they do not cancel when added. They simply add.

Check your mix on a single speaker at low volume before you call it done. If the vocal, the groove and the hook still come through, the mix will translate. Width is the extra on top.

## References

- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
- Smith, J. O. (2010). *Physical Audio Signal Processing*. W3K Publishing. https://ccrma.stanford.edu/~jos/pasp/
`,
    seo: {
        title: 'Mono reveals what stereo hides | VGP Studio',
        description: 'Width made with delay, polarity or side boosts can vanish when a mix is folded to mono. The maths of the mono sum, comb filtering, and a mono check routine.',
        keywords: ['mono compatibility', 'phase cancellation', 'stereo width', 'mono sum', 'comb filter', 'Haas effect'],
    },
};
