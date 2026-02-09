'use client';

/**
 * Footer Section - Properly centered with same icons as SocialDock
 */

import { m } from 'framer-motion';
import { revealUp } from '@/lib/motion-presets';
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
    { name: 'Contact', href: 'mailto:founder@virzyguns.com' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-24 px-6 border-t border-white/10">
            <m.div
                className="max-w-4xl mx-auto"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {/* CENTERED BRAND */}
                <div className="text-center mb-16">
                    <h3 className="text-3xl md:text-4xl font-bold tracking-ultra-tight mb-4">
                        <span className="gradient-text">VIRZY GUNS</span>
                        <span className="text-white/80"> PRODUCTION</span>
                    </h3>
                    <p className="text-white/40 text-sm">
                        Engineering sound for the digital era.
                    </p>
                </div>

                {/* SPLIT NAV: Studio (Left) | Lab (Right) */}
                <div className="grid grid-cols-2 gap-12 mb-12 max-w-md mx-auto">
                    {/* VGP STUDIO */}
                    <div className="text-center">
                        <p className="mono-label text-[#ec4899]/70 mb-4 tracking-widest text-xs">VGP STUDIO</p>
                        <nav className="flex flex-col items-center gap-2">
                            {studioLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-white/50 hover:text-[#ec4899] transition-colors text-sm"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* VGP LAB */}
                    <div className="text-center">
                        <p className="mono-label text-[#00ff88]/70 mb-4 tracking-widest text-xs">VGP LAB</p>
                        <nav className="flex flex-col items-center gap-2">
                            {labLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-white/50 hover:text-[#00ff88] transition-colors text-sm"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* OTHER LINKS */}
                <nav className="flex items-center justify-center gap-8 mb-12">
                    {otherLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            target={link.href.startsWith('http') ? '_blank' : undefined}
                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-white/40 hover:text-white transition-colors text-sm"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* SOCIAL ICONS - Using same SVG icons as SocialDock */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    {socialData.map((social) => (
                        <a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 glass rounded-full flex items-center justify-center text-white/50 hover:text-primary hover:bg-white/10 transition-all"
                            aria-label={social.name}
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                {/* COPYRIGHT */}
                <div className="text-center">
                    <p className="terminal-text text-white/30 mb-2 text-xs">
                        © {currentYear} VIRZY GUNS PRODUCTION. ALL RIGHTS RESERVED.
                    </p>
                    <p className="terminal-text text-white/20 text-xs">
                        BUILT WITH ◈ NEXT.JS ◈ TAILWIND ◈ FRAMER MOTION
                    </p>
                </div>
            </m.div>
        </footer>
    );
}
