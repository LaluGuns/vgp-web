import { BlogArticle } from '../blog-data';

// Twelve hits; the first six are the verse, the last six the chorus.
const AT = [0.03, 0.11, 0.19, 0.27, 0.35, 0.43, 0.53, 0.61, 0.69, 0.77, 0.85, 0.93];
const PEAK = 0.6;

export const post139: BlogArticle = {
    slug: 'loudness-and-dynamic-range-are-different-readings',
    title: 'Loudness, PLR and LRA answer different questions',
    excerpt: 'PLR, PSR and LRA all get called dynamic range. Learn what each one measures, how it is calculated, and which change moves which number.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'PLR and PSR measure how far the peaks stand above the loudness, while LRA measures how far the loudness moves between sections, so they answer for different kinds of dynamics.',
        'Read PSR section by section to find where the limiter flattens the hits, and read LRA over the whole song, never on a loop.',
        'Raise a low chorus PSR with the limiter and clipper settings, widen a narrow LRA with arrangement and automation, and compare both with a reference in the same style.',
    ],
    figures: {
        shapes: {
            type: 'signal',
            caption:
                'Two masters drawn as level envelopes with the same peak level. The first stays at one level with sharp hits: a small LRA and a large PSR. The second has a quiet verse and a dense chorus flattened at the ceiling: a larger LRA and, in the chorus, a small PSR. One integrated reading could describe both.',
            alt: 'Two level plots of twelve hits each, with a peak line at the same height. In the first, every hit is a sharp spike that falls almost to nothing before the next. In the second, the first six hits are small spikes and the last six merge into a dense block with flat tops on the peak line.',
            rows: [
                {
                    label: 'Even sections, sharp hits',
                    unipolar: true,
                    lines: [{ y: PEAK, label: 'Peak' }],
                    traces: [{ kind: 'hits', at: AT, amp: AT.map(() => PEAK), decay: 30, outline: true }],
                },
                {
                    label: 'Quiet verse, flattened chorus',
                    unipolar: true,
                    lines: [{ y: PEAK, label: 'Peak' }],
                    marks: [{ t: 0.5, label: 'Chorus' }],
                    traces: [
                        { kind: 'hits', at: AT.slice(0, 6), amp: AT.slice(0, 6).map(() => 0.3), decay: 30, outline: true },
                        { kind: 'hits', at: AT.slice(6), amp: AT.slice(6).map(() => 1), decay: 16, outline: true, clip: PEAK },
                    ],
                },
            ],
        },
        readings: {
            type: 'scale',
            caption:
                'The worked example: verses at -13 LUFS for two thirds of the song, choruses at -7 LUFS for one third, peaks at -1 dBTP. Integrated loudness comes out at -10 LUFS, so PLR is 9 dB, the chorus PSR is 6 dB and LRA is 6 LU.',
            alt: 'A number line from -16 to 0. Markers at -13 for the verse, -10 for integrated loudness, -7 for the chorus and -1 for the true peak. Three bars show PLR from -10 to -1, chorus PSR from -7 to -1, and LRA from -13 to -7.',
            min: -16,
            max: 0,
            unit: 'dB',
            ticks: [-16, -13, -10, -7, -4, -1],
            markers: [
                { value: -13, label: 'Verse' },
                { value: -10, label: 'Integrated', strong: true },
                { value: -7, label: 'Chorus' },
                { value: -1, label: 'True peak' },
            ],
            ranges: [
                { from: -10, to: -1, label: 'PLR 9 dB' },
                { from: -7, to: -1, label: 'Chorus PSR 6 dB' },
                { from: -13, to: -7, label: 'LRA 6 LU' },
            ],
        },
    },
    quiz: [
        {
            q: 'Verses sit at -13 LUFS short-term for two thirds of a song, choruses at -7 LUFS for one third. The highest true peak is -1 dBTP. What is the PLR?',
            options: ['6 dB', '9 dB', '10 dB', '12 dB'],
            answer: 1,
            why: 'Integrated loudness averages power: 10 log10(1/3 × 10^-0.7 + 2/3 × 10^-1.3) is about -10 LUFS. PLR is -1 - (-10) = 9 dB. Averaging the decibel readings would give -11 and the wrong 10 dB.',
        },
        {
            q: 'You automate every verse down by 3 dB and change nothing else. Which reading moves the most?',
            options: [
                'The PSR in the loudest chorus',
                'The maximum true peak of the song',
                'The loudness range (LRA)',
                'None, because LRA skips the verses',
            ],
            answer: 2,
            why: 'The verse readings fall while the chorus readings stay put, so the spread of short-term loudness widens. The chorus peaks and chorus loudness are untouched, so its PSR stays the same.',
        },
        {
            q: 'Why does one huge snare hit in the last chorus barely change the LRA?',
            options: [
                'LRA uses 3 second readings and ignores the loudest 5%',
                'LRA reads sample peaks, and a snare is too short for them',
                'LRA drops every reading louder than -20 LUFS',
                'LRA only analyses the first minute of a song',
            ],
            answer: 0,
            why: 'A single hit is a small part of a 3 second average, and the 95th percentile keeps the top 5% of readings from setting the result. A gunshot in a film is the example EBU Tech 3342 gives.',
        },
    ],
    content: `## Hook: five readings, one verdict

A modern loudness meter at the end of the master chain shows a column of readings: integrated loudness, true peak, LRA, PLR and sometimes PSR. Most of us read the whole column as one verdict on "dynamic range". Someone online says an LRA of 4 LU means the master is crushed, so you back the limiter off, render again, and the LRA barely moves, because the limiter was never what set it.

The readings measure different things over different stretches of time. Read each one as the answer to its own question and they stop contradicting each other.

## Why it matters: two kinds of dynamics, two kinds of fix

Producers use "dynamic range" for two separate properties of a master: the micro dynamics of hits standing above the body inside a bar, and the macro dynamics of the song moving between sections, both described in the [lesson on the final loudness push](/blog/the-final-loudness-push-that-can-cost-emotion). Limiting and clipping mostly change the first. Arrangement, automation and the balance between sections mostly change the second.

PLR and PSR read the first kind; EBU Tech 3343 calls PLR "a measure of micro-dynamics". LRA reads the second. EBU Tech 3342, the document that defines LRA, says it "should not be confused with other measures like dynamic range or crest factor". Confuse them anyway and you fix the wrong thing: you soften a limiter to raise an LRA it hardly touched, or you see a healthy LRA and miss a chorus pressed flat against the ceiling.

::figure shapes

## Science model: what each reading compares

All of these start from the ITU-R BS.1770 loudness measurement, which the [lesson on LUFS](/blog/why-lufs-is-not-a-magic-number) walks through. They differ in what they compare and over how long.

PLR, the peak to loudness ratio, is the highest true peak in the whole file minus its integrated loudness, as the [lesson on loud masters after normalization](/blog/why-loud-masters-can-sound-smaller-after-normalization) works through. It is one number for the whole song. Because most masters sit against a fixed true-peak ceiling, PLR mostly restates the integrated loudness: with a -1 dBTP ceiling, a -9 LUFS master has a PLR of 8 dB and a -12 LUFS master has 11 dB. One stray peak can also set it, however rare.

PSR, the peak to short-term loudness ratio, makes the same comparison against short-term loudness, the 3 second window, using the highest true peak inside that same window:

$$\\text{PSR} = L_{\\text{TP}} - L_{\\text{S}}$$

So PSR changes as the song plays, and it shows where the peaks have been pulled down toward the body, usually in the loudest chorus. Meters used to calculate it in slightly different ways, which is why an AES engineering brief proposed one shared definition (Shepherd et al., 2017).

LRA, the loudness range, measures how much the short-term loudness varies across the song. The meter takes 3 second readings at least ten times a second, drops every reading below -70 LUFS, then drops every reading more than 20 LU below the loudness of what is left. LRA is the spread of the remaining readings between the 10th and the 95th percentile, in LU:

$$\\text{LRA} = L_{95\\%} - L_{10\\%}$$

The percentiles are there on purpose. A fade-out in the quietest 10% or a single huge hit in the loudest 5% cannot set the result alone. And because LRA compares 3 second averages, a limiter that shaves every snare by the same amount barely moves it. LRA falls when processing treats loud and quiet sections differently, which is what a hard final push does to a chorus.

A worked example ties the four together. Say the verses fill two thirds of a song at -13 LUFS short-term, the choruses fill the other third at -7 LUFS, and the chorus peaks reach -1 dBTP. Integrated loudness averages power, not decibels:

$$\\begin{aligned} L_{\\text{I}} &= 10 \\log_{10}\\left( \\tfrac{1}{3} \\, 10^{-7/10} + \\tfrac{2}{3} \\, 10^{-13/10} \\right) \\\\ &\\approx -10 \\text{ LUFS} \\end{aligned}$$

That is 1 dB louder than the plain average of the readings, because the loud sections weigh more. PLR is then 9 dB, the chorus PSR is 6 dB, and LRA is the 6 LU between verse and chorus.

::figure readings

The two kinds of dynamics have even moved apart across decades of releases. Deruty (2011) measured released music from 1969 to 2010 and found the crest factor falling sharply from around 1990, with no obvious decrease in LRA, as defined in Tech 3342, over the same years. A later peer-reviewed study of tracks from 1967 to 2011 reached the same split: the loudness war reduced how far the peaks stand out, but did not reduce long-term musical dynamics (Deruty and Tardieu, 2014).

The normalization demo isolates the first kind. With normalization on, both loops play at the same loudness, so what you hear is how far the hits rise above the body, the distance PLR and PSR read. A loop has no verse and no chorus, so LRA would have nothing to report here.

::demo normalization

## DAW experiment: pull the readings apart

1. Put a loudness meter last on your master bus that shows integrated loudness, maximum true peak, LRA and short-term loudness. If it also shows PSR, use that.
2. Play the master from the first bar to the last. Write down integrated loudness, maximum true peak and LRA, and work out PLR as true peak minus integrated loudness.
3. Loop the quietest verse, then the loudest chorus. For each, note the short-term loudness and the highest true peak, and work out PSR if the meter does not show it.
4. Automate every verse down by 3 dB and play the whole song again. LRA goes up, the chorus PSR stays where it was, and integrated loudness drops a little.
5. Remove the automation. Raise the limiter input by 3 dB with the ceiling unchanged and play the whole song again.
6. Take every reading again. Integrated loudness rises, PLR falls by about the same amount, and the chorus PSR drops. If LRA falls as well, the limiter is working harder on the chorus than on the verse.
7. Take the same readings on a released track in the same style, section by section.

Each change moved the reading that matches the kind of dynamics it touched. Step 6 is the one to watch: an LRA that shrinks under a harder limiter means the chorus is losing its lift over the verse.

## Common mistake: grading a master by one reading

A single reading makes a poor score. A high PLR can come from one snare hit in an otherwise flat master. A low LRA is normal for a club track built to hold one energy level, and it says nothing about whether the kick still punches. A wide LRA in a ballad does not prove its choruses are intact. Compare readings with references in the same style, and listen before you act on any of them.

The second mistake is reading LRA on a loop or a single section. With nothing to compare, the number means little, and Tech 3342 warns that very short programmes with silence at the start or end can read misleadingly high.

## Producer takeaway: pick the question first

Before you change anything, decide what you are asking. How loud will it play: integrated loudness. How much room do the peaks have across the whole file: PLR. Where is the limiter flattening the hits: PSR, section by section. How far does the song move: LRA.

I keep the two kinds of fix apart. Limiter and clipper settings are for the hits; arrangement and automation are for the sections. With normalization on, a streaming service matches the integrated loudness away, and a gain change keeps every distance the other three readings measure, so those distances are what the listener still hears.

## References

- Deruty, E. (2011). 'Dynamic range' & the loudness war. *Sound On Sound*, September 2011. https://www.soundonsound.com/sound-advice/dynamic-range-loudness-war
- Deruty, E., & Tardieu, D. (2014). About dynamic processing in mainstream music. *Journal of the Audio Engineering Society*, 62(1/2), 42-55.
- European Broadcasting Union. (2023). *Tech 3342: Loudness range: A measure to supplement EBU R 128 loudness normalization* (Version 4). EBU. https://tech.ebu.ch/docs/tech/tech3342.pdf
- European Broadcasting Union. (2023). *Tech 3343: Guidelines for production of programmes in accordance with EBU R 128* (Version 4). EBU. https://tech.ebu.ch/docs/tech/tech3343.pdf
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Shepherd, I., Grimm, E., Tapper, P., Kahsnitz, M., & Kerr, I. (2017). Measuring micro-dynamics, a first step: Standardizing PSR, the peak to short-term loudness ratio. *Audio Engineering Society Convention 143*, e-Brief 373.
`,
    seo: {
        title: 'Loudness, PLR and LRA answer different questions | VGP Studio',
        description: 'PLR, PSR and LRA all get called dynamic range. What each one measures, how EBU and AES define it, and which mastering change moves which reading.',
        keywords: ['PLR peak to loudness ratio', 'PSR meter', 'loudness range LRA', 'EBU Tech 3342', 'micro and macro dynamics', 'mastering meters'],
    },
};
