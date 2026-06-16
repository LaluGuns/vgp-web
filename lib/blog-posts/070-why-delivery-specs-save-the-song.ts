import { BlogArticle } from '../blog-data';

export const post070: BlogArticle = {
    slug: 'why-delivery-specs-save-the-song',
    title: 'Why delivery specs save the song',
    excerpt: 'How following delivery specifications protects your record from platform constraints, and why export logs verify technical safety.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    readingTime: 8,
    content: `## The playback surprise

You finish mastering a track. It sounds clear, balanced, and deep in your studio. You export the 24-bit WAV file and send it to your distributor. Two weeks later, you play the song on a streaming service. The highs sound harsh, a digital crackle occurs on kick drums, and the stereo width feels congested. You load the original master file back into your project, check the levels, and see no clipping. The meters read clean, yet the streamed version is distorted.

This happens because streaming platforms do not play raw WAV files to consumers. They convert your files to lossy formats like Ogg Vorbis or AAC. If your master does not account for these codec conversions, the compression process will introduce audible artifacts that ruin the listening experience.

## Why platform constraints matter

Digital streaming distribution relies on automated transcoding pipelines. When an audio file is compressed into a lossy format, the codec removes data based on psychoacoustic models. This data removal changes the peak levels of the waveform. A file that peaks at minus zero point one decibels Full Scale (dBFS) in PCM format will often clip after Ogg Vorbis encoding.

Ignoring these parameters causes your music to suffer from inter-sample clipping. This distortion occurs when the consumer device reconstructs the analog wave from the digital samples. If the peaks are too hot, the digital-to-analog converter chips in phones and car speakers will saturate. Delivery is a technical extension of the master. You must format files specifically for the destination medium to protect the performance.

## Transcoding and true peak mechanics

Lossy encoding algorithms change the shape of the audio waveform. When PCM audio is converted to a codec like AAC, the filter reconstruction interpolates values between the sample points. If the original samples are close to the ceiling, the reconstructed peak will exceed the digital limits. This relationship is defined by the true peak level:

$$\\text{True Peak (dBTP)} = L_{\\text{sample}} + \\Delta_{\\text{reconstruction}}$$

Here, $L_{\\text{sample}}$ represents the highest sample amplitude in the PCM file, and $\\Delta_{\\text{reconstruction}}$ represents the peak level increase caused by the codec interpolation filter. 

If your master has an integrated loudness greater than minus nine LUFS, this peak increase can be as high as one decibel. To prevent the reconstruction filter from clipping, platforms require a safety margin. Set a ceiling of minus one point zero decibels True Peak (dBTP) for standard files, or minus two point zero dBTP for very loud files. This margin ensures that the codec has enough headroom to build the analog wave without clipping.

## The lossy audition test

You can test how your master handles lossy compression before you release the track. This test takes ten minutes in any standard DAW.

1. Load your completed master file into a blank project.
2. Insert a true peak meter on the channel and note the highest reading.
3. Export the track as a 128 kbps MP3 file.
4. Import that MP3 back into the project on a parallel track, aligning the waveforms.
5. Invert the polarity of the MP3 track to hear the difference between the PCM file and the compressed file.
6. Look at the true peak meter on the MP3 channel during loud sections.

The meter on the MP3 track will show peaks that exceed the original PCM levels. If the peaks go over zero decibels True Peak, the file is clipping. Lower the limiter ceiling on your master by zero point five decibels and export the file again until the MP3 version stays below zero dBTP.

## The single master mistake

A common mistake is delivering a single master file for all mediums. Sending a hot digital master to a vinyl cutting house causes distortion because the physical lathe cannot cut high-velocity high frequencies. Similarly, delivering a compressed master to a high-resolution archive removes the dynamic details that future formats might preserve.

Producers also assume that normalization algorithms will compress their audio. Normalization only changes the gain of the file. It does not act like a limiter. If your master is quiet but dynamic, the platform will turn the volume up, which can cause peak clipping if the safety ceiling is missing.

## Producer takeaway

Conform to technical guidelines to ensure your masters translate correctly. Prepare distinct files for streaming and archive formats. Set a ceiling of minus one point zero decibels True Peak for standard distribution, and drop it to minus two point zero dBTP for loud masters. Inspect your export logs to verify that integrated loudness and peak headroom meet the specifications before you upload the files.

## References
- European Broadcasting Union. EBU R 128 loudness normalisation and permitted maximum level. https://tech.ebu.ch/publications/r128/
- Spotify for Artists. Loudness normalization. https://artists.spotify.com/help/article/loudness-normalization
`,
    seo: {
        title: 'Why Delivery Specs Save the Song | VGP Studio',
        description: 'How lossy codecs transcode audio files and why setting correct peak ceilings protects the track from reconstruction distortion.',
        keywords: ['master delivery', 'codec constraints', 'true peak', 'transcoding', 'audio engineering', 'reconstruction filter']
    }
};
