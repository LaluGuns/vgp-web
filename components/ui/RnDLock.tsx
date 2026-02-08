'use client';

/**
 * RnDLock - Premium "Coming Soon" overlay with Y3K aesthetic
 * Glassmorphism + holographic gradient + terminal-style labels
 */

import { m } from 'framer-motion';
import { ReactNode } from 'react';

interface RnDLockProps {
    children: ReactNode;
    variant?: 'studio' | 'lab';
    moduleName?: string;
    status?: string;
    eta?: string;
    showWaitlist?: boolean;
}

export function RnDLock({
    children,
    variant = 'lab',
    moduleName = 'UNKNOWN',
    status = 'IN R&D',
    eta,
    showWaitlist = true,
}: RnDLockProps) {
    const isStudio = variant === 'studio';
    const accentColor = isStudio ? '#ec4899' : '#00ff88';
    const glowClass = isStudio ? 'shadow-[0_0_60px_rgba(236,72,153,0.15)]' : 'shadow-[0_0_60px_rgba(0,255,136,0.15)]';

    return (
        <div className="relative">
            {/* Content (blurred behind) */}
            <div className="relative blur-[6px] opacity-40 pointer-events-none select-none">
                {children}
            </div>

            {/* Lock Overlay */}
            <m.div
                className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl ${glowClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Holographic Noise Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] rounded-2xl overflow-hidden pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Animated Gradient Line */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
                    }}
                />

                {/* Lock Icon */}
                <m.div
                    className="mb-6"
                    animate={{
                        boxShadow: [
                            `0 0 20px ${accentColor}20`,
                            `0 0 40px ${accentColor}40`,
                            `0 0 20px ${accentColor}20`,
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div
                        className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: `${accentColor}50` }}
                    >
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke={accentColor}
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                </m.div>

                {/* Terminal Status Labels */}
                <div className="text-center space-y-2 mb-8">
                    <p className="terminal-text text-xs tracking-[0.3em]" style={{ color: `${accentColor}90` }}>
                        ◈ MODULE: {moduleName}
                    </p>
                    <p className="terminal-text text-xs tracking-[0.3em] text-white/40">
                        ◈ STATUS: {status}
                    </p>
                    <p className="terminal-text text-xs tracking-[0.3em] text-white/40">
                        ◈ ACCESS: ENCRYPTED
                    </p>
                    {eta && (
                        <p className="terminal-text text-xs tracking-[0.3em] text-white/40">
                            ◈ ETA: {eta}
                        </p>
                    )}
                </div>

                {/* Waitlist CTA */}
                {showWaitlist && (
                    <m.a
                        href="https://ig.me/m/virzyguns"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative px-8 py-3 border rounded-full text-xs tracking-widest transition-all duration-300"
                        style={{
                            borderColor: `${accentColor}40`,
                            color: accentColor,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Pulse Effect */}
                        <m.span
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${accentColor}20, transparent 70%)`,
                            }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="relative z-10">[ JOIN WAITLIST ]</span>
                    </m.a>
                )}
            </m.div>
        </div>
    );
}
