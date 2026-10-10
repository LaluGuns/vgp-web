import { learningPaths } from '@/lib/blog/paths';
import { DIALECTS, dialectForCategory, type Dialect, type DialectName } from '@/lib/blog/dialects';

/**
 * The learning paths grouped by figure dialect, for the Learn path map
 * (docs/DESIGN.md, "Learn area"). Server only. Every number on the map
 * comes from here: lessons per path, their order and reading times.
 */

export interface MapLesson {
    slug: string;
    title: string;
    minutes: number;
}

export interface MapPath {
    slug: string;
    name: string;
    lessons: MapLesson[];
}

export interface MapFamily {
    dialect: Dialect;
    /** The group's name on the map. The dialect names stay internal. */
    name: string;
    paths: MapPath[];
}

/** From the first idea to the release: writing, then sound and the mix, then the listener and the producer, then the business. */
const FAMILIES: { dialect: DialectName; name: string }[] = [
    { dialect: 'music', name: 'Writing and arranging' },
    { dialect: 'technical', name: 'Sound and mixing' },
    { dialect: 'mind', name: 'Psychology' },
    { dialect: 'business', name: 'Business' },
];

export function mapFamilies(): MapFamily[] {
    return FAMILIES.map(({ dialect, name }) => ({
        dialect: DIALECTS[dialect],
        name,
        paths: learningPaths
            .filter((path) => dialectForCategory(path.category.slug).name === dialect)
            .map((path) => ({
                slug: path.category.slug,
                name: path.category.name,
                lessons: path.articles.map((a) => ({ slug: a.slug, title: a.title, minutes: a.readingTime })),
            })),
    })).filter((family) => family.paths.length > 0);
}
