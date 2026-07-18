import { BlogArticle } from '../blog-data';

export const post101: BlogArticle = {
    slug: 'i-built-flow-deep-work-music-and-a-pomodoro-timer',
    title: 'I built Flow: deep work music + a pomodoro timer, all produced in-house',
    excerpt: 'Why I built a focus app around music I produce myself instead of AI playlists or stock loops, and why its stats refuse to guess whether you were focused.',
    category: 'producer-psychology',
    publishedAt: '2026-07-18',
    readingTime: 6,
    featured: true,
    content: `## The itch

I spend most of my working life inside a DAW. Long sessions, repetitive decisions, and a constant fight for attention. Like a lot of people, I leaned on focus apps and lo-fi playlists to get through it. And like a lot of producers, I kept noticing the same thing: the music in those apps is an afterthought.

Stock loops licensed in bulk. AI-generated ambient beds with no author behind them. Playlists that change character every three minutes and quietly pull your attention with them. The timer part of these apps is usually fine. The music part is filler.

So I built the version I actually wanted. It is called Flow, it lives at <a href="https://flow.virzyguns.com" style="color:#7dd3fc;text-decoration:underline">flow.virzyguns.com</a>, and there is a full breakdown on the <a href="/flow" style="color:#7dd3fc;text-decoration:underline">Flow product page</a>.

## What Flow is

Flow is a deep work app with two halves that were designed together:

- A pomodoro and deep-work timer that runs your session and stays out of the way.
- A catalog of focus music that I write, produce, mix, and master myself.

You open the site, press play, and work. The free tier needs no account and no email. If you want the full catalog and all the visual themes, Flow Pro is $9.99 a month or $59.99 a year.

## Why the music is the whole point

This is the part I care about most, so let me be direct about it.

Every track in Flow is produced in-house. Not curated, not licensed, not generated. Produced. I sit down and write music specifically for long sessions: controlled dynamics, no sudden vocal hooks, arrangements that develop slowly enough to stay under your thinking instead of on top of it.

That matters for a simple reason. Music built for streaming playlists is engineered to grab attention in the first three seconds. Music built for deep work has the opposite job. It has to be interesting enough that silence feels empty without it, and boring enough that you forget it is there. That balance is a production decision, and you can only make it if you control the production.

It is also the honest answer to the obvious question: why would anyone pay for a focus app in 2026? Not for the timer. Timers are free everywhere. Flow Pro is closer to supporting a musician who ships a steady stream of session music than it is to renting a productivity tool.

## Honest stats, or: a hidden tab is not a failure

One design decision took me the longest to get right, and it ended in deletion.

An early build tried to detect whether you had "really" focused: it watched tab visibility and would tell you that you drifted off. I removed all of it. Switching to a hidden browser tab does not mean you stopped working. You might be reading a doc, writing in another window, or thinking with your eyes closed. An app that pretends to measure your mind is lying to you with a progress bar.

So Flow reports measured minutes only. If the timer ran for 48 minutes, you get 48 minutes. No focus scores, no guilt popups, no invented metrics. What the app cannot measure, it does not report.

## The small things

A few details that came from using it every day myself:

- **Four visual themes.** Glass, Studio, Terminal, and Editorial. Some days I want a soft translucent room; some days I want a bare command line and nothing else.
- **Eleven languages.** The interface ships fully localized, because a focus tool should read like it was made for you.
- **No onboarding.** The first session starts the moment you arrive. Accounts exist for people who want history and Pro, not as a gate.

## What happens next

Flow is live now. The free tier is genuinely usable, not a demo. New music lands in the catalog as I finish it, which is the part of this project I intend to never stop doing.

If you spend your days in long sessions like I do, try it: <a href="https://flow.virzyguns.com" style="color:#7dd3fc;text-decoration:underline">open Flow</a> and run one honest pomodoro. If you want the details first, the <a href="/flow" style="color:#7dd3fc;text-decoration:underline">product page</a> covers features and pricing.

Music carries the session. The timer just keeps the score.
`,
    seo: {
        title: 'I built Flow: deep work music + a pomodoro timer, produced in-house',
        description: 'The story behind Flow by Virzy Guns: a deep work app pairing a pomodoro timer with focus music produced in-house, honest measured-only stats, and a free tier with no account.',
        keywords: ['Flow by Virzy Guns', 'deep work music', 'pomodoro timer app', 'focus music', 'founder story', 'in-house music production']
    }
};
