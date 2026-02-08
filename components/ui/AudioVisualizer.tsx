'use client';

/**
 * AudioVisualizer - Real-time CSS/SVG animation that reacts to audio state
 * Speeds up when HealingWave processing is active
 */

import { motion } from 'framer-motion';

interface AudioVisualizerProps {
    isActive: boolean;
    speed?: number;
    barCount?: number;
    className?: string;
}

export function AudioVisualizer({
    isActive,
    speed = 1,
    barCount = 24,
    className = '',
}: AudioVisualizerProps) {
    // Generate random heights for bars
    const bars = Array.from({ length: barCount }, (_, i) => ({
        id: i,
        delay: i * 0.05,
        baseHeight: 20 + Math.random() * 60,
    }));

    return (
        <div className={`flex items-end justify-center gap-1 h-32 ${className}`}>
            {bars.map((bar) => (
                <motion.div
                    key={bar.id}
                    className={`
            w-1.5 rounded-full origin-bottom
            ${isActive ? 'bg-cyber-lime' : 'bg-white/30'}
          `}
                    style={{
                        boxShadow: isActive
                            ? '0 0 8px rgba(191, 255, 0, 0.5)'
                            : 'none',
                    }}
                    animate={isActive ? {
                        scaleY: [0.3, 1, 0.5, 0.8, 0.3],
                        opacity: [0.7, 1, 0.8, 0.9, 0.7],
                    } : {
                        scaleY: 0.3,
                        opacity: 0.5,
                    }}
                    transition={isActive ? {
                        duration: 1.2 / speed,
                        repeat: Infinity,
                        delay: bar.delay,
                        ease: 'easeInOut',
                    } : {
                        duration: 0.5,
                    }}
                    initial={{ height: bar.baseHeight }}
                />
            ))}
        </div>
    );
}

/**
 * Mini visualizer for compact displays
 */
export function MiniVisualizer({
    isActive,
    className = '',
}: {
    isActive: boolean;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-0.5 h-4 ${className}`}>
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    className={`w-0.5 rounded-full ${isActive ? 'bg-cyber-lime' : 'bg-white/40'}`}
                    animate={isActive ? {
                        height: ['8px', '16px', '6px', '12px', '8px'],
                    } : {
                        height: '6px',
                    }}
                    transition={isActive ? {
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                    } : {}}
                />
            ))}
        </div>
    );
}
