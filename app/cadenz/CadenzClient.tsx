'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { Activity, CheckCircle2, Clock, FileText, Gauge, Link as LinkIcon, Timer } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    CinematicBackdrop,
    EditorialButton,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';

const heroSignals = [
    'Adaptive music for running and cycling',
    'VGP original music',
    'Coming soon',
];

const motionStory = [
    {
        label: '01 Problem',
        title: 'Most workout playlists ignore cadence.',
        body: 'A track can sound good and still fight your stride or pedal rhythm. When the tempo drifts away from the body, the workout starts following the playlist instead of the playlist supporting the workout.',
        Icon: Gauge,
    },
    {
        label: '02 Missing layer',
        title: 'BPM is only the starting point.',
        body: 'Running and cycling need tempo, energy, structure, recovery, and timing. A number on a track does not automatically become flow.',
        Icon: Activity,
    },
    {
        label: '03 CADENZ',
        title: 'A music system built around motion.',
        body: 'CADENZ connects cadence targets with original VGP music so runners and cyclists can move with a clearer rhythmic anchor.',
        Icon: Timer,
    },
];

const cadenceModes = [
    {
        title: 'Running cadence',
        description: 'Music shaped around stride rhythm, pace awareness, and motion flow.',
        Icon: Timer,
    },
    {
        title: 'Cycling rhythm',
        description: 'Cadence-focused listening for riders who want sound to support pedal rhythm.',
        Icon: Activity,
    },
    {
        title: 'Adaptive target',
        description: 'Simple controls keep the movement intent clear and VGP original music at the center.',
        Icon: Clock,
    },
];

const researchLinks = [
    {
        title: 'Effects of music in exercise and sport',
        journal: 'Psychological Bulletin, 2020',
        note: 'A meta-analysis on music, exercise performance, perceived exertion, and physiological efficiency.',
        href: 'https://doi.org/10.1037/bul0000216',
    },
    {
        title: 'Synchronous music during treadmill walking',
        journal: 'Journal of Sport & Exercise Psychology, 2009',
        note: 'Research on synchronous music, treadmill walking, affect, and time to exhaustion.',
        href: 'https://doi.org/10.1123/jsep.31.1.18',
    },
    {
        title: 'Music tempo, exercise performance, and heart rate',
        journal: 'International Journal of Physiology, Pathophysiology and Pharmacology, 2017',
        note: 'Open access study on tempo, exercise duration, and heart rate.',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5435671/',
    },
    {
        title: 'Rhythmic auditory cueing and stride variability',
        journal: 'Terrier and Deriaz, 2012',
        note: 'Study on auditory cueing, treadmill walking, and cadence control dynamics.',
        href: 'https://arxiv.org/abs/1207.4586',
    },
];

