'use client';

/**
 * CustomSwitch - Before/After toggle with Cyber-Lime active state
 * Premium Y3K switch design
 */

import { motion } from 'framer-motion';

interface CustomSwitchProps {
    isActive: boolean;
    onToggle: () => void;
    labelOff?: string;
    labelOn?: string;
    className?: string;
}

export function CustomSwitch({
    isActive,
    onToggle,
    labelOff = 'BEFORE',
    labelOn = 'AFTER',
    className = '',
}: CustomSwitchProps) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {/* Off Label */}
            <span className={`
        mono-label transition-all duration-300
        ${!isActive ? 'text-white opacity-100' : 'text-white/40'}
      `}>
                {labelOff}
            </span>

            {/* Switch Track */}
            <button
                onClick={onToggle}
                className={`
          relative w-16 h-8 rounded-full p-1
          transition-all duration-300 ease-out
          ${isActive
                        ? 'bg-cyber-lime shadow-neon-lime-sm'
                        : 'bg-white/20 border border-white/30'
                    }
        `}
                aria-label={`Toggle ${isActive ? 'off' : 'on'}`}
            >
                {/* Switch Thumb */}
                <motion.div
                    className={`
            w-6 h-6 rounded-full
            ${isActive ? 'bg-obsidian' : 'bg-white'}
          `}
                    animate={{
                        x: isActive ? 32 : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            </button>

            {/* On Label */}
            <span className={`
        mono-label transition-all duration-300
        ${isActive ? 'text-cyber-lime text-glow-lime opacity-100' : 'text-white/40'}
      `}>
                {labelOn}
            </span>
        </div>
    );
}
