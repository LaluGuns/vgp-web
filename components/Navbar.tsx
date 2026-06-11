'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { siteNav, studioNav } from '@/lib/vgp-ecosystem';
import { springFast } from '@/lib/motion-presets';

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 18);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMobileOpen(false);
        });

        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        if (href === '/studio') return pathname.startsWith('/studio');
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-6">
            <nav
                className={`liquid-glass-soft mx-auto h-14 max-w-5xl overflow-visible rounded-full px-3 py-2 transition duration-300 ${
                    scrolled
                        ? 'shadow-[0_18px_60px_rgba(0,0,0,0.34)]'
                        : ''
                }`}
                aria-label="Main navigation"
            >
                <div className="flex h-full items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="flex min-w-0 shrink-0 items-center gap-3 rounded-full pr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70"
                        aria-label="Virzy Guns Production home"
                    >
                        <Image
                            src="/branding/logo-tg.png"
                            alt="VGP"
                            width={36}
                            height={36}
                            className="h-9 w-9 shrink-0 object-contain opacity-60 brightness-50 saturate-[0.45] contrast-125"
                            priority
                        />
                        <span className="hidden whitespace-nowrap text-sm font-semibold text-white sm:block">
                            Virzy Guns Production
                        </span>
                    </Link>

                    <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
                        {siteNav.map((item) => {
                            if (item.name === 'Studio') {
                                return (
                                    <div key={item.href} className="group relative">
                                        <Link
                                            href={item.href}
                                            className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition ${
                                                isActive(item.href)
                                                    ? 'bg-white/[0.08] text-white'
                                                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                            }`}
                                        >
                                            <span>Studio</span>
                                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                        </Link>

                                        <div className="pointer-events-none absolute left-0 top-full z-[90] w-56 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                                            <div className="liquid-glass-strong rounded-lg p-2 shadow-[0_22px_70px_rgba(0,0,0,0.42)]">
                                                {studioNav.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={`block rounded-md px-3 py-2.5 text-sm transition ${
                                                            isActive(sub.href)
                                                                ? 'bg-white/[0.07] text-white'
                                                                : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                                        }`}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-xs font-semibold transition ${
                                        isActive(item.href)
                                            ? 'bg-white/[0.08] text-white'
                                            : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden items-center gap-2 lg:flex">
                        <Link
                            href="/studio/beats"
                            className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-white/15 bg-white px-4 text-xs font-semibold text-[#030405] transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            Enter Studio
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white lg:hidden"
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-nav-panel"
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {mobileOpen ? (
                    <m.div
                        id="mobile-nav-panel"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={springFast}
                        className="liquid-glass-strong mx-auto mt-2 max-w-7xl overflow-hidden rounded-lg p-3 lg:hidden"
                    >
                        <div className="grid gap-1">
                            {[{ name: 'Home', href: '/' }, ...siteNav].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive(item.href)
                                            ? 'bg-white/[0.08] text-white'
                                            : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </m.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
