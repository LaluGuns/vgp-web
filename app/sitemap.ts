import { MetadataRoute } from 'next';
import { articles, categories as blogCategoriesData } from '@/lib/blog-data';
import { beatsCatalog, categories as beatCategories } from '@/lib/catalog';

const LIBRARY_ROUTES = ['/blog', '/learn', '/learn/glossary'];

function getLastModified(updatedAt?: string) {
    if (!updatedAt) return undefined;

    const date = new Date(updatedAt);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.virzyguns.com';
    const lessonDate = (article: (typeof articles)[number]) => article.updatedAt ?? article.publishedAt;
    const latest = (dates: string[]) => getLastModified([...dates].sort().at(-1));
    const libraryModified = latest(articles.map(lessonDate));

    // 1. Static Core Routes
    const staticRoutes = [
        '',
        '/about',
        '/privacy',
        '/privacy/fixcode',
        '/terms',
        '/learn',
        '/studio',
        '/studio/beats',
        '/studio/beats/licensing',
        '/ja-JP/studio/beats',
        '/ja-JP/studio/beats/licensing',
        '/de-DE/studio/beats',
        '/de-DE/studio/beats/licensing',
        '/studio/masterclass',
        '/healingwave',
        '/mycamscan',
        '/mycamscan/privacy',
        '/mycamscan/terms',
        '/flow',
        '/games',
        '/book',
        '/blog',
        '/learn/glossary',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        // The lesson library, the learn hub and the glossary change whenever a lesson does.
        ...(LIBRARY_ROUTES.includes(route) && libraryModified ? { lastModified: libraryModified } : {}),
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

    // 4. Lessons: last modified is the lesson's update date, or its publish date.
    const blogRoutes = articles.map((article) => {
        const lastModified = getLastModified(lessonDate(article));
        return {
            url: `${baseUrl}/blog/${article.slug}`,
            ...(lastModified ? { lastModified } : {}),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        };
    });

    // 5. Learning paths: as new as their newest lesson.
    const categoryRoutes = blogCategoriesData.map((category) => {
        const lastModified = latest(articles.filter((a) => a.category === category.slug).map(lessonDate));
        return {
            url: `${baseUrl}/blog/category/${category.slug}`,
            ...(lastModified ? { lastModified } : {}),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        };
    });


    return [...staticRoutes, ...beatCategoryRoutes, ...beatProductRoutes, ...blogRoutes, ...categoryRoutes];
}
