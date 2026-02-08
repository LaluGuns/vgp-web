'use client';

/**
 * Dual Portal Entrance
 * Split-screen navigation: Studio (Left) vs Lab (Right)
 * Special centered header for home page
 */

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { SocialDock } from '@/components/SocialDock';

// Spring physics for buttery-smooth animations
const springConfig = { type: 'spring', stiffness: 100, damping: 20 };

const navLinks = [
    { name: 'HOME', href: '/' },
    {
        name: 'STUDIO',
        href: '/studio/beats',
        submenu: [
            { name: 'Beatstore', href: '/studio/beats' },
            { name: 'Masterclass', href: '/studio/masterclass' },
        ]
    },
    { name: 'LAB', href: '/lab/healingwave' },
    { name: 'ABOUT', href: '/about' },
];

export default function HomePage() {
    const [studioOpen, setStudioOpen] = useState(false);

    return (
        <PageTransition>
            <div className="relative h-screen w-full overflow-hidden -mt-24 -mb-16">

                {/* ═══════════════════════════════════════════
                    CENTERED HEADER (HOME ONLY)
                    Logo + Brand + Nav at top center
                    ═══════════════════════════════════════════ */}
                <div className="absolute top-0 left-0 right-0 z-40 pt-6">
                    <div className="flex flex-col items-center">
                        {/* Logo + Brand */}
                        <Link href="/" className="flex flex-col items-center gap-2 group mb-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 relative">
                                <Image
                                    src="/branding/logo-tg.png"
                                    alt="VGP"
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]"
                                />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-wider transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                                <span className="gradient-text group-hover:brightness-125">VIRZY GUNS</span>
                                <span className="text-white/80 group-hover:text-white transition-colors"> PRODUCTION</span>
                            </h1>
                        </Link>

                        {/* Navigation - Centered with STUDIO dropdown */}
                        <nav className="flex items-center gap-6 md:gap-8 px-6 py-3 y3k-glass rounded-full">
                            {navLinks.map((link) => (
                                'submenu' in link ? (
                                    // STUDIO with dropdown
                                    <div
                                        key={link.name}
                                        className="relative"
                                        onMouseEnter={() => setStudioOpen(true)}
                                        onMouseLeave={() => setStudioOpen(false)}
                                    >
                                        <Link
                                            href={link.href}
                                            className="text-xs md:text-sm tracking-widest text-dim-grey hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            {link.name}
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>

                                        {/* Dropdown */}
                                        <AnimatePresence>
                                            {studioOpen && (
                                                <m.div
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    className="absolute top-full left-0 mt-3 py-2 px-1 y3k-glass rounded-lg min-w-[140px]"
                                                >
                                                    {link.submenu && link.submenu.map((sub) => (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            className="block px-4 py-2 text-sm rounded-md text-dim-grey hover:text-[#ec4899] hover:bg-white/5 transition-colors text-left"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    // Regular link
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-xs md:text-sm tracking-widest transition-colors ${link.href === '/'
                                            ? 'text-primary'
                                            : 'text-dim-grey hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            ))}
                        </nav>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    DUAL PORTAL SPLIT
                    ═══════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row h-full w-full">

                    {/* STUDIO PORTAL (LEFT/TOP) */}
                    <div className="relative flex-1 group h-[50vh] md:h-auto overflow-hidden">
                        {/* Background: Deep Obsidian */}
                        <div className="absolute inset-0 bg-[#050505] z-0" />

                        {/* Particle Effect */}
                        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] mix-blend-overlay" />

                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Content */}
                        <Link
                            href="/studio/beats"
                            className="relative z-10 flex flex-col items-center justify-center h-full w-full text-center p-8 pt-32 md:pt-8 border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/[0.02] transition-all duration-500"
                        >
                            <m.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ...springConfig, delay: 0.2 }}
                            >
                                <p className="mono-label text-[#ec4899]/70 mb-4 tracking-[0.3em]">
                                    FOR ARTISTS & CREATORS
                                </p>

                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white group-hover:text-[#ec4899] transition-colors duration-300">
                                    VGP STUDIO
                                </h2>

                                <p className="text-white/40 text-sm max-w-xs mx-auto mb-8">
                                    Premier Source for Trap, Phonk, Drill, Rap, R&B & Deep House
                                </p>

                                <div className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full text-xs tracking-widest group-hover:border-[#ec4899] group-hover:text-[#ec4899] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300">
                                    <span>BEATSTORE</span>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </m.div>
                        </Link>
                    </div>

                    {/* DIVIDER (DESKTOP ONLY) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent z-20 pointer-events-none" />

                    {/* LAB PORTAL (RIGHT/BOTTOM) */}
                    <div className="relative flex-1 group h-[50vh] md:h-auto overflow-hidden">
                        {/* Background: Slate */}
                        <div className="absolute inset-0 bg-[#0f172a] z-0" />

                        {/* Particle Effect */}
                        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath fill=%22none%22 stroke=%22%2300ff88%22 stroke-width=%220.5%22 d=%22M0 100 Q50 80 100 100 T200 100%22/%3E%3Cpath fill=%22none%22 stroke=%22%2300e5ff%22 stroke-width=%220.5%22 d=%22M0 110 Q50 90 100 110 T200 110%22/%3E%3C/svg%3E')] bg-repeat-x" />

                        {/* Glow on hover */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Content */}
                        <Link
                            href="/lab/healingwave"
                            className="relative z-10 flex flex-col items-center justify-center h-full w-full text-center p-8 hover:bg-white/[0.02] transition-all duration-500"
                        >
                            <m.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ...springConfig, delay: 0.4 }}
                            >
                                <p className="mono-label text-[#00ff88]/70 mb-4 tracking-[0.3em]">
                                    ENTER THE HEALINGWAVE
                                </p>

                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white group-hover:text-[#00ff88] transition-colors duration-300">
                                    VGP LAB
                                </h2>

                                <p className="text-white/40 text-sm max-w-xs mx-auto mb-8">
                                    Kinetic Functional Audio for Focus, Performance & Wellness
                                </p>

                                <div className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full text-xs tracking-widest group-hover:border-[#00ff88] group-hover:text-[#00ff88] group-hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300">
                                    <span>HEALINGWAVE</span>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </m.div>
                        </Link>
                    </div>
                </div>

                {/* SOCIAL DOCK - Fixed bottom center */}
                <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <SocialDock />
                    </div>
                </div>

            </div>
        </PageTransition>
    );
}
