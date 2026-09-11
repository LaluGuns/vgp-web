import { headers } from 'next/headers';

interface JsonLdProps {
    data: unknown;
}

function serializeJsonLd(data: unknown) {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}

/**
 * Render page-level JSON-LD with the request CSP nonce.
 *
 * Root entity schemas stay in app/layout.tsx. Use this helper for page-specific
 * Product, SoftwareApplication, Book, MusicRecording, ItemList, FAQ, and
 * Breadcrumb schemas so production CSP does not discard them.
 */
export async function JsonLd({ data }: JsonLdProps) {
    const requestHeaders = await headers();
    const nonce = requestHeaders.get('x-nonce') || undefined;

    return (
        <script
            nonce={nonce}
            suppressHydrationWarning
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    );
}
