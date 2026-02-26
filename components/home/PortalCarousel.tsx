'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionValueEvent,
    type PanInfo,
} from 'framer-motion';
import { Portal3DIcon } from '@/components/ui/Portal3DIcon';

export const portals = [
    {
        id: 'studio' as const,
        title: 'VGP STUDIO',
        subtitle: 'For Artists & Creators',
        description: 'Premier beats — Trap, Phonk, Drill, R&B, Synthwave & Deep House.',
        color: '#FF3CAC',
        href: '/studio/beats',
        cta: 'BEATSTORE',
    },
    {
        id: 'lab' as const,
        title: 'VGP LAB',
        subtitle: 'Enter the HealingWave',
        description: 'Kinetic functional audio for focus, performance & wellness.',
        color: '#00FFA3',
        href: '/lab/healingwave',
        cta: 'HEALINGWAVE',
    },
    {
        id: 'masterclass' as const,
        title: 'MASTERCLASS',
        subtitle: 'Learn from the Best',
        description: 'Exclusive tutorials on production, mixing, and music business.',
        color: '#FFD700',
        href: '/studio/masterclass',
        cta: 'START LEARNING',
    },
    {
        id: 'blog' as const,
        title: 'VGP BLOG',
        subtitle: 'Insights & Updates',
        description: 'Industry news, production tips, and VGP community stories.',
        color: '#00D4FF',
        href: '/blog',
        cta: 'READ ARTICLES',
    },
    {
        id: 'about' as const,
        title: 'ABOUT US',
        subtitle: 'The Vision',
        description: 'Meet the team and discover the philosophy behind Virzy Guns.',
        color: '#E0E0E0',
        href: '/about',
        cta: 'DISCOVER',
    },
];

interface PortalCarouselProps {
    onIndexChange?: (index: number) => void;
    dragX?: any;
}

// ── Tweak these to resize everything ──
const CARD_W = 360;
const CARD_H = 560;
const SPREAD = 380; // px between center card and side cards

