import { z } from 'zod';

export const PROVIDER_IDS = ['meta', 'tiktok'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export const providerIdSchema = z.enum(PROVIDER_IDS);
export const contentHashSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);

export const PROVIDER_CAPABILITIES = [
    'owned-analytics',
    'reel-container',
    'reel-publish',
    'inbound-reply',
    'creator-info',
    'draft-init',
    'direct-post-init',
    'post-status',
] as const;
export type ProviderCapability = (typeof PROVIDER_CAPABILITIES)[number];

export interface ProviderConnectionSummary {
    provider: ProviderId;
    status: 'connected' | 'expired' | 'revoked' | 'error' | 'not-connected';
    accountId: string | null;
    accountLabel: string | null;
    grantedScopes: string[];
    capabilities: ProviderCapability[];
    connectedAt: string | null;
    expiresAt: string | null;
    lastVerifiedAt: string | null;
    tokenPresent: boolean;
}

export interface ProviderCredentials {
    connectionId: string;
    provider: ProviderId;
    accountId: string;
    accountLabel: string | null;
    accessToken: string;
    refreshToken: string | null;
    grantedScopes: string[];
    expiresAt: string | null;
}

const httpsUrlSchema = z.string().url().refine(
    (value) => new URL(value).protocol === 'https:',
    'Media URL must use HTTPS.'
);

const idSchema = z.string().trim().min(1).max(256);

export const metaReelContainerSchema = z.object({
    operation: z.literal('meta.reel.create-container'),
    videoUrl: httpsUrlSchema,
    caption: z.string().max(2200),
    shareToFeed: z.boolean(),
}).strict();

export const metaReelPublishSchema = z.object({
    operation: z.literal('meta.reel.publish'),
    creationId: idSchema,
}).strict();

export const metaInboundReplySchema = z.object({
    operation: z.literal('meta.inbound.reply'),
    recipientScopedId: idSchema,
    providerEventId: idSchema,
    text: z.string().trim().min(1).max(1000),
}).strict();

const tiktokSourceSchema = z.object({
    source: z.literal('PULL_FROM_URL'),
    videoUrl: httpsUrlSchema,
}).strict();

export const tiktokDraftInitSchema = z.object({
    operation: z.literal('tiktok.draft.init'),
    source: tiktokSourceSchema,
    explicitConsent: z.literal(true),
}).strict();

export const tiktokDirectPostInitSchema = z.object({
    operation: z.literal('tiktok.direct-post.init'),
    source: tiktokSourceSchema,
    title: z.string().max(2200),
    privacyLevel: z.enum([
        'PUBLIC_TO_EVERYONE',
        'MUTUAL_FOLLOW_FRIENDS',
        'FOLLOWER_OF_CREATOR',
        'SELF_ONLY',
    ]),
    allowComment: z.boolean(),
    allowDuet: z.boolean(),
    allowStitch: z.boolean(),
    brandContent: z.boolean(),
    brandOrganic: z.boolean(),
    isAiGenerated: z.boolean(),
    explicitConsent: z.literal(true),
    musicUsageConfirmed: z.literal(true),
}).strict();

export const providerActionPayloadSchema = z.discriminatedUnion('operation', [
    metaReelContainerSchema,
    metaReelPublishSchema,
    metaInboundReplySchema,
    tiktokDraftInitSchema,
    tiktokDirectPostInitSchema,
]);
export type ProviderActionPayload = z.infer<typeof providerActionPayloadSchema>;

export const providerExecutionInputSchema = z.discriminatedUnion('jobType', [
    z.object({
        approvalId: z.string().trim().min(1).max(160),
        expectedContentHash: contentHashSchema,
        jobType: z.literal('content_publish'),
    }).strict(),
    z.object({
        approvalId: z.string().trim().min(1).max(160),
        expectedContentHash: contentHashSchema,
        jobType: z.literal('social_reply'),
        providerEventId: z.string().trim().min(1).max(1000),
        recipientScopedId: z.string().trim().min(1).max(1000),
    }).strict(),
]);

export interface ClaimedProviderExecution {
    jobId: string;
    idempotencyKey: string;
    connectionId: string;
    outboxId: string;
    provider: ProviderId;
    jobType: string;
    approval: {
        id: string;
        actionType: 'social-reply' | 'social-publish' | 'settings-change';
        channel: 'instagram' | 'tiktok' | 'internal';
        contentHash: string;
        targetLabel: string;
        payloadSummary: string;
        payload: unknown;
    };
}

export interface ProviderActionResult {
    providerReference: string;
    detail: Record<string, string | number | boolean | null>;
}

export interface OwnedAnalyticsSnapshot {
    provider: ProviderId;
    accountId: string;
    observedAt: string;
    account: Record<string, string | number | boolean | null>;
    content: Array<Record<string, string | number | boolean | null>>;
    nextCursor: string | null;
}
