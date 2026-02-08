'use client';

/**
 * GlassCard - Y3K Sovereign Glass Container
 * Apple-level smooth hover transitions
 */

import { m } from 'framer-motion';
import { ReactNode } from 'react';
import { revealUp } from '@/lib/motion-presets';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    glow?: 'none' | 'cyan' | 'subtle';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export function GlassCard({
    children,
    className = '',
    padding = 'md',
    hover = true,
    glow = 'none',
}: GlassCardProps) {
    const glowClass = glow === 'cyan'
        ? 'shadow-[0_0_30px_rgba(0,229,255,0.3)] border-primary/30'
        : glow === 'subtle'
            ? 'shadow-[0_0_20px_rgba(0,229,255,0.15)] border-primary/20'
            : 'border-white/5';

    return (
        <m.div
            className={`
        bg-titanium rounded-xl
        border ${glowClass}
        ${paddingClasses[padding]}
        transition-colors duration-200
        ${className}
      `}
            variants={revealUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={hover ? {
                y: -6,
                scale: 1.01,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(0,229,255,0.15)',
                borderColor: 'rgba(0,229,255,0.3)',
            } : undefined}
            transition={{
                type: 'spring',
                stiffness: 350,
                damping: 12,
            }}
        >
            {children}
        </m.div>
    );
}
