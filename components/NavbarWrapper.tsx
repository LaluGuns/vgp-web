'use client';

/**
 * NavbarWrapper - Shows Navbar on all pages except home
 */

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export function NavbarWrapper() {
    const pathname = usePathname();

    // Hide navbar on home page (home has its own centered header)
    if (pathname === '/') return null;

    return <Navbar />;
}
