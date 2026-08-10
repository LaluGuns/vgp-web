import { z } from 'zod';
import { APPROVAL_STATUSES } from '../contracts';
import { customGptProspectInputSchema } from '../leads/action-validation';
import {
    customGptDraftInputSchema,
    founderOsEntityIdSchema,
} from '../validation';
import { providerIdSchema } from '../providers/contracts';
import {
    BRIDGE_PRINCIPAL_ID,
    BRIDGE_SCOPES,
    type BridgeScope,
} from './auth';

export { BRIDGE_PRINCIPAL_ID, BRIDGE_SCOPES } from './auth';
export type { BridgeScope } from './auth';

export const FOUNDER_OS_BRIDGE_VERSION = '2026-08-10.1' as const;

export const bridgeDraftInputSchema = customGptDraftInputSchema;
export const bridgeProspectInputSchema = customGptProspectInputSchema;

export const bridgeRequestReviewInputSchema = z.object({
    expectedContentHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
}).strict();

export const bridgeIdempotencyKeySchema = z.string()
    .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/);

export const bridgeApprovalIdSchema = founderOsEntityIdSchema;

export const bridgeApprovalListQuerySchema = z.object({
    status: z.enum(APPROVAL_STATUSES).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict();

export const bridgeProspectSearchQuerySchema = z.object({
    query: z.string().trim().max(200).default(''),
    segment: z.enum(['rapper', 'game-developer', 'content-creator']).optional(),
    market: z.enum(['en-US', 'ja-JP', 'de-DE']).optional(),
    platform: z.enum(['instagram', 'tiktok', 'youtube', 'website', 'other']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict();

export const bridgeCatalogQuerySchema = z.object({
    query: z.string().trim().max(200).default(''),
    limit: z.coerce.number().int().min(1).max(20).default(10),
}).strict();

export const bridgeAuditQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(25),
    beforeId: z.string().regex(/^\d+$/).optional(),
    entityType: z.string().trim().min(1).max(160).optional(),
}).strict();

export const bridgeProviderIdSchema = providerIdSchema;

export interface BridgeRequestContext {
    requestId: string;
    principalId: typeof BRIDGE_PRINCIPAL_ID;
    scopes: readonly BridgeScope[];
    operation: string;
}
