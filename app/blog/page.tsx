import { Metadata } from 'next';
import { articles, categories, getFeaturedArticles } from '@/lib/blog-data';
import { BlogIndex } from './BlogIndex';

export const metadata: Metadata = {
    title: 'Trap Production Guide & Blog',
    description: 'Pre-launch reading room for the VGP Music Production Guide: Trap Edition PDF. Learn trap drums, 808 physics, beat licensing, mixing, mastering, and release strategy.',
    keywords: ['trap production guide', 'music production guide', 'trap beat tutorial', '808 mixing', 'beat making ebook', 'producer tips', 'beat license guide'],
    openGraph: {
        title: 'Music Production Guide: Trap Edition | VGP',
        description: 'A coming-soon PDF producer manual and reading room for trap music production, 808 systems, mixing, mastering, and release strategy.',
        type: 'website',
        images: ['/ebooks/trap-guide-book-cover.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Music Production Guide: Trap Edition | VGP',
        description: 'Pre-launch reading room for the VGP trap production PDF.',
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
