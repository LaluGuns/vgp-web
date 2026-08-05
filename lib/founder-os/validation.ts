import { z } from 'zod';
import {
    ACTION_CHANNELS,
    FOUNDER_MARKETS,
    FOUNDER_OS_CONTRACT_VERSION,
    PROSPECT_SEGMENTS,
} from './contracts';

const integrationStatusSchema = z.enum([
    'connected',
    'configured',
    'not-connected',
    'error',
]);

function hasNoDuplicates(values: readonly string[]): boolean {
    return new Set(values).size === values.length;
}

export const founderSettingsInputSchema = z.object({
    contractVersion: z.literal(FOUNDER_OS_CONTRACT_VERSION),
    markets: z.array(z.enum(FOUNDER_MARKETS))
        .min(1)
        .max(FOUNDER_MARKETS.length)
        .refine(hasNoDuplicates, 'Markets must not contain duplicates.'),
    segmentPriority: z.array(z.enum(PROSPECT_SEGMENTS))
        .length(PROSPECT_SEGMENTS.length)
        .refine(hasNoDuplicates, 'Segment priority must contain every segment exactly once.'),
    scoreThreshold: z.number().int().min(0).max(100),
    requireApprovalForEveryExternalAction: z.literal(true),
    allowColdSocialDm: z.literal(false),
    allowUnverifiedContacts: z.literal(false),
    trendSources: z.object({
        ownedAnalytics: z.boolean(),
        officialPlatformApis: z.boolean(),
        manualResearch: z.boolean(),
        scraping: z.literal(false),
    }).strict(),
    integrations: z.object({
        meta: integrationStatusSchema,
        tiktok: integrationStatusSchema,
        'hostinger-email': integrationStatusSchema,
        'cloudflare-agent': integrationStatusSchema,
    }).strict(),
}).strict();

export const demoBootstrapInputSchema = z.object({
    confirm: z.literal('BOOTSTRAP_DEMO_DATA'),
}).strict();

export const activateLiveWorkspaceInputSchema = z.object({
    confirmation: z.literal('ACTIVATE_LIVE_WORKSPACE'),
}).strict();

export const approvalTransitionInputSchema = z.object({
    targetStatus: z.enum(['READY_FOR_APPROVAL', 'APPROVED']),
    expectedContentHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
}).strict();

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export const founderEmailAddressSchema = z.string().email().max(320);

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
    z.union([
        z.string(),
        z.number().finite(),
        z.boolean(),
        z.null(),
        z.array(jsonValueSchema),
        z.record(z.string(), jsonValueSchema),
    ])
);

export const approvalContentInputSchema = z.object({
    expectedContentHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    payloadSummary: z.string().trim().min(1).max(10_000),
    payload: z.record(z.string(), jsonValueSchema),
}).strict().superRefine((value, context) => {
    const byteLength = Buffer.byteLength(JSON.stringify(value.payload), 'utf8');
    if (byteLength > 64 * 1024) {
        context.addIssue({
            code: 'custom',
            path: ['payload'],
            message: 'Approval payload must be 64 KiB or smaller.',
        });
    }
});

export const founderOsEntityIdSchema = z.string()
    .min(1)
    .max(160)
    .regex(
        /^[A-Za-z0-9][A-Za-z0-9._:-]*$/,
        'Invalid Founder OS entity ID.'
    );

export const executionStartInputSchema = z.object({
    approvalId: founderOsEntityIdSchema,
    expectedContentHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
    requestId: z.string().min(1).max(255),
}).strict();

export const founderEmailPayloadSchema = z.object({
    operation: z.literal('email.outreach.draft'),
    prospectId: founderOsEntityIdSchema,
    subject: z.string()
        .trim()
        .min(1)
        .max(998)
        .refine(
            (value) => !/[\r\n]/.test(value),
            'Email subject must not contain line breaks.'
        ),
    body: z.string().trim().min(1).max(20_000),
    evidenceIds: z.array(founderOsEntityIdSchema).max(20),
}).strict();

export const executionOutcomeInputSchema = z.discriminatedUnion('status', [
    z.object({
        approvalId: founderOsEntityIdSchema,
        status: z.literal('SUCCEEDED'),
        providerReference: z.string().trim().min(1).max(2000),
        requestId: z.string().min(1).max(255),
    }).strict(),
    z.object({
        approvalId: founderOsEntityIdSchema,
        status: z.literal('FAILED'),
        failureReason: z.string().trim().min(1).max(10_000),
        requestId: z.string().min(1).max(255),
    }).strict(),
    z.object({
        approvalId: founderOsEntityIdSchema,
        status: z.literal('UNKNOWN'),
        failureReason: z.string().trim().min(1).max(10_000),
        requestId: z.string().min(1).max(255),
    }).strict(),
]);

export const actionChannelSchema = z.enum(ACTION_CHANNELS);

const customGptDraftBaseSchema = z.object({
    requestKey: z.string()
        .trim()
        .min(8)
        .max(120)
        .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/),
    targetLabel: z.string().trim().min(1).max(1000),
    payloadSummary: z.string().trim().min(1).max(10_000),
    evidenceIds: z.array(founderOsEntityIdSchema).max(20).default([]),
});

export const customGptDraftInputSchema = z.discriminatedUnion('kind', [
    customGptDraftBaseSchema.extend({
        kind: z.literal('email-outreach'),
        prospectId: founderOsEntityIdSchema,
        subject: z.string()
            .trim()
            .min(1)
            .max(998)
            .refine(
                (value) => !/[\r\n]/.test(value),
                'Email subject must not contain line breaks.'
            ),
        body: z.string().trim().min(1).max(20_000),
    }).strict(),
    customGptDraftBaseSchema.extend({
        kind: z.literal('instagram-reel'),
        videoUrl: z.string().url().refine(
            (value) => new URL(value).protocol === 'https:',
            'Media URL must use HTTPS.'
        ),
        caption: z.string().max(2200),
        shareToFeed: z.boolean(),
    }).strict(),
    customGptDraftBaseSchema.extend({
        kind: z.literal('instagram-reel-publish'),
        creationId: z.string()
            .trim()
            .min(1)
            .max(256)
            .regex(/^[A-Za-z0-9._:-]+$/),
    }).strict(),
    customGptDraftBaseSchema.extend({
        kind: z.literal('tiktok-draft-upload'),
        videoUrl: z.string().url().refine(
            (value) => new URL(value).protocol === 'https:',
            'Media URL must use HTTPS.'
        ),
        founderConfirmedUpload: z.literal(true),
    }).strict(),
]);

export type CustomGptDraftInput = z.infer<typeof customGptDraftInputSchema>;
