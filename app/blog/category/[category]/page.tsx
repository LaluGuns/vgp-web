import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, categories, getCategoryBySlug, getArticlesByCategory } from '@/lib/blog-data';
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
        title: `${category.name} | VGP Studio Blog`,
        description: category.description,
        openGraph: {
            title: `${category.name} | VGP Studio Blog`,
            description: category.description,
            type: 'website',
        },
    };
}

export default async function BlogCategoryPage({ params }: Props) {
    const { category: categorySlug } = await params;
    const category = getCategoryBySlug(categorySlug);

    if (!category) {
        notFound();
    }

    const categoryArticles = getArticlesByCategory(categorySlug);

    return (
        <CategoryPage
            category={category}
            articles={categoryArticles}
            allCategories={categories}
        />
    );
}
