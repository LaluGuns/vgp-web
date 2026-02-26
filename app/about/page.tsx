'use client';

/**
 * About Page — Founder Dossier
 * Y3K Chrome aesthetic with gradient orb hero,
 * ambient grid, and enhanced card styling.
 */

import { m } from 'framer-motion';
import { Portal3DIcon } from '@/components/ui/Portal3DIcon';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { staggerParent, staggerChild, revealUp } from '@/lib/motion-presets';
import { StatCounter } from '@/components/ui/UseCounter';

export default function AboutPage() {
    return (
        <PageTransition>
            <article className="relative">

                {/* ═══════════════════════════════════════════
                    HERO SECTION
                   ═══════════════════════════════════════════ */}
                <section className="relative py-24 sm:py-32 px-6 text-center overflow-hidden">
                    {/* Gradient orbs */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.06)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(180,74,255,0.05)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

                    {/* Ambient grid */}
                    <div
                        className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(200,204,212,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(200,204,212,0.3) 1px, transparent 1px)
                            `,
                            backgroundSize: '80px 80px',
                        }}
                    />

                    <div className="max-w-4xl mx-auto relative">
                        {/* Immersive Background Icon */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-25">
                            <Portal3DIcon portalId="about" color="#00D4FF" size={350} />
                        </div>

                        <m.header
                            variants={staggerParent}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10"
                        >
                            <m.p className="font-mono text-[0.55rem] tracking-[0.4em] text-[#00D4FF]/60 mb-5 uppercase" variants={staggerChild}>
                                DOSSIER
                            </m.p>
                            <m.h1
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.06em] leading-[0.9] mb-6"
                                variants={staggerChild}
                            >
                                <span className="titanium-text font-bold tracking-tight">Professional Music</span>
                                <br />
                                <span className="text-white/40">Producer & Beatmaker</span>
                            </m.h1>
                        </m.header>
                    </div>
                </section>

                {/* ═══ FOUNDER SECTION ═══ */}
                <section className="py-16 px-6">
                    <div className="max-w-5xl mx-auto">
                        <m.div
                            className="grid lg:grid-cols-2 gap-12 items-center"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {/* Photo */}
                            <m.div variants={staggerChild} className="order-2 lg:order-1">
                                <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/[0.05] group">
                                    <Image
                                        src="/images/founder.jpg"
                                        alt="Virzy Guns"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        priority
                                    />
                                    {/* Scan line on hover */}
                                    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div
                                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent"
                                            style={{ animation: 'scan-line 3s ease-in-out infinite', top: '0%' }}
                                        />
                                    </div>
                                    {/* Bottom overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#03040A] via-[#03040A]/60 to-transparent">
                                        <p className="font-mono text-[0.55rem] tracking-[0.3em] text-[#00D4FF]">SUBJECT: VIRZY GUNS</p>
                                        <p className="font-mono text-[0.5rem] tracking-[0.2em] text-[#3A3E48]">STATUS: ACTIVE</p>
                                    </div>
                                </div>
                            </m.div>

                            {/* Intro */}
                            <m.div variants={staggerChild} className="order-1 lg:order-2">
                                <p className="text-2xl sm:text-3xl text-white/90 leading-snug mb-6 font-light tracking-[-0.03em]">
                                    Sound is not just art.<br />
                                    <span className="text-white/50">It is a biological signal.</span>
                                </p>
                                <p className="text-[#6B7080] leading-relaxed text-base">
                                    I founded VGP with a singular thesis. In an era of cognitive overload,
                                    audio must evolve from passive entertainment into a functional tool for
                                    mental performance and well being. My work lies at the intersection of
                                    <span className="text-[#00D4FF]"> Signal Processing</span>,
                                    <span className="text-[#00D4FF]"> Data Science</span>, and
                                    <span className="text-[#00D4FF]"> Psychoacoustics</span>.
                                </p>
                            </m.div>
                        </m.div>
                    </div>
                </section>

                {/* ═══ CARDS GRID ═══ */}
                <section className="py-16 px-6 bg-[#0C0E14]/50">
                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* What We Do */}
                        <m.div variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <GlassCard padding="lg" hover={false}>
                                <h2 className="text-xl font-semibold mb-4 tracking-[-0.04em]">What We Do</h2>
                                <p className="text-[#BFC3C9] leading-relaxed">
                                    Creating premium beats for sale and next-generation functional audio technology.
                                    Our beatstore offers exclusive Trap, Cyberphonk, Synthwave, R&B, Synthpop, Club, Deep House, and Drill instrumentals
                                    for artists, content creators, and commercial projects. We also develop audio environments
                                    that support focus, rest, and emotional regulation, backed by data, not just intuition.
                                </p>
                            </GlassCard>
                        </m.div>

                        {/* Scientific Foundation */}
                        <m.div variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <GlassCard padding="lg" hover={false} glow="cyan">
                                <p className="font-mono text-[0.55rem] tracking-[0.3em] text-[#00D4FF]/60 mb-3 uppercase">BACKGROUND</p>
                                <h2 className="text-xl font-semibold mb-4 tracking-[-0.04em]">Scientific Foundation</h2>
                                <p className="text-[#BFC3C9] leading-relaxed">
                                    Holding a <span className="text-white">Bachelor of Science in Meteorology and Geophysics</span>,
                                    I approach audio engineering with a rigorous scientific lens. I translate the
                                    principles of Wave Physics and Complex Signal Analysis into the realm of
                                    Neuro Acoustics and functional audio design.
                                </p>
                            </GlassCard>
                        </m.div>

                        {/* Industry Validation */}
                        <m.div variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <GlassCard padding="lg" hover={false}>
                                <p className="font-mono text-[0.55rem] tracking-[0.3em] text-[#565B66] mb-3 uppercase">CREDENTIALS</p>
                                <h2 className="text-xl font-semibold mb-4 tracking-[-0.04em]">Industry Validation</h2>
                                <p className="text-[#BFC3C9] leading-relaxed mb-5">
                                    Affiliated Songwriter and Composer with <span className="text-white">BMI</span> and
                                    <span className="text-white"> Sony Music Publishing</span>. Ranking in the
                                    <span className="text-[#00D4FF]"> Top 10% of Songwriters</span> and
                                    <span className="text-[#00D4FF]"> Top 25% of Producers</span> on Beatstars.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['BMI', 'Sony Music Publishing', 'Beatstars Verified'].map((badge) => (
                                        <span key={badge} className="font-mono text-[0.55rem] tracking-[0.2em] bg-white/[0.04] px-3 py-1.5 rounded-full text-[#565B66] border border-white/[0.05]">
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>
                        </m.div>

                        {/* Vision */}
                        <m.div variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <GlassCard padding="lg" hover={false}>
                                <h2 className="text-xl font-semibold mb-4 tracking-[-0.04em]">Global Vision</h2>
                                <p className="text-[#BFC3C9] leading-relaxed mb-6">
                                    Currently conducting advanced research and development in functional audio technology.
                                    I believe the future of health is non invasive, and the future of music is functional.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <GlowButton variant="primary" href="https://www.linkedin.com/in/virzyguns/">
                                        Connect
                                    </GlowButton>
                                    <GlowButton variant="ghost" href="/studio/beats">
                                        Explore Beats
                                    </GlowButton>
                                </div>
                            </GlassCard>
                        </m.div>
                    </div>
                </section>

                {/* ═══ STATS ROW ═══ */}
                <section className="py-16 px-6">
                    <div className="max-w-5xl mx-auto">
                        <m.div
                            className="grid sm:grid-cols-3 gap-4"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <m.div variants={staggerChild}>
                                <GlassCard className="text-center" padding="lg" hover={false}>
                                    <div className="text-3xl font-black mb-1 p-0 text-[#00D4FF]">
                                        Top <StatCounter end={10} />%
                                    </div>
                                    <p className="font-mono text-[0.5rem] tracking-[0.3em] text-[#3A3E48] uppercase">Songwriter</p>
                                </GlassCard>
                            </m.div>

                            <m.div variants={staggerChild}>
                                <GlassCard className="text-center" padding="lg" hover={false}>
                                    <div className="text-3xl font-black mb-1 text-[#B44AFF]">
                                        Top <StatCounter end={25} />%
                                    </div>
                                    <p className="font-mono text-[0.5rem] tracking-[0.3em] text-[#3A3E48] uppercase">Producer</p>
                                </GlassCard>
                            </m.div>

                            <m.div variants={staggerChild}>
                                <GlassCard className="text-center" padding="lg" hover={false}>
                                    <div className="text-3xl font-black mb-1 text-[#00FFA3]">
                                        <StatCounter end={2026} />
                                    </div>
                                    <p className="font-mono text-[0.5rem] tracking-[0.3em] text-[#3A3E48] uppercase">HealingWave</p>
                                </GlassCard>
                            </m.div>
                        </m.div>
                    </div>
                </section>

            </article>
        </PageTransition>
    );
}
