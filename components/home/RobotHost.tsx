'use client';

import { m, useSpring, useTransform, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';

interface RobotHostProps {
    activeIndex: number;
    activeColor: string;
    carouselDragX: MotionValue<number>; // To sync with drag
}

export function RobotHost({ activeIndex, activeColor, carouselDragX }: RobotHostProps) {
    // Smoothen the drag input for head tracking
    const smoothDrag = useSpring(carouselDragX, { damping: 30, stiffness: 200 });

    // Map drag x to rotation/translation for 2.5D effect
    // As user drags left (carousel goes right), robot looks right
    const rotateY = useTransform(smoothDrag, [-500, 500], [-15, 15]);
    const translateX = useTransform(smoothDrag, [-500, 500], [-30, 30]);

    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <m.div
                className="relative w-[700px] h-[700px] sm:w-[850px] sm:h-[850px] md:w-[1000px] md:h-[1000px] lg:w-[1150px] lg:h-[1150px] -translate-x-[25%] md:-translate-x-[20%]"
                style={{
                    rotateY,
                    x: translateX,
                    // Dynamic drop shadow for "Backlit" effect
                    filter: `drop-shadow(0 0 40px ${activeColor}40)`,
                    transition: 'filter 0.5s ease-out'
                }}
                animate={{
                    // Slight "breathing" scale
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
            >
                <Image
                    src="/images/robot-mascot-v3.png"
                    alt="VGP Robot Host"
                    fill
                    className="object-contain object-center"
                    priority
                    sizes="(max-width: 768px) 100vw, 1150px"
                    style={{ opacity: 0.9 }}
                />

                {/* Eye/Visor Scanning Effect */}
                <div
                    className="absolute top-[28%] left-[48%] w-40 h-10 blur-xl mix-blend-screen transition-colors duration-500"
                    style={{ backgroundColor: activeColor, opacity: 0.6 }}
                />
            </m.div>

            {/* Ambient Floor Light */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10"
            />
            <div
                className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[20%] blur-[100px] transition-colors duration-700 opacity-40 mix-blend-screen"
                style={{ backgroundColor: activeColor }}
            />
        </div>
    );
}
