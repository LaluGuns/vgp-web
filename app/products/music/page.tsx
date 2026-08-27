import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://www.virzyguns.com';
const PAGE_URL = `${SITE_URL}/products/music`;

const artists = [
    { name: 'Virzy Guns', trackIdentityCount: 315 },
    { name: 'Chill Music Division', trackIdentityCount: 264 },
    { name: 'LUNA Q', trackIdentityCount: 20 },
    { name: 'LA LU', trackIdentityCount: 10 },
    { name: 'mia.exe', trackIdentityCount: 8 },
];

export const metadata: Metadata = {
    title: 'Released Music Catalog | VGP',
    description:
        'Official VGP music catalog identity page covering 617 unique distributed track identities across Virzy Guns, Chill Music Division, LUNA Q, LA LU, and mia.exe.',
    alternates: {
        canonical: '/products/music',
    },
    openGraph: {
        title: 'VGP Released Music Catalog',
        description:
            'A public identity summary of 617 distributed recordings across five VGP catalog artist names.',
        url: PAGE_URL,
        type: 'website',
    },
};

const musicSchema = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    '@id': `${PAGE_URL}#catalog`,
    name: 'VGP Released Music Catalog',
    url: PAGE_URL,
    description:
        'Virzy Guns Production catalog identity summary covering 617 unique distributed track identities across five artist names.',
    numTracks: 617,
    creator: {
        '@id': `${SITE_URL}/#organization`,
    },
};

export default function MusicCatalogPage() {
    return (
        <main className="editorial-shell min-h-screen px-4 pb-20 pt-28 text-white sm:px-6">
            <JsonLd data={musicSchema} />

            <article className="mx-auto max-w-5xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/65">
                    Official VGP Music Catalog
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                    Released music identity catalog.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                    This page establishes the public identity of VGP&apos;s distributed music catalog without exposing private royalty, store-performance, country, or transaction data. The current source snapshot contains 617 unique track identities with ISRC and UPC coverage.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {artists.map((artist) => (
                        <section key={artist.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <h2 className="text-xl font-semibold">{artist.name}</h2>
                            <p className="mt-2 text-sm text-white/60">
                                {artist.trackIdentityCount.toLocaleString('en-US')} unique track identities in the current catalog snapshot.
                            </p>
                        </section>
                    ))}
                </div>

                <section className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-6">
                    <h2 className="text-lg font-semibold">Catalog scope</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
                        This is an identity snapshot, not a live store-availability database. Availability for an individual recording should be checked on the target streaming or download service. Release-title data is not reconstructed when the source does not provide it.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                        <a href="/products/music.json" className="text-sky-200 hover:text-white">Music catalog JSON</a>
                        <Link href="/products" className="text-white/55 hover:text-white">All VGP products</Link>
                    </div>
                </section>
            </article>
        </main>
    );
}
