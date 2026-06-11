'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { Activity, AudioLines, Clock, Focus, Timer } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    EditorialButton,
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import { healingWaveModules } from '@/lib/vgp-ecosystem';
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
                    mutedTitle="for focus and movement."
                    description="HealingWave Lab by Virzy Guns builds functional audio concepts for focus, recovery, running cadence, cycling cadence, and calm listening."
                    primary={{ label: 'Preview CADENZ', href: '/cadenz' }}
                    secondary={{ label: 'Join Updates', onClick: openPopup }}
                />

                <SectionShell className="pt-4">
                    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass-strong rounded-lg p-6 sm:p-8"
                        >
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55">
                                Lab Thesis
                            </p>
                            <h2 className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                                Sound with purpose, handled carefully.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-white/60">
                                HealingWave is a VGP lab for focus music, recovery listening, cadence music, meditation, and study sessions. It keeps the language careful and does not overpromise what sound can do.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <EditorialButton href="/cadenz">Explore CADENZ</EditorialButton>
                                <EditorialButton href="/about" variant="ghost">About VGP</EditorialButton>
                            </div>
                        </m.div>

                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass overflow-hidden rounded-lg"
                        >
                            <div className="relative min-h-[24rem]">
                                <Image
                                    src="/images/CADENZ_POSTER.jpg"
                                    alt="CADENZ by HealingWave Lab visual preview"
                                    fill
                                    sizes="(min-width: 1024px) 620px, 92vw"
                                    className="object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#030405] via-[#030405]/35 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70">
                                        First HealingWave Product
                                    </p>
                                    <h3 className="mt-3 text-2xl font-semibold text-white">CADENZ is coming soon.</h3>
                                    <p className="mt-2 text-sm leading-6 text-white/60">
                                        UI built. Backend in progress.
                                    </p>
                                </div>
                            </div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="mb-10 max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/50">
                            Modules
                        </p>
                        <h2 className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                            The lab is organized around real listening use cases.
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
                                    className="liquid-glass flex h-full flex-col rounded-lg p-6"
                                >
                                    <div className="mb-8 flex items-start justify-between gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                                            {module.status}
                                        </span>
                                    </div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/50">
                                        {module.platform}
                                    </p>
                                    <h3 className="text-xl font-semibold text-white">{module.name}</h3>
                                    <p className="mt-4 text-sm leading-7 text-white/50">{module.description}</p>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {module.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-auto border-t border-white/[0.08] pt-5">
                                        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                                            <span>Progress</span>
                                            <span>{module.progress}%</span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                                            <m.div
                                                className="h-full rounded-full bg-gradient-to-r from-sky-200 to-blue-400"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${module.progress}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>
                                        <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/50">
                                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                            {module.eta}
                                        </p>
                                    </div>
                                </m.article>
                            );
                        })}
                    </m.div>
                </SectionShell>

                <SectionShell className="pb-24">
                    <div className="liquid-glass-strong rounded-lg p-6 text-center sm:p-8">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/50">
                            Stay Updated
                        </p>
                        <h2 className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                            Follow the first HealingWave release.
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/60">
                            Join VGP updates for CADENZ progress, lab notes, and release information when it is ready.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <EditorialButton onClick={openPopup}>Join Updates</EditorialButton>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
