'use client';

/**
 * MagneticIcon - Minimal icon with magnetic pull
 * Clean, sovereign, not gaming
 */

import { useRef, useState } from 'react';
import { m } from 'framer-motion';

interface MagneticIconProps {
    children: React.ReactNode;
    href: string;
    label: string;
}

export function MagneticIcon({ children, href, label }: MagneticIconProps) {
    const ref = useRef<HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (e.clientX - centerX) * 0.25;
        const y = (e.clientY - centerY) * 0.25;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <m.a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-dim-grey hover:text-primary transition-colors duration-300"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </m.a>
    );
}
