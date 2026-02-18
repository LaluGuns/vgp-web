'use client';

/**
 * GlowButton — Y3K Robot Chrome Button
 * Gradient fill on hover, spring physics, chrome shimmer
 */

import Link from 'next/link';
import { m } from 'framer-motion';
import { springFast } from '@/lib/motion-presets';

interface GlowButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'ghost' | 'studio' | 'lab';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit';
    disabled?: boolean;
}

const sizeMap = {
    sm: 'px-5 py-2.5 text-[0.65rem]',
    md: 'px-7 py-3 text-xs',
    lg: 'px-10 py-4 text-sm',
};

const variantMap = {
    primary: {
        base: 'border-[rgba(0,212,255,0.35)] text-white',
        hover: 'hover:border-transparent hover:shadow-[0_0_30px_rgba(0,212,255,0.35),0_8px_32px_rgba(0,0,0,0.4)]',
        gradient: 'from-[#00D4FF] to-[#B44AFF]',
    },
    ghost: {
        base: 'border-[rgba(200,204,212,0.1)] text-[#C8CCD4]',
        hover: 'hover:border-[rgba(0,212,255,0.3)] hover:text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]',
        gradient: '',
    },
    studio: {
        base: 'border-[rgba(255,60,172,0.35)] text-white',
        hover: 'hover:border-transparent hover:shadow-[0_0_30px_rgba(255,60,172,0.35),0_8px_32px_rgba(0,0,0,0.4)]',
        gradient: 'from-[#FF3CAC] to-[#B44AFF]',
    },
    lab: {
        base: 'border-[rgba(0,255,163,0.35)] text-white',
        hover: 'hover:border-transparent hover:shadow-[0_0_30px_rgba(0,255,163,0.35),0_8px_32px_rgba(0,0,0,0.4)]',
        gradient: 'from-[#00FFA3] to-[#00D4FF]',
    },
};

export function GlowButton({
    children,
    variant = 'primary',
    size = 'md',
    href,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
}: GlowButtonProps) {
    const v = variantMap[variant];
    const hasGradient = variant !== 'ghost';

    const buttonContent = (
        <m.span
            className={`
                relative inline-flex items-center justify-center gap-2
                rounded-full border font-medium tracking-[0.15em] uppercase
                cursor-pointer overflow-hidden
                transition-all duration-400 ease-out
                ${sizeMap[size]} ${v.base} ${v.hover}
                ${disabled ? 'opacity-50 pointer-events-none' : ''}
                ${className}
            `}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={springFast}
        >
            {/* Gradient background — hidden by default, revealed on hover */}
            {hasGradient && (
                <span className={`absolute inset-0 bg-gradient-to-r ${v.gradient} opacity-0 hover-parent-opacity transition-opacity duration-400 rounded-full`} />
            )}
            <span className="relative z-10">{children}</span>
        </m.span>
    );

    if (href) {
        return (
            <Link href={href} className="inline-block">
                {buttonContent}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className="inline-block">
            {buttonContent}
        </button>
    );
}
