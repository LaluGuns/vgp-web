'use client';

/**
 * Navbar - Y3K Sovereign Navigation with STUDIO dropdown
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';

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
    { name: 'BLOG', href: '/blog' },
    { name: 'ABOUT', href: '/about' },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [studioOpen, setStudioOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(href.split('/').slice(0, 3).join('/'));
    };

    const isStudioActive = () => {
        return pathname.startsWith('/studio');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
                <div className="y3k-glass rounded-xl px-4 sm:px-5 py-2.5 sm:py-3">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        {/* Logo + Brand Text */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
                                <Image
                                    src="/branding/logo-tg.png"
                                    alt="VGP"
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] hue-rotate-[20deg] saturate-150 group-hover:hue-rotate-0 group-hover:saturate-200 group-hover:brightness-125 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]"
                                />
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-bold text-sm tracking-wider text-primary transition-all duration-[1000ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]">
                                    VIRZY GUNS PRODUCTION
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link) => (
                                link.submenu ? (
                                    // STUDIO with dropdown
                                    <div
                                        key={link.name}
                                        className="relative"
                                        onMouseEnter={() => setStudioOpen(true)}
                                        onMouseLeave={() => setStudioOpen(false)}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`text-sm font-light transition-colors flex items-center gap-1 ${isStudioActive() ? 'text-[#ec4899]' : 'text-dim-grey hover:text-white'
                                                }`}
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
                                                    className="absolute top-full left-0 mt-2 py-2 px-1 y3k-glass rounded-lg min-w-[140px]"
                                                >
                                                    {link.submenu.map((sub) => (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${pathname === sub.href
                                                                ? 'text-[#ec4899] bg-white/5'
                                                                : 'text-dim-grey hover:text-white hover:bg-white/5'
                                                                }`}
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
                                        className={`text-sm font-light transition-colors ${isActive(link.href)
                                            ? link.name === 'LAB' ? 'text-[#00ff88]' : 'text-primary'
                                            : 'text-dim-grey hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            ))}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden w-8 h-8 flex items-center justify-center text-dim-grey hover:text-white"
                            aria-label="Menu"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                {mobileOpen ? (
                                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                                ) : (
                                    <path d="M4 8h16M4 16h16" strokeLinecap="round" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <m.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="lg:hidden mt-2 y3k-glass rounded-xl p-3"
                        >
                            <Link
                                href="/"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm ${pathname === '/' ? 'text-primary' : 'text-dim-grey'}`}
                            >
                                Home
                            </Link>

                            {/* Studio Section */}
                            <div className="px-4 py-2 text-xs text-[#ec4899]/70 tracking-widest">VGP STUDIO</div>
                            <Link
                                href="/studio/beats"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-6 py-2 rounded-lg text-sm ${pathname === '/studio/beats' ? 'text-[#ec4899]' : 'text-dim-grey'}`}
                            >
                                Beatstore
                            </Link>
                            <Link
                                href="/studio/masterclass"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-6 py-2 rounded-lg text-sm ${pathname === '/studio/masterclass' ? 'text-[#ec4899]' : 'text-dim-grey'}`}
                            >
                                Masterclass
                            </Link>

                            {/* Lab Section */}
                            <div className="px-4 py-2 mt-2 text-xs text-[#00ff88]/70 tracking-widest">VGP LAB</div>
                            <Link
                                href="/lab/healingwave"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-6 py-2 rounded-lg text-sm ${pathname === '/lab/healingwave' ? 'text-[#00ff88]' : 'text-dim-grey'}`}
                            >
                                HealingWave
                            </Link>

                            <div className="h-px bg-white/10 my-2" />

                            <Link
                                href="/blog"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm ${pathname === '/blog' ? 'text-primary' : 'text-dim-grey'}`}
                            >
                                BLOG
                            </Link>

                            <Link
                                href="/about"
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm ${pathname === '/about' ? 'text-primary' : 'text-dim-grey'}`}
                            >
                                ABOUT
                            </Link>
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
