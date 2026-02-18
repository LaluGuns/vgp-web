'use client';

/**
 * Footer — Y3K Robot Chrome Footer
 * Gradient divider, social glow icons, chrome text
 */

import { m } from 'framer-motion';
import { revealUp, staggerParent, staggerChild } from '@/lib/motion-presets';
import { socialData } from '@/components/SocialDock';

const studioLinks = [
    { name: 'Beatstore', href: '/studio/beats' },
    { name: 'Masterclass', href: '/studio/masterclass' },
];

const labLinks = [
    { name: 'HealingWave', href: '/lab/healingwave' },
];

const otherLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=founder@virzyguns.com' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-20 md:py-24 px-6 border-t border-[rgba(200,204,212,0.04)]">
            {/* Chrome gradient divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.15)] to-transparent" />

            <m.div
                className="max-w-4xl mx-auto"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {/* Brand */}
                <div className="text-center mb-14">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-ultra-tight mb-3">
                        <span className="gradient-text">VIRZY GUNS</span>
                        <span className="text-[var(--chrome)]"> PRODUCTION</span>
                    </h3>
                    <p className="text-[var(--dim-grey)] text-sm">
                        Engineering sound for the digital era.
                    </p>
                </div>

                {/* Navigation Grid */}
                <m.div
                    className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-14 max-w-lg mx-auto"
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {/* Studio */}
                    <m.div className="text-center" variants={staggerChild}>
                        <p className="mono-label text-[var(--studio-accent)]/70 mb-4 tracking-[0.25em]">STUDIO</p>
                        <nav className="flex flex-col items-center gap-2.5">
                            {studioLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-[var(--chrome-dim)] hover:text-[var(--studio-accent)] transition-colors text-sm"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                    </m.div>

                    {/* Lab */}
                    <m.div className="text-center" variants={staggerChild}>
                        <p className="mono-label text-[var(--lab-accent)]/70 mb-4 tracking-[0.25em]">LAB</p>
                        <nav className="flex flex-col items-center gap-2.5">
                            {labLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-[var(--chrome-dim)] hover:text-[var(--lab-accent)] transition-colors text-sm"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                    </m.div>

                    {/* Other */}
                    <m.div className="text-center col-span-2 md:col-span-1" variants={staggerChild}>
                        <p className="mono-label text-[var(--chrome-dim)] mb-4 tracking-[0.25em]">MORE</p>
                        <nav className="flex flex-col items-center gap-2.5">
                            {otherLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target={link.href.startsWith('http') ? '_blank' : undefined}
                                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="text-[var(--chrome-dim)] hover:text-white transition-colors text-sm"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                    </m.div>
                </m.div>

                {/* Social Icons */}
                <div className="flex items-center justify-center gap-3 mb-14">
                    {socialData.map((social) => (
                        <m.a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[rgba(200,204,212,0.04)] border border-[rgba(200,204,212,0.06)] flex items-center justify-center text-[var(--chrome-dim)] hover:text-[var(--cyan)] hover:border-[rgba(0,212,255,0.2)] hover:shadow-[0_0_16px_rgba(0,212,255,0.12)] transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={social.name}
                        >
                            {social.icon}
                        </m.a>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-[rgba(200,204,212,0.06)] mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.4)] to-transparent w-1/2 -translate-x-full animate-[shimmer_3s_infinite]" />
                </div>

                {/* Newsletter & Copyright */}
                <div className="flex flex-col items-center justify-center gap-4 text-center w-full">
                    <p className="terminal-text text-[var(--chrome-muted)] text-[0.7rem] tracking-wider uppercase font-medium mb-1">
                        © 2026 VIRZY GUNS PRODUCTION. ALL RIGHTS RESERVED.
                    </p>
                    <p className="terminal-text text-[rgba(200,204,212,0.2)] text-[0.6rem] tracking-[0.25em] font-mono uppercase">
                        BUILT WITH ◈ NEXT.JS ◈ TAILWIND ◈ FRAMER MOTION
                    </p>
                </div>
            </m.div>

            {/* Mobile safe area spacing for bottom nav */}
            <div className="h-20 md:hidden" />
        </footer>
    );
}
