'use client';

import {
    type KeyboardEvent as ReactKeyboardEvent,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown, CircleHelp, ListMusic, Menu, SlidersHorizontal, X } from 'lucide-react';
import { siteNav, studioNav } from '@/lib/vgp-ecosystem';
import { springFast } from '@/lib/motion-presets';

const mobileSiteNav = siteNav.filter(
    (item) => item.name !== 'Masterclass' && item.name !== 'Books',
);

const beatStoreNavCopy = {
    'en-US': {
        brand: 'Virzy Guns Beat Store',
        shortBrand: 'VGP Beats',
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
    const [studioOpen, setStudioOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const studioTriggerRef = useRef<HTMLButtonElement>(null);
    const studioItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const studioMenuId = useId();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 18);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMobileOpen(false);
            setStudioOpen(false);
        });

        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    useEffect(() => {
        if (!studioOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!navRef.current?.contains(event.target as Node)) {
                setStudioOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setStudioOpen(false);
                setTimeout(() => studioTriggerRef.current?.focus(), 0);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [studioOpen]);

    const isActive = (href: string, exact = false) => {
        if (exact) return pathname === href;
        if (href === '/') return pathname === '/';
        if (href === '/studio') return pathname.startsWith('/studio');
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const focusStudioItem = (index: number) => {
        const items = studioItemRefs.current.filter(
            (item): item is HTMLAnchorElement => item !== null,
        );
        if (items.length === 0) return;

        items[(index + items.length) % items.length]?.focus();
    };

    const openStudioMenuAt = (index: number) => {
        setStudioOpen(true);
        setTimeout(() => focusStudioItem(index), 0);
    };

    const handleStudioTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            openStudioMenuAt(0);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            openStudioMenuAt(-1);
        } else if (event.key === 'Escape' && studioOpen) {
            event.preventDefault();
            setStudioOpen(false);
        }
    };

    const handleStudioMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        const currentIndex = studioItemRefs.current.findIndex(
            (item) => item === document.activeElement,
        );

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusStudioItem(currentIndex + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusStudioItem(currentIndex - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusStudioItem(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusStudioItem(-1);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setStudioOpen(false);
            setTimeout(() => studioTriggerRef.current?.focus(), 0);
        } else if (event.key === 'Tab') {
            setStudioOpen(false);
        }
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
        <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-6">
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

                    <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
                        {isBeatStore ? (
                            <>
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
                        ) : siteNav.map((item) => {
                            if (item.name === 'Studio') {
                                return (
                                    <div key={item.href} className="relative">
                                        <button
                                            ref={studioTriggerRef}
                                            type="button"
                                            onClick={() => setStudioOpen((open) => !open)}
                                            onKeyDown={handleStudioTriggerKeyDown}
                                            aria-expanded={studioOpen}
                                            aria-haspopup="menu"
                                            aria-controls={studioMenuId}
                                            className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition ${
                                                isActive(item.href)
                                                    ? 'bg-white/[0.08] text-white'
                                                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                            }`}
                                        >
                                            <span>Studio</span>
                                            <ChevronDown
                                                className={`h-3.5 w-3.5 transition ${studioOpen ? 'rotate-180' : ''}`}
                                                aria-hidden="true"
                                            />
                                        </button>

                                        {studioOpen ? (
                                            <div className="absolute left-0 top-[calc(100%+0.55rem)] z-[90] w-56">
                                                <div
                                                    id={studioMenuId}
                                                    role="menu"
                                                    onKeyDown={handleStudioMenuKeyDown}
                                                    className="liquid-glass-strong rounded-lg p-2 shadow-[0_22px_70px_rgba(0,0,0,0.42)]"
                                                >
                                                    {studioNav.map((sub, index) => (
                                                        <Link
                                                            ref={(element) => {
                                                                studioItemRefs.current[index] = element;
                                                            }}
                                                            key={sub.href}
                                                            href={sub.href}
                                                            role="menuitem"
                                                            aria-current={isActive(sub.href, true) ? 'page' : undefined}
                                                            onClick={() => setStudioOpen(false)}
                                                            className={`block rounded-md px-3 py-2.5 text-sm transition focus:bg-white/[0.05] focus:text-white focus:outline-none ${
                                                                isActive(sub.href, true)
                                                                    ? 'bg-white/[0.07] text-white'
                                                                    : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                                            }`}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive(item.href) ? 'page' : undefined}
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
                            href={isBeatStore ? `${beatStoreBase}#beats-inventory` : '/studio/beats'}
                            className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-white/15 bg-white px-4 text-xs font-semibold text-[#030405] transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            {isBeatStore ? beatNav.cta : 'Enter Studio'}
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
                            {isBeatStore ? (
                                <>
                                    <Link
                                        href={`${beatStoreBase}#beats-inventory`}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <ListMusic className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.browse}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openBeatStorePanel('finder')}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.finder}
                                    </button>
                                    <Link
                                        href={`${beatStoreBase}/licensing`}
                                        className="flex min-h-11 items-center rounded-lg px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        {beatNav.licensing}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openBeatStorePanel('store')}
                                        className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        <CircleHelp className="h-4 w-4" aria-hidden="true" />
                                        {beatNav.howMobile}
                                    </button>
                                </>
                            ) : [{ name: 'Home', href: '/' }, ...mobileSiteNav].map((item) => {
                                if (item.name === 'Studio') {
                                    return (
                                        <div key={item.href} className="rounded-lg bg-white/[0.03] p-1">
                                            <Link
                                                href={item.href}
                                                aria-current={pathname === item.href ? 'page' : undefined}
                                                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                                                    isActive(item.href)
                                                        ? 'bg-white/[0.08] text-white'
                                                        : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                                                }`}
                                            >
                                                Studio
                                            </Link>
                                            <div className="mt-1 grid gap-1 border-t border-white/10 pt-1">
                                                {studioNav.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        aria-current={isActive(sub.href, true) ? 'page' : undefined}
                                                        className={`rounded-lg px-3 py-2 text-sm transition ${
                                                            isActive(sub.href, true)
                                                                ? 'bg-white/[0.07] text-white'
                                                                : 'text-white/50 hover:bg-white/[0.05] hover:text-white'
                                                        }`}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={isActive(item.href) ? 'page' : undefined}
                                        className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
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
                    </m.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
