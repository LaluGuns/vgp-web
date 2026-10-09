import { BlogArticle } from '../blog-data';
import { PUBLIC_CONFIRMED_LICENSES } from '../licensing-registry';

const credit = PUBLIC_CONFIRMED_LICENSES[0]?.creditString ?? 'the credit named in your license';
const tierNames = PUBLIC_CONFIRMED_LICENSES.map((t) => t.name).join(', ');

export const post109: BlogArticle = {
    slug: 'beat-licensing-explained',
    title: 'Beat licensing explained: what you buy when you lease a beat',
    excerpt: 'A beat license is permission to use someone else\'s composition and recording within set limits. What you get, what the producer keeps, and what to check before release.',
    category: 'licensing-guide',
    publishedAt: '2026-02-05',
    updatedAt: '2026-10-09',
    readingTime: 5,
    summary: [
        'A beat license is permission to use the beat under set terms. The producer keeps the copyright.',
        'Non-exclusive tiers differ in files, stream and copy caps, music videos, radio and paid performances.',
        'Read the written license before you release, credit the beat, and ask before you pass a cap.',
    ],
    figures: {
        rights: {
            type: 'flow',
            caption: 'What a lease covers. The beat stays the producer\'s property. What you buy is the second step: written permission to release your song on it within the limits of your tier.',
            alt: 'Four steps: the producer owns the beat, you buy a license, you record your song, you release it within the license limits.',
            steps: [
                { label: 'The producer owns the beat', note: 'Copyright stays with the producer' },
                { label: 'You buy a license', note: 'Permission with written terms', focus: true },
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
    content: `## Hook: the song that outgrew its lease

You lease a beat on the smallest tier, record a song on it the same night and put it out everywhere. For two months it does a few hundred plays a week. Then a short clip of the hook takes off, the streams climb past the number in your license, and a sync agency asks whether you can clear the song for an ad.

You go back to the license file you never opened. It says what you can do, how far the song can travel, and who owns what. The answer for the agency is in that file too.

## Why it matters: a lease is permission with limits

When you buy a beat online you are buying a license: written permission to record a song on the instrumental and release it within specific limits. The producer keeps the copyright in the beat. That is why the license matters more than the price. It decides where your song can go, how far it can travel before you need to upgrade, and what you owe in return, such as a credit.

::figure rights

## What a song on a leased beat is made of

US copyright law treats a musical composition and a sound recording as two separate works (US Copyright Office, 2021). The composition is the music and words: melody, harmony, rhythm, lyrics. The sound recording is one fixed performance of it. They can have different authors and different owners.

A beat carries both: the producer's composition (the chords, the melody, the drum pattern) and the producer's recording of it. Your song adds your lyrics and topline to the composition and your vocal to the recording. A lease lets you combine your parts with the producer's and release the result. It does not hand you the producer's share of either.

## Non-exclusive and exclusive

Most beat sales are non-exclusive leases. The producer can license the same beat to other artists, and each license carries caps: how many streams and copies, how many music videos, whether radio play and paid shows are included.

An exclusive license means that, from the date of the deal, the producer stops licensing the beat to new buyers. What it includes, what happens to leases sold before it and who owns what are all set by the contract, so an exclusive is agreed individually. Exclusive does not by itself mean you own the copyright.

## The current tiers

These are the non-exclusive tiers for Virzy Guns beats right now (${tierNames}). The table is read from the same source as the beat store, so it stays current.

::licenses

Choose from where the song is going. A first release to a small audience fits the smallest tier. WAV files, radio and paid performances are listed per tier in the table. If you or an engineer will mix from separate parts, choose a tier with stems. If you expect the song to travel, compare the caps with your plan before release.

## Common mistake: releasing first, reading later

The most common mistake is the one in the hook. A song that takes off on a small tier can pass its caps in weeks, and an upgrade is easier to arrange before that than after.

The second is assuming a lease lets you claim the song in YouTube's Content ID. YouTube requires exclusive rights to the material in a reference file and lists music licensed without exclusivity as material that does not qualify (YouTube Help, n.d.). Every other artist on the same beat would be claimed too.

The third is assuming that exclusive means you own the beat outright. Ownership depends on the contract, so read it before you sign.

## Producer takeaway: read the license before the release

1. Read the written license you receive at checkout. It is the document that applies, not a product summary or this lesson.
2. Credit the beat as written in your license: ${credit}.
3. Keep the license file with your release records.
4. If the song approaches a cap, ask about an upgrade before you pass it, and get the answer in writing.

This lesson is a plain-language guide, not legal advice. If something about your use is unclear, ask before you release. You can browse beats and their licenses in the [beat store](/studio/beats), and the [lesson on what each license lets you do](/blog/what-rights-do-you-get-with-each-license) goes through each right in turn.

## References

- US Copyright Office. (2021). *Circular 56A: Copyright Registration of Musical Compositions and Sound Recordings*. https://www.copyright.gov/circs/circ56a.pdf
- YouTube Help. (n.d.). *Qualify for Content ID*. Retrieved 9 October 2026, from https://support.google.com/youtube/answer/1311402
`,
    seo: {
        title: 'Beat licensing explained | VGP Studio',
        description: 'What you buy when you lease a beat: two copyrights, the producer keeps both, and the limits of your tier. What to check before you release.',
        keywords: ['beat license', 'lease beat', 'exclusive beat', 'non-exclusive license', 'beat rights', 'music licensing'],
    },
};
