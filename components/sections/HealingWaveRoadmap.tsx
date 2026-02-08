'use client';

/**
 * HealingWave Roadmap - Y3K Sovereign Design
 * Clean minimal SVG icons, not emojis
 */

import { m } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

// Y3K Minimal Icons
const BrainIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 0 0-4 4c0 1.1.45 2.1 1.17 2.83L12 12l2.83-3.17A4 4 0 0 0 12 2z" />
        <path d="M12 12v10M8 14c-2.21 0-4 1.79-4 4s1.79 4 4 4M16 14c2.21 0 4 1.79 4 4s-1.79 4-4 4" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
    </svg>
);

const PaceIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="2" />
        <path d="M7 22l3-7M17 22l-3-7" />
        <path d="M12 11v4" />
        <path d="M7 11h10" />
        <path d="M5 15l2-4M19 15l-2-4" />
    </svg>
);

const GymIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" strokeLinecap="round" />
        <rect x="3" y="8" width="4" height="8" rx="1" />
        <rect x="17" y="8" width="4" height="8" rx="1" />
        <path d="M7 12h10" />
    </svg>
);

const modules = [
    {
        id: 'healing-focus',
        name: 'HealingWave Focus',
        platform: 'Web',
        Icon: BrainIcon,
        description: 'Functional audio for deep work. Engineered soundscapes for cognitive performance.',
        status: 'IN DEV',
        progress: 75,
    },
    {
        id: 'pacer',
        name: 'VGP Pacer',
        platform: 'Mobile',
        Icon: PaceIcon,
        description: 'Running cadence optimization. Sync your music to your stride.',
        status: 'Q3 2026',
        progress: 35,
    },
    {
        id: 'gym',
        name: 'VGP Gym',
        platform: 'Mobile',
        Icon: GymIcon,
        description: 'Fitness-focused audio. Tempo-matched playlists for peak performance.',
        status: 'CONCEPT',
        progress: 15,
    },
];

export function HealingWaveRoadmap() {
    return (
        <section className="py-24 px-6 bg-carbon">
            <div className="max-w-5xl mx-auto">
                <SectionHeader
                    label="ECOSYSTEM"
                    title="Beyond Entertainment"
                    description="Functional audio technology for human performance."
                />

                <m.div
                    className="grid md:grid-cols-3 gap-6"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {modules.map((module, index) => (
                        <m.div key={module.id} variants={staggerChild}>
                            <GlassCard
                                className="h-full"
                                padding="lg"
                                hover
                                glow={index === 0 ? 'subtle' : 'none'}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-lg bg-carbon flex items-center justify-center text-dim-grey">
                                        <module.Icon />
                                    </div>
                                    <span className="mono-label text-xs text-primary px-2 py-1 bg-primary/10 rounded">
                                        {module.status}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-medium tracking-apple mb-1">{module.name}</h3>
                                <p className="mono-label text-dim-grey text-xs mb-4">{module.platform}</p>

                                {/* Description */}
                                <p className="text-cool-grey text-sm leading-relaxed mb-6">
                                    {module.description}
                                </p>

                                {/* Progress */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="terminal-text">PROGRESS</span>
                                        <span className="terminal-text text-primary">{module.progress}%</span>
                                    </div>
                                    <div className="h-px bg-white/10 rounded-full overflow-hidden">
                                        <m.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${module.progress}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            </GlassCard>
                        </m.div>
                    ))}
                </m.div>
            </div>
        </section>
    );
}
