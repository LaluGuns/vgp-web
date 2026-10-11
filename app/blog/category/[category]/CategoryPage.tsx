import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { TapLink } from '@/components/blog/article/TapLink';
import { PathLessons } from '@/components/blog/paths/PathLessons';
import { DialectMark } from '@/components/blog/figures/DialectMark';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { LearnNav } from '@/components/learn/LearnNav';
import { familyName } from '@/components/learn/map-data';
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
    const group = familyName(category.slug);
    const lessons = path.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        readingTime: a.readingTime,
        features: lessonFeatures(a),
    }));

    return (
        <PageTransition>
            <LearnNav current="paths" onPage={false} />
            <main id="main" tabIndex={-1} className="editorial-shell text-white focus:outline-none">
                {/* The crumbs and the path's group share one line above the title. The trail is the sub-navigation's:
                    Learn, then Paths (the path map on /learn, marked current above), as in the JSON-LD (page.tsx). The
                    group is named with its mark as on the path map ("Sound and mixing"); the mark is the shape and
                    colour its lessons' figures use (docs/DESIGN.md, "Figure dialects"). */}
                <LearnHeader
                    label={
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            <nav aria-label="Breadcrumb" className="-my-3 flex items-center gap-2">
                                <TapLink href="/learn" className="hover:text-white">
                                    Learn
                                </TapLink>
                                <span aria-hidden="true">/</span>
                                <TapLink href="/learn#paths" className="hover:text-white">
                                    Paths
                                </TapLink>
                            </nav>
                            {group ? (
                                <p className="flex items-center gap-2 text-white/60">
                                    <DialectMark dialect={dialectForCategory(category.slug)} />
                                    {group}
                                </p>
                            ) : (
                                <DialectMark dialect={dialectForCategory(category.slug)} className="ml-1" />
                            )}
                        </div>
                    }
                    title={category.name}
                    description={<p>{category.description}</p>}
                >
                    <p className="mt-3 text-sm text-white/60">
                        Stuck on a term?{' '}
                        <TapLink href="/learn/glossary" className="text-white">
                            The glossary explains {glossaryCount} of them
                        </TapLink>
                    </p>
                </LearnHeader>

                <section className="px-4 pb-20 print:pb-0 sm:px-6">
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
