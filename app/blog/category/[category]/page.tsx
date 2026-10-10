import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, getCategoryBySlug } from '@/lib/blog-data';
import { getPath } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';
import { ogImage, socialMetadata } from '@/lib/og';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { SITE, breadcrumbs, lessonsCollection } from '@/components/blog/paths/structured';
import { CategoryPage } from './CategoryPage';

interface Props {
    params: Promise<{ category: string }>;
}

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

    return {
        title,
        description,
        alternates: {
            canonical: `/blog/category/${category.slug}`,
        },
        ...socialMetadata({
            title,
            description,
            url: `${SITE}/blog/category/${category.slug}`,
            image: ogImage({ kicker: 'Learning path', title: category.name, sub: `${lessons} free lessons · Virzy Guns` }),
        }),
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

    return (
        <>
            <JsonLd data={lessonsCollection({ name: `${category.name}: a learning path`, description: category.description, url, path })} />
            <JsonLd
                data={breadcrumbs([
                    { name: 'Learn', url: `${SITE}/learn` },
                    { name: 'Paths', url: `${SITE}/learn#paths` },
                    { name: category.name, url },
                ])}
            />
            <CategoryPage category={category} path={path} allCategories={categories} glossaryCount={glossary.length} />
        </>
    );
}
