import { BlogArticle } from '../blog-data';

export const post063: BlogArticle = {
    slug: 'why-true-peak-matters-after-encoding',
    title: 'True peak bites after encoding',
    excerpt: 'How true peak ceiling prevents codec distortion, and why leaving headroom is essential before converting files to lossy formats.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    readingTime: 6,
    content: `## The hidden distortion

You bounce your master and check the sample peak meter. It reads minus zero point one decibels, which appears safe. The audio sounds clean in your studio monitors. You upload the file to a distributor, and they convert it to lossy formats for streaming.

When you play the track on a streaming app, you notice a raspy quality in the high end. The hi-hats sound fuzzy, and the vocal transients have a digital crackle. The clean master you bounce in your DAW now sounds distorted on consumer devices, despite passing your initial studio listening test.

## Why inter-sample peaks matter

This distortion occurs because traditional digital peak meters only measure the level of individual samples. They do not measure the continuous waveform that is reconstructed when the digital file is converted back to analog. The peak of the analog wave often falls between the sample points, creating inter-sample peaks.

Lossy encoding formats like MP3, AAC, and Ogg Vorbis reconstruct these waves during decoding. If your digital samples sit at minus zero point one decibels, the reconstructed wave can overshoot by one to two decibels. This overshoot causes the player's decoder to clip, introducing harmonic distortion that ruins the clarity of your high frequencies.

## Inter-sample peak estimation

A true peak meter uses oversampling to estimate the height of the reconstructed wave. By interpolating values between the actual samples, the meter reveals the true peak level in decibels true peak.

$$\\text{Oversampling Interpolation: } x[n] \\rightarrow x[m] \\text{ where } m = L \\times n$$

The interpolation filter calculates values at higher resolutions (typically four times or eight times oversampling) to detect peaks that fall between original samples.

| Meter Type | Sample Peak Value | True Peak Value | Reconstructed Status |
| :--- | :--- | :--- | :--- |
| Standard Peak | -0.1 dBFS | +0.8 dBTP | Clips during decoding |
| True Peak | -1.0 dBFS | -1.0 dBTP | Decodes cleanly |
| Over-limited | -0.1 dBFS | +1.5 dBTP | Heavy clipping on mobile devices |

If the meter shows a positive value in decibels true peak, the file contains inter-sample peaks that will clip during lossy encoding.

## The codec preview experiment

This test demonstrates how lossy conversion changes your peak levels. You will need a limiter with a true peak limiting function.

1. Load your limited master into your DAW.
2. Set the limiter ceiling to minus zero point one decibels and disable true peak limiting.
3. Export the file as a wave file, and export another version as a one hundred and twenty-eight kilobits per second MP3.
4. Import both files back into your DAW on separate tracks.
5. Insert a true peak meter on both channels and look at the peak readings.

The MP3 version will show higher peak levels than the wave file, often exceeding zero decibels true peak. This indicates that the lossy encoder has created clipping. Set your limiter ceiling to minus one point zero decibels true peak, repeat the test, and verify that the MP3 version decodes without clipping.

## The zero ceiling mistake

Producers often set their limiter ceiling to zero decibels to maximize volume. This practice leaves no headroom for the conversion process. When streaming services encode the file, the peaks exceed the threshold and cause distortion.

Another error is trusting standard peak meters. These meters only check the values of the digital samples. They do not account for the filtering that occurs during digital-to-analog conversion or lossy compression.

## Producer takeaway

Set your limiter output ceiling to minus one point zero decibels true peak when mastering for streaming platforms. This headroom allows the lossy encoders to convert your audio without creating inter-sample distortion. Trust the true peak meter over standard sample meters to protect the high-end clarity of your mix.

## References
- International Telecommunication Union. ITU-R BS.1770 audio programme loudness and true-peak level. https://www.itu.int/rec/R-REC-BS.1770/
- Spotify for Artists. Loudness normalization. https://artists.spotify.com/help/article/loudness-normalization
`,
    seo: {
        title: 'True Peak Bites After Encoding | VGP Studio',
        description: 'How true peak ceiling prevents codec distortion, and why leaving headroom is essential before converting files to lossy formats.',
        keywords: ['true peak', 'inter-sample peaks', 'codec distortion', 'audio engineering', 'mastering tutorial', 'ITU-R BS.1770']
    }
};
