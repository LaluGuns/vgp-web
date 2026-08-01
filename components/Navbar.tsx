'use client';

import { useId, useRef, useState, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown, CircleHelp, Home, ListMusic, Menu, SlidersHorizontal, X } from 'lucide-react';
import { FLOW_APP_URL, mainNavGroups } from '@/lib/vgp-ecosystem';
import { springFast } from '@/lib/motion-presets';

const beatStoreNavCopy = {
    'en-US': {
        brand: 'Virzy Guns Beat Store',
        shortBrand: 'VGP Beats',
        home: 'Back to Home',
        browse: 'Browse beats',
        finder: 'Beat finder',
        licensing: 'Licensing',
        how: 'How it works',
        howMobile: 'How the store works',
        cta: 'Browse & license',
    },
    'ja-JP': {
        brand: 'Virzy Guns ビートストア',
        shortBrand: 'VGP Beats',
        home: 'ホームに戻る',
        browse: 'ビートを探す',
        finder: 'ビートファインダー',
        licensing: 'ライセンス',
        how: '購入ガイド',
        howMobile: 'ストアの使い方',
        cta: '試聴・ライセンス',
    },
    'de-DE': {
        brand: 'Virzy Guns Beat Store',
        shortBrand: 'VGP Beats',
        home: 'Zurück zur Startseite',
        browse: 'Beats durchsuchen',
        finder: 'Beat-Finder',
        licensing: 'Lizenzen',
        how: 'So funktioniert es',
        howMobile: 'So funktioniert der Store',
        cta: 'Anhören & lizenzieren',
    },
} as const;

