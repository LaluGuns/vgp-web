'use client';

/**
 * HealingWave Project Page
 * Functional audio technology — Y3K Lab aesthetic
 * STATUS: IN R&D - Modules wrapped with visual lock
 */

import { m } from 'framer-motion';
import { Portal3DIcon } from '@/components/ui/Portal3DIcon';
import { PageTransition } from '@/components/PageTransition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { RnDLock } from '@/components/ui/RnDLock';
import { staggerParent, staggerChild, revealUp } from '@/lib/motion-presets';
import { useNewsletter } from '@/components/context/NewsletterContext';

// Icons
const BrainIcon = () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5V12h4V9.5c1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4z" />
        <path d="M12 12v10" />
        <path d="M8 14c-3 0-5 2-5 5s2 3 5 3" />
        <path d="M16 14c3 0 5 2 5 5s-2 3-5 3" />
        <circle cx="12" cy="6" r="1.5" fill="currentColor" />
    </svg>
);

const PaceIcon = () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="4" r="2" />
        <path d="M7 21l3-8" />
        <path d="M17 21l-3-8" />
        <path d="M12 10v3" />
        <path d="M6 10h12" />
        <path d="M4 14l3-4" />
        <path d="M20 14l-3-4" />
    </svg>
);

const GymIcon = () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="9" width="5" height="6" rx="1" />
        <rect x="17" y="9" width="5" height="6" rx="1" />
        <path d="M7 12h10" />
        <path d="M5 6v12" />
        <path d="M19 6v12" />
    </svg>
);

const modules = [
    {
        id: 'focus',
        name: 'HealingWave Focus',
        platform: 'Web Application',
        Icon: BrainIcon,
        description: 'Browser based functional audio environment for deep work, flow states, and cognitive performance. Engineered soundscapes backed by psychoacoustic research.',
        features: ['Focus timers', 'Session analytics', 'Custom presets', 'Study Mode'],
        status: 'IN DEVELOPMENT',
        progress: 75,
        eta: 'Q2 2026',
    },
    {
        id: 'pacer',
        name: 'VGP Pacer',
        platform: 'iOS and Android',
        Icon: PaceIcon,
        description: 'Running cadence optimization through real time BPM detection and tempo matched music. Sync your playlist to your stride for optimal performance.',
        features: ['BPM detection', 'Cadence sync', 'Route tracking', 'Training plans'],
        status: 'Q3 2026',
        progress: 35,
        eta: 'Q3 2026',
    },
    {
        id: 'gym',
        name: 'VGP Gym',
        platform: 'iOS and Android',
        Icon: GymIcon,
        description: 'Fitness focused audio for strength training and HIIT workouts. Tempo matched playlists that adapt to your workout intensity.',
        features: ['Workout detection', 'Tempo matching', 'Rep counting', 'Progress log'],
        status: 'CONCEPT PHASE',
        progress: 15,
        eta: 'Q4 2026',
    },
];

