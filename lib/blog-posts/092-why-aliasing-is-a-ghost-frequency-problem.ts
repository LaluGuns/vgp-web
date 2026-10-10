import { BlogArticle } from '../blog-data';

export const post092: BlogArticle = {
    slug: 'why-aliasing-is-a-ghost-frequency-problem',
    title: 'Why aliasing is a ghost frequency problem',
    excerpt: 'That harsh digital top end is often aliasing: saturators and clippers create harmonics above the Nyquist limit, and they fold back into your mix as ghost frequencies.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'A digital system can only store frequencies up to half its sample rate, the Nyquist limit.',
        'Saturators and clippers create harmonics above that limit. They fold back down as tones unrelated to your key.',
        'Oversample nonlinear plugins while mixing and mastering, and leave it off while tracking.',
    ],
    figures: {
        fold: {
            type: 'scale',
            caption:
                'A 10 kHz tone through a saturator in a 48 kHz session. The 3rd harmonic at 30 kHz and the 5th at 50 kHz cannot be stored, so they land at 18 kHz and 2 kHz, frequencies that have nothing to do with the note.',
            alt: 'A frequency line from 0 to 60 kHz with the Nyquist limit at 24 kHz. Arrows fold the 30 kHz harmonic down to 18 kHz and the 50 kHz harmonic down to 2 kHz.',
            min: 0,
            max: 60,
            unit: 'kHz',
            ticks: [0, 12, 24, 36, 48, 60],
            markers: [
                { value: 10, label: 'Tone' },
                { value: 24, label: 'Nyquist' },
                { value: 30, label: '3rd harmonic' },
                { value: 50, label: '5th harmonic' },
                { value: 18, label: 'Alias', strong: true },
                { value: 2, label: 'Alias', strong: true },
            ],
            arrows: [
                { from: 30, to: 18 },
                { from: 50, to: 2 },
            ],
            ranges: [
                { from: 0, to: 24, label: 'Stored as it is' },
                { from: 24, to: 60, label: 'Folds back below 24 kHz' },
            ],
        },
        samples: {
            type: 'signal',
            caption:
                'A wave with nine cycles, measured only ten times. The dots fit the fast wave, and they fit a slow one-cycle wave just as well. The converter keeps only the dots, so the slow wave is what plays back.',
            alt: 'A fast sine wave with ten sample dots. A dashed slow wave passes through every dot.',
            rows: [
                {
                    label: 'Nine cycles, ten samples',
                    traces: [{ kind: 'sine', cycles: 9, amp: 0.85, muted: true, label: 'Real signal' }],
                    samples: { count: 10, alias: true },
                },
            ],
        },
    },
    quiz: [
        {
            q: 'In a 48 kHz session, a saturator creates a harmonic at 30 kHz. Where does it end up?',
            options: ['6 kHz', '24 kHz', '30 kHz', '18 kHz'],
            answer: 3,
            why: 'Nyquist is 24 kHz. The harmonic is 6 kHz above it, so it folds to 6 kHz below it: 48 - 30 = 18 kHz.',
        },
        {
            q: 'Why is aliasing worse than ordinary harmonic distortion?',
            options: [
                'It lands between harmonics and cannot be removed',
                'It comes out louder than the harmonic that made it',
                'It builds up mostly on bass notes below 100 Hz',
                'It shifts the pitch of the note it was made from',
            ],
            answer: 0,
            why: 'Harmonics sit at multiples of the note, which the ear hears as tone. Aliases land wherever the fold puts them, often between notes, and they are mixed into the audio for good.',
        },
        {
            q: 'What does oversampling do inside a plugin?',
            options: [
                'Raises the sample rate of the whole session for good',
                'Adds more bits so the harmonics carry less noise',
                'Processes at a higher rate, filters, converts back',
                'Removes the harmonics the plugin would have added',
            ],
            answer: 2,
            why: 'At the higher internal rate the new harmonics have room to exist. The filter removes them before the signal returns to the session rate, so they never fold.',
        },
    ],
    content: `## Hook: saturation that turns the top end metallic

You load a saturation plugin to warm up a vocal or add grit to a bass line. You push the input gain. Instead of the smooth density you hear on tape, the top end turns metallic. A cold glare settles over the track and it starts to sound thin. What you are hearing is aliasing.

The plugin is generating harmonics the session cannot represent. Instead of disappearing, those frequencies fold back into the audible range as ghost tones.

## Why it matters: harmonics with nowhere to go

A digital clipper or saturator creates new harmonics. Start with a 10 kHz tone in a 44.1 kHz session and push the saturator. A harmonic at 20 kHz is fine. The harmonic at 30 kHz is not: the highest frequency a 44.1 kHz session can hold is 22.05 kHz, so 30 kHz cannot exist in your DAW.

It does not vanish. It folds back below the limit and lands at 14.1 kHz. That folded tone has no musical relationship to the note or the key of the song. Stack several saturators across the drum bus and the mix bus and these ghost frequencies pile up, smearing cymbals and vocals.

::figure fold

## Science model: the mathematics of foldback

The ceiling of a digital system is the Nyquist limit, exactly half the sample rate:

$$f_N = \\frac{f_s}{2}$$

A frequency above $f_N$ is stored as a lower one. For a frequency between $f_N$ and $f_s$, the alias lands at:

$$f_{\\text{alias}} = \\left| f_s - f \\right|$$

At 48 kHz the Nyquist limit is 24 kHz, so a harmonic at 35 kHz lands at 13 kHz. Higher harmonics keep folding back and forth across the range. In general the alias sits at $\\left| f - k f_s \\right|$, where $k$ is the whole number that brings the result below $f_N$. The harder you drive a saturator, the more high harmonics it makes, and the more of them fold back into the range you can hear.

::figure samples

::demo aliasing

## DAW experiment: isolate alias noise

You can see aliasing with a test tone and a spectrum analyzer.

1. Set your session to 48 kHz. Insert a signal generator on a track and set it to a pure sine at 10 kHz.
2. Insert a digital saturator or distortion plugin after it, followed by a spectrum analyzer.
3. Bypass the saturator. The analyzer shows a single peak at 10 kHz.
4. Enable the saturator and push the drive.
5. Look below 10 kHz. A clean saturator fed a pure tone can only add energy above the note, so any new peak below it is an alias. Near 2 kHz and 6 kHz is where the 5th and 9th harmonics land.
6. If the plugin has an oversampling switch, turn it on. Those low peaks should drop away.

## Common mistake: oversampling everything, or nothing

One mistake is turning on 8x or 16x oversampling on every plugin in the session. Oversampling runs the process at a multiple of the sample rate inside the plugin, which pushes the Nyquist limit far above the audible range, then filters off the extra harmonics before converting back. It costs CPU, and many plugins add latency while it is on. Across forty channels during tracking, that can mean dropouts and a monitor delay the performer feels.

The opposite mistake is assuming analog-modelled plugins never alias. Some do not oversample at all, or only do it when you export. Test the ones you rely on with the experiment above.

## Producer takeaway: oversample where it counts

Use oversampling selectively. Keep it off while tracking so monitoring stays immediate. Turn it on while mixing and mastering, and focus on nonlinear plugins: clippers, saturators and limiters. 4x is often enough. If a plugin offers no oversampling, render that track from a 96 kHz session to print a cleaner file, then bring it back into your main session.

## References

- Smith, J. O. *Spectral Audio Signal Processing*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/sasp/
- Smith, J. O. *Introduction to Digital Filters with Audio Applications*. CCRMA, Stanford University. https://ccrma.stanford.edu/~jos/filters/
`,
    seo: {
        title: 'Why aliasing is a ghost frequency problem | VGP Studio',
        description: 'Understand digital aliasing and foldback distortion in audio production. Learn how to use oversampling to keep your saturation clean and punchy.',
        keywords: ['aliasing', 'nyquist limit', 'oversampling', 'foldback distortion', 'digital saturation', 'spectrum analyzer'],
    },
};
