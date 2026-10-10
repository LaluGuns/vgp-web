'use client';

import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/sections/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { GlobalBrandBackdrop } from '@/components/GlobalBrandBackdrop';
import { useNewsletter } from '@/components/context/NewsletterContext';

// Pages with a button that opens the newsletter dialog (openPopup): the home
// page, the book page, HealingWave and the masterclass page. There the dialog's
// code is fetched once the page is idle, so the first tap opens it at once.
// Anywhere else it is fetched only if something opens it.
const POPUP_PAGES = /^\/(?:book|healingwave|studio\/masterclass)?\/?$/;

let popupModule: Promise<ComponentType> | null = null;
const loadPopup = () =>
    (popupModule ??= import('@/components/SubscribePopup').then((mod) => mod.SubscribePopup));

function LazySubscribePopup({ prefetch }: { prefetch: boolean }) {
    const { isOpen, closePopup } = useNewsletter();
    const [Popup, setPopup] = useState<ComponentType | null>(null);

    useEffect(() => {
        if (Popup || (!isOpen && !prefetch)) return;
        let cancelled = false;
        const load = () => {
            loadPopup()
                .then((component) => {
                    if (!cancelled) setPopup(() => component);
                })
                .catch(() => {
                    // A failed chunk load: forget it and drop the open state, so the
                    // next press opens again and retries the load.
                    popupModule = null;
                    if (!cancelled && isOpen) closePopup();
                });
        };
        if (isOpen) {
            load();
            return () => {
                cancelled = true;
            };
        }
        if (typeof window.requestIdleCallback === 'function') {
            const id = window.requestIdleCallback(load, { timeout: 4000 });
            return () => {
                cancelled = true;
                window.cancelIdleCallback(id);
            };
        }
        const timer = window.setTimeout(load, 2000);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [Popup, isOpen, prefetch, closePopup]);

    return Popup ? <Popup /> : null;
}

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
            <div className={`relative pb-20 md:pb-8 [@media(max-height:499.98px)]:pb-8 print:p-0 ${isHome ? 'pt-0' : 'pt-24'}`}>
                {children}
            </div>
            <Footer />
            <LazySubscribePopup prefetch={POPUP_PAGES.test(pathname)} />
            <MobileBottomNav />
        </div>
    );
}
