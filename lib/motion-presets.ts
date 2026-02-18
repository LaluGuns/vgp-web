/**
 * Virzy Guns Production — Y3K Robot Motion System v2.0
 * Premium spring-based animations with magnetic, parallax, and stagger effects
 */

import { Variants, Transition } from 'framer-motion';

// ════════════════════════════════════════════════
// SPRING PHYSICS
// ════════════════════════════════════════════════

/** Default smooth spring — Apple-like */
export const springPreset: Transition = {
    type: 'spring',
    stiffness: 100,
    damping: 20,
};

/** Fast snappy spring — UI feedback */
export const springFast: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 25,
};

/** Bouncy spring — playful interactions */
export const springBouncy: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 15,
};

/** Slow elegant spring — hero reveals */
export const springSmooth: Transition = {
    type: 'spring',
    stiffness: 60,
    damping: 18,
};

// ════════════════════════════════════════════════
// REVEAL ANIMATIONS (Scroll-triggered)
// ════════════════════════════════════════════════

export const revealUp: Variants = {
    hidden: {
        opacity: 0,
        y: 60,
        filter: 'blur(8px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: springPreset,
    },
};

export const revealScale: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.92,
        filter: 'blur(6px)',
    },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: springPreset,
    },
};

export const revealLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: springPreset,
    },
};

export const revealRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: springPreset,
    },
};

/** Reveal with slight rotation — premium feel */
export const revealTilt: Variants = {
    hidden: {
        opacity: 0,
        y: 40,
        rotateX: 8,
        filter: 'blur(6px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        transition: springSmooth,
    },
};

// ════════════════════════════════════════════════
// STAGGER CONTAINERS
// ════════════════════════════════════════════════

export const staggerParent: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

export const staggerChild: Variants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: springPreset,
    },
};

/** Faster stagger for grid cards */
export const staggerGrid: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
        },
    },
};

export const staggerGridChild: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springPreset,
    },
};

// ════════════════════════════════════════════════
// HOVER & TAP (Haptic-like)
// ════════════════════════════════════════════════

export const hoverScale = {
    scale: 1.03,
    transition: springFast,
};

export const hoverLift = {
    y: -4,
    scale: 1.01,
    transition: springFast,
};

export const tapScale = {
    scale: 0.97,
    transition: { duration: 0.1 },
};

/** Magnetic hover — card follows cursor direction */
export const magneticHover = {
    scale: 1.02,
    y: -2,
    transition: springFast,
};

// ════════════════════════════════════════════════
// GLOW HOVERS
// ════════════════════════════════════════════════

export const glowHover = {
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.5)',
    transition: { duration: 0.3 },
};

export const glowHoverCyan = {
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)',
    borderColor: 'rgba(0, 212, 255, 0.6)',
    transition: { duration: 0.3 },
};

export const glowHoverStudio = {
    boxShadow: '0 0 30px rgba(255, 60, 172, 0.4), 0 0 60px rgba(255, 60, 172, 0.15)',
    borderColor: 'rgba(255, 60, 172, 0.5)',
    transition: { duration: 0.3 },
};

export const glowHoverLab = {
    boxShadow: '0 0 30px rgba(0, 255, 163, 0.4), 0 0 60px rgba(0, 255, 163, 0.15)',
    borderColor: 'rgba(0, 255, 163, 0.5)',
    transition: { duration: 0.3 },
};

// ════════════════════════════════════════════════
// PAGE TRANSITIONS
// ════════════════════════════════════════════════

export const pageSlideIn: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: 'blur(2px)',
        transition: { duration: 0.3 },
    },
};

// ════════════════════════════════════════════════
// GRADIENT ANIMATION
// ════════════════════════════════════════════════

export const gradientShift = {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
        duration: 15,
        repeat: Infinity,
        ease: 'linear',
    },
};
