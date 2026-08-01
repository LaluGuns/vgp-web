'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowRight, BookOpen, Headphones, Timer } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SocialDock } from '@/components/SocialDock';
import {
    CinematicBackdrop,
    EditorialButton,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { VGPBrandHeroMedia } from '@/components/editorial/VGPBrandHeroMedia';
import { FLOW_APP_URL, catalogCredentials, founderStatement } from '@/lib/vgp-ecosystem';
import { staggerChild, staggerParent } from '@/lib/motion-presets';
import { useNewsletter } from '@/components/context/NewsletterContext';

const visitorPaths = [
    {
        title: 'Make Music',
        description: 'Browse beats, licensing, custom production, mixing, and mastering.',
        cta: 'Browse Beats',
        href: '/studio/beats',
        Icon: Headphones,
    },
    {
        title: 'Focus or Move',
        description: 'Use Flow for deep work or preview CADENZ for running and cycling.',
        cta: 'Open Flow',
        href: FLOW_APP_URL,
        Icon: Timer,
    },
    {
        title: 'Learn Production',
        description: 'Read free articles, explore books, or view upcoming courses.',
        cta: 'Explore Learn Hub',
        href: '/learn',
        Icon: BookOpen,
    },
];

const featuredProducts = [
    {
        title: 'VGP Studio Beats',
        eyebrow: 'Commercial Music Catalog',
        href: '/studio/beats',
        cta: 'Browse & License Beats',
        status: 'Available Now',
        statusColor: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
        description: 'Premium beats across trap, drill, phonk, synthwave, R&B, club, pop, and more, with instant licensing, trackouts, and commercial rights.',
    },
    {
        title: 'Flow App',
        eyebrow: 'Deep Work Focus',
        href: FLOW_APP_URL,
        cta: 'Open Flow App',
        status: 'Available Now',
        statusColor: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
        description: 'A browser-based focus timer with original VGP audio, ambient sound, and honest session stats.',
    },
    {
        title: 'CADENZ',
        eyebrow: 'Movement Audio',
        href: '/cadenz',
        cta: 'Preview CADENZ',
        status: 'Coming Soon',
        statusColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
        description: 'A cadence music app connecting original VGP music with running and cycling rhythm.',
    },
];

export default function HomePage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <main className="editorial-shell relative min-h-screen overflow-hidden text-white">
                <SocialDock />

                {/* Section 1: Visitor-Centered Hero */}
                <section className="relative overflow-hidden bg-[#030405] px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
                    <CinematicBackdrop />

                    <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-2 sm:px-6 lg:min-h-[570px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 xl:px-0">
                        {/* LEFT CONTENT */}
                        <m.div
                            variants={staggerParent}
                            initial={false}
                            animate="visible"
                            className="relative z-20 min-w-0"
                        >
                            <m.p variants={staggerChild} className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/55">
                                100% Art. 100% Science.
                            </m.p>

                            <m.p variants={staggerChild} className="mb-4 text-xs font-bold tracking-[0.28em] text-sky-300">
                                VIRZY GUNS PRODUCTION
                            </m.p>

                            <m.h1
                                variants={staggerChild}
                                className="max-w-[580px] font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl lg:text-[4.2rem]"
                            >
                                <span className="block">Buy premium beats.</span>
                                <span className="block text-white/90">Focus better.</span>
                                <span className="block text-white/75">Learn music production.</span>
                            </m.h1>

                            <m.p variants={staggerChild} className="mt-6 max-w-[570px] text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                                Original beats across trap, drill, phonk, synthwave, R&amp;B, club, pop, and more, plus the Flow focus app and practical production resources by Virzy Guns.
                            </m.p>

                            <m.div variants={staggerChild} className="mt-8 flex flex-wrap items-center gap-3">
                                <EditorialButton href="/studio/beats">Browse Beats</EditorialButton>
                                <EditorialButton href={FLOW_APP_URL} variant="ghost">Open Flow</EditorialButton>
                            </m.div>
                        </m.div>

                        {/* RIGHT PRODUCT AREA */}
                        <div className="relative isolate min-w-0 w-full">
                            {/* Original hero artwork stays intact; CSS only controls its dissolve. */}
                            <div
                                className="pointer-events-none absolute right-[-5rem] top-1/2 z-0 h-[620px] w-[1100px] -translate-y-1/2 select-none opacity-40 blur-[0.35px] sm:right-[-7rem] sm:h-[700px] sm:w-[1240px]"
                                style={{
                                    maskImage: 'radial-gradient(ellipse at center, black 0%, black 52%, transparent 88%)',
                                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, black 52%, transparent 88%)',
                                }}
                            >
                                <Image
                                    src="/images/vgp-brand-hero-v2.png"
                                    alt=""
                                    fill
                                    priority
                                    sizes="1240px"
                                    className="object-contain"
                                    aria-hidden="true"
                                />
                            </div>

                    {/* PRODUCT CARDS - NORMAL DOCUMENT FLOW */}
                    <VGPBrandHeroMedia />
                        </div>
                    </div>
                </section>

                {/* Section 2: Choose What You Need */}
                <SectionShell id="choose" className="pt-6">
                    <div className="mb-8">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/60">
                            Navigation Pathways
                        </span>
                        <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                            Choose what you need.
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {visitorPaths.map((path) => {
                            const { Icon } = path;
                            return (
                                <Link
                                    key={path.title}
                                    href={path.href}
                                    className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-sky-200/30 hover:bg-white/[0.05]"
                                >
                                    <div>
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">{path.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-white/65">{path.description}</p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-sky-200 group-hover:text-white">
                                        <span>{path.cta}</span>
                                        <ArrowRight size={14} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </SectionShell>

                {/* Section 3: Current Featured Products */}
                <SectionShell id="featured" className="pt-8">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/60">
                                Featured Catalog
                            </span>
                            <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                                Products and tools.
                            </h2>
                        </div>
                        <p className="text-xs font-medium text-white/50">
                            Clearly separated by current availability.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {featuredProducts.map((prod) => (
                            <div
                                key={prod.title}
                                className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-white/20"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-sky-200/60">
                                            {prod.eyebrow}
                                        </span>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${prod.statusColor}`}>
                                            {prod.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-white">{prod.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-white/65">{prod.description}</p>
                                </div>
                                <div className="mt-8">
                                    <Link
                                        href={prod.href}
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-sky-200 transition hover:text-white"
                                    >
                                        <span>{prod.cta}</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionShell>

                {/* Section 4: Proof and Founder Credibility */}
                <SectionShell id="credentials" className="border-y border-white/[0.08] bg-white/[0.012] py-12 sm:py-14">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/60">
                                Verified Track Record
                            </span>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Credentials behind the work.
                            </h2>
                            <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
                                Virzy Guns is the founder shaping songs, beats, audio tools, and learning systems. Verified credits support the catalog.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                            {catalogCredentials.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group border-t border-white/[0.1] pt-4 transition hover:border-sky-200/40 focus:outline-none"
                                >
                                    <p className="text-2xl font-semibold leading-none text-white sm:text-3xl">{item.value}</p>
                                    <p className="mt-2 text-xs leading-5 text-white/65 transition group-hover:text-sky-100">{item.label}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                {/* Section 5: Latest Learning Content Preview */}
                <SectionShell id="learn-preview" className="pt-8">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/60">
                                Producer Education
                            </span>
                            <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                                Latest guides and articles.
                            </h2>
                        </div>
                        <Link href="/learn" className="text-xs font-semibold text-sky-200 hover:underline">
                            Explore full Learn Hub &rarr;
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-6">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Free Article</span>
                                <h3 className="mt-3 text-xl font-semibold text-white">Trap Beats: Anatomy of the Perfect 808</h3>
                                <p className="mt-3 text-sm leading-6 text-white/65">
                                    Learn what makes an 808 work as a melodic instrument, rhythmic driver, and the emotional foundation of a trap record.
                                </p>
                            </div>
                            <div className="mt-6">
                                <Link href="/blog/trap-beats-anatomy-of-the-perfect-808" className="text-xs font-semibold text-sky-200 hover:text-white">
                                    Read Article &rarr;
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-6">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">PDF Book · Coming Soon</span>
                                <h3 className="mt-3 text-xl font-semibold text-white">Music Production Guide: Trap Edition</h3>
                                <p className="mt-3 text-sm leading-6 text-white/65">
                                    80+ page practical guide for drums, 808s, vocals, mixing balance, and release mastering.
                                </p>
                            </div>
                            <div className="mt-6">
                                <Link href="/book" className="text-xs font-semibold text-sky-200 hover:text-white">
                                    View Book Details &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                {/* Section 6: Founder Context & Final CTA */}
                <SectionShell className="pb-20">
                    <div className="liquid-glass-strong grid gap-8 rounded-2xl p-6 sm:p-10 lg:grid-cols-[1fr_1fr]">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/60">
                                Founder Philosophy
                            </span>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Art leads; science makes the decisions sharper.
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-white/70">
                                {founderStatement}
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4">
                            <EditorialButton href="/studio/beats">Browse Beats & Studio</EditorialButton>
                            <EditorialButton onClick={openPopup} variant="ghost">Join Newsletter Updates</EditorialButton>
                        </div>
                    </div>
                </SectionShell>
            </main>
        </PageTransition>
    );
}
