'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Activity, Disc3, ExternalLink, GraduationCap, Waves } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    EditorialButton,
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { founderBio, founderStatement } from '@/lib/vgp-ecosystem';
import { revealUp, staggerParent, staggerChild } from '@/lib/motion-presets';

const pillars = [
    {
        label: 'Studio',
        heading: 'Premium beats. Serious craft.',
        body: 'Instrumentals, custom production, mixing, mastering, and sound design for creators who care about detail.',
        Icon: Disc3,
        href: '/studio/beats',
    },
    {
        label: 'Lab',
        heading: 'Functional audio, carefully framed.',
        body: 'HealingWave covers focus, recovery, running cadence, cycling cadence, and calm listening without overstating what sound can do.',
        Icon: Activity,
        href: '/lab/healingwave',
    },
    {
        label: 'Education',
        heading: 'Producer knowledge made practical.',
        body: 'Masterclass, books, and editorial notes for cleaner decisions, stronger arrangements, and better releases.',
        Icon: GraduationCap,
        href: '/studio/masterclass',
    },
];

export default function AboutClient() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    eyebrow="About Virzy Guns Production"
                    title="100% Art."
                    mutedTitle="100% Science."
                    description="Virzy Guns is the founder and creative director behind a connected ecosystem for recorded music, premium production, functional audio, movement, and producer education."
                    primary={{ label: 'Explore Studio', href: '/studio/beats' }}
                    secondary={{ label: 'Enter HealingWave', href: '/lab/healingwave' }}
                />

                <SectionShell className="pt-4">
                    <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-8 rounded-full bg-sky-300/10 blur-3xl" aria-hidden="true" />
                            <div className="liquid-glass-strong relative overflow-hidden rounded-lg p-3">
                                <div className="relative aspect-square overflow-hidden rounded-lg">
                                    <Image
                                        src="/images/founder.jpg"
                                        alt="Virzy Guns, founder of Virzy Guns Production"
                                        fill
                                        sizes="(min-width: 1024px) 480px, 92vw"
                                        className="object-cover grayscale-[0.18]"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#030405]/85 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                                            Virzy Guns
                                        </p>
                                        <p className="mt-1 text-sm text-white/50">Founder and creative director of VGP.</p>
                                    </div>
                                </div>
                            </div>
                        </m.div>

                        <m.div
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <m.p variants={staggerChild} className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/50">
                                Founder Statement
                            </m.p>
                            <m.h2 variants={staggerChild} className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                                Art leads. Science sharpens the decision.
                            </m.h2>
                            <m.p variants={staggerChild} className="mt-6 text-base leading-8 text-white/60">
                                {founderStatement}
                            </m.p>
                            <m.p variants={staggerChild} className="mt-5 text-base leading-8 text-white/60">
                                {founderBio}
                            </m.p>
                            <m.p variants={staggerChild} className="mt-5 text-base leading-8 text-white/60">
                                His technical background in wave physics, signal processing, data science, psychoacoustics, and meteorology informs the method. The music still comes first.
                            </m.p>
                            <m.div variants={staggerChild} className="mt-7 flex flex-wrap gap-2">
                                {['Founder of VGP', 'VGP Studio', 'HealingWave Lab', 'CADENZ', 'Books + Education'].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/55"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </m.div>
                            <m.div variants={staggerChild} className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="https://www.linkedin.com/in/virzyguns/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sky-200/25 bg-sky-200/10 px-5 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-100/45 hover:bg-sky-200/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405]"
                                >
                                    Connect on LinkedIn
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                                <EditorialButton href="/studio/beats">Browse Beats</EditorialButton>
                            </m.div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="grid gap-4 md:grid-cols-3">
                        {pillars.map((pillar) => (
                            <m.article
                                key={pillar.label}
                                variants={revealUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="liquid-glass rounded-lg p-6"
                            >
                                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                    <pillar.Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/50">
                                    {pillar.label}
                                </p>
                                <h3 className="text-xl font-semibold text-white">{pillar.heading}</h3>
                                <p className="mt-4 text-sm leading-7 text-white/50">{pillar.body}</p>
                                <Link
                                    href={pillar.href}
                                    className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-sky-100/80 hover:text-white"
                                >
                                    Explore
                                    <Waves className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </m.article>
                        ))}
                    </div>
                </SectionShell>

                <SectionShell className="pb-24">
                    <div className="liquid-glass-strong rounded-lg p-6 text-center sm:p-8">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55">
                            Mission
                        </p>
                        <h2 className="mx-auto max-w-3xl font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                            Build music, tools, and education that respect the listener.
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/60">
                            VGP turns years of writing, producing, and technical study into records, tools, and practical knowledge for creators and listeners.
                        </p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <EditorialButton href="/studio/beats">Browse Beats</EditorialButton>
                            <EditorialButton href="/cadenz" variant="ghost">Preview CADENZ</EditorialButton>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
