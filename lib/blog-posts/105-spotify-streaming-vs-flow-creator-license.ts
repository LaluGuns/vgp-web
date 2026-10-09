import { BlogArticle } from '../blog-data';

export const post105: BlogArticle = {
    slug: 'spotify-streaming-vs-flow-creator-license',
    title: 'Streaming a track vs licensing it for your video',
    excerpt: 'A stream gives you listening access. Using the recording under your own video needs a license that names that use, shown step by step with the Flow catalogue.',
    category: 'licensing-guide',
    publishedAt: '2026-07-19',
    updatedAt: '2026-10-09',
    readingTime: 4,
    summary: [
        'Streaming a track gives you listening access. It does not give you permission to use the recording in your own published work.',
        'Flow Creator Music is royalty-free with an active Flow Pro creator license, for eligible City Pop, Cyberpunk Jazz and Neo Synthwave recordings.',
        'Keep Flow Pro active when you first publish, download through Flow, keep the grant, and use the exact attribution line.',
    ],
    figures: {
        paths: {
            type: 'flow',
            caption: 'The license path for one track, from preview to publishing. The step that decides whether a video stays covered is the second: Flow Pro active when you first publish it. Streaming the same track on Spotify adds nothing to this path.',
            alt: 'Four numbered steps: preview the track in the Flow Creator Music catalogue, have Flow Pro active when you first publish, download through Flow and keep the grant record, publish with the exact attribution line. The second step is in the accent.',
            steps: [
                { label: 'Preview in the Flow catalogue', note: 'Only eligible tracks have a license path' },
                { label: 'Flow Pro active when you publish', note: 'Covers work first published while Pro is active', focus: true },
                { label: 'Download through Flow, keep the grant', note: 'Your record of what you used and when' },
                { label: 'Publish with the attribution line', note: 'Exact wording, never translated' },
            ],
        },
    },
    quiz: [
        {
            q: 'You found a Chill Music Division track on Spotify. Can you put it under your sponsored YouTube video?',
            options: [
                'Only with a creator license that covers it',
                'Yes, if you credit the artist in the description',
                'Only if you stream it on a paid Spotify plan',
                'Yes, if the finished video is under ten minutes',
            ],
            answer: 0,
            why: 'Listening access and permission to use a recording in your work are different things. The permission comes from the creator license and its terms, not from the stream.',
        },
        {
            q: 'What does "royalty-free with an active Flow Pro creator license" mean?',
            options: [
                'The recordings are in the public domain and free for anyone',
                'You can resell the downloaded files to other creators',
                'You can register the tracks with Content ID in your name',
                'It names the license model; the music stays copyrighted',
            ],
            answer: 3,
            why: 'Royalty-free describes how you pay for the license. It does not make the music copyright-free, and resale, sublicensing and Content ID registration are not allowed.',
        },
        {
            q: 'Which of these does a Flow Creator License not allow?',
            options: [
                'Playing it under a study-with-me livestream',
                'Using it as background in a podcast episode',
                'Releasing it on Spotify under your own name',
                'Running it behind a coding tutorial on YouTube',
            ],
            answer: 2,
            why: 'The license covers background use in published creator work. Redistribution, including releasing the recording on a DSP, stays with the rights holder.',
        },
    ],
    content: `## Hook: the track you found on a playlist

You are editing a sponsored coding tutorial at 1 a.m. and a Chill Music Division track comes up on a Spotify playlist. It is exactly the mood the edit needs. You pay for Spotify, the track is right there, and the sponsor wants the video out tomorrow.

The play button gives you the sound. It does not give you permission to put that recording under a video someone paid you to make.

## Why it matters: listening and using are different permissions

A streaming subscription is a license to listen, on the service's terms. Putting a recording into your own published work is a different use of the same copyright, and it needs a license that names that use. A recording carries rights in the composition and in the sound recording, and the owner decides who may use them and how.

So the question for any track is where the license for your use comes from. For Chill Music Division recordings, the [Spotify artist profile](https://open.spotify.com/artist/21bxd77KSj9RR6vAqW5Hvy) is for listening and discovery. The license path for creator use is the Flow Creator Music catalogue, and not every catalogue track is on Spotify.

## How the creator license works

Flow Creator Music covers eligible City Pop, Cyberpunk Jazz and Neo Synthwave recordings, for users with an active Flow Pro plan who accept the license terms when a grant is created (Flow Creator License V1, 2026). The terms list the covered uses: background music in monetized videos, livestreams, podcasts, study-with-me and coding content, and social and creator videos.

::figure paths

1. Preview the music in the [Flow Creator Music catalogue](https://flow.virzyguns.com/en/creator-music).
2. Have Flow Pro active when you first publish the work that uses the recording. Work first published while Pro was active, with a valid grant and the terms followed, stays licensed after an ordinary cancellation. New work needs Pro active again.
3. Download the track through Flow and keep the grant record.
4. Put the required attribution, exactly as written, in the video description, stream panel or podcast notes:

\`\`\`
Music: Flow Creator Music by Chill Music Division / Virzy Guns Production - https://flow.virzyguns.com/creator-music
\`\`\`

| | Streaming on Spotify | Flow Creator License |
| --- | --- | --- |
| Listen | Yes | Yes |
| Background music in your published work | No | Yes, for eligible tracks and covered uses |
| Download the file | No | Yes, through Flow |
| Record of permission | None | The grant record |
| Attribution | Not applicable | Required, exact wording |

## What the license does not allow

The license is narrower than ownership. Rights in the recordings and compositions stay with their rights holder. You may not register the music or a derivative with Content ID or another rights-management system, resell or redistribute the files as standalone music, sample or remix them, or upload them to a streaming service under your name. A library, template marketplace, app or game needs separate written permission.

## Common mistake: treating royalty-free as copyright-free

Royalty-free describes how you pay for the license: you do not pay per play. The recordings stay under copyright, and the terms still apply.

The second mistake is keeping no record. A screenshot of a playlist proves you listened. The grant record proves which track you licensed and when, which is what you need if a platform or a sponsor asks.

## Producer takeaway: listen anywhere, license at the source

Use Spotify to listen and discover. When a track is going under published work, get it from the catalogue that licenses it, keep the grant, and paste the attribution line exactly. This lesson is a plain-language summary; the published terms are what apply. For beats rather than background music, the [lesson on commercial and personal use](/blog/commercial-use-vs-personal-use) covers where the line falls.

## References

- Chill Music Division / Virzy Guns Production. (2026). *FLOW Creator License V1* (effective 19 July 2026). https://flow.virzyguns.com/en/license
- US Copyright Office. (2021). *Circular 56A: Copyright Registration of Musical Compositions and Sound Recordings*. https://www.copyright.gov/circs/circ56a.pdf
`,
    seo: {
        title: 'Streaming a track vs licensing it for video | VGP Studio',
        description: 'Streaming a track gives you listening access. Using it under your video needs a license: how a creator license works, with the Flow catalogue as the example.',
        keywords: ['spotify music license for youtube', 'spotify streaming vs music licensing', 'creator music license', 'royalty-free music license for creators', 'Flow Pro creator license', 'Chill Music Division'],
    },
};
