'use client';

/**
 * SectionHeader — Y3K Robot Section Title
 * Mono label + title + description with stagger animation
 */

import { m } from 'framer-motion';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

interface SectionHeaderProps {
    label: string;
    title: string;
    description?: string;
    labelColor?: string;
    align?: 'center' | 'left';
}

export function SectionHeader({
    label,
    title,
    description,
    labelColor = 'text-primary',
    align = 'center',
}: SectionHeaderProps) {
    return (
        <m.div
            className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
        >
            <m.p
                className={`mono-label ${labelColor} mb-4`}
                variants={staggerChild}
            >
                {label}
            </m.p>
            <m.h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-ultra-tight mb-4 titanium-text"
                variants={staggerChild}
            >
                {title}
            </m.h2>
            {description && (
                <m.p
                    className={`text-[#6B7080] text-base max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}
                    variants={staggerChild}
                >
                    {description}
                </m.p>
            )}
        </m.div>
    );
}
