'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';
import { socialData } from '@/components/SocialDock';

const footerGroups = [
    {
        title: 'Studio',
        links: [
            { name: 'Studio Overview', href: '/studio' },
            { name: 'Beat Store', href: '/studio/beats' },
            { name: 'Custom Production', href: '/studio/beats' },
        ],
    },
    {
        title: 'Lab',
        links: [
            { name: 'HealingWave Lab', href: '/lab/healingwave' },
            { name: 'CADENZ', href: '/cadenz' },
        ],
    },
    {
        title: 'Learn',
        links: [
            { name: 'Masterclass', href: '/studio/masterclass' },
            { name: 'Books', href: '/book' },
            { name: 'Blog', href: '/blog' },
        ],
    },
    {
        title: 'Company',
        links: [
            { name: 'About', href: '/about' },
            { name: 'Penerbit', href: '/publisher' },
            { name: 'Contact', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=founder@virzyguns.com' },
        ],
    },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative border-t border-white/[0.08] px-4 py-16 sm:px-6 md:py-20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/25 to-transparent" />

            <m.div
                className="mx-auto max-w-7xl"
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="grid gap-12 lg:grid-cols-[1.1fr_1.4fr]">
                    <div>
                        <Image
                            src="/branding/vgp-logo-chrome-full.png"
                            alt="Virzy Guns Production"
                            width={280}
                            height={280}
                            className="mb-8 h-auto w-44 opacity-80 saturate-[0.82] sm:w-52"
                            sizes="208px"
                        />
                        <h2 className="font-display text-4xl font-normal leading-none text-white sm:text-5xl">
                            100% Art.
                            <br />
                            <span className="text-white/40">100% Science.</span>
                        </h2>
                        <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
                            Virzy Guns Production is home to songs, premium beats, functional audio, CADENZ, books, and producer education by Virzy Guns.
                        </p>

                        <div className="mt-8 flex items-center gap-3">
                            {socialData.map((social) => (
                                <m.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="liquid-glass-soft flex h-10 w-10 items-center justify-center rounded-full text-white/40 transition hover:border-sky-200/30 hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </m.a>
                            ))}
                        </div>
                    </div>

                    <m.div
                        className="grid grid-cols-2 gap-8 sm:grid-cols-4"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {footerGroups.map((group) => (
                            <m.div key={group.title} variants={staggerChild}>
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                                    {group.title}
                                </p>
                                <nav className="grid gap-2.5" aria-label={`${group.title} links`}>
                                    {group.links.map((link) => {
                                        const external = link.href.startsWith('http');
                                        const className =
                                            'text-sm text-white/50 transition hover:text-white focus:outline-none focus-visible:text-white';

                                        return external ? (
                                            <a
                                                key={link.name}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={className}
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link key={link.name} href={link.href} className={className}>
                                                {link.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </m.div>
                        ))}
                    </m.div>
                </div>

                <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <p>Copyright {currentYear} Virzy Guns Production. All rights reserved.</p>
                    <p>100% Art. 100% Science.</p>
                </div>
            </m.div>

            <div className="h-20 md:hidden" />
        </footer>
    );
}
