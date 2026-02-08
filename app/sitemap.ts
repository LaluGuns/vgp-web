import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://vgp.studio'; // Replace with actual domain later

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/studio/beats',
        '/studio/masterclass',
        '/lab/healingwave',
        '/blog',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Blog Routes
    const blogRoutes = getAllSlugs().map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Category Routes
    const categories = ['production-tips', 'licensing-guide', 'genre-guides'];
    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/blog/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...blogRoutes, ...categoryRoutes];
}