export function PortalCarousel({ onIndexChange, dragX: parentDragX }: PortalCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const isDragging = useRef(false);

    const index = useMotionValue(0);
    const springIndex = useSpring(index, { stiffness: 100, damping: 22 });

    useMotionValueEvent(springIndex, 'change', (latest) => {
        if (parentDragX) parentDragX.set(latest * -100);
        const rounded = Math.round(latest);
        const wrapped = ((rounded % portals.length) + portals.length) % portals.length;
        if (wrapped !== activeIndex) {
            setActiveIndex(wrapped);
            onIndexChange?.(wrapped);
        }
    });

    const handlePan = (_e: any, info: PanInfo) => {
        index.set(index.get() + info.delta.x * (-1 / 350));
        if (Math.abs(info.offset.x) > 5) isDragging.current = true;
    };

    const handlePanEnd = (_e: any, info: PanInfo) => {
        const velocity = info.velocity.x * -0.005;
        const target = Math.round(index.get() + velocity);
        index.set(target);
        const wasDrag = Math.abs(info.offset.x) > 5;
        setTimeout(() => { isDragging.current = false; }, wasDrag ? 50 : 0);
    };

    const nextSlide = () => index.set(Math.round(index.get()) + 1);
    const prevSlide = () => index.set(Math.round(index.get()) - 1);

    const activeColor = portals[activeIndex]?.color ?? '#ffffff';

    // Mobile Scroll Handler
    const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const width = e.currentTarget.offsetWidth;
        // Simple snap index calculation
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < portals.length) {
            setActiveIndex(newIndex);
            onIndexChange?.(newIndex);
        }
    };

    return (
        <div className="relative w-full flex flex-col items-center gap-6 select-none py-4">

            {/* ── MOBILE: NATIVE SNAP SCROLL (App-Like Performance) ── */}
            <div className="relative w-full md:hidden">
                <div
                    className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-6 gap-4 pt-8 pb-14"
                    onScroll={handleMobileScroll}
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {portals.map((portal) => (
                        <div
                            key={portal.id}
                            className="flex-shrink-0 w-full snap-center flex justify-center items-center"
                        >
                            <div
                                className="obsidian-glass rounded-3xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden will-change-transform"
                                style={{
                                    width: '340px',
                                    height: '560px',
                                    boxShadow: activeIndex === portals.indexOf(portal)
                                        ? `inset 0 1px 1px rgba(255,255,255,0.1), 0 0 40px ${portal.color}25`
                                        : 'inset 0 1px 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5)'
                                }}
                            >
                                {/* Animated Icon — visible, prominent, above text */}
                                <div className="flex items-center justify-center z-10 mb-2" style={{ filter: `drop-shadow(0 0 20px ${portal.color}30)` }}>
                                    <Portal3DIcon portalId={portal.id} color={portal.color} size={140} />
                                </div>

                                {/* Top Badge */}
                                <div className="text-[0.7rem] tracking-[0.2em] font-mono opacity-80 z-10" style={{ color: portal.color }}>
                                    {portal.subtitle.toUpperCase()}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-4 z-10">
                                    <h2 className="text-4xl font-black text-white">{portal.title}</h2>
                                    <div className="w-12 h-px bg-white/20 mx-auto" />
                                    <p className="text-base text-white/70">{portal.description}</p>
                                </div>

                                {/* CTA */}
                                <Link
                                    href={portal.href}
                                    className="px-6 py-3 rounded-full text-sm font-bold tracking-widest border transition-colors z-10"
                                    style={{
                                        borderColor: portal.color,
                                        color: portal.color,
                                        backgroundColor: `${portal.color}10`
                                    }}
                                >
                                    {portal.cta}
                                </Link>

                                {/* Active Glow */}
                                {activeIndex === portals.indexOf(portal) && (
                                    <div className="absolute inset-0 pointer-events-none z-[2]" style={{ border: `1px solid ${portal.color}30` }} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── SIMPLE SWIPE INSTRUCTION (Mobile Native Hint) ── */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center opacity-50 pointer-events-none">
                    <svg className="w-4 h-4 mr-2 animate-bounce-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    <span className="text-[0.65rem] font-mono tracking-[0.2em] uppercase">Swipe to Explore</span>
                </div>
            </div>


            {/* ── DESKTOP: 3D FRAMER MOTION CAROUSEL ── */}
            <div
                className="hidden md:flex relative w-full items-center justify-center"
                style={{ height: `${CARD_H + 40}px`, perspective: '1200px' }}
            >
                {/* LEFT ARROW — anchored relative to center card */}
                <button
                    onClick={prevSlide}
                    aria-label="Previous"
                    className="absolute z-[200] flex items-center justify-center w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/40 backdrop-blur-md transition-all duration-200 cursor-pointer"
                    style={{ left: `calc(50% - ${CARD_W / 2 + 64}px)` }}
                >
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* RIGHT ARROW */}
                <button
                    onClick={nextSlide}
                    aria-label="Next"
                    className="absolute z-[200] flex items-center justify-center w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/40 backdrop-blur-md transition-all duration-200 cursor-pointer"
                    style={{ left: `calc(50% + ${CARD_W / 2 + 20}px)` }}
                >
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* DRAG STAGE — overflow visible so side cards peek through */}
                <motion.div
                    style={{
                        position: 'relative',
                        width: `${CARD_W}px`,
                        height: `${CARD_H}px`,
                        cursor: 'grab',
                        touchAction: 'none',
                        overflow: 'visible',
                    }}
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                    whileTap={{ cursor: 'grabbing' }}
                >
                    {portals.map((portal, i) => (
                        <CarouselItem
                            key={portal.id}
                            portal={portal}
                            i={i}
                            baseIndex={springIndex}
                            total={portals.length}
                            isDragging={isDragging}
                            cardW={CARD_W}
                            cardH={CARD_H}
                            spread={SPREAD}
                        />
                    ))}
                </motion.div>
            </div>

        </div>
    );
}

// ── ITEM ──────────────────────────────────────────────────────────────

function CarouselItem({ portal, i, baseIndex, total, isDragging, cardW, cardH, spread }: any) {
    const offset = useTransform(baseIndex, (current: number) => {
        const diff = i - current;
        return ((diff % total) + total + total / 2) % total - total / 2;
    });

    const x = useTransform(offset, (v) => {
        const abs = Math.abs(v);
        const sign = Math.sign(v);
        if (abs <= 1) return v * spread;
        return sign * (spread + (abs - 1) * 180);
    });

    const scale = useTransform(offset, (v) => Math.max(0.65, 1 - Math.abs(v) * 0.14));
    const zIndex = useTransform(offset, (v) => Math.round(100 - Math.abs(v) * 10));
    const opacity = useTransform(offset, (v) => Math.max(0, 1 - Math.abs(v) * 0.5));
    const rotateY = useTransform(offset, (v) => v * -10);
    const z = useTransform(offset, (v) => Math.abs(v) * -60);
    const filter = useTransform(offset, (v) =>
        Math.abs(v) < 0.3 ? 'none' : `brightness(${Math.max(0.5, 1 - Math.abs(v) * 0.3)})`
    );

    const [isActive, setIsActive] = useState(() => Math.abs(offset.get()) < 0.2);
    useMotionValueEvent(offset, 'change', (v) => setIsActive(Math.abs(v) < 0.2));

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${cardW}px`,
                height: `${cardH}px`,
                x, scale, zIndex, opacity, rotateY, z, filter,
                willChange: 'transform, opacity, filter',
            }}
        >
            {/* Card shell — Apple Y3K Obsidian Glass */}
            <div
                className="obsidian-glass w-full h-full rounded-[2rem] flex flex-col items-center justify-between py-10 px-8 text-center relative overflow-hidden"
                style={{
                    boxShadow: isActive
                        ? `inset 0 1px 1px rgba(255,255,255,0.3), 0 0 100px ${portal.color}30, 0 32px 80px rgba(0,0,0,0.8)`
                        : 'inset 0 1px 1px rgba(255,255,255,0.1), 0 24px 60px rgba(0,0,0,0.6)',
                }}
            >
                {/* Animated Icon — visible, prominent, with glow */}
                <div
                    className="z-10 transition-all duration-500 will-change-transform"
                    style={{
                        transform: isActive ? 'scale(1.15) translateY(-4px)' : 'scale(0.8) translateY(0)',
                        filter: isActive ? `drop-shadow(0 10px 40px ${portal.color}50)` : 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))',
                        opacity: isActive ? 1 : 0.6,
                    }}
                >
                    <Portal3DIcon portalId={portal.id} color={portal.color} size={160} />
                </div>

                {/* Background ambient lighting */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom, transparent, transparent, ${portal.color}15)` }} />

                {/* Active intense glowing border overlay */}
                <motion.div
                    className="absolute inset-0 rounded-[2rem] pointer-events-none"
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        border: `1.5px solid ${portal.color}`,
                        boxShadow: `inset 0 0 40px ${portal.color}15`,
                    }}
                />

                {/* TOP — subtitle */}
                <div
                    className="relative z-10 px-4 py-1.5 rounded-full text-[0.7rem] tracking-[0.3em] font-mono border pointer-events-none backdrop-blur-md"
                    style={{
                        color: portal.color,
                        borderColor: `${portal.color}35`,
                        backgroundColor: `rgba(0,0,0,0.4)`,
                    }}
                >
                    {portal.subtitle.toUpperCase()}
                </div>

                {/* MIDDLE — title + divider + description */}
                <div className="relative z-10 flex flex-col items-center gap-5 pointer-events-none select-none px-2">
                    <h2
                        className="font-black tracking-tighter text-white leading-none text-wrap"
                        style={{ fontSize: portal.title.length > 10 ? '2.25rem' : '3.25rem' }}
                    >
                        {portal.title}
                    </h2>

                    <div
                        className="w-10 h-px"
                        style={{ backgroundColor: `${portal.color}70` }}
                    />

                    <p className="text-sm text-white/70 leading-relaxed">
                        {portal.description}
                    </p>
                </div>

                {/* BOTTOM — CTA */}
                <motion.div
                    className="relative z-[60]"
                    animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 8,
                    }}
                    transition={{ duration: 0.25 }}
                    style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                >
                    <Link
                        href={portal.href}
                        onClick={(e) => {
                            if (isDragging.current) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200"
                        style={{
                            border: `1px solid ${portal.color}55`,
                            backgroundColor: `${portal.color}10`,
                            color: portal.color,
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = `${portal.color}22`;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = `${portal.color}10`;
                        }}
                    >
                        <span className="text-[0.75rem] font-bold tracking-[0.2em]">
                            {portal.cta}
                        </span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
