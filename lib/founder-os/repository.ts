import type { PoolClient } from 'pg';
import pool, { withTransaction } from '@/lib/db';
import {
    FOUNDER_OS_CONTRACT_VERSION,
    type AgentCard,
    type ApprovalAction,
    type ApprovalStatus,
    type FounderDashboardSnapshot,
    type FounderSettings,
    type Prospect,
    type ProspectScoreBreakdown,
    type SourceEvidence,
} from './contracts';
import type { DemoApprovalSeed, FounderOsDemoSeed } from './demo-seed';
import {
    FounderOsError,
    isMissingFounderOsSchemaError,
} from './errors';
import { founderSettingsInputSchema, type JsonValue } from './validation';

type JsonObject = Record<string, JsonValue>;

interface WorkspaceStateRow {
    mode: 'demo' | 'live';
    demo_dataset_version: string | null;
    updated_at: Date | string;
}

interface SettingsRow {
    contract_version: string;
    markets: string[];
    segment_priority: string[];
    score_threshold: number;
    require_approval_for_every_external_action: boolean;
    allow_cold_social_dm: boolean;
    allow_unverified_contacts: boolean;
    trend_sources: FounderSettings['trendSources'];
    integrations: FounderSettings['integrations'];
    operating_profile: FounderSettings['operatingProfile'];
}

interface ApprovalRow {
    id: string;
    prospect_id: string | null;
    action_type: ApprovalAction['actionType'];
    channel: ApprovalAction['channel'];
    status: ApprovalStatus;
    target_label: string;
    payload_summary: string;
    payload: JsonObject;
    content_hash: string;
    created_at: Date | string;
    updated_at: Date | string;
    approved_at: Date | string | null;
    executed_at: Date | string | null;
    provider_reference: string | null;
    failure_reason: string | null;
    is_demo: boolean;
}

interface OutboxRow {
    id: string;
    approval_id: string;
    idempotency_key: string;
    status: 'held' | 'processing' | 'succeeded' | 'failed' | 'unknown' | 'superseded';
    content_hash: string;
    attempt_count: number;
}

export interface StoredApproval {
    action: ApprovalAction;
    prospectId: string | null;
    payload: JsonObject;
    isDemo: boolean;
}

export interface GptDraftInsert {
    id: string;
    prospectId: string | null;
    actionType: ApprovalAction['actionType'];
    channel: ApprovalAction['channel'];
    targetLabel: string;
    payloadSummary: string;
    payload: JsonObject;
    isDemo: boolean;
}

export interface ScoutedLeadInsert {
    prospect: Prospect;
    evidence: SourceEvidence[];
    isDemo: boolean;
}

export interface ProspectDeliveryContact {
    email: string;
    permission: Prospect['contactPermission'];
    suppressed: boolean;
}

export interface FounderOsProvisioningStatus {
    provisioned: boolean;
    mode: 'demo' | 'live' | null;
    demoDatasetVersion: string | null;
    lastBootstrapAt: string | null;
    counts: {
        agents: number;
        prospects: number;
        approvals: number;
        evidence: number;
    };
}

export interface AuditEntry {
    actorType: 'founder' | 'system' | 'bootstrap';
    actorId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    requestId: string;
    beforeState?: unknown;
    afterState?: unknown;
    metadata?: Record<string, unknown>;
}

function toIso(value: Date | string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString();

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new FounderOsError(
            'FOUNDER_OS_INVALID_DATA',
            'Founder OS contains an invalid timestamp.',
            500
        );
    }
    return parsed.toISOString();
}

function mapSettingsRow(row: SettingsRow): FounderSettings {
    const parsed = founderSettingsInputSchema.safeParse({
        contractVersion: row.contract_version,
        markets: row.markets,
        segmentPriority: row.segment_priority,
        scoreThreshold: row.score_threshold,
        requireApprovalForEveryExternalAction:
            row.require_approval_for_every_external_action,
        allowColdSocialDm: row.allow_cold_social_dm,
        allowUnverifiedContacts: row.allow_unverified_contacts,
        trendSources: row.trend_sources,
        integrations: row.integrations,
        operatingProfile: row.operating_profile,
    });

    if (!parsed.success) {
        throw new FounderOsError(
            'FOUNDER_OS_INVALID_DATA',
            'Stored Founder OS settings do not match the active contract.',
            500
        );
    }

    return parsed.data;
}

function mapEvidenceRow(row: Record<string, unknown>): SourceEvidence {
    return {
        id: String(row.id),
        label: String(row.label),
        url: row.url === null || row.url === undefined ? null : String(row.url),
        sourceType: row.source_type as SourceEvidence['sourceType'],
        observedAt: toIso(row.observed_at as Date | string | null),
        freshness: row.freshness as SourceEvidence['freshness'],
        ...(row.note === null || row.note === undefined
            ? {}
            : { note: String(row.note) }),
    };
}

function mapApprovalRow(row: ApprovalRow): StoredApproval {
    return {
        action: {
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
        },
        prospectId: row.prospect_id,
        payload: row.payload,
        isDemo: row.is_demo,
    };
}

function makeNotProvisionedError(): FounderOsError {
    return new FounderOsError(
        'FOUNDER_OS_NOT_PROVISIONED',
        'Founder OS database schema has not been provisioned.',
        503
    );
}

