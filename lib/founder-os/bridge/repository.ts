import { query, withTransaction } from '@/lib/db';
import type { ApprovalAction, ApprovalStatus } from '../contracts';
import { redactBridgeAuditValue, type RedactedAuditValue } from './redaction';

interface ApprovalSummaryRow {
    id: string;
    action_type: ApprovalAction['actionType'];
    channel: ApprovalAction['channel'];
    status: ApprovalStatus;
    target_label: string;
    payload_summary: string;
    content_hash: string;
    created_at: Date | string;
    updated_at: Date | string;
    approved_at: Date | string | null;
    executed_at: Date | string | null;
    provider_reference: string | null;
    failure_reason: string | null;
    is_demo: boolean;
}

export interface BridgeApprovalSummary extends ApprovalAction {
    isDemo: boolean;
}

export interface BridgeAuditEntry {
    id: string;
    actorType: string;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    requestId: string;
    metadata: RedactedAuditValue;
    createdAt: string;
}

function toIso(value: Date | string | null): string | null {
    if (value === null) return null;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapApproval(row: ApprovalSummaryRow): BridgeApprovalSummary {
    return {
        id: row.id,
        actionType: row.action_type,
        channel: row.channel,
        status: row.status,
        targetLabel: row.target_label,
        payloadSummary: row.payload_summary,
        contentHash: row.content_hash,
        createdAt: toIso(row.created_at) as string,
        updatedAt: toIso(row.updated_at) as string,
        approvedAt: toIso(row.approved_at),
        executedAt: toIso(row.executed_at),
        providerReference: row.provider_reference,
        failureReason: row.failure_reason,
        isDemo: row.is_demo,
    };
}

const APPROVAL_SUMMARY_COLUMNS = `
    id,
    action_type,
    channel,
    status,
    target_label,
    payload_summary,
    content_hash,
    created_at,
    updated_at,
    approved_at,
    executed_at,
    provider_reference,
    failure_reason,
    is_demo
`;

export async function listBridgeApprovals(input: {
    status?: ApprovalStatus;
    limit: number;
}): Promise<BridgeApprovalSummary[]> {
    const values: Array<string | number> = [];
    const statusClause = input.status
        ? `where status = $${values.push(input.status)}`
        : '';
    values.push(input.limit);
    const result = await query(
        `select ${APPROVAL_SUMMARY_COLUMNS}
         from founder_internal.approval_actions
         ${statusClause}
         order by created_at desc, id desc
         limit $${values.length}`,
        values
    );
    return (result.rows as ApprovalSummaryRow[]).map(mapApproval);
}

export async function getBridgeApproval(
    approvalId: string
): Promise<BridgeApprovalSummary | null> {
    const result = await query(
        `select ${APPROVAL_SUMMARY_COLUMNS}
         from founder_internal.approval_actions
         where id = $1
         limit 1`,
        [approvalId]
    );
    const row = result.rows[0] as ApprovalSummaryRow | undefined;
    return row ? mapApproval(row) : null;
}

export async function consumePersistentBridgeRateLimit(input: {
    requestId: string;
    principalId: string;
    rateClass: 'read' | 'draft' | 'request-review';
    operation: string;
    method: string;
    limit: number;
}): Promise<{ allowed: boolean; count: number; limit: number }> {
    return withTransaction(async (client) => {
        await client.query(
            `delete from founder_internal.bridge_rate_limits
             where window_start < date_trunc('minute', clock_timestamp()) - interval '2 days'`
        );
        const result = await client.query<{ request_count: number }>(
            `insert into founder_internal.bridge_rate_limits as current_window (
                principal_id,
                rate_class,
                window_start,
                request_count
             )
             values ($1, $2, date_trunc('minute', clock_timestamp()), 1)
             on conflict (principal_id, rate_class, window_start)
             do update set
                request_count = current_window.request_count + 1,
                updated_at = clock_timestamp()
             where current_window.request_count < $3
             returning request_count`,
            [input.principalId, input.rateClass, input.limit]
        );
        const count = result.rows[0]?.request_count ?? input.limit;
        const allowed = result.rowCount === 1;
        await client.query(
            `insert into founder_internal.audit_log (
                actor_type,
                actor_id,
                action,
                entity_type,
                entity_id,
                request_id,
                metadata
             )
             values ('system', $1, $2, 'bridge_operation', $3, $4, $5::jsonb)`,
            [
                `bridge:${input.principalId}`,
                allowed ? 'bridge.request_authorized' : 'bridge.rate_limited',
                input.operation,
                input.requestId,
                JSON.stringify({
                    method: input.method,
                    scope: input.rateClass,
                    rateLimitCount: count,
                    rateLimit: input.limit,
                    requestBodyLogged: false,
                    authorizationLogged: false,
                }),
            ]
        );
        return { allowed, count, limit: input.limit };
    });
}

export async function recordBridgeRequestOutcome(input: {
    requestId: string;
    principalId: string;
    operation: string;
    statusCode: number;
}): Promise<void> {
    await query(
        `insert into founder_internal.audit_log (
            actor_type,
            actor_id,
            action,
            entity_type,
            entity_id,
            request_id,
            metadata
         )
         values ('system', $1, 'bridge.request_completed', 'bridge_operation', $2, $3, $4::jsonb)`,
        [
            `bridge:${input.principalId}`,
            input.operation,
            input.requestId,
            JSON.stringify({
                statusCode: input.statusCode,
                outcome: input.statusCode < 400 ? 'succeeded' : 'rejected',
                responseBodyLogged: false,
            }),
        ]
    );
}

export async function listBridgeAudit(input: {
    limit: number;
    beforeId?: string;
    entityType?: string;
}): Promise<{ entries: BridgeAuditEntry[]; nextCursor: string | null }> {
    const values: Array<string | number> = [];
    const clauses: string[] = [];
    if (input.beforeId) {
        clauses.push(`id < $${values.push(input.beforeId)}::bigint`);
    }
    if (input.entityType) {
        clauses.push(`entity_type = $${values.push(input.entityType)}`);
    }
    values.push(input.limit + 1);
    const result = await query(
        `select
            id::text,
            actor_type,
            actor_id,
            action,
            entity_type,
            entity_id,
            request_id,
            metadata,
            created_at
         from founder_internal.audit_log
         ${clauses.length > 0 ? `where ${clauses.join(' and ')}` : ''}
         order by id desc
         limit $${values.length}`,
        values
    );
    const rows = result.rows.slice(0, input.limit) as Array<{
        id: string;
        actor_type: string;
        actor_id: string | null;
        action: string;
        entity_type: string;
        entity_id: string | null;
        request_id: string;
        metadata: unknown;
        created_at: Date | string;
    }>;
    return {
        entries: rows.map((row) => ({
            id: row.id,
            actorType: row.actor_type,
            actorId: row.actor_id,
            action: row.action,
            entityType: row.entity_type,
            entityId: row.entity_id,
            requestId: row.request_id,
            metadata: redactBridgeAuditValue(row.metadata),
            createdAt: toIso(row.created_at) as string,
        })),
        nextCursor: result.rows.length > input.limit
            ? rows.at(-1)?.id ?? null
            : null,
    };
}
