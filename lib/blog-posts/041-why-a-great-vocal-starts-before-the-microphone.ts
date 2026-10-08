import { BlogArticle } from '../blog-data';

export const post041: BlogArticle = {
    slug: 'why-a-great-vocal-starts-before-the-microphone',
    title: 'Why a great vocal starts before the microphone',
    excerpt: 'A strained vocal is usually recorded that way. Too much backing in the headphones makes a singer push, and no EQ can undo how a pushed voice sounds.',
    category: 'vocal-production',
    publishedAt: '2026-06-07',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'When singers cannot hear themselves, they push without meaning to. A pushed voice is louder, brighter and harder to tune all at once.',
        'That change runs through the whole harmonic series, so a cut at one frequency in the mix makes the vocal duller without making it relaxed.',
        'Turn the backing down in the cue before you touch the vocal chain, and compare the takes at matched level.',
    ],
    figures: {
        tilt: {
            type: 'spectrum',
            mode: 'level',
            range: [80, 10000],
            caption:
                'The same note sung relaxed and pushed, drawn as a shape and lined up at the bottom of the range. Pushing keeps more energy in the upper harmonics, so the voice gets brighter as it gets louder, most audibly where the ear is most sensitive.',
            alt: 'Two falling lines of energy against frequency from 80 Hz to 10 kHz. The pushed line falls less steeply than the relaxed line, so it sits higher at high frequencies. A shaded band marks 2 to 4 kHz.',
            curves: [
                { kind: 'slope', dbPerOct: -3.6, level: 0.92, label: 'Relaxed', muted: true },
                { kind: 'slope', dbPerOct: -2, level: 0.92, label: 'Pushed' },
            ],
            bands: [{ from: 2000, to: 4000, label: 'Ear most sensitive' }],
        },
        loop: {
            type: 'flow',
            caption:
                'The loop a loud cue starts. The backing masks the voice, the singer pushes and asks for more, and if the whole cue goes up the backing still masks the voice, only louder.',
            alt: 'Three steps in a loop: the backing is too loud in the cue, the singer pushes harder, the singer asks for more level. An arrow labelled "whole cue goes up" leads back to the first step.',
            steps: [{ label: 'Backing too loud in the cue' }, { label: 'Singer pushes harder' }, { label: 'Singer asks for more level' }],
            loop: { to: 0, label: 'Whole cue goes up' },
        },
    },
    quiz: [
        {
            q: 'Why does a cut around 3 kHz rarely fix a vocal that was sung pushed?',
            options: [
                'The strain sits above 5 kHz, so a cut at 3 kHz is in the wrong place',
                'A cut at 3 kHz also lowers the fundamental, so the voice gets thinner',
                'Pushing lifts every upper harmonic, so one cut just dulls the voice',
                'The harshness is cue bleed in the mic, and EQ cannot pull it apart',
            ],
            answer: 2,
            why: 'Effort changes how the vocal folds close, which strengthens every upper harmonic. One cut removes a slice of that, and the voice still sounds strained.',
        },
        {
            q: 'A singer asks for "more me" in the headphones. What is the better first move?',
            options: [
                'Turn the backing down in the cue mix',
                'Turn up the master headphone volume',
                'Put a heavy compressor on the cue vocal',
                'Add a large reverb to the cue vocal',
            ],
            answer: 0,
            why: 'Lowering the backing raises the voice relative to the track without making the headphones louder, so there is less bleed and less reason to push.',
        },
        {
            q: 'In the two-take experiment, why level-match before comparing?',
            options: [
                'Plugins react to level, so the chain hears the takes differently',
                'Clip gain lowers the bleed, so the pauses can be compared fairly',
                'Matching the level also lines up the pitch of the held notes',
                'The pushed take is louder, and louder sounds better at first',
            ],
            answer: 3,
            why: 'A level difference biases the comparison. At matched level you hear the difference in tone and pitch that the cue change made.',
        },
    ],
    content: `## Hook: the harshness you cannot EQ out

You spend an hour on a lead vocal that sounds thin and hard. You dip 3 kHz, try a tube compressor, add a saturator. Each move trades one problem for another, and the vocal still sounds like the singer was fighting the track.

That fight happened during the take. When singers cannot hear themselves over the backing in their headphones, they push. A pushed voice differs from a relaxed one in level, tone, pitch and phrasing, and plugins only ever work on the result.

## Why it matters: effort changes the whole sound

Effort is not a volume knob the singer turns. To sing louder, the vocal folds close faster and more firmly on every cycle. That strengthens the upper harmonics relative to the fundamental, so a louder voice is also a brighter one, and many singers tighten the throat to get there, which listeners hear as strain.

The brightness lands across the whole spectrum, including the region from about 2 to 4 kHz where the ear is most sensitive. So when you cut 3 kHz in the mix, you remove one slice of the change and the vocal turns dull without sounding relaxed. Compressing it forward has its own cost: a loud cue leaks out of the headphones into the microphone, and every decibel of compression on the vocal also brings up that bleed in the gaps.

::figure tilt

## Science model: the Lombard effect

In 1911 the French doctor Étienne Lombard described how people raise their voices when noise stops them hearing themselves. The Lombard effect has been found in many species since and is largely automatic (Brumm and Zollinger, 2011). Speech produced in noise is louder, longer and higher in pitch, and its vowel spectra shift as well (Summers and colleagues, 1988).

Singers do the same. In a study where singers performed along with a choir played over headphones, they got louder as the choir got louder, and they held back only partly when told to resist it (Tonkinson, 1994). For a singer in a booth, a loud backing track in the cue does the same job as the noise in those studies: it masks their own voice.

Hearing less of yourself costs accuracy too. When singers' hearing of their own voice was masked with noise, their intonation got worse, and they had to rely on the feel of the throat and breath, which is less precise (Mürbe and colleagues, 2002).

A rule of thumb follows, in words rather than a formula: the louder the backing is relative to the singer's own voice in the cue, the harder they push and the less accurately they tune. The fix sits in the cue mix, which you control.

::figure loop

## DAW experiment: two takes, one cue change

Try this at the start of your next vocal session. Keep the singer's headphone volume knob where it is for both takes.

1. Build a dedicated cue: a bus fed by pre-fader sends from each track, routed to the headphone output. Do not feed the singer the main mix.
2. Send the backing to the cue at the level the singer usually asks for, and send the vocal mic pre-fader so its cue level does not follow the mix fader.
3. Record a verse and a chorus.
4. Lower the backing send by 6 dB and leave the vocal send where it was. The voice is now 6 dB louder relative to the track in the singer's ears.
5. Record the same verse and chorus again.
6. Level-match the two takes with clip gain, using a loudness meter, and compare them raw with every plugin bypassed.

The second take usually needs less EQ: less edge in the upper mids, steadier held notes and less backing audible in the pauses. Level-matching matters because the pushed take is louder, and louder tends to sound better at first.

## Common mistake: solving comfort with plugins

When a singer says they cannot hear themselves, the quick answer is to put a heavy compressor on the cue vocal or to turn up the headphone amp. A heavy compressor flattens their dynamics in their own ears, so they lose the sense of how hard they are singing and either push or hold back. A few decibels of gentle compression is fine. Turning up the headphone amp makes everything louder, the backing included, which brings back the masking along with more bleed and faster ear fatigue.

## Producer takeaway: set the cue before the chain

Before you open the vocal chain, set the cue. Bring the backing down until the singer can hear their own voice clearly, keep the vocal dry or close to it, and keep the headphone level as low as feels good. Solo the mic in a pause to check for bleed. A relaxed singer gives you a take that needs less EQ, less compression and less tuning. How to build the cue itself, reverb and latency included, is covered in [Headphone balance changes the take](/blog/how-headphone-balance-changes-performance).

## References

- Brumm, H., & Zollinger, S. A. (2011). The evolution of the Lombard effect: 100 years of psychoacoustic research. *Behaviour*, 148(11-13), 1173-1198.
- Mürbe, D., Pabst, F., Hofmann, G., & Sundberg, J. (2002). Significance of auditory and kinesthetic feedback to singers' pitch control. *Journal of Voice*, 16(1), 44-51.
- Summers, W. V., Pisoni, D. B., Bernacki, R. H., Pedlow, R. I., & Stokes, M. A. (1988). Effects of noise on speech production: Acoustic and perceptual analyses. *Journal of the Acoustical Society of America*, 84(3), 917-928.
- Tonkinson, S. (1994). The Lombard effect in choral singing. *Journal of Voice*, 8(1), 24-29.
`,
    seo: {
        title: 'Why a Great Vocal Starts Before the Microphone | VGP',
        description: 'A loud headphone cue makes singers push. Learn how the Lombard effect changes tone and pitch, and why setting the cue mix beats corrective EQ.',
        keywords: ['vocal recording', 'headphone cue mix', 'Lombard effect', 'vocal tracking', 'singing pitch', 'headphone bleed'],
    },
};
