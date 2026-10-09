import { BlogArticle } from '../blog-data';

// Echogram drawing. The plot spans 400 ms; the dry sound lands at t = 0.025 (10 ms),
// so the 80 ms boundary sits at 0.025 + 80 / 400 = 0.225.
// Tail decay parameter = ln(1000) * 0.4 s / T60: 5.5 for 0.5 s, 1.1 for 2.5 s.
const BOUNDARY = [{ t: 0.225, label: '80 ms' }];

export const post135: BlogArticle = {
    slug: 'early-reflections-place-a-sound-the-tail-sets-the-room',
    title: 'Early reflections place a sound, the tail sets the room',
    excerpt: 'A reverb has two parts that do different jobs. How early reflections and the late tail each change size, width and clarity, and how to set them apart.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 6,
    summary: [
        'A reverb send raises the early reflections and the tail by the same amount, so split them across two returns or two controls when you need one without the other.',
        'Use early reflections to put the sound itself in a space and make it wider while the words stay sharp, and use the tail to put the listener in the room.',
        'The longer the decay, the more of the reverb lands after the first 80 ms, where it costs clarity, so set the early part first and add tail only until the gaps feel right.',
    ],
    figures: {
        echogram: {
            type: 'signal',
            caption:
                'Two reverbs that both move a vocal back, drawn as a sketch of the first 400 ms. The first puts most of its energy in strong early reflections before the 80 ms line. The second has weak early reflections and a long tail that is still sounding when the plot ends.',
            alt: 'Two level plots over time. Each starts with a tall spike for the dry sound. In the first, a cluster of medium spikes follows within the first 80 ms and a short grey tail dies away quickly. In the second, the early spikes are small and a grey tail decays slowly across the whole plot, well past the 80 ms line.',
            rows: [
                {
                    label: 'Strong early reflections, short tail',
                    unipolar: true,
                    marks: BOUNDARY,
                    traces: [
                        { kind: 'hits', label: 'Dry and early', outline: true, decay: 150, at: [0.025, 0.07, 0.1, 0.13, 0.16, 0.19, 0.21], amp: [1, 0.55, 0.45, 0.5, 0.35, 0.3, 0.25] },
                        { kind: 'hits', label: 'Tail', muted: true, outline: true, decay: 5.5, at: [0.12], amp: [0.2] },
                    ],
                },
                {
                    label: 'Weak early reflections, long tail',
                    unipolar: true,
                    marks: BOUNDARY,
                    traces: [
                        { kind: 'hits', label: 'Dry and early', outline: true, decay: 150, at: [0.025, 0.07, 0.1, 0.13, 0.16, 0.19, 0.21], amp: [1, 0.15, 0.12, 0.14, 0.1, 0.08, 0.07] },
                        { kind: 'hits', label: 'Tail', muted: true, outline: true, decay: 1.1, at: [0.12], amp: [0.35] },
                    ],
                },
            ],
        },
        late: {
            type: 'bars',
            caption:
                'Share of a reverb\'s own energy that arrives more than 80 ms after the dry sound, for a simple exponential decay worked out as 10^(-0.48/T). Past a decay of about 1.6 s, more than half of the reverb is late energy. Adding 40 ms of pre-delay to the 2 s reverb raises its late share from 58% to 76%.',
            alt: 'Horizontal bars on a scale from 0 to 100 percent with a dashed line at 50 percent. A 0.5 s decay reaches 11 percent, 1 s reaches 33 percent, 2 s reaches 58 percent and 4 s reaches 76 percent. A dimmed bar for 2 s with 40 ms pre-delay also reaches 76 percent.',
            min: 0,
            max: 100,
            unit: '%',
            bars: [
                { label: 'Decay 0.5 s', value: 11, display: '11%' },
                { label: 'Decay 1 s', value: 33, display: '33%' },
                { label: 'Decay 2 s', value: 58, display: '58%' },
                { label: 'Decay 4 s', value: 76, display: '76%' },
                { label: '2 s + 40 ms pre-delay', value: 76, display: '76%', dim: true },
            ],
            reference: { value: 50, label: 'Half' },
        },
    },
    quiz: [
        {
            q: 'A reverb has a 4 s decay and no pre-delay. Roughly what share of its energy arrives more than 80 ms after the dry sound?',
            options: ['About a tenth', 'About a third', 'About half', 'About three quarters'],
            answer: 3,
            why: 'The energy left after 80 ms is 10^(-6 × 0.08 / 4) = 10^(-0.12), about 0.76. Three quarters of that reverb lands in the late window.',
        },
        {
            q: 'You want a vocal to sound like it is in a room, but the words must stay sharp on a busy track. Which move fits best?',
            options: [
                'Raise early reflections, keep the tail short and low',
                'Use a long hall at a low send level',
                'Add more pre-delay to a long hall',
                'Raise the send to the existing reverb by 6 dB',
            ],
            answer: 0,
            why: 'Early energy arrives while the word is still sounding and supports it, as in Bradley, Sato and Picard\'s speech tests. A long tail puts most of its energy late, where it covers the gaps and the next words.',
        },
        {
            q: 'You want the chorus to surround the listener while the vocal itself stays the same width. Which part of the reverb do you raise?',
            options: [
                'Early reflections from the sides, inside 80 ms',
                'A wide late tail, arriving after 80 ms',
                'The dry vocal against the rest of the band',
                'One strong reflection, panned to the centre',
            ],
            answer: 1,
            why: 'Bradley and Soulodre (1995) found that envelopment depends on strong lateral sound arriving 80 ms or more after the direct sound. Early side reflections make the source itself seem wider instead.',
        },
    ],
    content: `## Hook: the vocal that is either pasted on or washed out

A dry vocal over a finished beat sounds pasted on: stuck to the front of the speakers while everything else lives somewhere. You raise the send to the hall. Now the vocal is in a space, but the ends of words smear into the next ones and the chorus turns into a cloud. You pull the send back and it is pasted on again.

The send is moving two different things at once. A reverb has an early part, a handful of reflections in the first few tens of milliseconds, and a late part, the dense tail that dies away. They change the sound in different ways, and the send raises both by the same number of decibels.

## Why it matters: one knob, two jobs

The early reflections arrive while the word is still sounding. They add to the dry sound and tell the ear about the surfaces close to the source, and the ones that come from the sides make the source itself seem wider. The tail keeps going after the word has ended. It tells the ear how big and live the whole room is, and it fills the gaps between words and hits.

::figure echogram

Both of the reverbs in the figure push a vocal away from the speakers, because both lower the balance of direct to reverberant sound, one of the main [distance cues](/blog/why-depth-is-a-contrast-illusion). The first does it mostly with early energy, so the voice gets a body and a place while the gaps stay fairly clean. The second does it with the tail, so you hear more room and less word. Which one you want depends on the song, but you can only choose if you can move them separately.

Many algorithmic reverbs have separate early and late level controls, or an early/late balance. If yours does not, use two returns: a small room with the decay as short as it goes for the early part, and a plate or hall for the tail.

## Science model: early and late energy

Room acoustics splits a reverb at a time boundary. ISO 3382-1 defines clarity as the ratio, in decibels, of the energy arriving in the first 80 ms after the direct sound to the energy arriving after it, with a 50 ms boundary for speech:

$$C_{80} = 10 \\log_{10} \\frac{\\int_0^{80\\,\\text{ms}} p^2(t)\\,dt}{\\int_{80\\,\\text{ms}}^{\\infty} p^2(t)\\,dt}$$

Here $p(t)$ is the sound pressure of the room's impulse response. The higher the number, the more the early energy outweighs the late.

The two sides of the boundary do different jobs. Bradley, Sato and Picard (2003) added early reflections to speech in listening tests and found that they raised the effective signal-to-noise ratio, so listeners understood more words. In their analysis of measured rooms for speech, early reflections raised the effective signal-to-noise ratio by up to 9 dB. Those were speech tests, but they are a reasonable guide for a lyric that has to get through a band. Early energy that arrives from the sides also changes how wide the source seems: Barron and Marshall (1981) linked spatial impression in concert halls to early lateral reflections. The feeling of being surrounded is a later effect. Bradley and Soulodre (1995) found that listener envelopment depends on strong lateral reflections arriving 80 ms or more after the direct sound.

Decay time decides how much of a reverb ends up late. A tail that falls 60 dB in $T$ seconds keeps $10^{-6t/T}$ of its energy after time $t$, so for a simple exponential decay that starts with the dry sound, the share after 80 ms is:

$$\\text{late share} = 10^{-0.48/T}$$

For a 1 s decay that is 33%. For a 2 s decay it is 58%. Half the energy is late at $T = 0.48 / \\log_{10} 2 \\approx 1.6$ s.

::figure late

Pre-delay pushes the same tail later. With 40 ms of pre-delay, only 40 ms of the reverb fits before the boundary, so the 2 s reverb goes from 58% late to 76% late. Pre-delay keeps the start of each word clean, as the [lesson on reverb and emotional distance](/blog/why-reverb-can-push-emotion-forward-or-backward) shows, but it moves reverb energy out of the early window, not into it.

In the demo, try moving the decay with the level left alone, then the level with the decay left alone. Listen for whether the notes move back or the room around them grows.

::demo reverb

## DAW experiment: build the early part and the tail on separate returns

1. Loop a chorus with the full mix playing and a dry lead vocal. Remove any reverb already on the vocal.
2. Make return A: a room reverb, 100% wet, decay as short as it allows (around 0.3 to 0.5 s), pre-delay 0 ms. If it has early and late controls, turn the late level all the way down.
3. Make return B: a plate or hall, 100% wet, decay 2 s, pre-delay 20 ms, early reflections at minimum if the reverb lets you.
4. Send the vocal to A only. Raise the send until the vocal stops sounding pasted on, and write down the send level.
5. Mute A and send to B only. Raise it until the vocal sits as far back as it did with A. Compare the consonants and the gaps between lines.
6. Bring A back at its level and set B 6 dB below the level you found in step 5. Raise B slowly until the gaps between lines feel alive, and stop there.
7. Switch return A to mono, then back to stereo, and listen to the width of the voice itself.

Return A alone usually gets the vocal out of the speakers with every word intact. Return B alone gets there too, but you hear the hall more than the voice. Together, a little tail goes a long way.

## Common mistake: asking the tail to do the early part's job

The common mistake is setting a long hall low under the vocal to make it sit in a space. At a low send you hear almost none of the early part, only the tail poking out in the gaps, so you push the send up and the wash comes with it. If the vocal needs a place, give it early energy first.

The second mistake is the opposite: early reflections so loud and few that they act like single echoes. One strong reflection a few milliseconds after the dry sound combs the tone, the same effect a reflective wall has on a microphone, as the [lesson on room reflections in vocal recordings](/blog/room-reflections-eq-your-vocal-recording) explains. Keep the early level below the point where the vocal starts to sound hollow or phasey.

## Producer takeaway: place the sound, then size the room

I set the early part first and ask one question: does the vocal sound like it is in a place? Then I add tail only until the gaps between lines feel alive. If the tail starts covering the next line, shorten it or duck it under the vocal before turning it down; the [lesson on reverb that masks the next line](/blog/when-reverb-masks-the-next-line) covers both. Early energy and tail are two faders, and a mix usually needs much less tail than the reverb preset suggests.

## References

- Barron, M., & Marshall, A. H. (1981). Spatial impression due to early lateral reflections in concert halls: The derivation of a physical measure. *Journal of Sound and Vibration*, 77(2), 211-232.
- Bradley, J. S., Sato, H., & Picard, M. (2003). On the importance of early reflections for speech in rooms. *Journal of the Acoustical Society of America*, 113(6), 3233-3244.
- Bradley, J. S., & Soulodre, G. A. (1995). Objective measures of listener envelopment. *Journal of the Acoustical Society of America*, 98(5), 2590-2597.
- ISO 3382-1:2009. *Acoustics: Measurement of room acoustic parameters, Part 1: Performance spaces*. International Organization for Standardization.
`,
    seo: {
        title: 'Early reflections place a sound, the tail sets the room | VGP Studio',
        description: 'Early reflections and the reverb tail do different jobs. Learn how each changes size, width and clarity, and how to set them on separate returns.',
        keywords: ['early reflections', 'reverb tail', 'reverb clarity C80', 'listener envelopment', 'vocal reverb', 'mixing depth'],
    },
};
