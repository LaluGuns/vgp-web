import type { Metadata } from 'next';
import Link from 'next/link';
import { TextLink } from '@/components/editorial/EditorialPrimitives';

export const metadata: Metadata = {
    title: 'Page not found',
    robots: { index: false, follow: true },
};

const destinations = [
    { label: 'Home', note: 'Start from the top', href: '/' },
    { label: 'HealingWave', note: 'Music made to help people focus, move and recover', href: '/healingwave' },
    { label: 'Beat Store', note: 'License a beat today', href: '/studio/beats' },
    { label: 'Articles', note: 'Free notes on production and licensing', href: '/blog' },
];

export default function NotFound() {
    return (
        <article className="editorial-shell min-h-screen px-4 pb-28 pt-16 text-white sm:px-6 sm:pt-24">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                <div data-enter="" className="lg:col-span-6">
                    <p className="font-mono text-sm text-sky-300">404</p>
                    <h1 className="mt-4 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                        This page is off the beat.
                    </h1>
                    <p className="mt-6 max-w-md text-lg leading-8 text-white/70">
                        The link may be old, or the page moved. One of these should get you where you were going.
                    </p>
                    <div className="mt-8">
                        <TextLink href="mailto:founder@virzyguns.com">Tell me about the broken link</TextLink>
                    </div>
                </div>
                <ul data-enter="" style={{ '--enter-delay': '120ms' } as React.CSSProperties} className="divide-y divide-white/10 border-y border-white/10 lg:col-span-5 lg:col-start-8 lg:self-end">
                    {destinations.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="group/row flex flex-col gap-1 py-5 transition-colors hover:bg-white/[0.02]">
                                <span className="text-lg font-semibold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2">
                                    {item.label}
                                </span>
                                <span className="text-sm text-white/55">{item.note}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}
