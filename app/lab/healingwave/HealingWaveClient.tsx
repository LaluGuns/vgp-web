'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Activity, AudioLines, Focus, Timer } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    EditorialButton,
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import { FLOW_APP_URL, healingWaveModules } from '@/lib/vgp-ecosystem';
import { revealUp, staggerParent, staggerChild } from '@/lib/motion-presets';

const iconMap = [Focus, Timer, Activity];

export default function HealingWaveClient() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    eyebrow="HealingWave Lab"
                    title="Functional audio"
                    mutedTitle="research and product studio."
                    description="HealingWave Lab is the parent research studio by Virzy Guns developing functional audio for focus, cadence, and recovery."
                    primary={{ label: 'Open Flow App', href: FLOW_APP_URL }}
                    secondary={{ label: 'Preview CADENZ', href: '/cadenz' }}
                />

                <SectionShell className="pt-4">
                    <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass-strong rounded-xl p-6 sm:p-8"
                        >
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                                Lab Direction
                            </span>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Sound with purpose, handled carefully.
                            </h2>
                            <p className="mt-5 text-base leading-7 text-white/75">
                                HealingWave Lab connects functional audio theory with software. We develop Flow for browser-based deep work, CADENZ for cadence motion, and study how music shapes repeatable listening sessions.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <EditorialButton href={FLOW_APP_URL}>Open Flow App</EditorialButton>
                                <EditorialButton href="/cadenz" variant="ghost">Preview CADENZ</EditorialButton>
                            </div>
                        </m.div>

                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass mx-auto w-full max-w-[28rem] overflow-hidden rounded-xl lg:mr-0 border border-white/10"
                        >
                            <div className="relative aspect-[575/1024] bg-[#02070c]">
                                <Image
                                    src="/images/CADENZ_POSTER.jpg"
                                    alt="CADENZ by HealingWave Lab visual preview"
                                    fill
                                    sizes="(min-width: 1024px) 448px, 88vw"
                                    className="object-contain"
                                />
                            </div>
                            <div className="border-t border-white/10 p-6">
                                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                                    Cadence Product Direction
                                </span>
                                <h3 className="mt-3 text-2xl font-semibold text-white">CADENZ is coming soon.</h3>
                                <p className="mt-3 text-sm leading-6 text-white/70">
                                    Tempo-matched original VGP music for runners and cyclists.
                                </p>
                            </div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="mb-8 max-w-3xl">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                            Functional Audio Products
                        </span>
                        <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                            Live products and research concepts.
                        </h2>
                    </div>

                    <m.div
                        className="grid gap-4 lg:grid-cols-3"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {healingWaveModules.map((module, index) => {
                            const Icon = iconMap[index] ?? AudioLines;
                            return (
                                <m.article
                                    key={module.name}
                                    variants={staggerChild}
                                    className="liquid-glass flex h-full flex-col justify-between rounded-xl border border-white/10 p-6"
                                >
                                    <div>
                                        <div className="mb-6 flex items-start justify-between gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                                <Icon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                                module.availability === 'Available now'
                                                    ? 'bg-sky-400/20 text-sky-200'
                                                    : module.availability === 'Coming soon'
                                                        ? 'bg-amber-400/20 text-amber-200'
                                                        : 'bg-white/10 text-white/60'
                                            }`}>
                                                {module.availability}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/60">
                                            {module.platform}
                                        </span>
                                        <h3 className="mt-1 text-xl font-semibold text-white">{module.name}</h3>
                                        <p className="mt-3 text-sm leading-6 text-white/70">{module.description}</p>
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {module.features.map((feature) => (
                                                <span
                                                    key={feature}
                                                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-8 border-t border-white/[0.08] pt-5">
                                        <Link
                                            href={module.href}
                                            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-200 hover:text-white"
                                        >
                                            <span>Open {module.name}</span>
                                            <Activity size={14} />
                                        </Link>
                                    </div>
                                </m.article>
                            );
                        })}
                    </m.div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