export async function getFounderOsProvisioningStatus(): Promise<FounderOsProvisioningStatus> {
    try {
        const registryResult = await pool.query<{ table_name: string | null }>(
            `select to_regclass('founder_internal.settings')::text as table_name`
        );

        if (!registryResult.rows[0]?.table_name) {
            return {
                provisioned: false,
                mode: null,
                demoDatasetVersion: null,
                lastBootstrapAt: null,
                counts: { agents: 0, prospects: 0, approvals: 0, evidence: 0 },
            };
        }

        const result = await pool.query<{
            mode: 'demo' | 'live';
            demo_dataset_version: string | null;
            last_bootstrap_at: Date | string | null;
            agents: number;
            prospects: number;
            approvals: number;
            evidence: number;
        }>(
            `select
                ws.mode,
                ws.demo_dataset_version,
                (
                    select max(bootstrapped_at)
                    from founder_internal.demo_bootstrap_runs
                ) as last_bootstrap_at,
                (select count(*)::int from founder_internal.agent_cards) as agents,
                (select count(*)::int from founder_internal.prospects) as prospects,
                (select count(*)::int from founder_internal.approval_actions) as approvals,
                (select count(*)::int from founder_internal.source_evidence) as evidence
             from founder_internal.workspace_state ws
             where ws.singleton = true`
        );

        const row = result.rows[0];
        if (!row) throw makeNotProvisionedError();

        return {
            provisioned: true,
            mode: row.mode,
            demoDatasetVersion: row.demo_dataset_version,
            lastBootstrapAt: toIso(row.last_bootstrap_at),
            counts: {
                agents: row.agents,
                prospects: row.prospects,
                approvals: row.approvals,
                evidence: row.evidence,
            },
        };
    } catch (error) {
        if (isMissingFounderOsSchemaError(error)) {
            return {
                provisioned: false,
                mode: null,
                demoDatasetVersion: null,
                lastBootstrapAt: null,
                counts: { agents: 0, prospects: 0, approvals: 0, evidence: 0 },
            };
        }
        throw error;
    }
}

export async function readFounderOsSnapshot(): Promise<FounderDashboardSnapshot> {
    const status = await getFounderOsProvisioningStatus();
    if (!status.provisioned) throw makeNotProvisionedError();

    try {
        return await withTransaction(async (client) => {
            await client.query(
                'set transaction isolation level repeatable read read only'
            );

            const workspaceResult = await client.query<WorkspaceStateRow>(
                `select mode, demo_dataset_version, updated_at
                 from founder_internal.workspace_state
                 where singleton = true`
            );
            const settingsResult = await client.query<SettingsRow>(
                `select
                    contract_version,
                    markets,
                    segment_priority,
                    score_threshold,
                    require_approval_for_every_external_action,
                    allow_cold_social_dm,
                    allow_unverified_contacts,
                    trend_sources,
                    integrations,
                    operating_profile
                 from founder_internal.settings
                 where settings_key = 'default'`
            );
            const agentsResult = await client.query<Record<string, unknown>>(
                `select
                    id,
                    name,
                    role,
                    status,
                    current_task,
                    last_run_at,
                    evidence_count
                 from founder_internal.agent_cards
                 order by case id
                    when 'chief-of-staff' then 1
                    when 'lead-scout' then 2
                    when 'growth-analyst' then 3
                    when 'content-strategist' then 4
                    when 'outreach-operator' then 5
                    else 99
                 end`
            );
            const prospectsResult = await client.query<Record<string, unknown>>(
                `select
                    id,
                    display_name,
                    handle,
                    segment,
                    market,
                    platform,
                    profile_url,
                    business_email,
                    contact_permission,
                    score,
                    score_breakdown,
                    matched_beat_ids,
                    signals,
                    gaps,
                    last_observed_at
                 from founder_internal.prospects
                 order by score desc, last_observed_at desc nulls last, id`
            );
            const linkedEvidenceResult = await client.query<Record<string, unknown>>(
                `select
                    pe.prospect_id,
                    pe.position,
                    e.id,
                    e.label,
                    e.url,
                    e.source_type,
                    e.observed_at,
                    e.freshness,
                    e.note
                 from founder_internal.prospect_evidence pe
                 join founder_internal.source_evidence e on e.id = pe.evidence_id
                 order by pe.prospect_id, pe.position, e.id`
            );
            const globalEvidenceResult = await client.query<Record<string, unknown>>(
                `select
                    e.id,
                    e.label,
                    e.url,
                    e.source_type,
                    e.observed_at,
                    e.freshness,
                    e.note
                 from founder_internal.source_evidence e
                 where not exists (
                    select 1
                    from founder_internal.prospect_evidence pe
                    where pe.evidence_id = e.id
                 )
                 order by e.observed_at desc nulls last, e.id`
            );
            const approvalsResult = await client.query<ApprovalRow>(
                `select
                    id,
                    prospect_id,
                    action_type,
                    channel,
                    status,
                    target_label,
                    payload_summary,
                    payload,
                    content_hash,
                    created_at,
                    updated_at,
                    approved_at,
                    executed_at,
                    provider_reference,
                    failure_reason,
                    is_demo
                 from founder_internal.approval_actions
                 order by updated_at desc, id`
            );
            const gapsResult = await client.query<{ description: string }>(
                `select description
                 from founder_internal.data_gaps
                 order by position, id`
            );

            const workspace = workspaceResult.rows[0];
            const settingsRow = settingsResult.rows[0];
            if (!workspace || !settingsRow) {
                throw makeNotProvisionedError();
            }

            const evidenceByProspect = new Map<string, SourceEvidence[]>();
            for (const row of linkedEvidenceResult.rows) {
                const prospectId = String(row.prospect_id);
                const existing = evidenceByProspect.get(prospectId) ?? [];
                existing.push(mapEvidenceRow(row));
                evidenceByProspect.set(prospectId, existing);
            }

            const agents: AgentCard[] = agentsResult.rows.map((row) => ({
                id: row.id as AgentCard['id'],
                name: String(row.name),
                role: String(row.role),
                status: row.status as AgentCard['status'],
                currentTask: String(row.current_task),
                lastRunAt: toIso(row.last_run_at as Date | string | null),
                evidenceCount: Number(row.evidence_count),
            }));

            const prospects: Prospect[] = prospectsResult.rows.map((row) => ({
                id: String(row.id),
                displayName: String(row.display_name),
                handle:
                    row.handle === null || row.handle === undefined
                        ? null
                        : String(row.handle),
                segment: row.segment as Prospect['segment'],
                market: row.market as Prospect['market'],
                platform: row.platform as Prospect['platform'],
                profileUrl:
                    row.profile_url === null || row.profile_url === undefined
                        ? null
                        : String(row.profile_url),
                businessEmail:
                    row.business_email === null || row.business_email === undefined
                        ? null
                        : String(row.business_email),
                contactPermission:
                    row.contact_permission as Prospect['contactPermission'],
                score: Number(row.score),
                scoreBreakdown: row.score_breakdown as ProspectScoreBreakdown,
                matchedBeatIds: Array.isArray(row.matched_beat_ids)
                    ? row.matched_beat_ids.map(String)
                    : [],
                signals: Array.isArray(row.signals) ? row.signals.map(String) : [],
                gaps: Array.isArray(row.gaps) ? row.gaps.map(String) : [],
                evidence: evidenceByProspect.get(String(row.id)) ?? [],
                lastObservedAt: toIso(
                    row.last_observed_at as Date | string | null
                ),
            }));

            return {
                contractVersion: FOUNDER_OS_CONTRACT_VERSION,
                generatedAt: new Date().toISOString(),
                mode: workspace.mode,
                agents,
                prospects,
                approvals: approvalsResult.rows.map(
                    (row) => mapApprovalRow(row).action
                ),
                settings: mapSettingsRow(settingsRow),
                evidence: globalEvidenceResult.rows.map(mapEvidenceRow),
                dataGaps: gapsResult.rows.map((row) => row.description),
            };
        });
    } catch (error) {
        if (isMissingFounderOsSchemaError(error)) throw makeNotProvisionedError();
        throw error;
    }
}

