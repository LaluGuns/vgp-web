import { BlogArticle } from '../blog-data';
import { PUBLIC_CONFIRMED_LICENSES } from '../licensing-registry';

const credit = PUBLIC_CONFIRMED_LICENSES[0]?.creditString ?? 'the credit named in your license';
const tierNames = PUBLIC_CONFIRMED_LICENSES.map((t) => t.name).join(', ');

export const post109: BlogArticle = {
    slug: 'beat-licensing-explained',
    title: 'Beat licensing explained: what you buy when you lease a beat',
    excerpt: 'A beat license is permission to use an instrumental within set limits. Here is what that means, how the current tiers differ, and what to check before you release.',
    category: 'licensing-guide',
    publishedAt: '2026-02-05',
    updatedAt: '2026-10-08',
    readingTime: 5,
    featured: true,
    summary: [
        'A beat license is permission to use the beat under set terms. The producer keeps the copyright.',
        'Non-exclusive tiers differ in files, stream and copy caps, music videos, radio and paid performances.',
        'Read the written license before you release, credit the beat, and ask before you pass a cap.',
    ],
    figures: {
        rights: {
            type: 'flow',
            caption: 'What a lease covers. You never buy the beat itself; you buy permission to release your song on it within the limits of your tier.',
            alt: 'Four steps: the producer owns the beat, you buy a license, you record your song, you release it within the license limits.',
            steps: [
                { label: 'The producer owns the beat', note: 'Copyright stays with the producer' },
                { label: 'You buy a license', note: 'Permission with written terms' },
                { label: 'You record your song', note: 'Your vocal and writing on the beat' },
                { label: 'Release within the limits', note: 'Streams, copies, videos, radio, shows' },
            ],
        },
    },
    quiz: [
        {
            q: 'When you lease a beat, what are you buying?',
            options: [
                'The copyright in the instrumental itself',
                'Permission to use the beat within set terms',
                'The producer\'s share of the publishing',
                'The right to resell the beat to other artists',
            ],
            answer: 1,
            why: 'A lease is a license. The producer keeps ownership, and the written terms set what you may do with your song.',
        },
        {
            q: 'What does non-exclusive mean?',
            options: [
                'Only you can use the beat from now on',
                'You may not release the song commercially',
                'The beat comes with no stream or copy caps',
                'Other artists can license the same beat',
            ],
            answer: 3,
            why: 'Non-exclusive licenses can be sold to more than one artist. That is why they cost less than exclusive rights.',
        },
        {
            q: 'Your song is close to the stream cap of your tier. What should you do?',
            options: [
                'Ask about an upgrade before you pass the cap',
                'Keep it up and upgrade if someone complains',
                'Take the song down before it passes the cap',
                'Re-upload it as a new song to reset the count',
            ],
            answer: 0,
            why: 'Upgrades and their terms have to be confirmed in writing. Asking early keeps the release covered.',
        },
    ],
    content: `## What a beat license is

When you buy a beat online, you are not buying the beat. You are buying a license: written permission to record a song on the instrumental and release it within specific limits. The producer keeps the copyright in the beat.

That is why the license matters more than the price. It decides where your song can go, how far it can travel before you need to upgrade, and what you must do in return, such as crediting the producer.

::figure rights

## Non-exclusive and exclusive

Most beat sales are non-exclusive leases. The producer can license the same beat to other artists, and each license carries caps: how many streams, how many copies, how many music videos, whether radio and paid shows are included.

An exclusive license is different. From the date of the deal, the producer stops licensing the beat to new buyers. What it includes, what happens to leases sold before it, and who owns what are all set by the contract, so an exclusive is agreed individually. Exclusive does not automatically mean you own the copyright.

## The current tiers

These are the non-exclusive tiers for Virzy Guns beats right now (${tierNames}). The table is read from the same source as the beat store, so it is always current.

::licenses

## How to choose a tier

Start from where the song is going, not from the price.

- If you are writing, demoing or testing an idea with a small audience, the smallest tier covers a first release.
- If you want WAV files, radio play or paid performances, check which tiers include them in the table.
- If you or your engineer will mix the song from separate parts, choose a tier that includes stems.
- If you expect the song to travel far, compare the caps with your plan before release rather than after.

## Before you release

1. Read the written license you receive at checkout. It is the document that applies, not a product summary or this article.
2. Credit the beat as written in your license: ${credit}.
3. Do not register a song made on a leased beat with Content ID unless your license says you may.
4. Keep the license file with your release records.
5. If the song approaches a cap, ask about an upgrade before you pass it, and get the answer in writing.

## Common mistakes

The most common mistake is releasing first and reading the license later. A song that takes off on a small tier can pass its caps in weeks.

The second is assuming that "exclusive" means you own the beat outright. Ownership depends on the contract, so read it before you sign.

This article is a plain-language guide, not legal advice. If something about your use is unclear, ask before you release. You can browse beats and their licenses in the [beat store](/studio/beats).
`,
    seo: {
        title: 'Beat Licensing Explained: Leases, Exclusives and Current Tiers | VGP Studio',
        description: 'What you buy when you lease a beat, how non-exclusive tiers differ, what exclusive rights mean, and what to check before you release.',
        keywords: ['beat license', 'lease beat', 'exclusive beat', 'non-exclusive license', 'beat rights', 'music licensing'],
    },
};
