import { headers } from 'next/headers';

/**
 * Structured data as a plain <script nonce> (CLAUDE.md: next/script drops
 * inline JSON-LD under the nonce-based CSP). "<" is escaped so a title can
 * never close the script early.
 */
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
    const nonce = (await headers()).get('x-nonce') ?? undefined;
    return (
        <script
            type="application/ld+json"
            nonce={nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}
