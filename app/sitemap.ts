import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog-data';
import { beatsCatalog, categories as beatCategories } from '@/lib/catalog';

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
        lastModified: new Date(),
        changeFrequency: route.includes('/studio/beats') ? ('daily' as const) : ('monthly' as const),
        priority: route === '' ? 1 : route.includes('/studio/beats') ? 0.9 : 0.8,
    }));

    // 2. Multilingual Category Routes (en-US, ja-JP, de-DE)
    const beatCategoryRoutes = beatCategories.flatMap((cat) => [
        {
            url: `${baseUrl}/studio/beats/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.85,
        },
        {
            url: `${baseUrl}/ja-JP/studio/beats/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/de-DE/studio/beats/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ]);

    // 3. Multilingual Beat Product Pages (en-US, ja-JP, de-DE)
    const beatProductRoutes = beatsCatalog.flatMap((beat) => [
        {
            url: `${baseUrl}/studio/beats/${beat.slug}`,
            lastModified: new Date(beat.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ja-JP/studio/beats/${beat.slug}`,
            lastModified: new Date(beat.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.75,
        },
        {
            url: `${baseUrl}/de-DE/studio/beats/${beat.slug}`,
            lastModified: new Date(beat.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.75,
        },
    ]);

    // 4. Dynamic Blog Routes
    const blogRoutes = getAllSlugs().map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 5. Blog Category Routes
    const blogCategories = ['production-tips', 'licensing-guide', 'genre-guides'];
    const categoryRoutes = blogCategories.map((cat) => ({
        url: `${baseUrl}/blog/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...beatCategoryRoutes, ...beatProductRoutes, ...blogRoutes, ...categoryRoutes];
}
