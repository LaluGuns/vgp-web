import { BlogArticle } from '../blog-data';

export const post111: BlogArticle = {
    slug: 'commercial-use-vs-personal-use',
    title: 'Commercial use vs personal use: when you need a beat license',
    excerpt: 'If money or promotion is involved, it is commercial use. Where the line falls for streaming, video, shows, social posts, client work and background music.',
    category: 'licensing-guide',
    publishedAt: '2026-01-15',
    updatedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'Personal use means practice and private listening. Anything that earns money or promotes a release or a business is commercial use.',
        'Putting a song on Spotify or Apple Music is commercial use even at ten streams, because it is public distribution on a paid service.',
        'When a use is unclear, ask before you release and keep the answer in writing.',
    ],
    figures: {
        line: {
            type: 'flow',
            caption: 'One question decides most cases: does anyone earn money or promotion from the song? If yes, you need a license that covers that use.',
            alt: 'Four steps: ask whether money or promotion is involved; if yes it is commercial use; buy a license that covers the use; stay within its limits.',
            steps: [
                { label: 'Money or promotion involved?', note: 'Royalties, ads, sales, fees, sponsors', focus: true },
                { label: 'Then it is commercial use', note: 'Even at a small scale' },
                { label: 'License that covers the use', note: 'Check the tier and its terms' },
                { label: 'Stay within its limits', note: 'Ask before you pass a cap' },
            ],
        },
    },
    quiz: [
        {
            q: 'You upload a song made on a free beat to Spotify. What kind of use is that?',
            options: [
                'Personal, as long as it only gets a few streams',
                'Personal, because you credited the producer',
                'Commercial: public distribution on a paid service',
                'Neither, because streaming uploads are exempt',
            ],
            answer: 2,
            why: 'Releasing a song publicly on a service that earns from it is commercial at any scale, even before the track earns you anything, so it needs a license.',
        },
        {
            q: 'A clothing brand pays you to post a short video that uses a beat. Is that commercial use?',
            options: [
                'No, because short videos count as personal use',
                'Yes, because a business pays you for the post',
                'No, because the beat is only in the background',
                'Only if the video gets more than 10,000 views',
            ],
            answer: 1,
            why: 'Sponsored and promotional posts support a business. That makes the music part of a commercial product.',
        },
        {
            q: 'You are not sure whether your use is covered. What should you do?',
            options: [
                'Release first and ask if someone complains',
                'Credit the producer and assume you are covered',
                'Switch to the free download version instead',
                'Ask before you release and get it in writing',
            ],
            answer: 3,
            why: 'A written answer protects you and the producer. Assumptions are what lead to takedowns.',
        },
    ],
    content: `## Hook: the free beat and the distributor form

You found a free beat, wrote a song on it in an afternoon, and it came out better than anything you have paid for. The distributor's upload form asks you to confirm you own or have licensed everything in the track. The beat's page says "free for non-profit use". You hover over the checkbox.

That checkbox is the line between personal and commercial use, and it is easier to answer than it looks.

## Why it matters: one question decides most cases

Whether you need a license depends on what happens to the song, not on how many people hear it. Ask one question: does anyone earn money or promotion from this? If yes, you need a license that covers that use.

::figure line

A released song carries two copyrights, the composition and the sound recording (US Copyright Office, 2021). A beat puts the producer's share of both inside your song, so whoever releases it needs the producer's permission for that use.

## Personal use

Personal use means the song stays with you. Nobody is paid, nothing is sold, and the song is not distributed publicly: writing and practising at home, a demo you send to the producer, a rough mix you share privately with a collaborator.

## Commercial use

Commercial use is anything that earns money, builds a release or promotes a business. Uploading to Spotify or Apple Music counts at any scale: the song is distributed publicly on a service that earns from it through subscriptions and ads, even before it earns you anything. Spotify pays recorded royalties on a track only once it has 1,000 streams in the previous 12 months and a minimum number of unique listeners (Spotify, 2024), so a small release can earn nothing and still be a commercial release. Ads on a video count too, and so do download and physical sales, paid shows, a sponsored post for a brand, and client work where you are paid to make a video, an ad or a podcast.

Background music in your own videos and streams is commercial too once the channel is monetized or sponsored. That case usually calls for a creator license rather than a beat lease: the [lesson on streaming versus a creator license](/blog/spotify-streaming-vs-flow-creator-license) covers how that works.

## Grey areas

Some beats come with a free download for non-commercial use. Follow the exact terms shown with that beat; a free download is not a license to release.

Posting publicly without ads is still public distribution. Check the terms that came with the beat, and ask if they do not cover it.

A personal post and a paid brand post can look the same on screen. If a business pays for or benefits from the post, treat it as commercial.

## Quick reference

| Situation | Commercial use? | What to do |
| --- | --- | --- |
| Demo at home | No | Nothing needed |
| Demo sent to the producer | No | Nothing needed |
| Release on Spotify or Apple Music | Yes | License that covers streams, within its cap |
| Monetized YouTube video with your song | Yes | License that covers music videos; check monetization terms |
| Background music in a monetized video | Yes | A creator license that covers it |
| Paid gig | Yes | Tier that includes paid performances |
| Sponsored or brand post | Yes | License that covers the use; ask if unsure |
| Public upload with no money involved | Depends | Follow the terms shown with the beat, or ask first |

## Common mistake: judging by audience size

A small audience makes a release feel personal. Ten streams on Spotify are still public distribution on a paid service, and a sponsored post with fifty views still promotes a business.

The second mistake is treating a credit as a license. Crediting the producer is usually required by a license, and it does not replace one.

## Producer takeaway: license before the checkbox

If money is involved, or you hope it will be, license the beat before release. When a use is unclear, ask before you release and keep the answer in writing. The current tiers and their limits are in the [lesson on beat licensing](/blog/beat-licensing-explained) and in the [beat store](/studio/beats). This is a plain-language guide, not legal advice; the written license is what applies.

## References

- Spotify. (2024). *Track monetization eligibility*. Spotify for Artists. https://support.spotify.com/artists/article/track-monetization-eligibility/
- US Copyright Office. (2021). *Circular 56A: Copyright Registration of Musical Compositions and Sound Recordings*. https://www.copyright.gov/circs/circ56a.pdf
`,
    seo: {
        title: 'Commercial vs personal use of a beat | VGP Studio',
        description: 'Where the line between personal and commercial use falls for streaming, YouTube, shows, social posts and client work, and what to do when it is unclear.',
        keywords: ['commercial use', 'personal use', 'beat license', 'free beat spotify', 'music monetization', 'license requirements'],
    },
};
