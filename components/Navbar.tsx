'use client';

/**
 * Navbar — Y3K Robot Chrome Navigation
 * Desktop: Frosted glass pill with chrome border
 * Mobile: Bottom tab bar (native app feel)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { springFast } from '@/lib/motion-presets';

const navLinks = [
    { name: 'HOME', href: '/', icon: '⬡' },
    {
        name: 'STUDIO',
        href: '/studio/beats',
        icon: '◆',
        submenu: [
            { name: 'Beatstore', href: '/studio/beats' },
            { name: 'Masterclass', href: '/studio/masterclass' },
        ]
    },
    { name: 'LAB', href: '/lab/healingwave', icon: '◎' },
    { name: 'BLOG', href: '/blog', icon: '▣' },
    { name: 'ABOUT', href: '/about', icon: '◈' },
];

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [studioOpen, setStudioOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const isStudioActive = () => {
        return pathname.startsWith('/studio');
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide navbar on home page (has its own nav)
    if (pathname === '/') return null;

    return (
        <>
            {/* ═══════════════════════════════════════════
                DESKTOP NAVBAR
                ═══════════════════════════════════════════ */}
            <header
                className={`
                    fixed top-0 left-0 right-0 z-50 hidden md:block
                    transition-all duration-500
                    ${scrolled ? 'py-3' : 'py-5'}
                `}
            >
                <nav className={`
                    max-w-4xl mx-auto px-1
                    transition-all duration-500
                    ${scrolled ? 'bg-[#0C0E14]/80 backdrop-blur-2xl border border-[rgba(200,204,212,0.06)] rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : ''}
                `}>
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 relative">
                                <Image
                                    src="/branding/logo-tg.png"
                                    alt="VGP"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(0,212,255,0.5)]"
                                />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">
                                <span className="gradient-text">VGP</span>
                            </span>
                        </Link>

                        {/* Nav Links */}
                        <div className="flex items-center gap-1">
                            {navLinks.map((link) => (
                                'submenu' in link ? (
                                    <div
                                        key={link.name}
                                        className="relative"
                                        onMouseEnter={() => setStudioOpen(true)}
                                        onMouseLeave={() => setStudioOpen(false)}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`
                                                relative px-4 py-2 text-xs tracking-[0.2em] rounded-full
                                                flex items-center gap-1.5 transition-all duration-300
                                                ${isStudioActive()
                                                    ? 'text-white bg-white/[0.06]'
                                                    : 'text-[var(--chrome-dim)] hover:text-white hover:bg-white/[0.03]'
                                                }
                                            `}
                                        >
                                            {link.name}
                                            <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>

                                        {/* Dropdown */}
                                        <AnimatePresence>
                                            {studioOpen && (
                                                <m.div
                                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                                    transition={springFast}
                                                    className="absolute top-full left-0 mt-2 py-2 px-1 bg-[#11131A]/95 backdrop-blur-2xl border border-[rgba(200,204,212,0.06)] rounded-xl min-w-[160px] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
                                                >
                                                    {link.submenu && link.submenu.map((sub) => (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            className={`
                                                                block px-4 py-2.5 text-sm rounded-lg transition-all duration-200
                                                                ${isActive(sub.href)
                                                                    ? 'text-[var(--studio-accent)] bg-[rgba(255,60,172,0.08)]'
                                                                    : 'text-[var(--chrome-dim)] hover:text-[var(--studio-accent)] hover:bg-white/[0.03]'
                                                                }
                                                            `}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            relative px-4 py-2 text-xs tracking-[0.2em] rounded-full
                                            transition-all duration-300
                                            ${isActive(link.href)
                                                ? 'text-white bg-white/[0.06]'
                                                : 'text-[var(--chrome-dim)] hover:text-white hover:bg-white/[0.03]'
                                            }
                                        `}
                                    >
                                        {link.name}
                                        {isActive(link.href) && (
                                            <m.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--cyan)]"
                                                style={{ boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)' }}
                                                transition={springFast}
                                            />
                                        )}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
}