export class FounderOsRepository {
    constructor(private readonly client: PoolClient) {}

    async acquireBootstrapLock(): Promise<void> {
        await this.client.query(
            `select pg_advisory_xact_lock(hashtext($1)::bigint)`,
            ['founder_internal.bootstrap_demo']
        );
    }

    async getWorkspaceStateForUpdate(): Promise<WorkspaceStateRow> {
        const result = await this.client.query<WorkspaceStateRow>(
            `select mode, demo_dataset_version, updated_at
             from founder_internal.workspace_state
             where singleton = true
             for update`
        );
        const row = result.rows[0];
        if (!row) throw makeNotProvisionedError();
        return row;
    }

    async hasNonDemoData(): Promise<boolean> {
        const result = await this.client.query<{ has_live_data: boolean }>(
            `select (
                exists (
                    select 1 from founder_internal.agent_cards where not is_demo
                )
                or exists (
                    select 1 from founder_internal.source_evidence where not is_demo
                )
                or exists (
                    select 1 from founder_internal.prospects where not is_demo
                )
                or exists (
                    select 1 from founder_internal.approval_actions where not is_demo
                )
                or exists (
                    select 1 from founder_internal.data_gaps where not is_demo
                )
             ) as has_live_data`
        );
        return result.rows[0]?.has_live_data ?? false;
    }

    async hasDemoBootstrapRun(datasetVersion: string): Promise<boolean> {
        const result = await this.client.query<{ exists: boolean }>(
            `select exists (
                select 1
                from founder_internal.demo_bootstrap_runs
                where dataset_version = $1
             ) as exists`,
            [datasetVersion]
        );
        return result.rows[0]?.exists ?? false;
    }

