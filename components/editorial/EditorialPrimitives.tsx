'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function CinematicBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_70%_26%,rgba(14,165,233,0.1),transparent_28%),linear-gradient(180deg,rgba(3,4,5,0)_0%,#030405_86%)]" />
            <div className="absolute left-1/2 top-36 h-[18rem] w-[58rem] -translate-x-1/2 rounded-[100%] border border-sky-200/[0.075] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.13),transparent_64%)] blur-[1px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
    );
}

export function EditorialButton({
    children,
    href,
    onClick,
    variant = 'primary',
}: {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: ButtonVariant;
}) {
    const className =
        variant === 'primary'
            ? 'border-white bg-white text-[#030405] hover:bg-white/90 focus-visible:ring-white/70'
            : variant === 'secondary'
                ? 'border-sky-300/30 bg-sky-300/10 text-sky-100 hover:border-sky-200/50 hover:bg-sky-300/15 focus-visible:ring-sky-200/60'
                : 'border-white/10 bg-white/[0.035] text-white/80 hover:border-white/25 hover:text-white focus-visible:ring-white/50';

    const content = (
        <>
            <span>{children}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </>
    );

    const baseClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405] ${className}`;

    if (href) {
        return (
            <Link href={href} className={baseClass}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={baseClass}>
            {content}
        </button>
    );
}

export function SectionShell({
    children,
    className = '',
    id,
}: {
    children: ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <section id={id} className={`relative px-4 py-14 sm:px-6 sm:py-16 lg:py-20 ${className}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.055),transparent_34rem)]" aria-hidden="true" />
            <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
        </section>
    );
}

export function PageHeader({
    eyebrow,
    title,
    mutedTitle,
    description,
    primary,
    secondary,
}: {
    eyebrow: string;
    title: string;
    mutedTitle?: string;
    description: string;
    primary?: { label: string; href?: string; onClick?: () => void };
    secondary?: { label: string; href?: string; onClick?: () => void };
}) {
    return (
        <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
            <CinematicBackdrop />
            <m.div
                className="relative z-10 mx-auto max-w-5xl text-center"
                variants={staggerParent}
                initial="hidden"
                animate="visible"
            >
                <m.p variants={staggerChild} className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/60">
                    {eyebrow}
                </m.p>
                <m.h1
                    variants={staggerChild}
                    className="font-display text-4xl font-normal leading-[1.02] text-white sm:text-6xl sm:leading-[0.98] md:text-7xl lg:text-[5.25rem]"
                >
                    {title}
                    {mutedTitle ? (
                        <>
                            <br />
                            <span className="bg-gradient-to-r from-white/40 via-sky-200/80 to-white/40 bg-clip-text text-transparent">{mutedTitle}</span>
                        </>
                    ) : null}
                </m.h1>
                <m.p variants={staggerChild} className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                    {description}
                </m.p>
                {(primary || secondary) ? (
                    <m.div variants={staggerChild} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        {primary ? (
                            <EditorialButton href={primary.href} onClick={primary.onClick}>
                                {primary.label}
                            </EditorialButton>
                        ) : null}
                        {secondary ? (
                            <EditorialButton href={secondary.href} onClick={secondary.onClick} variant="ghost">
                                {secondary.label}
                            </EditorialButton>
                        ) : null}
                    </m.div>
                ) : null}
            </m.div>
        </section>
    );
}

export function EcosystemCard({
    title,
    eyebrow,
    description,
    href,
    cta,
    Icon,
    index,
}: {
    title: string;
    eyebrow: string;
    description: string;
    href: string;
    cta: string;
    Icon: LucideIcon;
    index?: number;
}) {
    return (
        <m.article variants={revealUp} className="h-full">
            <Link
                href={href}
                className="liquid-glass group flex h-full min-h-[17rem] flex-col rounded-lg p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-200/35 hover:shadow-[0_26px_90px_rgba(2,132,199,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405]"
            >
                <div className="mb-10 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-white/50">{String((index ?? 0) + 1).padStart(2, '0')}</span>
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">{eyebrow}</p>
                <h3 className="text-xl font-semibold leading-tight text-white">{title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-white/65">{description}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-sky-100/80 transition group-hover:text-white">
                    {cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
            </Link>
        </m.article>
    );
}

export function FeatureStrip({
    label,
    title,
    description,
    href,
    cta,
}: {
    label: string;
    title: string;
    description: string;
    href: string;
    cta: string;
}) {
    return (
        <m.div
            variants={revealUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="liquid-glass-strong h-full overflow-hidden rounded-lg"
        >
            <div className="flex h-full min-h-[23rem] flex-col p-6 sm:p-8 lg:p-10">
                <div className="max-w-[36rem]">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/55">{label}</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-white sm:text-4xl lg:text-[3.15rem]">
                        {title}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">{description}</p>
                </div>
                <div className="mt-auto flex pt-8 sm:justify-end">
                    <EditorialButton href={href} variant="secondary">
                        {cta}
                    </EditorialButton>
                </div>
            </div>
        </m.div>
    );
}

export function AudioLine({ className = '' }: { className?: string }) {
    return (
        <div className={`flex h-16 items-center gap-1 ${className}`} aria-hidden="true">
            {Array.from({ length: 42 }).map((_, index) => (
                <span
                    key={index}
                    className="w-px rounded-full bg-gradient-to-t from-sky-200/10 via-sky-200/60 to-white/10"
                    style={{ height: `${18 + ((index * 17) % 43)}px`, opacity: 0.24 + ((index * 11) % 5) * 0.08 }}
                />
            ))}
        </div>
    );
}
