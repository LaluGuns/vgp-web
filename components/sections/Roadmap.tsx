'use client';

/**
 * Roadmap Section - The Ecosystem (Coming Soon)
 */

import { m } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

const modules = [
    {
        id: 'healingwave',
        title: 'HealingWave Focus',
        description: 'Browser-based functional audio for deep work and flow states.',
        icon: '🧠',
        status: 'IN DEVELOPMENT',
        progress: 65,
    },
    {
        id: 'pacer',
        title: 'VGP Pacer',
        description: 'Mobile app for running cadence optimization.',
        icon: '🏃',
        status: 'COMING Q3 2026',
        progress: 30,
    },
    {
        id: 'gym',
        title: 'VGP Gym',
        description: 'Fitness-focused audio performance app.',
        icon: '💪',
        status: 'CONCEPT',
        progress: 10,
    },
];

export function Roadmap() {
    return (
        <section id="roadmap" className="relative py-32 px-6 bg-surface">
            <div className="absolute inset-0 bg-radial-glow-cyan opacity-20" />

            <div className="max-w-6xl mx-auto relative">
                <SectionHeader
                    label="THE ECOSYSTEM"
                    title="Beyond Beats"
                    description="Building tools for human performance and wellness."
                />

                <m.div
                    className="grid md:grid-cols-3 gap-6"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {modules.map((module) => (
                        <m.div key={module.id} variants={staggerChild}>
                            <GlassCard className="h-full relative overflow-hidden" padding="lg" glow="subtle">
                                <div className="absolute top-4 right-4">
                                    <span className="mono-label text-secondary text-xs px-2 py-1 rounded-full border border-secondary/50 bg-secondary/10">
                                        {module.status}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                                <div className="relative">
                                    <div className="text-4xl mb-4">{module.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                                    <p className="text-white/50 text-sm mb-6">{module.description}</p>
                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="terminal-text text-white/50">PROGRESS</span>
                                            <span className="terminal-text text-secondary">{module.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <m.div
                                                className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${module.progress}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                            />
                                        </div>
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
