import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { PathLessons } from '@/components/blog/paths/PathLessons';
import type { Category } from '@/lib/blog-data';
import { lessonFeatures, type LearningPath } from '@/lib/blog/paths';

interface CategoryPageProps {
    category: Category;
    path: LearningPath;
    allCategories: Category[];
}

/** A category read as a learning path, in lesson order. */
export function CategoryPage({ category, path, allCategories }: CategoryPageProps) {
    const lessons = path.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        readingTime: a.readingTime,
        features: lessonFeatures(a),
    }));

    return (
        <PageTransition>
            <main className="editorial-shell text-white">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <TextLink href="/blog">All articles</TextLink>
                        <p className="mt-6 text-sm text-white/55">Learning path</p>
                        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                            {category.name}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{category.description}</p>
                    </div>
                </section>

                <section className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        {lessons.length > 0 ? (
                            <PathLessons lessons={lessons} />
                        ) : (
                            <p className="py-16 text-lg text-white/75">
                                No articles in this category yet. <TextLink href="/blog" inline>Browse all articles</TextLink>.
                            </p>
                        )}

                        <nav aria-label="Other learning paths" className="mt-16 border-t border-white/10 pt-8">
                            <p className="text-sm font-medium text-white">Other paths</p>
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {allCategories
                                    .filter((cat) => cat.slug !== category.slug)
                                    .map((cat) => (
                                        <li key={cat.slug}>
                                            <Link
                                                href={`/blog/category/${cat.slug}`}
                                                className="flex min-h-10 items-center rounded-md border border-white/10 px-3.5 text-sm font-medium text-white/65 transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                            >
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        </nav>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
