import { articles } from '@/lib/blog-data';
import { searchDigest } from '../search-index';

// Built once at build time; the lesson list fetches it when the reader starts a search (BlogIndex.tsx).
export const dynamic = 'force-static';

export function GET() {
    return Response.json(searchDigest(articles), { headers: { 'X-Robots-Tag': 'noindex' } });
}
