import { BlogArticle } from '../blog-data';

export const post013: BlogArticle = {
    slug: 'why-pre-choruses-are-pressure-cookers',
    title: 'A pre-chorus builds pressure by holding back',
    excerpt: 'A pre-chorus that is already full leaves the chorus nowhere to go. Raise the tension, thin the low end and narrow the image, then give it all back on the downbeat.',
    category: 'arrangement-groove',
    publishedAt: '2026-06-04',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'The pre-chorus should raise tension while holding back what the chorus will deliver: low end, width and density.',
        'Anticipation is part of the reward: listeners feel the payoff more strongly after a stretch of tension.',
        'A high-pass sweep to about 150 Hz, a narrower image and two beats without kick and bass make the chorus downbeat land as a jump.',
    ],
    figures: {
        tension: {
            type: 'curve',
            caption:
                'A sketch of the move. Tension climbs through the four bars of the pre-chorus while the low end and width are pulled back, and the chorus downbeat returns them all at once.',
            alt: 'Two lines from verse through four pre-chorus bars to chorus. The solid tension line rises bar by bar and eases off in the chorus. The dashed line for low end and width falls through the pre-chorus and jumps to the top at the chorus.',
            x: ['Verse', 'Pre bar 1', 'Pre bar 2', 'Pre bar 3', 'Pre bar 4', 'Chorus'],
            xShort: ['V', 'P1', 'P2', 'P3', 'P4', 'C'],
            yLabel: 'Amount',
            series: [
                { label: 'Tension', values: [0.3, 0.45, 0.6, 0.75, 0.92, 0.55] },
                { label: 'Low end and width', dashed: true, values: [0.62, 0.55, 0.45, 0.32, 0.15, 1] },
            ],
        },
        filter: {
            type: 'spectrum',
            mode: 'gain',
            db: 24,
            caption:
                'The bus filter at the end of the pre-chorus, computed for a 12 dB per octave high-pass. At 150 Hz it is 3 dB down, at 75 Hz 12 dB down and at 50 Hz 19 dB down, so the kick and bass fundamentals mostly disappear until the cutoff snaps back to 20 Hz.',
            alt: 'EQ response from 20 Hz to 20 kHz, plus and minus 24 dB. A dashed line for a 20 Hz high-pass stays flat. A solid line for a 150 Hz high-pass falls steeply below 150 Hz across the shaded kick and bass region.',
            curves: [
                { kind: 'eq', label: 'High-pass at 150 Hz', bands: [{ type: 'highpass', freq: 150, q: 0.707 }] },
                { kind: 'eq', label: 'Open at 20 Hz', dashed: true, bands: [{ type: 'highpass', freq: 20, q: 0.707 }] },
            ],
            bands: [{ from: 40, to: 120, label: 'Kick and bass' }],
        },
    },
    quiz: [
        {
            q: 'Your pre-chorus has the full drums, full bass and full width. Why does the chorus feel small?',
            options: [
                'The chorus needs a longer riser leading into it',
                'The chorus has nothing new left to bring in',
                'The pre-chorus is in another key from the chorus',
                'The chorus vocal is mixed too loud over the band',
            ],
            answer: 1,
            why: 'A chorus feels big through contrast with what came before. If the pre-chorus is already full, the downbeat brings nothing new.',
        },
        {
            q: 'A 12 dB per octave high-pass sits at 150 Hz. Roughly how much does it cut at 75 Hz, one octave below?',
            options: ['3 dB', '6 dB', '12 dB', '24 dB'],
            answer: 2,
            why: 'Well below the cutoff a 12 dB per octave filter cuts about 12 dB per octave. One octave below a 150 Hz cutoff it is about 12 dB down, enough to take the weight out of the kick and bass.',
        },
        {
            q: 'What did Salimpoor and colleagues (2011) find about anticipation?',
            options: [
                'Dopamine rose before and during the peaks',
                'Dopamine rose at the peaks but not before them',
                'Listeners liked music with long build-ups less',
                'Dopamine fell during the build-up, then spiked',
            ],
            answer: 0,
            why: 'The caudate was more active while listeners anticipated their favourite moments and the nucleus accumbens during them. The build-up is part of the reward.',
        },
    ],
    content: `## Hook: the pre-chorus that steals the show

You write a verse and a chorus that both sound great. To connect them, you build a pre-chorus: a riser, a few stacked pads, and drums that grow bar by bar. When you play the whole song, the chorus rolls in without any lift. You expected it to explode and it just arrives.

The pre-chorus is too big. It spent the transition delivering the chorus early instead of building the need for it.

## Why it matters: the chorus can only rise from where the pre-chorus left it

If the pre-chorus is already wide, heavy and full, the chorus has nowhere to go. Over those four or eight bars the listener gets used to the size of the sound, and when the downbeat lands nothing changes. A bus compressor that is already working hard in the pre-chorus holds that gain reduction into the chorus too, so the first kick of the chorus comes out barely louder than the last one before it.

The fix is to split the jobs. The pre-chorus raises tension: a climbing melody, harmony that does not resolve, a busier rhythm. At the same time it holds back what the chorus will deliver: the low end, the full stereo width and some of the density. Then the chorus downbeat gives all of it back at once.

::figure tension

## Science model: tension, anticipation and release

Huron (2006) describes musical expectation as a set of responses that run before and after an expected event. Before it, a tension response raises arousal and attention as the listener prepares for what is coming. After it, the outcome is judged against what came before, and a good outcome after a period of tension feels better than the same outcome without it. A pre-chorus that feels slightly unfinished sets up exactly that comparison.

Brain imaging ties the anticipation itself to the reward system. Salimpoor and colleagues (2011) played listeners music they had chosen because it gave them chills, and measured dopamine release. Activity rose in the caudate in the moments before the peaks the listeners were waiting for, and in the nucleus accumbens during the peaks. The build-up is part of the pleasure.

The production moves make the release physical. A high-pass filter on the instrument bus removes the weight of the kick and bass. With a 12 dB per octave slope at 150 Hz, the level is 3 dB down at the cutoff, about 12 dB down one octave below at 75 Hz and about 19 dB down at 50 Hz. When the cutoff drops back to 20 Hz on the downbeat, the whole low end returns in one moment, a change no listener can miss.

::figure filter

## DAW experiment: the pre-chorus low-end filter

1. Loop the last four bars of the pre-chorus and the first four bars of the chorus.
2. Route every instrument except the lead vocal to one bus.
3. Insert a 12 dB per octave high-pass filter on that bus and automate the cutoff from 20 Hz to 150 Hz across the last four bars of the pre-chorus.
4. On the same bus, automate the stereo width from 100% down to 70% across the same four bars.
5. Mute the kick and the bass for the last two beats of the pre-chorus.
6. On the chorus downbeat, snap the cutoff back to 20 Hz and the width back to 100%, and bring the kick and bass back in.
7. Bypass all the automation and compare the two versions of the transition.

With the automation, the chorus downbeat lands as a jump in weight and width. Without it, the chorus simply continues the pre-chorus.

## Common mistake: building up with more instruments

The most common mistake is adding instruments to the pre-chorus to make it exciting. Each one brings the pre-chorus closer to the size of the chorus, so the chorus loses the step it needed.

The second mistake is leaving the kick and bass running at full weight through the transition. When the low end never leaves, the chorus cannot bring it back, and the downbeat loses its biggest change. The opposite mistake is overdoing it: if the pre-chorus is filtered so hard that the groove disappears, it sounds like a breakdown. Keep the vocal and the rhythm driving forward while the low end thins.

## Producer takeaway: make the pre-chorus sound unfinished

A good pre-chorus feels slightly uncomfortable on purpose. Push the melody, the harmony or the rhythm forward, keep the low end thin and the image narrow, and let the chorus downbeat return everything at the same moment. The listener should want the chorus before it arrives.

## References

- Huron, D. (2006). *Sweet Anticipation: Music and the Psychology of Expectation*. MIT Press.
- Salimpoor, V. N., Benovoy, M., Larcher, K., Dagher, A., & Zatorre, R. J. (2011). Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. *Nature Neuroscience*, 14(2), 257-262.
`,
    seo: {
        title: 'A pre-chorus builds pressure by holding back',
        description: 'Raise tension in the pre-chorus while holding back low end and width, then return them on the chorus downbeat so the chorus lands as a jump.',
        keywords: ['pre-chorus', 'tension and release', 'song transitions', 'high-pass filter automation', 'arrangement energy'],
    },
};
