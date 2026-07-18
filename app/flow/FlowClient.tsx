'use client';

import { m } from 'framer-motion';
import {
    CheckCircle2,
    Globe2,
    Headphones,
    LineChart,
    Palette,
    Timer,
    Waves,
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    CinematicBackdrop,
    EditorialButton,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';

const heroSignals = [
    'Music produced in-house by Virzy Guns',
    'Free tier, no account required',
    'Stats that only count what they measure',
];

const features = [
    {
        title: 'Music made in-house',
        body: 'Every track in Flow is produced by Virzy Guns. No AI-generated filler, no stock library loops. The catalog is written, mixed, and mastered specifically for long deep-work sessions.',
        Icon: Headphones,
    },
    {
        title: 'Pomodoro, built for deep work',
        body: 'A focus timer that runs the classic pomodoro cadence or longer deep-work blocks. Start a session, let the music carry it, and let the timer handle the discipline.',
        Icon: Timer,
    },
    {
        title: 'Four visual themes',
        body: 'Glass, Studio, Terminal, and Editorial. Pick the room you want to work in, from soft translucency to a bare command line.',
        Icon: Palette,
    },
    {
        title: 'Honest stats',
        body: 'Flow reports measured minutes only. It never guesses whether you were "really" focused, and it never shames you for switching tabs. If the timer ran, it counts.',
        Icon: LineChart,
    },
    {
        title: 'Eleven languages',
        body: 'The full interface ships in eleven languages, so the app reads naturally wherever you work from.',
        Icon: Globe2,
    },
    {
        title: 'Zero-friction start',
        body: 'Open the site, press play, work. The free tier needs no account, no email, and no onboarding tour before the first session.',
        Icon: Waves,
    },
];

const freeFeatures = [
    'Focus music and pomodoro timer',
    'No account, no email required',
    'Session stats, measured minutes only',
    'Core visual theme',
];

const proFeatures = [
    'Full in-house music catalog',
    'All four visual themes',
    'Longer session history and stats',
    'Supports new music being produced',
];

export default function FlowClient() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-16">
                    <CinematicBackdrop />

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <m.div
                            variants={staggerParent}
                            initial="hidden"
                            animate="visible"
                            className="mx-auto max-w-3xl text-center"
                        >
                            <m.p
                                variants={staggerChild}
                                className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/70"
                            >
                                Flow by Virzy Guns
                            </m.p>

                            <m.h1
                                variants={staggerChild}
                                className="font-display text-5xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-[5.5rem]"
                            >
                                Deep work,
                                <br />
                                <span className="text-sky-200">scored properly.</span>
                            </m.h1>

                            <m.p
                                variants={staggerChild}
                                className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-xl sm:leading-9"
                            >
                                Flow pairs a pomodoro timer with focus music produced in-house
                                by Virzy Guns. Open it, press play, and let the session run.
                                No account needed to start.
                            </m.p>

                            <m.div
                                variants={staggerChild}
                                className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
                            >
                                <EditorialButton href="https://flow.virzyguns.com">
                                    Open Flow
                                </EditorialButton>
                                <EditorialButton href="/lab/healingwave" variant="ghost">
                                    Explore HealingWave
                                </EditorialButton>
                            </m.div>

                            <m.div
                                variants={staggerChild}
                                className="mt-10 grid gap-3 sm:grid-cols-3"
                            >
                                {heroSignals.map((signal) => (
                                    <div key={signal} className="liquid-glass-soft rounded-lg px-4 py-3 text-left">
                                        <CheckCircle2 className="mb-3 h-4 w-4 text-sky-200/75" aria-hidden="true" />
                                        <p className="text-sm font-semibold leading-6 text-white/75">{signal}</p>
                                    </div>
                                ))}
                            </m.div>
                        </m.div>
                    </div>
                </section>

                <SectionShell className="pt-10">
                    <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                            What is inside
                        </p>
                        <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-6xl">
                            The music is the product. The timer keeps it honest.
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <m.article
                                key={feature.title}
                                variants={revealUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="liquid-glass flex h-full flex-col rounded-lg p-6"
                            >
                                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <feature.Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                                <p className="mt-4 text-sm leading-7 text-white/70">{feature.body}</p>
                            </m.article>
                        ))}
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="mb-10 max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                            Pricing
                        </p>
                        <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-6xl">
                            Free to focus. Pro for the full catalog.
                        </h2>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass flex h-full flex-col rounded-lg p-6 sm:p-8"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">
                                Flow Free
                            </p>
                            <p className="mt-4 font-display text-4xl font-semibold text-white">
                                $0
                            </p>
                            <p className="mt-2 text-sm leading-7 text-white/60">
                                Everything you need to run a real session, forever free.
                            </p>
                            <ul className="mt-6 grid flex-1 gap-3">
                                {freeFeatures.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/75">
                                        <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-sky-200/75" aria-hidden="true" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <EditorialButton href="https://flow.virzyguns.com" variant="ghost">
                                    Start free
                                </EditorialButton>
                            </div>
                        </m.div>

                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass-strong flex h-full flex-col rounded-lg border border-sky-200/20 p-6 sm:p-8"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/80">
                                Flow Pro
                            </p>
                            <p className="mt-4 font-display text-4xl font-semibold text-white">
                                $9.99
                                <span className="text-base font-normal text-white/60"> / month</span>
                            </p>
                            <p className="mt-2 text-sm leading-7 text-white/60">
                                Or $59.99 per year — two months on the house.
                            </p>
                            <ul className="mt-6 grid flex-1 gap-3">
                                {proFeatures.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/75">
                                        <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-sky-200/75" aria-hidden="true" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <EditorialButton href="https://flow.virzyguns.com">
                                    Go Pro in Flow
                                </EditorialButton>
                            </div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell className="pb-24">
                    <div className="liquid-glass-strong rounded-lg p-6 sm:p-8">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                                Why I built this
                            </p>
                            <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
                                I make music for a living. This is the music I work to.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-white/75">
                                Every focus app I tried treated the music as an afterthought:
                                stock loops, generic lo-fi, or an AI playlist with no author
                                behind it. I already produce records, so I built the tool I
                                wanted — a timer that respects the session and a catalog I
                                wrote myself, tuned for staying under the work instead of on
                                top of it. The stats are honest because I do not believe a
                                hidden browser tab means you stopped thinking.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <EditorialButton href="https://flow.virzyguns.com">
                                    Open Flow
                                </EditorialButton>
                                <EditorialButton
                                    href="/blog/i-built-flow-deep-work-music-and-a-pomodoro-timer"
                                    variant="ghost"
                                >
                                    Read the launch note
                                </EditorialButton>
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
