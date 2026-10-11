import { articles } from '@/lib/blog-data';
import { searchDigest } from '../search-index';

// Built once at build time; the lesson list fetches it when the reader starts a search (BlogIndex.tsx).
export const dynamic = 'force-static';

export function GET() {
    // The list asks for it with the digest's version in the query (BlogIndex.tsx), so the browser may keep it for a day.
    return Response.json(searchDigest(articles), { headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=86400, s-maxage=31536000' } });
}
