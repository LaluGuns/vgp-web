'use client';

import Image from 'next/image';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const POSTER_SRC = '/images/vgp-audio-sentinel-poster.jpg';
const VIDEO_SRC = '/videos/vgp-audio-sentinel-hero.mp4';

export function AudioSentinelHeroMedia({
    placement = 'flow',
    className = '',
}: {
    placement?: 'flow' | 'heroBackground';
    className?: string;
}) {
    const [canPlayVideo, setCanPlayVideo] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const smoothX = useSpring(pointerX, { stiffness: 90, damping: 22, mass: 0.35 });
    const smoothY = useSpring(pointerY, { stiffness: 90, damping: 22, mass: 0.35 });
    const x = useTransform(smoothX, [-1, 1], [-3, 3]);
    const y = useTransform(smoothY, [-1, 1], [-2, 2]);

    useEffect(() => {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const desktopQuery = window.matchMedia('(min-width: 768px)');

        const update = () => {
            setCanPlayVideo(desktopQuery.matches && !motionQuery.matches);
        };

        update();
        motionQuery.addEventListener('change', update);
        desktopQuery.addEventListener('change', update);

        return () => {
            motionQuery.removeEventListener('change', update);
            desktopQuery.removeEventListener('change', update);
        };
    }, []);

    const isHeroBackground = placement === 'heroBackground';
    const wrapperClass = isHeroBackground
        ? 'pointer-events-none absolute right-[-13vw] top-14 z-0 hidden w-[82vw] min-w-[860px] max-w-[1380px] md:block lg:right-[-10vw] lg:top-16 xl:right-[-8vw] xl:w-[78vw]'
        : 'relative mx-auto w-full max-w-[760px] lg:-mr-24 lg:w-[118%] lg:max-w-none xl:-mr-36 xl:w-[128%]';

    return (
        <m.div
            className={`${wrapperClass} ${className}`}
            style={{ x: canPlayVideo && !isHeroBackground ? x : 0, y: canPlayVideo && !isHeroBackground ? y : 0 }}
            onMouseMove={(event) => {
                if (!canPlayVideo || isHeroBackground) return;
                const rect = event.currentTarget.getBoundingClientRect();
                pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
                pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
            }}
            onMouseLeave={() => {
                pointerX.set(0);
                pointerY.set(0);
            }}
        >
            <div className="absolute inset-x-10 bottom-8 h-24 rounded-full bg-sky-200/10 blur-3xl" aria-hidden="true" />
            <div
                className="relative aspect-[16/9] overflow-hidden bg-transparent"
                style={{
                    WebkitMaskImage: isHeroBackground
                        ? 'radial-gradient(ellipse at 66% 50%, #000 34%, rgba(0,0,0,0.82) 58%, transparent 86%)'
                        : 'radial-gradient(ellipse at 63% 50%, #000 44%, rgba(0,0,0,0.9) 64%, transparent 93%)',
                    maskImage: isHeroBackground
                        ? 'radial-gradient(ellipse at 66% 50%, #000 34%, rgba(0,0,0,0.82) 58%, transparent 86%)'
                        : 'radial-gradient(ellipse at 63% 50%, #000 44%, rgba(0,0,0,0.9) 64%, transparent 93%)',
                }}
            >
                <Image
                    src={POSTER_SRC}
                    alt="VGP Audio Sentinel cinematic hero visual"
                    fill
                    priority
                    sizes="(min-width: 1280px) 980px, (min-width: 1024px) 860px, (min-width: 768px) 70vw, 94vw"
                    className={`${isHeroBackground ? 'scale-[1.04] object-[58%_50%] opacity-95' : 'scale-[1.14] object-[62%_50%] md:scale-[1.2]'} object-cover`}
                />

                {canPlayVideo && !videoFailed ? (
                    <video
                        className={`absolute inset-0 hidden h-full w-full object-cover md:block ${isHeroBackground ? 'scale-[1.04] object-[58%_50%] opacity-95' : 'scale-[1.2] object-[62%_50%]'}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={POSTER_SRC}
                        preload="metadata"
                        aria-label="VGP Audio Sentinel hero animation"
                        onError={() => setVideoFailed(true)}
                    >
                        <source src={VIDEO_SRC} type="video/mp4" />
                    </video>
                ) : null}

                <div className="absolute inset-0 bg-[linear-gradient(90deg,#030405_0%,rgba(3,4,5,0.82)_17%,rgba(3,4,5,0.32)_40%,rgba(3,4,5,0.08)_70%,#030405_100%),linear-gradient(180deg,rgba(3,4,5,0.22)_0%,rgba(3,4,5,0)_44%,#030405_100%)]" />
            </div>
        </m.div>
    );
}
