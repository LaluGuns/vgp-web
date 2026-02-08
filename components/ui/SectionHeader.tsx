'use client';

/**
 * SectionHeader - Y3K Sovereign Header
 * Minimal, elegant, authority
 */

import { m } from 'framer-motion';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

interface SectionHeaderProps {
    label?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
}

export function SectionHeader({
    label,
    title,
    description,
    align = 'center',
}: SectionHeaderProps) {
    const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

    return (
        <m.header
            className={`max-w-2xl mb-16 ${alignClass}`}
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
        >
            {label && (
                <m.p
                    className="mono-label text-primary mb-4 tracking-widest"
                    variants={staggerChild}
                >
                    {label}
                </m.p>
            )}
            <m.h2
                className="text-3xl md:text-4xl font-semibold tracking-apple text-white mb-4"
                variants={staggerChild}
            >
                {title}
            </m.h2>
            {description && (
                <m.p
                    className="text-cool-grey font-light leading-relaxed"
                    variants={staggerChild}
                >
                    {description}
                </m.p>
            )}
        </m.header>
    );
}
