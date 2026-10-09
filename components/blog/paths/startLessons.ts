import { learningPaths } from '@/lib/blog/paths';
import type { StartLesson } from './StartHere';

/** Server only: the first lesson of the two paths a newcomer is most likely to want. */
export function startLessons(): StartLesson[] {
    return ['songwriting', 'mixing-mastering']
        .map((slug) => learningPaths.find((p) => p.category.slug === slug))
        .flatMap((path) => {
            const first = path?.articles[0];
            return path && first ? [{ pathName: path.category.name, slug: first.slug, readingTime: first.readingTime }] : [];
        });
}
