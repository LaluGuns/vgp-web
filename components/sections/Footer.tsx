import Image from 'next/image';
import Link from 'next/link';
import { socialData } from '@/components/socialLinks';
import { VGP_FOUNDED, mainNavGroups, moreProjects, type NavGroup } from '@/lib/vgp-ecosystem';
import { EmailChooser } from '@/components/editorial/EmailChooser';

const navGroupLinks = (key: NavGroup['key']) =>
    mainNavGroups.find((group) => group.key === key)?.children.map(({ name, href }) => ({ name, href })) ?? [];

const footerGroups = [
    { title: 'HealingWave', links: navGroupLinks('healingwave') },
    { title: 'Studio', links: navGroupLinks('studio') },
    { title: 'Writing', links: navGroupLinks('writing') },
    {
        title: 'Virzy Guns',
        links: [
            { name: 'Story', href: '/about' },
            { name: 'Contact', href: 'mailto:founder@virzyguns.com' },
            ...moreProjects.map(({ name, href }) => ({ name, href })),
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
        ],
    },
];

// 44 px tall tap targets. The lists have no gap, so the rows sit 44 px apart
// (37.6 px before) and the text keeps its place under each heading.
const linkClass =
    'vgp-focus inline-flex min-h-11 items-center rounded-[4px] text-sm text-white/60 transition-colors hover:text-white focus-visible:text-white';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 px-4 pb-10 pt-16 sm:px-6 md:pt-20 print:hidden">
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
                        <p className="mt-8 max-w-sm font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-white sm:text-3xl">
                            Music that leaves people better than it found them.
                        </p>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                            I started Virzy Guns Production in {VGP_FOUNDED} to make records. HealingWave is what I am building with it now.
                        </p>

                        <ul className="mt-6 flex flex-wrap items-center gap-1" aria-label="Virzy Guns on social media">
                            {socialData.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        className="vgp-focus group -ml-2 flex h-11 w-11 items-center justify-center rounded-md text-white/60 transition-colors hover:text-white"
                                    >
                                        {social.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 lg:col-span-7">
                        {footerGroups.map((group) => (
                            <nav key={group.title} aria-label={`${group.title} links`}>
                                <p className="text-sm font-medium text-white">{group.title}</p>
                                <ul className="mt-1.5 grid">
                                    {group.links.map((link) => {
                                        const external = link.href.startsWith('http');
                                        const mailto = link.href.startsWith('mailto:');

                                        return (
                                            <li key={link.name} className="flex">
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

                <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50 lg:mt-14">
                    © {currentYear} Virzy Guns Production
                </p>
            </div>

            <div className="h-20 md:hidden" aria-hidden="true" />
        </footer>
    );
}
