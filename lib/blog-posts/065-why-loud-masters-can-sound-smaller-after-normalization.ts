import { BlogArticle } from '../blog-data';

export const post065: BlogArticle = {
    slug: 'why-loud-masters-can-sound-smaller-after-normalization',
    title: 'Loud masters can shrink after matching',
    excerpt: 'Why squashing a master too hard causes it to shrink once streaming services normalise playback volume.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    readingTime: 6,
    content: `## The loud master illusion

You push your master fader limiter until the meter reads minus six integrated LUFS. In your DAW, the track sounds aggressive and loud. You assume this high level will give your track an advantage when it plays next to other songs in a streaming playlist.

When you listen to the track on Spotify or Apple Music, the opposite happens. The song sounds small and flat. The kick drum lacks weight, and the snare does not punch. A track mastered to a more dynamic level of minus eleven LUFS plays next to yours and sounds wider, deeper, and louder.

## Why dynamic range defines size

This shrinking occurs because streaming platforms normalize playback volume. When a platform normalizes two tracks to minus fourteen LUFS, it reduces the volume of the louder track. The platform turns down your minus six LUFS master by eight decibels, while it turns down the minus eleven LUFS master by only three decibels.

At this matched level, the difference in dynamic range becomes obvious. The over-limited master has flattened transient peaks, which reduces the contrast between the loudest and quietest moments. The dynamic master retains its transient spikes, allowing the drums to strike the listener with more energy.

## The math of the crest factor

The size of a master depends on its crest factor, which is the ratio between the peak level and the average level of the audio signal.

$$\\text{Crest Factor (dB)} = \\text{Peak Level (dBFS)} - \\text{RMS Level (dBFS)}$$

A master with a high crest factor has large transient peaks that stand out above the average energy. When you apply heavy limiting, you reduce the crest factor by cutting these peaks.

| Master Version | Integrated LUFS | Peak Level | Crest Factor | Playback Character |
| :--- | :--- | :--- | :--- | :--- |
| Version A (Over-limited) | -6.0 LUFS | -1.0 dBTP | 5.0 dB | Flat, squashed, narrow stereo image |
| Version B (Dynamic) | -11.0 LUFS | -1.0 dBTP | 10.0 dB | Punchy, deep, wide stereo image |

When the platform normalizes both versions to minus fourteen LUFS, Version B will sound punchier because its peaks reach higher than the peaks of Version A.

## The matched-gain dynamic test

This test shows how limiting alters the size of your mix. It takes ten minutes and requires two copies of your mix.

1. Master one copy of your track to minus six LUFS using aggressive limiting.
2. Master a second copy of your track to minus eleven LUFS using gentle transient control.
3. Import both files into a new DAW project on separate tracks.
4. Insert a gain utility plugin on the minus six LUFS track and reduce its level by five decibels to match the average loudness of the minus eleven LUFS track.
5. Listen to the transitions, focusing on the width of the stereo image and the punch of the kick drum.

The minus eleven LUFS track will sound wider and more dynamic. The transient peaks of the drums will create a sense of depth that is missing from the squashed version.

## The peak volume trap

A common mistake is assuming that volume is the only factor in a master. Producers often squash their tracks because they believe that high numbers translate to professional quality. They ignore the fact that heavy limiting pulls up quiet elements, like reverb tails and vocal breaths, which crowds the mix and reduces clarity.

Another error is failing to match levels when comparing limiter settings. The human brain naturally prefers the louder option, even if it is distorted. You must manually match levels to judge the quality of the limiter processing.

## Producer takeaway

Protect the transient contrast of your mix before chasing loudness numbers. Match the average levels of your files when comparing limiter settings to see if the processing is improving the track or making it smaller. Keep the crest factor high enough to let the drums punch through consumer speakers.

## References
- European Broadcasting Union. EBU R 128 loudness normalisation and permitted maximum level. https://tech.ebu.ch/publications/r128/
- International Telecommunication Union. ITU-R BS.1770 audio programme loudness and true-peak level. https://www.itu.int/rec/R-REC-BS.1770/
`,
    seo: {
        title: 'Loud Masters Can Shrink After Matching | VGP Studio',
        description: 'Why squashing a master too hard causes it to shrink once streaming services normalise playback volume.',
        keywords: ['loudness war', 'crest factor', 'audio normalization', 'limiting dynamics', 'music mastering', 'EBU R 128']
    }
};
