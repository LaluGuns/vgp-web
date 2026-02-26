'use client';

/**
 * GlassCard — Y3K Robot Chrome Card
 * Premium frosted glass with chrome border hover and inner glow
 */

import { m } from 'framer-motion';
import { hoverLift, tapScale } from '@/lib/motion-presets';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    glow?: 'cyan' | 'studio' | 'lab' | 'none';
}

const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
};

export function GlassCard({
    children,
    className = '',
    padding = 'md',
    hover = true,
    glow = 'none',
}: GlassCardProps) {
    const glowStyles = {
        cyan: 'hover:border-[rgba(0,212,255,0.15)] hover:shadow-[0_0_30px_rgba(0,212,255,0.06),inset_0_1px_0_rgba(255,255,255,0.03)]',
        studio: 'hover:border-[rgba(255,60,172,0.15)] hover:shadow-[0_0_30px_rgba(255,60,172,0.06),inset_0_1px_0_rgba(255,255,255,0.03)]',
        lab: 'hover:border-[rgba(0,255,163,0.15)] hover:shadow-[0_0_30px_rgba(0,255,163,0.06),inset_0_1px_0_rgba(255,255,255,0.03)]',
        none: 'hover:border-[rgba(200,204,212,0.08)]',
    };

    return (
        <m.div
            className={`
                relative rounded-3xl overflow-hidden
                obsidian-glass
                transition-all duration-500 ease-out
                ${glowStyles[glow]}
                ${paddingMap[padding]}
                ${className}
            `}
            whileHover={hover ? hoverLift : undefined}
            whileTap={hover ? tapScale : undefined}
        >
            {/* Inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,204,212,0.02),transparent_70%)] pointer-events-none rounded-2xl" />
            <div className="relative z-10">{children}</div>
        </m.div>
    );
}
