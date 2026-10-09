import { BlogArticle } from '../blog-data';

const WIDE = [57, 64, 69, 72, 76, 81, 84, 88, 84, 81, 76, 72, 69, 64, 60, 57];
const NARROW = [69, 72, 76, 72, 69, 72, 76, 72, 69, 72, 76, 72, 69, 72, 76, 72];

export const post104: BlogArticle = {
    slug: 'neo-synthwave-music-for-coding-and-tech-content',
    title: 'Neo Synthwave for coding videos: an arpeggio that stays out of the way',
    excerpt: 'Background sound that keeps changing pitch disrupts memory more than sound that repeats. How to write a synthwave arpeggio that moves without pulling focus.',
    category: 'genre-guides',
    publishedAt: '2026-07-19',
    updatedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'Background sound that keeps changing pitch disrupts verbal memory more than a repeating sound, so a leaping arpeggio costs a viewer more focus than a narrow one.',
        'Keep the arpeggio in a small range with gaps in the pattern, and let the harmony move slowly underneath it.',
        'Watch the delay: a dotted-8th echo with high feedback fills every gap you left, so keep feedback low or filter the repeats.',
    ],
    figures: {
        range: {
            type: 'notes',
            caption:
                'The same A minor chord arpeggiated two ways. The grey bar leaps across more than two octaves and lands on a new pitch every 16th. The second bar cycles three notes inside a fifth, so the pattern repeats every beat.',
            alt: 'Piano roll of two bars over an A minor chord. Bar 1, in grey, runs 16th notes from A3 up to E6 and back down. Bar 2 repeats A4, C5, E5, C5 four times.',
            chords: [
                { at: 0, label: 'Am' },
                { at: 4, label: 'Am' },
            ],
            notes: [
                ...WIDE.map((pitch, i) => ({ start: i * 0.25, length: 0.25, pitch, muted: true })),
                ...NARROW.map((pitch, i) => ({ start: 4 + i * 0.25, length: 0.25, pitch })),
            ],
        },
        clock: {
            type: 'rhythm',
            caption:
                'An arpeggio that fills every 16th competes for attention. Leaving gaps keeps the pulse and gives the ear somewhere to rest, while the kick and snare hold the grid.',
            alt: 'Step grid. A busy arpeggio plays all sixteen steps. A clock-like arpeggio plays eight with gaps. Kick on every beat, snare on beats two and four.',
            rows: [
                { label: 'Busy arpeggio', hits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
                { label: 'Arpeggio, gaps', hits: [0, 2, 3, 6, 8, 10, 11, 14], focus: true },
                { label: 'Kick', hits: [0, 4, 8, 12] },
                { label: 'Snare', hits: [4, 12] },
            ],
        },
        delay: {
            type: 'bars',
            min: 0,
            max: 650,
            unit: 'ms',
            caption:
                'Delay times at 100 BPM, from 60,000 / 100 = 600 ms per beat. The dotted 8th, 450 ms, is the classic synthwave echo: each repeat lands three 16ths after its note, often on a step the arpeggio left empty, so with high feedback the echoes fill the gaps.',
            alt: 'Four bars: quarter note 600 ms, dotted 8th 450 ms, 8th note 300 ms and 16th note 150 ms. The dotted 8th bar is in the accent, the others in grey.',
            bars: [
                { label: 'Quarter', value: 600, display: '600 ms', dim: true },
                { label: 'Dotted 8th', value: 450, display: '450 ms' },
                { label: '8th', value: 300, display: '300 ms', dim: true },
                { label: '16th', value: 150, display: '150 ms', dim: true },
            ],
        },
    },
    quiz: [
        {
            q: 'Two arpeggios play at the same level. Which is more likely to disrupt a viewer reading code?',
            options: [
                'Three notes inside a fifth, repeating each beat',
                'One note repeated on every 8th of the bar',
                'A slow pad chord that changes every four bars',
                'Sixteen notes leaping across two octaves',
            ],
            answer: 3,
            why: 'Jones and Macken found that tone sequences that keep changing pitch disrupt serial recall, while a repeated tone disrupts much less. The leaping pattern changes on every note.',
        },
        {
            q: 'At 120 BPM, what is the dotted-8th delay time?',
            options: ['250 ms', '375 ms', '500 ms', '750 ms'],
            answer: 1,
            why: 'A beat at 120 BPM lasts 500 ms. An 8th is 250 ms, and a dotted 8th is 1.5 times that: 375 ms.',
        },
        {
            q: 'You leave gaps in the arpeggio, then add a dotted-8th delay at 60 percent feedback. What happens?',
            options: [
                'The gaps stay open because the delay is in time',
                'The kick loses its attack on every beat',
                'The repeats fill the gaps with more changing notes',
                'The arpeggio sounds narrower in stereo',
            ],
            answer: 2,
            why: 'Each repeat is another note landing between the ones you played. High feedback stacks several of them, so the pattern gets busy again.',
        },
    ],
    content: `## Hook: the tutorial where the music wins

You put a Neo Synthwave track under a 20-minute coding tutorial. The arpeggio runs up and down two octaves in 16ths, a dotted-8th echo bounces between the speakers, and a bright lead comes in every eight bars. For the first minute it makes a static screen feel alive.

Then you try to follow your own tutorial with the sound on. You lose the variable name you were holding in your head, scroll back, and notice that your attention keeps drifting to the arpeggio. A comment under the video says the music is great and impossible to work to.

## Why it matters: background music still uses attention

Coding, reading documentation and following a spoken explanation all keep words and symbols in short-term memory. Background sound can get in the way of that even when you are trying to ignore it. For a creator, music that pulls focus makes the tutorial harder to follow. For someone working to the music, it costs the very concentration they put it on for.

Synthwave makes this easy to get wrong, because its signature moves are about motion: arpeggios, echoes and a soaring lead. The question is which kinds of motion cost attention and which do not.

## Science model: changing sounds disrupt more than steady ones

Jones and Macken (1993) asked people to remember lists while tones they were told to ignore played in the background. A sequence of tones that kept changing in pitch disrupted recall. A single tone repeated over and over disrupted it much less. The finding gave its name to the changing-state idea: the disruption comes from sound that keeps changing from one moment to the next. Salamé and Baddeley (1989) found that music with vocals disrupted recall more than instrumental music, and in their first experiment both disrupted it more than quiet.

These were memory tests in a lab, not coding sessions, so treat them as a direction rather than a rule. The direction is clear, though. An arpeggio that lands on a new pitch every 16th, across a wide range, is a strong changing-state signal. One that cycles a few close notes is closer to a steady one.

::figure range

The rhythm matters too. Gaps in the pattern give the ear moments with nothing new to track, while the drums keep the pulse.

::figure clock

Echoes add notes. A tempo-synced delay is part of the synthwave sound, and at 100 BPM its times follow from one beat lasting 60,000 / 100 = 600 ms.

::figure delay

Brightness is the last lever. A low-pass filter on the arpeggio takes the edge off each new note and pushes the part behind the pad. Sweep one here and listen to how far down the cutoff can go before the part loses its shape.

::demo filter

## DAW experiment: test your arpeggio on your own memory

This is a rough version of the lab task. It will not prove anything, but it makes the effect easy to notice.

1. Set 100 BPM. Put an A minor pad on one track and an arpeggiator on another, playing 16ths up and down across two octaves.
2. Write ten random seven-digit numbers. Loop the music, read one number once, look away for ten seconds, then write it down. Do five numbers and count the digits you got in the right place.
3. Narrow the arpeggio to three notes inside a fifth, add gaps as in the figure, and run the other five numbers.
4. Add a dotted-8th delay, 450 ms, at 60 percent feedback. Listen to how the gaps fill. Bring the feedback down to about 20 percent and low-pass the delay return around 3 kHz.
5. Low-pass the arpeggio itself until it sits behind the pad.
6. Keep the version you can work to, then check it still has enough motion to carry the video.

## Common mistake: building every bar like a trailer

The first mistake is writing the cue as if it were a 15-second trailer: a wide arpeggio, a big snare, an echo on everything and the lead playing all the time. Each of those works as an event. Running for twenty minutes, they keep pulling the viewer away from the screen.

The second is fixing the arpeggio and forgetting the delay. A narrow, gapped pattern with a dotted-8th echo at high feedback ends up as busy as the one you replaced, because every repeat is another note in the gaps.

The third is the lead. A bright lead line that changes pitch on every note is the most changing sound in the mix. Save it for a moment the edit has earned, like a product reveal or a finished build.

## Producer takeaway: motion with few surprises

Let the harmony and the filter move slowly, and keep the note-to-note changes small. A narrow, repeating arpeggio with gaps, a low-feedback echo and a lead held back for the big moments still sounds like synthwave. It just gives the viewer room to think.

## References

- Jones, D. M., & Macken, W. J. (1993). Irrelevant tones produce an irrelevant speech effect: Implications for phonological coding in working memory. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 19(2), 369-381.
- Salamé, P., & Baddeley, A. (1989). Effects of background music on phonological short-term memory. *The Quarterly Journal of Experimental Psychology Section A*, 41(1), 107-122.
`,
    seo: {
        title: 'Neo Synthwave for coding videos | VGP Studio',
        description: 'Background sound that keeps changing pitch disrupts memory more than steady sound. Write a synthwave arpeggio that moves without pulling focus.',
        keywords: ['neo synthwave', 'music for coding videos', 'synthwave arpeggio', 'irrelevant sound effect', 'dotted eighth delay', 'background music focus'],
    },
};
