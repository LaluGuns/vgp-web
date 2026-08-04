import {
    FOUNDER_MARKETS,
    PROSPECT_SEGMENTS,
    type EvidenceFreshness,
    type SourceEvidence,
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
} from '../contracts.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { LeadScoutValidationError, type LeadScoutIssue } from './errors.ts';
import type {
    CandidateEvidenceInput,
    IngestedLeadCandidate,
    LeadCandidateInput,
    LeadScoutOptions,
    QualificationSignalInput,
    VerifiedBeatMatchInput,
} from './types.ts';

const PLATFORM_VALUES = new Set(['instagram', 'tiktok', 'youtube', 'website', 'other']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1_000;

const FRESHNESS_WINDOW_DAYS = {
    rapper: 120,
    'game-developer': 180,
    'content-creator': 60,
} as const;

function cleanText(value: string): string {
    return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isSecureHttpUrl(value: string): boolean {
    try {
        return new URL(value).protocol === 'https:';
    } catch {
        return false;
    }
}

function parseObservedAt(value: string | null): number | null {
    if (!value) return null;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
}

function evidenceFreshness(
    observedAt: string | null,
    segment: LeadCandidateInput['segment'],
    nowMs: number,
): EvidenceFreshness {
    const observedMs = parseObservedAt(observedAt);
    if (observedMs === null || observedMs > nowMs + MAX_FUTURE_SKEW_MS) return 'unknown';
    const windowMs = FRESHNESS_WINDOW_DAYS[segment] * 24 * 60 * 60 * 1_000;
    return nowMs - observedMs <= windowMs ? 'fresh' : 'stale';
}

function validateSignal(
    name: keyof LeadCandidateInput['qualificationSignals'],
    signal: QualificationSignalInput,
    evidenceIds: ReadonlySet<string>,
    issues: LeadScoutIssue[],
) {
    const path = `qualificationSignals.${name}`;
    if (signal.strength === 'none') return;
    if (!signal.note || !cleanText(signal.note)) {
        issues.push({
            path: `${path}.note`,
            code: 'invalid-value',
            message: 'A scored signal needs a plain-language, source-grounded note.',
        });
    }
    if (signal.evidenceIds.length === 0) {
        issues.push({
            path: `${path}.evidenceIds`,
            code: 'missing-evidence',
            message: 'A scored signal must reference at least one candidate evidence record.',
        });
    }
    for (const evidenceId of signal.evidenceIds) {
        if (!evidenceIds.has(evidenceId)) {
            issues.push({
                path: `${path}.evidenceIds`,
                code: 'missing-evidence',
                message: `Signal references unknown evidence ID "${evidenceId}".`,
            });
        }
    }
}

function normalizeEvidence(
    evidence: CandidateEvidenceInput,
    segment: LeadCandidateInput['segment'],
    nowMs: number,
): SourceEvidence {
    return {
        id: cleanText(evidence.id),
        label: cleanText(evidence.label),
        url: evidence.url?.trim() || null,
        sourceType: evidence.sourceType,
        observedAt: evidence.observedAt,
        freshness: evidenceFreshness(evidence.observedAt, segment, nowMs),
        ...(evidence.note ? { note: cleanText(evidence.note) } : {}),
    };
}

function validateBeatMatch(
    beat: VerifiedBeatMatchInput,
    index: number,
    evidenceIds: ReadonlySet<string>,
    issues: LeadScoutIssue[],
) {
    const path = `beatMatches.${index}`;
    if (beat.verificationStatus !== 'verified') {
        issues.push({
            path: `${path}.verificationStatus`,
            code: 'unverified-beat',
            message: 'Only an explicitly verified catalog beat may enter a match or outreach draft.',
        });
    }
    if (!cleanText(beat.beatId) || !cleanText(beat.title) || !cleanText(beat.matchReason)) {
        issues.push({
            path,
            code: 'invalid-value',
            message: 'A beat match needs a stable ID, title, and inspectable match reason.',
        });
    }
    if (!isSecureHttpUrl(beat.publicUrl)) {
        issues.push({
            path: `${path}.publicUrl`,
            code: 'invalid-value',
            message: 'A verified beat match needs an HTTPS public catalog URL.',
        });
    }
    if (beat.evidenceIds.length === 0) {
        issues.push({
            path: `${path}.evidenceIds`,
            code: 'missing-evidence',
            message: 'A beat match must cite at least one fit evidence record.',
        });
    }
    for (const evidenceId of beat.evidenceIds) {
        if (!evidenceIds.has(evidenceId)) {
            issues.push({
                path: `${path}.evidenceIds`,
                code: 'missing-evidence',
                message: `Beat match references unknown evidence ID "${evidenceId}".`,
            });
        }
    }
}

export function ingestLeadCandidate(
    rawInput: LeadCandidateInput,
    options: LeadScoutOptions,
): IngestedLeadCandidate {
    const mode = options.mode ?? 'production';
    const nowMs = Date.parse(options.now);
    if (!Number.isFinite(nowMs)) {
        throw new LeadScoutValidationError([
            {
                path: 'options.now',
                code: 'invalid-value',
                message: 'Lead Scout needs a valid ISO timestamp to calculate evidence freshness.',
            },
        ]);
    }

    const issues: LeadScoutIssue[] = [];
    const gaps: string[] = [];

    if (!PROSPECT_SEGMENTS.includes(rawInput.segment)) {
        issues.push({
            path: 'segment',
            code: 'invalid-value',
            message: 'Unsupported prospect segment.',
        });
    }
    if (!FOUNDER_MARKETS.includes(rawInput.market)) {
        issues.push({
            path: 'market',
            code: 'invalid-value',
            message: 'Unsupported founder market.',
        });
    }
    if (!PLATFORM_VALUES.has(rawInput.platform)) {
        issues.push({
            path: 'platform',
            code: 'invalid-value',
            message: 'Unsupported prospect platform.',
        });
    }
    if (!cleanText(rawInput.id) || !cleanText(rawInput.displayName)) {
        issues.push({
            path: 'identity',
            code: 'invalid-value',
            message: 'Candidate ID and display name are required.',
        });
    }
    if (rawInput.profileUrl && !isSecureHttpUrl(rawInput.profileUrl)) {
        issues.push({
            path: 'profileUrl',
            code: 'invalid-value',
            message: 'Profile URL must be an HTTPS URL when supplied.',
        });
    }
    if (rawInput.evidence.length === 0) {
        issues.push({
            path: 'evidence',
            code: 'missing-evidence',
            message: 'A candidate cannot be ingested without source evidence.',
        });
    }

    const evidenceIdSet = new Set<string>();
    const normalizedEvidence = rawInput.evidence.map((item, index) => {
        const id = cleanText(item.id);
        if (!id || evidenceIdSet.has(id)) {
            issues.push({
                path: `evidence.${index}.id`,
                code: 'invalid-value',
                message: 'Evidence IDs must be non-empty and unique inside the candidate.',
            });
        }
        evidenceIdSet.add(id);

        const observedMs = parseObservedAt(item.observedAt);
        if (mode === 'production' && !item.url) {
            issues.push({
                path: `evidence.${index}.url`,
                code: 'missing-source-url',
                message: 'Production evidence requires its source URL.',
            });
        } else if (item.url && !isSecureHttpUrl(item.url)) {
            issues.push({
                path: `evidence.${index}.url`,
                code: 'invalid-value',
                message: 'Evidence source URL must use HTTPS.',
            });
        } else if (!item.url) {
            gaps.push(`Evidence "${item.label}" has no source URL and remains demo-only.`);
        }

        if (mode === 'production' && observedMs === null) {
            issues.push({
                path: `evidence.${index}.observedAt`,
                code: 'missing-observed-at',
                message: 'Production evidence requires a valid observation timestamp.',
            });
        } else if (observedMs === null) {
            gaps.push(`Evidence "${item.label}" has unknown freshness.`);
        } else if (observedMs > nowMs + MAX_FUTURE_SKEW_MS) {
            issues.push({
                path: `evidence.${index}.observedAt`,
                code: 'future-observation',
                message: 'Evidence observation time cannot be in the future.',
            });
        }

        return normalizeEvidence(item, rawInput.segment, nowMs);
    });

    const contact = rawInput.contact;
    const normalizedEmail = contact.businessEmail?.trim().toLowerCase() || null;
    if (contact.origin === 'inferred') {
        issues.push({
            path: 'contact.origin',
            code: 'guessed-contact',
            message: 'Inferred or guessed contact details are never accepted.',
        });
    }
    if (normalizedEmail && !EMAIL_PATTERN.test(normalizedEmail)) {
        issues.push({
            path: 'contact.businessEmail',
            code: 'invalid-contact',
            message: 'Business email is malformed.',
        });
    }
    if (
        (contact.permission === 'public-business-email' ||
            contact.permission === 'verified-opt-in') &&
        !normalizedEmail
    ) {
        issues.push({
            path: 'contact.businessEmail',
            code: 'invalid-contact',
            message: 'Email permission requires a supplied, source-backed email address.',
        });
    }
    if (normalizedEmail && !contact.sourceEvidenceId) {
        issues.push({
            path: 'contact.sourceEvidenceId',
            code: 'missing-evidence',
            message: 'A supplied email must reference evidence showing where it came from.',
        });
    } else if (contact.sourceEvidenceId && !evidenceIdSet.has(contact.sourceEvidenceId)) {
        issues.push({
            path: 'contact.sourceEvidenceId',
            code: 'missing-evidence',
            message: 'Contact references an unknown evidence record.',
        });
    }

    for (const [name, signal] of Object.entries(rawInput.qualificationSignals) as Array<
        [keyof LeadCandidateInput['qualificationSignals'], QualificationSignalInput]
    >) {
        validateSignal(name, signal, evidenceIdSet, issues);
    }

    rawInput.beatMatches.forEach((beat, index) =>
        validateBeatMatch(beat, index, evidenceIdSet, issues),
    );

    if (issues.length > 0) {
        throw new LeadScoutValidationError(issues);
    }

    const observedTimes = normalizedEvidence.flatMap((item) => {
        const timestamp = parseObservedAt(item.observedAt);
        return timestamp === null ? [] : [timestamp];
    });
    const lastObservedMs = observedTimes.length > 0 ? Math.max(...observedTimes) : null;
    const lastObservedAt =
        lastObservedMs === null ? null : new Date(lastObservedMs).toISOString();
    const overallFreshness =
        lastObservedAt === null
            ? 'unknown'
            : evidenceFreshness(lastObservedAt, rawInput.segment, nowMs);

    if (overallFreshness === 'stale') {
        gaps.push(
            `Most recent evidence is outside the ${FRESHNESS_WINDOW_DAYS[rawInput.segment]}-day ${rawInput.segment} freshness window.`,
        );
    }
    if (rawInput.beatMatches.length === 0) {
        gaps.push('No verified beat match was supplied.');
    }
    if (contact.permission === 'manual-only') {
        gaps.push('Contact is restricted to a founder-controlled manual handoff.');
    }
    if (contact.permission === 'blocked') {
        gaps.push('Contact policy blocks outreach.');
    }

    const normalizedInput: LeadCandidateInput = {
        ...rawInput,
        id: cleanText(rawInput.id),
        displayName: cleanText(rawInput.displayName),
        handle: rawInput.handle ? cleanText(rawInput.handle) : null,
        profileUrl: rawInput.profileUrl?.trim() || null,
        contact: {
            ...contact,
            businessEmail: normalizedEmail,
        },
        qualificationSignals: {
            audienceFit: {
                ...rawInput.qualificationSignals.audienceFit,
                note: rawInput.qualificationSignals.audienceFit.note
                    ? cleanText(rawInput.qualificationSignals.audienceFit.note)
                    : null,
            },
            styleFit: {
                ...rawInput.qualificationSignals.styleFit,
                note: rawInput.qualificationSignals.styleFit.note
                    ? cleanText(rawInput.qualificationSignals.styleFit.note)
                    : null,
            },
            purchaseIntent: {
                ...rawInput.qualificationSignals.purchaseIntent,
                note: rawInput.qualificationSignals.purchaseIntent.note
                    ? cleanText(rawInput.qualificationSignals.purchaseIntent.note)
                    : null,
            },
        },
        beatMatches: rawInput.beatMatches.map((beat) => ({
            ...beat,
            beatId: cleanText(beat.beatId),
            title: cleanText(beat.title),
            publicUrl: beat.publicUrl.trim(),
            matchReason: cleanText(beat.matchReason),
        })),
    };

    return {
        mode,
        input: normalizedInput,
        evidence: normalizedEvidence,
        evidenceById: new Map(normalizedEvidence.map((item) => [item.id, item])),
        matchedBeats: normalizedInput.beatMatches,
        lastObservedAt,
        freshness: overallFreshness,
        ingestionGaps: [...new Set(gaps)],
    };
}
