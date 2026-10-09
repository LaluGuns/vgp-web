import { BlogArticle } from '../blog-data';

export const post131: BlogArticle = {
    slug: 'hard-panning-does-not-cure-masking',
    title: 'Hard panning does not cure masking',
    excerpt: 'Panning changes where a part comes from, not which bands it fills or when it plays. Learn why the help shrinks on speakers and disappears in mono.',
    category: 'mixing-mastering',
    publishedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Judge separation on speakers and in mono as well as on headphones, because hard panning keeps two parts out of each other\'s ear only on headphones.',
        'When two parts still collide in mono, change what they play first: register, voicing or rhythm, then EQ the overlap.',
        'Check which pan law your DAW uses, since with a common -3 dB law every hard-panned part drops 3 dB against the centre in a mono fold.',
    ],
    figures: {
        overlap: {
            type: 'spectrum',
            mode: 'level',
            caption:
                'Two rhythm guitars from the same amp and the vocal they sit under. Panning decides which speaker each hump comes out of. It does not move a single hump along this axis, so the overlap in the shaded band is still there.',
            alt: 'Energy over frequency for a left guitar, a right guitar and a vocal. The two guitar humps lie almost on top of each other and both overlap the dashed vocal hump in a shaded band from about 2 to 5 kHz.',
            bands: [{ from: 2000, to: 5000, label: 'Shared band' }],
            curves: [
                { kind: 'hump', center: 1800, width: 2.2, level: 0.65, label: 'Guitar L' },
                { kind: 'hump', center: 2000, width: 2.2, level: 0.6, label: 'Guitar R' },
                { kind: 'hump', center: 2800, width: 1.6, level: 0.55, label: 'Vocal', dashed: true },
            ],
        },
        panlaw: {
            type: 'bars',
            caption:
                'Level in a mono fold, (L + R) / 2, for a part at the same fader setting, computed from the pan law gains. With a -3 dB law a centred part keeps 0.707 (-3 dB) and a hard-panned part keeps 0.5 (-6 dB), so hard-panned parts fall 3 dB against the centre. With a -6 dB law the balance holds.',
            alt: 'Four bars. With the -3 dB pan law, a centred part sits at -3 dB and a hard-panned part at -6 dB in mono. With the -6 dB pan law, both sit at -6 dB.',
            min: -12,
            max: 0,
            unit: 'dB',
            bars: [
                { label: 'Centre, -3 dB law', value: -3, display: '-3 dB' },
                { label: 'Hard side, -3 dB law', value: -6, display: '-6 dB' },
                { label: 'Centre, -6 dB law', value: -6, display: '-6 dB', dim: true },
                { label: 'Hard side, -6 dB law', value: -6, display: '-6 dB', dim: true },
            ],
        },
        rhythm: {
            type: 'rhythm',
            caption:
                'One bar of two guitar parts. When the right guitar copies the left, every onset lands together and the two tend to fuse into one bigger guitar. When it answers on the off-beats, each part has moments of its own, and that separation survives the mono fold.',
            alt: 'Three rows on a 16-step grid. Guitar L hits the four beats. The first version of guitar R hits the same four beats. The second version of guitar R hits the four off-beats between them.',
            rows: [
                { label: 'Guitar L', hits: [0, 4, 8, 12] },
                { label: 'Guitar R, same onsets', hits: [0, 4, 8, 12] },
                { label: 'Guitar R, off-beats', hits: [2, 6, 10, 14], focus: true },
            ],
        },
    },
    quiz: [
        {
            q: 'Your DAW uses a -3 dB pan law. The vocal is centred and a guitar is hard left at the same fader level. In a mono fold, how far does the guitar drop against the vocal?',
            options: ['0 dB', '3 dB', '6 dB', '9 dB'],
            answer: 1,
            why: 'The centred vocal has 0.707 in each channel and folds to 0.707 (-3 dB). The guitar has 1 in one channel and folds to 0.5 (-6 dB), so it ends up 3 dB lower than the vocal.',
        },
        {
            q: 'Why does hard panning separate two parts more on headphones than on speakers?',
            options: [
                'Headphones reproduce more high frequencies than speakers',
                'Speakers apply a pan law and headphones do not',
                'Headphones play the side signal louder than speakers',
                'On speakers each ear also hears the opposite speaker',
            ],
            answer: 3,
            why: 'On headphones a hard-left part never reaches the right ear. On speakers it does, a fraction of a millisecond later and only partly shadowed by the head, so both parts still meet in both ears.',
        },
        {
            q: 'Two hard-panned guitars blur into one in mono and bury the vocal. Which change keeps them apart in mono as well as stereo?',
            options: [
                'Pan both guitars even further with a stereo widener',
                'Add a short delay to one guitar for extra width',
                'Move one guitar to a higher voicing and off-beat rhythm',
                'Raise both guitars so each is easier to hear on its own',
            ],
            answer: 2,
            why: 'Register and timing are separation cues that do not depend on the speakers. The widener and the delay only change stereo cues, and the delay can also comb filter in mono.',
        },
    ],
    content: `## Hook: the wide chorus that turns to mush

Two rhythm guitars, same chords, same amp, same strumming, one panned hard left and one hard right. On headphones the chorus is wide and the vocal sits in a clean gap in the middle. On the monitors that gap is narrower. On a kitchen speaker the guitars turn into one fizzy block and the top of the vocal disappears into it.

The guitars are the same on all three systems. What differs is how much the panning can do on each one.

## Why it matters: panning moves one cue out of several

Masking happens when two sounds put energy into the same auditory bands at the same moment, and the louder one sets how loud the other has to be to stay audible. That is decided band by band, as the [lesson on buried vocals](/blog/masking-why-vocals-drown-even-when-fader-goes-up) works through. Panning changes none of those bands and none of those moments. It only changes which speaker each part comes out of.

::figure overlap

Location still counts. It is one of several cues the ear uses to sort a mixture into sources, along with when notes start, pitch range and timbre (Bregman, 1990); the [lesson on attention](/blog/how-attention-moves-through-a-mix) covers how those cues decide what the listener follows. Two guitars that differ only in location lean on one cue, and that cue depends on the playback system.

## Science model: what each ear receives

On headphones, a hard-left guitar reaches the left ear only. The right ear hears the vocal and the right guitar, with no left guitar on top. That is a large separation, and it is why a crowded arrangement can sound tidy while you mix on headphones.

On speakers both ears hear both speakers. The hard-left guitar reaches your right ear too, a fraction of a millisecond later. At high frequencies the head shadows it and it arrives quieter; at low frequencies the head is small compared with the wavelength and barely shadows it at all (Moore, 2012). So one ear may have a cleaner view of the vocal in the highs, and the brain can use the timing difference between the ears to pull out a little more. In one lab study with virtual sources, listening with both ears instead of only the better ear lowered the level at which sentences were understood by about 2 to 4 dB against a single interferer (Hawley, Litovsky and Culling, 2004). That is real help, and it is about the size of a modest EQ move. It is a speech test under lab conditions, not a mix, so treat it as a rough scale.

In mono the help is gone. Every part comes from one point, and only the non-spatial cues are left to separate them. The fold also changes the balance by an amount the pan law decides. With a common -3 dB law, a centred part sits at $\\cos 45^\\circ = 0.707$ in each channel and a hard-panned part at 1 in one channel. Folded as $(L + R)/2$:

$$\\begin{aligned} \\text{centre: } \\frac{0.707 + 0.707}{2} &= 0.707 \\; (-3 \\text{ dB}) \\\\ \\text{hard side: } \\frac{1 + 0}{2} &= 0.5 \\; (-6 \\text{ dB}) \\end{aligned}$$

::figure panlaw

So in mono the hard-panned guitars drop 3 dB against the centred vocal. If the vocal is still buried with that 3 dB in its favour, the clash is in the parts themselves.

Separation also depends on what the parts play. Sounds whose notes start together tend to fuse into one source, and sounds whose onsets differ tend to split (Bregman, 1990). Two guitars strumming identical chords on identical beats are built to fuse. That is often the goal with a double-tracked part, and it means the pair behaves like one wide guitar that competes with the vocal as a single block.

::figure rhythm

The demo below frees a lead from a pad in the same range without moving either one in the stereo field: it cuts the pad in one band or ducks it while the lead plays. Both fixes change the pad itself, so they would hold in mono too.

::demo masking

## DAW experiment: take the panning away and see what is left

Use a dense section with at least two similar parts panned apart and a centred lead.

1. Put a utility with a mono switch on the master and find your DAW's pan law setting. Write it down.
2. Loop eight bars. Rate how easily you can follow the lead on headphones, then on speakers, then in mono, at the same loudness each time.
3. Stay in mono. Mute the left part, then the right, and note which mute brings the lead forward most.
4. On that part, sweep a narrow bell boost through 1 to 6 kHz with everything playing. Where it covers the lead most, turn it into a cut of about 3 dB.
5. Change one thing the part plays: move it to a higher voicing, or play it on the off-beats where the other part rests.
6. Switch back to stereo and compare with the original panning untouched.

Then check mono again. If the parts hold apart there, the stereo version will often sound wider than before as well, because the parts now differ in more than location.

## Common mistake: solving a crowd with width

When a chorus feels cluttered, the reflex is to pan things further out or add a stereo widener. On headphones that seems to work. On speakers the gain is smaller, and in mono it is zero, while the overlap in the bands and the beats is exactly where it was. The [lesson on mono](/blog/why-mono-reveals-what-stereo-hides) shows how some width tricks also cost level when folded.

The opposite mistake is to stop panning. Hard panning is fine. Two guitars hard left and right with different voicings get the benefit of both.

## Producer takeaway: roles first, then the map

Decide what each part's job is, give it a register and rhythm of its own, and set a balance that works in mono. Then pan, and let the stereo image spread out an arrangement that already makes sense. If you mix on headphones, check every crowded section on speakers and in mono before you trust the separation you hear.

## References

- Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
- Hawley, M. L., Litovsky, R. Y., & Culling, J. F. (2004). The benefit of binaural hearing in a cocktail party: Effect of location and type of interferer. *The Journal of the Acoustical Society of America*, 115(2), 833-843.
- Moore, B. C. J. (2012). *An Introduction to the Psychology of Hearing* (6th ed.). Emerald.
`,
    seo: {
        title: 'Hard panning does not cure masking | VGP Studio',
        description: 'Panning changes where a part comes from, not which bands it fills. Why stereo separation shrinks on speakers, vanishes in mono, and what to change instead.',
        keywords: ['panning and masking', 'hard panning', 'mono compatibility', 'pan law', 'stereo separation', 'mix clarity'],
    },
};
