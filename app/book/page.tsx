'use client';

/**
 * Guides / Book Landing Page  -  Apple Premium Dark
 * "Music Production Guide: Trap Edition"
 * Pre-order CTA + Book showcase
 */

import { m } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { Portal3DIcon } from '@/components/ui/Portal3DIcon';
import { useNewsletter } from '@/components/context/NewsletterContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const chapters = [
    { number: '01', title: 'The Trap Framework', desc: 'Structure, rhythm operating system, and the grid.' },
    { number: '02', title: 'The Low End', desc: '808 tuning, relationship with kick, sidechain, and translation.' },
    { number: '03', title: 'The Recording Session', desc: 'Microphone selection, distance, and fixing issues before mixing.' },
    { number: '04', title: 'Vocal Processing', desc: 'EQ moves, compression, saturation, de-essing, and spatial design.' },
    { number: '05', title: 'Mixing the Full Track', desc: 'Balance, pan, depth, stereo width, and reference tracks.' },
    { number: '06', title: 'Mastering for Streaming', desc: 'Loudness metering, peak levels, limiting, and final delivery.' },
];

const features = [
    { label: '80+ Pages', detail: 'Comprehensive coverage' },
    { label: 'PDF Format', detail: 'Read on any device' },
    { label: '6 Chapters', detail: 'Structured learning' },
    { label: 'Actionable', detail: 'Real-world examples' },
];

export default function GuidesPage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="bg-[#03040A] text-white min-h-screen">

                {/* â”€â”€â”€ HERO â”€â”€â”€ */}
                <section className="relative overflow-hidden px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
                    {/* Gradient orbs */}
                    <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(0,113,227,0.06)_0%,transparent_70%)] blur-[80px]" />
                    <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] bg-[radial-gradient(circle,rgba(255,60,172,0.05)_0%,transparent_70%)] blur-[80px]" />

                    <div className="relative mx-auto max-w-5xl">
                        {/* Background animated icon */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
                            <Portal3DIcon portalId="blog" color="#0071e3" size={480} />
                        </div>

                        <m.div
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_auto]"
                        >
                            {/* Left: Text */}
                            <div>
                                <m.p variants={fadeUp} className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                                    VGP Library
                                </m.p>
                                <m.h1 variants={fadeUp} className="mb-3 text-5xl font-bold leading-[1.03] tracking-tight text-white sm:text-6xl md:text-7xl">
                                    Music Production
                                    <br />
                                    <span className="text-white/35">Guide:</span>
                                    <br />
                                    <span className="text-white">Trap Edition</span>
                                </m.h1>
                                <m.p variants={fadeUp} className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/25">
                                    100% Art. 100% Science.
                                </m.p>
                                <m.p variants={fadeUp} className="mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
                                    The physics, math, and engineering behind professional trap music. 
                                    A practical guide for turning creative instinct into repeatable systems for drums, 808s, vocals, mixing, and mastering.
                                </m.p>
                                <m.p variants={fadeUp} className="mt-2 text-sm font-semibold text-white/40">
                                    By <span className="text-white/70">Virzy Guns</span>
                                </m.p>

                                {/* CTAs */}
                                <m.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                                    <button
                                        onClick={openPopup}
                                        className="rounded-full bg-white px-7 py-3 text-sm font-bold text-black transition hover:bg-white/90 active:scale-95"
                                    >
                                        Notify Me
                                    </button>
                                    <Link
                                        href="/blog"
                                        className="rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white transition hover:border-white/30"
                                    >
                                        Read Free Articles
                                    </Link>
                                </m.div>

                                {/* Social proof */}
                                <m.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-5">
                                    {features.map((f) => (
                                        <div key={f.label}>
                                            <p className="text-sm font-bold text-white">{f.label}</p>
                                            <p className="text-xs text-white/35">{f.detail}</p>
                                        </div>
                                    ))}
                                </m.div>
                            </div>

                            {/* Right: Book cover visual */}
                            <m.div
                                variants={fadeUp}
                                className="relative mt-8 lg:mt-0"
                            >
                                <div className="relative mx-auto max-w-[560px]">
                                    <div className="absolute inset-x-8 bottom-0 h-16 rounded-[50%] bg-[rgba(0,113,227,0.2)] blur-3xl" />
                                    <div className="relative z-10 mx-auto w-[280px] max-w-[82vw] overflow-hidden rounded-lg bg-neutral-950 shadow-[0_34px_90px_rgba(0,0,0,0.48)] ring-1 ring-white/10 sm:w-[min(76vw,420px)]">
                                        <Image
                                            src="/ebooks/trap-guide-book-cover.jpg"
                                            alt="Music Production Guide: Trap Edition book cover"
                                            width={815}
                                            height={1058}
                                            priority
                                            sizes="(max-width: 640px) 280px, (min-width: 1024px) 420px, 76vw"
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>
                            </m.div>
                        </m.div>
                    </div>
                </section>

                {/* â”€â”€â”€ CHAPTERS â”€â”€â”€ */}
                <section className="bg-white/[0.02] border-y border-white/[0.05] px-4 py-16 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <m.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                        >
                            <m.p variants={fadeUp} className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                                Table of Contents
                            </m.p>
                            <m.h2 variants={fadeUp} className="mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                What&apos;s Inside
                            </m.h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {chapters.map((ch) => (
                                    <m.div
                                        key={ch.number}
                                        variants={fadeUp}
                                        className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                                    >
                                        <p className="mb-3 text-2xl font-black text-white/10">{ch.number}</p>
                                        <h3 className="mb-2 text-sm font-bold leading-snug text-white">{ch.title}</h3>
                                        <p className="text-xs leading-relaxed text-white/40">{ch.desc}</p>
                                    </m.div>
                                ))}
                            </div>
                        </m.div>
                    </div>
                </section>

                {/* â”€â”€â”€ PRE-ORDER CTA â”€â”€â”€ */}
                <section className="px-4 py-20 text-center sm:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-lg"
                    >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                            Pricing
                        </p>
                        <div className="mb-2 flex items-baseline justify-center gap-3">
                            <span className="text-4xl font-black text-white">TBA</span>
                        </div>
                        <p className="mb-8 text-sm text-white/40">
                            Coming soon. Get notified on launch day.
                        </p>
                        <button
                            onClick={openPopup}
                            className="w-full max-w-xs rounded-full bg-white py-4 text-sm font-bold text-black transition hover:bg-white/90 active:scale-95 sm:w-auto sm:px-10"
                        >
                            Notify Me
                        </button>
                        <p className="mt-4 text-xs text-white/25">
                            No payment now. Just your email.
                        </p>
                    </m.div>
                </section>

            </article>
        </PageTransition>
    );
}
