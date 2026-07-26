import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog-data';
import { beatsCatalog, categories as beatCategories } from '@/lib/catalog';

function getLastModified(updatedAt?: string) {
    if (!updatedAt) return undefined;

    const date = new Date(updatedAt);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.virzyguns.com';

    // 1. Static Core Routes
    const staticRoutes = [
        '',
        '/about',
        '/studio',
        '/studio/beats',
        '/studio/beats/licensing',
        '/ja-JP/studio/beats',
        '/ja-JP/studio/beats/licensing',
        '/de-DE/studio/beats',
        '/de-DE/studio/beats/licensing',
        '/studio/masterclass',
        '/lab/healingwave',
        '/cadenz',
        '/flow',
        '/book',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        changeFrequency: route.includes('/studio/beats') ? ('daily' as const) : ('monthly' as const),
        priority: route === '' ? 1 : route.includes('/studio/beats') ? 0.9 : 0.8,
    }));

    // 2. Multilingual Category Routes (en-US, ja-JP, de-DE)
    const beatCategoryRoutes = beatCategories.flatMap((cat) => [
        {
            url: `${baseUrl}/studio/beats/${cat.slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.85,
        },
        {
            url: `${baseUrl}/ja-JP/studio/beats/${cat.slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/de-DE/studio/beats/${cat.slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ]);

    // 3. Multilingual Beat Product Pages (Only Indexable beats)
    const indexableBeats = beatsCatalog.filter((b) => b.seoStatus === 'indexable');
    const beatProductRoutes = indexableBeats.flatMap((beat) => {
        const lastModified = getLastModified(beat.updatedAt);
        const timestamp = lastModified ? { lastModified } : {};

        return [
            {
                url: `${baseUrl}/studio/beats/${beat.slug}`,
                ...timestamp,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            },
            {
                url: `${baseUrl}/ja-JP/studio/beats/${beat.slug}`,
                ...timestamp,
                changeFrequency: 'weekly' as const,
                priority: 0.75,
            },
            {
                url: `${baseUrl}/de-DE/studio/beats/${beat.slug}`,
                ...timestamp,
                changeFrequency: 'weekly' as const,
                priority: 0.75,
            },
        ];
    });

    // 4. Dynamic Blog Routes
    const blogRoutes = getAllSlugs().map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 5. Blog Category Routes
    const blogCategories = ['production-tips', 'licensing-guide', 'genre-guides'];
    const categoryRoutes = blogCategories.map((cat) => ({
        url: `${baseUrl}/blog/category/${cat}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...beatCategoryRoutes, ...beatProductRoutes, ...blogRoutes, ...categoryRoutes];
}
