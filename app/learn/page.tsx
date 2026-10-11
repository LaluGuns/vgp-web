import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { TapLink } from '@/components/blog/article/TapLink';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { DemoSlot } from '@/components/blog/demos/DemoSlot';
import { startLessons } from '@/components/blog/paths/startLessons';
import { SITE, breadcrumbs, pathsCollection } from '@/components/blog/paths/structured';
import { ScrollMemory } from '@/components/blog/useScrollMemory';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { LearnNav } from '@/components/learn/LearnNav';
import { PathMap } from '@/components/learn/PathMap';
import { PathMapLive } from '@/components/learn/PathMapLive';
import { mapFamilies } from '@/components/learn/map-data';
import { articles, categories, getArticleBySlug } from '@/lib/blog-data';
import { learningPaths } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';
import { ogImage, socialMetadata } from '@/lib/og';

const title = 'Learn music production';
const description = `${articles.length} free music production lessons, ${learningPaths.length} learning paths, a glossary of ${glossary.length} terms, and a book and a course on the way. By Virzy Guns.`;
const url = `${SITE}/learn`;

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: '/learn',
    },
    ...socialMetadata({
        title,
        description,
        url,
        image: ogImage({ kicker: 'Learn', title: 'Free music production lessons', sub: `${articles.length} lessons · ${learningPaths.length} paths · a glossary` }),
    }),
};

const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

const dateFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
};

/** Newest first; lessons published the same day, the one added last first (as /blog's Newest order). */
const newest = articles
    .map((article, index) => ({ article, index }))
    .sort((a, b) => b.article.publishedAt.localeCompare(a.article.publishedAt) || b.index - a.index)
    .slice(0, 5)
    .map(({ article }) => article);

const hours = Math.round(articles.reduce((n, article) => n + article.readingTime, 0) / 60);

/** The blind loudness test is the first thing the Mixing & Mastering path asks you to hear. */
const TRY_DEMO = 'loudness-bias';
const TRY_LESSON = 'why-louder-is-not-always-bigger';

/** Three glossary entries, one from each kind of lesson that uses the glossary most. */
const SAMPLE_TERMS = ['lufs', 'masking', 'swing'];

