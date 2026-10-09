import type { Metadata } from 'next';
import beatStarsFilterIndex from '@/data/beatstars-filter-index.json';
import { formatBeatTitle } from '@/lib/beat-title';
import type { BeatProduct } from '@/lib/catalog';

/** Share-card image for a page's openGraph/twitter metadata. See app/og/route.tsx. */
export function ogImage({ title, kicker, sub }: { title: string; kicker?: string; sub?: string }) {
    const params = new URLSearchParams({ title });
    if (kicker) params.set('kicker', kicker);
    if (sub) params.set('sub', sub);
    return { url: `/og?${params.toString()}`, width: 1200, height: 630, alt: title };
}

/** The same values the root layout (app/layout.tsx) sets for the whole site. */
const SITE_NAME = 'Virzy Guns Production';
const SITE_LOCALE = 'en_US';
const TWITTER_CREATOR = '@virzyguns';

/**
 * openGraph and twitter metadata for a page. A page's own openGraph or
 * twitter object replaces the root layout's instead of merging with it, so
 * og:site_name, og:locale and twitter:creator are set here again.
 */
export function socialMetadata({
    title,
    description,
    url,
    image,
    article,
}: {
    title: string;
    description: string;
    url: string;
    image: ReturnType<typeof ogImage>;
    /** Present for a lesson: og:type article with its dates, author (a profile URL) and section (the path's name). */
    article?: { publishedTime: string; modifiedTime: string; authors: string[]; section?: string };
}): Pick<Metadata, 'openGraph' | 'twitter'> {
    const shared = { title, description, url, siteName: SITE_NAME, locale: SITE_LOCALE, images: [image] };
    return {
        openGraph: article ? { ...shared, type: 'article', ...article } : { ...shared, type: 'website' },
        twitter: { card: 'summary_large_image', title, description, images: [image.url], creator: TWITTER_CREATOR },
    };
}

/** Share card for a beat: clean name, genre, BPM and key. */
export function beatShareCard(beat: BeatProduct, genre: string) {
    const metadata = (beatStarsFilterIndex as Record<string, { bpm?: number | null; key?: string | null }>)[beat.beatstarsTrackId];
    const key = metadata?.key && metadata.key !== 'None' ? metadata.key : undefined;
    const sub = [genre, metadata?.bpm ? `${metadata.bpm} BPM` : undefined, key, `Licenses from ${beat.licenses[0]?.price || '$15'}`]
        .filter(Boolean)
        .join(' · ');
    return ogImage({ kicker: 'Beat by Virzy Guns', title: formatBeatTitle(beat.title).name, sub });
}
