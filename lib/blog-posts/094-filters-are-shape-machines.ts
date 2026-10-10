import { BlogArticle } from '../blog-data';

// Butterworth high-pass filters at 100 Hz, built from biquad sections with the standard Q values.
const highpass = (qs: number[]) => qs.map((q) => ({ type: 'highpass' as const, freq: 100, q }));

export const post094: BlogArticle = {
    slug: 'filters-are-shape-machines',
    title: 'Filters are shape machines',
    excerpt: 'The slope of a filter decides how fast it cuts, and a normal EQ filter also shifts timing near its cutoff. Here is when that matters and when it does not.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Each pole of a filter adds 6 dB per octave of slope, so a high-pass setting is only complete with its slope.',
        'A minimum-phase filter also shifts the phase of frequencies well above its cutoff, where it no longer cuts at all.',
        'That shift matters when filtered and unfiltered versions of one sound are summed, so filter related tracks alike.',
    ],
    figures: {
        slopes: {
            type: 'spectrum',
            mode: 'gain',
            dbRange: [-54, 6],
            range: [20, 2000],
            caption:
                'Three Butterworth high-pass filters at 100 Hz. All are 3 dB down at the cutoff. One octave lower, at 50 Hz, they are 12, 24 and 48 dB down.',
            alt: 'Gain against frequency for three high-pass filters with the same 100 Hz cutoff. Above the cutoff all three are flat at 0 dB. Below it the 12 dB per octave curve falls gently, the 24 dB curve twice as fast and the 48 dB curve almost straight down.',
            curves: [
                { kind: 'eq', label: '12 dB/oct', dashed: true, bands: highpass([0.7071]) },
                { kind: 'eq', label: '24 dB/oct', dotted: true, bands: highpass([0.5412, 1.3066]) },
                { kind: 'eq', label: '48 dB/oct', bands: highpass([0.5098, 0.6013, 0.9, 2.5629]) },
            ],
            marks: [{ f: 100, label: 'Cutoff' }],
        },
        shift: {
            type: 'signal',
            caption:
                'Test tones through a 12 dB per octave high-pass at 100 Hz, two cycles in each row. At the cutoff the tone is 3 dB down and shifted a quarter cycle (90 degrees). Two octaves above, the level is untouched, yet the wave is still shifted by about 21 degrees.',
            alt: 'Two plots, each comparing an input sine with the filtered output. At 100 Hz the output is smaller and shifted a quarter cycle. At 400 Hz the output is the same height and shifted slightly.',
            rows: [
                {
                    label: 'At the cutoff, 100 Hz',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.8, muted: true, label: 'Input' },
                        { kind: 'sine', cycles: 2, amp: 0.566, phase: 90, label: 'After the filter' },
                    ],
                },
                {
                    label: 'Two octaves above, 400 Hz',
                    traces: [
                        { kind: 'sine', cycles: 2, amp: 0.8, muted: true },
                        { kind: 'sine', cycles: 2, amp: 0.8, phase: 21 },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A high-pass at 120 Hz is set to 12 dB per octave. Roughly how far down is 60 Hz?',
            options: ['3 dB', '6 dB', '12 dB', '48 dB'],
            answer: 2,
            why: '60 Hz is one octave below the cutoff, and the slope is 12 dB per octave. A 48 dB per octave filter would have it 48 dB down, effectively gone.',
        },
        {
            q: 'In the null test, why is the residual still loud at 80 Hz when the high-pass sits at 40 Hz?',
            options: [
                'The filter adds a small boost around 80 Hz',
                'The filter still cuts 80 Hz by about 6 dB',
                'The EQ runs in linear-phase mode by default',
                'The filter moves 80 Hz in time, not level',
            ],
            answer: 3,
            why: 'A minimum-phase filter changes phase well above its cutoff. The level at 80 Hz is untouched, but the timing is not, so subtracting the original leaves a strong difference.',
        },
        {
            q: 'When does the phase shift of a high-pass filter cause the most trouble?',
            options: [
                'When it is set on a pad with no other layers',
                'When it is summed with an unfiltered copy',
                'When the session runs at 96 kHz or above',
                'When it sits on the master bus of the mix',
            ],
            answer: 1,
            why: 'On its own a track rarely sounds damaged. Summed with a related, unfiltered track, such as the other kick mic or the bass DI, the shifted low end partly cancels.',
        },
    ],
    content: `## Hook: the high-pass on every track

A common piece of mixing advice is to clean up the low end by high-passing everything except the kick and the bass. So you put a steep 24 or 48 dB per octave high-pass at 120 Hz on the vocal, the guitars and the synths. Each track looks tidy on the analyzer. Played together, the mix sounds thinner than before, and the drums feel less solid.

Some of those tracks had useful energy below 120 Hz, and the filters removed it. Every one of those filters also changed the timing of the frequencies around its cutoff, which matters as soon as filtered and unfiltered versions of a related sound meet.

## Why it matters: slope and cutoff decide what survives

A high-pass filter lets everything above its cutoff through and turns down what is below. The cutoff is usually the point where the level is 3 dB down. The slope says how fast the level falls after that, in decibels per octave. Each pole of the filter adds 6 dB per octave: a first-order filter falls 6 dB per octave, a second-order 12, a fourth-order 24 and an eighth-order 48.

::figure slopes

So "a high-pass at 120 Hz" is only half a setting. At 12 dB per octave, 60 Hz is still there, 12 dB down. At 48 dB per octave it is effectively gone. On a vocal, a gentle filter set below the lowest notes of the part removes rumble and keeps the body. A steep one at the same frequency removes more than you meant to.

::demo filter

## Science model: why ordinary filters move time

A normal analog or digital EQ filter is minimum phase. In that kind of filter, changing the level of a band also changes its phase, and the two cannot be separated. Each pole contributes up to 90 degrees of phase shift. At the cutoff, a second-order high-pass has shifted the phase by 90 degrees and a fourth-order one by 180.

::figure shift

A phase shift that changes with frequency delays different frequencies by different amounts. The useful measure is group delay, the delay of the energy around each frequency:

$$\\tau_g(f) = -\\frac{1}{2\\pi} \\frac{d\\phi}{df}$$

Here $\\phi$ is the phase in radians. Where the phase curve bends, around the cutoff, the group delay rises. A fourth-order Butterworth high-pass at 40 Hz delays the content near 40 Hz by about 15 ms. At 80 Hz the delay is about 3 ms, and at 160 Hz it is under 1 ms. Steeper filters bend the phase harder and delay more.

On a single track this is usually hard to hear: the lowest part of a kick or bass gets slightly softer and longer. The trouble starts when the filtered track is added to something that carries the same sound without that filter: the inside and outside kick mics, a bass DI and its amp, a parallel bus filtered differently from the dry tracks. Near the cutoff the two versions no longer line up, and they partly cancel.

A linear-phase filter avoids this by delaying every frequency by the same amount, so the waveform keeps its shape. The price is latency and pre-ringing: a steep linear-phase filter spreads a little of each transient's energy before the hit, which can sound like a soft swell into a drum.

## DAW experiment: hear what a filter changes above its cutoff

1. Put a kick or bass loop on track A and duplicate it to track B. Flip B's polarity and check that the two cancel to silence.
2. On B, insert an EQ with a high-pass at 40 Hz, 24 dB per octave, in its normal (minimum-phase) mode.
3. Play both with B still flipped. What you hear is everything the filter changed.
4. Listen above the sub. The residual holds more than the content below 40 Hz: around 80 Hz it is about as loud as the original, and it is still clearly there at 150 Hz, where the filter does not cut at all.
5. Switch the EQ to linear-phase mode, if it has one. The residual above about 80 Hz almost disappears, because now the filter only removes level.
6. Remove the polarity flip, solo B, and switch between the two filter modes on a single hit. Listen to the start of the note.

The minimum-phase filter moves the low end in time well above its cutoff, and the null test makes that obvious. On its own the filtered kick sounds nearly the same. Summed with the original, the difference is loud.

## Common mistake: filtering related tracks differently

The mistake is filtering one of two related signals and not the other. A high-pass on the kick inside mic but not the outside mic, on the bass amp but not the DI, or on a parallel drum bus but not the dry drums shifts the phase in one path only. The low end of the sum comes out thinner than either track alone, and the usual response is to boost it, which does not fix a cancellation. Filter related tracks with the same settings, or check the sum with the polarity switch and keep whichever setting gives the fullest low end.

The opposite mistake is reaching for linear phase everywhere. It adds latency, and on drums a steep linear-phase filter in the low end can smear energy before the hit. Use it where the phase shift is a real problem, such as on a bus that is summed with a dry copy.

## Producer takeaway: set slope and cutoff on purpose

Treat the slope as part of the decision. For general cleanup, a 12 dB per octave high-pass set below the lowest note of the part removes rumble with little phase shift. Save 24 and 48 dB per octave for real problems such as stand rumble or mains hum. When a filtered track shares a sound with another track, filter both the same way, or check the sum in mono with the polarity switch before you call the low end finished.

## References

- Smith, J. O. (2007). *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
- MIT OpenCourseWare. *6.003 Signals and Systems*, Fall 2011. https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/
`,
    seo: {
        title: 'Filters are shape machines | VGP Studio',
        description: 'How filter slopes work at 6 dB per octave per pole, why minimum-phase filters shift timing near the cutoff, and when linear phase is worth it.',
        keywords: ['audio filters', 'filter slope', 'high-pass filter', 'group delay', 'linear-phase EQ', 'pre-ringing'],
    },
};
