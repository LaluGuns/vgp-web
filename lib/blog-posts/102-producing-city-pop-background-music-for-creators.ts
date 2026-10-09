import { BlogArticle } from '../blog-data';

export const post102: BlogArticle = {
    slug: 'producing-city-pop-background-music-for-creators',
    title: 'City Pop under a voiceover: leave the speech band open',
    excerpt: 'City Pop keys, guitar and leads sit in the octaves that carry speech. How to arrange and duck a cue so the narration stays clear and the groove keeps moving.',
    category: 'genre-guides',
    publishedAt: '2026-07-19',
    updatedAt: '2026-10-09',
    readingTime: 4,
    summary: [
        'Speech intelligibility lives mostly between 1 and 4 kHz, so keys, guitar and lead lines compete with a voiceover far more than bass and kick do.',
        'Under narration, dip the music bus in that band, keyed from the voice, instead of pulling the whole cue down.',
        'Arrange for the edit: keep sung or lead lines for the sections without talking, and bring them back under the b-roll.',
    ],
    figures: {
        weights: {
            type: 'bars',
            min: 0,
            max: 30,
            unit: '%',
            caption:
                'How much each octave counts toward the Speech Intelligibility Index (ANSI S3.5-1997, octave-band procedure). The 1, 2 and 4 kHz octaves carry 72 percent of the weight between them. The 250 Hz octave, where bass and kick live, carries 6 percent.',
            alt: 'Six bars for octave bands. 250 Hz 6.2 percent, 500 Hz 16.7 percent, 1 kHz 23.7 percent, 2 kHz 26.5 percent, 4 kHz 21.4 percent, 8 kHz 5.5 percent. The 1, 2 and 4 kHz bars are drawn in the accent, the others in grey.',
            bars: [
                { label: '250 Hz', value: 6.17, display: '6.2%', dim: true },
                { label: '500 Hz', value: 16.71, display: '16.7%', dim: true },
                { label: '1 kHz', value: 23.73, display: '23.7%' },
                { label: '2 kHz', value: 26.48, display: '26.5%' },
                { label: '4 kHz', value: 21.42, display: '21.4%' },
                { label: '8 kHz', value: 5.49, display: '5.5%', dim: true },
            ],
        },
        duck: {
            type: 'spectrum',
            mode: 'gain',
            db: 9,
            caption:
                'Two ways to make room for the voice on the music bus, computed. The dashed grey line turns the whole cue down 6 dB, bass and drums included. The wide dip takes 5 dB out at 2 kHz, about 2.4 dB at 1 and 4 kHz, and less than 1 dB below 500 Hz, so the groove keeps its weight.',
            alt: 'Gain over frequency from 20 Hz to 20 kHz with the 1 to 4 kHz band shaded. A dashed line sits flat at minus 6 dB. A solid curve is flat at 0 dB in the lows and highs and dips to minus 5 dB around 2 kHz.',
            bands: [{ from: 1000, to: 4000, label: 'Speech band' }],
            curves: [
                { kind: 'slope', dbPerOct: 0, level: -6, label: 'Whole cue -6 dB', dashed: true, muted: true },
                { kind: 'eq', label: 'Dip, -5 dB at 2 kHz', bands: [{ type: 'bell', freq: 2000, gain: -5, q: 0.7 }] },
            ],
        },
        cue: {
            type: 'arrangement',
            caption:
                'A cue laid out against the edit. The lead sits out wherever the narrator talks and returns under the b-roll. Drums, bass and chords carry the groove the whole way, so the gaps never sound like a mistake.',
            alt: 'Arrangement grid with four sections: talk, b-roll, talk, b-roll. Drums, bass and chords play in every section. The lead plays only in the two b-roll sections. Fills appear only in the b-roll.',
            sections: [
                { label: 'Talk', bars: 8 },
                { label: 'B-roll', short: 'B-roll', bars: 4 },
                { label: 'Talk', bars: 8 },
                { label: 'B-roll', short: 'B-roll', bars: 4 },
            ],
            layers: [
                { label: 'Drums', levels: [0.6, 0.8, 0.6, 0.8] },
                { label: 'Bass', levels: [0.7, 0.8, 0.7, 0.8] },
                { label: 'Chords', levels: [0.5, 0.7, 0.5, 0.7] },
                { label: 'Lead', levels: [0, 0.9, 0, 0.9], focus: true },
                { label: 'Fills', levels: [0, 0.6, 0, 0.6] },
            ],
        },
    },
    quiz: [
        {
            q: 'The narration blurs over a City Pop cue on a phone speaker. Which layer do you mute first to test?',
            options: [
                'The sub bass under 100 Hz',
                'The kick drum on every beat',
                'The electric piano comping',
                'The vinyl crackle on the bus',
            ],
            answer: 2,
            why: 'Electric piano comping sits in the 1 to 4 kHz octaves that carry most of the intelligibility weight. Sub bass and kick sit where speech counts for little.',
        },
        {
            q: 'You can duck the whole music bus 6 dB under the voice, or dip it 5 dB around 2 kHz. What does the dip keep that the duck loses?',
            options: [
                'The level of the speech band itself',
                'The bass and drums at their full level',
                'The stereo width of the chorus guitar',
                'The timing of the sidechain release',
            ],
            answer: 1,
            why: 'The dip barely touches anything below 500 Hz, so the groove keeps its weight. The broadband duck turns down the low end too, where it was not competing with the words.',
        },
        {
            q: 'Why does a sung hook cost more under narration than an instrumental lead at the same level?',
            options: [
                'Vocal lines disturb verbal memory more',
                'Sung hooks are always mixed louder',
                'Vocals are recorded in mono, leads in stereo',
                'Vocals mask the bass of the narrator',
            ],
            answer: 0,
            why: 'Salamé and Baddeley found vocal music disrupted verbal short-term memory more than instrumental music. A viewer following a narrator is doing verbal work too.',
        },
    ],
    content: `## Hook: the cue that sounds perfect until someone talks

You finish a City Pop cue for a travel vlog: chorused guitar, a bright electric piano, a slap bass line and a lead synth that answers it. On its own it sounds like a late drive through a city at night. The editor drops it under the narration and the first comment on the video asks what the narrator said at 0:42.

The editor's fix is to ride the music fader down until the words come back. By then the cue has lost its bounce, and on a phone speaker the words still smear in places. The level was fine in most of the spectrum. The cue was too busy in the octaves that carry speech.

## Why it matters: the City Pop palette sits on top of the words

City Pop, the glossy Japanese pop of the late 1970s and 1980s, is built from sounds with a lot of energy in the midrange: electric piano voicings, clean guitar with chorus, brass stabs, a lead vocal or a lead synth. Those are the same octaves a voiceover needs. The bass line and the kick, which give the genre its pull, sit mostly below them.

So the parts that make a cue sound like City Pop are also the parts that blur the narration. Turning the whole cue down trades away the groove to clear a problem that lives in one region.

## Science model: where speech intelligibility lives

The Speech Intelligibility Index (ANSI S3.5-1997) predicts how much of a speech signal a listener can use by weighting each frequency band by how much it contributes to understanding. In its octave-band version, the weights pile up in the middle.

::figure weights

Masking happens band by band: a louder sound raises the threshold for quieter sounds near its own frequency (Fastl and Zwicker, 2007). A slap bass at 100 Hz does little to the consonants of a voice. An electric piano chord at 1 to 3 kHz covers exactly the part of the voice that the index weights most.

Words in the music add a second cost, separate from frequency. Salamé and Baddeley (1989) had people remember lists of digits while music played that they were told to ignore. In their first experiment, both kinds of music hurt recall compared with quiet, and vocal music hurt it more. A second experiment, with more practised participants, found the vocal cost again. Their task was not watching a video, but a viewer following a narrator is also holding words in memory. A sung hook under narration costs more than its level suggests.

That points to two fixes. Take energy out of the speech band only while the voice is talking, and keep sung or busy lead lines for the moments without talking.

::figure duck

Hear the same move on a lead and a pad. The lead's level never changes; only the pad does.

::demo masking

## DAW experiment: duck the band, not the cue

You need a City Pop loop, or any busy cue, and 30 seconds of speech: read a paragraph into your phone or use a podcast clip. Step 6 also needs a dynamic EQ with an external sidechain input. Several DAWs do not ship one, and a multiband compressor keyed from the voice can stand in for it.

1. Put the speech on its own track, centred, and route every music track to one music bus.
2. Balance the two by ear on headphones until the voice sits where you would normally mix it.
3. Listen on a phone speaker or laptop speakers and write down the words that blur.
4. With the voice playing, mute the music parts one at a time. Note which mute makes those words clearest. Expect the keys, the guitar or the lead.
5. Unmute everything. On the music bus, add a compressor keyed from the voice: 3:1, attack around 10 ms, release around 300 ms, threshold set for 3 to 4 dB of gain reduction while the voice talks. Listen for pumping in the bass.
6. Bypass it and try a dynamic EQ band instead, keyed from the voice: a wide bell at 2 kHz, Q about 0.7, dipping 4 to 6 dB while the voice talks. With a multiband compressor, set one band to about 1 to 4 kHz, let it take off the same 4 to 6 dB and leave the other bands uncompressed.
7. Compare the two on the phone speaker, at the same playback level.
8. Finally, mute the lead under the talking sections and keep it in the b-roll. Keep the version where every word is easy to follow and the groove still moves.

## Common mistake: fixing a band problem with the fader

The usual mistake is the one from the hook: pulling the whole cue down until the words come through. The low end and the drums lose their weight first, and the music starts to sound like it is in another room, while the keys can still cover the consonants.

The opposite mistake is a broadband sidechain set too fast. The whole cue jumps up and down with every syllable, and viewers hear the pumping before they hear the music. A slower release, a band-limited dip, or simply a part that sits out are all quieter than the fader.

The third is leaving the topline in. A sung hook or a vocal chop under a talking head competes for attention even when it is mixed low.

::figure cue

## Producer takeaway: arrange for the edit

When you produce City Pop for someone else's video, write the cue with talking in mind. Keep drums, bass and chords steady, give the lead and the fills the sections without talking, and leave the 1 to 4 kHz region light enough that a dip of a few dB clears it. The cue still sounds like City Pop, and the narrator never has to fight it.

If you are choosing a finished cue rather than producing one, the [lesson on streaming versus a creator license](/blog/spotify-streaming-vs-flow-creator-license) covers what you need before it goes under a published video.

## References

- American National Standards Institute. (1997, reaffirmed 2024). *ANSI/ASA S3.5-1997: Methods for Calculation of the Speech Intelligibility Index*. Acoustical Society of America.
- Fastl, H., & Zwicker, E. (2007). *Psychoacoustics: Facts and Models* (3rd ed.). Springer.
- Salamé, P., & Baddeley, A. (1989). Effects of background music on phonological short-term memory. *The Quarterly Journal of Experimental Psychology Section A*, 41(1), 107-122.
`,
    seo: {
        title: 'City Pop under a voiceover | VGP Studio',
        description: 'Keys and leads in City Pop sit in the octaves that carry speech. Arrange and duck a cue so narration stays clear and the groove keeps moving.',
        keywords: ['city pop background music', 'music under voiceover', 'speech intelligibility', 'sidechain ducking', 'dynamic EQ', 'city pop production'],
    },
};