export default function HealingWavePage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            {/* ═══ HERO ═══ */}
            <section className="relative py-24 sm:py-32 px-4 sm:px-6 text-center overflow-hidden">
                {/* Gradient orbs — Lab green theme */}
                <div className="absolute top-[-10%] left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,255,163,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.05)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

                {/* Ambient grid */}
                <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0,255,163,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,255,163,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                    }}
                />

                <div className="max-w-3xl mx-auto relative">
                    {/* Immersive Background Icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-25">
                        <Portal3DIcon portalId="lab" color="#00FFA3" size={350} />
                    </div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <p className="font-mono text-[0.55rem] tracking-[0.4em] text-[#00FFA3]/60 mb-5 uppercase">
                            HEALINGWAVE PROJECT
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.06em] leading-[0.9] mb-6">
                            <span className="titanium-text font-bold tracking-tight">Productivity &</span>
                            <br />
                            <span className="text-[#00FFA3]">Wellness</span>{' '}
                            <span className="text-white/40">Ecosystem</span>
                        </h1>
                        <p className="text-[#6B7080] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                            The ultimate <strong className="text-[#00FFA3]">Productivity & Wellness App</strong> designed
                            for peak performance. Specialized modules for <strong className="text-white/80">Deep Focus, Running, Gym Workouts,
                                Meditation, Sleep Optimization, and Study Concentration</strong>.
                        </p>
                    </m.div>
                </div>
            </section>

            {/* ═══ MODULES ═══ */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0C0E14]/50">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader
                        label="ECOSYSTEM"
                        title="The Modules"
                        description="Three interconnected products designed for specific use cases."
                    />

                    <m.div
                        className="space-y-6"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {modules.map((module, index) => (
                            <m.div key={module.id} variants={staggerChild}>
                                <RnDLock
                                    variant="lab"
                                    moduleName={module.name.toUpperCase()}
                                    status={module.status}
                                    eta={module.eta}
                                >
                                    <GlassCard
                                        padding="none"
                                        hover
                                        glow={index === 0 ? 'lab' : 'none'}
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Icon Side */}
                                            <div className="w-full md:w-48 shrink-0 flex items-center justify-center py-8 md:py-0 bg-[#06070B] border-b md:border-b-0 md:border-r border-white/[0.04] text-[#3A3E48]">
                                                <module.Icon />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6 sm:p-8">
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[#00FFA3] px-2.5 py-1 bg-[#00FFA3]/10 rounded-md">
                                                        {module.status}
                                                    </span>
                                                    <span className="font-mono text-[0.5rem] tracking-[0.2em] text-[#3A3E48]">{module.platform}</span>
                                                </div>

                                                <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] mb-3">{module.name}</h3>
                                                <p className="text-[#6B7080] leading-relaxed mb-6">
                                                    {module.description}
                                                </p>

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {module.features.map((feature) => (
                                                        <span key={feature} className="text-xs bg-white/[0.04] px-3 py-1.5 rounded-full text-[#565B66] border border-white/[0.04]">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Progress */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-mono text-[0.5rem] tracking-[0.2em] text-[#3A3E48]">DEVELOPMENT PROGRESS</span>
                                                        <span className="font-mono text-[0.5rem] tracking-[0.2em] text-[#00FFA3]">{module.progress}%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                                        <m.div
                                                            className="h-full rounded-full"
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${module.progress}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                                            style={{
                                                                background: `linear-gradient(90deg, #00FFA3, #00D4FF)`,
                                                                boxShadow: '0 0 12px rgba(0,255,163,0.4)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </RnDLock>
                            </m.div>
                        ))}
                    </m.div>
                </div>
            </section>

            {/* ═══ VISION ═══ */}
            <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
                {/* Gradient orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,255,163,0.04)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

                <div className="max-w-3xl mx-auto text-center relative">
                    <m.div
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <p className="font-mono text-[0.55rem] tracking-[0.4em] text-[#00FFA3]/60 mb-4 uppercase">VISION</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.05em] mb-6">
                            The Future of Audio
                            <br />
                            <span className="text-white/40">is Functional</span>
                        </h2>
                        <p className="text-[#6B7080] leading-relaxed mb-8">
                            We believe audio can do more than entertain. It can optimize cognitive function,
                            enhance physical performance, and support mental wellness. Our mission is to
                            engineer sound that serves a purpose.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <GlowButton variant="primary" href="/about">
                                About The Founder
                            </GlowButton>
                            <GlowButton variant="ghost" href="/studio/masterclass">
                                Masterclass
                            </GlowButton>
                        </div>
                    </m.div>
                </div>
            </section>

            {/* ═══ WAITLIST CTA ═══ */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0C0E14]/50">
                <div className="max-w-xl mx-auto text-center">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard padding="lg" glow="lab">
                            <p className="font-mono text-[0.55rem] tracking-[0.4em] text-[#00FFA3]/60 mb-3 uppercase">STAY UPDATED</p>
                            <h3 className="text-xl font-semibold mb-3">Join the Waiting List</h3>
                            <p className="text-[#6B7080] text-sm mb-4">
                                Be the first to know when HealingWave Focus launches.
                            </p>
                            <p className="font-mono text-[0.5rem] tracking-[0.3em] text-[#3A3E48] mb-6">COMING Q2 2026</p>
                            <GlowButton variant="lab" onClick={openPopup}>
                                JOIN WAITLIST
                            </GlowButton>
                        </GlassCard>
                    </m.div>
                </div>
            </section>
        </PageTransition>
    );
}
