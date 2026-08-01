'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Activity, BookOpen, Play, type LucideIcon } from 'lucide-react';

import { FLOW_APP_URL } from '@/lib/vgp-ecosystem';

type HeroProduct = {
    title: string;
    subtitle: string;
    status: string;
    statusClassName: string;
    meta: string;
    href: string;
    cta: string;
    Icon: LucideIcon;
    image: {
        src: string;
        alt: string;
        className: string;
    };
    external?: boolean;
};

const heroProducts: HeroProduct[] = [
    {
        title: 'Beat Store',
        subtitle: 'Trap, Drill, Phonk & More',
        status: 'Available Now',
        statusClassName: 'bg-sky-400/20 text-sky-200 ring-sky-400/30',
        meta: '$100',
        href: '/studio/beats',
        cta: 'Browse beats',
        Icon: Play,
        image: { src: '/branding/logo-tg.png', alt: 'VGP logo', className: 'object-contain p-0.5' },
    },
    {
        title: 'Flow Focus App',
        subtitle: 'Deep Work Audio',
        status: 'Available Now',
        statusClassName: 'bg-sky-400/20 text-sky-200 ring-sky-400/30',
        meta: '25:00',
        href: FLOW_APP_URL,
        cta: 'Open Flow App',
        Icon: Play,
        external: true,
        image: { src: '/branding/flowstate-logo.png', alt: 'Flow App logo', className: 'object-contain p-0.5' },
    },
    {
        title: 'Trap Edition Guide',
        subtitle: 'Producer Manual',
        status: 'Coming Soon',
        statusClassName: 'bg-amber-400/20 text-amber-200 ring-amber-400/30',
        meta: '80+ Pg PDF',
        href: '/book',
        cta: 'View details',
        Icon: BookOpen,
        image: { src: '/ebooks/trap-guide-book-cover.jpg', alt: 'Trap Edition Guide', className: 'object-cover' },
    },
    {
        title: 'CADENZ',
        subtitle: 'Running & Cycling',
        status: 'Coming Soon',
        statusClassName: 'bg-amber-400/20 text-amber-200 ring-amber-400/30',
        meta: 'Cadence',
        href: '/cadenz',
        cta: 'Preview',
        Icon: Activity,
        image: { src: '/images/CADENZ_POSTER.jpg', alt: 'CADENZ poster', className: 'object-cover' },
    },
];

function ProductLink({ product, children }: { product: HeroProduct; children: React.ReactNode }) {
    const className = 'mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-semibold text-sky-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70';

    if (product.external) {
        return (
            <a href={product.href} target="_blank" rel="noopener noreferrer" className={className}>
                {children}
            </a>
        );
    }

    return <Link href={product.href} className={className}>{children}</Link>;
}

export function VGPBrandHeroMedia({ className = '' }: { className?: string }) {
    return (
        <div className={`relative z-10 w-full ${className}`}>
            <m.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-3.5 min-[390px]:grid-cols-2 sm:gap-4"
            >
                {heroProducts.map((product) => {
                    const Icon = product.Icon;
                    return (
                        <article
                            key={product.title}
                            className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-white/15 bg-[#03131d]/90 p-4 shadow-2xl backdrop-blur-sm transition-all hover:border-sky-300/50 hover:bg-[#03131d]"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 sm:text-[10px] ${product.statusClassName}`}>
                                        {product.status}
                                    </span>
                                    <span className="shrink-0 font-mono text-xs font-semibold text-white/60">{product.meta}</span>
                                </div>
                                <div className="mt-4 flex min-w-0 items-center gap-3">
                                    <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 p-1">
                                        <Image
                                            src={product.image.src}
                                            alt={product.image.alt}
                                            fill
                                            sizes="36px"
                                            className={product.image.className}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="truncate text-sm font-semibold text-white">{product.title}</h2>
                                        <p className="truncate text-xs text-white/50">{product.subtitle}</p>
                                    </div>
                                </div>
                            </div>

                            <ProductLink product={product}>
                                <span className="inline-flex items-center gap-1">
                                    <Icon size={10} className={product.Icon === Play ? 'fill-current' : undefined} aria-hidden="true" />
                                    {product.cta}
                                </span>
                                <span aria-hidden="true" className="text-white/40 group-hover:text-white">&rarr;</span>
                            </ProductLink>
                        </article>
                    );
                })}
            </m.div>
        </div>
    );
}
