'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * useCounter — Hook to animate numbers counting up
 * @param end End value
 * @param duration Duration in seconds
 */
export function useCounter(end: number, duration: number = 2) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, end, duration]);

    return { count, ref };
}

// Simple component wrapper for convenience
export function StatCounter({ end, suffix = "", className = "" }: { end: number, suffix?: string, className?: string }) {
    const { count, ref } = useCounter(end);
    return <span ref={ref} className={className}>{count}{suffix}</span>;
}
