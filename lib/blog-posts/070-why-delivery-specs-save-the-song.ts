import { BlogArticle } from '../blog-data';

export const post070: BlogArticle = {
    slug: 'why-delivery-specs-save-the-song',
    title: 'Why delivery specs save the song',
    excerpt: 'Before anyone hears your WAV, it is encoded, decoded and turned up or down, and a delivery spec is the list of what it has to survive.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'After upload, your master is measured, encoded to a lossy format, decoded on a device and turned up or down by normalization.',
        'Encoding and reconstruction can both push peaks above the WAV, so the true-peak ceiling has to leave room for them.',
        'Deliver what each destination asks for, meter an encoded copy before release, and keep an unlimited premaster for everything else.',
    ],
    figures: {
        chain: {
            type: 'flow',
            caption:
                'Every step after your master can change its peaks. The encoder stores an approximation of the wave, the decoder and converter rebuild it, and any stage with a fixed maximum level clips what rises above full scale.',
            alt: 'Five steps: your master, the distributor, the service measuring and encoding, the device decoding and applying normalization gain, and the converter and speaker.',
            steps: [
                { label: 'Your master', note: '24-bit WAV, true peak under the ceiling' },
                { label: 'Distributor', note: 'Passes the file to each service' },
                { label: 'Service', focus: true, note: 'Measures loudness, encodes to AAC or Ogg Vorbis' },
                { label: 'Device', note: 'Decodes, applies the normalization gain' },
                { label: 'Converter and speaker', focus: true, note: 'Overs above full scale clip here' },
            ],
        },
    },
    quiz: [
        {
            q: 'You line up an AAC copy with your WAV to the sample, flip its polarity and play both. What do you hear?',
            options: [
                'The part of the sound the codec changed',
                'Silence, as a good encode matches the WAV',
                'The full master, twice as loud as before',
                'The low end, where the codec cuts the most',
            ],
            answer: 0,
            why: 'Whatever the two files share cancels. What is left is the difference the encoder made, usually in the top end and around transients.',
        },
        {
            q: 'A dynamic master is quieter than -14 LUFS and peaks near 0 dBTP. What does Spotify\'s Normal setting do?',
            options: [
                'Raises it to -14 LUFS and clips the peaks',
                'Compresses it until it reaches -14 LUFS',
                'Raises it no further than its peaks allow',
                'Turns it down to make room for its peaks',
            ],
            answer: 2,
            why: 'Spotify only applies positive gain up to the point where the peaks would pass -1 dB. On the Loud setting it uses a limiter instead.',
        },
        {
            q: 'Why keep an unlimited premaster when you deliver a loud streaming master?',
            options: [
                'Distributors ask for it alongside the master',
                'Vinyl and remasters need an unlimited file',
                'It makes the streaming master sound louder',
                'It stops inter-sample peaks after encoding',
            ],
            answer: 1,
            why: 'Limiting cannot be undone. A premaster lets you make a different master later without going back to the mix.',
        },
    ],
    content: `## Hook: the upload that sounded different

You finish the master. It sounds clear and deep in the studio, and you send a 24-bit WAV to your distributor. Weeks later, on a streaming app, the top end is harsher and the loudest kicks crackle. You reload the WAV, check the meters and find no clipping anywhere.

The listener never heard your WAV. On the way, it was measured, encoded to a lossy format, decoded on a phone and turned up or down by normalization. A delivery spec is the list of things your master has to survive on the way.

## Why it matters: your file is processed after you let go

Services do their own processing. Spotify says it prepares the compressed and lossless streams itself from one high-quality stereo master per track, and its true-peak advice is written for lossy formats such as Ogg Vorbis and AAC. Apple publishes the commands it uses to encode masters to 256 kbps AAC at ingest, so you can audition that encode yourself (Apple, 2021).

Each of those steps can change your peaks. EBU Tech 3343 lists lossy coding among the processes that create inter-sample peaks above the original sample level, along with the converters and sample rate converters that follow.

::figure chain

## Science model: what each step can do to the master

**Measurement.** The service reads integrated loudness with ITU-R BS.1770 and sets a playback gain. On Spotify's Normal setting, a master louder than -14 LUFS is turned down. A quieter one is raised only until its peaks reach -1 dB, so a dynamic master with high peaks may not be raised at all. The Loud setting is the exception: it raises soft tracks regardless of true peak and catches them with a limiter.

**Encoding.** A lossy encoder stores an approximation of your waveform that should sound the same. The decoded wave is a different wave, and it can peak higher than the original, more so on loud, dense masters. That is why Apple tells you to check the encoded file for clipping, as well as the 24-bit master.

**Decoding and conversion.** The device rebuilds the continuous wave from samples. That wave can crest between samples, and any stage with a fixed maximum level clips what goes past full scale.

That is why the true-peak ceiling is lower than 0. The numbers come from the documents that set them:

| Item | Spec |
| --- | --- |
| File | One high-quality stereo master per track (Spotify) |
| Resolution | The original 24-bit PCM file (Apple Digital Masters) |
| True peak | Below -1 dBTP, or -2 dBTP if louder than -14 LUFS (Spotify) |
| Ceiling | -1 dBTP for PCM, -2 dBTP for some broadcast codecs (EBU) |
| Clipping | None, in the WAV or in an encoded test (Apple) |

Different destinations have different limits. Vinyl struggles with loud high frequencies and with bass that is out of phase between the channels, so cutting engineers usually want a separate, less limited master. Ask before you send one file everywhere.

## DAW experiment: audition the encode

1. Bounce your master as a 24-bit WAV and note its integrated LUFS and its true peak.
2. Make a lossy copy: a 128 kbps MP3 or AAC from your DAW or a converter. On a Mac, Apple's afconvert tool makes the same AAC encode Apple Music uses, with the commands from its Digital Masters brief.
3. Import the encoded file next to the WAV and line them up to the sample. Zoom in on the first transient, because encoders often add a short delay at the start.
4. Put a true-peak meter on each track, play the loudest section and note the highest reading on each.
5. Flip the polarity of the encoded track and play both together. What you hear is the difference between them, the part the codec changed.
6. If the encoded copy reads above 0 dBTP, lower the limiter ceiling by 0.5 dB, bounce again and repeat until it stays below.

On loud material the encoded copy often reads higher than the WAV. The difference signal shows you where the codec works hardest, usually in the top end and around transients.

## Common mistake: one master for every destination

One loud master goes everywhere: to streaming, to the vinyl cutter and into your archive. Limiting cannot be undone, so keep an unlimited premaster for remasters, vinyl and formats you have not thought of yet.

The other mistake is trusting normalization to fix level problems. It changes gain and nothing else. It will not limit a loud master, it will not clean up overs that are already in the file, and on the Normal setting it will not raise a quiet master past the point where its peaks would clip.

## Producer takeaway: deliver to the destination

Set a true-peak ceiling of -1 dBTP, or -2 dBTP for masters louder than -14 LUFS going to Spotify. Before release, meter an encoded copy as well as the WAV. Deliver each destination the file it asks for, and keep a premaster the final limiter has not touched. How true peak works in detail is in the [lesson on true peak after encoding](/blog/why-true-peak-matters-after-encoding).

## References

- Apple. (2021). *Apple Digital Masters* [Technology brief]. https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf
- European Broadcasting Union. (2023). *EBU R 128: Loudness normalisation and permitted maximum level of audio signals*. EBU. https://tech.ebu.ch/publications/r128/
- European Broadcasting Union. (2023). *Tech 3343: Guidelines for production of programmes in accordance with EBU R 128*. EBU. https://tech.ebu.ch/docs/tech/tech3343.pdf
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Katz, B. (2015). *Mastering Audio: The Art and the Science* (3rd ed.). Focal Press.
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
`,
    seo: {
        title: 'Why delivery specs save the song | VGP Studio',
        description: 'What happens to a master after upload: loudness measurement, lossy encoding and decoding, and the true-peak ceilings and files each destination needs.',
        keywords: ['master delivery', 'delivery specs', 'true peak', 'lossy encoding', 'Apple Digital Masters', 'Spotify mastering'],
    },
};
