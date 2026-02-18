'use client';

/**
 * Guides Page - Y3K Sovereign PDF Store
 * Clean minimal icons, not emojis
 */

import { m } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

// Y3K Minimal Icons
const BookIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7h8M8 11h5" strokeLinecap="round" />
    </svg>
);

const CircuitIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
);

const WaveformIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12h2l2-6 3 12 3-8 2 4 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SliderIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" strokeLinecap="round" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="12" cy="10" r="2" />
        <circle cx="20" cy="14" r="2" />
    </svg>
);

const guides = [
    {
        id: 1,
        title: 'Music Production Guide Vol. 1',
        description: 'The foundational blueprint for professional music production.',
        price: '$29',
        tag: 'BESTSELLER',
        Icon: BookIcon,
        pages: '120+ Pages',
    },
    {
        id: 2,
        title: 'The AI-Era Producer Workflow',
        description: 'Leverage AI tools to 10x your production speed.',
        price: '$39',
        tag: 'NEW',
        Icon: CircuitIcon,
        pages: '80+ Pages',
    },
    {
        id: 3,
        title: 'Sonic Architecture: Sound Design',
        description: 'Deep-dive into synthesis, sampling, and sound design.',
        price: '$49',
        tag: 'ADVANCED',
        Icon: WaveformIcon,
        pages: '150+ Pages',
    },
    {
        id: 4,
        title: 'Mixing & Mastering Essentials',
        description: 'Professional mixing techniques for release-ready tracks.',
        price: '$35',
        tag: 'POPULAR',
        Icon: SliderIcon,
        pages: '100+ Pages',
    },
];

export default function GuidesPage() {
    return (
        <PageTransition>
            <div className="relative min-h-screen overflow-hidden">
                {/* ═══════════════════════════════════════════
                    Y3K BACKGROUND LAYERS
                   ═══════════════════════════════════════════ */}
                {/* Gradient orbs — Green/Cyan for Digital Arsenal */}
                <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,255,163,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.05)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

                {/* Ambient grid */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                    }}
                />

                <section className="relative pt-24 pb-12 px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Dramatic Hero */}
                        <div className="text-center mb-20 relative z-10">
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="font-mono text-[0.6rem] tracking-[0.4em] text-[#00FFA3]/80 mb-6 uppercase">
                                    VGP Digital Arsenal
                                </p>
                                <h1 className="text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.9] mb-6">
                                    Production
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] via-white to-[#00D4FF] animate-gradient-text">
                                        Guides
                                    </span>
                                </h1>
                                <p className="text-cool-grey text-lg max-w-xl mx-auto leading-relaxed">
                                    Curated knowledge to accelerate your production journey.
                                    <br className="hidden sm:block" />
                                    Blueprints for professional sound design and engineering.
                                </p>
                            </m.div>
                        </div>

                        {/* Guides Grid */}
                        <m.div
                            className="grid md:grid-cols-2 gap-6 relative z-10"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {guides.map((guide) => (
                                <m.div key={guide.id} variants={staggerChild}>
                                    <GlassCard className="h-full bg-black/40 border-white/5" padding="none" hover>
                                        <div className="flex h-full group">
                                            {/* Icon Side with Glow */}
                                            <div className="w-28 shrink-0 flex items-center justify-center bg-white/[0.02] border-r border-white/5 text-dim-grey group-hover:text-[#00FFA3] group-hover:bg-[#00FFA3]/[0.02] transition-colors duration-500">
                                                <div className="group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(0,255,163,0.4)] transition-all duration-500">
                                                    <guide.Icon />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6 flex flex-col">
                                                {guide.tag && (
                                                    <span className="mono-label text-[#00FFA3] text-[0.6rem] mb-2 tracking-widest">{guide.tag}</span>
                                                )}
                                                <h3 className="text-xl font-bold mb-2 tracking-tight text-white group-hover:text-[#00FFA3] transition-colors duration-300">
                                                    {guide.title}
                                                </h3>
                                                <p className="text-cool-grey text-sm mb-4 flex-1 leading-relaxed border-l-2 border-white/10 pl-3">
                                                    {guide.description}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs font-mono text-dim-grey mb-6">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                                        {guide.pages}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                                        PDF FORMAT
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <span className="text-2xl font-bold text-white tracking-tight">{guide.price}</span>
                                                    <GlowButton variant="ghost" size="sm" className="group-hover:border-[#00FFA3]/30 group-hover:text-[#00FFA3]">
                                                        Acquire
                                                    </GlowButton>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </m.div>
                            ))}
                        </m.div>

                        {/* Bundle */}
                        <m.div
                            className="mt-16 text-center relative z-10"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCard className="inline-block relative overflow-hidden" padding="lg">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/5 to-[#00FFA3]/5" />
                                <div className="relative z-10">
                                    <p className="mono-label text-[#00D4FF] mb-3 tracking-[0.25em]">COMPLETE ARSENAL</p>
                                    <h3 className="text-2xl font-bold mb-2 text-white">All Guides Package</h3>
                                    <p className="text-cool-grey text-sm mb-6">All current and future guides included.</p>
                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <span className="text-dim-grey line-through text-lg">$153</span>
                                        <span className="text-3xl font-black text-[#00FFA3] drop-shadow-[0_0_15px_rgba(0,255,163,0.3)]">$89</span>
                                    </div>
                                    <GlowButton variant="primary" size="md">
                                        Get Full Bundle
                                    </GlowButton>
                                </div>
                            </GlassCard>
                        </m.div>
                    </div>
                </section>
            </div>
        </PageTransition>
    );
}
