'use client';

import { useEffect, useState } from 'react';
import { m, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for cursor
    const springConfig = { damping: 25, stiffness: 400 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Only run on desktop
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        setIsVisible(true);

        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        // Add event listeners for hover effects
        const addHoverListeners = () => {
            const hoverables = document.querySelectorAll('a, button, [role="button"], input, textarea, .hover-trigger');
            hoverables.forEach((el) => {
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        window.addEventListener('mousemove', moveCursor);
        // Initial attach
        addHoverListeners();

        // Re-attach on mutation (optional but good for dynamic content)
        const observer = new MutationObserver(addHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            observer.disconnect();
            const hoverables = document.querySelectorAll('a, button'); // Simple cleanup
            hoverables.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <m.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-exclusion"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            {/* Main Cursor Orb */}
            <m.div
                layoutId="cursor-orb"
                className="relative rounded-full bg-white"
                animate={{
                    width: isHovering ? 64 : 12,
                    height: isHovering ? 64 : 12,
                    opacity: isHovering ? 0.15 : 1,
                    scale: isHovering ? 1.2 : 1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                {/* Inner Glow (visible on hover) */}
                {isHovering && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    />
                )}
            </m.div>
        </m.div>
    );
}
