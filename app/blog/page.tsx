import { Metadata } from 'next';
import { articles, categories, getFeaturedArticles } from '@/lib/blog-data';
import { BlogIndex } from './BlogIndex';

export const metadata: Metadata = {
    title: 'Music Production Articles | VGP Reading Room',
    description: 'Read practical music production articles on beatmaking, trap drums, 808s, sound design, mixing, mastering, licensing, and release workflow by Virzy Guns.',
    keywords: ['trap production guide', 'music production guide', 'trap beat tutorial', '808 mixing', 'beat making ebook', 'producer tips', 'beat license guide'],
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Music Production Articles | VGP Reading Room',
        description: 'Practical production notes on beatmaking, 808s, sound design, mixing, mastering, licensing, and release workflow.',
        type: 'website',
        images: ['/ebooks/trap-guide-book-cover.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Music Production Articles | VGP Reading Room',
        description: 'Practical production notes on beatmaking, 808s, sound design, mixing, mastering, licensing, and release workflow.',
        images: ['/ebooks/trap-guide-book-cover.jpg'],
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
