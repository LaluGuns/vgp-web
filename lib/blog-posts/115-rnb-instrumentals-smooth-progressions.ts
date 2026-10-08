import { BlogArticle } from '../blog-data';

export const post115: BlogArticle = {
    slug: 'rnb-instrumentals-smooth-progressions',
    title: 'R&B instrumentals: extended chords, smooth voice leading and loose drums',
    excerpt: 'How seventh and ninth chords, small voice-leading moves and slightly late drums give an R&B beat its smooth feel, with progressions to play today.',
    category: 'genre-guides',
    publishedAt: '2026-01-10',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Seventh and ninth chords share more notes with their neighbours, so the changes sound soft rather than abrupt.',
        'Voice each change so the third and seventh move a half step or stay put. In a ii-V-I that is one or two small moves per chord.',
        'Keep the verse sparse, swing the sixteenths lightly and nudge the snare 15 to 20 ms late, so the beat leaves the middle of the mix to the singer.',
    ],
    figures: {
        guide: {
            type: 'flow',
            caption:
                'A ii-V-I in C with the right hand voiced close together and the roots in the bass. From Dm9 to G13 only one note moves, C down to B. From G13 to Cmaj9 every note moves by a step or stays.',
            alt: 'Three chords in a row with arrows. Dm9: D in the bass under F, A, C and E. G13: G under F, A, B and E. Cmaj9: C under E, G, B and D.',
            steps: [
                { label: 'Dm9', note: 'D under F A C E' },
                { label: 'G13', note: 'G under F A B E. Only C moves, down to B.' },
                { label: 'Cmaj9', note: 'C under E G B D. Each note moves a step or less.' },
            ],
        },
        groove: {
            type: 'rhythm',
            caption:
                'One bar at 90 BPM. The hats swing at 58 percent, the snares sit 20 ms late and the second kick 15 ms late. Dashed outlines show where the grid would put them.',
            alt: 'Three lanes on a 16-step grid. Sixteenth-note hats with every second hit quieter and pushed slightly late. Snares on beats 2 and 4, each drawn a little after its grid position. Kick on the downbeat and a second kick slightly late in beat 3.',
            rows: [
                {
                    label: 'Hi-hat',
                    note: 'swung',
                    swing: 0.58,
                    hits: [
                        0,
                        { step: 1, level: 0.5 },
                        2,
                        { step: 3, level: 0.5 },
                        4,
                        { step: 5, level: 0.5 },
                        6,
                        { step: 7, level: 0.5 },
                        8,
                        { step: 9, level: 0.5 },
                        10,
                        { step: 11, level: 0.5 },
                        12,
                        { step: 13, level: 0.5 },
                        14,
                        { step: 15, level: 0.5 },
                    ],
                },
                {
                    label: 'Snare',
                    note: 'late',
                    hits: [
                        { step: 4, offset: 0.12 },
                        { step: 12, offset: 0.12 },
                    ],
                },
                { label: 'Kick', hits: [0, { step: 10, offset: 0.09 }] },
            ],
        },
        filter: {
            type: 'spectrum',
            mode: 'gain',
            caption:
                'The same low-pass filter on the chords in two sections, computed. At 1.5 kHz in the verse it darkens the keys and clears the upper midrange for the voice. Opened to 8 kHz in the chorus, it lets their brightness back in.',
            alt: 'Two filter curves from 20 Hz to 20 kHz. Both are flat in the low end. The verse curve falls away above 1.5 kHz. The dashed chorus curve stays flat until about 8 kHz.',
            curves: [
                { kind: 'eq', label: 'Verse', bands: [{ type: 'lowpass', freq: 1500, q: 0.71 }] },
                { kind: 'eq', label: 'Chorus', dashed: true, bands: [{ type: 'lowpass', freq: 8000, q: 0.71 }] },
            ],
            marks: [
                { f: 1500, label: '1.5k' },
                { f: 8000, label: '8k' },
            ],
        },
    },
    quiz: [
        {
            q: 'In the change from Dm7 to G7, what happens to the C, the seventh of Dm7?',
            options: [
                'It leaps up a fifth to G, the root',
                'It stays put as a tone shared with G7',
                'It rises a whole step to D, the fifth',
                'It falls a half step to B, the third',
            ],
            answer: 3,
            why: 'The seventh of one chord falls a half step into the third of the next. That small move, with the F held over, is why a ii-V-I sounds smooth.',
        },
        {
            q: 'What is a C♯dim7 doing between Cmaj7 and Dm7?',
            options: [
                'It moves the song into the key of C♯ major',
                'Its C♯ leads the bass up a half step to D',
                'It holds a drone under the next two chords',
                'It replaces the ii chord with a darker version',
            ],
            answer: 1,
            why: 'C♯dim7 is C♯, E, G and B♭. The C♯ resolves up to D and the B♭ down to A, both notes of Dm7, so it works as a passing chord.',
        },
        {
            q: 'At 90 BPM a sixteenth note lasts 166.7 ms. You move the snare 20 ms late. Roughly how far off the grid is it?',
            options: [
                'About one half of a sixteenth',
                'About a quarter of a sixteenth',
                'About a tenth of a sixteenth',
                'About a tenth of a full beat',
            ],
            answer: 2,
            why: '20 / 166.7 = 0.12, about a tenth of a sixteenth. That is enough to feel laid back and too little to sound like a mistake.',
        },
    ],
    content: `## Where the sound comes from

Rhythm and blues came into use in the late 1940s as a name for Black American popular music, and it fed into soul and funk in the 1960s and 1970s. In the 1990s, neo-soul brought jazz harmony, electric piano and loose, hip-hop-influenced drums back to the front. A lot of current R&B pairs those chords with trap-style drums and darker synths. Across all of it, the beat exists to carry a voice.

## Harmony: sevenths and ninths

A triad stacks three notes. A seventh chord adds a fourth note, a seventh above the root:

- Cmaj7: C, E, G, B
- Am7: A, C, E, G
- Dm7: D, F, A, C
- G7: G, B, D, F

A ninth chord adds one more, a ninth above the root. Cmaj9 is C, E, G, B and D. Dm9 is D, F, A, C and E. Extended chords share more notes with their neighbours, so the changes sound soft rather than abrupt, and that softness is much of the colour of R&B. You do not need every note. The fifth adds little colour and is often left out, which makes room for the ninth without crowding your hands.

## Voice leading: move every note as little as possible

What makes a progression smooth is how each note moves to the next chord. The two notes that define a seventh chord are its third and its seventh, the guide tones. In a ii-V-I they move by a half step or not at all.

- **Dm7 to G7.** The F, the third of Dm7, stays and becomes the seventh of G7. The C, the seventh of Dm7, falls a half step to B, the third of G7.
- **G7 to Cmaj7.** The F falls a half step to E, the third of Cmaj7. The B stays and becomes the seventh of Cmaj7.

::figure guide

Inversions help the bass do the same. An inversion puts a chord tone other than the root in the bass, such as Cmaj7 with E underneath. Play Fmaj7, then Cmaj7 over E, then Dm7, and the bass walks down F, E, D.

## Progressions to try

Play each one in a loop on an electric piano and listen for the voice that moves.

- **ii-V-I:** Dm9, G13, Cmaj9. The guide tones move by half steps.
- **Walking down:** Fmaj7, Em7, Dm7, Cmaj7. The bass steps down F, E, D, C.
- **Passing chord:** Cmaj7, C♯dim7, Dm7. The bass climbs C, C♯, D.
- **Secondary dominant:** Cmaj7, A7, Dm7, G7. The C♯ in A7 rises to D.
- **Borrowed minor iv:** Fmaj7, Fm7, Cmaj7. The A falls to A♭, then to G.

The passing chord and the secondary dominant both borrow a note from outside the key, C♯, and resolve it up a half step into D. The borrowed iv takes its A♭ from C minor, which gives the change its bittersweet pull.

## Drums: a little late and loose

Fully quantized drums sit stiffly under these chords. The loose feel associated with neo-soul comes from two moves: swing on the sixteenths, and some hits placed slightly late.

Swing of 50 percent is straight and 66 percent is a triplet shuffle. Settings in between, around 54 to 60 percent, lean without shuffling. For late hits, work out the size of a step first: at 90 BPM a sixteenth lasts 166.7 ms, so nudging the snare 15 to 20 ms late moves it about a tenth of a sixteenth. It feels laid back rather than wrong. Leave the first kick on the grid so the groove has an anchor, then try the second one a little later.

::figure groove

Softer sounds help the feel: rimshots or snaps instead of a loud snare, and a shaker in place of hats in the verse. The ideas behind the lean are covered in [swing explained](/blog/swing-explained-without-mystical-language) and [the late snare illusion](/blog/the-late-snare-illusion-in-modern-records).

## Sounds: warm and close

The core palette is electric piano, such as Rhodes or Wurlitzer, a piano with a low-pass filter softening its top, warm analog-style pads and clean electric guitar with chorus. For bass, use a round sine or synth bass that follows the chord roots, or a played bass with slides. Where its energy sits depends on the note: E1 is 41.2 Hz and the E an octave up is 82.4 Hz.

## Space for the voice

In the verse, strip the beat to drums, bass and one chord instrument. Automate a low-pass filter on the chords, lower in the verse and open in the chorus, so the chorus brightens without adding a part.

::figure filter

Where the keys and the vocal overlap in the midrange, a gentle, broad cut of a few dB in the keys clears room without hollowing the chords. A dynamic EQ that dips the keys only while the vocal sings is gentler still. A little vinyl crackle or room noise, kept low and ducked by the kick, fills the silence without taking space from the singer.
`,
    seo: {
        title: 'R&B instrumentals: extended chords, smooth voice leading and loose drums | VGP Studio',
        description: 'Seventh and ninth chords, guide-tone voice leading in a ii-V-I, progressions to try, swung and slightly late drums, and arranging space for the vocal.',
        keywords: ['r&b beats', 'r&b chord progressions', 'neo-soul chords', 'voice leading', 'ii-V-I', 'r&b drums'],
    },
};
