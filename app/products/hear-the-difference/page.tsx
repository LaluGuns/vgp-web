import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://www.virzyguns.com';
const PAGE_URL = `${SITE_URL}/products/hear-the-difference`;

export const metadata: Metadata = {
    title: 'Hear the Difference | VGP Music Game',
    description:
        'Official VGP page for Hear the Difference, a music game currently in development. The current V5 authority is not approved for production release.',
    alternates: {
        canonical: '/products/hear-the-difference',
    },
    robots: {
        index: true,
        follow: true,
    },
};

const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    '@id': `${PAGE_URL}#product`,
    name: 'Hear the Difference',
    url: PAGE_URL,
    description:
        'A Virzy Guns Production music game in active development. Current V5 work includes Solo, Daily, VS Bot, PWA, Android, and locally verified Quick Match multiplayer foundations.',
    gamePlatform: ['Web', 'Android'],
    applicationCategory: 'Game',
    author: {
        '@id': `${SITE_URL}/#organization`,
    },
    publisher: {
        '@id': `${SITE_URL}/#organization`,
    },
    dateModified: '2026-08-24',
};

export default function HearTheDifferencePage() {
    return (
        <main className="editorial-shell min-h-screen px-4 pb-20 pt-28 text-white sm:px-6">
            <JsonLd data={gameSchema} />

            <article className="mx-auto max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/65">
                    VGP Game · In Development
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                    Hear the Difference
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                    Hear the Difference is a VGP music game currently being developed for web and Android, with work covering Solo, Daily, VS Bot, PWA support, and online Quick Match multiplayer.
                </p>

                <div className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6">
                    <h2 className="text-lg font-semibold text-amber-100">Current availability</h2>
                    <p className="mt-2 text-sm leading-7 text-white/65">
                        Not released. The current V5 project authority explicitly classifies production as DO NOT SHIP. This page exists to establish the official product identity without presenting development builds as a public release.
                    </p>
                </div>

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">Verified development state</h2>
                    <ul className="mt-4 grid gap-3 text-sm leading-7 text-white/65 sm:grid-cols-2">
                        <li className="rounded-xl border border-white/10 bg-white/[0.025] p-4">Solo, Daily, and VS Bot entry flows are present in the current V5 work.</li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.025] p-4">Quick Match multiplayer passed local two-client WebSocket verification.</li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.025] p-4">PWA behavior passed local verification.</li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.025] p-4">Android debug APK build passed, while production signing and device QA remain separate release work.</li>
                    </ul>
                </section>

                <div className="mt-12 flex flex-wrap gap-4 text-sm font-semibold">
                    <Link href="/products" className="text-sky-200 hover:text-white">Back to VGP products</Link>
                    <Link href="/studio/beats" className="text-white/55 hover:text-white">Browse available beats</Link>
                </div>
            </article>
        </main>
    );
}
