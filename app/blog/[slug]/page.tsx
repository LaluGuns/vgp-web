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

    const articleUrl = `https://www.virzyguns.com/blog/${article.slug}`;
    const imageUrl = 'https://www.virzyguns.com/branding/vgp-logo-chrome-full.png';

    return {
        title: article.seo.title,
        description: article.seo.description,
        keywords: article.seo.keywords,
        alternates: {
            canonical: articleUrl,
        },
        openGraph: {
            title: article.seo.title,
            description: article.seo.description,
            type: 'article',
            url: articleUrl,
            publishedTime: article.publishedAt,
            modifiedTime: article.updatedAt ?? article.publishedAt,
            authors: ['Virzy Guns'],
            images: [
                {
                    url: imageUrl,
                    width: 1024,
                    height: 1024,
                    alt: 'Virzy Guns Production',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt,
            images: [imageUrl],
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
    const articleUrl = `https://www.virzyguns.com/blog/${article.slug}`;
    const imageUrl = 'https://www.virzyguns.com/branding/vgp-logo-chrome-full.png';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl,
        },
        url: articleUrl,
        image: imageUrl,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        author: {
            '@type': 'Person',
            name: 'Virzy Guns',
            url: 'https://www.virzyguns.com/about',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Virzy Guns Production',
            url: 'https://www.virzyguns.com',
            logo: {
                '@type': 'ImageObject',
                url: imageUrl,
            },
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
