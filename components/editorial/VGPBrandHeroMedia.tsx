'use client';

import Image from 'next/image';
import { m, useReducedMotion } from 'framer-motion';

type VGPBrandHeroMediaProps = {
    placement?: 'flow' | 'heroBackground';
    className?: string;
};

export function VGPBrandHeroMedia({
    placement = 'flow',
    className = '',
}: VGPBrandHeroMediaProps) {
    const reduceMotion = useReducedMotion();
    const isHeroBackground = placement === 'heroBackground';

    const wrapperClass = isHeroBackground
        ? 'pointer-events-none absolute inset-x-0 top-0 h-[380px] sm:h-[450px] xl:h-full z-0 overflow-hidden'
        : 'relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-lg border border-sky-200/[0.08] bg-[#02070c]';

    return (
        <m.div
            className={`${wrapperClass} ${className}`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
            <m.div
                className="absolute inset-0"
                animate={reduceMotion ? undefined : { scale: [1.01, 1.025, 1.01] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Image
                    src="/images/vgp-brand-hero-v2.png"
                    alt="Virzy Guns Production chrome monogram"
                    fill
                    priority={isHeroBackground}
                    sizes={isHeroBackground ? '100vw' : '(max-width: 768px) 92vw, 688px'}
                    className={isHeroBackground ? 'object-cover object-[66%_center] xl:object-right opacity-[0.32] xl:opacity-100 transition-all duration-500' : 'object-cover object-[66%_center]'}
                />
            </m.div>

            <div
                className={isHeroBackground
                    ? 'absolute inset-0 bg-[linear-gradient(180deg,#02070c_0%,rgba(2,7,12,0.65)_30%,rgba(2,7,12,0.45)_50%,rgba(2,7,12,0.75)_80%,#02070c_100%)] xl:bg-[linear-gradient(90deg,#02070c_0%,#02070c_19%,rgba(2,7,12,0.92)_35%,rgba(2,7,12,0.46)_53%,rgba(2,7,12,0.08)_72%,rgba(2,7,12,0.12)_100%)]'
                    : 'absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,12,0.58),transparent_45%,rgba(2,7,12,0.08))]'}
                aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#02070c] to-transparent" aria-hidden="true" />
        </m.div>
    );
}
