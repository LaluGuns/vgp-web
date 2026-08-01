'use client';

/**
 * Producer Library & Book Index Page
 */

import { m } from 'framer-motion';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { CinematicBackdrop, EditorialButton } from '@/components/editorial/EditorialPrimitives';
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

const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Music Production Guide: Trap Edition',
    url: 'https://www.virzyguns.com/book',
    image: 'https://www.virzyguns.com/ebooks/trap-guide-book-cover.jpg',
    description:
        'A practical PDF guide for producers covering trap drums, 808s, vocals, mixing, mastering, and release decisions.',
    author: {
        '@type': 'Person',
        name: 'Virzy Guns',
        url: 'https://www.virzyguns.com/about',
    },
    bookFormat: 'EBook',
    inLanguage: 'en',
};

export default function GuidesPage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
                />
                {/* Hero */}
                <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28">
                    <CinematicBackdrop />

                    <div className="relative mx-auto max-w-5xl">
                        <m.div
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_auto]"
                        >
                            {/* Left Column: Details */}
                            <div>
                                <m.div variants={fadeUp} className="flex items-center gap-3">
                                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/70">
                                        VGP Producer Library
                                    </span>
                                    <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-sky-200 ring-1 ring-sky-400/30">
                                        PDF Book · Coming Soon
                                    </span>
                                </m.div>

                                <m.h1 variants={fadeUp} className="mt-4 font-display text-4xl font-semibold leading-[1.05] text-white sm:text-6xl md:text-7xl">
                                    Music Production Guide: Trap Edition
                                </m.h1>

                                <m.p variants={fadeUp} className="mt-5 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
                                    A practical guide for turning creative instinct into repeatable decisions for drums, 808s, vocals, mixing, and mastering.
                                </m.p>

                                <m.p variants={fadeUp} className="mt-3 text-sm font-semibold text-white/60">
                                    By <span className="text-white">Virzy Guns</span>
                                </m.p>

                                {/* CTAs */}
                                <m.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                                    <EditorialButton onClick={openPopup}>Notify Me</EditorialButton>
                                    <EditorialButton href="/blog" variant="ghost">Read Free Articles</EditorialButton>
                                </m.div>

                                {/* Social Proof Features */}
                                <m.div variants={fadeUp} className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                                    {features.map((f) => (
                                        <div key={f.label}>
                                            <p className="text-sm font-bold text-white">{f.label}</p>
                                            <p className="text-xs text-white/55">{f.detail}</p>
                                        </div>
                                    ))}
                                </m.div>
                            </div>

                            {/* Right Column: Book Cover Visual (Single Column Centered on Mobile) */}
                            <m.div
                                variants={fadeUp}
                                className="relative mx-auto mt-4 w-full max-w-[280px] lg:mt-0 lg:max-w-none"
                            >
                                <div className="relative mx-auto max-w-[560px]">
                                    <div className="absolute inset-x-8 bottom-0 h-16 rounded-[50%] bg-sky-400/20 blur-3xl" />
                                    <div className="relative z-10 mx-auto w-[260px] max-w-[82vw] overflow-hidden rounded-xl bg-neutral-950 shadow-2xl ring-1 ring-white/10 sm:w-[320px]">
                                        <Image
                                            src="/ebooks/trap-guide-book-cover.jpg"
                                            alt="Music Production Guide: Trap Edition book cover"
                                            width={815}
                                            height={1058}
                                            priority
                                            sizes="(max-width: 640px) 260px, 320px"
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>
                            </m.div>
                        </m.div>
                    </div>
                </section>

                {/* Chapters */}
                <section className="border-y border-white/[0.06] bg-white/[0.018] px-4 py-16 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <m.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                        >
                            <m.p variants={fadeUp} className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/65">
                                Syllabus Breakdown
                            </m.p>
                            <m.h2 variants={fadeUp} className="mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Table of Contents
                            </m.h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {chapters.map((ch) => (
                                    <m.div
                                        key={ch.number}
                                        variants={fadeUp}
                                        className="rounded-lg border border-white/[0.09] bg-white/[0.03] p-6 transition hover:border-sky-200/25 hover:bg-white/[0.045]"
                                    >
                                        <p className="mb-3 text-2xl font-black text-white/10">{ch.number}</p>
                                        <h3 className="mb-2 text-sm font-bold leading-snug text-white">{ch.title}</h3>
                                        <p className="text-xs leading-6 text-white/65">{ch.desc}</p>
                                    </m.div>
                                ))}
                            </div>
                        </m.div>
                    </div>
                </section>

                {/* Pre-order / Availability CTA */}
                <section className="px-4 py-16 text-center sm:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-lg"
                    >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/65">
                            Pre-Order & Access
                        </p>
                        <div className="mb-2 flex items-baseline justify-center gap-3">
                            <span className="text-4xl font-black text-white">TBA</span>
                        </div>
                        <p className="mb-8 text-sm text-white/65">
                            Format: PDF eBook. Coming soon to the VGP Producer Library.
                        </p>
                        <EditorialButton onClick={openPopup}>Notify Me On Launch</EditorialButton>
                    </m.div>
                </section>
            </article>
        </PageTransition>
    );
}
