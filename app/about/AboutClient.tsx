'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { Portal3DIcon } from '@/components/ui/Portal3DIcon';
import { StatCounter } from '@/components/ui/UseCounter';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const credentials = ['BMI Songwriter', 'Sony Music Publishing', 'BeatStars Verified'];

const pillars = [
    {
        label: 'The Work',
        heading: 'Premium beats. Serious craft.',
        body: 'Exclusive instrumentals across Trap, Cyberphonk, Synthwave, R&B, Club, Drill, and Deep House - built for artists who demand more than average.',
        color: '#FF3CAC',
    },
    {
        label: 'The Science',
        heading: 'Audio engineered for the brain.',
        body: 'Holding a BSc in Meteorology & Geophysics, I apply wave physics and psychoacoustics to design sound that does more than sound good.',
        color: '#00D4FF',
    },
    {
        label: 'The Vision',
        heading: 'The future of audio is functional.',
        body: 'HealingWave is a functional audio ecosystem for focus, performance, and recovery - backed by science, not intuition.',
        color: '#00FFA3',
    },
];

export default function AboutClient() {
    return (
        <PageTransition>
            <article>
                {/* ─── HERO ─── */}
                <section className="relative overflow-hidden px-4 py-24 text-center sm:px-6 sm:py-32">
                    {/* Gradient orbs */}
                    <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.05)_0%,transparent_70%)] blur-[80px]" />
                    <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] bg-[radial-gradient(circle,rgba(180,74,255,0.04)_0%,transparent_70%)] blur-[80px]" />

                    <div className="relative mx-auto max-w-4xl">
                        {/* Background animated icon */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                            <Portal3DIcon portalId="about" color="#00D4FF" size={400} />
                        </div>

                        <m.div
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10"
                        >
                            <m.p
                                variants={fadeUp}
                                className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/40"
                            >
                                Virzy Guns Production
                            </m.p>
                            <m.h1
                                variants={fadeUp}
                                className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
                            >
                                100% Art.
                                <br />
                                <span className="text-white/35">100% Science.</span>
                            </m.h1>
                            <m.p
                                variants={fadeUp}
                                className="mx-auto max-w-xl text-base leading-relaxed text-white/50 sm:text-lg"
                            >
                                Music producer, beatmaker, and audio technologist building at the intersection of
                                sound and science.
                            </m.p>
                            <m.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/studio/beats"
                                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                                >
                                    Browse Beats
                                </Link>
                                <Link
                                    href="https://www.linkedin.com/in/virzyguns/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/30"
                                >
                                    Connect
                                </Link>
                            </m.div>
                        </m.div>
                    </div>
                </section>

                {/* ─── FOUNDER CARD ─── */}
                <section className="px-4 py-16 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <m.div
                            className="grid items-center gap-12 lg:grid-cols-2"
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <m.div variants={fadeUp} className="order-2 lg:order-1">
                                <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-3xl border border-white/[0.06] group">
                                    <Image
                                        src="/images/founder.jpg"
                                        alt="Virzy Guns - Music Producer"
                                        fill
                                        sizes="(min-width: 1024px) 384px, 90vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        priority
                                    />
                                    {/* Scan line */}
                                    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div
                                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent"
                                            style={{ animation: 'scan-line 3s ease-in-out infinite' }}
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#03040A]/80 to-transparent p-5">
                                        <p className="text-xs font-semibold tracking-widest text-white/60 uppercase">Virzy Guns</p>
                                        <p className="text-[10px] text-white/30 tracking-wider uppercase mt-0.5">Founder & Producer</p>
                                    </div>
                                </div>
                            </m.div>

                            <m.div variants={fadeUp} className="order-1 lg:order-2">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Background</p>
                                <h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                                    Science-first thinking.<br />
                                    <span className="text-white/40">Applied to music.</span>
                                </h2>
                                <p className="mb-5 text-base leading-relaxed text-white/55">
                                    Sound is not just art - it is a biological signal. I founded VGP with a singular thesis:
                                    in an era of cognitive overload, audio must evolve from passive entertainment into a
                                    functional tool for mental performance and well-being.
                                </p>
                                <p className="mb-6 text-base leading-relaxed text-white/55">
                                    My work sits at the intersection of{' '}
                                    <span className="text-[#00D4FF]">Signal Processing</span>,{' '}
                                    <span className="text-[#00D4FF]">Data Science</span>, and{' '}
                                    <span className="text-[#00D4FF]">Psychoacoustics</span> - with a BSc in Meteorology & Geophysics
                                    as the scientific backbone.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {credentials.map((c) => (
                                        <span
                                            key={c}
                                            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/50"
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </m.div>
                        </m.div>
                    </div>
                </section>

                {/* ─── THREE PILLARS ─── */}
                <section className="bg-white/[0.02] px-4 py-16 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <m.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid gap-5 sm:grid-cols-3"
                        >
                            {pillars.map((p) => (
                                <m.div
                                    key={p.label}
                                    variants={fadeUp}
                                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 transition hover:border-white/[0.12]"
                                >
                                    <div
                                        className="mb-4 h-1 w-8 rounded-full"
                                        style={{ background: p.color }}
                                    />
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/35">
                                        {p.label}
                                    </p>
                                    <h3 className="mb-3 text-lg font-semibold leading-snug text-white">
                                        {p.heading}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/50">{p.body}</p>
                                </m.div>
                            ))}
                        </m.div>
                    </div>
                </section>

                {/* ─── STATS ─── */}
                <section className="px-4 py-16 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <m.div
                            className="grid grid-cols-3 gap-4"
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {[
                                { value: 10, suffix: '%', label: 'Top Songwriter', color: '#00D4FF' },
                                { value: 25, suffix: '%', label: 'Top Producer', color: '#B44AFF' },
                                { value: 2026, suffix: '', label: 'HealingWave Launch', color: '#00FFA3' },
                            ].map((stat) => (
                                <m.div
                                    key={stat.label}
                                    variants={fadeUp}
                                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center"
                                >
                                    <div
                                        className="mb-1 text-3xl font-black"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.label.includes('Launch') ? (
                                            <StatCounter end={stat.value} />
                                        ) : (
                                            <>Top <StatCounter end={stat.value} />{stat.suffix}</>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                                        {stat.label}
                                    </p>
                                </m.div>
                            ))}
                        </m.div>
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section className="border-t border-white/[0.05] px-4 py-16 text-center sm:px-6">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-xl"
                    >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                            Global Vision
                        </p>
                        <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                            The future of health<br />
                            <span className="text-white/35">is non-invasive.</span>
                        </h2>
                        <p className="mb-8 text-base leading-relaxed text-white/50">
                            Conducting advanced R&D in functional audio. Join the movement.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/lab/healingwave"
                                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                            >
                                Explore HealingWave
                            </Link>
                            <Link
                                href="/studio/beats"
                                className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/30"
                            >
                                Browse Beats
                            </Link>
                        </div>
                    </m.div>
                </section>
            </article>
        </PageTransition>
    );
}
