import { BlogArticle } from '../blog-data';

// Pitch over time for a two-note phrase, drawn as a shape. The notes sit at -0.4 and +0.4.
const LOW = -0.4;
const HIGH = 0.4;
function sung({ scoop, vibrato, fall, drift }: { scoop: number; vibrato: number; fall: number; drift: number }): [number, number][] {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 240; i++) {
        const t = i / 240;
        const vib = (from: number) => vibrato * Math.min(1, Math.max(0, (t - from) / 0.1)) * Math.sin(2 * Math.PI * 16 * t);
        let p: number;
        if (t < 0.44) {
            p = LOW - scoop * Math.exp(-t / 0.035) + vib(0.12);
        } else if (t < 0.53) {
            const s = (t - 0.44) / 0.09;
            p = LOW + (HIGH - drift - LOW) * (s * s * (3 - 2 * s));
        } else {
            const f = Math.min(1, Math.max(0, (t - 0.84) / 0.08));
            p = HIGH - drift + vib(0.6) * (1 - f) - fall * f * f * (3 - 2 * f);
        }
        pts.push([t, Number(p.toFixed(4))]);
    }
    return pts;
}

export const post046: BlogArticle = {
    slug: 'how-pitch-correction-changes-perceived-confidence',
    title: 'Fast retune speed erases the movement between notes',
    excerpt: 'A fast pitch corrector fixes the notes and flattens the scoops, slides and vibrato that carry the delivery. Use the slowest retune speed that keeps long notes in tune.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Sung pitch moves: singers scoop into notes, slide between them and add vibrato. Listeners hear that movement as part of the delivery.',
        'Retune speed sets how fast the plugin pulls pitch to the target. Fast settings turn slides into steps and flatten vibrato.',
        'Use the slowest setting that keeps long notes in tune, and fix the few bad notes by hand.',
    ],
    figures: {
        contour: {
            type: 'signal',
            caption:
                'Pitch across a two-note phrase, drawn as a shape. The sung line scoops into the first note, slides up, lands a little flat and falls at the end. Fast correction turns all of that into two flat steps. Slow correction centres the notes and keeps the slide and the vibrato.',
            alt: 'Three plots of pitch over time with guide lines for note 1 and note 2. The sung line rises into note 1, wobbles with vibrato, slides up to just under note 2 and falls at the end. The fast retune line is two flat steps joined by a jump. The slow retune line keeps the wobble and the slide but sits on the notes.',
            rows: [
                {
                    label: 'As sung',
                    lines: [
                        { y: LOW, label: 'Note 1' },
                        { y: HIGH, label: 'Note 2' },
                    ],
                    traces: [{ kind: 'envelope', points: sung({ scoop: 0.32, vibrato: 0.08, fall: 0.28, drift: 0.07 }) }],
                },
                {
                    label: 'Fast retune',
                    lines: [
                        { y: LOW, label: 'Note 1' },
                        { y: HIGH, label: 'Note 2' },
                    ],
                    traces: [
                        {
                            kind: 'envelope',
                            points: [
                                [0, LOW],
                                [0.485, LOW],
                                [0.49, HIGH],
                                [1, HIGH],
                            ],
                        },
                    ],
                },
                {
                    label: 'Slow retune',
                    lines: [
                        { y: LOW, label: 'Note 1' },
                        { y: HIGH, label: 'Note 2' },
                    ],
                    traces: [{ kind: 'envelope', points: sung({ scoop: 0.14, vibrato: 0.07, fall: 0.2, drift: 0 }) }],
                },
            ],
        },
        cents: {
            type: 'scale',
            min: -100,
            max: 100,
            unit: 'cents',
            ticks: [-100, -50, 0, 50, 100],
            caption:
                'One semitone either side of A4. A note sung at 432 Hz is about 32 cents flat. A corrector set to the nearest note pulls anything within 50 cents of A4 to 440 Hz, and anything further to the neighbouring note.',
            alt: 'A line from -100 to +100 cents. G♯4 at 415.3 Hz sits at -100, the sung note at 432 Hz at about -32, A4 at 440 Hz at 0 and A♯4 at 466.2 Hz at +100. A band from -50 to +50 is labelled as pulled to A4.',
            markers: [
                { value: -100, label: 'G♯4' },
                { value: -31.8, label: '432 Hz', strong: true },
                { value: 0, label: 'A4, 440 Hz', strong: true },
                { value: 100, label: 'A♯4' },
            ],
            ranges: [{ from: -50, to: 50, label: 'Pulled to A4' }],
        },
    },
    quiz: [
        {
            q: 'A note is sung at 432 Hz. Against A4 at 440 Hz, how far off is it?',
            options: ['About 8 cents flat', 'About 32 cents flat', 'About 50 cents flat', 'A full semitone flat'],
            answer: 1,
            why: '1200 × log2(432 / 440) is about -31.8, so the note is roughly a third of a semitone flat.',
        },
        {
            q: 'Why can a slow retune speed keep vibrato and still tune long notes?',
            options: [
                'Vibrato sits outside the pitch range that the detector is able to track',
                'Slow settings only correct notes that are more than 50 cents out of tune',
                "Vibrato outruns the correction, while the note's centre is pulled in",
                'Slow settings wait until a note has lasted a full beat before correcting',
            ],
            answer: 2,
            why: 'Retune speed works like a time constant. Movements quicker than it pass through, and the slower average drift of a held note gets corrected.',
        },
        {
            q: 'A note sits 60 cents below A4 and the plugin is set to chromatic, nearest note. Where does it go?',
            options: [
                'To A4, the note the singer was aiming for',
                'To A4, since it is still within a semitone',
                'It stays put, outside the 50-cent window',
                'To G♯4, the nearest semitone at 40 cents',
            ],
            answer: 3,
            why: 'Nearest-note correction does not know what the singer meant. Past the halfway point of 50 cents, the neighbouring semitone is closer, so the note is pulled the wrong way.',
        },
    ],
    content: `## Hook: in tune and less convincing

You put pitch correction at the top of the vocal chain to clean up a few notes, and you set it fast because fast sounds tight. Now the vocal is in tune everywhere. It also sounds as if the singer cares a little less.

The fast setting turned the scoops and slides into steps and flattened the vibrato, and that movement carried part of how the line felt.

## Why it matters: sung pitch moves

A singer's pitch is never a flat line. They scoop up into notes, slide between them, let vibrato grow on long notes and let the pitch fall at the end of a phrase. Listeners hear that movement as part of the delivery. A scoop can sound casual, a slow rise can sound like effort, and a steady vibrato on a held note can sound settled.

Fast correction replaces all of it with steps. Each note snaps to its target, the slides become jumps, and the vibrato flattens into a held tone. The movement also helps a voice stand out from what surrounds it. In a mixture of synthesized sung vowels, a vowel with vibrato was judged more prominent than the same vowel held steady (McAdams, 1989). Take the movement out and the voice blends further into the backing.

::figure contour

## Science model: cents, targets and retune speed

Pitch differences in music are measured in cents, hundredths of an equal-tempered semitone:

$$c = 1200 \\log_2\\left(\\frac{f}{f_{\\text{ref}}}\\right)$$

A note sung at 432 Hz against an A4 of 440 Hz is about 32 cents flat. A corrector set to the nearest note pulls anything within 50 cents of A4 to 440 Hz. Past 50 cents it pulls to the neighbouring semitone instead, which is why the key and scale setting matter.

::figure cents

Retune speed sets roughly how quickly the plugin pulls the detected pitch to its target. At the fastest setting the correction is effectively instant, so transitions become steps and vibrato is flattened. At slower settings, quick movements such as vibrato and short scoops pass through before the correction catches them, while the average pitch of longer notes is still pulled to the target. Many plugins add controls that treat long and short notes differently, or leave notes alone when they are already close to the target. The names and scales of these controls vary between plugins, so judge by ear rather than by number.

## DAW experiment: sweep the retune speed

You need an automatic pitch corrector with a retune speed control. Several DAWs include one.

1. Insert an automatic pitch corrector on the lead vocal and set it to the key and scale of the song. Use chromatic only if the melody uses notes outside the scale.
2. Set retune speed to its fastest setting, 0 ms on plugins that use milliseconds, and loop a phrase with a held note and a slide.
3. Slow the correction in steps, for example to 20 ms, 50 ms and 100 ms on a plugin that counts in milliseconds, and listen to the slide and the held note at each step.
4. Stop at the slowest setting where the held notes still sound in tune to you.
5. Solo a held note with vibrato and toggle bypass. The vibrato should survive, with only the centre of the note moved.
6. Unsolo and check the phrase in the full mix.

At the fastest setting the slides turn into jumps and the vibrato goes flat. As you slow it down, the scoops come back while the long notes stay in tune.

## Common mistake: one fast setting for the whole vocal

A fast global setting also acts on sounds with no clear pitch. S sounds, breaths and spoken asides give the pitch detector little to follow, and fast correction makes them warble. It also straightens notes the singer bent on purpose.

The scale setting causes its own errors. With the wrong scale, or with a note sung more than 50 cents off, the corrector drags the note to the wrong target with complete confidence.

## Producer takeaway: correct the notes that need it

Use automatic correction at a slow setting as a safety net, or leave it off. Fix the few notes that are really out with a graphical editor such as Melodyne, Flex Pitch or VariAudio: move each note's centre and leave its slides and vibrato. If you want the hard, stepped sound as a style, choose it on purpose and commit to it across the whole part. Mike Senior's chapter on tuning correction in *Mixing Secrets for the Small Studio* (2011) goes further into note-by-note editing.

## References

- McAdams, S. (1989). Segregation of concurrent sounds. I: Effects of frequency modulation coherence. *Journal of the Acoustical Society of America*, 86(6), 2148-2159.
- Senior, M. (2011). *Mixing Secrets for the Small Studio*. Focal Press.
`,
    seo: {
        title: 'Fast retune speed erases the movement between notes | VGP Studio',
        description: 'Fast pitch correction flattens the scoops, slides and vibrato that carry a vocal. Learn how cents and retune speed work and how to tune without losing them.',
        keywords: ['pitch correction', 'retune speed', 'autotune settings', 'vocal tuning tips', 'vibrato', 'melodyne vocal editing'],
    },
};
