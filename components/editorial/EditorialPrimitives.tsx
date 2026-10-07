'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmailChooser } from '@/components/editorial/EmailChooser';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]';

const textLinkClass =
    'vgp-link text-sm font-medium text-white focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#050607]';

/** Pill button base: a soft press and an arrow that leans forward on hover. */
export const buttonMotionClass =
    'group/button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-[0.97]';

export function ButtonArrow() {
    return (
        <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-out group-hover/button:translate-x-1"
            aria-hidden="true"
        />
    );
}

function isExternal(href: string) {
    return href.startsWith('http');
}

const inlineLinkClass =
    'vgp-link text-white focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/60';

/**
 * Underlined text link. External URLs open in a new tab. `inline` keeps the
 * surrounding font size, for links inside a sentence.
 */
export function TextLink({
    href,
    children,
    className = '',
    inline = false,
}: {
    href: string;
    children: ReactNode;
    className?: string;
    inline?: boolean;
}) {
    const classes = `${inline ? inlineLinkClass : textLinkClass} ${className}`.trim();

    if (isExternal(href)) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
                {children}
            </a>
        );
    }

    if (href.startsWith('mailto:')) {
        return (
            <EmailChooser href={href} className={classes} wrapperClassName={className}>
                {children}
            </EmailChooser>
        );
    }

    return (
        <Link href={href} className={classes}>
            {children}
        </Link>
    );
}

/**
 * primary: the one solid action on a screen. secondary: outlined, for a
 * second action that still needs button weight. ghost: a text link.
 * Arrows are opt-in and belong on the primary action only.
 */
export function EditorialButton({
    children,
    href,
    onClick,
    variant = 'primary',
    withArrow = false,
}: {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: ButtonVariant;
    withArrow?: boolean;
}) {
    if (variant === 'ghost') {
        if (href) return <TextLink href={href}>{children}</TextLink>;
        return (
            <button type="button" onClick={onClick} className={`${textLinkClass} min-h-11`}>
                {children}
            </button>
        );
    }

    const variantClass =
        variant === 'primary'
            ? 'bg-white text-[#050607] hover:bg-white/85'
            : 'border border-white/25 text-white hover:border-white/60';

    const className = `${buttonMotionClass} ${variantClass} ${focusRing}`;

    const content = (
        <>
            <span>{children}</span>
            {withArrow ? <ButtonArrow /> : null}
        </>
    );

    if (href?.startsWith('mailto:')) {
        return (
            <EmailChooser href={href} className={className}>
                {content}
            </EmailChooser>
        );
    }

    if (href && isExternal(href)) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={className}>
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
        <section data-reveal="" id={id} className={`relative px-4 py-14 sm:px-6 sm:py-16 lg:py-20 ${className}`}>
            <div className="relative mx-auto max-w-7xl">{children}</div>
        </section>
    );
}

/**
 * Left-aligned page opening. `eyebrow` is optional context (a section name or
 * date); leave it out when the title already says the same thing.
 */
export function PageHeader({
    eyebrow,
    title,
    mutedTitle,
    description,
    primary,
    secondary,
}: {
    eyebrow?: string;
    title: string;
    mutedTitle?: string;
    description: string;
    primary?: { label: string; href?: string; onClick?: () => void };
    secondary?: { label: string; href?: string; onClick?: () => void };
}) {
    return (
        <section data-enter="" className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
            <div className="mx-auto max-w-7xl">
                {eyebrow ? <p className="text-sm text-white/55">{eyebrow}</p> : null}
                <h1 className={`${eyebrow ? 'mt-4' : ''} max-w-[18ch] font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white`}>
                    {title}
                    {mutedTitle ? <span className="block text-white/55">{mutedTitle}</span> : null}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                    {description}
                </p>
                {primary || secondary ? (
                    <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
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
                    </div>
                ) : null}
            </div>
        </section>
    );
}
