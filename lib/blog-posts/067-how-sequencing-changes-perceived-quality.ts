import { BlogArticle } from '../blog-data';

export const post067: BlogArticle = {
    slug: 'how-sequencing-changes-perceived-quality',
    title: 'Sequencing changes perceived quality',
    excerpt: 'Each song is heard against the one before it. How running order, gaps and the level steps between tracks make an album sound better or worse.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'Listeners judge each song partly against the one before it, so running order changes how good each track seems.',
        'Spotify normalizes an album played in order as one unit and Apple\'s Sound Check can work per album, so the level steps you set between tracks reach album listeners.',
        'Measure gaps from the last audible sound, not the end of the file, and set each transition by ear.',
    ],
    figures: {
        album: {
            type: 'curve',
            caption:
                'Played in order on Spotify, an album is normalized as one unit, so the quiet ballad at track 5 stays quieter than its neighbours, as mastered. In shuffle or a playlist each track is matched on its own, and the level steps disappear.',
            alt: 'Playback level across eight tracks. The solid album playback line rises and falls, with a clear dip at track 5. A dashed shuffle line stays flat.',
            x: ['Track 1', 'Track 2', 'Track 3', 'Track 4', 'Track 5', 'Track 6', 'Track 7', 'Track 8'],
            xShort: ['1', '2', '3', '4', '5', '6', '7', '8'],
            yLabel: 'Playback level',
            series: [
                { label: 'Album played in order', values: [0.72, 0.78, 0.64, 0.74, 0.4, 0.66, 0.78, 0.52] },
                { label: 'Shuffle or playlist', values: [0.66, 0.66, 0.66, 0.66, 0.66, 0.66, 0.66, 0.66], dashed: true },
            ],
        },
        gap: {
            type: 'signal',
            caption:
                'The gap a listener hears runs from the moment the sound dies away. Both transitions leave the same silence after the last audible sound, so the song with the long tail needs its successor placed later.',
            alt: 'Two level envelopes. In the first, a song stops abruptly and the next starts after a short silence. In the second, the last note decays slowly before the same length of silence and the next song.',
            rows: [
                {
                    label: 'Hard ending',
                    unipolar: true,
                    traces: [{ kind: 'envelope', points: [[0, 0.75], [0.4, 0.75], [0.41, 0], [0.65, 0], [0.66, 0.6], [1, 0.6]] }],
                    marks: [
                        { t: 0.41, label: 'Silence starts' },
                        { t: 0.66, label: 'Next song' },
                    ],
                },
                {
                    label: 'Long reverb tail',
                    unipolar: true,
                    traces: [
                        {
                            kind: 'envelope',
                            points: [[0, 0.75], [0.25, 0.75], [0.26, 0.5], [0.32, 0.3], [0.38, 0.16], [0.44, 0.07], [0.5, 0], [0.75, 0], [0.76, 0.6], [1, 0.6]],
                        },
                    ],
                    marks: [
                        { t: 0.5, label: 'Silence starts' },
                        { t: 0.76, label: 'Next song' },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'How does Spotify set levels when someone plays your album in order?',
            options: [
                'It applies one gain across the whole album',
                'It sets each track to -14 LUFS on its own',
                'It switches normalization off for albums',
                'It limits the loudest track to match the rest',
            ],
            answer: 0,
            why: 'Spotify normalizes an album as one unit, so the gain does not change between tracks. In shuffle or a playlist, each track is adjusted separately.',
        },
        {
            q: 'Where should you measure a gap between two songs from?',
            options: [
                'The end of the first song\'s audio file',
                'The final downbeat of the first song',
                'The start of the first song\'s fade',
                'The first song\'s last audible sound',
            ],
            answer: 3,
            why: 'Silence starts when the sound dies away. A song with a long tail reaches it later than its file length suggests.',
        },
        {
            q: 'You master every track on an album to the same integrated LUFS. What can go wrong?',
            options: [
                'The album fails the distributor\'s checks',
                'The ballad ends up as big as the singles',
                'Each track\'s true peak climbs over -1 dBTP',
                'The singles lose punch next to the ballad',
            ],
            answer: 1,
            why: 'Equal loudness erases the level steps between songs. A quiet song that should feel close is pushed up to the size of the loudest ones.',
        },
    ],
    content: `## Hook: good songs, awkward album

Each song on the record sounds finished on its own. You put them in order, play the album from the top, and it feels wrong. A loud, bright track slams into a soft ballad and the ballad sounds weak. Two songs at the same tempo blur together. The gaps feel either rushed or dead.

None of those problems are in the mixes. They come from the order, the spacing and the level steps between songs, and those are decisions you make when you master an album.

## Why it matters: every song is heard against the last one

A listener judges each song partly against the one that came before. After a dense, loud track, a sparse ballad can feel small; after a quiet one, a loud track feels huge. Those contrasts can work for you or against you, so the order changes how good each song seems.

Level is the part that survives or vanishes depending on how people listen. When someone plays an album on Spotify, it normalizes the whole album at once, so the gain does not change between tracks and the quiet songs stay as quiet as you made them. In shuffle or a playlist, each song is adjusted on its own. Apple's Sound Check can also set the volume per album instead of per song. The level steps you choose between songs reach album listeners intact; in shuffle and playlists they are matched away.

::figure album

## Science model: level, time and key between songs

Three things decide how one song hands over to the next.

**Relative level.** In album playback the loudness differences between songs are kept, so set them on purpose. A ballad meant to feel intimate can sit a few LU below the songs around it. Mastering every track to the same integrated loudness makes it as big as the singles. Judge these steps by ear on the transitions, not from the meter alone: a sparse song and a dense one can feel different even at the same LUFS reading.

**Time.** The gap a listener hears starts when the sound dies away, not when the file ends. A song that stops on a hard hit and one that ends in a long reverb tail need different spacing after them. Tempo matters too: after a fast song, a slightly longer gap lets the pulse clear before a slow one starts.

::figure gap

**Key and tempo.** Neighbouring songs in related keys hand over smoothly. A distant key or a big tempo change marks a clear new start. Neither is wrong; choose which one each transition needs.

## DAW experiment: build one transition

1. Import the final masters of two consecutive songs into a new session, one after the other on the same track.
2. Place the second song so it starts 2 seconds after the last audible sound of the first, not after the end of the file. Play the last 20 seconds of the first song into the first 20 seconds of the second.
3. Try the gap at 1 second and at 4 seconds. Note which one makes the first note of the second song feel like an arrival.
4. Watch a short-term loudness meter across the transition, then move the second song up or down in 1 dB steps until the jump feels intended.
5. If the first song ends in a long fade or tail, try starting the second song inside the end of the tail instead of after silence.
6. Play the whole album once, top to bottom, with the gaps and levels you chose, and note every transition that still jars.

Each transition will have its own answer, and a fixed gap seldom suits every pair.

## Common mistake: one gap and one level for everything

The common mistake is the same 2-second gap and the same loudness for every track. It treats the album as a folder of files. A fast song ending on a hit and a slow song ending in a fade need different handovers.

The other mistake is ordering by what you think are the best songs, first to last. Put strong songs early, but check the energy of the whole running order, so the album does not peak at track three and sag for the rest.

## Producer takeaway: master the album as one piece

Sequence by energy, tempo and key. Set gaps by ear from the last audible sound, and set levels on the transitions. Those level choices reach everyone who plays the album in order, so make them deliberate. Then listen through once in one sitting, the way a fan would.

## References

- Apple. (2021). *Apple Digital Masters* [Technology brief]. https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf
- Katz, B. (2015). *Mastering Audio: The Art and the Science* (3rd ed.). Focal Press.
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'Sequencing changes perceived quality | VGP Studio',
        description: 'How running order, gaps measured from the last audible sound, and album normalization on Spotify and Apple shape how good each song on an album sounds.',
        keywords: ['album sequencing', 'track spacing', 'album normalization', 'mastering an album', 'running order', 'Sound Check'],
    },
};
