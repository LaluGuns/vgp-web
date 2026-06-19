'use client';

/**
 * Beat Store section
 */

import { m } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { revealScale } from '@/lib/motion-presets';

export function Beatstore() {
    return (
        <section id="beatstore" className="relative py-32 px-6">
            <div className="absolute inset-0 bg-radial-glow opacity-30" />

            <div className="max-w-5xl mx-auto">
                <SectionHeader
                    label="VGP BEAT STORE"
                    title="Premium Instrumentals"
                    description="Curated beats for artists, creators, and producers."
                />

                <m.div
                    className="glass-heavy rounded-2xl overflow-hidden"
                    variants={revealScale}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-sky-200/45" />
                            <div className="h-3 w-3 rounded-full bg-cyan-300/35" />
                            <div className="h-3 w-3 rounded-full bg-white/[0.18]" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="terminal-text text-white/70">VGP://BEAT-STORE</span>
                        </div>
                        <div className="w-16" />
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-black/50 border-b border-white/5">
                        <div className="flex items-center gap-6 terminal-text">
                            <span>STATUS: <span className="status-online font-semibold">ONLINE</span></span>
                            <span>FREQ: <span className="status-freq font-semibold">44.1kHz</span></span>
                            <span>BIT: <span className="text-white/70">24-BIT</span></span>
                        </div>
                        <div className="terminal-text text-white/40">POWERED BY BEATSTARS</div>
                    </div>

                    {/* BeatStars player embed */}
                    <div className="relative bg-black/20">
                        <iframe
                            src="https://player.beatstars.com/?storeId=122437"
                            width="100%"
                            height="600"
                            style={{ border: 'none', display: 'block' }}
                            allow="autoplay; clipboard-write"
                            title="VGP Beat Store"
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-3 bg-black/50 border-t border-white/5">
                        <div className="flex items-center gap-4 terminal-text">
                            <span className="text-white/40">SECURE CHECKOUT</span>
                            <span className="text-white/40">INSTANT DELIVERY</span>
                        </div>
                        <div className="terminal-text text-primary/50">VGP.SYSTEM.v1.0</div>
                    </div>
                </m.div>
            </div>
        </section>
    );
}
