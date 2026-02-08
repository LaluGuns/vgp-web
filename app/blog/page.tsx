import { Metadata } from 'next';
import { articles, categories, getFeaturedArticles } from '@/lib/blog-data';
import { BlogIndex } from './BlogIndex';

export const metadata: Metadata = {
    title: 'Blog | VGP Studio - Beat Production Tips & Licensing Guides',
    description: 'Expert articles on beat selection, music licensing, production techniques, and genre guides. Elevate your music with professional insights.',
    keywords: ['music production blog', 'beat license guide', 'producer tips', 'trap production', 'beat making'],
    openGraph: {
        title: 'Blog | VGP Studio',
        description: 'Expert articles on beat production, licensing, and genre guides.',
        type: 'website',
    },
};

export default function BlogPage() {
    const featured = getFeaturedArticles();

    return (
        <BlogIndex
            articles={articles}
            categories={categories}
            featured={featured}
        />
    );
}
