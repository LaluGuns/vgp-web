import { BlogArticle } from '../blog-data';

// Level envelope of one sung phrase, shared by both rows.
const VOICE = {
    kind: 'envelope' as const,
    label: 'Voice',
    points: [
        [0, 0],
        [0.03, 0.85],
        [0.14, 0.62],
        [0.2, 0.78],
        [0.34, 0.55],
        [0.42, 0.7],
        [0.5, 0.05],
        [0.52, 0],
        [1, 0],
    ] as [number, number][],
};

export const post073: BlogArticle = {
    slug: 'why-sad-music-can-feel-good',
    title: 'Sad music feels good when it feels safe',
    excerpt: 'Listeners enjoy sad songs when the sadness is beautiful and carries no real threat. What the research shows, and how vocal distance changes how a sad song lands.',
    category: 'music-psychology',
    publishedAt: '2026-06-10',
    updatedAt: '2026-10-08',
    readingTime: 7,
    summary: [
        'Listeners usually hear more sadness in a sad song than they feel, and what they feel is often mixed: tender, nostalgic, even pleasant.',
        'The pleasure seems to come from beauty, empathy and sadness with no real loss attached. The popular prolactin explanation was a hypothesis, and its author has since rejected it.',
        'More reverb pushes a singer further away. For a sad lyric, try a short, quiet reverb before reaching for a hall.',
    ],
    figures: {
        path: {
            type: 'flow',
            caption:
                'One way to read the research on enjoying sad music. The listener recognizes sadness, nothing real is lost, and the feeling that results is often mixed rather than purely sad.',
            alt: 'Five steps: the music has sad cues, the listener recognizes sadness, nothing real is at stake, beauty and empathy come in, and the listener feels something mixed.',
            steps: [
                { label: 'Sad cues', note: 'Slow, low, soft, minor, dark timbre' },
                { label: 'Sadness recognized', note: 'This sounds sad' },
                { label: 'Nothing at stake', focus: true, note: 'No real loss or threat' },
                { label: 'Beauty and empathy', note: 'Being moved, compassion' },
                { label: 'Mixed feeling', note: 'Sad and pleasant at once' },
            ],
        },
        distance: {
            type: 'signal',
            caption:
                'The same sung phrase with two reverb settings. With a short plate low in the mix, the direct voice dominates and the singer sounds close. With a long, loud hall, the reverb carries nearly as much energy as the voice, which the ear reads as distance.',
            alt: 'Two level plots of one phrase. In both, the solid voice envelope rises and falls over the first half. In the top plot a dashed reverb envelope stays low and dies soon after the phrase. In the bottom plot the dashed reverb rises almost to the voice level and fades slowly to the end.',
            rows: [
                {
                    label: 'Short plate, low send',
                    unipolar: true,
                    traces: [
                        VOICE,
                        {
                            kind: 'envelope',
                            label: 'Reverb',
                            dashed: true,
                            points: [
                                [0.03, 0],
                                [0.1, 0.12],
                                [0.5, 0.1],
                                [0.64, 0],
                                [1, 0],
                            ],
                        },
                    ],
                },
                {
                    label: 'Long hall, high send',
                    unipolar: true,
                    traces: [
                        VOICE,
                        {
                            kind: 'envelope',
                            label: 'Reverb',
                            dashed: true,
                            points: [
                                [0.03, 0],
                                [0.18, 0.45],
                                [0.5, 0.52],
                                [0.75, 0.25],
                                [1, 0.04],
                            ],
                        },
                    ],
                },
            ],
        },
    },
    quiz: [
        {
            q: 'A test listener says your ballad sounds tragic, then says that listening to it felt tender and even pleasant. What should you take from that?',
            options: [
                'The song failed, so slow it down and make the reverb wetter',
                'The listener missed the point, so make the sad cues clearer',
                'Nothing is wrong: heard and felt emotion often differ like this',
                'The mix is too quiet, so the sadness never reached them',
            ],
            answer: 2,
            why: 'Kawakami and colleagues found that listeners heard sad pieces as tragic while feeling less tragic and more romantic themselves. That gap is common, and stacking more sad cues tends to make a song sound like a performance of sadness rather than move the listener more.',
        },
        {
            q: 'Your singer wants the ballad as sad as it can be, because sadness releases prolactin and that is why sad songs feel good. What does the evidence say about that reasoning?',
            options: [
                'It holds: prolactin release was confirmed in listening studies',
                'It rests on a hypothesis that its own author has since rejected',
                'It holds in minor keys, where the prolactin effect was measured',
                'It holds, and brain imaging is the main evidence behind it',
            ],
            answer: 1,
            why: 'Huron proposed prolactin in 2011 as a possible explanation, a 2018 review rated the biological evidence as weak to non-existent, and Huron later called the theory wrong himself. The better-supported accounts point to beauty, empathy and sadness with nothing real at stake.',
        },
        {
            q: 'Why does a long, loud hall reverb make a singer sound further away?',
            options: [
                'The ear judges distance from the balance of reverb to direct sound',
                'Reverb smears the voice\'s pitch, which the ear reads as distance',
                'The hall\'s stereo spread pulls the voice wide and away from the centre',
                'A long tail delays the voice, and the ear hears the delay as distance',
            ],
            answer: 0,
            why: 'The direct-to-reverberant ratio is one of the main distance cues. The more the reverb weighs against the direct voice, the further away the source seems.',
        },
    ],
    content: `## Hook: the cathedral on the ballad

You write a slow song in a minor key and record a vocal that means something to you. To make it feel sadder, you put a long cathedral reverb on the voice and push the send until the tail fills every gap. Played back, the singer sounds far away. The song tips into melodrama, and the listener watches it rather than feeling it.

People listen to sad songs on purpose, again and again, and many say they enjoy them. That pleasure seems to depend on the sadness feeling safe and beautiful. A production choice that pushes the singer into the distance can work against both.

## Why it matters: hearing sadness is not feeling it

A listener can recognize that a song is sad without feeling sad. Kawakami and colleagues (2013) asked listeners to rate sad pieces twice: once for the emotion the music expressed and once for what they felt. The music sounded tragic, but listeners reported feeling less tragic than that, and more romantic and light-hearted. The same song held two different emotions at once.

That matters for production. A sad song should make sadness feel close enough to care about and beautiful enough to stay with, and the listener can still come away feeling lighter than the music sounds.

## Science model: why sadness in music can be pleasant

Sachs, Damasio and Habibi (2015) reviewed the research and concluded that sad music tends to be enjoyed when the sadness it evokes is not felt as a threat, when the music is heard as beautiful, and when it gives the listener something back: comfort, a way to manage mood, a sense of empathy or a memory. Vuoskoski and colleagues (2012) found that sad excerpts evoked sadness alongside nostalgia, peacefulness and wonder, and that listeners high in empathy and openness liked them more. Huron and Vuoskoski (2020) suggest that for many listeners the pleasant part is compassion, a warm feeling toward the imagined sufferer.

::figure path

You may have read that the hormone prolactin explains all this. That idea comes from a paper by Huron (2011), who proposed that prolactin, which rises during sadness and may have a consoling effect, could make music-induced sadness pleasant for some listeners. It was a hypothesis, not a finding. A later review rated the biological evidence for this kind of account as weak to non-existent, and the psychological evidence as moderate (Eerola et al., 2018). Huron has since published a short note titled "The prolactin theory of sad-music enjoyment is wrong" (Huron, 2023).

Distance is where production comes in. The ear judges how far away a source is partly from the balance between the direct sound and the reverberation (Zahorik, Brungart and Bronkhorst, 2005). The more reverb relative to direct sound, the further away the singer seems. Whether a closer voice makes a listener more empathetic has not been tested in the same way, so treat that part as craft rather than science.

::figure distance

::demo reverb

## DAW experiment: bring the singer closer

Pick a slow song with a lead vocal and allow about ten minutes.

1. On the lead vocal, bypass the long hall or cathedral reverb and note its send level.
2. Create a new send to a plate reverb. Set the decay to 1.0 second and the pre-delay to 25 ms.
3. On the plate return, add a high-pass filter at 200 Hz and a low-pass filter at 5 kHz.
4. Start the send at -18 dB and raise it until you can just hear the tail in the gaps between lines, then stop.
5. Render 30 seconds of the chorus with each reverb and match their loudness by ear or with a loudness meter, so the hall version is not simply louder.
6. Play both versions to someone who has not heard the song. Ask which singer sounds like they are singing to them, and which version they would play again.

The plate version should sound closer, with breaths and consonants audible. The hall version sounds bigger and further away. Neither is right for every song. Choose the one that fits the lyric.

## Common mistake: stacking every sad signal

The most common mistake is pushing every sad cue to the maximum at once: very slow, very dark, very wet, every note sung at full intensity. Each cue tells the listener the song is sad, and together they can sound like a performance of sadness. Listeners recognize it and feel less. Leave some cues neutral and let one or two carry the mood.

The second mistake is using a big reverb to hide a weak take. If a note is out of tune, tune it or sing it again. A long tail does not fix the performance, and it moves the singer away from the listener.

## Producer takeaway: make sadness close and beautiful

Treat a sad song as an invitation, not a weight. Keep the lead voice near enough that the listener can hear it breathe, and let the arrangement stay warm rather than harsh. Use space to support the mood, not to stand in for it. Keep the closer vocal if the lyric starts to sound like it is addressed to the listener. If the song loses its scale, add reverb back one step at a time.

## References

- Eerola, T., Vuoskoski, J. K., Peltola, H.-R., Putkinen, V., & Schäfer, K. (2018). An integrative review of the enjoyment of sadness associated with music. *Physics of Life Reviews*, 25, 100-121.
- Huron, D. (2011). Why is sad music pleasurable? A possible role for prolactin. *Musicae Scientiae*, 15(2), 146-158.
- Huron, D. (2023). The prolactin theory of sad-music enjoyment is wrong. *Empirical Musicology Review*, 17(1), 69-70.
- Huron, D., & Vuoskoski, J. K. (2020). On the enjoyment of sad music: Pleasurable compassion theory and the role of trait empathy. *Frontiers in Psychology*, 11, 1060.
- Kawakami, A., Furukawa, K., Katahira, K., & Okanoya, K. (2013). Sad music induces pleasant emotion. *Frontiers in Psychology*, 4, 311.
- Sachs, M. E., Damasio, A., & Habibi, A. (2015). The pleasures of sad music: A systematic review. *Frontiers in Human Neuroscience*, 9, 404.
- Vuoskoski, J. K., Thompson, W. F., McIlwain, D., & Eerola, T. (2012). Who enjoys listening to sad music and why? *Music Perception*, 29(3), 311-317.
- Zahorik, P., Brungart, D. S., & Bronkhorst, A. W. (2005). Auditory distance perception in humans: A summary of past and present research. *Acta Acustica united with Acustica*, 91(3), 409-420.
`,
    seo: {
        title: 'Why sad music can feel good | VGP Studio',
        description: 'Why listeners enjoy sad songs, what the research does and does not support, and how reverb and vocal distance change the way a sad song lands.',
        keywords: ['sad music psychology', 'perceived and felt emotion', 'vocal intimacy', 'reverb distance', 'music emotion', 'music psychology'],
    },
};
