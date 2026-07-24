import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog-data';
import { beatsCatalog, categories as beatCategories } from '@/lib/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.virzyguns.com';

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/studio',
        '/studio/beats',
        '/studio/beats/licensing',
        '/studio/masterclass',
        '/lab/healingwave',
        '/cadenz',
        '/flow',
        '/book',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/studio/beats' ? ('daily' as const) : ('monthly' as const),
        priority: route === '' ? 1 : route === '/studio/beats' ? 0.9 : 0.8,
    }));

    // 2. Owned Beat Store Category Routes
    const beatCategoryRoutes = beatCategories.map((cat) => ({
        url: `${baseUrl}/studio/beats/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    // 3. Owned Beat Product Pages (P0 & P1 Beats)
    const beatProductRoutes = beatsCatalog.map((beat) => ({
        url: `${baseUrl}/studio/beats/${beat.slug}`,
        lastModified: new Date(beat.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 4. Dynamic Blog Routes
    const blogRoutes = getAllSlugs().map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 5. Blog Category Routes
    const categories = ['production-tips', 'licensing-guide', 'genre-guides'];
    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/blog/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...beatCategoryRoutes, ...beatProductRoutes, ...blogRoutes, ...categoryRoutes];
}
