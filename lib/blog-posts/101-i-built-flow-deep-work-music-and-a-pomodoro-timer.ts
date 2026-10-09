import { BlogArticle } from '../blog-data';

export const post101: BlogArticle = {
    slug: 'i-built-flow-deep-work-music-and-a-pomodoro-timer',
    title: 'Studio note: why I built Flow',
    excerpt: 'A focus timer paired with music I write and produce for long sessions, and why its stats only report what the timer measured.',
    category: 'producer-psychology',
    publishedAt: '2026-07-18',
    readingTime: 4,
    updatedAt: '2026-10-09',
    summary: [
        'Flow pairs a pomodoro timer with focus music I write, produce, mix and master myself.',
        'Music for deep work has the opposite job of a streaming single: it has to stay under your thinking.',
        'Flow reports measured minutes only. A hidden tab is not counted as losing focus.',
    ],
    figures: {
        session: {
            type: 'flow',
            caption: 'A Flow session. The free tier needs no account, and the stats report only what the timer measured.',
            alt: 'Four steps: open Flow, press play, work, see measured minutes.',
            steps: [
                { label: 'Open Flow', note: 'No account on the free tier' },
                { label: 'Press play', note: 'Focus music produced in-house' },
                { label: 'Work', note: 'The timer stays out of the way' },
                { label: 'See measured minutes', note: 'Only what the timer measured', focus: true },
            ],
        },
    },
    quiz: [
        {
            q: 'Why does music for deep work need a different approach from a streaming single?',
            options: [
                'It has to be loud enough to cover room noise',
                'It has to avoid melody so it does not pull focus',
                'It has to be mixed for headphones, not for speakers',
                'It has to sit under your thinking for hours',
            ],
            answer: 3,
            why: 'A single is built to win attention fast. Session music has to be interesting enough that silence feels empty, and calm enough that you forget it is there.',
        },
        {
            q: 'Your session log shows 48 minutes for a block in which you spent part of the time in another tab. What do those 48 minutes tell you?',
            options: [
                'That the timer ran for 48 minutes, and nothing about your focus',
                'That you focused for less, since the hidden-tab time was taken off',
                'That you drifted, since each tab switch is logged as lost focus',
                'That you focused for all 48, since the app checked you kept working',
            ],
            answer: 0,
            why: 'The stats report measured minutes only. Switching tabs does not mean you stopped working, so the app does not watch tabs or score attention, and the number is how long the timer ran.',
        },
        {
            q: 'Your log shows 120 minutes on Monday and 60 on Tuesday. What can you conclude from those two numbers alone?',
            options: [
                'That Monday was the more focused and productive day',
                'That you drifted for an hour on Tuesday, since it logged less',
                'Only that the timer ran twice as long on Monday as on Tuesday',
                'That Tuesday\'s music pulled more of your attention than Monday\'s',
            ],
            answer: 2,
            why: 'Minutes record how long the timer ran. Tuesday\'s hour could hold your best work of the week and Monday could be mostly email, so the numbers cannot rank your focus, your output or the music.',
        },
    ],
    content: `## The session that started it

I spend most of my working days inside a DAW: long sessions, small decisions, and a constant fight for attention. Like a lot of people, I used focus apps and lo-fi playlists to get through them, and I kept noticing the same thing. The timers were fine. The music was an afterthought: stock loops licensed in bulk, ambient beds nobody seemed to have written, playlists that changed character every few minutes and pulled my attention with them.

So I built the version I wanted. It is called Flow, it lives at [flow.virzyguns.com](https://flow.virzyguns.com), and the [Flow page](/flow) has the full details.

## What Flow is

Flow has two halves that were designed together: a pomodoro and deep-work timer that runs your session and stays out of the way, and a catalogue of focus music that I write, produce, mix and master myself.

::figure session

You open the site, press play and work. The free tier needs no account. Flow Pro adds the full catalogue and the other visual themes; current pricing is on the Flow page.

## Why the music is the point

A song made for streaming has to win attention fast. Music for a two-hour session has the opposite job. It has to be interesting enough that silence feels empty without it, and calm enough that you forget it is there.

That balance comes from production choices: controlled dynamics, no sudden vocal hooks, arrangements that change slowly. There is research behind some of it. Background sound that keeps changing disrupts verbal memory more than steady sound, and music with vocals disrupts it more than instrumental music. The [lesson on synthwave for coding videos](/blog/neo-synthwave-music-for-coding-and-tech-content) goes through those studies. I can only make those choices because I control the production, which is why every track in Flow is produced in-house.

## A hidden tab is not lost focus

One design decision took me longest, and it ended in deleting code. An early build watched whether the browser tab was visible and told you when you had drifted off. I removed it. Switching tabs does not mean you stopped working: you might be reading a document, writing in another window or thinking with your eyes closed.

So Flow reports measured minutes only. If the timer ran for 48 minutes, you get 48 minutes. There are no focus scores and no guilt pop-ups. What the app cannot measure, it does not report.

## Small things from daily use

Flow has four visual themes, from a soft glass room to a bare terminal, because some days I want one and some days the other. The interface is translated into eleven languages. There is no onboarding: the first session starts when you arrive, and accounts exist for people who want history and Pro.

## What happens next

New music lands in the catalogue as I finish it, and that is the part of this project I intend to keep doing. If you work in long sessions, [open Flow](https://flow.virzyguns.com) and run one pomodoro with it.
`,
    seo: {
        title: 'Studio note: why I built Flow | VGP Studio',
        description: 'Why I built Flow: a pomodoro timer paired with focus music I produce myself, stats that report only measured minutes, and a free tier with no account.',
        keywords: ['Flow by Virzy Guns', 'deep work music', 'pomodoro timer app', 'focus music', 'founder story', 'in-house music production']
    }
};
