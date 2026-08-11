'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppWindow, Home, Headphones, BookOpen, Menu } from 'lucide-react';

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
    const pathname = usePathname();
    const isBeatStore = /^\/(?:(?:ja-JP|de-DE)\/)?studio\/beats(?:\/|$)/.test(pathname);
    const isCadenzPage = pathname === '/cadenz' || pathname.startsWith('/cadenz/');

    // Hide if inside BeatStars store view to prevent overlap with audio player
    if (isBeatStore) return null;

    const navItems = [
        { name: 'Home', href: '/', icon: Home, exact: true },
        { name: 'Beats', href: '/studio/beats', icon: Headphones },
        { name: 'Apps', href: isCadenzPage ? '/cadenz' : '/flow', icon: AppWindow },
        { name: 'Learn', href: '/learn', icon: BookOpen },
    ];

    const isItemActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const handleMenuClick = () => {
        if (onOpenMenu) {
            onOpenMenu();
        } else {
            window.dispatchEvent(new CustomEvent('vgp:open-mobile-menu'));
        }
    };

    return (
        <nav
            aria-label="Mobile navigation"
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#03131d]/95 pt-2 backdrop-blur-xl md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
        >
            <div className="mx-auto grid w-full max-w-md grid-cols-5 items-center px-2">
                {navItems.map((item) => {
                    const active = isItemActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className="flex min-h-11 flex-col items-center gap-1 py-1 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-inset"
                        >
                            <div
                                className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                                    active
                                        ? 'bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/30'
                                        : 'text-white/45 hover:text-white'
                                }`}
                            >
                                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span
                                className={`text-[10px] font-semibold tracking-tight ${
                                    active ? 'text-white' : 'text-white/45'
                                }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}

                {/* 5th Tab: Menu Trigger */}
                <button
                    type="button"
                    onClick={handleMenuClick}
                    className="flex min-h-11 flex-col items-center gap-1 py-1 text-center text-white/45 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:ring-inset"
                    aria-label="Open full menu"
                >
                    <div className="flex h-8 w-12 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white transition-all">
                        <Menu size={18} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-tight">Menu</span>
                </button>
            </div>
        </nav>
    );
}
