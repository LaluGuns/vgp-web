import { BlogArticle } from '../blog-data';

export const post033: BlogArticle = {
    slug: 'why-brightness-is-not-the-same-as-clarity',
    title: 'Brightness is not clarity',
    excerpt: 'A treble boost on every track makes a mix brighter, not clearer. Clarity comes from less masking, and loud low mids mask upward into the vocal.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Brightness is how high in the spectrum the energy sits. Clarity is whether each part can be heard on its own.',
        'Loud low sounds mask upward, so a buildup between about 200 and 500 Hz can cover vocal detail far above it.',
        'Cut what is covering a part before you boost its top, and judge every change at matched loudness.',
    ],
    figures: {
        moves: {
            type: 'spectrum',
            mode: 'gain',
            db: 8,
            marks: [
                { f: 300, label: '300 Hz' },
                { f: 8000, label: '8 kHz' },
            ],
            caption:
                'Two ways to chase clarity, computed. The shelf adds 3 dB at 8 kHz and close to 6 dB above 16 kHz, to everything in the track. The bell takes 4 dB out at 300 Hz and less than 1 dB at 150 and 600 Hz, so it only touches the band doing the masking.',
            alt: 'EQ gain against frequency. A dashed high-shelf curve rises from 0 dB around 4 kHz to plus 6 dB at 20 kHz. A solid bell curve dips to minus 4 dB at 300 Hz and returns to 0 dB on either side.',
            curves: [
                { kind: 'eq', bands: [{ type: 'highshelf', freq: 8000, gain: 6 }], label: 'Shelf +6 dB, 8 kHz', dashed: true },
                { kind: 'eq', bands: [{ type: 'bell', freq: 300, gain: -4, q: 1.4 }], label: 'Cut 4 dB, 300 Hz' },
            ],
        },
        masking: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'Where the energy sits in a muddy chorus, sketched. The low-mid buildup is far from the vocal detail on the frequency axis, but loud low sounds mask upward, so lowering the buildup uncovers the vocal. A treble boost leaves this picture as it is.',
            alt: 'A large filled hump centred near 350 Hz, labelled pads and guitars, and a smaller dashed hump near 3 kHz, labelled vocal detail. The band from 200 to 500 Hz is shaded and labelled mud.',
            bands: [{ from: 200, to: 500, label: 'Mud' }],
            curves: [
                { kind: 'hump', center: 350, width: 0.9, level: 0.85, label: 'Pads and guitars' },
                { kind: 'hump', center: 3000, width: 0.7, level: 0.45, label: 'Vocal detail', dashed: true },
            ],
        },
    },
    quiz: [
        {
            q: 'A loud pad builds up around 300 Hz. How can it hide a vocal’s consonants near 3 kHz?',
            options: [
                'It cannot, since masking stays at one frequency',
                'Loud low sounds spread their masking upward',
                'The pad and the vocal are both panned centre',
                'Consonants carry their energy below 300 Hz',
            ],
            answer: 1,
            why: 'Masking is lopsided. A loud low masker covers frequencies well above it, and the reach grows with its level. Lowering the buildup uncovers detail higher up.',
        },
        {
            q: 'You shelve +4 dB at 10 kHz on every track. What happens to the masking between the tracks up there?',
            options: [
                'It disappears, because the top end is louder',
                'It halves, because each track gains 4 dB up there',
                'It stays put, because every track rose together',
                'It moves down, because the mids now sound quieter',
            ],
            answer: 2,
            why: 'Masking depends on the levels of the parts relative to each other. Raising all of them by the same amount leaves that balance where it was, only louder and harsher.',
        },
        {
            q: 'After bypassing your treble boosts, why raise the master back to the same loudness before you judge?',
            options: [
                'A quieter mix sounds duller even when it is clearer',
                'Bypassed plugins add latency that has to be made up',
                'Streaming services require one fixed master level',
                'Loudness meters stop reading when plugins are bypassed',
            ],
            answer: 0,
            why: 'Louder almost always sounds better and brighter at first. Matching loudness is the only way to hear whether the cuts really made the mix clearer.',
        },
    ],
    content: `## Hook: the blinding top end

Your mix sounds muddy. The vocal does not cut through and the snare has no presence. So you reach for EQ: a high shelf at 10 kHz on the vocal, a boost at 5 kHz on the guitars, a little more on the overheads. It is sharp and loud. Two minutes later it is tiring, and the lyrics are still hard to follow. What you hear most now is the hiss on every S.

Brightness and clarity are different things. Brightness is how much of a sound's energy sits high in the spectrum. Clarity is whether each part can be heard on its own. Boosting the top of every track changes the first and does almost nothing for the second.

## Why it matters: the shelf lifts everything up there

A high shelf raises everything above its corner: the vocal's air, and also cymbals, sibilance, reverb tails, amp hiss and the top of every pad. Shelve every track and everything up there rises together, so the parts compete in the treble exactly as much as before, only louder. Boosts around 2 to 5 kHz add a second problem. That is where the ear is most sensitive (Moore, 2012), so extra energy there turns harsh fast, you turn the whole mix down to cope, and the detail goes down with it.

Meanwhile the mud is untouched. If a pad, a guitar and the left hand of a piano pile up between about 200 and 500 Hz, that buildup is still there after the shelf, and it is still covering the vocal.

::figure moves

## Science model: masking spreads upward

Inside the cochlea, the basilar membrane works like a bank of overlapping band-pass filters, the auditory filters. A sound is hardest to hear when another sound puts energy into the same filters, which is masking. Their width grows with frequency. Glasberg and Moore (1990) estimate it as an equivalent rectangular bandwidth:

$$\\text{ERB}(f) = 24.7 \\left( \\frac{4.37 f}{1000} + 1 \\right) \\ \\text{Hz}$$

At 250 Hz that is about 52 Hz, at 1 kHz about 133 Hz and at 4 kHz about 457 Hz. Masking works within and between neighbouring filters, and a cut about an octave wide at 300 Hz spans several of them at once.

Masking is also lopsided. A loud low sound masks frequencies above it far more than a high sound masks frequencies below it, and the upward reach grows as the masker gets louder (Wegel and Lane, 1924; Moore, 2012). That is the mechanism behind mud. A loud buildup at 300 Hz does not only cover other sounds at 300 Hz. It reaches up toward the range where the vocal's upper harmonics and consonants sit and blurs them too. Turning it down a few dB uncovers detail well above 300 Hz. A treble boost cannot do that, because it does not lower the masker.

Brightness has its own measure. Listeners' brightness ratings follow the spectral centroid, the amplitude-weighted average frequency of a sound (Schubert and Wolfe, 2006). A shelf moves the centroid up. It does not move the masker.

::figure masking

::demo masking

## DAW experiment: the high-shelf reduction test

Find out whether brightness is hiding a masking problem in your mix.

1. Open your latest mix, put a loudness meter on the master and note the short-term LUFS over the chorus.
2. Bypass every high shelf, presence boost and exciter in the session, and write down which ones so you can restore them.
3. Raise the master until the chorus reads the same short-term LUFS as before. It will sound dull for a moment.
4. Solo the vocal together with one midrange part at a time: guitar, pad, keys.
5. On that part, sweep a bell of +8 dB at Q 4 between 200 and 500 Hz. Where it sounds boxiest, turn the boost into a cut of 3 to 4 dB at Q 1.4.
6. Repeat for each part that crowds the vocal, then play the full mix at matched loudness.
7. Only where a track still sounds dark in the full mix, add a high shelf, starting at no more than +2 dB.

The vocal reads more clearly with no boost on it at all, and the top end is calmer.

## Common mistake: bright cymbals and pads

Brightening pads and cymbals to make the mix sound expensive puts them in the same range as the vocal's air and consonants. Background parts rarely need that much top. Keep them a little darker and the lead has the space up there to itself.

The second mistake is boosting the lead instead of cutting what covers it. If the vocal lacks presence, find the band where its presence sits, often somewhere between 2 and 5 kHz, and take a few dB out of the guitar or synth in that band before you add anything to the vocal.

## Producer takeaway: cut the competition first

Clarity mostly comes from subtraction. Before you boost the top of any track, find what is covering it and turn that down, starting with the low mids. Judge every change at matched loudness, because the brighter version will win any comparison where it is also louder. Add air last, in small amounts, to the one or two parts that need to lead.

## References

- Glasberg, B. R., & Moore, B. C. J. (1990). Derivation of auditory filter shapes from notched-noise data. *Hearing Research*, 47(1-2), 103-138.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
- Schubert, E., & Wolfe, J. (2006). Does timbral brightness scale with frequency and spectral centroid? *Acta Acustica united with Acustica*, 92, 820-825.
- Wegel, R. L., & Lane, C. E. (1924). The auditory masking of one pure tone by another and its probable relation to the dynamics of the inner ear. *Physical Review*, 23, 266-285.
`,
    seo: {
        title: 'Brightness is not clarity | VGP Studio',
        description: 'Why treble boosts make a mix brighter but not clearer, how low-mid buildup masks the vocal from below, and how to find clarity by cutting first.',
        keywords: ['brightness vs clarity', 'masking', 'upward spread of masking', 'mixing EQ', 'low mids', 'spectral centroid'],
    },
};
