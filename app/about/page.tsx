'use client';

/**
 * About Page - Founder Dossier
 * No dashes, natural language
 */

import { m } from 'framer-motion';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { staggerParent, staggerChild, revealUp } from '@/lib/motion-presets';

export default function AboutPage() {
    return (
        <PageTransition>
            <article className="py-12 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <m.header
                        className="text-center mb-20"
                        variants={staggerParent}
                        initial="hidden"
                        animate="visible"
                    >
                        <m.p className="mono-label text-primary mb-4" variants={staggerChild}>
                            DOSSIER
                        </m.p>
                        <m.h1
                            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-hero mb-6"
                            variants={staggerChild}
                        >
                            Professional Music Producer & Beatmaker
                        </m.h1>
                    </m.header>

                    {/* Founder Section */}
                    <m.section
                        className="grid lg:grid-cols-2 gap-12 items-center mb-20"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Photo */}
                        <m.div variants={staggerChild} className="order-2 lg:order-1">
                            <div className="relative aspect-square max-w-sm mx-auto rounded-xl overflow-hidden scan-effect border border-white/5">
                                <Image
                                    src="/images/founder.jpg"
                                    alt="Virzy Guns"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-obsidian to-transparent">
                                    <p className="terminal-text text-primary">SUBJECT: VIRZY GUNS</p>
                                    <p className="terminal-text text-dim-grey">STATUS: ACTIVE</p>
                                </div>
                            </div>
                        </m.div>

                        {/* Intro */}
                        <m.div variants={staggerChild} className="order-1 lg:order-2">
                            <p className="text-xl text-white/90 leading-relaxed mb-6 font-light">
                                Sound is not just art. It is a biological signal.
                            </p>
                            <p className="text-cool-grey leading-relaxed">
                                I founded VGP with a singular thesis. In an era of cognitive overload,
                                audio must evolve from passive entertainment into a functional tool for
                                mental performance and well being. My work lies at the intersection of
                                <span className="text-primary"> Signal Processing</span>,
                                <span className="text-primary"> Data Science</span>, and
                                <span className="text-primary"> Psychoacoustics</span>.
                            </p>
                        </m.div>
                    </m.section>

                    {/* What We Do */}
                    <m.section className="mb-12" variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <GlassCard padding="lg" hover={false}>
                            <h2 className="text-xl font-semibold mb-4 tracking-apple">What We Do</h2>
                            <p className="text-cool-grey leading-relaxed">
                                Creating premium beats for sale and next-generation functional audio technology.
                                Our beatstore offers exclusive Trap, Cyberphonk, Synthwave, R&B, Synthpop, Club, Deep House, and Drill instrumentals
                                for artists, content creators, and commercial projects. We also develop audio environments
                                that support focus, rest, and emotional regulation, backed by data, not just intuition.
                            </p>
                        </GlassCard>
                    </m.section>

                    {/* Scientific Foundation */}
                    <m.section className="mb-12" variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <GlassCard padding="lg" hover={false} glow="subtle">
                            <p className="mono-label text-primary mb-3">BACKGROUND</p>
                            <h2 className="text-xl font-semibold mb-4 tracking-apple">
                                Scientific Foundation
                            </h2>
                            <p className="text-cool-grey leading-relaxed">
                                Holding a <span className="text-white">Bachelor of Science in Meteorology and Geophysics</span>,
                                I approach audio engineering with a rigorous scientific lens. I translate the
                                principles of Wave Physics and Complex Signal Analysis into the realm of
                                Neuro Acoustics and functional audio design.
                            </p>
                        </GlassCard>
                    </m.section>

                    {/* Industry Validation */}
                    <m.section className="mb-12" variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <GlassCard padding="lg" hover={false}>
                            <p className="mono-label text-dim-grey mb-3">CREDENTIALS</p>
                            <h2 className="text-xl font-semibold mb-4 tracking-apple">Industry Validation</h2>
                            <p className="text-cool-grey leading-relaxed mb-4">
                                Affiliated Songwriter and Composer with <span className="text-white">BMI</span> and
                                <span className="text-white"> Sony Music Publishing</span>. Ranking in the
                                <span className="text-primary"> Top 10% of Songwriters</span> and
                                <span className="text-primary"> Top 25% of Producers</span> on Beatstars.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['BMI', 'Sony Music Publishing', 'Beatstars Verified'].map((badge) => (
                                    <span key={badge} className="mono-label text-xs bg-white/5 px-3 py-1 rounded-full text-dim-grey">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </GlassCard>
                    </m.section>

                    {/* Vision */}
                    <m.section className="mb-16" variants={revealUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <GlassCard padding="lg" hover={false}>
                            <h2 className="text-xl font-semibold mb-4 tracking-apple">Global Vision</h2>
                            <p className="text-cool-grey leading-relaxed mb-6">
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
                    </m.section>

                    {/* Stats */}
                    <m.section
                        className="grid sm:grid-cols-3 gap-4"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { value: 'Top 10%', label: 'Songwriter' },
                            { value: 'Top 25%', label: 'Producer' },
                            { value: '2026', label: 'HealingWave' },
                        ].map((stat) => (
                            <m.div key={stat.label} variants={staggerChild}>
                                <GlassCard className="text-center" padding="lg" hover={false}>
                                    <p className="text-2xl font-semibold text-primary mb-1">{stat.value}</p>
                                    <p className="terminal-text">{stat.label}</p>
                                </GlassCard>
                            </m.div>
                        ))}
                    </m.section>

                </div>
            </article>
        </PageTransition>
    );
}
