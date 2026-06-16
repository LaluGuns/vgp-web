import { BlogArticle } from '../blog-data';

export const post036: BlogArticle = {
    slug: 'the-physics-of-bass-on-small-speakers',
    title: 'Small speakers need bass clues',
    excerpt: 'How upper harmonics trick the brain into hearing low fundamental bass on mobile devices. Design bass for translation outside the room.',
    category: 'sound-design',
    publishedAt: '2026-06-06',
    readingTime: 8,
    seo: {
        title: 'Small Speakers Need Bass Clues | VGP Studio',
        description: 'Learn how to make your sub-bass translate to small speakers like mobile phones using the missing fundamental psychoacoustic effect.',
        keywords: ['bass translation', 'missing fundamental', 'sub bass mixing', 'audio science', 'mobile speaker mixing', 'psychoacoustics']
    },
    content: `## The disappearing bass line

You spent all night mixing your track. In your treated studio room, the sub-bass sounds massive. The 808 shakes your chair. The kick hits you in the chest. You export the mix and play it on your phone. Suddenly, the bass is gone. The song sounds thin and hollow. The melody of the bass line has completely disappeared, leaving only the clicking sound of the hi-hats and the dry vocal.

This happens because mobile phones and small Bluetooth speakers cannot physically reproduce low frequencies. Their speakers are too small to move the air required for waves below 100 Hz. If your bass sound relies entirely on its sub fundamental, it will disappear on these devices. To make your bass translate, you must give the listener's brain the clues it needs to reconstruct the low end.

## Why translation is what survives

A mix must sound good on all systems, not just in your studio. Since most listeners listen on mobile devices or cheap earbuds, your low end must communicate its pitch and rhythm on these systems.

If you just turn up the volume of the sub-bass to make it audible on a phone, you will clip your master channel. When the track is played on a club system, the bass will overwhelm the mix and muddy the mid-range. Instead of boosting the fundamental, you must generate upper harmonics. These overtones sit in the mid-range where small speakers can play them.

## The science of the missing fundamental

The human brain does not need to hear a fundamental frequency to perceive its pitch. If the ear receives a series of harmonic overtones, the brain automatically calculates the spacing between them and reconstructs the pitch of the missing fundamental. This is a psychoacoustic phenomenon called the missing fundamental effect.

Mathematically, the relationship between a fundamental frequency f_0 and its harmonic series is:

\`f_n = n * f_0\`

Where n is an integer. If the speaker only plays 200 Hz, 300 Hz, 400 Hz, and 500 Hz, the brain notices the constant difference of 100 Hz. It then recreates the perception of a 100 Hz tone, even though that frequency is physically absent from the room.

By generating harmonics in the 100 Hz to 300 Hz range, you ensure that the brain can track the bass line on any playback device.

## The laptop bass translation test

This test will help you design a bass sound that survives on small speakers.

1. Program a simple bass line using a clean sub-bass synthesizer patch. Keep the notes below 60 Hz.
2. Export the track and listen to it on your phone or laptop speakers. The bass line will likely be silent.
3. Open your DAW and insert a saturation plugin on the sub-bass track. Use a tape or transistor driver.
4. Drive the plugin until you generate harmonics in the 100 Hz to 300 Hz range. You can monitor this using a spectrum analyzer.
5. Level-match the track so the peak volume remains the same as the clean version.
6. Now listen to the saturated bass line on your laptop speakers. You will hear the pitch and melody of the notes clearly.
7. Switch back to your studio monitors. The bass will sound thicker and more focused, without clipping the master bus.

## The mistake of the sub-bass boost

Producers often try to fix a quiet bass by boosting 40 Hz with a low-end EQ. This is a mistake.

Boosting the sub fundamental does not make the bass audible on small speakers. It just wastes your dynamic headroom. The phone speaker still cannot play the frequency, and the master fader gets pushed closer to clipping. Save your headroom and use harmonics instead of EQ boosts.

## Add harmonics to your bass

Add upper harmonics to your low end to ensure it translates outside the studio.

Use a wavefolder or a saturation plugin to generate overtones. Keep the low-end clean in mono, but drive the mid-range of the bass track to create the clues the brain needs.

## References

* Smith, J. O. (2026). Spectral Audio Signal Processing. CCRMA, Stanford University.
* Smith, J. O. (2026). Introduction to Digital Filters with Audio Applications. CCRMA, Stanford University.`
};
