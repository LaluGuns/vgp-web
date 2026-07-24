import { beatsCatalog, categories, BeatProduct } from './index';

export interface ValidationIssue {
    beatId?: string;
    slug?: string;
    field: string;
    issue: string;
    severity: 'error' | 'warning';
}

export function validateCatalog(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const seenSlugs = new Set<string>();
    const seenIds = new Set<string>();

    for (const beat of beatsCatalog) {
        // ID Uniqueness
        if (seenIds.has(beat.id)) {
            issues.push({ beatId: beat.id, field: 'id', issue: 'Duplicate beat ID', severity: 'error' });
        }
        seenIds.add(beat.id);

        // Slug Uniqueness
        if (seenSlugs.has(beat.slug)) {
            issues.push({ slug: beat.slug, field: 'slug', issue: 'Duplicate beat slug', severity: 'error' });
        }
        seenSlugs.add(beat.slug);

        // Title check
        if (!beat.title || beat.title.trim() === '') {
            issues.push({ beatId: beat.id, field: 'title', issue: 'Missing beat title', severity: 'error' });
        }

        // BeatStars URL check
        if (!beat.beatstarsProductUrl || !beat.beatstarsProductUrl.startsWith('https://www.beatstars.com/')) {
            issues.push({
                beatId: beat.id,
                field: 'beatstarsProductUrl',
                issue: 'Invalid or missing BeatStars URL',
                severity: 'error',
            });
        }

        // Genre check
        if (!beat.primaryGenre) {
            issues.push({ beatId: beat.id, field: 'primaryGenre', issue: 'Missing primary genre', severity: 'error' });
        }

        // License check
        if (!beat.licenses || beat.licenses.length === 0) {
            issues.push({ beatId: beat.id, field: 'licenses', issue: 'No licenses specified', severity: 'error' });
        } else {
            const licenseIds = new Set<string>();
            for (const lic of beat.licenses) {
                if (licenseIds.has(lic.id)) {
                    issues.push({
                        beatId: beat.id,
                        field: 'licenses',
                        issue: `Duplicate license ID: ${lic.id}`,
                        severity: 'error',
                    });
                }
                licenseIds.add(lic.id);

                if (lic.priceValue < 0) {
                    issues.push({
                        beatId: beat.id,
                        field: 'licenses.priceValue',
                        issue: `Negative price for license ${lic.id}`,
                        severity: 'error',
                    });
                }
            }
        }

        // Provenance source check
        if (!beat.sources || Object.keys(beat.sources).length === 0) {
            issues.push({
                beatId: beat.id,
                field: 'sources',
                issue: 'Missing data source provenance',
                severity: 'warning',
            });
        }
    }

    // Validate Categories
    const categorySlugs = new Set<string>();
    for (const cat of categories) {
        if (categorySlugs.has(cat.slug)) {
            issues.push({ slug: cat.slug, field: 'category.slug', issue: 'Duplicate category slug', severity: 'error' });
        }
        categorySlugs.add(cat.slug);
    }

    return issues;
}