    async insertDemoSeed(
        seed: FounderOsDemoSeed,
        datasetVersion: string,
        seedHash: string
    ): Promise<Record<string, number>> {
        for (const agent of seed.agents) {
            await this.client.query(
                `insert into founder_internal.agent_cards (
                    id,
                    name,
                    role,
                    status,
                    current_task,
                    last_run_at,
                    evidence_count,
                    is_demo
                 )
                 values ($1, $2, $3, $4, $5, $6, $7, true)
                 on conflict (id) do nothing`,
                [
                    agent.id,
                    agent.name,
                    agent.role,
                    agent.status,
                    agent.currentTask,
                    agent.lastRunAt,
                    agent.evidenceCount,
                ]
            );
        }

        const allEvidence = [
            ...seed.globalEvidence,
            ...seed.prospects.flatMap((prospect) => prospect.evidence),
        ];
        for (const evidence of allEvidence) {
            await this.client.query(
                `insert into founder_internal.source_evidence (
                    id,
                    label,
                    url,
                    source_type,
                    observed_at,
                    freshness,
                    note,
                    is_demo
                 )
                 values ($1, $2, $3, $4, $5, $6, $7, true)
                 on conflict (id) do nothing`,
                [
                    evidence.id,
                    evidence.label,
                    evidence.url,
                    evidence.sourceType,
                    evidence.observedAt,
                    evidence.freshness,
                    evidence.note ?? null,
                ]
            );
        }

        for (const prospect of seed.prospects) {
            await this.client.query(
                `insert into founder_internal.prospects (
                    id,
                    display_name,
                    handle,
                    segment,
                    market,
                    platform,
                    profile_url,
                    business_email,
                    contact_permission,
                    score,
                    score_breakdown,
                    matched_beat_ids,
                    signals,
                    gaps,
                    last_observed_at,
                    is_demo
                 )
                 values (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13, $14, $15, true
                 )
                 on conflict (id) do nothing`,
                [
                    prospect.id,
                    prospect.displayName,
                    prospect.handle,
                    prospect.segment,
                    prospect.market,
                    prospect.platform,
                    prospect.profileUrl,
                    prospect.businessEmail,
                    prospect.contactPermission,
                    prospect.score,
                    prospect.scoreBreakdown,
                    prospect.matchedBeatIds,
                    prospect.signals,
                    prospect.gaps,
                    prospect.lastObservedAt,
                ]
            );

            for (const [position, evidence] of prospect.evidence.entries()) {
                await this.client.query(
                    `insert into founder_internal.prospect_evidence (
                        prospect_id,
                        evidence_id,
                        position
                     )
                     values ($1, $2, $3)
                     on conflict (prospect_id, evidence_id) do nothing`,
                    [prospect.id, evidence.id, position]
                );
            }
        }

        for (const approval of seed.approvals) {
            await this.insertDemoApproval(approval);
        }

        for (const gap of seed.dataGaps) {
            await this.client.query(
                `insert into founder_internal.data_gaps (
                    id,
                    description,
                    position,
                    is_demo
                 )
                 values ($1, $2, $3, true)
                 on conflict (id) do nothing`,
                [gap.id, gap.description, gap.position]
            );
        }

        await this.client.query(
            `insert into founder_internal.settings (
                settings_key,
                contract_version,
                markets,
                segment_priority,
                score_threshold,
                require_approval_for_every_external_action,
                allow_cold_social_dm,
                allow_unverified_contacts,
                trend_sources,
                integrations,
                operating_profile
             )
             values ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             on conflict (settings_key) do nothing`,
            [
                seed.settings.contractVersion,
                seed.settings.markets,
                seed.settings.segmentPriority,
                seed.settings.scoreThreshold,
                seed.settings.requireApprovalForEveryExternalAction,
                seed.settings.allowColdSocialDm,
                seed.settings.allowUnverifiedContacts,
                seed.settings.trendSources,
                seed.settings.integrations,
                seed.settings.operatingProfile,
            ]
        );

        await this.client.query(
            `update founder_internal.workspace_state
             set mode = 'demo', demo_dataset_version = $1
             where singleton = true`,
            [datasetVersion]
        );

        const countsResult = await this.client.query<Record<string, number>>(
            `select
                (select count(*)::int from founder_internal.agent_cards where is_demo) as agents,
                (select count(*)::int from founder_internal.prospects where is_demo) as prospects,
                (
                    select count(*)::int
                    from founder_internal.approval_actions
                    where is_demo
                ) as approvals,
                (
                    select count(*)::int
                    from founder_internal.source_evidence
                    where is_demo
                ) as evidence`
        );
        const counts = countsResult.rows[0] ?? {
            agents: 0,
            prospects: 0,
            approvals: 0,
            evidence: 0,
        };

        await this.client.query(
            `insert into founder_internal.demo_bootstrap_runs (
                dataset_version,
                seed_hash,
                record_counts
             )
             values ($1, $2, $3)
             on conflict (dataset_version) do nothing`,
            [datasetVersion, seedHash, counts]
        );

        return counts;
    }

    private async insertDemoApproval(approval: DemoApprovalSeed): Promise<void> {
        await this.client.query(
            `insert into founder_internal.approval_actions (
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                created_at,
                updated_at,
                is_demo
             )
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             on conflict (id) do nothing`,
            [
                approval.id,
                approval.prospectId,
                approval.actionType,
                approval.channel,
                approval.status,
                approval.targetLabel,
                approval.payloadSummary,
                approval.payload,
                approval.createdAt,
                approval.updatedAt,
            ]
        );
    }

