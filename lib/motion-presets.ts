/**
 * Virzy Guns Production - Motion Presets
 * Premium spring-based animations for Apple-level smooth transitions
 */

import { Variants, Transition } from 'framer-motion';

// ========================================
// SPRING PHYSICS (Apple-like feel)
// ========================================

export const springPreset: Transition = {
    type: 'spring',
    stiffness: 100,
    damping: 20,
};

export const springFast: Transition = {
    type: 'spring',
    stiffness: 200,
    damping: 25,
};

export const springBouncy: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 15,
};

// ========================================
// REVEAL ANIMATIONS (Scroll-triggered)
// ========================================

export const revealUp: Variants = {
    hidden: {
        opacity: 0,
        y: 60,
        filter: 'blur(10px)',
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
        scale: 0.9,
        filter: 'blur(8px)',
    },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: springPreset,
    },
};

export const revealLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: springPreset,
    },
};

export const revealRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: springPreset,
    },
};

// ========================================
// STAGGER CONTAINERS
// ========================================

export const staggerParent: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15,
        },
    },
};

export const staggerChild: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: springPreset,
    },
};

// ========================================
// HOVER/TAP INTERACTIONS (Haptic-like)
// ========================================

export const hoverScale = {
    scale: 1.02,
    transition: springFast,
};

export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 },
};

export const glowHover = {
    boxShadow: '0 0 30px rgba(191, 255, 0, 0.5), 0 0 60px rgba(191, 255, 0, 0.2)',
    borderColor: 'rgba(191, 255, 0, 0.6)',
    transition: { duration: 0.3 },
};

export const glowHoverCyan = {
    boxShadow: '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2)',
    borderColor: 'rgba(0, 240, 255, 0.6)',
    transition: { duration: 0.3 },
};

// ========================================
// GRADIENT ANIMATION
// ========================================

export const gradientShift = {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
        duration: 15,
        repeat: Infinity,
        ease: 'linear',
    },
};
