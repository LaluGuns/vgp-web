import { Metadata } from 'next';
import { articles, categories, getFeaturedArticles } from '@/lib/blog-data';
import type { BlogArticle } from '@/lib/blog-data';
import { learningPaths } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';
import { ogImage, socialMetadata } from '@/lib/og';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { startLessons } from '@/components/blog/paths/startLessons';
import { SITE, breadcrumbs, pathsCollection } from '@/components/blog/paths/structured';
import { BlogIndex, type BlogListItem } from './BlogIndex';
import { lessonSearchFields, searchDigestVersion } from './search-index';

const DAY = 24 * 60 * 60 * 1000;

/** Paths tied to a product or a genre. The featured lesson comes from any other path when one is flagged. */
const PRODUCT_PATHS: BlogArticle['category'][] = ['production-tips', 'genre-guides', 'licensing-guide'];

const toListItem = (article: BlogArticle, now: number): BlogListItem => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    ...lessonSearchFields(article),
    isNew: now - Date.parse(`${article.publishedAt}T00:00:00Z`) < 30 * DAY,
});

const title = 'Music production lessons';
const description = `${articles.length} free lessons and ${learningPaths.length} learning paths: songwriting, arrangement, sound design, vocals, mixing, audio science, psychology, genres and licensing.`;
const url = `${SITE}/blog`;

export const metadata: Metadata = {
    title,
    description,
    keywords: ['music production lessons', 'mixing and mastering', 'songwriting', 'sound design', 'audio science', 'music psychology', 'beat licensing'],
    alternates: {
        canonical: '/blog',
    },
    ...socialMetadata({
        title,
        description,
        url,
        image: ogImage({ kicker: 'Lessons', title: 'Free music production lessons', sub: `${articles.length} lessons · ${learningPaths.length} paths · Virzy Guns` }),
    }),
};

export default function BlogPage() {
    // The route renders per request (the root layout reads the CSP nonce), so "new" is always current.
    const now = new Date().getTime();
    const flagged = getFeaturedArticles();
    const featured = flagged.find((a) => !PRODUCT_PATHS.includes(a.category)) ?? flagged[0];

    return (
        <>
            <JsonLd data={pathsCollection({ name: title, description, url, paths: learningPaths })} />
            <JsonLd data={breadcrumbs([{ name: 'Lessons', url }])} />
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
                digestVersion={searchDigestVersion(articles)}
            />
        </>
    );
}
