import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { TapLink } from '@/components/blog/article/TapLink';
import { PathLessons } from '@/components/blog/paths/PathLessons';
import { DialectMark } from '@/components/blog/figures/DialectMark';
import type { Category } from '@/lib/blog-data';
import { dialectForCategory } from '@/lib/blog/dialects';
import { lessonFeatures, type LearningPath } from '@/lib/blog/paths';

interface CategoryPageProps {
    category: Category;
    path: LearningPath;
    allCategories: Category[];
    glossaryCount: number;
}

/** A category read as a learning path, in lesson order. */
export function CategoryPage({ category, path, allCategories, glossaryCount }: CategoryPageProps) {
    const lessons = path.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        readingTime: a.readingTime,
        features: lessonFeatures(a),
    }));

    return (
        <PageTransition>
            <main id="main" tabIndex={-1} className="editorial-shell text-white focus:outline-none">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <nav aria-label="Breadcrumb" className="-my-3 text-sm font-medium text-white">
                            <TapLink href="/blog">All lessons</TapLink>
                        </nav>
                        {/* The group's mark: the shape and colour its lessons' figures use (docs/DESIGN.md, "Figure dialects"). */}
                        <p className="mt-6 flex items-center gap-2 text-sm text-white/55">
                            <DialectMark dialect={dialectForCategory(category.slug)} />
                            Learning path
                        </p>
                        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                            {category.name}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{category.description}</p>
                        <p className="mt-3 text-sm text-white/60">
                            Stuck on a term?{' '}
                            <TapLink href="/learn/glossary" className="text-white">
                                The glossary explains {glossaryCount} of them
                            </TapLink>
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        {lessons.length > 0 ? (
                            <PathLessons lessons={lessons} />
                        ) : (
                            <p className="py-16 text-lg text-white/75">
                                No lessons in this path yet. <TextLink href="/blog" inline>Browse all lessons</TextLink>.
                            </p>
                        )}

                        <nav aria-label="Other learning paths" className="mt-16 border-t border-white/10 pt-8">
                            <h2 className="text-sm font-medium text-white">Other paths</h2>
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {allCategories
                                    .filter((cat) => cat.slug !== category.slug)
                                    .map((cat) => (
                                        <li key={cat.slug}>
                                            <Link
                                                href={`/blog/category/${cat.slug}`}
                                                className="flex min-h-11 items-center rounded-md border border-white/10 px-3.5 text-sm font-medium text-white/65 transition-colors hover:border-white/25 hover:text-white vgp-focus"
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
