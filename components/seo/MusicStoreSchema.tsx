import { JsonLd } from '@/components/blog/article/JsonLd';
import { PUBLIC_CONFIRMED_LICENSES } from '@/lib/licensing-registry';

/**
 * The beat store as structured data, from the data only: the price range is
 * the owner-confirmed licence tiers (lib/licensing-registry.ts). No
 * AggregateOffer: per-beat offers are published only once a beat's offer
 * data is verified (lib/seo/beat-structured-data.ts), so the store does not
 * claim an offer count either. A plain <script nonce> through JsonLd, never
 * next/script (CLAUDE.md).
 */
export function MusicStoreSchema() {
    const prices = PUBLIC_CONFIRMED_LICENSES.flatMap((tier) => (tier.priceUsd === null ? [] : [tier.priceUsd]));
    const priceRange = prices.length ? `$${Math.min(...prices)} - $${Math.max(...prices)}` : undefined;
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'OnlineStore',
                name: 'VGP Beat Store',
                image: 'https://www.virzyguns.com/branding/vgp-logo-chrome-full.png',
                description: 'Beats with non-exclusive licenses, exclusive license inquiries, and production services by Virzy Guns Production.',
                url: 'https://www.virzyguns.com/studio/beats',
                ...(priceRange ? { priceRange } : {}),
                currenciesAccepted: 'USD',
            }}
        />
    );
}
