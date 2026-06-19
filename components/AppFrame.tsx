'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export function AppFrame({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <>
            <Navbar />
            <div className={`relative z-10 pb-24 md:pb-16 ${isHome ? 'pt-0' : 'pt-24'}`}>
                {children}
            </div>
        </>
    );
}
