import { BlogArticle } from '../blog-data';

export const post017: BlogArticle = {
    slug: 'why-intros-fail-when-they-explain-too-much',
    title: 'An intro should tease the hook, not play it all',
    excerpt: 'An intro that plays the full hook with the full beat leaves the verse as a step down and the chorus as a repeat. Tease the hook through a filter instead.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Listeners decide fast: by 2015 the voice in US top-ten singles arrived after about five seconds, and many streams are skipped within the first five.',
        'An intro that plays the full hook with the full beat makes the verse a step down and leaves the chorus nothing new to reveal.',
        'Tease the hook instead: one part, filtered or chopped, without kick and bass, so the listener recognizes it and wants the rest.',
    ],
    figures: {
        spoiler: {
            type: 'arrangement',
            caption:
                'A spoiler intro. The hook synth, drums and bass all play in the intro, so the verse is a step down in density and the chorus brings back what the listener heard in the first bars.',
            alt: 'Arrangement grid for intro, verse and chorus. The intro has hook synth, drums, bass and pad. The verse drops the hook and pad and adds vocal. The density bar of the intro is taller than the verse.',
            density: true,
            sections: [
                { label: 'Intro', bars: 8 },
                { label: 'Verse', bars: 8 },
                { label: 'Chorus', bars: 8 },
            ],
            layers: [
                { label: 'Hook', focus: true, levels: [1, 0, 1] },
                { label: 'Drums', focus: true, levels: [0.9, 0.7, 1] },
                { label: 'Bass', focus: true, levels: [0.9, 0.7, 1] },
                { label: 'Pad', levels: [0.7, 0, 0.8] },
                { label: 'Vocal', levels: [0, 0.8, 1] },
            ],
        },
        tease: {
            type: 'spectrum',
            mode: 'gain',
            db: 30,
            caption:
                'The intro bus filter, computed for a 12 dB per octave low-pass at 1 kHz. It is 3 dB down at 1 kHz, 12 dB down at 2 kHz and 29 dB down at 5 kHz. Most melody notes sit below 1 kHz, so the shape of the hook survives while its brightness waits for the verse.',
            alt: 'EQ response from 20 Hz to 20 kHz, plus and minus 30 dB. A solid low-pass line is flat up to about 500 Hz, then falls steeply above 1 kHz across a shaded brightness region. A dashed line for the open filter stays flat.',
            curves: [
                { kind: 'eq', label: 'Low-pass at 1 kHz', bands: [{ type: 'lowpass', freq: 1000, q: 0.707 }] },
                { kind: 'eq', label: 'Open at 20 kHz', dashed: true, bands: [{ type: 'lowpass', freq: 20000, q: 0.707 }] },
            ],
            bands: [{ from: 2000, to: 8000, label: 'Brightness' }],
        },
    },
    quiz: [
        {
            q: 'Your intro plays the hook synth with full drums and bass, then the verse drops to vocal, drums and bass. What does the listener feel at the verse?',
            options: [
                'A step down, so the song seems to stall',
                'A lift, because the vocal is a new element',
                'No change, because the tempo stays the same',
                'A brief sense that the song has changed key',
            ],
            answer: 0,
            why: 'The intro is denser than the verse, so the first vocal entrance arrives as a drop in size. Starting smaller lets the verse be a step up.',
        },
        {
            q: 'Why does a 1 kHz low-pass keep the hook recognizable?',
            options: [
                'It boosts the hook around the cutoff frequency',
                'It keeps the hook\'s rhythm and removes its pitch',
                'The ear fills in the missing upper harmonics',
                'Most melody fundamentals sit below the cutoff',
            ],
            answer: 3,
            why: 'The filter is only 3 dB down at 1 kHz but 12 dB down at 2 kHz. The pitches the ear follows mostly sit below the cutoff, and the bright upper harmonics wait for the verse.',
        },
        {
            q: 'Many hit songs open with the hook. When does that still work?',
            options: [
                'When the full band plays it for sixteen bars',
                'When it is partial, filtered or without drums',
                'When it is mixed a little louder than the chorus',
                'When the intro runs for at least thirty seconds',
            ],
            answer: 1,
            why: 'A partial hook makes a promise and leaves the payoff for later. The full hook at full size gives the payoff away before the song has started.',
        },
    ],
    content: `## Hook: the intro that tells the whole story

You write an intro that plays the entire hook melody over the full beat before the vocal starts. It feels like a strong opening. Then the first verse arrives and the song seems to slow down. The listener has already heard the best part at full size, and nothing ahead sounds new.

This is the spoiler intro. You spent the first ten seconds giving away the song instead of making the listener want it.

## Why it matters: the intro sets the size everything else is measured against

Listeners decide quickly. In a large study of Spotify listening, about a quarter of streamed songs were skipped within the first five seconds (Montecchio, Roy and Pachet, 2020). Pop intros have shortened to match: in US top-ten singles from 1986 to 2015, the time before the voice entered fell from more than twenty seconds in the mid-1980s to about five (Léveillé Gauvin, 2018). The intro has a few seconds to make a promise.

A spoiler intro breaks that promise in two ways. First, it is often the densest section until the chorus, so the verse arrives as a step down. Second, the chorus brings back a hook the listener already heard in full, so it lands as a reprise instead of a reveal.

::figure spoiler

Opening with the hook can work. Many songs do it. The difference is how much of the hook you give away: one part, a filtered version, a chopped fragment, no drums. A partial hook makes the promise. The full hook at full size spends it.

## Science model: expectation, familiarity and the tease

Huron (2006) describes listening as prediction. When a listener hears part of a familiar pattern, they start to expect the rest, and that expectation builds tension that the arrival later resolves. A filtered hook in the intro starts that process: the listener recognizes the contour and waits for the full version. The full hook at full size answers the question before it has been asked.

Habituation works against the spoiler too. The ear responds less to a sound it has just heard in the same form. A hook that plays for eight bars at full size in the intro has less impact when it returns unchanged in the chorus thirty seconds later. If the intro version is filtered, the chorus version is a different sound: brighter, fuller and supported by drums and bass for the first time.

A low-pass filter is the simplest way to tease. A 12 dB per octave low-pass at 1 kHz is 3 dB down at the cutoff, 12 dB down at 2 kHz and 29 dB down at 5 kHz. Most melody notes have their fundamentals below 1 kHz, so the shape of the hook survives. Its brightness and presence wait for the verse.

::figure tease

## DAW experiment: the intro cut test

1. Find the intro. If it is eight bars long, delete the first four.
2. Route every intro part to one bus.
3. Insert a 12 dB per octave low-pass filter on that bus and set the cutoff to 1 kHz.
4. Automate the cutoff to open to 20 kHz on the first downbeat of the verse.
5. Mute the kick and the bass for the whole intro.
6. Play from the start through the first four bars of the verse.
7. Compare with the original intro.

The vocal entry should now feel like an arrival, and the hook should sound new again when the chorus brings it back at full size.

## Common mistake: playing the full hook early

The most common mistake is playing the main hook on a loud, bright synth with the full beat from bar one, out of fear that the listener will get bored. It removes the surprise the chorus depends on.

The other mistake is an intro that runs too long without changing. Fifteen seconds of the same loop is a long time for someone who can skip with one tap. If the intro needs to be long for DJs or for a live set, make a separate extended version.

## Producer takeaway: tease the identity without the full answer

An intro should invite, not summarize. Show the listener the hook through a filter, a chop or a single instrument, keep the kick and bass back, and save the full answer for the chorus.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Léveillé Gauvin, H. (2018). Drawing listener attention in popular music: Testing five musical features arising from the theory of attention economy. *Musicae Scientiae*, 22(3), 291-304.
- Montecchio, N., Roy, P., & Pachet, F. (2020). The skipping behavior of users of music streaming services and its relation to musical structure. *PLOS ONE*, 15(9), e0239418.
`,
    seo: {
        title: 'An intro should tease the hook, not play it all',
        description: 'A full-size hook in the intro makes the verse a step down and the chorus a repeat. Tease it through a low-pass filter and keep kick and bass back.',
        keywords: ['song intro', 'intro arrangement', 'low-pass filter automation', 'streaming skips', 'hook placement'],
    },
};
