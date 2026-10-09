import { BlogArticle } from '../blog-data';

export const post129: BlogArticle = {
    slug: 'the-solo-button-lies-about-eq',
    title: 'Use solo to find problems, not to set tone',
    excerpt: 'A part you EQ in solo is heard in the mix through everything around it. Learn what solo is good for and why tone decisions belong in context.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Use solo for things that belong to one track alone: clicks, edits, noise, hum and rings, then unsolo before you decide anything about tone or level.',
        'In the mix a part is heard mostly through the bands nobody else covers, so boosting body that the bass and keys already mask adds mud, not fullness.',
        'Check what your DAW does to effect returns in solo, or mark them solo safe, so a soloed vocal is judged with its reverb.',
    ],
    figures: {
        heard: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'Shapes, not measurements. Soloed, the whole guitar is audible. In the mix its lower half sits under the bass and keys, so what the listener hears as guitar is mostly the upper part, where nothing else is as strong.',
            alt: 'Energy over frequency. Two grey humps for the bass and the keys sit in the low and low-mid range. A highlighted hump for the guitar spans the low mids to the upper mids. A band over the low range is labelled covered in the mix, and a band over the upper mids is labelled heard as guitar.',
            bands: [
                { from: 60, to: 400, label: 'Covered in the mix' },
                { from: 1500, to: 6000, label: 'Heard as guitar' },
            ],
            curves: [
                { kind: 'hump', center: 90, width: 0.9, level: 0.85, muted: true, label: 'Bass' },
                { kind: 'hump', center: 350, width: 1.1, level: 0.75, muted: true, label: 'Keys' },
                { kind: 'hump', center: 600, width: 1.6, level: 0.7, label: 'Guitar' },
            ],
        },
        eqs: {
            type: 'spectrum',
            mode: 'gain',
            db: 6,
            caption:
                'Two EQs for one acoustic guitar, drawn from the filter maths. The solo EQ adds a low shelf for body and a high shelf for air. The mix EQ removes the lows the bass already covers, trims the low mids and lifts the range where the guitar is still heard.',
            alt: 'Gain over frequency. A dashed curve rises at both ends, with a lift below about 200 Hz and another above about 6 kHz. A solid curve falls away below 100 Hz, dips gently around 250 Hz and has a small lift around 3 kHz.',
            curves: [
                {
                    kind: 'eq',
                    label: 'Solo EQ',
                    dashed: true,
                    bands: [
                        { type: 'lowshelf', freq: 150, gain: 4 },
                        { type: 'highshelf', freq: 8000, gain: 3 },
                    ],
                },
                {
                    kind: 'eq',
                    label: 'Mix EQ',
                    bands: [
                        { type: 'highpass', freq: 90 },
                        { type: 'bell', freq: 250, gain: -3, q: 1 },
                        { type: 'bell', freq: 3000, gain: 2, q: 1 },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'Which of these is a good job for the solo button?',
            options: [
                'Setting how much low mid the guitar keeps',
                'Choosing how bright the pad should be',
                'Finding a click at an edit point',
                'Deciding how loud the hi-hats sit',
            ],
            answer: 2,
            why: 'A click belongs to that track alone and is easier to hear without the mix. The other three depend on what else is playing, so they need the full mix.',
        },
        {
            q: 'A low shelf on the acoustic guitar sounded fuller in solo. Why does it often add nothing to the guitar in the mix?',
            options: [
                'That range is already masked by the bass and keys',
                'Low shelves shift the phase of the guitar too far',
                'The guitar is panned, so its lows fold to mono',
                'A shelf needs a high-pass under it to be heard',
            ],
            answer: 0,
            why: 'Where the bass and keys are stronger, the guitar\'s extra energy is covered. It adds to the low-mid build-up without changing what you hear as guitar.',
        },
        {
            q: 'You solo the lead vocal, find it dry and add more reverb. With the mix back it sounds far too wet. What is the likely cause?',
            options: [
                'Reverb always sounds wetter at higher playback levels',
                'The reverb plugin adds level each time it is opened',
                'The vocal compressor lifts the reverb tail in context',
                'Solo muted the reverb return, so you heard none of it',
            ],
            answer: 3,
            why: 'In many DAWs solo mutes effect returns unless they are marked solo safe, so the vocal sounded dry in solo while its reverb was there all along.',
        },
    ],
    content: `## Hook: the guitar that sounded great alone

You spend ten minutes on the acoustic guitar with solo on. A low shelf for body, a little air on top, and it sounds like an album intro. Then you unsolo. The guitar is no clearer than before, the bass has lost its edge, and the low end of the vocal is blurred. The body you added went straight into the range the bass and the piano were already filling. Solo showed you a guitar nobody will ever hear on its own.

## Why it matters: the listener hears the sum

A listener never presses your solo button. They hear every part through every other part, so a part's tone in the mix depends on what plays alongside it. A guitar can be full and warm in solo and thin in the mix, or thin in solo and exactly right in the mix.

Solo is still the right tool for anything that belongs to one track alone: a click at an edit, a breath cut off mid-word, hiss, hum, a ring that keeps sounding after the note (the [lesson on resonance](/blog/why-resonance-can-sing-or-destroy-a-mix) shows how to hunt those). It is the wrong place to decide tone and level, because those depend on everything else.

## Science model: masking decides which part of a sound you hear

Inside the ear, sound is analysed in narrow overlapping bands. Within a band, a louder sound raises the level a quieter one needs to be heard at all (Fastl and Zwicker, 2007). The [lesson on mud](/blog/the-masking-problem-producers-hear-as-mud) works through the band widths. What matters here is the consequence: in a full mix, a part is heard mostly through the bands where it is not covered.

::figure heard

Even where a part stays audible, it sounds weaker than in solo. Moore, Glasberg and Baer (1997) modelled this partial loudness, the loudness of a sound in the presence of another, and it is lower than the same sound's loudness alone. So in solo you judge the whole spectrum at full loudness. In the mix you hear a slice of it, turned down.

This explains the guitar. Its low mids sit under the bass and keys, so the shelf added energy the listener cannot pick out as guitar. That energy still counts, though: it raises the masking on the bass and on the lower part of the vocal. The guitar's identity in the mix lives higher up, in the pick attack and string detail, the part a soloed guitar can make sound too sharp.

It works the other way too. Some problems only exist together. Two parts that each sound clean can pile up in one range, and a bright part can sit right on top of the vocal's consonants. Neither shows up in solo.

The demo uses a lead and a pad. Listen to how the pad, lush enough on its own, decides how clear the lead is.

::demo masking

Solo has one more trap that has nothing to do with hearing. Depending on the DAW and its settings, soloing a track can mute the reverb and delay returns it feeds. A vocal judged that way sounds drier and harder than it is, and the reverb or brightness you add to compensate is too much once the returns come back.

## DAW experiment: two EQs, one guitar

1. Pick a supporting part, such as an acoustic guitar, keys or a pad, and loop a busy section of the song.
2. Insert an EQ, solo the part and shape it until it sounds as good as you can make it alone. Save that as version A, using the EQ's A/B slots or a second EQ you can bypass.
3. Unsolo. Starting from a flat EQ, shape the same part with the full mix playing until the vocal and bass are clear and the part still does its job. Save that as version B.
4. Level-match A and B, then switch between them in the mix. Listen to the vocal and the bass, not to the part you are EQing.
5. Solo version B. Notice how thin or plain it sounds alone, then decide which version you would release.
6. Check what solo does to your effect returns. If they go silent, mark them solo safe, then solo the lead vocal and hear it with its reverb.

Version B often sounds smaller alone and works better in the mix. Version A often sounds better alone and leaves the vocal and bass less clear.

## Common mistake: making every part complete

The common mistake is trying to make each part sound finished on its own. A pad, a rhythm guitar or a keys part supports the song, and supporting parts can sound thin, dull or plain when soloed. The [lesson on EQ as attention design](/blog/how-eq-becomes-attention-design) covers how to decide which part leads. If every part gets body and air in solo, they all compete for the same bands and the mix turns thick and harsh at once.

::figure eqs

The opposite mistake is never soloing. Clicks, noise and bad edits hide under a full mix and then show up on headphones or in a quiet intro. Solo for those, fix them, and get out.

## Producer takeaway: solo to find, unsolo to decide

Make the habit concrete: any EQ move made in solo gets checked in the mix before you keep it. When two parts fight, solo just those two, such as the kick and the bass or the vocal and the guitar, then bring the rest back before you commit. Spend most of the session with everything playing, because that is the only version anyone else will hear.

## References

- Fastl, H., & Zwicker, E. (2007). *Psychoacoustics: Facts and Models* (3rd ed.). Springer.
- Moore, B. C. J., Glasberg, B. R., & Baer, T. (1997). A model for the prediction of thresholds, loudness, and partial loudness. *Journal of the Audio Engineering Society*, 45(4), 224-240.
`,
    seo: {
        title: 'Use solo to find problems, not to set tone | VGP Studio',
        description: 'Solo shows a part nobody hears alone. Learn why masking changes how a part sounds in the mix and when solo helps, from clicks to rings and effect returns.',
        keywords: ['solo EQ', 'EQ in context', 'frequency masking', 'partial loudness', 'mixing workflow', 'solo safe'],
    },
};
