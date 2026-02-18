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
import { GlassCard } from '@/components/ui/GlassCard';

export const portals = [
    {
        id: 'studio',
        title: 'VGP STUDIO',
        subtitle: 'For Artists & Creators',
        description: 'Premier beats — Trap, Phonk, Drill, R&B, Synthwave & Deep House.',
        color: '#FF3CAC',
        href: '/studio/beats',
        cta: 'BEATSTORE',
    },
    {
        id: 'lab',
        title: 'VGP LAB',
        subtitle: 'Enter the HealingWave',
        description: 'Kinetic functional audio for focus, performance & wellness.',
        color: '#00FFA3',
        href: '/lab/healingwave',
        cta: 'HEALINGWAVE',
    },
    {
        id: 'masterclass',
        title: 'MASTERCLASS',
        subtitle: 'Learn from the Best',
        description: 'Exclusive tutorials on production, mixing, and music business.',
        color: '#FFD700',
        href: '/studio/masterclass',
        cta: 'START LEARNING',
    },
    {
        id: 'blog',
        title: 'VGP BLOG',
        subtitle: 'Insights & Updates',
        description: 'Industry news, production tips, and VGP community stories.',
        color: '#00D4FF',
        href: '/blog',
        cta: 'READ ARTICLES',
    },
    {
        id: 'about',
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
const CARD_W = 300;
const CARD_H = 420;
const SPREAD = 340; // px between center card and side cards

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

    return (
        <div className="relative w-full flex flex-col items-center gap-6 select-none py-4">

            {/* ── STAGE ROW ── */}
            <div
                className="relative w-full flex items-center justify-center"
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

            {/* ── DOT INDICATORS ── */}
            <div className="flex items-center gap-2">
                {portals.map((portal, i) => (
                    <button
                        key={portal.id}
                        onClick={() => index.set(i)}
                        className="rounded-full transition-all duration-300 pointer-events-auto cursor-pointer"
                        style={{
                            width: i === activeIndex ? '20px' : '6px',
                            height: '6px',
                            backgroundColor: i === activeIndex ? activeColor : 'rgba(255,255,255,0.2)',
                        }}
                    />
                ))}
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
        Math.abs(v) < 0.3 ? 'none' : `blur(${Math.min(Math.abs(v) * 2, 4)}px) brightness(0.5)`
    );

    const [isActive, setIsActive] = useState(false);
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
            }}
        >
            {/* Card shell — manual styles to avoid GlassCard quirks */}
            <div
                className="w-full h-full rounded-2xl flex flex-col items-center justify-between py-9 px-7 text-center relative overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isActive
                        ? `0 0 80px ${portal.color}18, 0 24px 80px rgba(0,0,0,0.6)`
                        : '0 24px 60px rgba(0,0,0,0.45)',
                }}
            >
                {/* Active glowing border overlay */}
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                        border: `1.5px solid ${portal.color}`,
                        boxShadow: `inset 0 0 40px ${portal.color}08`,
                    }}
                />

                {/* TOP — subtitle */}
                <div
                    className="relative z-10 px-4 py-1.5 rounded-full text-[0.58rem] tracking-[0.25em] font-mono border pointer-events-none"
                    style={{
                        color: portal.color,
                        borderColor: `${portal.color}45`,
                        backgroundColor: `${portal.color}10`,
                    }}
                >
                    {portal.subtitle.toUpperCase()}
                </div>

                {/* MIDDLE — title + divider + description */}
                <div className="relative z-10 flex flex-col items-center gap-5 pointer-events-none select-none px-2">
                    <h2
                        className="font-black tracking-tighter text-white leading-none text-wrap"
                        style={{ fontSize: portal.title.length > 10 ? '1.75rem' : '2.5rem' }}
                    >
                        {portal.title}
                    </h2>

                    <div
                        className="w-10 h-px"
                        style={{ backgroundColor: `${portal.color}70` }}
                    />

                    <p className="text-[0.75rem] text-white/45 leading-relaxed">
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
                        <span className="text-[0.62rem] font-bold tracking-[0.2em]">
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
