'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Headphones, Activity, BookOpen, Info } from 'lucide-react';

export function MobileBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Studio', href: '/studio/beats', icon: Headphones },
        { name: 'Lab', href: '/lab/healingwave', icon: Activity },
        { name: 'Blog', href: '/blog', icon: BookOpen },
        { name: 'About', href: '/about', icon: Info },
    ];

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/60 backdrop-blur-xl border-t border-white/10 px-6 pt-3 transform-gpu translate-z-0 will-change-transform"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
        >
            <div className="flex justify-between items-center max-w-sm mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href !== '/' ? item.href : '/___impossible');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 min-w-[64px]"
                        >
                            <div
                                className={`p-2 rounded-xl transition-all ${isActive
                                    ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                    : 'text-white/40 hover:text-white/80'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span
                                className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-white' : 'text-white/40'
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
