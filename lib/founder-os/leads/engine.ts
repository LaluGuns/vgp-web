// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { LeadScoutValidationError } from './errors.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { ingestLeadCandidate } from './ingest.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { buildOutreachDraftPlan } from './sequence.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { prioritizeLeadCandidates, scoreLeadCandidate } from './score.ts';
import type {
    LeadCandidateInput,
    LeadScoutOptions,
    LeadScoutResult,
} from './types.ts';

export function runLeadScout(
    input: LeadCandidateInput,
    options: LeadScoutOptions,
): LeadScoutResult {
    const ingested = ingestLeadCandidate(input, options);
    const candidate = scoreLeadCandidate(ingested, options.scoreThreshold ?? 70);
    const outreach = buildOutreachDraftPlan(candidate);
    return { candidate, outreach };
}

export function runLeadScoutBatch(
    inputs: readonly LeadCandidateInput[],
    options: LeadScoutOptions,
): LeadScoutResult[] {
    const seenIds = new Set<string>();
    for (const [index, input] of inputs.entries()) {
        const normalizedId = input.id.trim();
        if (seenIds.has(normalizedId)) {
            throw new LeadScoutValidationError([
                {
                    path: `inputs.${index}.id`,
                    code: 'invalid-value',
                    message: `Duplicate candidate ID "${normalizedId}" is ambiguous and cannot be merged automatically.`,
                },
            ]);
        }
        seenIds.add(normalizedId);
    }

    const results = inputs.map((input) => runLeadScout(input, options));
    const prioritized = prioritizeLeadCandidates(results.map((result) => result.candidate));
    const byCandidateId = new Map(
        results.map((result) => [result.candidate.prospect.id, result]),
    );

    return prioritized.map((candidate) => {
        const result = byCandidateId.get(candidate.prospect.id);
        if (!result) {
            throw new Error(`Lead Scout internal ordering failure for ${candidate.prospect.id}.`);
        }
        return result;
    });
}
