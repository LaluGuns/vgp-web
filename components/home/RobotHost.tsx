'use client';

import { m, useSpring, useTransform, MotionValue } from 'framer-motion';

interface RobotHostProps {
    activeIndex: number;
    activeColor: string;
    carouselDragX: MotionValue<number>;
}

export function RobotHost({ activeIndex, activeColor, carouselDragX }: RobotHostProps) {
    // Smoothen the drag input for subtle background parallax
    const smoothDrag = useSpring(carouselDragX, { damping: 40, stiffness: 150 });

    // Subtle parallax: when dragging carousel, the background video shifts slightly in the opposite direction
    const translateX = useTransform(smoothDrag, [-500, 500], ['-2%', '2%']);

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black z-0">
            {/* Enlarged slightly container to hide edges during parallax */}
            <m.div
                className="absolute inset-0 w-[104%] h-[104%] -left-[2%] -top-[2%]"
                style={{ x: translateX }}
            >
                <video
                    src="/videos/robot.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover opacity-90"
                    style={{ contentVisibility: 'auto' }}
                />
            </m.div>

            {/* Premium Apple Y3K Gradient Overlays */}
            {/* 1. Vignette & Edge Darkening */}
            <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)" />

            {/* 2. Heavy bottom gradient for seamless transition and dock readability */}
            <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-black via-black/80 to-transparent" />

            {/* 3. Top gradient for header navbar readability */}
            <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-black/90 via-black/40 to-transparent" />

            {/* Dynamic Active Portal Color Bloom */}
            <div
                className="absolute inset-0 transition-colors duration-1000 mix-blend-color opacity-20"
                style={{ backgroundColor: activeColor }}
            />
            <div
                className="absolute inset-x-0 bottom-0 h-[60vh] mix-blend-screen opacity-15 blur-[100px] transition-colors duration-1000"
                style={{ backgroundColor: activeColor }}
            />
        </div>
    );
}
