import { BlogArticle } from '../blog-data';

export const post053: BlogArticle = {
    slug: 'how-eq-becomes-attention-design',
    title: 'EQ is attention design',
    excerpt: 'Boost the presence range on every track and nothing stands out. Use EQ to build contrast, so the part that matters is the one the ear can follow.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Boosting presence on every track removes the contrast that tells the ear where to listen.',
        'Pick one lead per section and give it the 2 to 5 kHz range, where the ear is most sensitive.',
        'Make room with small cuts on the supporting parts at the lead\'s key frequency, then check at a whisper.',
    ],
    figures: {
        complementary: {
            type: 'spectrum',
            mode: 'gain',
            caption:
                'Complementary EQ, drawn from the real filter maths. The lead gets a gentle 2 dB lift at 3 kHz and the pad gives up 3 dB at the same place. The lead now sits 5 dB further above the pad in that band, with only 2 dB of boost.',
            alt: 'Two EQ curves from 20 Hz to 20 kHz. The lead curve rises 2 dB in a broad bump centred on 3 kHz. The dotted pad curve dips 3 dB at the same frequency. A shaded band marks 2 to 5 kHz.',
            bands: [{ from: 2000, to: 5000, label: 'Most sensitive range' }],
            db: 6,
            curves: [
                { kind: 'eq', label: 'Lead', bands: [{ type: 'bell', freq: 3000, gain: 2, q: 1 }] },
                { kind: 'eq', label: 'Pad', dotted: true, bands: [{ type: 'bell', freq: 3000, gain: -3, q: 1 }] },
            ],
        },
        window: {
            type: 'spectrum',
            mode: 'gain',
            caption:
                'The listening window from the experiment: a 12 dB per octave high-pass at 800 Hz and low-pass at 4 kHz. Both edges are 3 dB down, and the bass and air drop away fast outside them.',
            alt: 'A band-pass response from 20 Hz to 20 kHz. It is flat between about 1 and 3 kHz, 3 dB down at the marked 800 Hz and 4 kHz points, and falls steeply below and above.',
            db: 24,
            marks: [
                { f: 800, label: '800 Hz' },
                { f: 4000, label: '4 kHz' },
            ],
            curves: [
                {
                    kind: 'eq',
                    label: 'Listening window on the master',
                    bands: [
                        { type: 'highpass', freq: 800, q: 0.707 },
                        { type: 'lowpass', freq: 4000, q: 0.707 },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'The lead vocal, the guitar and the synth all have a 3 dB boost at 4 kHz. What happens?',
            options: [
                'Each one gets clearer, as it does when soloed',
                'Only the vocal benefits, because it is loudest',
                'The guitar wins, since its pick attack sits there',
                'None stands out, and the mix just turns harsher',
            ],
            answer: 3,
            why: 'Contrast is what lets the ear pick a lead. Three parts boosted in the same place are as close to each other as before, only louder and harsher.',
        },
        {
            q: 'Why do so many clarity decisions happen between about 2 and 5 kHz?',
            options: [
                'Small speakers and earbuds lose most of what sits below 2 kHz',
                'The ear is most sensitive there, as the ear canal resonates',
                'Streaming codecs keep that range and discard most of the rest',
                'Most instruments put their fundamental notes in that range',
            ],
            answer: 1,
            why: 'The equal-loudness contours dip lowest around 3 to 4 kHz. Small level differences there are easy to hear, so whoever owns that range draws attention.',
        },
        {
            q: 'Why cut the supporting parts at the lead\'s key frequency instead of only boosting the lead?',
            options: [
                'Boosting the lead would push the master bus into clipping',
                'A boost smears the timing of the consonants in the lead',
                'It adds contrast in that band without raising the level',
                'Cuts add a phase shift that makes the lead sound brighter',
            ],
            answer: 2,
            why: 'What the ear follows is the difference between the lead and its background in that band. A cut on the background raises that difference and keeps the lead\'s own tone and the overall level unchanged.',
        },
    ],
    content: `## Hook: everything is bright, nothing is clear

You want the lead synth, the acoustic guitar and the vocal all to sound present. So each one gets a gentle EQ boost somewhere around 3 to 5 kHz. Soloed, every track sounds better. Together they turn into a harsh wall, nothing stands out, and your ears are tired after one pass.

Each track got EQ as if it were the only one. A mix is a set of decisions about focus: at any moment the listener can follow only one or two parts closely. Boost the presence of everything and you ask them to listen everywhere at once.

## Why it matters: attention follows contrast

The ear separates a mix into parts using the differences between them: in pitch range, timing, location and tone (Bregman, 1990). A part that stands apart from its surroundings is easy to follow. A part that has the same brightness as everything around it blends into the group.

That makes EQ a tool for hierarchy. If you want one part to lead, the parts around it need to be a little less present in its key range. Boost the lead at 3 kHz and cut the pad and guitar at 3 kHz, and the difference between them in that band grows from both sides.

::figure complementary

## Science model: the range where the ear listens hardest

The ear is not equally sensitive across the spectrum. The equal-loudness contours dip lowest around 3 to 4 kHz (ISO 226:2023), partly because the ear canal resonates near 3 kHz. Level differences in that region are the easiest to hear, which is why vocal intelligibility, pick attack and synth bite all live there, and why it fills up so quickly.

What decides whether the lead wins in that range is not its absolute level but its level relative to the background in the same band. You can raise that difference by boosting the lead or by cutting the background. Cutting the background keeps the overall level where it was and leaves the lead's own tone alone, so you get the contrast without spending headroom.

To do any of this you need to find frequencies by ear. Sweep the narrow boost below and stop where it sounds most obvious, then check the number.

::demo eq-sweep

Judging the balance in that range is easier when the low end and the air are out of the way. A temporary band-pass on the master lets you hear only the window where most of the competition happens.

::figure window

## DAW experiment: build a clear hierarchy

Pick one section and decide which part leads it. Usually it is the vocal; in a drop it may be a synth hook.

1. Insert an EQ on the lead. Set a bell to +6 dB with Q 3 and sweep it between 1 and 6 kHz in the full mix. Stop where the lead sounds most like itself: clearest words, sharpest attack.
2. Note that frequency, then reduce the bell to +2 dB and widen it to Q 1.
3. On each supporting part that competes there, such as guitar, pad or keys, cut 2 to 3 dB at the same frequency with Q 1.
4. On the pad, add a low-pass filter at about 6 kHz so its top end leaves room for the vocal air and the hi-hats.
5. Put a high-pass at 800 Hz and a low-pass at 4 kHz on the master, both 12 dB per octave. Check that the lead sits clearly on top inside this window, then remove both filters.
6. Turn your monitors down until the music is barely audible. The lead should be the last thing you can still follow.

With the cuts in place, the lead reads clearly even with less total boost, and the supporting parts still sound full once everything plays.

## Common mistake: EQ in solo

The most common mistake is shaping parts with the solo button on. Soloed, an acoustic guitar seems to need low-end warmth and top-end sparkle. Unmute the bass and the cymbals and that warmth clashes with the bass while the sparkle fights the hi-hats, and you end up undoing your work.

The second is boosting several parts at the same frequency. If the snare, the vocal and the lead guitar all lift 4 kHz, they mask each other there and the mix turns harsh without anything becoming clearer.

## Producer takeaway: let the supporting parts go dark

To make the lead shine, accept that some parts will sound dull or thin when soloed. A pad does not need to cover the whole spectrum. It is there for harmony and texture behind the melody, and it does that job just as well with its top end rolled off.

Use the whisper test at the end of every session. Turn the volume down until the music almost disappears. If the lead is the last thing you hear, the hierarchy works. If a synth or a guitar outlasts it, pull that part down in the lead's range or lower its fader.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- ISO 226:2023. *Acoustics: Normal equal-loudness-level contours*. International Organization for Standardization.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'EQ is attention design | VGP Studio',
        description: 'Boosting presence on every track removes contrast. How complementary EQ and the ear\'s 2 to 5 kHz sensitivity let you decide which part the listener follows.',
        keywords: ['EQ attention', 'complementary EQ', 'mix hierarchy', 'presence range', 'vocal clarity', 'mixing psychology'],
    },
};