    async getSettingsForUpdate(): Promise<FounderSettings | null> {
        const result = await this.client.query<SettingsRow>(
            `select
                contract_version,
                markets,
                segment_priority,
                score_threshold,
                require_approval_for_every_external_action,
                allow_cold_social_dm,
                allow_unverified_contacts,
                trend_sources,
                integrations,
                operating_profile
             from founder_internal.settings
             where settings_key = 'default'
             for update`
        );
        return result.rows[0] ? mapSettingsRow(result.rows[0]) : null;
    }

    async upsertSettings(settings: FounderSettings): Promise<FounderSettings> {
        const result = await this.client.query<SettingsRow>(
            `insert into founder_internal.settings (
                settings_key,
                contract_version,
                markets,
                segment_priority,
                score_threshold,
                require_approval_for_every_external_action,
                allow_cold_social_dm,
                allow_unverified_contacts,
                trend_sources,
                integrations,
                operating_profile
             )
             values ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             on conflict (settings_key) do update set
                contract_version = excluded.contract_version,
                markets = excluded.markets,
                segment_priority = excluded.segment_priority,
                score_threshold = excluded.score_threshold,
                require_approval_for_every_external_action =
                    excluded.require_approval_for_every_external_action,
                allow_cold_social_dm = excluded.allow_cold_social_dm,
                allow_unverified_contacts = excluded.allow_unverified_contacts,
                trend_sources = excluded.trend_sources,
                integrations = excluded.integrations,
                operating_profile = excluded.operating_profile
             returning
                contract_version,
                markets,
                segment_priority,
                score_threshold,
                require_approval_for_every_external_action,
                allow_cold_social_dm,
                allow_unverified_contacts,
                trend_sources,
                integrations,
                operating_profile`,
            [
                settings.contractVersion,
                settings.markets,
                settings.segmentPriority,
                settings.scoreThreshold,
                settings.requireApprovalForEveryExternalAction,
                settings.allowColdSocialDm,
                settings.allowUnverifiedContacts,
                settings.trendSources,
                settings.integrations,
                settings.operatingProfile,
            ]
        );
        return mapSettingsRow(result.rows[0]);
    }

    async getApprovalForUpdate(approvalId: string): Promise<StoredApproval | null> {
        const result = await this.client.query<ApprovalRow>(
            `select
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo
             from founder_internal.approval_actions
             where id = $1
             for update`,
            [approvalId]
        );
        return result.rows[0] ? mapApprovalRow(result.rows[0]) : null;
    }

    async getApprovalForReview(approvalId: string): Promise<StoredApproval | null> {
        const result = await this.client.query<ApprovalRow>(
            `select
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo
             from founder_internal.approval_actions
             where id = $1`,
            [approvalId]
        );
        return result.rows[0] ? mapApprovalRow(result.rows[0]) : null;
    }

    async getProspectContactPermission(
        prospectId: string
    ): Promise<Prospect['contactPermission'] | null> {
        const result = await this.client.query<{ contact_permission: Prospect['contactPermission'] }>(
            `select contact_permission
             from founder_internal.prospects
             where id = $1`,
            [prospectId]
        );
        return result.rows[0]?.contact_permission ?? null;
    }

    async getProspectDeliveryContact(
        prospectId: string
    ): Promise<ProspectDeliveryContact | null> {
        const result = await this.client.query<{
            business_email: string | null;
            contact_permission: Prospect['contactPermission'];
            suppressed: boolean;
        }>(
            `select
                p.business_email,
                p.contact_permission,
                exists (
                    select 1
                    from vgp_subscribers s
                    where lower(s.email) = lower(p.business_email)
                      and s.status = 'unsubscribed'
                ) as suppressed
             from founder_internal.prospects p
             where p.id = $1`,
            [prospectId]
        );
        const row = result.rows[0];
        if (!row?.business_email) return null;
        return {
            email: row.business_email,
            permission: row.contact_permission,
            suppressed: row.suppressed,
        };
    }

    async quarantineStaleEmailExecutions(
        staleAfterSeconds: number
    ): Promise<string[]> {
        const stale = await this.client.query<{
            approval_id: string;
            outbox_id: string;
        }>(
            `select
                a.id as approval_id,
                o.id::text as outbox_id
             from founder_internal.approval_actions a
             join founder_internal.outbox o
               on o.approval_id = a.id
              and o.content_hash = a.content_hash
             where a.status = 'EXECUTING'
               and a.channel = 'email'
               and o.status = 'processing'
               and o.locked_at < now() - make_interval(secs => $1::int)
             order by o.locked_at asc
             limit 20
             for update of a, o skip locked`,
            [staleAfterSeconds]
        );
        if (stale.rows.length === 0) return [];

        const approvalIds = stale.rows.map((row) => row.approval_id);
        const outboxIds = stale.rows.map((row) => row.outbox_id);
        const reason =
            'Email delivery outcome unknown after stale SMTP execution; manual reconciliation required';
        await this.client.query(
            `update founder_internal.outbox
             set
                status = 'unknown',
                completed_at = now(),
                locked_at = null,
                last_error = $2
             where id = any($1::bigint[])`,
            [outboxIds, reason]
        );
        await this.client.query(
            `update founder_internal.approval_actions
             set
                status = 'UNKNOWN',
                executed_at = now(),
                provider_reference = null,
                failure_reason = $2
             where id = any($1::text[])`,
            [approvalIds, reason]
        );
        return approvalIds;
    }

