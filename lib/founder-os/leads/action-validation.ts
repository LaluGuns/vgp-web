import { z } from 'zod';
import {
    FOUNDER_MARKETS,
    PROSPECT_SEGMENTS,
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
} from '../contracts.ts';

const stableKeySchema = z.string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);

const httpsUrlSchema = z.string().url().refine(
    (value) => new URL(value).protocol === 'https:',
    'URL must use HTTPS.'
);

const evidenceKeyListSchema = z.array(stableKeySchema)
    .min(1)
    .max(20)
    .refine(
        (values) => new Set(values).size === values.length,
        'Evidence keys must be unique.'
    );

const qualificationSignalSchema = z.object({
    strength: z.enum(['high', 'medium', 'low', 'none']),
    evidenceKeys: z.array(stableKeySchema).max(20),
    note: z.string().trim().min(1).max(2000).nullable(),
}).strict();

export const customGptProspectInputSchema = z.object({
    requestKey: z.string()
        .trim()
        .min(8)
        .max(120)
        .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/),
    displayName: z.string().trim().min(1).max(500),
    handle: z.string().trim().min(1).max(255).nullable(),
    segment: z.enum(PROSPECT_SEGMENTS),
    market: z.enum(FOUNDER_MARKETS),
    platform: z.enum(['instagram', 'tiktok', 'youtube', 'website', 'other']),
    profileUrl: httpsUrlSchema.nullable(),
    contact: z.object({
        businessEmail: z.string().email().max(320).nullable(),
        permission: z.enum([
            'public-business-email',
            'manual-only',
            'blocked',
        ]),
        sourceEvidenceKey: stableKeySchema.nullable(),
        origin: z.literal('source-provided'),
    }).strict(),
    evidence: z.array(z.object({
        key: stableKeySchema,
        label: z.string().trim().min(1).max(500),
        url: httpsUrlSchema,
        observedAt: z.string().datetime({ offset: true }),
        note: z.string().trim().min(1).max(10_000).optional(),
    }).strict())
        .min(1)
        .max(20)
        .refine(
            (items) => new Set(items.map((item) => item.key)).size === items.length,
            'Evidence keys must be unique.'
        ),
    qualificationSignals: z.object({
        audienceFit: qualificationSignalSchema,
        styleFit: qualificationSignalSchema,
        purchaseIntent: qualificationSignalSchema,
    }).strict(),
    beatMatches: z.array(z.object({
        beatId: z.string().trim().min(1).max(160),
        matchReason: z.string().trim().min(1).max(2000),
        evidenceKeys: evidenceKeyListSchema,
    }).strict()).max(10),
}).strict();

export type CustomGptProspectInput = z.infer<
    typeof customGptProspectInputSchema
>;