export function Navbar() {
    const pathname = usePathname();
    const beatStoreLocale = pathname.startsWith('/ja-JP/')
        ? 'ja-JP'
        : pathname.startsWith('/de-DE/')
            ? 'de-DE'
            : 'en-US';
    const beatNav = beatStoreNavCopy[beatStoreLocale];
    const isBeatStore = /^\/(?:(?:ja-JP|de-DE)\/)?studio\/beats(?:\/|$)/.test(pathname);
    const beatStoreBase = pathname.startsWith('/ja-JP/')
        ? '/ja-JP/studio/beats'
        : pathname.startsWith('/de-DE/')
            ? '/de-DE/studio/beats'
            : '/studio/beats';
    const isBeatStoreHome = pathname === beatStoreBase;

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const navRef = useRef<HTMLElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);
    const mobileTriggerRef = useRef<HTMLButtonElement>(null);
    const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const mobilePanelId = useId();
    const hadMobileMenuOpen = useRef(false);

    const isAppPage = pathname.startsWith('/flow') || pathname.startsWith('/cadenz') || pathname.startsWith('/lab');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 18);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleOpenMobileMenu = () => setMobileOpen(true);
        window.addEventListener('vgp:open-mobile-menu', handleOpenMobileMenu);
        return () => window.removeEventListener('vgp:open-mobile-menu', handleOpenMobileMenu);
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMobileOpen(false);
            setOpenGroup(null);
        });

        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            hadMobileMenuOpen.current = true;
            document.body.style.overflow = 'hidden';
            const frame = requestAnimationFrame(() => mobilePanelRef.current?.focus());
            return () => {
                cancelAnimationFrame(frame);
                document.body.style.overflow = '';
            };
        } else {
            document.body.style.overflow = '';
            if (hadMobileMenuOpen.current) {
                hadMobileMenuOpen.current = false;
                mobileTriggerRef.current?.focus();
            }
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    // Close dropdowns on pointerdown outside or Escape key
    useEffect(() => {
        if (!openGroup && !mobileOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!navRef.current?.contains(target) && !mobilePanelRef.current?.contains(target)) {
                setOpenGroup(null);
                setMobileOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpenGroup(null);
                setMobileOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openGroup, mobileOpen]);

    const handleMobilePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Tab') return;

        const focusable = Array.from(
            mobilePanelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const openBeatStorePanel = (panel: 'store' | 'finder') => {
        setMobileOpen(false);
        if (isBeatStoreHome) {
            window.dispatchEvent(new CustomEvent(`vgp:open-${panel}-guide`));
            return;
        }
        window.location.assign(`${beatStoreBase}?panel=${panel}`);
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
            <nav
                ref={navRef}
                className={`liquid-glass-soft mx-auto h-14 max-w-5xl overflow-visible rounded-full !bg-[#03131d] px-3 py-2 transition duration-300 ${
                    scrolled
                        ? 'border-sky-200/20 shadow-[0_18px_60px_rgba(0,0,0,0.46)]'
                        : 'shadow-[0_12px_40px_rgba(0,0,0,0.28)]'
                }`}
                aria-label="Main navigation"
            >
                <div className="flex h-full items-center justify-between gap-3">
                    {/* Brand Logo */}
                    <Link
                        href={isBeatStore ? beatStoreBase : '/'}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-full pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 sm:gap-3 sm:pr-3 lg:flex-none"
                        aria-label={isBeatStore ? beatNav.brand : 'Virzy Guns Production home'}
                    >
                        <Image
                            src="/branding/logo-tg.png"
                            alt="VGP"
                            width={36}
                            height={36}
                            className="h-8 w-8 shrink-0 object-contain opacity-90 saturate-[0.4] contrast-125 sm:h-9 sm:w-9"
                            priority
                        />
                        <span className="min-w-0 truncate text-xs font-semibold text-white sm:text-sm">
                            <span className="sm:hidden">{isBeatStore ? beatNav.shortBrand : 'Virzy Guns'}</span>
                            <span className="hidden sm:inline">{isBeatStore ? beatNav.brand : 'Virzy Guns Production'}</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Groups (Studio, Apps, Learn, About) */}
                    <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
                        {isBeatStore ? (
                            <>
                                <Link
                                    href="/"
                                    className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-sky-400/10 border border-sky-400/20 px-3 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/20 hover:text-white"
                                >
                                    <Home className="h-3.5 w-3.5" aria-hidden="true" />
                                    {beatNav.home}
                                </Link>
                                <Link
                                    href={`${beatStoreBase}#beats-inventory`}
                                    className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    <ListMusic className="h-3.5 w-3.5" aria-hidden="true" />
                                    {beatNav.browse}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => openBeatStorePanel('finder')}
                                    className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                    {beatNav.finder}
                                </button>
                                <Link
                                    href={`${beatStoreBase}/licensing`}
                                    className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-xs font-semibold transition ${
                                        pathname.endsWith('/licensing')
                                            ? 'bg-white/[0.08] text-white'
                                            : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                >
                                    {beatNav.licensing}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => openBeatStorePanel('store')}
                                    className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                                    {beatNav.how}
                                </button>
                            </>
                        ) : mainNavGroups.map((group) => {
                            const isGroupActive = group.activePrefixes?.some((prefix) => isActive(prefix)) ?? pathname.startsWith(group.href);

                            if (group.key === 'about') {
                                return (
                                    <Link
                                        key={group.key}
                                        href={group.href}
                                        aria-current={isActive(group.href, true) ? 'page' : undefined}
                                        className={`inline-flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition ${
                                            isActive(group.href, true)
                                                ? 'bg-white/[0.08] text-white'
                                                : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                                        }`}
                                    >
                                        {group.name}
                                    </Link>
                                );
                            }

                            const isOpen = openGroup === group.key;

                            return (
                                <div
                                    key={group.key}
                                    className="relative py-1"
                                    onMouseEnter={() => setOpenGroup(group.key)}
                                    onMouseLeave={() => setOpenGroup(null)}
                                >
                                    <button
                                        ref={(el) => {
                                            triggerRefs.current[group.key] = el;
                                        }}
                                        type="button"
                                        onClick={() => setOpenGroup(isOpen ? null : group.key)}
                                        aria-expanded={isOpen}
                                        aria-haspopup="menu"
                                        className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition ${
                                            isGroupActive || isOpen
                                                ? 'bg-white/[0.08] text-white'
                                                : 'text-white/65 hover:bg-white/[0.05] hover:text-white'
                                        }`}
                                    >
                                        <span>{group.name}</span>
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <m.div
                                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                                className="absolute left-0 top-full pt-1.5 z-[90] w-64"
                                            >
                                                <div
                                                    role="menu"
                                                    className="liquid-glass-strong rounded-xl p-2 shadow-[0_22px_70px_rgba(0,0,0,0.55)] border border-white/15 bg-[#03131d]/98 backdrop-blur-xl"
                                                >
                                                    {group.children.map((sub) => {
                                                        const isExternal = sub.external || sub.href.startsWith('http');
                                                        const linkClasses = `block rounded-lg px-3.5 py-2.5 transition focus:outline-none ${
                                                            isActive(sub.href, true)
                                                                ? 'bg-white/[0.09] text-white'
                                                                : 'hover:bg-white/[0.06] text-white/70 hover:text-white'
                                                        }`;

                                                        return isExternal ? (
                                                            <a
                                                                key={sub.href}
                                                                href={sub.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                role="menuitem"
                                                                onClick={() => setOpenGroup(null)}
                                                                className={linkClasses}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-xs font-semibold text-white">{sub.name}</span>
                                                                    {sub.status && (
                                                                        <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-medium text-sky-200 ring-1 ring-sky-400/30">
                                                                            {sub.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {sub.description && (
                                                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-white/45">
                                                                        {sub.description}
                                                                    </p>
                                                                )}
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                key={sub.href}
                                                                href={sub.href}
                                                                role="menuitem"
                                                                onClick={() => setOpenGroup(null)}
                                                                className={linkClasses}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-xs font-semibold text-white">{sub.name}</span>
                                                                    {sub.status && (
                                                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                                                                            sub.status === 'Available'
                                                                                ? 'bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/30'
                                                                                : sub.status === 'Free'
                                                                                    ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/30'
                                                                                    : 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30'
                                                                        }`}>
                                                                            {sub.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {sub.description && (
                                                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-white/45">
                                                                        {sub.description}
                                                                    </p>
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contextual Desktop CTA Button */}
                    <div className="hidden items-center gap-2 lg:flex">
                        {isAppPage ? (
                            <a
                                href={FLOW_APP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-sky-300/30 bg-sky-400/15 px-4 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            >
                                Open Flow
                            </a>
                        ) : (
                            <Link
                                href={isBeatStore ? `${beatStoreBase}#beats-inventory` : '/studio/beats'}
                                className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-white/15 bg-white px-4 text-xs font-semibold text-[#030405] transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            >
                                {isBeatStore ? beatNav.cta : 'Browse Beats'}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        ref={mobileTriggerRef}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white lg:hidden"
                        aria-expanded={mobileOpen}
                        aria-controls={mobilePanelId}
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileOpen ? (
                    <m.div
                        id={mobilePanelId}
                        ref={mobilePanelRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                        onKeyDown={handleMobilePanelKeyDown}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={springFast}
                        className="liquid-glass-strong mx-auto mt-2 max-h-[calc(100dvh-5.75rem)] max-w-7xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#03131d]/98 p-4 shadow-2xl outline-none backdrop-blur-2xl lg:hidden"
                    >
                        <div className="grid gap-5">
                            {isBeatStore ? (
                                <div className="grid gap-1">
                                    <Link
                                        href="/"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 items-center gap-3 rounded-lg bg-sky-400/10 border border-sky-400/20 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/20"
                                    >
                                        <Home className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.home}
                                    </Link>
                                    <Link
                                        href={`${beatStoreBase}#beats-inventory`}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <ListMusic className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.browse}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openBeatStorePanel('finder')}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.finder}
                                    </button>
                                    <Link
                                        href={`${beatStoreBase}/licensing`}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 items-center rounded-lg px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        {beatNav.licensing}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openBeatStorePanel('store')}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <CircleHelp className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.howMobile}
                                    </button>
                                </div>
                            ) : (
                                mainNavGroups.map((group) => (
                                    <div key={group.key} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                                        <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-sky-200/60">
                                            {group.name}
                                        </p>
                                        <div className="grid gap-1">
                                            {group.children.map((sub) => {
                                                const isExternal = sub.external || sub.href.startsWith('http');
                                                const linkClasses = `flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                                    isActive(sub.href, true)
                                                        ? 'bg-white/[0.09] text-white'
                                                        : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                                                }`;

                                                return isExternal ? (
                                                    <a
                                                        key={sub.href}
                                                        href={sub.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setMobileOpen(false)}
                                                        className={linkClasses}
                                                    >
                                                        <span className="truncate">{sub.name}</span>
                                                        {sub.status && (
                                                            <span className="ml-2 rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-medium text-sky-200 shrink-0">
                                                                {sub.status}
                                                            </span>
                                                        )}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={linkClasses}
                                                    >
                                                        <span className="truncate">{sub.name}</span>
                                                        {sub.status && (
                                                            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                                                                sub.status === 'Available'
                                                                    ? 'bg-sky-400/20 text-sky-200'
                                                                    : sub.status === 'Free'
                                                                        ? 'bg-emerald-400/20 text-emerald-200'
                                                                        : 'bg-amber-400/20 text-amber-200'
                                                            }`}>
                                                                {sub.status}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Mobile Contextual Action Bar */}
                            <div className="border-t border-white/10 pt-3">
                                {isAppPage ? (
                                    <a
                                        href={FLOW_APP_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-400/20 border border-sky-300/30 text-sm font-semibold text-sky-100 transition active:scale-[0.98]"
                                    >
                                        Open Flow App
                                    </a>
                                ) : (
                                    <Link
                                        href="/studio/beats"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#030405] transition active:scale-[0.98]"
                                    >
                                        Browse Beats
                                    </Link>
                                )}
                            </div>
                        </div>
                    </m.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
