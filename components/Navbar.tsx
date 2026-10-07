'use client';

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { CADENZ_PLAY_URL, FLOW_APP_URL, mainNavGroups, type NavChild } from '@/lib/vgp-ecosystem';

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

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

// Most items are live, so only the exceptions get a label.
function StatusText({ status }: { status: NavChild['status'] }) {
    if (!status || status === 'Available') return null;
    return (
        <span className="shrink-0 text-xs font-medium text-white/50">
            {status === 'Coming Soon' ? 'Coming soon' : status}
        </span>
    );
}

function NavItemLink({
    item,
    className,
    onNavigate,
    current,
    children,
}: {
    item: NavChild;
    className: string;
    onNavigate: () => void;
    current?: boolean;
    children: ReactNode;
}) {
    if (item.external || item.href.startsWith('http')) {
        return (
            <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={className}>
                {children}
            </a>
        );
    }

    return (
        <Link href={item.href} onClick={onNavigate} aria-current={current ? 'page' : undefined} className={className}>
            {children}
        </Link>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
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
    const isFlowContext = pathname.startsWith('/flow');
    // The ja-JP and de-DE stores keep their own translated menu. The English
    // store is part of the main site and uses the main menu.
    const useStoreNav = isBeatStore && beatStoreLocale !== 'en-US';

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    const navRef = useRef<HTMLElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);
    const mobileTriggerRef = useRef<HTMLButtonElement>(null);
    const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const openedByHover = useRef(false);
    const closeTimer = useRef<number | null>(null);
    const hadMobileMenuOpen = useRef(false);
    const menuId = useId();
    const mobilePanelId = `${menuId}-mobile`;

    const cta = isBeatStore
        ? { label: beatNav.cta, href: `${beatStoreBase}#beats-inventory` }
        : isFlowContext
            ? { label: 'Open Flow', href: FLOW_APP_URL }
            : { label: 'Get CADENZ', href: CADENZ_PLAY_URL };
    const ctaIsExternal = cta.href.startsWith('http');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleOpenMobileMenu = () => setMobileOpen(true);
        window.addEventListener('vgp:open-mobile-menu', handleOpenMobileMenu);
        return () => window.removeEventListener('vgp:open-mobile-menu', handleOpenMobileMenu);
    }, []);

    // Close every menu after navigation.
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMobileOpen(false);
            setOpenGroup(null);
        });

        return () => cancelAnimationFrame(frame);
    }, [pathname]);

    useEffect(() => () => {
        if (closeTimer.current) window.clearTimeout(closeTimer.current);
    }, []);

    // Lock body scroll while the mobile menu is open and move focus into it.
    useEffect(() => {
        if (mobileOpen) {
            hadMobileMenuOpen.current = true;
            document.body.style.overflow = 'hidden';
            const frame = requestAnimationFrame(() => mobilePanelRef.current?.focus());
            return () => {
                cancelAnimationFrame(frame);
                document.body.style.overflow = '';
            };
        }

        document.body.style.overflow = '';
        if (hadMobileMenuOpen.current) {
            hadMobileMenuOpen.current = false;
            mobileTriggerRef.current?.focus();
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    // Close menus on a pointer press outside them, or on Escape.
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
            if (event.key !== 'Escape') return;
            event.preventDefault();
            if (openGroup) {
                triggerRefs.current[openGroup]?.focus();
                setOpenGroup(null);
            }
            setMobileOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openGroup, mobileOpen]);

    const cancelClose = () => {
        if (closeTimer.current) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const openOnHover = (key: string) => {
        cancelClose();
        if (openGroup === key) return;
        openedByHover.current = true;
        setOpenGroup(key);
    };

    // A menu opened by hover closes when the pointer leaves. One opened (or
    // pinned) by a click stays until a second click, Escape, or a click outside.
    const closeOnLeave = () => {
        if (!openedByHover.current) return;
        cancelClose();
        closeTimer.current = window.setTimeout(() => setOpenGroup(null), 140);
    };

    const toggleOnClick = (key: string) => {
        cancelClose();
        if (openGroup === key && !openedByHover.current) {
            setOpenGroup(null);
            return;
        }
        openedByHover.current = false;
        setOpenGroup(key);
    };

    const closeOnFocusLeave = (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpenGroup(null);
        }
    };

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
        router.push(`${beatStoreBase}?panel=${panel}`);
    };

    const closeAll = () => {
        setOpenGroup(null);
        setMobileOpen(false);
    };

    const desktopItemClass = (active: boolean) =>
        `inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors ${focusRing} ${
            active ? 'text-white' : 'text-white/65 hover:text-white'
        }`;

    const mobileRowClass = (active: boolean) =>
        `flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left text-base font-medium transition-colors ${focusRing} ${
            active ? 'text-white' : 'text-white/80 hover:text-white'
        }`;

    const beatStoreItems: Array<
        | { kind: 'link'; label: string; href: string; active: boolean }
        | { kind: 'panel'; label: string; mobileLabel?: string; panel: 'store' | 'finder' }
    > = [
        { kind: 'link', label: beatNav.home, href: '/', active: false },
        { kind: 'link', label: beatNav.browse, href: `${beatStoreBase}#beats-inventory`, active: false },
        { kind: 'panel', label: beatNav.finder, panel: 'finder' },
        { kind: 'link', label: beatNav.licensing, href: `${beatStoreBase}/licensing`, active: pathname.endsWith('/licensing') },
        { kind: 'panel', label: beatNav.how, mobileLabel: beatNav.howMobile, panel: 'store' },
    ];

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b bg-[#050607]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-colors duration-200 ${
                scrolled || mobileOpen ? 'border-white/10' : 'border-transparent'
            }`}
        >
            <nav ref={navRef} aria-label="Main navigation" className="px-4 sm:px-6">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
                    <Link
                        href={useStoreNav ? beatStoreBase : '/'}
                        className={`flex min-w-0 items-center gap-3 rounded-md ${focusRing}`}
                        aria-label={useStoreNav ? beatNav.brand : 'Virzy Guns, home'}
                    >
                        <Image
                            src="/branding/logo-tg.png"
                            alt=""
                            width={32}
                            height={32}
                            className="h-9 w-9 shrink-0 object-contain brightness-0 invert"
                            priority
                        />
                        <span className="truncate text-sm font-semibold text-white">
                            <span className="sm:hidden">{useStoreNav ? beatNav.shortBrand : 'Virzy Guns'}</span>
                            <span className="hidden sm:inline">{useStoreNav ? beatNav.brand : 'Virzy Guns'}</span>
                        </span>
                    </Link>

                    <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
                        {useStoreNav
                            ? beatStoreItems.map((item) =>
                                item.kind === 'link' ? (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        aria-current={item.active ? 'page' : undefined}
                                        className={desktopItemClass(item.active)}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => openBeatStorePanel(item.panel)}
                                        className={desktopItemClass(false)}
                                    >
                                        {item.label}
                                    </button>
                                ),
                            )
                            : mainNavGroups.map((group) => {
                                const isGroupActive =
                                    (group.activeExact?.includes(pathname) ?? false) ||
                                    (group.activePrefixes?.some((prefix) => isActive(prefix)) ?? false);

                                if (group.children.length === 0) {
                                    const active = isGroupActive;
                                    return (
                                        <Link
                                            key={group.key}
                                            href={group.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={desktopItemClass(active)}
                                        >
                                            {group.name}
                                        </Link>
                                    );
                                }

                                const isOpen = openGroup === group.key;
                                const panelId = `${menuId}-${group.key}`;

                                return (
                                    <div
                                        key={group.key}
                                        className="relative"
                                        onMouseEnter={() => openOnHover(group.key)}
                                        onMouseLeave={closeOnLeave}
                                        onBlur={closeOnFocusLeave}
                                    >
                                        <button
                                            ref={(el) => {
                                                triggerRefs.current[group.key] = el;
                                            }}
                                            type="button"
                                            onClick={() => toggleOnClick(group.key)}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            className={desktopItemClass(isGroupActive || isOpen)}
                                        >
                                            {group.name}
                                            <ChevronDown
                                                className={`h-3.5 w-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                                                aria-hidden="true"
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isOpen ? (
                                                <m.div
                                                    id={panelId}
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 4 }}
                                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                                    className="absolute left-0 top-full z-[90] w-80 pt-2"
                                                >
                                                    <ul className="rounded-lg border border-white/10 bg-[#0a0e12] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                                                        {group.children.map((item) => {
                                                            const current = !item.external && isActive(item.href, true);
                                                            return (
                                                                <li key={item.href}>
                                                                    <NavItemLink
                                                                        item={item}
                                                                        current={current}
                                                                        onNavigate={() => setOpenGroup(null)}
                                                                        className={`block rounded-md px-3 py-2.5 transition-colors hover:bg-white/[0.05] ${focusRing} ${
                                                                            current ? 'bg-white/[0.06]' : ''
                                                                        }`}
                                                                    >
                                                                        <span className="flex items-baseline justify-between gap-3">
                                                                            <span className="text-sm font-semibold text-white">{item.name}</span>
                                                                            <StatusText status={item.status} />
                                                                        </span>
                                                                        {item.description ? (
                                                                            <span className="mt-0.5 block text-xs leading-5 text-white/55">
                                                                                {item.description}
                                                                            </span>
                                                                        ) : null}
                                                                    </NavItemLink>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </m.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="hidden lg:block">
                        {ctaIsExternal ? (
                            <a
                                href={cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex h-10 items-center whitespace-nowrap rounded-full bg-white px-4 text-sm font-semibold text-[#050607] transition-colors hover:bg-white/85 ${focusRing}`}
                            >
                                {cta.label}
                            </a>
                        ) : (
                            <Link
                                href={cta.href}
                                className={`inline-flex h-10 items-center whitespace-nowrap rounded-full bg-white px-4 text-sm font-semibold text-[#050607] transition-colors hover:bg-white/85 ${focusRing}`}
                            >
                                {cta.label}
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        ref={mobileTriggerRef}
                        className={`-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-white lg:hidden ${focusRing}`}
                        aria-expanded={mobileOpen}
                        aria-controls={mobilePanelId}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {mobileOpen ? (
                    <m.div
                        id={mobilePanelId}
                        ref={mobilePanelRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                        onKeyDown={handleMobilePanelKeyDown}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain bg-[#050607] px-4 pb-10 pt-2 outline-none sm:px-6 lg:hidden"
                    >
                        <div className="mx-auto grid max-w-7xl gap-8">
                            {useStoreNav ? (
                                <ul className="divide-y divide-white/[0.06]">
                                    {beatStoreItems.map((item) => (
                                        <li key={item.label}>
                                            {item.kind === 'link' ? (
                                                <Link
                                                    href={item.href}
                                                    onClick={closeAll}
                                                    aria-current={item.active ? 'page' : undefined}
                                                    className={mobileRowClass(item.active)}
                                                >
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openBeatStorePanel(item.panel)}
                                                    className={mobileRowClass(false)}
                                                >
                                                    {item.mobileLabel ?? item.label}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                mainNavGroups.map((group) => group.children.length === 0 ? (
                                    <Link
                                        key={group.key}
                                        href={group.href}
                                        onClick={closeAll}
                                        aria-current={pathname === group.href ? 'page' : undefined}
                                        className={`${mobileRowClass(pathname === group.href)} border-b border-white/[0.06] text-lg`}
                                    >
                                        {group.name}
                                    </Link>
                                ) : (
                                    <section key={group.key} aria-labelledby={`${menuId}-${group.key}-heading`}>
                                        <h2 id={`${menuId}-${group.key}-heading`} className="text-xs font-medium text-white/50">
                                            {group.name}
                                        </h2>
                                        <ul className="mt-1 divide-y divide-white/[0.06]">
                                            {group.children.map((item) => {
                                                const current = !item.external && isActive(item.href, true);
                                                return (
                                                    <li key={item.href}>
                                                        <NavItemLink
                                                            item={item}
                                                            current={current}
                                                            onNavigate={closeAll}
                                                            className={mobileRowClass(current)}
                                                        >
                                                            <span className="truncate">{item.name}</span>
                                                            <StatusText status={item.status} />
                                                        </NavItemLink>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </section>
                                ))
                            )}

                            {ctaIsExternal ? (
                                <a
                                    href={cta.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={closeAll}
                                    className={`flex min-h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-[#050607] ${focusRing}`}
                                >
                                    {cta.label}
                                </a>
                            ) : (
                                <Link
                                    href={cta.href}
                                    onClick={closeAll}
                                    className={`flex min-h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-[#050607] ${focusRing}`}
                                >
                                    {cta.label}
                                </Link>
                            )}
                        </div>
                    </m.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
