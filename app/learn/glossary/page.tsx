import type { Metadata } from 'next';
import { PageTransition } from '@/components/PageTransition';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { TapLink } from '@/components/blog/article/TapLink';
import { SITE, breadcrumbs } from '@/components/blog/paths/structured';
import { ScrollMemory } from '@/components/blog/useScrollMemory';
import { getArticleBySlug } from '@/lib/blog-data';
import { glossary } from '@/lib/blog/glossary';
import { ogImage, socialMetadata } from '@/lib/og';
import { GlossaryLetters } from './GlossaryLetters';

const title = 'Music production glossary';
const description = `Plain definitions of the ${glossary.length} terms used in the lessons: loudness, dynamics, EQ, phase, sampling, groove, vocals and more.`;
const url = `${SITE}/learn/glossary`;

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/learn/glossary' },
    ...socialMetadata({
        title,
        description,
        url,
        image: ogImage({ kicker: 'Glossary', title: 'Music production terms, in plain words', sub: `${glossary.length} terms from the lessons · Virzy Guns` }),
    }),
};

const terms = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
const initial = (term: string) => term[0].toUpperCase().replace(/[^A-Z]/, '#');
const letters = Array.from(new Set(terms.map((t) => initial(t.term))));

export default function GlossaryPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: title,
        url,
        hasDefinedTerm: terms.map((t) => ({
            '@type': 'DefinedTerm',
            name: t.term,
            description: t.definition,
            url: `${url}#${t.id}`,
        })),
    };

    return (
        <PageTransition>
            <JsonLd data={jsonLd} />
            <JsonLd
                data={breadcrumbs([
                    { name: 'Learn', url: `${SITE}/learn` },
                    { name: 'Glossary', url },
                ])}
            />
            <ScrollMemory />
            <main id="main" tabIndex={-1} className="editorial-shell min-h-screen text-white focus:outline-none">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        {/* The glossary sits under Learn, beside the lessons rather than inside them. */}
                        <nav aria-label="Breadcrumb" className="-my-3 text-sm font-medium text-white">
                            <ol className="flex flex-wrap items-center gap-x-2">
                                <li>
                                    <TapLink href="/learn">Learn</TapLink>
                                </li>
                                <li className="flex items-center gap-x-2 text-white/60">
                                    <span aria-hidden="true">/</span>
                                    <span aria-current="page">Glossary</span>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Glossary</h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                            {terms.length} terms from the lessons, in plain words. In a lesson, tap a dotted word to see its definition without leaving the page.
                        </p>
                        <p className="mt-3 text-sm font-medium text-white">
                            <TapLink href="/blog">All lessons</TapLink>
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <GlossaryLetters letters={letters} />

                        <div className="max-w-3xl">
                            {letters.map((letter) => (
                                <section key={letter} aria-labelledby={`letter-${letter}`} className="pt-8">
                                    <h2 id={`letter-${letter}`} className="scroll-mt-10 text-sm font-medium text-white/55">
                                        {letter}
                                    </h2>
                                    <dl>
                                        {terms
                                            .filter((t) => initial(t.term) === letter)
                                            .map((term) => {
                                                const article = term.article ? getArticleBySlug(term.article) : undefined;
                                                return (
                                                    // A #term deep link marks its entry with a faint panel and an accent rule.
                                                    <div
                                                        key={term.id}
                                                        id={term.id}
                                                        className="-mx-3 scroll-mt-10 border-b border-white/10 px-3 py-6 target:bg-white/[0.04] target:shadow-[inset_2px_0_0_var(--accent)]"
                                                    >
                                                        <dt className="text-lg font-semibold text-white">{term.term}</dt>
                                                        <dd className="mt-2 text-base leading-7 text-white/75">{term.definition}</dd>
                                                        {article ? (
                                                            <dd className="mt-1 text-sm text-white/55">
                                                                Explained in{' '}
                                                                <TapLink href={`/blog/${article.slug}`} className="text-white/80 hover:text-white">
                                                                    {article.title}
                                                                </TapLink>
                                                            </dd>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                    </dl>
                                </section>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
