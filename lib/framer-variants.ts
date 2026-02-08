/**
 * VGP Universe - Framer Motion Variants Library
 * Centralized motion presets for consistent Y3K animations
 */

import { Variants } from 'framer-motion';

// ========================================
// FADE ANIMATIONS
// ========================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' }
    },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    },
};

// ========================================
// SCALE ANIMATIONS
// ========================================

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
};

export const scaleOnHover = {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
};

export const scaleOnTap = {
    scale: 0.98,
    transition: { duration: 0.1 }
};

// ========================================
// GLOW ANIMATIONS (Y3K Signature)
// ========================================

export const glowPulse: Variants = {
    idle: {
        boxShadow: '0 0 20px rgba(191, 255, 0, 0.3), 0 0 40px rgba(191, 255, 0, 0.1)'
    },
    active: {
        boxShadow: '0 0 30px rgba(191, 255, 0, 0.6), 0 0 60px rgba(191, 255, 0, 0.3)',
        transition: { duration: 0.3 }
    },
};

export const glowHover = {
    boxShadow: '0 0 30px rgba(191, 255, 0, 0.5), 0 0 60px rgba(191, 255, 0, 0.25)',
    transition: { duration: 0.3, ease: 'easeOut' }
};

export const cyanGlowHover = {
    boxShadow: '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.25)',
    transition: { duration: 0.3, ease: 'easeOut' }
};

// ========================================
// STAGGER CONTAINERS
// ========================================

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};

// ========================================
// SPECIAL EFFECTS
// ========================================

export const slideInFromLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    },
};

export const slideInFromRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    },
};

// Audio Wave Animation (for HealingWave section)
export const waveBar: Variants = {
    idle: { scaleY: 0.3 },
    active: {
        scaleY: [0.3, 1, 0.5, 0.8, 0.3],
        transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    },
};