export default function LearnHubPage() {
    const families = mapFamilies();
    const start = startLessons();
    const tryLesson = getArticleBySlug(TRY_LESSON);
    const tryPath = learningPaths.find((path) => path.articles[0]?.slug === TRY_LESSON);
    const terms = SAMPLE_TERMS.flatMap((id) => glossary.filter((term) => term.id === id));

    return (
        <PageTransition>
            <JsonLd data={pathsCollection({ name: title, description, url, paths: learningPaths })} />
            <JsonLd data={breadcrumbs([{ name: 'Learn', url }])} />
            <ScrollMemory />
            <LearnNav current="paths" />
            <main id="main" tabIndex={-1} className="editorial-shell min-h-screen text-white focus:outline-none">
                <LearnHeader
                    title="Learn production"
                    description={
                        <p>
                            {articles.length} free lessons I wrote on making records, and {learningPaths.length} paths through them from songwriting to
                            mastering and licensing. Read a path in order from lesson 1, or open any lesson on the map.
                        </p>
                    }
                    // On a phone the sentence above already gives the first two.
                    facts={[
                        { text: `${articles.length} lessons`, fromSm: true },
                        { text: `${learningPaths.length} paths`, fromSm: true },
                        `about ${hours} hours of reading`,
                        `${glossary.length} glossary terms`,
                    ]}
                    aside={
                        start.length > 0 ? (
                            <div>
                                {/* A phone has no room for the large links above the map: one sentence, each link on a line of its own. */}
                                <p className="text-base leading-7 text-white/70 sm:hidden">
                                    Start with{' '}
                                    {start.map((lesson, i) => (
                                        <span key={lesson.slug}>
                                            {i > 0 ? ' or ' : null}
                                            <span className="whitespace-nowrap">
                                                <TapLink href={`/blog/${lesson.slug}`} className="text-white">
                                                    {lesson.pathName}, lesson 1
                                                </TapLink>{' '}
                                                ({lesson.readingTime} min){i === start.length - 1 ? '.' : null}
                                            </span>
                                        </span>
                                    ))}
                                </p>
                                <div className="hidden sm:block">
                                    <h2 className="text-base font-semibold text-white">Start here</h2>
                                    <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                                        {start.map((lesson) => {
                                            const article = getArticleBySlug(lesson.slug);
                                            return (
                                                <li key={lesson.slug}>
                                                    {/* Named by the title; the path and reading time describe it. */}
                                                    <Link
                                                        href={`/blog/${lesson.slug}`}
                                                        aria-labelledby={`start-${lesson.slug}-title`}
                                                        aria-describedby={`start-${lesson.slug}-meta`}
                                                        className="vgp-focus group block py-5"
                                                    >
                                                        <span id={`start-${lesson.slug}-meta`} className="block text-sm text-white/55">
                                                            {lesson.pathName}, lesson 1 · {lesson.readingTime} min
                                                        </span>
                                                        <span
                                                            id={`start-${lesson.slug}-title`}
                                                            className="mt-1 block text-xl font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4"
                                                        >
                                                            {article?.title}
                                                        </span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ) : null
                    }
                />

                <section id="paths" aria-labelledby="map-heading" className="px-4 pb-16 sm:px-6 lg:pb-20 lg:pt-2">
                    <div className="mx-auto max-w-7xl">
                        {/* From 1024 px the line under the heading sits beside it, so the map's first group starts in the first screen. */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-12">
                            <h2 id="map-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                Paths
                            </h2>
                            <p className="max-w-2xl text-base leading-7 text-white/65 lg:-mb-1">
                                Each line is a path, read from left to right, and each mark on it is a lesson. A filled mark is one you have read on
                                this device.
                                {/* On a touch screen under 1024 px the readout is a card that shows only after a tap, so the gesture is
                                    said here, before the first one: in the box from the first paint (app/globals.css, "Learn area"), shown
                                    once the script that does it runs (PathMapLive), so the map below never moves. A screen reader opens a
                                    lesson with one activation, so it is not told. */}
                                <span id="map-tap-hint" aria-hidden="true" className="vgp-map-tap-hint">
                                    {' '}
                                    Tap a mark to see its lesson, then tap it again to open it.
                                </span>
                            </p>
                        </div>
                        {/* A readout of the lesson under the pointer, the keyboard focus or a first tap (PathMapLive), held
                            under the site header while the map scrolls under it; on a touch screen under 1024 px, a card above
                            the tab bar once a tap chooses a mark, where the title may take two lines. Its box has a fixed
                            height, so a long title or the "Open lesson" label never moves the map. A visual aid only: each
                            lesson's link already has its title as its name, so the readout is hidden from screen readers and its
                            link from the Tab key. The hints say what the script does, so they wait for it (app/globals.css,
                            "Learn area"). */}
                        <div id="map-readout" aria-hidden="true" className="vgp-map-readout mt-4 print:hidden">
                            {/* The whole box is one link once a tap chooses a mark (PathMapLive gives it that lesson's href, so a
                                second tap anywhere on the card opens it); without an href it is not a link. */}
                            <a data-open="" tabIndex={-1} className="vgp-map-readout-link block">
                                <span className="flex items-center gap-3">
                                    <span data-line="" className="min-w-0 flex-1 truncate text-sm leading-5 text-white/55">
                                        <span data-hint="pointer">Point at a mark, or move to one with the Tab key, to see its lesson.</span>
                                        <span data-hint="touch">Tap a mark to see its lesson, then tap it again to open it.</span>
                                    </span>
                                    <span data-open-label="" hidden className="shrink-0 text-sm font-medium leading-5 text-white">
                                        <span className="vgp-link">Open lesson</span>
                                    </span>
                                </span>
                                <span data-title="" className="mt-1 block truncate text-lg font-semibold leading-7 text-white/80" />
                            </a>
                        </div>
                        {/* Says that a first tap chose a mark, and on which path, for a screen reader on a touch screen
                            (PathMapLive). A div, not a paragraph, so a reader reading the page skips it while it is empty. */}
                        <div id="map-announce" aria-live="polite" className="sr-only" />
                        {/* A link per lesson and per path: a keyboard user can step over all of them at once. Shown while it has focus. */}
                        <div id="path-map" className="vgp-map-box relative mt-1">
                            <a
                                href="#try"
                                className="vgp-focus sr-only rounded-md bg-white text-sm font-semibold text-[#050607] focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-10 focus:px-4 focus:py-3"
                            >
                                Skip past the map
                            </a>
                            <PathMap families={families} />
                        </div>
                        <PathMapLive mapId="path-map" readoutId="map-readout" announceId="map-announce" hintId="map-tap-hint" />
                    </div>
                </section>

                {tryLesson && tryPath ? (
                    <section id="try" aria-labelledby="try-heading" className="border-t border-white/10 px-4 pt-14 print:hidden sm:px-6 lg:pt-16">
                        {/* The demo sits in the same column width as in a lesson, so the height it reserves (lib/blog/demos.ts) fits here
                            too, and against the right edge of the page grid, as the map above and the list below end there. */}
                        <div className="mx-auto grid max-w-7xl gap-x-12 lg:grid-cols-12">
                            <div className="lg:col-span-4">
                                <h2 id="try-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                    Try one
                                </h2>
                                <p className="mt-3 max-w-md text-base leading-7 text-white/65">
                                    This is the first thing the {tryPath.category.name} path asks you to hear. Listen to A and B, pick one, and see
                                    which was louder.
                                </p>
                                <p className="mt-2 text-sm text-white">
                                    <TapLink href={`/blog/${tryLesson.slug}`}>Read the lesson: {tryLesson.title}</TapLink>
                                </p>
                            </div>
                            <div className="min-w-0 lg:col-span-8">
                                <div className="max-w-[68ch] lg:ml-auto [&>.vgp-demo]:mt-8 lg:[&>.vgp-demo]:mt-0">
                                    <DemoSlot id={TRY_DEMO} dialect="technical" />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : null}

                <section aria-labelledby="new-heading" className="border-t border-white/10 px-4 py-14 sm:px-6 lg:py-16">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-4">
                            <h2 id="new-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                New lessons
                            </h2>
                            <p className="mt-2 text-sm text-white">
                                <TapLink href="/blog">All lessons, newest first</TapLink>
                            </p>
                        </div>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {newest.map((article) => (
                                <li key={article.slug}>
                                    {/* Named by the title; the date, path and reading time describe it. */}
                                    <Link
                                        href={`/blog/${article.slug}`}
                                        aria-labelledby={`new-${article.slug}-title`}
                                        aria-describedby={`new-${article.slug}-meta`}
                                        className="group block py-6 vgp-focus"
                                    >
                                        <span id={`new-${article.slug}-meta`} className="text-xs text-white/55">
                                            {formatDate(article.publishedAt)} · {categoryName(article.category)} · {article.readingTime} min read
                                        </span>
                                        <span
                                            id={`new-${article.slug}-title`}
                                            className="mt-2 block text-lg font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4"
                                        >
                                            {article.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section aria-label="Glossary and book" className="border-t border-white/10 px-4 pb-24 pt-14 sm:px-6 lg:pt-16">
                    <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-6">
                            {/* On paper the heading and its intro stay with the terms. */}
                            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] print:break-after-avoid sm:text-4xl">Glossary</h2>
                            <p className="mt-3 max-w-lg text-base leading-7 text-white/65 print:break-inside-avoid print:break-after-avoid">
                                {glossary.length} terms from the lessons, in plain words. Inside a lesson, tap a dotted word to read its definition
                                without leaving the page.
                            </p>
                            <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
                                {terms.map((term) => (
                                    <div key={term.id} className="py-4 print:break-inside-avoid">
                                        <dt className="text-base font-semibold text-white">
                                            <Link href={`/learn/glossary#${term.id}`} className="vgp-focus inline-flex min-h-11 min-w-11 items-center rounded-sm">
                                                <span className="vgp-link">{term.term}</span>
                                            </Link>
                                        </dt>
                                        <dd className="text-sm leading-6 text-white/65">{term.definition}</dd>
                                    </div>
                                ))}
                            </dl>
                            <p className="mt-2 text-sm text-white">
                                <TapLink href="/learn/glossary">All {glossary.length} terms, A to Z</TapLink>
                            </p>
                        </div>
                        <div className="lg:col-span-5 lg:col-start-8">
                            {/* The cover sits above the text on a phone, beside it from 640 px. */}
                            <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                                <div className="w-28 shrink-0 self-start overflow-hidden rounded-[4px] border border-white/10 sm:w-36">
                                    <Image
                                        src="/ebooks/trap-guide-book-cover.jpg"
                                        alt="Cover of Music Production Guide: Trap Edition by Virzy Guns"
                                        width={815}
                                        height={1058}
                                        sizes="(min-width: 640px) 144px, 112px"
                                        className="h-auto w-full"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white/55">PDF, coming soon</p>
                                    <h2 className="mt-1 text-xl font-semibold leading-snug text-white">Music Production Guide: Trap Edition</h2>
                                    <p className="mt-2 text-base leading-7 text-white/65">
                                        More than 80 pages on trap drums, 808 tuning, vocals, mix balance and mastering for streaming.
                                    </p>
                                    <p className="mt-1 text-sm text-white">
                                        <TapLink href="/book">See the chapters</TapLink>
                                    </p>
                                </div>
                            </div>
                            <p className="mt-8 border-t border-white/10 pt-5 text-sm leading-6 text-white/60">
                                A video course built from real sessions is in development.{' '}
                                <TapLink href="/studio/masterclass" className="text-white">
                                    See the planned modules
                                </TapLink>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
