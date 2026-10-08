import { BlogArticle } from '../blog-data';

export const post111: BlogArticle = {
    slug: 'commercial-use-vs-personal-use',
    title: 'Commercial use vs personal use: when you need a beat license',
    excerpt: 'If money or promotion is involved, it is commercial use. Here is where the line falls for streaming, video, shows, social posts and client work.',
    category: 'licensing-guide',
    publishedAt: '2026-01-15',
    updatedAt: '2026-10-08',
    readingTime: 4,
    summary: [
        'Personal use means practice and private listening. Anything that earns money or promotes a release or a business is commercial use.',
        'Putting a song on Spotify or Apple Music is commercial use, even with ten streams, because those services pay royalties.',
        'When a use is unclear, ask before you release and keep the answer in writing.',
    ],
    figures: {
        line: {
            type: 'flow',
            caption: 'One question decides most cases: does anyone earn money or promotion from the song? If yes, you need a license that covers that use.',
            alt: 'Four steps: ask whether money or promotion is involved; if yes it is commercial use; buy a license that covers the use; stay within its limits.',
            steps: [
                { label: 'Money or promotion involved?', note: 'Royalties, ads, sales, fees, sponsors' },
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
                'Commercial, because the service pays royalties',
                'Neither, because streaming uploads are exempt',
            ],
            answer: 2,
            why: 'Distribution on a royalty-paying service is commercial activity at any scale, so it needs a license.',
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
    content: `## Can I put it on Spotify?

The most common question about free beats is whether a song made on one can go on Spotify. The short answer is no. Distributing a song to streaming services is commercial use, and commercial use needs a license.

The line between personal and commercial use is easy to draw once you ask one question: does anyone earn money or promotion from this?

::figure line

## Personal use

Personal use means the song stays with you. Nobody is paid, nothing is sold, and the song is not distributed publicly.

- Writing lyrics and practicing at home.
- Recording a demo to send to the producer.
- Sharing a rough mix privately with a collaborator.

## Commercial use

Commercial use is anything that earns money, builds a release or promotes a business.

- **Streaming services.** Even ten streams on Spotify count, because the service pays royalties.
- **Monetized video.** Ads on a YouTube video mean you earn from the music.
- **Sales.** Downloads, CDs, vinyl, Bandcamp.
- **Paid performances.** A show with ticket sales, a fee or a booking.
- **Sponsored and promotional posts.** A video that promotes a product or a brand.
- **Client work.** If you are paid to make a video, an ad or a podcast, the music is part of a commercial product.

## Gray areas

**Free downloads.** Some beats come with a free download for non-commercial use. Follow the exact terms shown with that beat. A free download is not a license to release.

**Non-monetized uploads.** Posting publicly without ads is still public distribution. Check the terms that came with the beat, and ask if they do not cover it.

**Social media.** A personal post and a paid brand post can look the same on screen. If a business pays for or benefits from the post, treat it as commercial.

If a use is unclear, ask before you release and keep the answer in writing.

## Quick reference

| Situation | Commercial use? | What to do |
| --- | --- | --- |
| Demo at home | No | Nothing needed |
| Demo sent to the producer | No | Nothing needed |
| Release on Spotify or Apple Music | Yes | License that covers streams, within its cap |
| Monetized YouTube video | Yes | License that covers music videos; check monetization terms |
| Paid gig | Yes | Tier that includes paid performances |
| Sponsored or brand post | Yes | License that covers the use; ask if unsure |
| Public upload with no money involved | Depends | Follow the terms shown with the beat, or ask first |

## Bottom line

If money is involved, or you hope it will be, license the beat before release. The current tiers and their limits are in [Beat licensing explained](/blog/beat-licensing-explained) and in the [beat store](/studio/beats). This is a plain-language guide, not legal advice; the written license is what applies.
`,
    seo: {
        title: 'Commercial vs Personal Use for Beats: When You Need a License | VGP Studio',
        description: 'Where the line between personal and commercial use falls for streaming, YouTube, shows, social posts and client work, and what to do when it is unclear.',
        keywords: ['commercial use', 'personal use', 'beat license', 'free beat spotify', 'music monetization', 'license requirements'],
    },
};
