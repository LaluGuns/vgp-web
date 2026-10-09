import { Metadata } from 'next';
import { articles, categories, getFeaturedArticles } from '@/lib/blog-data';
import type { BlogArticle } from '@/lib/blog-data';
import { learningPaths } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';
import { ogImage } from '@/lib/og';
import { BlogIndex, type BlogListItem, type StartLesson } from './BlogIndex';
import { lessonSearchText } from './search-index';

const DAY = 24 * 60 * 60 * 1000;

/** Paths that teach a craft. Featured lessons from these come first. */
const PRODUCT_PATHS: BlogArticle['category'][] = ['production-tips', 'genre-guides', 'licensing-guide'];

const toListItem = (article: BlogArticle, now: number): BlogListItem => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    search: lessonSearchText(article),
    isNew: now - Date.parse(`${article.publishedAt}T00:00:00Z`) < 30 * DAY,
});

const description = `${articles.length} free lessons in ${learningPaths.length} learning paths: songwriting, arrangement, sound design, vocals, mixing, audio science, psychology, genres and licensing.`;
const card = ogImage({ kicker: 'Lessons', title: 'Free music production lessons', sub: `${articles.length} lessons in ${learningPaths.length} learning paths · Virzy Guns` });

export const metadata: Metadata = {
    title: 'Music production lessons',
    description,
    keywords: ['music production lessons', 'mixing and mastering', 'songwriting', 'sound design', 'audio science', 'music psychology', 'beat licensing'],
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Music production lessons',
        description,
        type: 'website',
        url: 'https://www.virzyguns.com/blog',
        images: [card],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Music production lessons',
        description,
        images: [card.url],
    },
};

/** The first lesson of the two paths a newcomer is most likely to want. */
function startLessons(): StartLesson[] {
    return ['songwriting', 'mixing-mastering']
        .map((slug) => learningPaths.find((p) => p.category.slug === slug))
        .flatMap((path) => {
            const first = path?.articles[0];
            return path && first ? [{ pathName: path.category.name, slug: first.slug, readingTime: first.readingTime }] : [];
        });
}

export default function BlogPage() {
    // The route renders per request (the root layout reads the CSP nonce), so "new" is always current.
    const now = new Date().getTime();
    const flagged = getFeaturedArticles();
    const featured = flagged.find((a) => !PRODUCT_PATHS.includes(a.category)) ?? flagged[0];

    return (
        <BlogIndex
            articles={articles.map((a) => toListItem(a, now))}
            categories={categories}
            featured={featured ? toListItem(featured, now) : null}
            paths={learningPaths.map((p) => ({
                slug: p.category.slug,
                name: p.category.name,
                description: p.category.description,
                lessons: p.articles.map((a) => a.slug),
            }))}
            startHere={startLessons()}
            glossaryCount={glossary.length}
        />
    );
}
