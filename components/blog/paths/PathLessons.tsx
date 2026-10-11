'use client';

import { useId } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { EditorialButton } from '@/components/editorial/EditorialPrimitives';
import { useReadArticles } from '@/components/blog/article/useReadArticles';
import { useScrollMemory } from '@/components/blog/useScrollMemory';

export interface PathLesson {
    slug: string;
    title: string;
    excerpt: string;
    readingTime: number;
    features: string[];
}

/** A learning path: progress, a start or continue button, and the numbered lessons (h2 under the path's h1). */
export function PathLessons({ lessons }: { lessons: PathLesson[] }) {
    const read = useReadArticles();
    const listId = useId();
    // Back from a lesson lands where the reader left the list.
    useScrollMemory();
    const done = lessons.filter((l) => read.includes(l.slug)).length;
    const nextIndex = lessons.findIndex((l) => !read.includes(l.slug));
    const next = nextIndex === -1 ? lessons[0] : lessons[nextIndex];
    const minutes = lessons.reduce((sum, l) => sum + l.readingTime, 0);
    const label =
        done === 0
            ? 'Start with lesson 1'
            : nextIndex === -1
              ? 'Path complete. Read lesson 1 again'
              : `Continue with lesson ${nextIndex + 1}`;

    return (
        <>
            <div className="flex flex-col gap-6 border-y border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:max-w-md">
                    <p className="text-sm text-white/60">
                        {lessons.length} lessons · about {Math.round(minutes / 5) * 5} minutes in all
                    </p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                        <div className="h-full rounded-full bg-white/80 transition-[width] duration-500" style={{ width: `${(done / lessons.length) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-white/55" aria-live="polite">
                        {done} of {lessons.length} read on this device
                    </p>
                </div>
                {next ? (
                    <EditorialButton href={`/blog/${next.slug}`} withArrow>
                        {/* Sized by its longest everyday form, so it keeps its width when the reading state loads. */}
                        <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
                            <span className="invisible" aria-hidden="true">
                                Continue with lesson {lessons.length}
                            </span>
                            <span>{label}</span>
                        </span>
                    </EditorialButton>
                ) : null}
            </div>

            <ol className="max-w-4xl divide-y divide-white/10">
                {lessons.map((lesson, i) => {
                    const isRead = read.includes(lesson.slug);
                    // Named by the title alone; the meta line and the excerpt describe it.
                    const id = `${listId}${i}`;
                    return (
                        <li key={lesson.slug}>
                            <Link
                                href={`/blog/${lesson.slug}`}
                                aria-labelledby={`${id}-title`}
                                aria-describedby={`${id}-meta ${id}-excerpt`}
                                className="group flex gap-5 py-7 vgp-focus"
                            >
                                <span
                                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums ${
                                        isRead ? 'border-white bg-white text-black' : 'border-white/25 text-white/60'
                                    }`}
                                    aria-hidden="true"
                                >
                                    {isRead ? <Check size={14} strokeWidth={3} /> : i + 1}
                                </span>
                                <span className="min-w-0">
                                    <span id={`${id}-meta`} className="text-xs text-white/50">
                                        Lesson {i + 1} · {lesson.readingTime} min
                                        {lesson.features.length ? ` · ${lesson.features.join(' · ')}` : ''}
                                        {/* Always laid out, so the line wraps the same before and after the reading state loads. */}
                                        <span className={isRead ? undefined : 'invisible'}> · Read</span>
                                    </span>
                                    <h2
                                        id={`${id}-title`}
                                        className="mt-2 text-xl font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4"
                                    >
                                        {lesson.title}
                                    </h2>
                                    <span id={`${id}-excerpt`} className="mt-2 line-clamp-2 block max-w-2xl text-base leading-7 text-white/65">
                                        {lesson.excerpt}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </>
    );
}
