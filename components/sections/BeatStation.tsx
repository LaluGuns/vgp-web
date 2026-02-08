'use client';

/**
 * Beat Station Section - The Hub
 * Terminal-styled Beatstars iframe embed with Y3K decorations
 */

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeInUp, staggerContainer } from '@/lib/framer-variants';
import { MiniVisualizer } from '@/components/ui/AudioVisualizer';

export function BeatStation() {
    return (
        <section className="relative py-24 md:py-32 px-6">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-radial-glow-lime opacity-20" />

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
                        BEAT STATION
                    </motion.p>
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        variants={fadeInUp}
                    >
                        Curated Beat Marketplace
                    </motion.h2>
                    <motion.p
                        className="text-white/60 max-w-2xl mx-auto"
                        variants={fadeInUp}
                    >
                        Premium instrumentals and production kits for artists, content creators, and producers.
                    </motion.p>
                </motion.div>

                {/* Terminal Frame */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <GlassCard padding="none" className="overflow-hidden">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            {/* Window Controls */}
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>

                            {/* Terminal Title */}
                            <div className="mono-label flex items-center gap-3">
                                <MiniVisualizer isActive={true} />
                                <span>VGP://BEAT-STATION</span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4 mono-label text-xs">
                                <span className="text-cyber-lime">● LIVE</span>
                            </div>
                        </div>

                        {/* Tech Stats Border */}
                        <div className="flex items-center justify-between px-6 py-3 bg-black/30 border-b border-white/5">
                            <div className="flex items-center gap-6 mono-label text-xs">
                                <span>BPM: <span className="text-cyber-lime">80-160</span></span>
                                <span>KEY: <span className="text-electric-cyan">ALL</span></span>
                                <span>GENRE: <span className="text-white/70">HIP-HOP / R&B / TRAP</span></span>
                            </div>
                            <div className="mono-label text-xs text-white/50">
                                POWERED BY BEATSTARS
                            </div>
                        </div>

                        {/* Beatstars Embed */}
                        <div className="relative">
                            {/* Placeholder for Beatstars iframe */}
                            <div className="bg-black/50 min-h-[500px] flex items-center justify-center">
                                <div className="text-center">
                                    <p className="mono-label text-white/50 mb-4">
                                        BEATSTARS PLAYER EMBED
                                    </p>
                                    <p className="text-white/30 text-sm max-w-md">
                                        Replace this with your Beatstars embed code:
                                        <br />
                                        <code className="text-cyber-lime/70 text-xs">
                                            {`<iframe src="https://www.beatstars.com/embed/..."`}
                                        </code>
                                    </p>

                                    {/* Example iframe - uncomment and add your URL */}
                                    {/* 
                  <iframe
                    src="https://www.beatstars.com/embed/yourprofile"
                    width="100%"
                    height="500"
                    style={{ border: 'none' }}
                    allow="autoplay"
                  />
                  */}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
}
