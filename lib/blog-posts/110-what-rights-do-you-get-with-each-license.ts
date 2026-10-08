import { BlogArticle } from '../blog-data';
import { PUBLIC_CONFIRMED_LICENSES, formatLicenseCount } from '../licensing-registry';

const tiers = PUBLIC_CONFIRMED_LICENSES;
const smallest = tiers[0];
const n = (v: number | null) => (v === null ? 'unconfirmed' : v.toLocaleString('en-US'));
const streams = (t: (typeof tiers)[number]) => formatLicenseCount(t.onlineAudioStreams, 'stream', 'streams', t.unlimitedOnlineAudioStreams);
const list = (pick: (t: (typeof tiers)[number]) => string) => tiers.map((t) => `- **${t.name}:** ${pick(t)}`).join('\n');
const firstWithShows = tiers.find((t) => t.paidPerformances);
const noContentId = tiers.every((t) => t.contentIdAllowed === false);
// A test scenario that passes the smallest tier's stream cap.
const scenarioStreams = (smallest?.onlineAudioStreams ?? 5000) * 2;

export const post110: BlogArticle = {
    slug: 'what-rights-do-you-get-with-each-license',
    title: 'What each beat license lets you do',
    excerpt: 'Streams, copies, music videos, radio and paid shows are separate allowances. Here is how each one works across the current license tiers.',
    category: 'licensing-guide',
    publishedAt: '2026-01-25',
    updatedAt: '2026-10-08',
    readingTime: 5,
    summary: [
        'Each right in a beat license is counted on its own: streams, copies, music videos, radio stations and paid performances.',
        `Passing a cap, such as ${n(smallest?.onlineAudioStreams ?? null)} streams on ${smallest?.name ?? 'the smallest tier'}, means it is time to ask about an upgrade.`,
        'Monetization, Content ID and ownership follow the written license, not the tier name.',
    ],
    figures: {
        streams: {
            type: 'bars',
            caption:
                'Online audio stream caps per tier, drawn on a log scale so the smallest cap is still visible. Each step up is a different size, so compare your plan with the actual number.',
            alt: `Bars for each tier's online audio stream cap: ${tiers.map((t) => `${t.name} ${streams(t)}`).join(', ')}.`,
            min: 3,
            max: 6.3,
            bars: tiers.map((t) => ({
                label: t.name,
                value: t.unlimitedOnlineAudioStreams ? 6.3 : Math.log10(t.onlineAudioStreams ?? 1000),
                display: t.unlimitedOnlineAudioStreams ? 'No cap' : n(t.onlineAudioStreams),
            })),
        },
    },
    quiz: [
        {
            q: `Your song on a ${smallest?.name ?? 'basic'} license reaches ${n(scenarioStreams)} streams. What has happened?`,
            options: [
                'It is past the cap, so ask about an upgrade',
                'Nothing, because streams are not counted',
                'Ownership of the song passes to the producer',
                'The license upgrades itself to the next tier',
            ],
            answer: 0,
            why: 'Each tier has its own cap. Past it, the release is outside the license until an upgrade or replacement is confirmed in writing.',
        },
        {
            q: 'Which tier is the first to include paid performances?',
            options: tiers.map((t) => t.name),
            answer: Math.max(0, tiers.findIndex((t) => t.paidPerformances)),
            why: `${firstWithShows?.name ?? 'The first tier with paid performances'} is the first tier that lists paid performances as included.${firstWithShows && tiers.indexOf(firstWithShows) > 0 ? ` ${tiers.slice(0, tiers.indexOf(firstWithShows)).map((t) => t.name).join(' and ')} ${tiers.indexOf(firstWithShows) > 1 ? 'do' : 'does'} not.` : ''}`,
        },
        {
            q: 'Can you register a song made on a leased beat with Content ID?',
            options: [
                'Yes, on every tier after the song is released',
                'Yes, once you have credited the producer',
                'Only for the music videos your tier allows',
                noContentId ? 'No, none of the current lease tiers allow it' : 'Only if your written license allows it',
            ],
            answer: 3,
            why: 'Content ID would claim the beat on every other artist who licensed it. Check the written license; on the current tiers it is not allowed.',
        },
    ],
    content: `## Rights are counted separately

A beat license is not one permission. It is a bundle of separate allowances: how many times the song can be streamed, how many copies you can sell, how many music videos you can make, whether radio stations can play it, and whether you can perform it at paid shows. Each one has its own limit.

This guide walks through each right using the current Virzy Guns tiers. The written license issued at checkout is what applies, so confirm scope, territory, Content ID, credit, upgrade and remedy terms there before release.

## Streams and copies

Streaming rights decide how many times your song can be played on services such as Spotify and Apple Music before you need to upgrade. Copies cover downloads and physical sales.

Online audio streams per tier:

${list(streams)}

::figure streams

Copies you can sell or distribute:

${list((t) => formatLicenseCount(t.distributionCopies, 'copy', 'copies', t.unlimitedDistribution))}

Say you buy ${smallest?.name ?? 'the smallest tier'} and the song reaches ${n(scenarioStreams)} streams in a month. It has passed the cap. Contact us before it goes further, so an upgrade or replacement license can be confirmed in writing.

"Unlimited" describes the listed stream and copy caps. It is not a promise that every other right is unlimited too.

## Music videos

Visuals are counted on their own, not as streams.

${list((t) => formatLicenseCount(t.musicVideos, 'music video', 'music videos'))}

Monetization and Content ID are separate questions from the video count. Do not infer either from the tier name: check the written license before you turn on ads or register the song with a rights system.${noContentId ? ' On the current non-exclusive tiers, Content ID registration is not allowed, because it would claim the beat on every other artist who licensed it.' : ''}

## Paid performances

A paid performance is any show where you earn money: ticket sales, a fee or a booking.

${list((t) => (t.paidPerformances === null ? 'confirm in writing' : t.paidPerformances ? 'included' : 'not included'))}

If you are booked for paid shows, choose a tier that includes them before the first gig.

## Radio

${list((t) => formatLicenseCount(t.radioStations, 'station', 'stations'))}

Radio play earns performance royalties, collected through performing rights organizations such as ASCAP or BMI. How those royalties are split between you and the producer is set by the written license and your registrations.

## Common questions

**Can I upgrade later?** Ask before you pass a cap. Availability, any credit for what you already paid, and the replacement terms must be confirmed in writing.

**Do I own the master recording?** Ownership and royalty splits depend on the written agreement. Do not infer master or composition ownership from a tier summary.

**Can I just use the free download?** Follow the specific terms shown with the beat. A free download is not a commercial license.

This is a plain-language guide, not legal advice. The full comparison is in [Beat licensing explained](/blog/beat-licensing-explained), and every beat's licenses are in the [beat store](/studio/beats).
`,
    seo: {
        title: 'Beat License Rights Explained: Streams, Videos, Radio, Shows | VGP Studio',
        description: 'How streaming caps, copies, music videos, radio play and paid performances work across beat license tiers, and what to check before release.',
        keywords: ['beat rights', 'streaming rights', 'beat license limits', 'radio rights', 'music rights', 'license terms'],
    },
};
