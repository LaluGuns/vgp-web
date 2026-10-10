import { BlogArticle } from '../blog-data';

export const post130: BlogArticle = {
    slug: 'stop-high-passing-everything-by-default',
    title: 'Set each high-pass from the lowest note',
    excerpt: 'A high-pass on every track removes notes as well as rumble. Work out each part\'s lowest note, filter only what sits below it, and only when it causes a problem.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Find the lowest note each part plays and convert it to hertz before you set a high-pass, because no single cutoff fits a piano, a guitar and a voice.',
        'Filter only energy below that note that is causing a problem, such as rumble, stand thumps or sub that drives a compressor, and leave the filter off otherwise.',
        'When rumble sits close to the lowest note, keep the cutoff about an octave below the note and make the slope steeper instead of raising the cutoff.',
    ],
    figures: {
        lowest: {
            type: 'scale',
            min: 0,
            max: 220,
            unit: 'Hz',
            ticks: [0, 50, 100, 150, 200],
            caption:
                'The lowest note of some common instruments, from the equal-tempered pitch of each note. A blanket high-pass at 100 Hz sits above the lowest notes of a piano, a bass, a cello and a guitar.',
            alt: 'A number line from 0 to 220 hertz with markers for the lowest notes of piano at 27.5 Hz, bass guitar at 41.2 Hz, cello at 65.4 Hz, guitar at 82.4 Hz, viola at 130.8 Hz and violin at 196 Hz. A bold marker at 100 Hz shows a blanket high-pass.',
            markers: [
                { value: 27.5, label: 'Piano A0' },
                { value: 41.2, label: 'Bass E1' },
                { value: 65.4, label: 'Cello C2' },
                { value: 82.4, label: 'Guitar E2' },
                { value: 100, label: 'Blanket HPF', strong: true },
                { value: 130.8, label: 'Viola C3' },
                { value: 196, label: 'Violin G3' },
            ],
        },
        cost: {
            type: 'spectrum',
            mode: 'gain',
            range: [20, 2000],
            dbRange: [-24, 3],
            caption:
                'Three high-passes, drawn from the real filter maths, against a guitar\'s low E at 82.4 Hz. At 100 Hz and 12 dB per octave the note loses 5 dB; at 24 dB per octave it loses 7.6 dB. A 12 dB per octave filter at 41 Hz, an octave below the note, costs it 0.26 dB.',
            alt: 'Gain over frequency from 20 Hz to 2 kHz with a mark at 82 Hz. Two curves cut off around 100 Hz: a grey one and a solid one that falls more steeply. A dotted third curve cuts off around 41 Hz and is close to 0 dB at the mark.',
            marks: [{ f: 82.4, label: 'Low E' }],
            curves: [
                { kind: 'eq', label: '100 Hz, 12 dB/oct', muted: true, bands: [{ type: 'highpass', freq: 100 }] },
                {
                    kind: 'eq',
                    label: '100 Hz, 24 dB/oct',
                    bands: [
                        { type: 'highpass', freq: 100, q: 0.5412 },
                        { type: 'highpass', freq: 100, q: 1.3066 },
                    ],
                },
                { kind: 'eq', label: '41 Hz, 12 dB/oct', dotted: true, bands: [{ type: 'highpass', freq: 41 }] },
            ],
        },
    },
    quiz: [
        {
            q: 'The verse melody drops to G2, MIDI note 43. What is the frequency of its fundamental?',
            options: ['About 49 Hz', 'About 98 Hz', 'About 131 Hz', 'About 196 Hz'],
            answer: 1,
            why: 'G2 is 26 semitones below A4, so its fundamental is 440 × 2^(-26/12), about 98 Hz.',
        },
        {
            q: 'A 12 dB per octave high-pass is set at 100 Hz. Roughly how much does it take off a guitar\'s low E at 82 Hz?',
            options: ['0.3 dB', '3 dB', '5 dB', '12 dB'],
            answer: 2,
            why: 'The note sits below the cutoff, where the filter is already more than 3 dB down. The formula gives about 5 dB for a second-order filter.',
        },
        {
            q: 'Stand rumble sits just below the lowest note of an acoustic guitar. What is the better move?',
            options: [
                'Keep the cutoff low and make the slope steeper',
                'Raise the cutoff above the lowest note',
                'Pull the fader down until the rumble goes',
                'Add a low shelf cut that starts at 300 Hz',
            ],
            answer: 0,
            why: 'A steeper slope cuts harder below the cutoff without moving it into the notes. Raising the cutoff removes part of the guitar along with the rumble.',
        },
    ],
    content: `## Hook: the template filter

Your mix template opens with a high-pass already on every channel except kick and bass: 100 Hz, 24 dB per octave, set once years ago. The choruses sound tidy. In the second verse the singer drops low and the piano's left hand plays octaves under him, and suddenly the song sounds like it moved into a smaller room. Nothing is wrong on any one track, so you do not suspect the filters you stopped seeing long ago.

## Why it matters: a filter cannot see the notes

A high-pass set from a template does not know what the part plays. On a track whose lowest note sits well above the cutoff it removes only what is under the part, and that can be useful. On a track that plays low notes it removes those notes' fundamentals, and the part loses weight in exactly the passages where it was meant to have the most.

::figure lowest

A high-pass belongs on a track when there is energy below the part's lowest note and that energy is causing a problem. Good targets are traffic and air-conditioning rumble, stand and floor thumps, handling noise, the low thud of a plosive, and sub energy on a synth patch that has no musical job. Small speakers barely reproduce some of it, but it still moves meters, uses headroom and makes compressors react, including a bus compressor that hears the whole mix (a [filter in the sidechain](/blog/sidechain-is-more-than-kick-ducking-bass) keeps the lows from driving one). Anything at or above the lowest note is the part itself. Cutting there is a tone decision, made in the mix like any other EQ move.

## Science model: from note to cutoff

Every note has a frequency you can calculate. In equal temperament, with A4 at 440 Hz and MIDI note number $m$:

$$f = 440 \\times 2^{(m - 69)/12}$$

A guitar's low E is MIDI note 40, so $f = 440 \\times 2^{-29/12} \\approx 82.4$ Hz. A G2 at the bottom of a low verse melody is note 43, about 98 Hz.

The cutoff of a high-pass is the point where the filter is already 3 dB down, and it still trims a little above that. For a Butterworth high-pass of order $n$, a common EQ high-pass shape, the gain at frequency $f$ with cutoff $f_c$ is:

$$G(f) = 10 \\log_{10} \\frac{(f/f_c)^{2n}}{1 + (f/f_c)^{2n}}$$

Order 2 is 12 dB per octave, order 4 is 24 (Zölzer, 2011). Put the low E through a 12 dB per octave filter at 100 Hz and it loses 5 dB. The template's 24 dB per octave version takes 7.6 dB. The G2 loses 3.2 dB to the gentler filter. Move the cutoff an octave below the low E, to 41 Hz, and the note loses 0.26 dB.

::figure cost

The loss is easy to miss because the pitch survives. The ear works out a note's pitch from its harmonics even when the fundamental is weak or missing (Moore, 2012), so the filtered piano still plays the right notes. It just sounds lighter, and lighter is hard to pin on a filter when nothing sounds wrong.

To hear where that happens, switch the demo to high-pass and raise the cutoff slowly from the bottom. Stop at the first point where the chords sound lighter, then read the cutoff.

::demo filter

When rumble sits close to the lowest note, there is a better move than raising the cutoff: keep it about an octave below the note and make the slope steeper. A 24 dB per octave filter at 41 Hz costs the low E almost nothing and cuts content an octave below the cutoff by about 24 dB. Steeper filters shift the phase more around the cutoff, which matters when the track is mixed with a related one; the [lesson on filters](/blog/filters-are-shape-machines) explains why.

## DAW experiment: audit the filters

1. Open a mix with many high-passes, or your template, and list every filtered track with its cutoff and slope.
2. For each part, find the lowest note it plays in the song, in the piano roll or by ear, and convert it to hertz with a note chart or the formula above.
3. Bypass the filter, solo the track briefly and watch an analyzer during a quiet passage. Note anything below the lowest note: rumble, thumps, hum.
4. If there is nothing down there, delete the filter. If there is, set the cutoff about an octave below the lowest note at 12 dB per octave, and steepen the slope only if the rumble is still audible.
5. Unsolo and loop the section with the lowest notes. Compare the old filters with the new set at matched level.
6. If the low mids now feel crowded, find the part that crowds them and cut it there with a bell, instead of raising every filter again.

The section with the low notes should get its weight back, while the choruses sound about the same, because most of the old filters were not doing anything there.

## Common mistake: one cutoff for every part

The habit is a single cutoff on every non-bass track because the low end should be clean. A piano, a guitar, a cello and a low voice all reach different depths, so one cutoff is too high for some and pointless for others. In a sparse arrangement with no bass, such as a piano ballad or a guitar and voice, those lows are the whole low end of the record.

The second mistake is using a high-pass to fix mud. Low-mid build-up usually sits somewhere between about 200 and 500 Hz, above most cutoffs, and a filter raised high enough to reach it takes the body of the part with it. A bell on the part that causes the build-up is the precise tool; the [lesson on masking and mud](/blog/the-masking-problem-producers-hear-as-mud) shows how to find it.

## Producer takeaway: filter for a reason

A high-pass is a fix for a specific problem. Name the problem first: rumble, thumps, a compressor reacting to sub, a low part masking the bass. Set the cutoff from the lowest note, about an octave under it, and set the slope from how close the problem sits to the music. If you cannot name a problem, leave the low end alone and spend the time on the balance.

## References

- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Zölzer, U. (Ed.). (2011). *DAFX: Digital Audio Effects* (2nd ed.). Wiley.
`,
    seo: {
        title: 'Set each high-pass from the lowest note | VGP Studio',
        description: 'A high-pass on every track removes notes as well as rumble. Convert each part\'s lowest note to hertz and filter only the energy below it that causes trouble.',
        keywords: ['high-pass filter', 'HPF mixing', 'low cut', 'note frequency', 'rumble removal', 'filter slope'],
    },
};
