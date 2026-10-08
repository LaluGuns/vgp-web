import { BlogArticle } from '../blog-data';

export const post062: BlogArticle = {
    slug: 'the-streaming-loudness-myth-that-refuses-to-die',
    title: 'Streaming loudness myths waste masters',
    excerpt: 'One forum says master to -14 LUFS, the next says go much louder. Spotify documents how its normalization works, and the rules settle both arguments.',
    category: 'mixing-mastering',
    publishedAt: '2026-06-09',
    updatedAt: '2026-10-08',
    readingTime: 6,
    summary: [
        'On its default setting Spotify turns louder masters down to -14 LUFS with a plain gain change, so the extra level is cancelled and the density stays.',
        'Quieter masters are only raised as far as their peaks allow, so a very dynamic master with high peaks can play quieter than its neighbours.',
        'Normalization is not everywhere: the web player, some devices and listeners who switch it off hear your file at its own level.',
    ],
    figures: {
        played: {
            type: 'bars',
            caption:
                'Spotify on its Normal setting. The loud master is turned down 6 dB, to -14 LUFS. The quiet one is Spotify\'s own example, peaking at -5 dBTP, so it is raised only 4 dB, to -16 LUFS, and its peaks stop at -1 dB.',
            alt: 'Four horizontal bars on a LUFS scale with a reference line at -14. A loud master uploaded at -8 plays at -14. A quiet master uploaded at -20 plays at -16.',
            min: -22,
            max: -6,
            reference: { value: -14, label: 'Normal setting, -14 LUFS' },
            bars: [
                { label: 'Loud master, uploaded', value: -8, display: '-8', dim: true },
                { label: 'Loud master, played', value: -14, display: '-14' },
                { label: 'Quiet master, uploaded', value: -20, display: '-20', dim: true },
                { label: 'Quiet master, played', value: -16, display: '-16' },
            ],
        },
        levels: {
            type: 'scale',
            caption:
                'Spotify\'s three playback levels, with the European broadcast target for comparison. -14 LUFS is where the default setting plays music back. It is a playback choice, not a rule for your master.',
            alt: 'A number line from -24 to -8 LUFS with markers at -23 for EBU R 128 broadcast, -19 for Spotify Quiet, -14 for Spotify Normal, the default, and -11 for Spotify Loud.',
            min: -24,
            max: -8,
            unit: 'LUFS',
            ticks: [-24, -20, -16, -12, -8],
            markers: [
                { value: -23, label: 'EBU R 128' },
                { value: -19, label: 'Quiet' },
                { value: -14, label: 'Normal, default', strong: true },
                { value: -11, label: 'Loud' },
            ],
        },
    },
    quiz: [
        {
            q: 'A master measures -8 LUFS integrated. What does Spotify\'s Normal setting do to it?',
            options: [
                'Compresses it until it measures -14 LUFS',
                'Plays it unchanged, as it is already loud',
                'Limits its peaks to -2 dBTP before playback',
                'Lowers the gain of the whole track by 6 dB',
            ],
            answer: 3,
            why: 'Normalization is one gain change: -14 - (-8) = -6 dB. Every sample moves by the same amount, so peaks, punch and density stay as mastered.',
        },
        {
            q: 'A track measures -20 LUFS and peaks at -5 dBTP. How far does Spotify\'s Normal setting raise it?',
            options: ['To -16 LUFS', 'To -14 LUFS', 'To -15 LUFS', 'To -11 LUFS'],
            answer: 0,
            why: 'Spotify keeps 1 dB of headroom when it raises a track. The peaks can rise 4 dB, from -5 to -1, so the loudness rises 4 dB as well, to -16 LUFS.',
        },
        {
            q: 'Where does a Spotify listener hear your file at its own level, with no normalization?',
            options: ['When shuffling a mixed playlist', 'In the web player in a browser', 'When playing an album in order', 'On the Loud setting in the app'],
            answer: 1,
            why: 'Spotify says its web player and third-party devices such as TVs and speakers do not use normalization, and listeners can switch it off in the app.',
        },
    ],
    content: `## Hook: two rules that cannot both be right

One thread tells you to master at exactly -14 LUFS, because anything louder gets wrecked on Spotify. The next one says -14 sounds weak and real releases sit far louder. You bounce both versions, trust neither, and lose a week to a number.

Both claims start from a real feature, loudness normalization, and both get it wrong. Spotify publishes how its normalization works in detail. Once you know the rules, the decision goes back to where it belongs: how the song should sound.

## Why it matters: the myth sets your limiter

Believe the -14 rule and you may leave a dense rap or club master under-limited, chasing a level the platform would have reached for you anyway. Believe the loud rule and you crush a ballad to win a level race that normalization cancels. Either way, a rumour sets the limiter instead of your ears.

Here is what Spotify does on its Normal setting, the default. A master louder than -14 LUFS integrated is turned down until it measures -14. That is a plain volume change: it adds no distortion, no compression, and it removes none of the density you built. A master quieter than -14 is turned up, but only as far as its peaks allow, because Spotify leaves 1 dB of headroom for lossy encoding.

::figure played

::demo normalization

## Science model: one gain, set from one number

Normalization is the simplest process in the chain. The service measures integrated loudness with ITU-R BS.1770, then applies one fixed gain to the whole track:

$$G = L_{\\text{target}} - L_{\\text{measured}}$$

A -8 LUFS master on a -14 LUFS target gets $G = -14 - (-8) = -6$ dB. Every sample moves by the same 6 dB, so the distance from peaks to average, the punch, the stereo image and any distortion stay exactly as you mastered them. When $G$ would be positive, Spotify stops raising the track once its peaks are 1 dB below full scale. A -20 LUFS track that peaks at -5 dBTP can rise 4 dB, so it plays at -16 LUFS.

The details that change the outcome:

- **Listener settings.** Premium listeners choose Quiet (-19 LUFS), Normal (-14) or Loud (-11). On Loud, Spotify sets the level regardless of true peak and runs a limiter on soft, dynamic tracks. It engages at -1 dB in sample values, with a 5 ms attack and a 100 ms decay. That is the one case where your master gets extra dynamics processing.
- **Albums.** When someone plays an album, Spotify normalizes the whole album at once, so the gain does not change between tracks. In shuffle or a playlist, each track is adjusted on its own.
- **Places without it.** Spotify says the web player and third-party devices such as TVs and speakers do not use normalization, and listeners can switch it off.

::figure levels

Apple's Sound Check works on the same principle: it measures each track, stores the result as metadata and raises or lowers playback, per song or per album (Apple, 2021). Apple's guide gives no target number, so do not master to a rumoured one.

## DAW experiment: hear normalization before the platform does

1. Bounce two masters of the same song: one limited to -14 LUFS integrated with a -1 dBTP ceiling, and one pushed to -9 LUFS with a -2 dBTP ceiling, as Spotify suggests for masters louder than -14.
2. Import both into a new session on two tracks, each with a gain plugin followed by a loudness meter.
3. Set the gain plugin on the -9 LUFS track to -5 dB. Both now read -14 LUFS, as on Spotify's Normal setting.
4. Have someone switch between them through the loudest chorus, on headphones and then on a phone speaker.
5. Write down which you prefer and why, in terms of drums, vocal and density.
6. Bypass the -5 dB gain plugin and listen again, the way a listener with normalization off hears them.

If the louder master still wins at matched level, its density is doing real musical work and you can keep it. If it only wins with normalization off, the extra limiting buys level and nothing else.

## Common mistake: assuming quiet masters get turned up

A dynamic master at -18 LUFS with peaks near 0 dBTP has no room to be raised on the Normal setting, because the boost stops when the peaks reach -1 dB. It plays at -18 LUFS, quieter than the songs around it in a playlist. If you want a very dynamic master, accept that, or control the peaks so the boost has room.

The other mistake is forgetting where normalization does not happen. The web player, many TVs and speakers, and listeners who switch it off hear your file at its own level. "Master to -14 because everything ends up at -14" leaves those listeners out.

## Producer takeaway: master the song, then check the rules

Choose the level by matched-level listening. Then check it against the rules: louder than -14 LUFS means it will be turned down and should peak below -2 dBTP; quieter means it will only be raised as far as its peaks allow. Neither number grades your master. They tell you what each listener will hear, and that is all you need from them. Why heavy limiting tends to lose at matched level is covered in [loud masters can shrink after matching](/blog/why-loud-masters-can-sound-smaller-after-normalization).

## References

- Apple. (2021). *Apple Digital Masters* [Technology brief]. https://www.apple.com/apple-music/apple-digital-masters/docs/apple-digital-masters.pdf
- International Telecommunication Union. (2023). *Recommendation ITU-R BS.1770-5: Algorithms to measure audio programme loudness and true-peak audio level*. ITU. https://www.itu.int/rec/R-REC-BS.1770/
- Spotify for Artists. *Loudness normalization on Spotify*. https://support.spotify.com/artists/article/loudness-normalization/
- Spotify Support. *Volume normalization*. https://support.spotify.com/article/volume-normalization/
`,
    seo: {
        title: 'Streaming loudness myths waste masters | VGP Studio',
        description: 'How Spotify normalization really works: louder masters are turned down, quieter ones are raised only as far as their peaks allow, and some players skip it.',
        keywords: ['streaming loudness', 'loudness normalization', '-14 LUFS', 'Spotify normalization', 'mastering for streaming', 'true peak'],
    },
};
