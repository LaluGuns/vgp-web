import { BlogArticle } from '../blog-data';

export const post055: BlogArticle = {
    slug: 'the-mix-decision-that-makes-vocals-feel-expensive',
    title: 'A vocal pocket that opens when the singer sings',
    excerpt: 'Static cuts thin out the band whenever the vocal rests. A dynamic EQ keyed from the vocal dips the clashing range only while the singer is singing.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Static cuts that make room for the vocal leave the instruments thin whenever the vocal rests.',
        'A dynamic EQ keyed from the vocal dips only the clashing band, and only while the singer sings.',
        'Keep the dip to 2 or 3 dB with a fast attack and release, so the pocket opens without anyone hearing it move.',
    ],
    figures: {
        duck: {
            type: 'signal',
            caption:
                'The vocal\'s level drives a cut in one band of the instrument bus. The cut reaches its 3 dB limit while a phrase is sung and falls back to zero in the gap before the next one.',
            alt: 'Two level plots over the same time. The top shows two sung vocal phrases separated by a gap. The bottom shows the cut in the 2 kHz band rising to the 3 dB line during each phrase and falling back to zero in the gap.',
            rows: [
                {
                    label: 'Vocal level, the sidechain',
                    unipolar: true,
                    traces: [
                        {
                            kind: 'envelope',
                            points: [
                                [0, 0], [0.06, 0], [0.08, 0.8], [0.16, 0.62], [0.25, 0.75], [0.35, 0.6], [0.38, 0],
                                [0.5, 0], [0.52, 0.78], [0.6, 0.66], [0.68, 0.72], [0.76, 0.58], [0.78, 0], [1, 0],
                            ],
                        },
                    ],
                },
                {
                    label: 'Cut in the 2 kHz band',
                    unipolar: true,
                    lines: [{ y: 0.75, label: '3 dB' }],
                    traces: [
                        {
                            kind: 'envelope',
                            points: [
                                [0, 0], [0.06, 0], [0.08, 0.75], [0.38, 0.75], [0.43, 0],
                                [0.5, 0], [0.52, 0.75], [0.78, 0.75], [0.83, 0], [1, 0],
                            ],
                        },
                    ],
                },
            ],
        },
        band: {
            type: 'spectrum',
            mode: 'gain',
            db: 6,
            caption:
                'The same EQ band at rest and at full depth, drawn from the real filter maths. With Q 1.5 the dip at 2 kHz is about one octave wide at half its depth, and the lows and highs of the instruments are never touched.',
            alt: 'Two EQ curves from 20 Hz to 20 kHz. The muted curve, at rest, is flat at 0 dB. The other dips 3 dB in a bell centred on 2 kHz and is flat elsewhere.',
            marks: [{ f: 2000, label: '2 kHz' }],
            curves: [
                { kind: 'eq', label: 'Vocal resting', muted: true, bands: [{ type: 'bell', freq: 2000, gain: 0, q: 1.5 }] },
                { kind: 'eq', label: 'Vocal singing', bands: [{ type: 'bell', freq: 2000, gain: -3, q: 1.5 }] },
            ],
        },
    },
    quiz: [
        {
            q: 'Why use a dynamic EQ on the instrument bus instead of a static cut?',
            options: [
                'It turns the whole bus down under the vocal to save headroom',
                'It holds the vocal level steady, so it needs less compression',
                'It dips only while the vocal sings, so the gaps stay full',
                'A static bus cut smears the phase of the vocal it should help',
            ],
            answer: 2,
            why: 'Masking only matters while both parts play. A dynamic band follows the vocal, so intros, breaks and gaps between lines keep the full instrumental tone.',
        },
        {
            q: 'Threshold -30 dB, ratio 2:1, range 3 dB. The vocal\'s key band reaches -20 dB. How far does the instrument band dip?',
            options: ['5 dB', '3 dB', '10 dB', '1.5 dB'],
            answer: 1,
            why: 'The key is 10 dB over the threshold. At 2:1 that asks for 10 × (1 - 1/2) = 5 dB of reduction, but the range caps the dip at 3 dB.',
        },
        {
            q: 'You duck the whole instrument bus by 4 dB whenever the vocal sings. What is the likely side effect?',
            options: [
                'The mix pumps in time with the vocal phrasing',
                'The bus thins out in the midrange under the vocal',
                'The gaps between the lines sound hollow and thin',
                'The vocal seems to sit further back in the mix',
            ],
            answer: 0,
            why: 'Full-band ducking moves the drums, bass and harmony together. Only the band that clashes with the vocal needs to move.',
        },
    ],
    content: `## Hook: the fader battle

You have a well-recorded lead vocal with your favourite compressor and a little top-end air. In the chorus it disappears behind the guitars, synths and drums. You push the fader up. Now you can hear it, but it sits on top of the instrumental like a karaoke track instead of feeling like part of the song.

A polished vocal rarely wins on level. It sounds polished because the instrumental makes room for it. The trick is to make that room only while it is needed, so the band keeps its full sound the rest of the time.

## Why it matters: masking comes and goes

The instruments mask the vocal only while both are playing. In the gaps between lines, in the intro and in an instrumental break, the guitars and synths have the midrange to themselves and they should use it.

A static EQ cut cannot tell the difference. Cut 3 dB at 2 kHz on the keys and guitars and the vocal gets its space, but every bar without singing sounds a little hollow too. A dynamic EQ band solves this by moving. It listens to the vocal through a sidechain and dips the instruments in the clashing range only while the singer is singing.

::figure duck

Hear the difference between a static cut on a pad and a duck that follows the lead. The demo ducks the whole pad, which is cruder than one band, but the timing is the same idea. The lead stays at the same level throughout.

::demo masking

## Science model: a compressor that works on one band

A dynamic EQ band is a compressor that acts on one EQ band instead of the whole signal. Its gain computer works like any compressor's (Giannoulis, Massberg and Reiss, 2012). When the sidechain level $L_{sc}$ in decibels rises above the threshold $T$, the band is cut by:

$$G = \\min\\left( G_{\\max},\\ \\left( L_{sc} - T \\right)\\left( 1 - \\frac{1}{R} \\right) \\right)$$

where $R$ is the ratio and $G_{\\max}$ the range, the deepest cut the band is allowed to make. Below the threshold the cut is zero. With a threshold of -30 dB, a 2:1 ratio and a 3 dB range, a vocal reaching -20 dB asks for 5 dB of cut, and the range holds it to 3 dB.

The range is what keeps the move inaudible. A dip of 2 or 3 dB in one band is enough to lower the masking on the vocal's key range, but small enough that the instruments do not seem to breathe with the singer. Research on automatic mixing works toward the same goal, setting the EQ of each track so the tracks mask each other less (Hafezi and Reiss, 2015).

::figure band

## DAW experiment: build a sidechained pocket

You need a dynamic EQ or a multiband compressor with an external sidechain input.

1. Route every part that competes with the vocal's midrange, such as guitars, synths and keys, to one stereo instrument bus.
2. Insert a dynamic EQ on the bus and create one bell band at 2 kHz with Q 1.5.
3. Set that band's sidechain to external and feed it from the lead vocal.
4. Set the attack to 5 to 10 ms, the release to 80 to 120 ms, the ratio to 2:1 and the range to 3 dB.
5. Loop the chorus and lower the threshold until the band shows 2 to 3 dB of reduction on sung phrases and returns to zero in the gaps.
6. Toggle the band on and off during the chorus, then play an instrumental section and confirm the band stays at zero.

With the band active, the vocal steps forward into its own space although its fader never moved. In the instrumental section the bus sounds exactly as it did before.

## Common mistake: moving more than the clash

A static cut on the whole instrument group is the first mistake. It does make room, but the intro, the outro and any instrumental bridge lose their body for no reason.

The second is full-band sidechain ducking. Turning the whole bus down whenever the vocal sings moves the harmony and the rhythm parts together, so the mix pumps with the phrasing. Only the band that clashes with the vocal needs to move, and only by a few decibels. If you can hear the instruments breathe with the singer, lower the range before you change anything else.

## Producer takeaway: make room only while it is needed

Arrangement comes first. If a guitar part does not need to play under the verse vocal, mute it and there is nothing to fix. When everything has to play, let the vocal open its own pocket in the band, sized to the overlap and timed to the singing.

Then listen at a low monitoring level and follow the lyrics. They should be easy to understand without leaning in. If you strain on the consonants, lower the threshold a little or move the band to where the vocal's consonants are clearest.

## References

- Giannoulis, D., Massberg, M., & Reiss, J. D. (2012). Digital dynamic range compressor design: A tutorial and analysis. *Journal of the Audio Engineering Society*, 60(6), 399-408.
- Hafezi, S., & Reiss, J. D. (2015). Autonomous multitrack equalization based on masking reduction. *Journal of the Audio Engineering Society*, 63(5), 312-323.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'A vocal pocket that opens when the singer sings | VGP Studio',
        description: 'Static cuts thin out the band. How a dynamic EQ keyed from the vocal dips the clashing midrange only while the singer sings, with settings to try.',
        keywords: ['vocal mix clarity', 'dynamic EQ', 'sidechain', 'masking reduction', 'mixing vocals', 'vocal pocket'],
    },
};
