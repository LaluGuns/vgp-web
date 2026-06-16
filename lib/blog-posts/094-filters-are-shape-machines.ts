import { BlogArticle } from '../blog-data';

export const post094: BlogArticle = {
    slug: 'filters-are-shape-machines',
    title: 'Filters are shape machines',
    excerpt: 'Aggressive high-pass filters are ruining your transient punch. Learn how filter slopes alter frequency and phase response, and why gentle cuts sound more musical.',
    category: 'audio-science',
    publishedAt: '2026-06-12',
    readingTime: 8,
    content: `## The aggressive high-pass trap

The most common advice for home recording artists is simple: clean up the low end of your mix. You are told to high-pass every track except the kick drum and the sub-bass. You load up an EQ plugin on your vocal, guitar, and synthesizer channels. You apply a steep 24 dB or 48 dB high-pass filter at 120 Hz. But instead of getting cleaner, the mix starts to sound thin and phasey. 

Your drums lose their impact, and the vocals sound disconnected. This happens because filters do more than just cut frequencies. They alter the timing of the signals passing through them, and steep curves introduce heavy timing delays.

## Why it matters in the mix

When you apply a digital filter, you change the frequency response of the signal. But in a standard minimum-phase filter, you cannot change the amplitude of a frequency without also changing its phase. 

Steep filter slopes cause phase rotation. Frequencies near the cutoff point are delayed relative to the rest of the signal. This delay smears transients, making the attack of drums or acoustic guitars lose their focus. It pushes the transient back in time, which robs the track of its punch. If you stack these delays across dozens of tracks, the entire mix becomes muddy and loose, even if the spectrum analyzer says the low end is empty.

## The physics of phase rotation

A filter operates by mixing delayed versions of the input signal back into itself. The steeper the slope, the more delays the filter must apply. A 6 dB per octave filter rotates the phase by 90 degrees at the cutoff frequency. A 12 dB per octave filter rotates it by 180 degrees, and a 24 dB per octave filter rotates it by a full 360 degrees. 

This delay is frequency-dependent. The delay is strongest right at the cutoff frequency. The time delay $\Delta t$ can be expressed in relation to the phase shift $\Delta \phi$ and frequency $f$:

$$\\Delta t = \\frac{\\Delta \\phi}{2 \\pi f}$$

For a steep filter in the low end, this can translate to a delay of several milliseconds for the sub-bass frequencies. This delay separates the fundamental transient from its higher harmonics, making the low end sound soft.

## DAW experiment: transient smear comparison

You can hear this transient smear by testing a steep filter on a transient-heavy sound source.

1. Load a punchy kick drum sample onto a track in your DAW.
2. Duplicate the track. On the second track, insert a parametric EQ.
3. Set a high-pass filter on the second track at 35 Hz with a steep 24 dB or 48 dB slope.
4. Level match the two tracks using a peak meter.
5. Toggle between the clean kick and the filtered kick. Listen closely to the sub-bass transient punch. The filtered kick will sound softer, with a slight "whoosh" sound at the start of the note instead of a solid knock.

## The linear-phase misconception

Producers often switch to linear-phase EQs to avoid phase shift. A linear-phase filter shifts the phase of all frequencies equally, which prevents phase smear. But this comes with a physical trade-off. 

Linear-phase filters introduce pre-ringing. They generate a quiet, backwards echo before the transient occurs. On drums, this pre-ringing sounds like a soft suction sound right before the hit, which ruins the transient punch. 

Another error is filtering out frequencies that are not causing problems. If a vocal has low-end information at 80 Hz, it might be the resonance that makes the voice sound natural. Cutting it off by default makes the singer sound like they are recording in a phone booth.

## Producer takeaway

Choose gentle filter shapes. Use a 6 dB or 12 dB slope high-pass filter for general cleanup. This gradual roll-off keeps phase rotation minimal, preserving transient timing and keeping the mix tight. Reserve steep 24 dB or 48 dB cuts for surgical isolation, such as removing physical room rumble or air conditioning hum. If you must use a high-pass filter on a kick or bass, check the alignment of the transient in mono to ensure the sub-bass has not been delayed.

## References
- Smith, J.O. Spectral Audio Signal Processing. CCRMA, Stanford. https://ccrma.stanford.edu/~jos/sasp/ (accessed 2026).
- Smith, J.O. Introduction to Digital Filters with Audio Applications. CCRMA, Stanford. https://ccrma.stanford.edu/~jos/filters/ (accessed 2026).
- Signals and Systems. MIT OpenCourseWare. https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/ (accessed 2026).
- Vibrations and Waves. MIT OpenCourseWare. https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/ (accessed 2026).`,
    seo: {
        title: 'Filters are shape machines | VGP Studio',
        description: 'Understand how filter slopes introduce phase rotation and transient smear. Learn how to use gentle cuts to keep your low end punchy.',
        keywords: ['audio filters', 'phase rotation', 'high-pass filter', 'transient smear', 'linear-phase EQ', 'pre-ringing']
    }
};
