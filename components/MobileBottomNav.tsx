'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppWindow, Home, Headphones, BookOpen, Menu } from 'lucide-react';

const itemClass =
    'relative flex min-h-12 flex-col items-center justify-center gap-1 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60';

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
    const pathname = usePathname();
    const isBeatStore = /^\/(?:(?:ja-JP|de-DE)\/)?studio\/beats(?:\/|$)/.test(pathname);

    // The beat store has its own sticky audio player in this spot.
    if (isBeatStore) return null;

    const navItems = [
        { name: 'Home', href: '/', icon: Home, exact: true },
        { name: 'Beats', href: '/studio/beats', icon: Headphones },
        { name: 'Apps', href: '/flow', icon: AppWindow },
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
            aria-label="Quick navigation"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050607]/95 backdrop-blur-md md:hidden"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
        >
            <div className="mx-auto grid w-full max-w-md grid-cols-5 px-2">
                {navItems.map((item) => {
                    const active = isItemActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`${itemClass} ${active ? 'text-white' : 'text-white/55 hover:text-white'}`}
                        >
                            {active ? (
                                <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-white" aria-hidden="true" />
                            ) : null}
                            <Icon size={18} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                            <span className="text-[11px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}

                <button
                    type="button"
                    onClick={handleMenuClick}
                    aria-haspopup="dialog"
                    className={`${itemClass} text-white/55 hover:text-white`}
                >
                    <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span className="text-[11px] font-medium">Menu</span>
                </button>
            </div>
        </nav>
    );
}
