import { BlogArticle } from '../blog-data';

export const post009: BlogArticle = {
    slug: 'why-familiar-chords-can-still-feel-fresh',
    title: 'Keep the familiar chords, change the bass',
    excerpt: 'A common progression is a strength, not a cliché. Change the bass line and the timing of the changes, and the same four chords sound new.',
    category: 'songwriting',
    publishedAt: '2026-06-03',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'A familiar progression is easy to predict, which leaves the listener\'s attention free for the melody and the words.',
        'Freshness can come from the bass line and the timing of the changes while the chords themselves stay the same.',
        'Try an inversion such as G/B for a stepwise bass, and push chord changes an eighth note before the bar line.',
    ],
    figures: {
        bass: {
            type: 'notes',
            caption:
                'The bass under C, G, Am, F, one bar per chord. With roots (the grey G in bar 2) it drops a fourth, rises a step and drops a third. With B under the G chord it walks down C, B, A, then drops a third to F.',
            alt: 'Piano roll of a four-bar bass line with the chords C, G over B, A minor and F above it. The bass plays C2, B1, A1 and F1 as whole notes. A grey G1 in bar 2 shows the root it replaces.',
            chords: [
                { at: 0, label: 'C' },
                { at: 4, label: 'G/B' },
                { at: 8, label: 'Am' },
                { at: 12, label: 'F' },
            ],
            notes: [
                { start: 0, length: 4, pitch: 36, label: 'C' },
                { start: 4, length: 4, pitch: 31, label: 'G', muted: true },
                { start: 4, length: 4, pitch: 35, label: 'B' },
                { start: 8, length: 4, pitch: 33, label: 'A' },
                { start: 12, length: 4, pitch: 29, label: 'F' },
            ],
        },
        push: {
            type: 'rhythm',
            steps: 32,
            caption:
                'Two bars of chords against the kick, counted 1 to 8. On the bar line, the second chord lands with the kick on beat 5, the start of bar 2. Pushed, it arrives an eighth note earlier and ties over, so the change leans into the new bar.',
            alt: 'Three rows on a two-bar grid. The kick plays on beats 1, 3, 5 and 7. The first chord row changes chord on beat 5. The second chord row changes one eighth note before beat 5.',
            rows: [
                { label: 'Kick', hits: [0, 8, 16, 24] },
                { label: 'On the bar line', note: 'G on beat 5', hits: [0, 16] },
                { label: 'Pushed', focus: true, note: 'G an eighth early', hits: [0, 14] },
            ],
        },
    },
    quiz: [
        {
            q: 'You play C, G, Am, F with roots in the bass. Which single change makes the bass walk down by step?',
            options: [
                'Play G with B in the bass',
                'Play Am with E in the bass',
                'Play F with C in the bass',
                'Play C with G in the bass',
            ],
            answer: 0,
            why: 'With B under the G chord, the bass runs C, B, A before dropping to F. The other options leave the leaps in place or add new ones.',
        },
        {
            q: 'Why can a well-known progression with a new bass line still feel fresh?',
            options: [
                'The new bass line replaces the chords entirely',
                'Most listeners cannot hear the bass line clearly',
                'The chords are expected, and the bass surprises',
                'The new bass line slips it into a new key',
            ],
            answer: 2,
            why: 'The listener\'s schema for the progression is confirmed, which tends to feel good, while the bass and the timing offer small surprises that still make sense.',
        },
        {
            q: 'You add minor ninth chords and the low end turns muddy. What is the likely cause?',
            options: [
                'The ninth rubs against the root of the chord',
                'Extensions are voiced low, where they blur',
                'The tempo is too fast for the extended chords',
                'The bass part is mixed too low underneath',
            ],
            answer: 1,
            why: 'Seconds and thirds sound clear high up and muddy low down. Keep extensions in the upper part of the voicing and the bass on roots, fifths or inversions.',
        },
    ],
    content: `## Hook: two hours replacing four good chords

You sit down to write a song and play a simple four-chord progression: I, V, vi, IV. It sounds stable and immediately familiar.

Then a voice in your head says it is too simple. It is one of the most used progressions in pop, so you feel lazy for using it. You spend the next two hours replacing the chords with modal borrowings and minor ninths.

When you play it back, the groove is gone. The song feels cold and hard to follow. By trying to make the progression unique, you have taken away the thing that made it easy to listen to.

## Why it matters: the frame the melody stands on

Listeners do not need complex harmony to connect with a song. A familiar progression lets them predict where the song is going, which leaves their attention free for the melody and the words.

The opposite costs them effort. Listeners track the key across several chords at once, and in Krumhansl and Kessler's experiments shifts to distant keys took longer to register than shifts to close ones (Krumhansl and Kessler, 1982). A progression that keeps wandering asks the listener to keep reorienting, and that attention comes out of the melody's share.

Too predictable has its own cost: the song can sound generic. The usual answer is to present the familiar chords in a new way.

## Science model: two kinds of expectation

Huron (2006) separates schematic expectations, built from everything you have heard in a style, from veridical expectations, your memory of one particular song. I, V, vi, IV matches a strong schema, so listeners predict it easily, and accurate predictions tend to feel good.

Freshness can come from a lower level of detail while the schema holds. Which note is in the bass, and exactly when the chord changes, are separate predictions. Change them and the listener gets small surprises that still make sense, because the progression underneath is the one they expected. Huron also argues that schematic expectations keep working even when you know a song well, which is part of why a well-placed surprise can survive many hearings.

The most useful tool is the inversion: the same chord with a note other than the root in the bass. G/B means a G major chord with B as the lowest note. In C, G/B, Am, F, the bass falls by step from C to B to A, then drops to F. The chords have not changed, but the bass is now a melody. Moving each voice by the smallest available step between chords is called smooth voice leading.

::figure bass

The second tool is timing. Moving a chord change an eighth note ahead of the bar line, so it ties over into the bar, is called a push. It makes the harmony lean forward against the beat without changing a single chord.

::figure push

## DAW experiment: the bass mutation pass

1. At 100 BPM, write C, G, Am, F, one bar each, on a piano patch. Add a bass track playing the roots as whole notes: C2, G1, A1, F1.
2. Loop it four times with a simple drum beat. This is your reference.
3. On a copy of the bass, change the G bar to B1. The bass now walks C, B, A, F.
4. In the Am bar, play A1 for two beats and G1 for two beats, so the bass walks down by step all the way to F.
5. Move every chord change after the first an eighth note early: start each new chord on the "and" of beat 4 of the bar before, and tie it over the bar line. Keep the bass on the beat at first, then try pushing it too.
6. Compare the reference loop and the new one over the same drums.

The chords are identical, but the new loop moves differently: the bass sings a line of its own and the pushes make each change lean into the next bar.

## Common mistake: the extension overload

The most common mistake is loading a simple pop song with jazz extensions. Major sevenths and minor ninths can sound beautiful, but voiced low they muddy the bass register and can clash with the vocal. A useful rule of thumb from arranging: close intervals such as seconds and thirds sound clear high up and muddy low down. Keep extensions in the upper part of the voicing and the bass on roots, fifths or inversions.

The second mistake is believing that simple chords mean lazy writing. A simple progression is often the professional choice because it gives the vocal room.

## Producer takeaway: taste is in the angle

Taste is often in the angle, not the raw material. Keep your harmony simple and let the bass line, the rhythm of the changes and the vocal melody do the fresh work. Before you change a chord, try changing its bass note or the moment it arrives.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Krumhansl, C. L., & Kessler, E. J. (1982). Tracing the dynamic changes in perceived tonal organization in a spatial representation of musical keys. *Psychological Review*, 89(4), 334-368.
`,
    seo: {
        title: 'Keep the familiar chords, change the bass',
        description: 'Make a common chord progression sound new without changing the chords. Use inversions for a stepwise bass and push the changes ahead of the beat.',
        keywords: ['chord progressions', 'chord inversions', 'bass line writing', 'musical expectation', 'songwriting tips'],
    },
};