export default function CadenzClient() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-12">
                    <CinematicBackdrop />

                    <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:min-h-[700px] lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
                        <m.div
                            variants={staggerParent}
                            initial="hidden"
                            animate="visible"
                            className="max-w-3xl"
                        >
                            <m.div variants={staggerChild} className="mb-8 flex items-center gap-4">
                                <Image
                                    src="/images/CADENZ_LOGO.jpg"
                                    alt="CADENZ logo"
                                    width={96}
                                    height={96}
                                    className="h-14 w-14 rounded-lg object-cover"
                                    priority
                                />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                                        CADENZ by HealingWave Lab
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-white/70">
                                        First VGP functional audio product
                                    </p>
                                </div>
                            </m.div>

                            <m.h1
                                variants={staggerChild}
                                className="font-display text-5xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-[5.9rem]"
                            >
                                Find your
                                <br />
                                <span className="text-sky-200">cadence.</span>
                            </m.h1>

                            <m.p variants={staggerChild} className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-xl sm:leading-9">
                                CADENZ is a cadence music app for running and cycling, bringing VGP original music into a movement-first experience. Coming soon.
                            </m.p>

                            <m.div variants={staggerChild} className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <EditorialButton onClick={openPopup}>Join Waitlist</EditorialButton>
                                <EditorialButton href="/lab/healingwave" variant="ghost">Explore HealingWave</EditorialButton>
                            </m.div>

                            <m.div variants={staggerChild} className="mt-9 grid gap-3 sm:grid-cols-3">
                                {heroSignals.map((signal) => (
                                    <div key={signal} className="liquid-glass-soft rounded-lg px-4 py-3">
                                        <CheckCircle2 className="mb-3 h-4 w-4 text-sky-200/75" aria-hidden="true" />
                                        <p className="text-sm font-semibold leading-6 text-white/75">{signal}</p>
                                    </div>
                                ))}
                            </m.div>
                        </m.div>

                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            animate="visible"
                            className="relative"
                        >
                            <div className="absolute -inset-10 rounded-full bg-sky-300/10 blur-3xl" aria-hidden="true" />
                            <div className="relative mx-auto aspect-[575/1024] w-full max-w-[25rem] overflow-hidden rounded-lg border border-sky-200/[0.16] bg-[#02070c] shadow-[0_40px_140px_rgba(0,0,0,0.5)] lg:mr-0">
                                <Image
                                    src="/images/CADENZ_POSTER.jpg"
                                    alt="CADENZ promotional image with Virzy Guns and a bicycle"
                                    fill
                                    sizes="(min-width: 1024px) 400px, 88vw"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </m.div>
                    </div>
                </section>

                <SectionShell className="pt-10">
                    <div className="mb-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                            100% Art. 100% Science.
                        </p>
                        <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-6xl">
                            The problem is not music. It is mismatch.
                        </h2>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {motionStory.map((item) => (
                            <m.article
                                key={item.label}
                                variants={revealUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="liquid-glass flex h-full flex-col rounded-lg p-6"
                            >
                                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <item.Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">
                                    {item.label}
                                </p>
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-4 text-sm leading-7 text-white/70">{item.body}</p>
                            </m.article>
                        ))}
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative mx-auto w-full max-w-[22rem]"
                        >
                            <div className="absolute -inset-8 rounded-full bg-sky-300/10 blur-3xl" aria-hidden="true" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.11] bg-black p-2 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
                                <Image
                                    src="/images/Screenshot_20241029-082008_Cadenz.jpg"
                                    alt="CADENZ mobile app interface preview"
                                    width={1080}
                                    height={2400}
                                    sizes="(min-width: 1024px) 340px, 82vw"
                                    className="h-auto w-full rounded-[1.55rem] object-contain"
                                />
                            </div>
                        </m.div>

                        <div>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                                The experience
                            </p>
                            <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
                                From pace to playlist, the app keeps the session simple.
                            </h2>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
                                CADENZ keeps the experience calm instead of turning it into a busy fitness dashboard. The listener sets the movement intent, the music supports the rhythm, and the session stays focused.
                            </p>

                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                {cadenceModes.map((mode) => (
                                    <m.div
                                        key={mode.title}
                                        variants={revealUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="liquid-glass rounded-lg p-5"
                                    >
                                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                            <mode.Icon className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{mode.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-white/70">{mode.description}</p>
                                    </m.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="liquid-glass-strong rounded-lg p-6 sm:p-8">
                        <div className="mb-8 max-w-3xl">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                                Research base
                            </p>
                            <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
                                Rhythm, exercise, and auditory cue research inform the thesis.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-white/75">
                                These papers support the product direction. CADENZ does not turn them into medical claims. It uses them to keep the idea grounded: tempo, preference, rhythm, and movement timing matter.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {researchLinks.map((paper) => (
                                <a
                                    key={paper.href}
                                    href={paper.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-lg border border-white/[0.09] bg-white/[0.035] p-5 transition hover:border-sky-200/30 hover:bg-white/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                                >
                                    <div className="mb-6 flex items-start justify-between gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                            <FileText className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <LinkIcon className="h-4 w-4 text-white/55 transition group-hover:text-sky-100" aria-hidden="true" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/70">
                                        {paper.journal}
                                    </p>
                                    <h3 className="mt-3 text-lg font-semibold leading-snug text-white">{paper.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-white/70">{paper.note}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                <SectionShell className="pb-24">
                    <div className="liquid-glass-strong rounded-lg p-6 sm:p-8">
                        <div className="max-w-4xl">
                            <div>
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                                    Coming soon
                                </p>
                                <h2 className="font-display text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
                                    CADENZ is getting ready to move with you.
                                </h2>
                                <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
                                    Join the waitlist for release news and a first look at cadence-first listening for running and cycling.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <EditorialButton onClick={openPopup}>Join Waitlist</EditorialButton>
                                    <EditorialButton href="/blog" variant="ghost">Read VGP Notes</EditorialButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