    async insertIdempotentGptDraft(
        input: GptDraftInsert
    ): Promise<{ created: boolean; approval: StoredApproval }> {
        const inserted = await this.client.query<ApprovalRow>(
            `insert into founder_internal.approval_actions (
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                is_demo
             )
             values ($1, $2, $3, $4, 'DRAFT', $5, $6, $7, $8)
             on conflict (id) do nothing
             returning
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo`,
            [
                input.id,
                input.prospectId,
                input.actionType,
                input.channel,
                input.targetLabel,
                input.payloadSummary,
                input.payload,
                input.isDemo,
            ]
        );

        if (inserted.rows[0]) {
            return {
                created: true,
                approval: mapApprovalRow(inserted.rows[0]),
            };
        }

        const existing = await this.client.query<ApprovalRow>(
            `select
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo
             from founder_internal.approval_actions
             where id = $1
               and prospect_id is not distinct from $2
               and action_type = $3
               and channel = $4
               and target_label = $5
               and payload_summary = $6
               and payload = $7::jsonb
               and is_demo = $8
             for update`,
            [
                input.id,
                input.prospectId,
                input.actionType,
                input.channel,
                input.targetLabel,
                input.payloadSummary,
                input.payload,
                input.isDemo,
            ]
        );

        if (!existing.rows[0]) {
            throw new FounderOsError(
                'FOUNDER_OS_CONFLICT',
                'This Custom GPT request key was already used for different content.',
                409,
                { approvalId: input.id }
            );
        }

        return {
            created: false,
            approval: mapApprovalRow(existing.rows[0]),
        };
    }

    async insertIdempotentScoutedLead(
        input: ScoutedLeadInsert
    ): Promise<{ created: boolean }> {
        for (const evidence of input.evidence) {
            const inserted = await this.client.query(
                `insert into founder_internal.source_evidence (
                    id,
                    label,
                    url,
                    source_type,
                    observed_at,
                    freshness,
                    note,
                    is_demo
                 )
                 values ($1, $2, $3, $4, $5, $6, $7, $8)
                 on conflict (id) do nothing
                 returning id`,
                [
                    evidence.id,
                    evidence.label,
                    evidence.url,
                    evidence.sourceType,
                    evidence.observedAt,
                    evidence.freshness,
                    evidence.note ?? null,
                    input.isDemo,
                ]
            );
            if (inserted.rows[0]) continue;

            const matching = await this.client.query(
                `select id
                 from founder_internal.source_evidence
                 where id = $1
                   and label = $2
                   and url is not distinct from $3
                   and source_type = $4
                   and observed_at is not distinct from $5::timestamptz
                   and freshness = $6
                   and note is not distinct from $7
                   and is_demo = $8`,
                [
                    evidence.id,
                    evidence.label,
                    evidence.url,
                    evidence.sourceType,
                    evidence.observedAt,
                    evidence.freshness,
                    evidence.note ?? null,
                    input.isDemo,
                ]
            );
            if (!matching.rows[0]) {
                throw new FounderOsError(
                    'FOUNDER_OS_CONFLICT',
                    'A prospect evidence key was already used for different content.',
                    409,
                    { evidenceId: evidence.id }
                );
            }
        }

        const prospect = input.prospect;
        const insertedProspect = await this.client.query(
            `insert into founder_internal.prospects (
                id,
                display_name,
                handle,
                segment,
                market,
                platform,
                profile_url,
                business_email,
                contact_permission,
                score,
                score_breakdown,
                matched_beat_ids,
                signals,
                gaps,
                last_observed_at,
                is_demo
             )
             values (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13, $14, $15, $16
             )
             on conflict (id) do nothing
             returning id`,
            [
                prospect.id,
                prospect.displayName,
                prospect.handle,
                prospect.segment,
                prospect.market,
                prospect.platform,
                prospect.profileUrl,
                prospect.businessEmail,
                prospect.contactPermission,
                prospect.score,
                prospect.scoreBreakdown,
                prospect.matchedBeatIds,
                prospect.signals,
                prospect.gaps,
                prospect.lastObservedAt,
                input.isDemo,
            ]
        );
        const created = Boolean(insertedProspect.rows[0]);

        if (!created) {
            const matching = await this.client.query(
                `select id
                 from founder_internal.prospects
                 where id = $1
                   and display_name = $2
                   and handle is not distinct from $3
                   and segment = $4
                   and market = $5
                   and platform = $6
                   and profile_url is not distinct from $7
                   and business_email is not distinct from $8
                   and contact_permission = $9
                   and score = $10
                   and score_breakdown = $11::jsonb
                   and matched_beat_ids = $12::text[]
                   and signals = $13::text[]
                   and gaps = $14::text[]
                   and last_observed_at is not distinct from $15::timestamptz
                   and is_demo = $16
                 for update`,
                [
                    prospect.id,
                    prospect.displayName,
                    prospect.handle,
                    prospect.segment,
                    prospect.market,
                    prospect.platform,
                    prospect.profileUrl,
                    prospect.businessEmail,
                    prospect.contactPermission,
                    prospect.score,
                    prospect.scoreBreakdown,
                    prospect.matchedBeatIds,
                    prospect.signals,
                    prospect.gaps,
                    prospect.lastObservedAt,
                    input.isDemo,
                ]
            );
            if (!matching.rows[0]) {
                throw new FounderOsError(
                    'FOUNDER_OS_CONFLICT',
                    'This prospect request key was already used for different content.',
                    409,
                    { prospectId: prospect.id }
                );
            }
        }

        for (const [position, evidence] of input.evidence.entries()) {
            await this.client.query(
                `insert into founder_internal.prospect_evidence (
                    prospect_id,
                    evidence_id,
                    position
                 )
                 values ($1, $2, $3)
                 on conflict (prospect_id, evidence_id) do nothing`,
                [prospect.id, evidence.id, position]
            );
        }

        await this.client.query(
            `update founder_internal.agent_cards
             set
                status = 'waiting-for-approval',
                current_task = $1,
                last_run_at = now(),
                evidence_count = $2
             where id = 'lead-scout'
               and is_demo = $3`,
            [
                `Scored ${prospect.displayName}; founder review required`,
                input.evidence.length,
                input.isDemo,
            ]
        );

        return { created };
    }

