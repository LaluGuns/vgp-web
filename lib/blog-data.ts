/**
 * Blog Data Layer
 * SEO-optimized article structure with categories
 */

import { newArticles } from './blog-posts';
import type { FigureSpec, QuizQuestion } from './blog/types';

export interface BlogArticle {
    slug: string;
    title: string;
    excerpt: string;
    /** Markdown. Supports `::figure <id>` and `::demo <id>` lines; see docs/ARTICLES.md. */
    content: string;
    category:
        | 'production-tips'
        | 'licensing-guide'
        | 'genre-guides'
        | 'songwriting'
        | 'arrangement-groove'
        | 'sound-design'
        | 'vocal-production'
        | 'mixing-mastering'
        | 'music-psychology'
        | 'producer-psychology'
        | 'audio-science';
    publishedAt: string;
    updatedAt?: string;
    readingTime: number;
    featured?: boolean;
    /** Three short points shown under the title as "In short". */
    summary?: string[];
    /** Diagrams placed in the content with `::figure <id>`. */
    figures?: Record<string, FigureSpec>;
    /** Three questions shown at the end as "Check yourself". */
    quiz?: QuizQuestion[];
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}

export interface Category {
    slug: string;
    name: string;
    description: string;
}

/**
 * In learning order, grouped as the /learn path map draws them (writing and
 * arranging, sound and mixing, psychology, business): the blog index, the
 * filters and each path's "next path" follow it.
 */
export const categories: Category[] = [
    {
        slug: 'songwriting',
        name: 'Songwriting',
        description: 'Hooks, melody, chords, verse and chorus, lyric rhythm and the first seconds that decide whether a listener stays.',
    },
    {
        slug: 'arrangement-groove',
        name: 'Arrangement & Groove',
        description: 'Energy curves, density, silence, swing and the microtiming that makes a beat feel played.',
    },
    {
        slug: 'genre-guides',
        name: 'Genre Guides',
        description: 'How trap, phonk, R&B, City Pop, Cyberpunk Jazz and Neo Synthwave are built.',
    },
    {
        slug: 'sound-design',
        name: 'Sound Design',
        description: 'Timbre, attack, noise, distortion and layering: why a sound reads the way it does.',
    },
    {
        slug: 'vocal-production',
        name: 'Vocal Production',
        description: 'The headphone mix, mic and room, input level, comping, tuning, doubling and the small details that sell a vocal.',
    },
    {
        slug: 'mixing-mastering',
        name: 'Mixing & Mastering',
        description: 'Masking, EQ, compression, reverb, stereo and mono, loudness and delivery, from first balance to final master.',
    },
    {
        slug: 'audio-science',
        name: 'Audio Science',
        description: 'Sampling, bit depth, aliasing, Fourier, filters, phase, latency, room modes and meters, explained for producers.',
    },
    {
        slug: 'production-tips',
        name: 'Production Tips',
        description: 'Choosing a beat that fits your voice, matching tempo and key, and mixing rap vocals recorded at home.',
    },
    {
        slug: 'music-psychology',
        name: 'Music Psychology',
        description: 'Expectation, surprise, memory and attention: how listeners feel music before they can name it.',
    },
    {
        slug: 'producer-psychology',
        name: 'Producer Mindset',
        description: 'Fresh ears, references, decisions, finishing and momentum in the session.',
    },
    {
        slug: 'licensing-guide',
        name: 'Licensing Guide',
        description: 'Beat licenses, usage rights, commercial use and creator licensing, in plain words.',
    },
];

export const articles: BlogArticle[] = newArticles;

// Helper functions
export function getArticleBySlug(slug: string): BlogArticle | undefined {
    const normalized = slug.replace('-in-a-', '-in-');
    return articles.find((article) => article.slug === slug || article.slug === normalized);
}

export function getArticlesByCategory(category: string): BlogArticle[] {
    return articles.filter((article) => article.category === category);
}

export function getFeaturedArticles(): BlogArticle[] {
    return articles.filter((article) => article.featured);
}

export function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find((cat) => cat.slug === slug);
}

export function getAllSlugs(): string[] {
    return articles.map((article) => article.slug);
}
