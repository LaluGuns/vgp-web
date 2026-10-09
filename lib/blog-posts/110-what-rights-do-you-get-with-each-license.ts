import { BlogArticle } from '../blog-data';
import { PUBLIC_CONFIRMED_LICENSES, formatLicenseCount } from '../licensing-registry';

const tiers = PUBLIC_CONFIRMED_LICENSES;
const smallest = tiers[0];
const n = (v: number | null) => (v === null ? 'unconfirmed' : v.toLocaleString('en-US'));
const streams = (t: (typeof tiers)[number]) => formatLicenseCount(t.onlineAudioStreams, 'stream', 'streams', t.unlimitedOnlineAudioStreams);
const firstWithShows = tiers.find((t) => t.paidPerformances);
const unlimitedTier = tiers.find((t) => t.unlimitedOnlineAudioStreams);
const twoVideos = tiers.find((t) => (t.musicVideos ?? 0) >= 2);
const videos = (t: (typeof tiers)[number] | undefined) => (t ? formatLicenseCount(t.musicVideos, 'music video', 'music videos') : 'a set number of music videos');
const noContentId = tiers.every((t) => t.contentIdAllowed === false);
// A test scenario that passes the smallest tier's stream cap.
const scenarioStreams = (smallest?.onlineAudioStreams ?? 5000) * 2;

export const post110: BlogArticle = {
    slug: 'what-rights-do-you-get-with-each-license',
    title: 'What each beat license lets you do',
    excerpt: 'Streams, copies, music videos, radio and paid shows are separate allowances, each with its own limit. How to read each one against your release plan.',
    category: 'licensing-guide',
    publishedAt: '2026-01-25',
    updatedAt: '2026-10-09',
    readingTime: 4,
    summary: [
        'Each right in a beat license is counted on its own: streams, copies, music videos, radio stations and paid performances.',
        `Passing a cap, such as ${n(smallest?.onlineAudioStreams ?? null)} streams on ${smallest?.name ?? 'the smallest tier'}, means it is time to ask about an upgrade.`,
        'Monetization, Content ID and ownership follow the written license, not the tier name.',
    ],
    figures: {
        streams: {
            type: 'bars',
            caption:
                'Online audio stream caps per tier, on a log scale: each tick is ten times the one before, so the smallest cap is still visible. The steps between tiers are different sizes, so compare your plan with the actual number.',
            alt: `Bars for each tier's online audio stream cap: ${tiers.map((t) => `${t.name} ${streams(t)}`).join(', ')}.`,
            min: 3,
            max: 6.3,
            log: true,
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
    content: `## Hook: three offers in one week

Your song on a leased beat is doing well. In one week a director offers to shoot a second video, a venue offers you a paid slot, and a community radio station asks to play it. You say yes to all three, then open the license to check.

Each of those offers is a different right in the license, and each one has its own limit. The stream count you were watching says nothing about any of them.

## Why it matters: rights are counted separately

A beat license is a bundle of separate allowances: how many times the song can be streamed, how many copies you can sell, how many music videos you can make, how many radio stations can play it, and whether you can perform it at paid shows. Passing one limit is not covered by staying under another.

These are the current Virzy Guns tiers, read from the same source as the beat store. The written license issued at checkout is what applies, so confirm scope, territory, credit and upgrade terms there before release.

::licenses

## Streams and copies

Streaming allowances count plays on services such as Spotify and Apple Music. Copies cover downloads and physical sales. The two are counted separately.

::figure streams

Say you buy ${smallest?.name ?? 'the smallest tier'} and the song reaches ${n(scenarioStreams)} streams. That is past its cap of ${n(smallest?.onlineAudioStreams ?? null)}. Contact us before it goes further, so an upgrade or replacement license can be confirmed in writing. "Unlimited" in a tier describes the listed stream and copy caps; it does not make every other right unlimited too.

## Music videos

Visuals are counted on their own. ${smallest?.name ?? 'The smallest tier'} covers ${videos(smallest)}, so the second video in the hook needs ${twoVideos ? `a tier such as ${twoVideos.name}` : 'a written upgrade'} before the shoot.

## Paid performances

A paid performance is any show where you earn money: ticket sales, a fee or a booking. ${firstWithShows ? `${firstWithShows.name} is the first tier in the table that includes them.` : 'Check the table for which tiers include them.'} If you are booked for paid shows, choose a tier that covers them before the first gig.

## Radio

Radio play is counted per station. Radio also earns performance royalties, collected through performing rights organizations such as ASCAP or BMI. How those royalties are split between you and the producer is set by the written license and your registrations.

## Common mistake: reading the tier name as a summary

The common mistake is treating a tier's name as a description of everything it allows. ${unlimitedTier ? `${unlimitedTier.name} has no stream cap, and still covers ${videos(unlimitedTier)} and ${formatLicenseCount(unlimitedTier.radioStations, 'radio station', 'radio stations')}.` : 'A tier with no stream cap can still have a fixed number of music videos and radio stations.'}

The second is assuming monetization and Content ID come with the video count. They are separate questions. YouTube's Content ID requires exclusive rights to the material and lists music licensed without exclusivity as material that does not qualify (YouTube Help, n.d.).${noContentId ? ' None of the current non-exclusive tiers allow Content ID registration, because it would claim the beat on every other artist who licensed it.' : ''}

## Producer takeaway: map your plan to the rows

Before you buy, write down your plan for the song: streams, sales, videos, radio, shows. Find the tier where every row covers it. When one row gets close to its limit, ask about an upgrade before you pass it, and keep the answer in writing.

This is a plain-language guide, not legal advice. The basics of what a lease is are in the [lesson on beat licensing](/blog/beat-licensing-explained), and every beat's licenses are in the [beat store](/studio/beats).

## References

- YouTube Help. (n.d.). *Qualify for Content ID*. Retrieved 9 October 2026, from https://support.google.com/youtube/answer/1311402
`,
    seo: {
        title: 'What each beat license lets you do | VGP Studio',
        description: 'How streaming caps, copies, music videos, radio play and paid performances work across beat license tiers, and what to check before release.',
        keywords: ['beat rights', 'streaming rights', 'beat license limits', 'radio rights', 'music rights', 'license terms'],
    },
};
