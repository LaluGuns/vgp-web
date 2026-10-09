import type { LearningPath } from '@/lib/blog/paths';

/**
 * JSON-LD objects shared by the lesson hub pages (/blog, /learn, the path
 * pages, the glossary). Render each through components/blog/article/JsonLd
 * (a plain <script nonce>), never next/script.
 */

export const SITE = 'https://www.virzyguns.com';

/** The WebSite node the root layout publishes (lib/seo/structured-data.ts), referenced by @id. */
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'Virzy Guns Production', url: SITE };

/** A page that lists the learning paths: a CollectionPage whose main entity is the paths in order. */
export function pathsCollection({ name, description, url, paths }: { name: string; description: string; url: string; paths: LearningPath[] }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url,
        isPartOf: WEBSITE,
        mainEntity: {
            '@type': 'ItemList',
            itemListOrder: 'https://schema.org/ItemListOrderAscending',
            numberOfItems: paths.length,
            itemListElement: paths.map((path, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE}/blog/category/${path.category.slug}`,
                name: path.category.name,
            })),
        },
    };
}

/** A path page: a CollectionPage whose main entity is its lessons in reading order. */
export function lessonsCollection({ name, description, url, path }: { name: string; description: string; url: string; path: LearningPath }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url,
        isPartOf: WEBSITE,
        mainEntity: {
            '@type': 'ItemList',
            itemListOrder: 'https://schema.org/ItemListOrderAscending',
            numberOfItems: path.articles.length,
            itemListElement: path.articles.map((article, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE}/blog/${article.slug}`,
                name: article.title,
            })),
        },
    };
}

/** BreadcrumbList from Home down to the page itself; pass the trail after Home. */
export function breadcrumbs(trail: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{ name: 'Home', url: SITE }, ...trail].map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
}
