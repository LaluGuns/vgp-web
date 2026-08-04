import { z } from 'zod';
import { ProviderStorageError } from './errors';
import { PROVIDER_IDS } from './types';

const providerSchema = z.enum(PROVIDER_IDS);
const uuidSchema = z.string().uuid();
const isoDateSchema = z.string().datetime({ offset: true });
const contentHashSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const requestIdSchema = z.string().min(1).max(255);

const SECRET_KEY_FRAGMENTS = [
    'token',
    'secret',
    'password',
    'authorization',
    'cookie',
    'codeverifier',
    'apikey',
    'privatekey',
    'credential',
    'bearer',
] as const;

function isSecretLikeKey(key: string): boolean {
    const compact = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return SECRET_KEY_FRAGMENTS.some((fragment) => compact.includes(fragment));
}

export function containsSecretLikeKey(value: unknown): boolean {
    if (Array.isArray(value)) return value.some(containsSecretLikeKey);
    if (!value || typeof value !== 'object') return false;

    return Object.entries(value as Record<string, unknown>).some(
        ([key, nested]) =>
            isSecretLikeKey(key) || containsSecretLikeKey(nested)
    );
}

const safeMetadataSchema = z.record(z.string(), z.unknown()).superRefine(
    (value, context) => {
        if (containsSecretLikeKey(value)) {
            context.addIssue({
                code: 'custom',
                message: 'Metadata must not contain secret-like fields.',
            });
        }
        let serialized: string;
        try {
            serialized = JSON.stringify(value);
        } catch {
            context.addIssue({
                code: 'custom',
                message: 'Metadata must be JSON-serializable.',
            });
            return;
        }
        if (Buffer.byteLength(serialized, 'utf8') > 32 * 1024) {
            context.addIssue({
                code: 'custom',
                message: 'Metadata must be 32 KiB or smaller.',
            });
        }
    }
);

const optionalUrlSchema = z.string().url().max(2048).nullable().optional();

export const saveProviderConnectionSchema = z.object({
    provider: providerSchema,
    providerAccountId: z.string().trim().min(1).max(500),
    displayName: z.string().trim().min(1).max(500),
    username: z.string().trim().min(1).max(500).nullable().optional(),
    accountType: z.string().trim().min(1).max(160).nullable().optional(),
    profileUrl: optionalUrlSchema,
    metadata: safeMetadataSchema.optional().default({}),
    grants: z.array(z.object({
        type: z.enum(['scope', 'capability']),
        name: z.string().trim().min(1).max(500),
        status: z.enum(['granted', 'declined', 'expired', 'revoked', 'unknown']),
        grantedAt: isoDateSchema.nullable().optional(),
        expiresAt: isoDateSchema.nullable().optional(),
        lastVerifiedAt: isoDateSchema.nullable().optional(),
        metadata: safeMetadataSchema.optional().default({}),
    }).strict()).max(200),
    credentials: z.object({
        accessToken: z.string().min(1).max(16_384),
        refreshToken: z.string().min(1).max(16_384).nullable().optional(),
        tokenType: z.string().trim().min(1).max(160).nullable().optional(),
        accessTokenExpiresAt: isoDateSchema.nullable().optional(),
        refreshTokenExpiresAt: isoDateSchema.nullable().optional(),
        issuedAt: isoDateSchema.nullable().optional(),
    }).strict(),
    requestId: requestIdSchema,
}).strict().superRefine((value, context) => {
    const seen = new Set<string>();
    for (const [index, grant] of value.grants.entries()) {
        const identity = `${grant.type}\u0000${grant.name}`;
        if (seen.has(identity)) {
            context.addIssue({
                code: 'custom',
                path: ['grants', index],
                message: 'Provider grants must be unique by type and name.',
            });
        }
        seen.add(identity);
    }
});

function isSafeRedirectUri(value: string): boolean {
    const parsed = new URL(value);
    return (
        parsed.protocol === 'https:'
        || (
            parsed.protocol === 'http:'
            && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
        )
    );
}

export const createOAuthStateSchema = z.object({
    provider: providerSchema,
    redirectUri: z.string().url().max(2048).refine(
        isSafeRedirectUri,
        'OAuth redirect URI must use HTTPS, except for localhost development.'
    ),
    returnTo: z.string()
        .max(2048)
        .regex(/^\/(?!\/)/, 'returnTo must be an application-relative path.')
        .nullable()
        .optional(),
    requestBinding: z.string().min(16).max(2048).optional(),
    ttlSeconds: z.number().int().min(60).max(900).optional().default(600),
}).strict();

export const consumeOAuthStateSchema = z.object({
    provider: providerSchema,
    state: z.string().min(32).max(256),
    nonce: z.string().min(32).max(256).optional(),
    requestBinding: z.string().min(16).max(2048).optional(),
    requestId: requestIdSchema,
}).strict();

export const connectionIdSchema = uuidSchema;

export const revokeProviderConnectionSchema = z.object({
    connectionId: uuidSchema,
    requestId: requestIdSchema,
}).strict();

