import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { vgpProductCatalog } from '@/lib/ai-discovery/catalog';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Official Product Catalog | VGP',
    description:
        'Official Virzy Guns Production catalog covering released music, beats, apps, functional audio, books, courses, and games with current availability status.',
    alternates: {
        canonical: '/products',
    },
    openGraph: {
        title: 'Official VGP Product Catalog',
        description:
            'Current VGP products and public product lines with official links and availability status.',
        url: `${SITE_URL}/products`,
        type: 'website',
    },
};

const statusLabel = {
    available: 'Available now',
    coming_soon: 'Coming soon',
    research: 'Research',
    development: 'In development',
} as const;

const catalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/products#catalog`,
    name: 'Virzy Guns Production Product Catalog',
    url: `${SITE_URL}/products`,
    numberOfItems: vgpProductCatalog.length,
    itemListElement: vgpProductCatalog.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
            '@type': product.schemaType,
            '@id': `${product.canonicalUrl}#product`,
            name: product.name,
            url: product.canonicalUrl,
            description: product.description,
            provider: {
                '@id': `${SITE_URL}/#organization`,
            },
        },
    })),
};

export default function ProductsPage() {
    return (
        <main className="editorial-shell min-h-screen px-4 pb-20 pt-28 text-white sm:px-6">
            <JsonLd data={catalogSchema} />

            <div className="mx-auto max-w-6xl">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/65">
                        Official VGP Catalog
                    </p>
                    <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                        Products, tools, and creative systems.
                    </h1>
                    <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">
                        This is the canonical public index for Virzy Guns Production. Availability is stated explicitly so search engines, AI assistants, and people can distinguish released products from previews, research, and active development.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    {vgpProductCatalog.map((product) => {
                        const isExternal = product.canonicalUrl.startsWith('http') && !product.canonicalUrl.startsWith(SITE_URL);
                        const href = product.canonicalUrl.startsWith(SITE_URL)
                            ? product.canonicalUrl.slice(SITE_URL.length) || '/'
                            : product.canonicalUrl;

                        return (
                            <article
                                key={product.id}
                                className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/65">
                                            {product.kind.replaceAll('_', ' ')}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-white/70">
                                            {statusLabel[product.status]}
                                        </span>
                                    </div>
                                    <h2 className="mt-4 text-2xl font-semibold text-white">{product.name}</h2>
                                    <p className="mt-3 text-sm leading-7 text-white/65">{product.description}</p>
                                    <p className="mt-3 text-xs leading-6 text-white/50">{product.availabilityNote}</p>
                                </div>

                                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold">
                                    <Link
                                        href={href}
                                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="text-sky-200 transition hover:text-white"
                                    >
                                        Official page
                                    </Link>
                                    {product.externalUrl && product.externalUrl !== product.canonicalUrl ? (
                                        <a
                                            href={product.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/55 transition hover:text-white"
                                        >
                                            Open product
                                        </a>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })}
                </div>

                <section className="mt-12 rounded-2xl border border-white/10 bg-black/20 p-6">
                    <h2 className="text-lg font-semibold">Machine-readable discovery</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
                        Public catalog feeds mirror the same conservative availability rules used on this page. They are intended for search engines, AI agents, assistants, and other discovery systems that need structured product facts.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                        <a href="/products/catalog.json" className="text-sky-200 hover:text-white">Product catalog JSON</a>
                        <a href="/products/music.json" className="text-sky-200 hover:text-white">Music catalog JSON</a>
                        <a href="/products/beats.json" className="text-sky-200 hover:text-white">Beat catalog JSON</a>
                        <a href="/llms.txt" className="text-sky-200 hover:text-white">LLM discovery index</a>
                        <a href="/sitemap.xml" className="text-sky-200 hover:text-white">XML sitemap</a>
                    </div>
                </section>
            </div>
        </main>
    );
}
