'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/sections/Footer';
import { SubscribePopup } from '@/components/SubscribePopup';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export function AppFrame({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    const isFounder = pathname.startsWith('/founder');

    if (isFounder) {
        return (
            <div className="relative z-10 min-h-screen">
                {children}
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className={`relative z-10 pb-24 md:pb-16 ${isHome ? 'pt-0' : 'pt-24'}`}>
                {children}
            </div>
            <Footer />
            <SubscribePopup />
            <MobileBottomNav />
        </>
    );
}
