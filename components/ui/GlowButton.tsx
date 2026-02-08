'use client';

/**
 * GlowButton - Y3K Sovereign Button with Cyan Glow
 * Apple-level smooth transitions
 */

import { m } from 'framer-motion';
import Link from 'next/link';

interface GlowButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    onClick?: () => void;
    className?: string;
}

const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
};

const variantClasses = {
    primary: 'bg-transparent border border-primary text-white shadow-[0_0_20px_rgba(0,229,255,0.3)]',
    ghost: 'bg-transparent border border-white/10 text-cool-grey',
    outline: 'bg-transparent border border-primary/50 text-primary',
};

export function GlowButton({
    children,
    variant = 'primary',
    size = 'md',
    href,
    onClick,
    className = '',
}: GlowButtonProps) {
    const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-colors duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

    // Apple-smooth hover states
    const hoverState = variant === 'primary'
        ? {
            backgroundColor: '#00E5FF',
            color: '#000000',
            scale: 1.02,
            boxShadow: '0 0 40px rgba(0,229,255,0.5)',
        }
        : {
            borderColor: '#00E5FF',
            color: '#FFFFFF',
            scale: 1.02,
            boxShadow: '0 0 25px rgba(0,229,255,0.25)',
        };

    const content = (
        <m.span
            className={baseClasses}
            whileHover={hoverState}
            whileTap={{ scale: 0.97 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
            }}
        >
            {children}
        </m.span>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return <button onClick={onClick}>{content}</button>;
}
