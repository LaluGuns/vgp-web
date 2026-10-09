import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug, getAllSlugs, getCategoryBySlug } from '@/lib/blog-data';
import { validateAll } from '@/lib/blog/validate';
import { getPathPosition } from '@/lib/blog/paths';
import { ogImage, socialMetadata } from '@/lib/og';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { ArticlePage } from './ArticlePage';

interface Props {
    params: Promise<{ slug: string }>;
}

const SITE = 'https://www.virzyguns.com';
const BRAND = ' | Virzy Guns Production';
/** The author's page: article:author and the Article's author.url point here. */
const AUTHOR_URL = `${SITE}/about`;

/**
 * Lesson <title>: the lesson's SEO title without the old "| VGP Studio"
 * suffix (the root layout's template adds the brand). The brand is kept
 * only while the whole title stays within about 65 characters.
 */
function lessonTitle(seoTitle: string): Metadata['title'] {
    const base = seoTitle.replace(/\s*\|\s*(?:VGP Studio|VGP Blog|VGP|Virzy Guns Production|Virzy Guns)\s*$/i, '').trim();
    if (base.length + BRAND.length <= 65) return base;
    if (base.length + ' | VGP'.length <= 65) return { absolute: `${base} | VGP` };
    return { absolute: base };
}

const shareCard = (title: string, readingTime: number) =>
    ogImage({ kicker: 'Lesson from the studio', title, sub: `${readingTime} min read · Virzy Guns` });

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
            title: 'Lesson not found',
        };
    }

    const articleUrl = `${SITE}/blog/${article.slug}`;
    const category = getCategoryBySlug(article.category);

    return {
        title: lessonTitle(article.seo.title),
        description: article.seo.description,
        keywords: article.seo.keywords,
        alternates: {
            canonical: articleUrl,
        },
        ...socialMetadata({
            title: article.title,
            description: article.seo.description,
            url: articleUrl,
            image: shareCard(article.title, article.readingTime),
            article: {
                publishedTime: article.publishedAt,
                modifiedTime: article.updatedAt ?? article.publishedAt,
                authors: [AUTHOR_URL],
                section: category?.name,
            },
        }),
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
    const articleUrl = `${SITE}/blog/${article.slug}`;
    const logoUrl = `${SITE}/branding/vgp-logo-chrome-full.png`;
    const card = shareCard(article.title, article.readingTime);
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
        image: {
            '@type': 'ImageObject',
            url: `${SITE}${card.url}`,
            width: card.width,
            height: card.height,
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        articleSection: category?.name,
        keywords: article.seo.keywords.join(', '),
        author: {
            '@type': 'Person',
            name: 'Virzy Guns',
            url: AUTHOR_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Virzy Guns Production',
            url: SITE,
            logo: {
                '@type': 'ImageObject',
                url: logoUrl,
            },
        },
    };
    // Home > Lessons > path > lesson. A lesson on no learning path (lib/blog/paths.ts, OFF_PATH)
    // sits straight under Lessons, so the trail never names a path that does not list it.
    const trail = [
        { name: 'Home', item: SITE },
        { name: 'Lessons', item: `${SITE}/blog` },
        ...(getPathPosition(article) ? [{ name: category?.name || article.category, item: `${SITE}/blog/category/${article.category}` }] : []),
        { name: article.title, item: articleUrl },
    ];
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <ArticlePage article={article} category={category} />
        </>
    );
}
