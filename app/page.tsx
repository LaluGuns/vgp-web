'use client';

/**
 * Home Page — Y3K Robot Command Center
 * Premium dual-portal with gradient mesh orbs, parallax depth,
 * dramatic hero typography, and CSS-only ambient animation.
 * Performance: zero client-side Framer Motion on initial render.
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { SocialDock } from '@/components/SocialDock';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { PortalCarousel, portals } from '@/components/home/PortalCarousel';
import { RobotHost } from '@/components/home/RobotHost';

/* ═══ NAV DATA ═══ */
const navLinks = [
    { name: 'HOME', href: '/' },
    {
        name: 'STUDIO', href: '/studio/beats',
        submenu: [
            { name: 'Beatstore', href: '/studio/beats' },
            { name: 'Masterclass', href: '/studio/masterclass' },
        ]
    },
    { name: 'LAB', href: '/lab/healingwave' },
    { name: 'BLOG', href: '/blog' },
    { name: 'ABOUT', href: '/about' },
];

/* ═══ SUBTLE MOUSE PARALLAX HOOK ═══ */
function useMouseParallax() {
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const smoothX = useSpring(mouseX, { stiffness: 30, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth);
            mouseY.set(e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handler, { passive: true });
        return () => window.removeEventListener('mousemove', handler);
    }, [mouseX, mouseY]);

    return { smoothX, smoothY };
}

