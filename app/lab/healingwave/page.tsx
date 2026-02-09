'use client';

/**
 * HealingWave Project Page
 * Functional audio technology - NO beats reference
 * STATUS: IN R&D - Modules wrapped with visual lock
 */

import { m } from 'framer-motion';
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
            {/* Hero */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="mono-label text-primary mb-4">HEALINGWAVE PROJECT</p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-hero mb-6">
                            HealingWave: Productivity & Wellness Ecosystem
                        </h1>
                        <p className="text-cool-grey text-lg leading-relaxed">
                            The ultimate <strong className="text-primary">Productivity & Wellness App Ecosystem</strong> designed
                            for peak performance. Specialized modules for <strong className="text-white">Deep Focus, Running, Gym Workouts,
                                Meditation, Sleep Optimization, and Study Concentration</strong>. Seamlessly integrated across Web, iOS, and Android.
                            Sound is not just entertainment—it&apos;s a precision tool for cognitive function.
                        </p>
                    </m.div>
                </div>
            </section>

            {/* Modules Grid */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 bg-carbon">
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
                                {/* R&D Lock for each module */}
                                <RnDLock
                                    variant="lab"
                                    moduleName={module.name.toUpperCase()}
                                    status={module.status}
                                    eta={module.eta}
                                >
                                    <GlassCard
                                        padding="none"
                                        hover
                                        glow={index === 0 ? 'subtle' : 'none'}
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Icon Side */}
                                            <div className="w-full md:w-48 shrink-0 flex items-center justify-center py-8 md:py-0 bg-obsidian border-b md:border-b-0 md:border-r border-white/5 text-dim-grey">
                                                <module.Icon />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6 sm:p-8">
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    <span className="mono-label text-xs text-primary px-2 py-1 bg-primary/10 rounded">
                                                        {module.status}
                                                    </span>
                                                    <span className="terminal-text text-dim-grey">{module.platform}</span>
                                                </div>

                                                <h3 className="text-xl sm:text-2xl font-semibold tracking-apple mb-3">{module.name}</h3>
                                                <p className="text-cool-grey leading-relaxed mb-6">
                                                    {module.description}
                                                </p>

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {module.features.map((feature) => (
                                                        <span key={feature} className="text-xs bg-white/5 px-3 py-1 rounded-full text-dim-grey">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Progress */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="terminal-text">DEVELOPMENT PROGRESS</span>
                                                        <span className="terminal-text text-primary">{module.progress}%</span>
                                                    </div>
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <m.div
                                                            className="h-full bg-primary"
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${module.progress}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 1, delay: 0.2 }}
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

            {/* Vision Section */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <m.div
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <p className="mono-label text-primary mb-4">VISION</p>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-apple mb-6">
                            The Future of Audio is Functional
                        </h2>
                        <p className="text-cool-grey leading-relaxed mb-8">
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

            {/* Stay Updated */}
            <section className="py-12 sm:py-16 px-4 sm:px-6 bg-carbon">
                <div className="max-w-xl mx-auto text-center">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard padding="lg" glow="subtle">
                            <p className="mono-label text-primary mb-3">STAY UPDATED</p>
                            <h3 className="text-xl font-semibold mb-3">Join the Waiting List</h3>
                            <p className="text-cool-grey text-sm mb-4">
                                Be the first to know when HealingWave Focus launches.
                            </p>
                            <p className="text-dim-grey text-xs mb-6">Coming Q1 2026</p>
                            <GlowButton variant="primary" onClick={openPopup}>
                                JOIN WAITLIST
                            </GlowButton>
                        </GlassCard>
                    </m.div>
                </div>
            </section>
        </PageTransition>
    );
}
