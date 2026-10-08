import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, getCategoryBySlug } from '@/lib/blog-data';
import { getPath } from '@/lib/blog/paths';
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
            title: 'Category Not Found | VGP Studio',
        };
    }

    return {
        title: `${category.name}: a learning path | VGP Studio Blog`,
        description: category.description,
        alternates: {
            canonical: `/blog/category/${category.slug}`,
        },
        openGraph: {
            title: `${category.name} | VGP Studio Blog`,
            description: category.description,
            type: 'website',
            url: `https://www.virzyguns.com/blog/category/${category.slug}`,
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

    return <CategoryPage category={category} path={path} allCategories={categories} />;
}