    async activateLiveWorkspace(
        liveAgents: AgentCard[]
    ): Promise<{ removed: Record<string, number> }> {
        const workspace = await this.getWorkspaceStateForUpdate();
        if (workspace.mode === 'live') {
            return { removed: {} };
        }

        const removed: Record<string, number> = {};
        const deleteAndCount = async (
            key: string,
            sql: string
        ): Promise<void> => {
            const result = await this.client.query(sql);
            removed[key] = result.rowCount ?? 0;
        };

        await deleteAndCount(
            'outbox',
            `delete from founder_internal.outbox
             where approval_id in (
                select id from founder_internal.approval_actions where is_demo
             )`
        );
        await deleteAndCount(
            'approvals',
            'delete from founder_internal.approval_actions where is_demo'
        );
        await deleteAndCount(
            'prospects',
            'delete from founder_internal.prospects where is_demo'
        );
        await deleteAndCount(
            'evidence',
            'delete from founder_internal.source_evidence where is_demo'
        );
        await deleteAndCount(
            'agents',
            'delete from founder_internal.agent_cards where is_demo'
        );
        await deleteAndCount(
            'dataGaps',
            'delete from founder_internal.data_gaps where is_demo'
        );
        await deleteAndCount(
            'bootstrapRuns',
            'delete from founder_internal.demo_bootstrap_runs'
        );

        for (const agent of liveAgents) {
            await this.client.query(
                `insert into founder_internal.agent_cards (
                    id,
                    name,
                    role,
                    status,
                    current_task,
                    last_run_at,
                    evidence_count,
                    is_demo
                 )
                 values ($1, $2, $3, $4, $5, $6, $7, false)
                 on conflict (id) do update
                 set
                    name = excluded.name,
                    role = excluded.role,
                    status = excluded.status,
                    current_task = excluded.current_task,
                    last_run_at = excluded.last_run_at,
                    evidence_count = excluded.evidence_count,
                    is_demo = false`,
                [
                    agent.id,
                    agent.name,
                    agent.role,
                    agent.status,
                    agent.currentTask,
                    agent.lastRunAt,
                    agent.evidenceCount,
                ]
            );
        }

        await this.client.query(
            `update founder_internal.workspace_state
             set mode = 'live', demo_dataset_version = null
             where singleton = true`
        );

        return { removed };
    }

    async updateApprovalReviewStatus(
        approvalId: string,
        status: Extract<ApprovalStatus, 'READY_FOR_APPROVAL' | 'APPROVED'>
    ): Promise<StoredApproval> {
        const result = await this.client.query<ApprovalRow>(
            `update founder_internal.approval_actions
             set
                status = $2,
                approved_at = case when $2 = 'APPROVED' then now() else null end,
                executed_at = null,
                provider_reference = null,
                failure_reason = null
             where id = $1
             returning
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo`,
            [approvalId, status]
        );
        return mapApprovalRow(result.rows[0]);
    }

    async replaceApprovalContent(
        approvalId: string,
        payloadSummary: string,
        payload: JsonObject
    ): Promise<StoredApproval> {
        const result = await this.client.query<ApprovalRow>(
            `update founder_internal.approval_actions
             set
                payload_summary = $2,
                payload = $3,
                status = case
                    when payload is distinct from $3::jsonb
                        and status in ('READY_FOR_APPROVAL', 'APPROVED')
                    then 'DRAFT'
                    else status
                end,
                approved_at = case
                    when payload is distinct from $3::jsonb then null
                    else approved_at
                end,
                executed_at = null,
                provider_reference = null,
                failure_reason = null
             where id = $1
             returning
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo`,
            [approvalId, payloadSummary, payload]
        );
        return mapApprovalRow(result.rows[0]);
    }

