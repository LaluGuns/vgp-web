import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug, getAllSlugs, getCategoryBySlug } from '@/lib/blog-data';
import { validateAll } from '@/lib/blog/validate';
import { ogImage } from '@/lib/og';
import { ArticlePage } from './ArticlePage';

interface Props {
    params: Promise<{ slug: string }>;
}

// Generate static paths for all articles. Broken lessons fail the build here.
export async function generateStaticParams() {
    const problems = validateAll(articles);
    if (problems.length) {
        const message = `Article problems:\n${problems.join('\n')}`;
        // Fail the production build; in development, report and keep the other articles browsable.
        if (process.env.NODE_ENV === 'production') throw new Error(message);
        console.error(message);
    }
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
            images: [ogImage({ kicker: 'Notes from the studio', title: article.title, sub: `${article.readingTime} min read · Virzy Guns` })],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt,
            images: [ogImage({ kicker: 'Notes from the studio', title: article.title, sub: `${article.readingTime} min read · Virzy Guns` }).url],
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
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.virzyguns.com' },
            { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://www.virzyguns.com/blog' },
            { '@type': 'ListItem', position: 3, name: category?.name || article.category, item: `https://www.virzyguns.com/blog/category/${article.category}` },
            { '@type': 'ListItem', position: 4, name: article.title, item: articleUrl },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <ArticlePage
                article={article}
                category={category}
            />
        </>
    );
}
