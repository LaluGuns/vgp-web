import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, getCategoryBySlug } from '@/lib/blog-data';
import { getPath } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';
import { ogImage } from '@/lib/og';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { CategoryPage } from './CategoryPage';

interface Props {
    params: Promise<{ category: string }>;
}

const SITE = 'https://www.virzyguns.com';

// Generate static paths for all categories
export async function generateStaticParams() {
    return categories.map((cat) => ({ category: cat.slug }));
}

// Generate SEO metadata per category
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: categorySlug } = await params;
    const category = getCategoryBySlug(categorySlug);

    if (!category) {
        return {
            title: 'Learning path not found',
        };
    }

    const lessons = getPath(category.slug)?.articles.length ?? 0;
    const title = `${category.name}: a learning path`;
    const description = `${lessons} free lessons, in order. ${category.description}`;
    const url = `${SITE}/blog/category/${category.slug}`;
    const card = ogImage({ kicker: 'Learning path', title: category.name, sub: `${lessons} free lessons · Virzy Guns` });

    return {
        title,
        description,
        alternates: {
            canonical: `/blog/category/${category.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url,
            images: [card],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [card.url],
        },
    };
}

export default async function BlogCategoryPage({ params }: Props) {
    const { category: categorySlug } = await params;
    const category = getCategoryBySlug(categorySlug);

    if (!category) {
        notFound();
    }

    const path = getPath(categorySlug) ?? { category, articles: [] };
    const url = `${SITE}/blog/category/${category.slug}`;

    const collection = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category.name}: a learning path`,
        description: category.description,
        url,
        isPartOf: { '@type': 'WebSite', name: 'Virzy Guns', url: SITE },
        mainEntity: {
            '@type': 'ItemList',
            itemListOrder: 'https://schema.org/ItemListOrderAscending',
            numberOfItems: path.articles.length,
            itemListElement: path.articles.map((article, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE}/blog/${article.slug}`,
                name: article.title,
            })),
        },
    };
    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'Lessons', item: `${SITE}/blog` },
            { '@type': 'ListItem', position: 3, name: category.name, item: url },
        ],
    };

    return (
        <>
            <JsonLd data={collection} />
            <JsonLd data={breadcrumb} />
            <CategoryPage category={category} path={path} allCategories={categories} glossaryCount={glossary.length} />
        </>
    );
}
