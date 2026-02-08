import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getAllSlugs, articles, getCategoryBySlug } from '@/lib/blog-data';
import { ArticlePage } from './ArticlePage';

interface Props {
    params: Promise<{ slug: string }>;
}

// Generate static paths for all articles
export async function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

// Generate SEO metadata per article
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        return {
            title: 'Article Not Found | VGP Studio',
        };
    }

    return {
        title: article.seo.title,
        description: article.seo.description,
        keywords: article.seo.keywords,
        openGraph: {
            title: article.seo.title,
            description: article.seo.description,
            type: 'article',
            publishedTime: article.publishedAt,
            authors: ['VGP Studio'],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt,
        },
    };
}

export default async function BlogArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const category = getCategoryBySlug(article.category);

    // Get related articles (same category, excluding current)
    const related = articles
        .filter((a) => a.category === article.category && a.slug !== slug)
        .slice(0, 2);

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.publishedAt,
        author: {
            '@type': 'Organization',
            name: 'VGP Studio',
        },
        publisher: {
            '@type': 'Organization',
            name: 'VGP Studio',
            url: 'https://vgp.studio',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticlePage
                article={article}
                category={category}
                related={related}
            />
        </>
    );
}
