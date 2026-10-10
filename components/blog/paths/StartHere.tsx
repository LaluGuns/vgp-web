import { TapLink } from '@/components/blog/article/TapLink';

/** First lesson of a path, for the "New here?" line. */
export interface StartLesson {
    pathName: string;
    slug: string;
    readingTime: number;
}

/**
 * "New here? Start with Songwriting, lesson 1 (6 min) or ...". Plain markup,
 * so it renders on the server (/learn) and inside the client lesson list
 * (/blog). The data comes from `startLessons()` on the server.
 */
export function StartHere({ lessons, className = '' }: { lessons: StartLesson[]; className?: string }) {
    if (lessons.length === 0) return null;
    return (
        <p className={`text-base leading-7 text-white/70 ${className}`}>
            New here? Start with{' '}
            {lessons.map((lesson, i) => (
                <span key={lesson.slug}>
                    {i > 0 ? (i === lessons.length - 1 ? ' or ' : ', ') : null}
                    {/* One unbroken piece: Chrome breaks after an inline-flex link even at a no-break
                        space, which left "(6 min)." to start a line on its own. */}
                    <span className="whitespace-nowrap">
                        <TapLink href={`/blog/${lesson.slug}`} className="text-white">
                            {lesson.pathName}, lesson 1
                        </TapLink>{' '}
                        ({lesson.readingTime} min){i === lessons.length - 1 ? '.' : null}
                    </span>
                </span>
            ))}
        </p>
    );
}
