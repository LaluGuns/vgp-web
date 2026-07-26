import fs from 'fs';
import path from 'path';
import { beatsCatalog, categories, BeatProduct } from './index';
import {
    generateBeatProductSchema,
    generateCategorySchema,
    generateLicensingSchema,
    generateHreflangs,
} from '../seo/beat-structured-data';
import {
    getOfficialBeatStarsGenres,
    validateBeatStarsClassificationCoverage,
} from './beatstars-genre-index';

export interface ValidationIssue {
    ruleId: number;
    ruleName: string;
    severity: 'error' | 'warning';
    beatId?: string;
    message: string;
}

export function validateCatalogSuite(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const idMap = new Map<string, string>();
    const slugMap = new Map<string, string>();
    const trackIdMap = new Map<string, string>();

    const classificationCoverage = validateBeatStarsClassificationCoverage(
        beatsCatalog.map((beat) => beat.beatstarsTrackId),
    );

    if (classificationCoverage.missing.length > 0) {
        issues.push({
            ruleId: 24,
            ruleName: 'missing-official-genre-classification',
            severity: 'error',
            message: `Missing official BeatStars classification for ${classificationCoverage.missing.join(', ')}`,
        });
    }

    if (classificationCoverage.unsupportedTrapWorlds.length > 0) {
        issues.push({
            ruleId: 25,
            ruleName: 'unsupported-editorial-trap-world',
            severity: 'error',
            message: `Editorial Trap world without official BeatStars Trap genre: ${classificationCoverage.unsupportedTrapWorlds.join(', ')}`,
        });
    }

    if (classificationCoverage.requiresHumanReview.length > 0) {
        issues.push({
            ruleId: 26,
            ruleName: 'broad-official-genre-needs-review',
            severity: 'warning',
            message: `Tracks retained in the Alternative world pending human audio review: ${classificationCoverage.requiresHumanReview.join(', ')}`,
        });
    }

    // Check catalog route collisions with categories or 'licensing'
    const reservedSlugs = new Set([...categories.map((c) => c.slug), 'licensing']);

    beatsCatalog.forEach((beat) => {
        // 1. Duplicate IDs
        if (idMap.has(beat.id)) {
            issues.push({
                ruleId: 1,
                ruleName: 'duplicate-id',
                severity: 'error',
                beatId: beat.id,
                message: `Duplicate beat ID found: ${beat.id}`,
            });
        } else {
            idMap.set(beat.id, beat.title);
        }

        // 2. Duplicate slugs
        if (slugMap.has(beat.slug)) {
            issues.push({
                ruleId: 2,
                ruleName: 'duplicate-slug',
                severity: 'error',
                beatId: beat.id,
                message: `Duplicate slug found: ${beat.slug}`,
            });
        } else {
            slugMap.set(beat.slug, beat.title);
        }

        // 23. Route conflict with reserved category slugs or 'licensing'
        if (reservedSlugs.has(beat.slug)) {
            issues.push({
                ruleId: 23,
                ruleName: 'reserved-slug-conflict',
                severity: 'error',
                beatId: beat.id,
                message: `Beat slug conflicts with reserved category or route: ${beat.slug}`,
            });
        }

        // 3. Duplicate BeatStars Track IDs
        if (beat.beatstarsTrackId && beat.beatstarsTrackId !== 'NONE') {
            if (trackIdMap.has(beat.beatstarsTrackId)) {
                issues.push({
                    ruleId: 3,
                    ruleName: 'duplicate-track-id',
                    severity: 'error',
                    beatId: beat.id,
                    message: `Duplicate BeatStars track ID found: ${beat.beatstarsTrackId}`,
                });
            } else {
                trackIdMap.set(beat.beatstarsTrackId, beat.title);
            }
        }

        // 4. Missing titles
        if (!beat.title || beat.title.trim() === '') {
            issues.push({
                ruleId: 4,
                ruleName: 'missing-title',
                severity: 'error',
                beatId: beat.id,
                message: `Beat missing title: ${beat.id}`,
            });
        }

        // 5. Missing embeds
        if (!beat.beatstarsEmbedUrl || beat.beatstarsEmbedUrl.trim() === '') {
            issues.push({
                ruleId: 5,
                ruleName: 'missing-embed',
                severity: 'error',
                beatId: beat.id,
                message: `Beat missing embed URL: ${beat.id}`,
            });
        }

        // 6. Invalid BeatStars URLs
        if (
            beat.beatstarsEmbedUrl &&
            !beat.beatstarsEmbedUrl.startsWith('https://www.beatstars.com/embed/track?id=')
        ) {
            issues.push({
                ruleId: 6,
                ruleName: 'invalid-beatstars-url',
                severity: 'error',
                beatId: beat.id,
                message: `Invalid BeatStars embed URL format: ${beat.beatstarsEmbedUrl}`,
            });
        }

        // 7. Title/track mismatch check (if title-verified)
        if (beat.identityVerification === 'mismatch') {
            issues.push({
                ruleId: 7,
                ruleName: 'title-track-mismatch',
                severity: 'error',
                beatId: beat.id,
                message: `Identity verification mismatch recorded for beat: ${beat.title}`,
            });
        }

        // 9. Fabricated "verified" status
        if (
            beat.identityVerification === ('verified' as any) ||
            beat.offerVerification === ('verified' as any)
        ) {
            issues.push({
                ruleId: 9,
                ruleName: 'fabricated-verification-status',
                severity: 'error',
                beatId: beat.id,
                message: `Fabricated verification status found on beat: ${beat.id}`,
            });
        }

        // 10. Unknown availability incorrectly emitted as InStock
        if (beat.availability === 'unknown' && beat.offerVerification === 'product-page-active') {
            issues.push({
                ruleId: 10,
                ruleName: 'unknown-availability-instock',
                severity: 'error',
                beatId: beat.id,
                message: `Unknown availability marked active product page: ${beat.id}`,
            });
        }

        // 11. Product Offer schema without verified pricing
        if (beat.offerVerification === 'unverified') {
            const schema = generateBeatProductSchema(beat, 'en-US');
            const hasProductOfferNode = schema['@graph'].some((node: any) => node['@type'] === 'Product');
            if (hasProductOfferNode) {
                issues.push({
                    ruleId: 11,
                    ruleName: 'unverified-offer-schema-emitted',
                    severity: 'error',
                    beatId: beat.id,
                    message: `Product/Offer schema emitted for unverified offer on beat: ${beat.id}`,
                });
            }
        }

        // 12. Localized schema URL mismatch check
        (['en-US', 'ja-JP', 'de-DE'] as const).forEach((locale) => {
            const schema = generateBeatProductSchema(beat, locale);
            const expectedUrl =
                locale === 'en-US'
                    ? `https://www.virzyguns.com/studio/beats/${beat.slug}`
                    : `https://www.virzyguns.com/${locale}/studio/beats/${beat.slug}`;

            const recNode = schema['@graph'].find((n: any) => n['@type'] === 'MusicRecording');
            if (recNode && recNode['@id'] !== `${expectedUrl}#recording`) {
                issues.push({
                    ruleId: 12,
                    ruleName: 'localized-schema-url-mismatch',
                    severity: 'error',
                    beatId: beat.id,
                    message: `Localized schema @id mismatch for ${locale}: expected ${expectedUrl}#recording, got ${recNode['@id']}`,
                });
            }
        });

        // 17. Obvious genre contradictions
        const lowerTitle = beat.title.toLowerCase();
        if (lowerTitle.includes('phonk') && beat.primaryGenre === 'Synthwave') {
            issues.push({
                ruleId: 17,
                ruleName: 'genre-contradiction',
                severity: 'warning',
                beatId: beat.id,
                message: `Title "${beat.title}" contains 'phonk' but primaryGenre is 'Synthwave'`,
            });
        }

        // 18. The stored official genre index must never drift from BeatStars metadata.
        const officialGenres = getOfficialBeatStarsGenres(beat.beatstarsTrackId);
        if (officialGenres.length === 0) {
            issues.push({
                ruleId: 18,
                ruleName: 'missing-official-beatstars-genres',
                severity: 'error',
                beatId: beat.id,
                message: `No official BeatStars genres indexed for ${beat.title}`,
            });
        }

        // 20. Indexable pages with insufficient data
        if (beat.seoStatus === 'indexable') {
            if (!beat.beatstarsTrackId || !beat.beatstarsEmbedUrl || !beat.slug) {
                issues.push({
                    ruleId: 20,
                    ruleName: 'indexable-insufficient-data',
                    severity: 'error',
                    beatId: beat.id,
                    message: `Beat ${beat.id} marked indexable but missing trackId/embed/slug`,
                });
            }
        }
    });

    // 21. Category pages with zero matching tracks
    categories.forEach((cat) => {
        const matchingBeats = beatsCatalog.filter(
            (b) => b.primaryGenre === cat.primaryGenre || b.subgenres.some((s) => cat.subgenres.includes(s))
        );
        if (matchingBeats.length === 0) {
            issues.push({
                ruleId: 21,
                ruleName: 'empty-category',
                severity: 'warning',
                message: `Category '${cat.slug}' has zero matching beats in catalog`,
            });
        }
    });

    // 15. Reciprocal Hreflang validation
    const sampleHref = generateHreflangs('/studio/beats/test-slug');
    if (
        sampleHref['en-US'] !== 'https://www.virzyguns.com/studio/beats/test-slug' ||
        sampleHref['ja-JP'] !== 'https://www.virzyguns.com/ja-JP/studio/beats/test-slug' ||
        sampleHref['de-DE'] !== 'https://www.virzyguns.com/de-DE/studio/beats/test-slug'
    ) {
        issues.push({
            ruleId: 15,
            ruleName: 'hreflang-non-reciprocal',
            severity: 'error',
            message: 'Hreflang generator output does not follow exact localized URL patterns',
        });
    }

    return issues;
}
