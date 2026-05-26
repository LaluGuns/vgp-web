'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Headphones, Activity, BookOpen, GraduationCap } from 'lucide-react';

export function MobileBottomNav() {
    const pathname = usePathname();
    const isBlog = pathname.startsWith('/blog');

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Beats', href: '/studio/beats', icon: Headphones },
        { name: 'Class', href: '/studio/masterclass', icon: GraduationCap },
        { name: 'Lab', href: '/lab/healingwave', icon: Activity },
        { name: 'Blog', href: '/blog', icon: BookOpen },
    ];

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-[100] px-0 pt-3 backdrop-blur-xl transform-gpu translate-z-0 will-change-transform md:hidden ${
                isBlog
                    ? 'border-t border-white/10 bg-black/75'
                    : 'border-t border-white/10 bg-black/60'
            }`}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
        >
            <div className="mx-auto grid w-full max-w-full grid-cols-5 items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href !== '/' ? item.href : '/___impossible');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex min-w-0 flex-col items-center gap-1"
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                                    isBlog
                                        ? isActive
                                            ? 'bg-white text-[#1d1d1f]'
                                            : 'text-white/45 hover:bg-white/10 hover:text-white'
                                        : isActive
                                            ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                            : 'text-white/40 hover:text-white/80'
                                }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span
                                className={`truncate text-[10px] font-medium ${
                                    isBlog
                                        ? isActive
                                            ? 'text-white'
                                            : 'text-white/45'
                                        : isActive
                                            ? 'text-white'
                                            : 'text-white/40'
                                }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
