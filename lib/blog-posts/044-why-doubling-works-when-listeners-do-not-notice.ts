import { BlogArticle } from '../blog-data';

export const post044: BlogArticle = {
    slug: 'why-doubling-works-when-listeners-do-not-notice',
    title: 'Why a vocal double works best unnoticed',
    excerpt: 'A double should make the lead feel bigger without sounding like a second singer. Tuck it under the lead, filter it, and fix the consonants that give it away.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'The brain groups a tight double with the lead into one voice, and the small differences between the takes are heard as thickness.',
        'The illusion breaks when the double is nearly as loud as the lead or when its hard consonants land at a clearly different moment.',
        'Find the level where you first hear a second singer, then pull the double back from there.',
    ],
    figures: {
        flam: {
            type: 'signal',
            caption:
                'A hard consonant in the lead and in the double. When the double lands close to the lead, the two fuse into one attack. When it lands clearly later, you hear a second click, a flam, and the double gives itself away.',
            alt: 'Two plots of short decaying bursts. In the first, the lead burst and a smaller dashed double burst start almost together. In the second, the dashed double burst starts well after the lead burst has faded.',
            rows: [
                {
                    label: 'Double close to the lead',
                    traces: [
                        { kind: 'hits', at: [0.12], decay: 26, cycles: 60, label: 'Lead' },
                        { kind: 'hits', at: [0.135], amp: [0.6], decay: 26, cycles: 60, dashed: true, label: 'Double' },
                    ],
                },
                {
                    label: 'Double late',
                    traces: [
                        { kind: 'hits', at: [0.12], decay: 26, cycles: 60, label: 'Lead' },
                        { kind: 'hits', at: [0.42], amp: [0.6], decay: 26, cycles: 60, dashed: true, label: 'Double' },
                    ],
                },
            ],
        },
        stage: {
            type: 'stereo',
            title: 'Where doubles sit',
            caption:
                'Two common places for doubles: one tucked straight behind the lead, or a pair panned wide. Either way they sit further back and lower than the lead, so the lead stays the voice the listener follows.',
            alt: 'Top-down mix view. The lead vocal sits in the centre at the front. A centre double sits behind it and is dimmer. A left and a right double sit wide and further back, also dimmer.',
            items: [
                { label: 'Lead', pan: 0, depth: 0.12 },
                { label: 'Centre double', pan: 0, depth: 0.45, fade: 0.5 },
                { label: 'Double L', pan: -0.75, depth: 0.6, fade: 0.5 },
                { label: 'Double R', pan: 0.75, depth: 0.6, fade: 0.5 },
            ],
        },
    },
    quiz: [
        {
            q: 'Why does a real double sound thicker than a delayed copy of the lead?',
            options: [
                'A delayed copy acts like a short reverb and blurs the lead',
                'A delayed copy is heard as a separate echo behind the lead',
                'A real double is sung harder, so its extra harmonics fill it out',
                'Its differences keep changing, so no fixed comb pattern forms',
            ],
            answer: 3,
            why: 'A fixed delay cancels the same frequencies all the time, which sounds hollow. A second take varies in pitch and timing from moment to moment, which the ear hears as size.',
        },
        {
            q: 'You copy the lead and delay it by 10 ms. Summed at equal level, where is the lowest notch?',
            options: ['10 Hz', '50 Hz', '100 Hz', '1 kHz'],
            answer: 1,
            why: 'The copy is half a cycle late when the period is 20 ms, which is 50 Hz. Further notches fall every 100 Hz above that.',
        },
        {
            q: 'At the level you chose, the t and s sounds of the chorus flam. What do you fix first?',
            options: [
                'Turn the double down by another 3 dB',
                'Put the same short reverb on both tracks',
                'Align or cut the t and s in the double',
                'Pan the double away from the centre',
            ],
            answer: 2,
            why: 'The flam comes from consonants landing twice. Lining them up, or letting the lead carry them alone, removes it without making the double quieter than it needs to be.',
        },
    ],
    content: `## Hook: two singers where you wanted one big voice

You record a double of the chorus to make it bigger. Then you push its fader until you can clearly hear it, because that seems to be the point of recording it. Now the chorus sounds like two singers standing side by side, and the lead has lost its focus.

A double is not meant to be heard as a second performance. It works when the lead feels thicker and wider and the listener cannot point to the reason.

## Why it matters: a loud double blurs the lead

No two takes line up exactly. Overlapping vowels blend well enough. Hard consonants and s sounds do not: when the double is loud, each t and s arrives twice, a moment apart, and the words get a smeared edge.

The centre of the mix also changes. It now holds two voices at similar levels, and the listener's attention has no clear place to land. Turning the double up for more width makes this worse, because the extra width comes with a second set of words.

## Science model: grouping, not echo

The brain decides what belongs to one sound source using cues such as parts that start together, move in pitch together, share a timbre and come from the same place (Bregman, 1990). A tight double matches the lead on almost all of them: same singer, same notes, nearly the same timing. So the brain groups the two takes into one voice. The small differences that remain, a slightly different pitch path or a slightly different attack, do not split the voice in two. They make it sound thicker, the way a section of violins sounds fuller than one player.

The grouping breaks in two ways. If the double is nearly as loud as the lead, it competes as a second voice. If an onset drifts too far, especially on a hard consonant, the brain hears two events.

::figure flam

Doubling is often explained with the precedence effect, but that describes something else: a sound and its own delayed copy, which the ear fuses and places where the first arrival came from. Copy the lead and delay it and you get exactly that, plus comb filtering. A fixed delay $\\tau$ cancels every frequency at which the copy arrives half a cycle late:

$$f_{\\text{notch}} = \\frac{2k + 1}{2\\tau}, \\quad k = 0, 1, 2, \\ldots$$

With a 10 ms delay the notches fall at 50, 150 and 250 Hz and on up every 100 Hz. A real double is a second performance with no fixed delay, so no fixed comb pattern forms. Its differences keep changing, which is why it sounds bigger than a copy.

## DAW experiment: find the level where the double disappears

1. Pan the lead vocal to the centre.
2. Put the double on its own track, also panned centre, with a 150 Hz high-pass and an 8 kHz low-pass at 12 dB per octave.
3. Pull the double's fader all the way down.
4. Loop the chorus and raise the double slowly until you can hear it as a second singer.
5. Pull it back 3 dB from that point.
6. Toggle the double's mute while the chorus plays.

Muted, the chorus should feel smaller and thinner. Unmuted, it should feel fuller while you still hear one singer. If the t and s sounds flam, fix the timing of those consonants in the double before you touch the level again.

## Common mistake: a full-range, unedited double

A double left at full range adds its low end to the lead's and thickens the low mids into mud. Its s sounds arrive at slightly different moments from the lead's and flam. You do not need either from the double. Filter it as in the experiment, de-ess it harder than the lead, or cut its s sounds out completely and let the lead carry them. Line up the hard consonants by hand or with an alignment tool.

Panned pairs need the same care. Once a double moves out of the centre it is no longer hidden behind the lead, so it has to sit lower to stay unnoticed.

::figure stage

## Producer takeaway: felt, not heard

Treat a double as part of the lead's sound, not as a second part. Filter it, fix its consonants and set its level by the mute test: you should miss it when it goes, without hearing it while it plays.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
`,
    seo: {
        title: 'Why a Vocal Double Works Best Unnoticed | VGP',
        description: 'Vocal doubles should be felt, not heard. Learn how the brain groups a double with the lead, why loud doubles flam, and how to tuck them.',
        keywords: ['vocal doubling', 'double tracking', 'auditory grouping', 'comb filtering', 'mixing lead vocals', 'chorus vocals'],
    },
};
