import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface CategoryPageProps {
    category: Category;
    articles: BlogArticle[];
    allCategories: Category[];
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

export function CategoryPage({ category, articles, allCategories }: CategoryPageProps) {
    return (
        <PageTransition>
            <main className="editorial-shell text-white">
                <section className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <TextLink href="/blog">All articles</TextLink>
                        <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                            {category.name}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                            {category.description}
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <nav aria-label="Article categories" className="-mx-4 flex gap-2 overflow-x-auto border-y border-white/10 px-4 py-5 sm:mx-0 sm:flex-wrap sm:px-0">
                            {allCategories.map((cat) => {
                                const active = cat.slug === category.slug;
                                return (
                                    <Link
                                        key={cat.slug}
                                        href={`/blog/category/${cat.slug}`}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex min-h-10 shrink-0 items-center rounded-md border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                                            active ? 'border-white/70 text-white' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
                                        }`}
                                    >
                                        {cat.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {articles.length > 0 ? (
                            <ul className="max-w-4xl divide-y divide-white/10">
                                {articles.map((article) => (
                                    <li key={article.slug}>
                                        <Link
                                            href={`/blog/${article.slug}`}
                                            className="group block py-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            <span className="text-xs text-white/50">
                                                {formatDate(article.publishedAt)} · {article.readingTime} min read
                                            </span>
                                            <span className="mt-2 block text-xl font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                                {article.title}
                                            </span>
                                            <span className="mt-2 line-clamp-2 block max-w-2xl text-base leading-7 text-white/65">
                                                {article.excerpt}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-16 text-lg text-white/75">
                                No articles in this category yet. <TextLink href="/blog" inline>Browse all articles</TextLink>.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
