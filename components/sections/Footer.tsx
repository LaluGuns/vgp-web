import Image from 'next/image';
import Link from 'next/link';
import { socialData } from '@/components/socialLinks';
import { mainNavGroups } from '@/lib/vgp-ecosystem';
import { EmailChooser } from '@/components/editorial/EmailChooser';

const navGroupLinks = (key: 'studio' | 'apps' | 'learn') =>
    mainNavGroups.find((group) => group.key === key)?.children.map(({ name, href }) => ({ name, href })) ?? [];

const footerGroups = [
    { title: 'Studio', links: navGroupLinks('studio') },
    { title: 'Apps', links: navGroupLinks('apps') },
    { title: 'Learn', links: navGroupLinks('learn') },
    {
        title: 'Company',
        links: [
            { name: 'About Virzy Guns', href: '/about' },
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
            { name: 'Contact', href: 'mailto:founder@virzyguns.com' },
        ],
    },
];

const linkClass =
    'text-sm text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 px-4 pb-10 pt-16 sm:px-6 md:pt-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid min-w-0 gap-12 lg:grid-cols-12">
                    <div className="min-w-0 lg:col-span-5">
                        <Image
                            src="/branding/vgp-logo-chrome-full.png"
                            alt="Virzy Guns Production"
                            width={280}
                            height={280}
                            className="h-auto w-36 opacity-90 mix-blend-lighten sm:w-40"
                            sizes="160px"
                        />
                        <p className="mt-8 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl">
                            100% Art.
                            <br />
                            <span className="text-white/50">100% Science.</span>
                        </p>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                            Songs, beats, apps and producer guides by Virzy Guns.
                        </p>

                        <ul className="mt-6 flex flex-wrap items-center gap-1" aria-label="Virzy Guns on social media">
                            {socialData.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        className="group -ml-2 flex h-11 w-11 items-center justify-center rounded-md text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        {social.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-7">
                        {footerGroups.map((group) => (
                            <nav key={group.title} aria-label={`${group.title} links`}>
                                <p className="text-sm font-medium text-white">{group.title}</p>
                                <ul className="mt-4 grid gap-3">
                                    {group.links.map((link) => {
                                        const external = link.href.startsWith('http');
                                        const mailto = link.href.startsWith('mailto:');

                                        return (
                                            <li key={link.name}>
                                                {external ? (
                                                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                                        {link.name}
                                                    </a>
                                                ) : mailto ? (
                                                    <EmailChooser href={link.href} className={linkClass} placement="top">
                                                        {link.name}
                                                    </EmailChooser>
                                                ) : (
                                                    <Link href={link.href} className={linkClass}>
                                                        {link.name}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <p className="mt-14 border-t border-white/10 pt-6 text-xs text-white/50">
                    © {currentYear} Virzy Guns Production
                </p>
            </div>

            <div className="h-20 md:hidden" aria-hidden="true" />
        </footer>
    );
}
