'use client';

/**
 * Hero Section - VIRZY GUNS PRODUCTION
 * Apple-style massive typography with Y3K animated gradient
 */

import { m } from 'framer-motion';
import { GlowButton } from '@/components/ui/GlowButton';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 animated-gradient" />
            <div className="absolute inset-0 bg-radial-glow opacity-40" />

            <m.div
                className="relative z-10 text-center px-6 max-w-6xl mx-auto"
                variants={staggerParent}
                initial="hidden"
                animate="visible"
            >
                <m.p className="mono-label text-primary mb-8" variants={staggerChild}>
                    ENGINEERING SOUND FOR THE DIGITAL ERA
                </m.p>

                <m.h1
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-ultra-tight leading-none"
                    variants={staggerChild}
                >
                    <span className="block text-white">VIRZY GUNS</span>
                    <span className="block gradient-text mt-2">PRODUCTION</span>
                </m.h1>

                <m.p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mt-8 mb-12" variants={staggerChild}>
                    Premium beats, production guides, and functional audio tools for the modern creator.
                </m.p>

                <m.div className="flex flex-col sm:flex-row items-center justify-center gap-4" variants={staggerChild}>
                    <GlowButton variant="primary" size="lg" href="#arsenal">
                        Enter the Lab
                    </GlowButton>
                    <GlowButton variant="ghost" size="lg" href="#beatstore">
                        Browse Beats
                    </GlowButton>
                </m.div>
            </m.div>

            <m.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
            >
                <m.div
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <m.div
                        className="w-1.5 h-3 bg-primary rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                    />
                </m.div>
            </m.div>
        </section>
    );
}
