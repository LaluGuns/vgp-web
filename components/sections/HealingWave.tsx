'use client';

/**
 * HealingWave Section - Functional Audio Showcase
 * Control Panel UI with Before/After toggle and real-time visualizer
 */

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { CustomSwitch } from '@/components/ui/CustomSwitch';
import { AudioVisualizer } from '@/components/ui/AudioVisualizer';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { fadeInUp, staggerContainer } from '@/lib/framer-variants';

export function HealingWave() {
    const { isProcessed, visualizerSpeed, toggleProcessing } = useAudioEngine();

    return (
        <section className="relative py-24 md:py-32 px-6">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-radial-glow-cyan opacity-30" />

            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.p className="mono-label text-electric-cyan mb-4" variants={fadeInUp}>
                        HEALINGWAVE ENGINE v1.0
                    </motion.p>
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        variants={fadeInUp}
                    >
                        Functional Audio Technology
                    </motion.h2>
                    <motion.p
                        className="text-white/60 max-w-2xl mx-auto"
                        variants={fadeInUp}
                    >
                        Functional audio experiments for focus, movement, and intentional listening.
                        Experience a calm comparison between raw audio and a guided sound preset.
                    </motion.p>
                </motion.div>

                {/* Control Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <GlassCard
                        className={`
              relative overflow-hidden transition-all duration-500
              ${isProcessed ? 'border-cyber-lime/50 shadow-neon-lime' : ''}
            `}
                        padding="lg"
                    >
                        {/* Active State Glow Overlay */}
                        {isProcessed && (
                            <div className="absolute inset-0 bg-radial-glow-lime opacity-20 pointer-events-none" />
                        )}

                        <div className="relative z-10">
                            {/* Toggle Control */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Audio Processing Mode</h3>
                                    <p className="text-white/50 text-sm">
                                        Toggle to hear the HealingWave difference
                                    </p>
                                </div>
                                <CustomSwitch
                                    isActive={isProcessed}
                                    onToggle={toggleProcessing}
                                    labelOff="RAW"
                                    labelOn="ENHANCED"
                                />
                            </div>

                            {/* Visualizer */}
                            <div className="bg-black/30 rounded-xl p-6 mb-8">
                                <AudioVisualizer
                                    isActive={isProcessed}
                                    speed={visualizerSpeed}
                                    barCount={32}
                                />
                            </div>

                            {/* Feature Grid */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <FeatureBlock
                                    title="Rhythmic Alignment"
                                    description="Careful sound shaping for calmer listening sessions."
                                    icon="01"
                                />
                                <FeatureBlock
                                    title="Pulse Design"
                                    description="Layered timing, texture, and motion for focus or evening listening."
                                    icon="02"
                                />
                                <FeatureBlock
                                    title="Sonic Clarity"
                                    description="Noise reduction designed to preserve musical detail."
                                    icon="03"
                                />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
}

/**
 * Feature Block Component (Apple-style)
 */
function FeatureBlock({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: string;
}) {
    return (
        <div className="text-center md:text-left">
            <div className="text-2xl text-cyber-lime mb-3">{icon}</div>
            <h4 className="font-semibold mb-2">{title}</h4>
            <p className="text-white/50 text-sm">{description}</p>
        </div>
    );
}
