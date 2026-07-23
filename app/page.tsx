'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { BookOpen, Focus, Headphones, Timer } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SocialDock } from '@/components/SocialDock';
import {
    CinematicBackdrop,
    EcosystemCard,
    EditorialButton,
    FeatureStrip,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { VGPBrandHeroMedia } from '@/components/editorial/VGPBrandHeroMedia';
import { catalogCredentials, ecosystemCards, founderStatement } from '@/lib/vgp-ecosystem';
import { revealUp, staggerParent, staggerChild } from '@/lib/motion-presets';
import { useNewsletter } from '@/components/context/NewsletterContext';

const quickSignals = [
    { label: 'Studio', value: 'Beats and audio services', href: '/studio/beats', Icon: Headphones },
    { label: 'Flow', value: 'Deep-work timer and music', href: '/flow', Icon: Focus },
    { label: 'CADENZ', value: 'Coming-soon cadence app', href: '/cadenz', Icon: Timer },
    { label: 'Library', value: 'Books, blog, and masterclass', href: '/book', Icon: BookOpen },
];

export default function HomePage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <main className="editorial-shell relative min-h-screen overflow-hidden text-white">
                <SocialDock />

                <section className="relative min-h-[680px] overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:min-h-[760px] lg:pb-12 lg:pt-32">
                    <CinematicBackdrop />
                    <VGPBrandHeroMedia placement="heroBackground" />

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <m.div
                            variants={staggerParent}
                            initial="hidden"
                            animate="visible"
                            className="max-w-[43rem]"
                        >


                            <m.p variants={staggerChild} className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/60">
                                Founded by Virzy Guns
                            </m.p>
                            <m.h1
                                variants={staggerChild}
                                className="font-display text-5xl font-semibold leading-[0.98] text-white sm:text-6xl md:text-7xl lg:text-[5.65rem]"
                            >
                                <span className="block sm:whitespace-nowrap">100% Art.</span>
                                <span className="block bg-gradient-to-r from-white/40 via-sky-200/80 to-white/40 bg-clip-text text-transparent sm:whitespace-nowrap">
                                    100% Science.
                                </span>
                            </m.h1>
                            <m.p variants={staggerChild} className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-xl sm:leading-9">
                                A founder-led music and technology ecosystem spanning VGP Studio, HealingWave Lab, CADENZ, books, and producer education.
                            </m.p>
                            <m.div variants={staggerChild} className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <EditorialButton href="/studio/beats">Explore Studio</EditorialButton>
                                <EditorialButton href="/lab/healingwave" variant="ghost">Enter The Lab</EditorialButton>
                            </m.div>

                            <m.div variants={staggerChild} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {quickSignals.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="liquid-glass-soft group rounded-lg p-4 transition hover:border-sky-200/25 hover:bg-white/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                                    >
                                        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-sky-100">
                                            <item.Icon className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm font-semibold text-white">{item.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-white/50">{item.value}</p>
                                    </Link>
                                ))}
                            </m.div>


                        </m.div>
                    </div>
                </section>

                <SectionShell id="ecosystem" className="pt-8">
                    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/50">
                                The Ecosystem
                            </p>
                            <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-white sm:text-6xl">
                                One studio, one lab, one learning system.
                            </h2>
                        </div>
                        <p className="max-w-md text-sm leading-7 text-white/50">
                            Songs, beats, audio tools, and producer education from one studio system.
                        </p>
                    </div>

                    <m.div
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {ecosystemCards.map((card, index) => (
                            <EcosystemCard key={card.title} {...card} index={index} />
                        ))}
                    </m.div>
                </SectionShell>

                <SectionShell>
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-stretch">
                        <FeatureStrip
                            label="Featured Product"
                            title="CADENZ is the first product under HealingWave Lab."
                            description="A cadence music app that connects original music with running and cycling rhythm. Built for movement, focus, and a more intentional training flow."
                            href="/cadenz"
                            cta="Preview CADENZ"
                        />

                        <m.div
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="h-full overflow-hidden rounded-lg border border-white/[0.1] bg-white/[0.035]"
                        >
                            <div className="relative h-full min-h-[23rem]">
                                <Image
                                    src="/images/CADENZ_POSTER.jpg"
                                    alt="CADENZ by HealingWave Lab poster"
                                    fill
                                    sizes="(min-width: 1024px) 520px, 92vw"
                                    className="object-contain object-center opacity-[0.9]"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,4,5,0.06)_0%,rgba(3,4,5,0.28)_45%,rgba(3,4,5,0.86)_100%)]" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/70">
                                        Coming Soon
                                    </p>
                                    <h3 className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">Adaptive music for motion.</h3>
                                </div>
                            </div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell id="credentials" className="border-y border-white/[0.08] bg-white/[0.012] py-12 sm:py-14">
                    <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55">
                                Track record
                            </p>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Credentials behind the ecosystem.
                            </h2>
                            <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
                                The founder story comes first. These verified credits are the production foundation beneath it.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                            {catalogCredentials.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group border-t border-white/[0.1] pt-4 transition hover:border-sky-200/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                                >
                                    <p className="text-2xl font-semibold leading-none text-white sm:text-3xl">{item.value}</p>
                                    <p className="mt-2 text-xs leading-5 text-white/55 transition group-hover:text-sky-100">{item.label}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                <SectionShell className="pb-24">
                    <div className="liquid-glass-strong grid gap-8 rounded-lg p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
                        <div>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55">
                                Founder Philosophy
                            </p>
                            <h2 className="font-display text-4xl font-semibold leading-[1.02] text-white sm:text-5xl">
                                100% Art.
                                <br />
                                <span className="bg-gradient-to-r from-white/40 via-sky-200/80 to-white/40 bg-clip-text text-transparent">100% Science.</span>
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg leading-9 text-white/60">{founderStatement}</p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <EditorialButton href="/about">Read About VGP</EditorialButton>
                                <EditorialButton onClick={openPopup} variant="ghost">Join Updates</EditorialButton>
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </main>
        </PageTransition>
    );
}
