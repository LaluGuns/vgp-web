import { BlogArticle } from '../blog-data';

export const post115: BlogArticle = {
    slug: 'rnb-instrumentals-smooth-progressions',
    title: 'R&B chords that glide: voice leading and a late snare',
    excerpt: 'Why the same three chords sound stiff in block shapes and smooth on a record: shared notes, half-step moves, and drums that sit a few milliseconds back.',
    category: 'genre-guides',
    publishedAt: '2026-01-10',
    updatedAt: '2026-10-09',
    readingTime: 7,
    summary: [
        'Seventh and ninth chords share more notes with their neighbours, so the changes sound soft rather than abrupt.',
        'Voice each change so the third and seventh move a half step or stay put. In a ii-V-I that is one or two small moves per chord.',
        'Keep the verse sparse, swing the sixteenths lightly and nudge the snare 15 to 20 ms late, so the beat leaves the middle of the mix to the singer.',
    ],
    figures: {
        guide: {
            type: 'notes',
            caption:
                'A ii-V-I in C, voiced close together over the roots. Grey: the bass, the opening chord and notes held over from the chord before. Accent: notes that moved. From Dm9 to G13 only C falls to B. From G13 to Cmaj9 three notes step down and B stays.',
            alt: 'Piano roll of three bars with the chords Dm9, G13 and Cmaj9 above it. Bass notes D2, G2 and C2. Bar 1: F4, A4, C5 and E5. Bar 2: F4, A4 and E5 held in grey and B4 in the accent. Bar 3: B4 held in grey, and E4, G4 and D5 in the accent.',
            chords: [
                { at: 0, label: 'Dm9' },
                { at: 4, label: 'G13' },
                { at: 8, label: 'Cmaj9' },
            ],
            notes: [
                { start: 0, length: 4, pitch: 38, muted: true },
                { start: 0, length: 4, pitch: 65, muted: true },
                { start: 0, length: 4, pitch: 69, muted: true },
                { start: 0, length: 4, pitch: 72, muted: true },
                { start: 0, length: 4, pitch: 76, muted: true },
                { start: 4, length: 4, pitch: 43, muted: true },
                { start: 4, length: 4, pitch: 65, muted: true },
                { start: 4, length: 4, pitch: 69, muted: true },
                { start: 4, length: 4, pitch: 71, label: 'B' },
                { start: 4, length: 4, pitch: 76, muted: true },
                { start: 8, length: 4, pitch: 36, muted: true },
                { start: 8, length: 4, pitch: 64, label: 'E' },
                { start: 8, length: 4, pitch: 67, label: 'G' },
                { start: 8, length: 4, pitch: 71, muted: true },
                { start: 8, length: 4, pitch: 74, label: 'D' },
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
            alt: 'Two filter curves from 20 Hz to 20 kHz. Both are flat in the low end. The verse curve falls away above 1.5 kHz. The dotted chorus curve stays flat until about 8 kHz.',
            curves: [
                { kind: 'eq', label: 'Verse', bands: [{ type: 'lowpass', freq: 1500, q: 0.71 }] },
                { kind: 'eq', label: 'Chorus', dotted: true, bands: [{ type: 'lowpass', freq: 8000, q: 0.71 }] },
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
    content: `## Hook: the same three chords, two different songs

You loop Dm7, G7 and Cmaj7 on a piano patch, each chord a four-note block in root position. It sounds like an exercise from a theory book: every change is one block jumping to the next. Then you hear the same progression on an R&B record and the chords seem to melt into each other.

The progression is the same ii-V-I on both. The record differs in its voicing (added ninths and thirteenths, each note moving to the nearest note of the next chord) and in drums that sit slightly behind the grid.

## Why it matters: the beat exists to carry a voice

An R&B instrumental is a bed for a singer. Abrupt chord changes pull attention to the keys at the moment the singer wants it, and a stiff, fully quantized kit makes the whole bed feel rigid. The smooth sound people want from the genre comes from three moves you can make in any DAW: richer chords, small voice-leading steps, and drums that sit a little back.

## Science model: why small moves sound smooth

A triad stacks three notes. A seventh chord adds a fourth, a seventh above the root: Cmaj7 is C, E, G and B, Dm7 is D, F, A and C, G7 is G, B, D and F. A ninth chord adds one more, so Cmaj9 adds D and Dm9 adds E. The fifth adds little colour and is often left out, which makes room for the ninth.

Extended chords share more notes with their neighbours. Dm9 and G13, voiced as in the figure, share three of their four upper notes. The two notes that define a seventh chord are its third and seventh, the guide tones, and in a ii-V-I they move by a half step or not at all (Levine, 1995). The C of Dm7 falls to B, the third of G7; the F of G7 falls to E, the third of Cmaj7.

::figure guide

The ear hears it that way because of how it groups notes. Huron (2001) showed that most traditional voice-leading rules follow from a few perceptual principles, one of them pitch proximity: a note followed by a nearby pitch is heard as the same line continuing. When every note of a chord moves a step or stays, the listener hears four lines gliding. When the whole block jumps, the lines break and the change is heard as an event.

The drums follow the same logic in time. A snare a few milliseconds late reads as relaxed, as long as the offset is small and consistent. At 90 BPM a sixteenth lasts 60,000 / 90 / 4 = 166.7 ms, so a snare 20 ms late is about a tenth of a sixteenth off the grid.

::figure groove

Late is not automatically better. In listening tests, fully quantized versions of real grooves were rated about as highly as the played originals, and exaggerated offsets lowered the ratings (Davies et al., 2013; Senn et al., 2016). The lean sets the feel; it does not add groove by itself. Hear how far a snare can move before it sounds wrong.

::demo late-snare

## DAW experiment: from block chords to gliding ones

Use an electric piano patch at 90 BPM.

1. Program Dm7, G7, Cmaj7, one bar each, in root position, and loop it. Note how each change sounds.
2. Revoice it so the third and seventh move as little as possible: keep F from Dm7 into G7, drop C to B, then drop F to E into Cmaj7 and keep B.
3. Add the extensions from the figure: E on top of Dm9, E and A over G13, D on top of Cmaj9. Drop the fifths if the chords get crowded.
4. Put the roots in a separate bass part, so the keys can stay in the middle while the bass moves.
5. Program a kick and snare on the grid, then move both snares 15 to 20 ms late and the second kick about 15 ms late. Leave the first kick on the grid.
6. Push the snares to 40 ms late and listen for the moment the feel turns sloppy, then bring them back.
7. Add a low-pass filter on the keys, around 1.5 kHz in the verse and opened to 8 kHz in the chorus.

Progressions to try with the same method: Fmaj7, Em7, Dm7, Cmaj7 (the bass walks down); Cmaj7, C♯dim7, Dm7 (the bass climbs a half step at a time); Fmaj7, Fm7, Cmaj7 (A falls to A♭, then to G).

## Common mistake: thick chords that jump

The usual mistake is adding extensions without changing the voicing. A Dm9 in root position followed by a G13 in root position has the right notes and still jumps, because every voice leaps a fourth or fifth. The richer chord only sounds smooth when its notes move to nearby notes in the next one.

The second mistake is too much lean. A humanize function on every drum, or snares 40 ms late at 90 BPM, sounds like an unsteady drummer. Keep the first kick as an anchor and move only the hits you choose, by the same amount every time.

The third is forgetting the singer. Electric piano voicings sit in the same midrange as a vocal. Keep the verse to drums, bass and one chord instrument, and let the filter open for the chorus.

::figure filter

## Producer takeaway: move each note as little as it can

Pick the chords, then voice them so the guide tones move by a half step or stay, and let the bass carry the roots. Place the snare a little late and leave the first kick on the grid. When the changes glide and the drums lean back, the keys stay under the singer. For more on the drum side, see the lessons on [the late snare](/blog/the-late-snare-illusion-in-modern-records) and [swing](/blog/swing-explained-without-mystical-language).

## References

- Davies, M., Madison, G., Silva, P., & Gouyon, F. (2013). The effect of microtiming deviations on the perception of groove in short rhythms. *Music Perception*, 30(5), 497-510.
- Huron, D. (2001). Tone and voice: A derivation of the rules of voice-leading from perceptual principles. *Music Perception*, 19(1), 1-64.
- Levine, M. (1995). *The Jazz Theory Book*. Sher Music.
- Senn, O., Kilchenmann, L., von Georgi, R., & Bullerjahn, C. (2016). The effect of expert performance microtiming on listeners' experience of groove in swing or funk music. *Frontiers in Psychology*, 7, 1487.
`,
    seo: {
        title: 'R&B chords that glide | VGP Studio',
        description: 'Why R&B chords sound smooth: shared notes, guide tones that move a half step, a few milliseconds of late snare, and room left for the singer.',
        keywords: ['r&b beats', 'r&b chord progressions', 'neo-soul chords', 'voice leading', 'ii-V-I', 'r&b drums'],
    },
};
