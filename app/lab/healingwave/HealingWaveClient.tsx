'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { Activity, AudioLines, Focus, Timer } from 'lucide-react';
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
                    <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="liquid-glass-strong rounded-lg p-6 sm:p-8"
                        >
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/75">
                                Lab Thesis
                            </p>
                            <h2 className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                                Sound with purpose, handled carefully.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-white/75">
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
                            className="liquid-glass mx-auto w-full max-w-[28rem] overflow-hidden rounded-lg lg:mr-0"
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
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/75">
                                    First HealingWave product
                                </p>
                                <h3 className="mt-3 text-2xl font-semibold text-white">CADENZ is coming soon.</h3>
                                <p className="mt-3 text-sm leading-7 text-white/70">
                                    Cadence-first original music for running and cycling.
                                </p>
                            </div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell>
                    <div className="mb-10 max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                            Listening experiences
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
                                        <span className="text-xs font-semibold tabular-nums text-white/55">0{index + 1}</span>
                                    </div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">
                                        {module.platform}
                                    </p>
                                    {module.availability && (
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/80">
                                            {module.availability}
                                        </p>
                                    )}
                                    <h3 className="text-xl font-semibold text-white">{module.name}</h3>
                                    <p className="mt-4 text-sm leading-7 text-white/70">{module.description}</p>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {module.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-auto border-t border-white/[0.08] pt-5">
                                        <p className="text-sm leading-7 text-white/70">{module.note}</p>
                                    </div>
                                </m.article>
                            );
                        })}
                    </m.div>
                </SectionShell>

                <SectionShell className="pb-24">
                    <div className="liquid-glass-strong rounded-lg p-6 text-center sm:p-8">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                            Stay Updated
                        </p>
                        <h2 className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-5xl">
                            Follow the first HealingWave release.
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75">
                            Join VGP updates for CADENZ news, HealingWave notes, and release information when it is ready.
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