export const recordWebhookSchema = z.object({
    provider: providerSchema,
    providerEventId: z.string().trim().min(1).max(1000),
    eventType: z.string().trim().min(1).max(500),
    rawBody: z.union([
        z.string().max(1024 * 1024),
        z.instanceof(Uint8Array).refine(
            (value) => value.byteLength <= 1024 * 1024,
            'Webhook body must be 1 MiB or smaller.'
        ),
    ]),
    signatureVerifiedAt: isoDateSchema,
    connectionId: uuidSchema.nullable().optional(),
}).strict();

export const registerInboundEventSchema = z.object({
    webhookEventId: uuidSchema,
    connectionId: uuidSchema,
    provider: providerSchema,
    providerEventId: z.string().trim().min(1).max(1000),
    recipientScopedId: z.string().trim().min(1).max(1000),
    inboundAt: isoDateSchema,
}).strict();

export const consumeInboundReplySchema = z.object({
    provider: providerSchema,
    providerEventId: z.string().trim().min(1).max(1000),
    recipientScopedId: z.string().trim().min(1).max(1000),
    approvalId: z.string().min(1).max(160),
    expectedContentHash: contentHashSchema,
    now: isoDateSchema.optional(),
    requestId: requestIdSchema,
}).strict();

const safeJobPayloadSchema = safeMetadataSchema;

export const createProviderJobSchema = z.object({
    provider: providerSchema,
    connectionId: uuidSchema,
    jobType: z.enum([
        'token_refresh',
        'account_sync',
        'insights_sync',
        'content_publish',
        'social_reply',
        'reconcile_unknown',
    ]),
    approvalId: z.string().min(1).max(160).nullable().optional(),
    approvalContentHash: contentHashSchema.nullable().optional(),
    inboundEventId: uuidSchema.nullable().optional(),
    reconciliationOfJobId: uuidSchema.nullable().optional(),
    idempotencyKey: z.string().min(1).max(500),
    requestPayload: safeJobPayloadSchema.optional().default({}),
    maxAttempts: z.number().int().min(1).max(10).optional().default(3),
    requestId: requestIdSchema,
}).strict().superRefine((value, context) => {
    const external = value.jobType === 'content_publish' || value.jobType === 'social_reply';
    if (external && (!value.approvalId || !value.approvalContentHash)) {
        context.addIssue({
            code: 'custom',
            message: 'External provider jobs require an approval ID and exact content hash.',
        });
    }
    if (!external && (value.approvalId || value.approvalContentHash)) {
        context.addIssue({
            code: 'custom',
            message: 'Non-external provider jobs must not carry approval fields.',
        });
    }
    if (value.jobType === 'social_reply' && !value.inboundEventId) {
        context.addIssue({
            code: 'custom',
            message: 'Social reply jobs require a claimed inbound event.',
        });
    }
    if (value.jobType !== 'social_reply' && value.inboundEventId) {
        context.addIssue({
            code: 'custom',
            message: 'Only social reply jobs may reference an inbound event.',
        });
    }
    if (value.jobType === 'reconcile_unknown' && !value.reconciliationOfJobId) {
        context.addIssue({
            code: 'custom',
            message: 'Reconciliation jobs require the original UNKNOWN job ID.',
        });
    }
    if (value.jobType !== 'reconcile_unknown' && value.reconciliationOfJobId) {
        context.addIssue({
            code: 'custom',
            message: 'Only reconciliation jobs may reference an UNKNOWN job.',
        });
    }
});

export const claimProviderExecutionSchema = z.object({
    jobId: uuidSchema,
    workerId: z.string().trim().min(1).max(255),
    expectedContentHash: contentHashSchema,
    requestId: requestIdSchema,
}).strict();

export const quarantineStaleProviderExecutionsSchema = z.object({
    limit: z.number().int().min(1).max(100).optional().default(25),
    requestId: requestIdSchema,
}).strict();

export const providerJobOutcomeSchema = z.discriminatedUnion('status', [
    z.object({
        jobId: uuidSchema,
        status: z.literal('SUCCEEDED'),
        remoteReference: z.string().trim().min(1).max(2000),
        outcome: safeMetadataSchema.optional().default({}),
        requestId: requestIdSchema,
    }).strict(),
    z.object({
        jobId: uuidSchema,
        status: z.literal('FAILED'),
        failureReason: z.string().trim().min(1).max(10_000),
        outcome: safeMetadataSchema.optional().default({}),
        requestId: requestIdSchema,
    }).strict(),
    z.object({
        jobId: uuidSchema,
        status: z.literal('UNKNOWN'),
        failureReason: z.string().trim().min(1).max(10_000),
        outcome: safeMetadataSchema.optional().default({}),
        requestId: requestIdSchema,
    }).strict(),
]);

export function parseProviderStorageInput<T>(
    schema: z.ZodType<T>,
    input: unknown
): T {
    const parsed = schema.safeParse(input);
    if (parsed.success) return parsed.data;

    throw new ProviderStorageError(
        'PROVIDER_STORAGE_INVALID_INPUT',
        parsed.error.issues[0]?.message ?? 'Invalid provider-storage input.',
        400
    );
}