/* ═══ MAIN COMPONENT ═══ */
export default function HomePage() {
    const [studioOpen, setStudioOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    // Carousel State
    const [activeIndex, setActiveIndex] = useState(0);
    const [currentPortalColor, setCurrentPortalColor] = useState('#FF3CAC'); // Default Magenta
    // Drag Motion Value shared between Carousel and Robot
    const dragX = useMotionValue(0);

    const handleIndexChange = (index: number) => {
        setActiveIndex(index);
        setCurrentPortalColor(portals[index].color);
    };

    const { smoothX, smoothY } = useMouseParallax();

    // Parallax transforms for gradient orbs
    const orbX1 = useTransform(smoothX, [0, 1], [-30, 30]);
    const orbY1 = useTransform(smoothY, [0, 1], [-20, 20]);
    const orbX2 = useTransform(smoothX, [0, 1], [20, -20]);
    const orbY2 = useTransform(smoothY, [0, 1], [15, -15]);

    useEffect(() => {
        // Stagger load for smooth entrance
        const t = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="relative h-[100dvh] w-full overflow-hidden bg-[#03040A] -mt-24 -mb-16">
            <OrganizationSchema />

            {/* ═══════════════════════════════════════════
                LAYER 0: AMBIENT GRADIENT MESH (CSS-only, GPU accelerated)
                ═══════════════════════════════════════════ */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Primary Orb — Deep violet-cyan */}
                <m.div
                    className="absolute w-[900px] h-[900px] rounded-full will-change-transform"
                    style={{
                        x: orbX1, y: orbY1,
                        background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, rgba(180,74,255,0.04) 40%, transparent 70%)',
                        top: '-15%', left: '-10%',
                        filter: 'blur(80px)',
                    }}
                />
                {/* Secondary Orb — Pink-magenta (Studio side) */}
                <m.div
                    className="absolute w-[700px] h-[700px] rounded-full will-change-transform"
                    style={{
                        x: orbX2, y: orbY2,
                        background: 'radial-gradient(circle, rgba(255,60,172,0.06) 0%, rgba(180,74,255,0.03) 50%, transparent 70%)',
                        bottom: '-10%', left: '10%',
                        filter: 'blur(100px)',
                    }}
                />
                {/* Tertiary Orb — Green (Lab side) */}
                <m.div
                    className="absolute w-[600px] h-[600px] rounded-full will-change-transform"
                    style={{
                        x: orbX1, y: orbY2,
                        background: 'radial-gradient(circle, rgba(0,255,163,0.04) 0%, rgba(0,212,255,0.02) 50%, transparent 70%)',
                        top: '20%', right: '-5%',
                        filter: 'blur(90px)',
                    }}
                />
                {/* Ambient grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(200,204,212,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(200,204,212,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                    }}
                />
            </div>

            {/* ═══════════════════════════════════════════
                LAYER 0.5: ROBOT HERO BACKDROP
                White-bg robot image blended into dark void using
                invert + hue-rotate + screen blend technique.
                ═══════════════════════════════════════════ */}
            <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none overflow-hidden">
                <m.div
                    className="relative w-[700px] h-[700px] sm:w-[850px] sm:h-[850px] md:w-[1000px] md:h-[1000px] lg:w-[1150px] lg:h-[1150px] -translate-x-[25%] md:-translate-x-[20%]"
                    style={{
                        x: orbX2, y: orbY1,
                        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
                        animation: 'y3k-float 9s ease-in-out infinite',
                    }}
                >
                    {/* Robot has been upgraded to Layer 2: Robotic Host */}
                    {/* Keeping this container for the Gradient Orbs and Parallax effects */}
                    {/* Cyan eye-glow bloom — positioned at eye level */}
                    <div
                        className="absolute top-[28%] left-1/2 -translate-x-1/2 w-56 h-40 rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse, rgba(0,212,255,0.18) 0%, transparent 70%)',
                            filter: 'blur(30px)',
                            animation: 'glow-pulse 4s ease-in-out infinite',
                        }}
                    />
                </m.div>
            </div>

            {/* ═══════════════════════════════════════════
                LAYER 1: CENTERED HEADER
                ═══════════════════════════════════════════ */}
            <div
                className={`absolute top-0 left-0 right-0 z-40 pt-5 md:pt-6 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
                    }`}
            >
                <div className="flex flex-col items-center">
                    {/* Logo + Brand */}
                    <Link href="/" className="flex flex-col items-center gap-2 group mb-3">
                        <div className="w-14 h-14 md:w-16 md:h-16 relative">
                            <Image
                                src="/branding/logo-tg.png"
                                alt="VGP"
                                width={64}
                                height={64}
                                priority
                                className="w-full h-full object-contain drop-shadow-[0_0_14px_rgba(0,212,255,0.4)] group-hover:drop-shadow-[0_0_28px_rgba(0,212,255,0.7)] transition-all duration-700"
                            />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold tracking-wider">
                            <span className="gradient-text">VIRZY GUNS</span>
                            <span className="text-[#A0A4AE] group-hover:text-white transition-colors duration-500"> PRODUCTION</span>
                        </h1>
                    </Link>

                    {/* Desktop Nav — frosted glass pill */}
                    <nav
                        className={`hidden md:flex items-center gap-0.5 px-1.5 py-1.5 rounded-full transition-all duration-[1400ms] delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                            }`}
                        style={{
                            background: 'rgba(12, 14, 20, 0.55)',
                            backdropFilter: 'blur(40px) saturate(1.2)',
                            WebkitBackdropFilter: 'blur(40px) saturate(1.2)',
                            border: '1px solid rgba(200, 204, 212, 0.05)',
                        }}
                    >
                        {navLinks.map((link) => (
                            'submenu' in link ? (
                                <div
                                    key={link.name}
                                    className="relative"
                                    onMouseEnter={() => setStudioOpen(true)}
                                    onMouseLeave={() => setStudioOpen(false)}
                                >
                                    <Link
                                        href={link.href}
                                        className="px-4 py-2 text-[0.65rem] tracking-[0.2em] text-[#6B7080] hover:text-white rounded-full hover:bg-white/[0.04] transition-all duration-300 flex items-center gap-1.5"
                                    >
                                        {link.name}
                                        <svg className="w-2.5 h-2.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>

                                    <AnimatePresence>
                                        {studioOpen && (
                                            <m.div
                                                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                className="absolute top-full left-0 mt-2 py-2 px-1 rounded-xl min-w-[150px]"
                                                style={{
                                                    background: 'rgba(17, 19, 26, 0.95)',
                                                    backdropFilter: 'blur(40px)',
                                                    border: '1px solid rgba(200, 204, 212, 0.06)',
                                                    boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
                                                }}
                                            >
                                                {link.submenu && link.submenu.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className="block px-4 py-2.5 text-sm rounded-lg text-[#6B7080] hover:text-[#FF3CAC] hover:bg-white/[0.03] transition-colors duration-200"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 text-[0.65rem] tracking-[0.2em] rounded-full transition-all duration-300 ${link.href === '/'
                                        ? 'text-white bg-white/[0.06]'
                                        : 'text-[#6B7080] hover:text-white hover:bg-white/[0.04]'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                    </nav>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                LAYER 2: ROBOTIC HOST & CAROUSEL (Immersive)
                ═══════════════════════════════════════════ */}
            <div className="absolute inset-0 z-[10] flex items-center justify-center overflow-hidden pointer-events-none">

                {/* Robot Host (Background Layer) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <RobotHost
                        activeIndex={activeIndex}
                        activeColor={currentPortalColor}
                        carouselDragX={dragX}
                    />
                </div>

                {/* Carousel Container (Foreground Layer) - ELEVATED Z-INDEX */}
                <div className="relative z-[100] mt-20 md:mt-24 md:pl-0 w-full flex justify-center perspective-[1200px] pointer-events-auto">
                    <PortalCarousel
                        onIndexChange={handleIndexChange}
                        dragX={dragX}
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                LAYER 3: SOCIAL DOCK & BRANDING FOOTER
                ═══════════════════════════════════════════ */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-5 pointer-events-none">

                {/* Social Dock (Restored) - Floating above */}
                <div className="pointer-events-auto mb-4">
                    <SocialDock />
                </div>

                {/* 5-Icon CTA Row - REMOVED upon user request for cleaner UI */}

                {/* Branding Text */}
                {/* Branding Text - REMOVED */}
            </div>

            {/* ═══════════════════════════════════════════
                LAYER 4: CORNER DECORATIONS
                ═══════════════════════════════════════════ */}
            <div className="hidden md:block">
                {/* Top-left corner mark */}
                <div className="absolute top-6 left-6 z-30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.5)] glow-pulse" />
                </div>
                {/* Bottom-right tech label */}
                <div className="absolute bottom-6 right-6 z-30">
                    <span className="font-mono text-[0.45rem] tracking-[0.3em] text-[#22252F]">Y3K.PROTOCOL.V2</span>
                </div>
            </div>
        </div >
    );
}