    async insertHeldOutbox(
        approval: StoredApproval,
        idempotencyKey: string
    ): Promise<{ created: boolean; row: OutboxRow }> {
        const envelope = {
            approvalId: approval.action.id,
            actionType: approval.action.actionType,
            channel: approval.action.channel,
            targetLabel: approval.action.targetLabel,
            payloadSummary: approval.action.payloadSummary,
            payload: approval.payload,
            contentHash: approval.action.contentHash,
            approvedAt: approval.action.approvedAt,
            deliveryState: 'held-for-explicit-executor',
        };

        const inserted = await this.client.query<OutboxRow>(
            `insert into founder_internal.outbox (
                approval_id,
                idempotency_key,
                channel,
                payload,
                content_hash,
                status,
                available_at
             )
             values ($1, $2, $3, $4, $5, 'held', null)
             on conflict (idempotency_key) do nothing
             returning
                id::text,
                approval_id,
                idempotency_key,
                status,
                content_hash,
                attempt_count`,
            [
                approval.action.id,
                idempotencyKey,
                approval.action.channel,
                envelope,
                approval.action.contentHash,
            ]
        );

        if (inserted.rows[0]) {
            return { created: true, row: inserted.rows[0] };
        }

        const existing = await this.client.query<OutboxRow>(
            `select
                id::text,
                approval_id,
                idempotency_key,
                status,
                content_hash,
                attempt_count
             from founder_internal.outbox
             where idempotency_key = $1
             for update`,
            [idempotencyKey]
        );
        const row = existing.rows[0];
        if (!row) {
            throw new FounderOsError(
                'FOUNDER_OS_CONFLICT',
                'Approval outbox could not be created idempotently.',
                409
            );
        }
        return { created: false, row };
    }

    async supersedeHeldOutbox(
        approvalId: string,
        previousContentHash: string
    ): Promise<number> {
        const result = await this.client.query(
            `update founder_internal.outbox
             set status = 'superseded', completed_at = now()
             where approval_id = $1
               and content_hash = $2
               and status = 'held'`,
            [approvalId, previousContentHash]
        );
        return result.rowCount ?? 0;
    }

    async getOutboxForUpdate(
        approvalId: string,
        contentHash: string
    ): Promise<OutboxRow | null> {
        const result = await this.client.query<OutboxRow>(
            `select
                id::text,
                approval_id,
                idempotency_key,
                status,
                content_hash,
                attempt_count
             from founder_internal.outbox
             where approval_id = $1 and content_hash = $2
             for update`,
            [approvalId, contentHash]
        );
        return result.rows[0] ?? null;
    }

    async markExecutionStarted(
        approvalId: string,
        outboxId: string
    ): Promise<StoredApproval> {
        await this.client.query(
            `update founder_internal.outbox
             set
                status = 'processing',
                attempt_count = attempt_count + 1,
                locked_at = now(),
                last_error = null
             where id = $1::bigint`,
            [outboxId]
        );

        const result = await this.client.query<ApprovalRow>(
            `update founder_internal.approval_actions
             set status = 'EXECUTING'
             where id = $1
             returning
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo`,
            [approvalId]
        );
        return mapApprovalRow(result.rows[0]);
    }

    async markExecutionOutcome(
        approvalId: string,
        status: Extract<ApprovalStatus, 'SUCCEEDED' | 'FAILED' | 'UNKNOWN'>,
        providerReference: string | null,
        failureReason: string | null,
        outboxId: string
    ): Promise<StoredApproval> {
        const outboxStatus = status.toLowerCase();
        await this.client.query(
            `update founder_internal.outbox
             set
                status = $2,
                completed_at = now(),
                locked_at = null,
                last_error = $3
             where id = $1::bigint`,
            [outboxId, outboxStatus, failureReason]
        );

        const result = await this.client.query<ApprovalRow>(
            `update founder_internal.approval_actions
             set
                status = $2,
                executed_at = now(),
                provider_reference = $3,
                failure_reason = $4
             where id = $1
             returning
                id,
                prospect_id,
                action_type,
                channel,
                status,
                target_label,
                payload_summary,
                payload,
                content_hash,
                created_at,
                updated_at,
                approved_at,
                executed_at,
                provider_reference,
                failure_reason,
                is_demo`,
            [approvalId, status, providerReference, failureReason]
        );
        return mapApprovalRow(result.rows[0]);
    }

    async appendAudit(entry: AuditEntry): Promise<void> {
        await this.client.query(
            `insert into founder_internal.audit_log (
                actor_type,
                actor_id,
                action,
                entity_type,
                entity_id,
                request_id,
                before_state,
                after_state,
                metadata
             )
             values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                entry.actorType,
                entry.actorId ?? null,
                entry.action,
                entry.entityType,
                entry.entityId ?? null,
                entry.requestId,
                entry.beforeState ?? null,
                entry.afterState ?? null,
                entry.metadata ?? {},
            ]
        );
    }
}

export async function withFounderOsRepository<T>(
    callback: (repository: FounderOsRepository) => Promise<T>,
    options: { isolation?: 'serializable' | 'repeatable read' } = {}
): Promise<T> {
    try {
        return await withTransaction(async (client) => {
            if (options.isolation) {
                const isolation =
                    options.isolation === 'serializable'
                        ? 'serializable'
                        : 'repeatable read';
                await client.query(`set transaction isolation level ${isolation}`);
            }
            return callback(new FounderOsRepository(client));
        });
    } catch (error) {
        if (isMissingFounderOsSchemaError(error)) throw makeNotProvisionedError();
        throw error;
    }
}
