'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/sections/Footer';
import { SubscribePopup } from '@/components/SubscribePopup';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { GlobalBrandBackdrop } from '@/components/GlobalBrandBackdrop';

export function AppFrame({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const isGames = pathname === '/games';
    const isFounder = pathname === '/founder' || pathname.startsWith('/founder/');

    if (isGames) {
        return <div className="relative min-h-screen">{children}</div>;
    }

    if (isFounder) {
        // The founder dashboard keeps its original look: the logo watermark
        // here, and the glass styling scoped by .founder-legacy in globals.css.
        return (
            <div className="founder-legacy relative min-h-screen">
                <GlobalBrandBackdrop />
                <div className="relative z-10 min-h-screen">{children}</div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <Navbar />
            <div className={`relative pb-20 md:pb-8 ${isHome ? 'pt-0' : 'pt-24'}`}>
                {children}
            </div>
            <Footer />
            <SubscribePopup />
            <MobileBottomNav />
        </div>
    );
}
