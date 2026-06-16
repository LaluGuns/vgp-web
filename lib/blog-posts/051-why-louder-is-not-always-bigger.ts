import { BlogArticle } from '../blog-data';

export const post051: BlogArticle = {
    slug: 'why-louder-is-not-always-bigger',
    title: 'Why louder is not always bigger in a mix',
    excerpt: 'Confusing volume with quality leads to squashed, fatigue-inducing mixes. This guide details the psychoacoustics of loudness bias and shows you how to use level-matching to make honest mixing choices.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-08',
    readingTime: 6,
    content: `## The trap of the volume bump

You load a compressor on a lead vocal, crank the output, and think the performance is suddenly warmer and more intimate. It happens on drums, synth pads, and master buses. Every time you insert a new processor and it adds a decibel of gain, your brain registers an instant upgrade. This is the oldest trick in the audio book. Your ears are lying to you. They are mistaking volume for quality.

When a plugin makes a track louder, it sounds better for about five seconds. Then the illusion fades. You keep mixing, adding more plugins, boosting more gains, and eventually your master fader is clipping. You look at your meter, and you have zero headroom left. Yet, the mix sounds flat, small, and congested. By chasing the volume bump in solo, you have slowly destroyed the dynamic range of the session. The mix is not actually bigger, it is just louder and more fatiguing.

## Why loudness bias ruins your master

Loudness bias is a biological reality. The human auditory system does not perceive frequencies equally across different volume levels. This behavior is mapped by the equal loudness contours, which show that our ears are far less sensitive to low and high frequencies at low volumes. When you turn a sound up, the bass and treble feel more present. The mix feels fuller simply because you changed the level, not because your compression or equalization settings actually improved the tone.

When you do not match the input and output levels of your processors, you cannot make an honest judgment. You will keep a plugin setting simply because it is louder, even if the processing introduced harsh mid-range resonance or killed the natural punch of the transients. In a full multitrack session, these small volume increases accumulate. Your headroom disappears, forcing you to pull down your master fader or squash the stereo bus with a limiter, resulting in a narrow and lifeless final product.

## The mathematics of perceived level

The relationship between physical sound pressure level, measured in decibels, and perceived loudness is logarithmic. A general rule of thumb is that a change of 10 decibels is perceived as a doubling of loudness.

$$\\text{Loudness change} = 2^{\\frac{\\Delta L}{10}}$$

Where $\\Delta L$ is the change in sound pressure level in decibels. This means even a tiny increase of 0.5 decibels is enough to trigger a positive bias in your brain, making you believe the processed sound is superior. To bypass this bias, you must reduce the output gain of your plugin to match the input level within a fraction of a decibel.

## A five minute gain matching experiment

To calibrate your ears against loudness bias, set up this quick level-matching test in your workstation.

1. Select a raw drum loop or a vocal track in your session and insert a compressor.
2. Set the compressor with a fast attack and a high ratio to squash the peaks by about 4 to 6 decibels.
3. Use the makeup gain or output control on the compressor plugin to level-match the processed signal with the raw signal. Use a loudness meter to verify that the integrated loudness matches within 0.2 LUFS.
4. Set up a quick key command to bypass the plugin, then close your eyes and click it repeatedly until you lose track of whether the plugin is active or bypassed.
5. Listen closely to the transient impact of the snare drum or the clarity of the vocal consonants. Decide which state sounds more open and dynamic.

If the raw track actually sounds better when volume is matched, your compression settings are destroying the mix. Adjust the threshold or ratio until the processed version provides control without losing the size of the original sound.

## The solo fader misconception

The most common error is adjusting your processors while listening to the track in solo. A kick drum might sound huge and deep when soloed and boosted, but once you bring back the bass, guitars, and vocals, that low-end boost turns into mud. You end up turning the fader down anyway, meaning you wasted headroom and introduced phase distortion for a sound that does not fit the collective picture.

Another issue is monitoring too loudly. If you mix at high volumes, your ears flatten their frequency response, making everything sound balanced. When the listener plays your song at a conversational level, the bass and highs will seem to drop off completely, leaving a thin and mid-heavy mix.

## Dynamic balance is the real scale

Real mix size is an illusion created by the contrast between quiet and loud elements, not by pushing everything to the ceiling. If you want a chorus to feel massive, the verse before it must be quieter and narrower. Level-matching every plugin ensures that you only keep processing that improves the tone, controls the dynamics, or fits the element into the arrangement.

Calibrate your monitoring level to a consistent conversational volume, around 70 to 75 decibels. This prevents ear fatigue and keeps your frequency perception stable. Make it a habit to check your faders at this low level to confirm that the lead vocal and snare remain the clear focus of the mix.

## References

* Bregman, A. S. (1990). *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press.
* Ronan, M., Ma, Z., Mc Namara, D., Gunes, H., & Reiss, J. D. (2018). *Automatic Minimisation of Masking in Multitrack Audio using Subgroups*. arXiv preprint arXiv:1803.09960.
* Senior, M. (2011). *Mixing Secrets for the Small Studio*. Routledge.
`,
    seo: {
        title: 'Why Louder is Not Always Bigger in a Mix | VGP Studio',
        description: 'Confusing volume with quality leads to squashed, fatigue-inducing mixes. Learn the psychoacoustics of loudness bias and how to level-match plugins.',
        keywords: ['loudness vs size', 'loudness bias', 'mixing psychology', 'gain matching', 'equal loudness contour', 'Fletcher Munson']
    }
};
