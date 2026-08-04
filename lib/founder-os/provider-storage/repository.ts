import type { PoolClient } from 'pg';
import pool, { withTransaction } from '@/lib/db';
import { isMissingFounderOsSchemaError } from '../errors';
import {
    constantTimeBufferEqual,
    constantTimeTextEqual,
    createOAuthArtifacts,
    decryptSecret,
    encryptSecret,
    hashCanonicalJson,
    makeCredentialAad,
    makeOAuthVerifierAad,
    sha256,
    type EncryptedEnvelope,
} from './crypto';
import { ProviderStorageError } from './errors';
import {
    ConsumedOAuthState,
    DecryptedProviderCredentials,
    type InboundReplyClaim,
    type OAuthAuthorizationState,
    type ProviderConnectionSummary,
    type ProviderExecutionClaim,
    type ProviderGrant,
    type ProviderId,
    type ProviderJobSummary,
    type ProviderReconciliationSummary,
} from './types';
import {
    claimProviderExecutionSchema,
    connectionIdSchema,
    consumeInboundReplySchema,
    consumeOAuthStateSchema,
    createOAuthStateSchema,
    createProviderJobSchema,
    parseProviderStorageInput,
    providerJobOutcomeSchema,
    quarantineStaleProviderExecutionsSchema,
    recordWebhookSchema,
    registerInboundEventSchema,
    revokeProviderConnectionSchema,
    saveProviderConnectionSchema,
} from './validation';

interface ConnectionRow {
    id: string;
    provider: ProviderId;
    provider_account_id: string;
    display_name: string;
    username: string | null;
    account_type: string | null;
    profile_url: string | null;
    status: ProviderConnectionSummary['status'];
    connected_at: Date | string | null;
    last_verified_at: Date | string | null;
    last_error: string | null;
    created_at: Date | string;
    updated_at: Date | string;
}

interface GrantRow {
    connection_id: string;
    grant_type: ProviderGrant['type'];
    grant_name: string;
    status: ProviderGrant['status'];
    granted_at: Date | string | null;
    expires_at: Date | string | null;
    last_verified_at: Date | string | null;
}

interface CredentialRow {
    connection_id: string;
    provider: ProviderId;
    status: ProviderConnectionSummary['status'];
    encryption_version: number;
    key_version: number;
    access_token_ciphertext: Buffer;
    access_token_iv: Buffer;
    access_token_auth_tag: Buffer;
    refresh_token_ciphertext: Buffer | null;
    refresh_token_iv: Buffer | null;
    refresh_token_auth_tag: Buffer | null;
    token_type: string | null;
    access_token_expires_at: Date | string | null;
    refresh_token_expires_at: Date | string | null;
    issued_at: Date | string | null;
}

interface JobRow {
    id: string;
    provider: ProviderId;
    connection_id: string;
    job_type: ProviderJobSummary['jobType'];
    approval_id: string | null;
    approval_content_hash: string | null;
    inbound_event_id: string | null;
    idempotency_key: string;
    request_hash: Buffer;
    status: ProviderJobSummary['status'];
    attempt_count: number;
    max_attempts: number;
    next_attempt_at: Date | string | null;
    remote_reference: string | null;
    last_error: string | null;
    created_at: Date | string;
    updated_at: Date | string;
    completed_at: Date | string | null;
}

interface ReconciliationRow {
    id: string;
    job_id: string;
    status: ProviderReconciliationSummary['status'];
    attempt_count: number;
    next_check_at: Date | string | null;
    resolution_note: string | null;
    resolved_at: Date | string | null;
    created_at: Date | string;
    updated_at: Date | string;
}

function toIso(value: Date | string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_CONFLICT',
            'Provider storage contains an invalid timestamp.'
        );
    }
    return date.toISOString();
}

function notProvisioned(): ProviderStorageError {
    return new ProviderStorageError(
        'PROVIDER_STORAGE_NOT_PROVISIONED',
        'Provider storage migration has not been applied.',
        503
    );
}

async function withProviderTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    isolation: 'serializable' | 'repeatable read' = 'serializable',
    readOnly = false
): Promise<T> {
    try {
        return await withTransaction(async (client) => {
            await client.query(
                `set transaction isolation level ${isolation}${readOnly ? ' read only' : ''}`
            );
            return callback(client);
        });
    } catch (error) {
        if (isMissingFounderOsSchemaError(error)) throw notProvisioned();
        throw error;
    }
}

function mapGrant(row: GrantRow): ProviderGrant {
    return {
        type: row.grant_type,
        name: row.grant_name,
        status: row.status,
        grantedAt: toIso(row.granted_at),
        expiresAt: toIso(row.expires_at),
        lastVerifiedAt: toIso(row.last_verified_at),
    };
}

function mapConnection(
    row: ConnectionRow,
    grants: ProviderGrant[]
): ProviderConnectionSummary {
    return {
        id: row.id,
        provider: row.provider,
        providerAccountId: row.provider_account_id,
        displayName: row.display_name,
        username: row.username,
        accountType: row.account_type,
        profileUrl: row.profile_url,
        status: row.status,
        grants,
        connectedAt: toIso(row.connected_at),
        lastVerifiedAt: toIso(row.last_verified_at),
        lastError: row.last_error,
        createdAt: toIso(row.created_at) as string,
        updatedAt: toIso(row.updated_at) as string,
    };
}

function mapJob(row: JobRow): ProviderJobSummary {
    return {
        id: row.id,
        provider: row.provider,
        connectionId: row.connection_id,
        jobType: row.job_type,
        approvalId: row.approval_id,
        approvalContentHash: row.approval_content_hash,
        inboundEventId: row.inbound_event_id,
        idempotencyKey: row.idempotency_key,
        status: row.status,
        attemptCount: row.attempt_count,
        maxAttempts: row.max_attempts,
        nextAttemptAt: toIso(row.next_attempt_at),
        remoteReference: row.remote_reference,
        lastError: row.last_error,
        createdAt: toIso(row.created_at) as string,
        updatedAt: toIso(row.updated_at) as string,
        completedAt: toIso(row.completed_at),
    };
}

function mapReconciliation(row: ReconciliationRow): ProviderReconciliationSummary {
    return {
        id: row.id,
        jobId: row.job_id,
        status: row.status,
        attemptCount: row.attempt_count,
        nextCheckAt: toIso(row.next_check_at),
        resolutionNote: row.resolution_note,
        resolvedAt: toIso(row.resolved_at),
        createdAt: toIso(row.created_at) as string,
        updatedAt: toIso(row.updated_at) as string,
    };
}

async function appendAudit(
    client: PoolClient,
    input: {
        actorType: 'founder' | 'system';
        actorId: string;
        action: string;
        entityType: string;
        entityId: string;
        requestId: string;
        beforeState?: unknown;
        afterState?: unknown;
        metadata?: Record<string, unknown>;
    }
): Promise<void> {
    await client.query(
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
            input.actorType,
            input.actorId,
            input.action,
            input.entityType,
            input.entityId,
            input.requestId,
            input.beforeState ?? null,
            input.afterState ?? null,
            input.metadata ?? {},
        ]
    );
}

const STALE_EXECUTION_REASON =
    'Execution lease expired before a durable provider outcome was recorded; external state is ambiguous.';

function staleExecutionSeconds(): number {
    const raw =
        process.env.FOUNDER_OS_PROVIDER_STALE_EXECUTION_SECONDS?.trim()
        || '900';
    if (!/^[1-9][0-9]{1,4}$/.test(raw)) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_INVALID_INPUT',
            'FOUNDER_OS_PROVIDER_STALE_EXECUTION_SECONDS must be an integer from 60 to 86400.'
        );
    }
    const seconds = Number(raw);
    if (seconds < 60 || seconds > 86_400) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_INVALID_INPUT',
            'FOUNDER_OS_PROVIDER_STALE_EXECUTION_SECONDS must be an integer from 60 to 86400.'
        );
    }
    return seconds;
}

async function quarantineStaleProviderExecutionsWithClient(
    client: PoolClient,
    input: { limit: number; requestId: string }
): Promise<number> {
    const stale = await client.query<{
        id: string;
        approval_id: string;
        approval_content_hash: string;
    }>(
        `select
            id::text,
            approval_id,
            approval_content_hash
         from founder_internal.provider_jobs
         where status = 'RUNNING'
           and job_type in ('content_publish', 'social_reply')
           and locked_at <= now() - make_interval(secs => $1::double precision)
         order by locked_at, id
         limit $2
         for update skip locked`,
        [staleExecutionSeconds(), input.limit]
    );

    let quarantined = 0;
    for (const row of stale.rows) {
        const job = await client.query<{ id: string }>(
            `update founder_internal.provider_jobs
             set
                status = 'UNKNOWN',
                next_attempt_at = null,
                locked_at = null,
                completed_at = now(),
                remote_reference = null,
                outcome = $2,
                last_error = $3
             where id = $1::uuid and status = 'RUNNING'
             returning id::text`,
            [
                row.id,
                {
                    automaticRetry: false,
                    quarantinedAfterStaleLease: true,
                    reconcileOnly: true,
                },
                STALE_EXECUTION_REASON,
            ]
        );
        if (!job.rows[0]) continue;

        await client.query(
            `update founder_internal.outbox
             set
                status = 'unknown',
                completed_at = now(),
                locked_at = null,
                last_error = $3
             where approval_id = $1
               and content_hash = $2
               and status = 'processing'`,
            [
                row.approval_id,
                row.approval_content_hash,
                STALE_EXECUTION_REASON,
            ]
        );
        await client.query(
            `update founder_internal.approval_actions
             set
                status = 'UNKNOWN',
                executed_at = now(),
                provider_reference = null,
                failure_reason = $2
             where id = $1 and status = 'EXECUTING'`,
            [row.approval_id, STALE_EXECUTION_REASON]
        );
        await client.query(
            `insert into founder_internal.provider_reconciliations (
                job_id,
                status,
                next_check_at,
                evidence
             )
             values ($1::uuid, 'OPEN', now(), $2)
             on conflict (job_id) do nothing`,
            [
                row.id,
                {
                    reason: STALE_EXECUTION_REASON,
                    automaticRetry: false,
                    reconcileOnly: true,
                },
            ]
        );
        await appendAudit(client, {
            actorType: 'system',
            actorId: 'provider-stale-execution-quarantine',
            action: 'provider.job_quarantined_unknown',
            entityType: 'provider_job',
            entityId: row.id,
            requestId: input.requestId,
            metadata: {
                approvalId: row.approval_id,
                contentHash: row.approval_content_hash,
                automaticRetry: false,
                reconcileOnly: true,
            },
        });
        quarantined += 1;
    }
    return quarantined;
}

async function readConnectionSummary(
    client: PoolClient,
    connectionId: string
): Promise<ProviderConnectionSummary | null> {
    const connectionResult = await client.query<ConnectionRow>(
        `select
            id::text,
            provider,
            provider_account_id,
            display_name,
            username,
            account_type,
            profile_url,
            status,
            connected_at,
            last_verified_at,
            last_error,
            created_at,
            updated_at
         from founder_internal.provider_connections
         where id = $1::uuid`,
        [connectionId]
    );
    const row = connectionResult.rows[0];
    if (!row) return null;

    const grantsResult = await client.query<GrantRow>(
        `select
            connection_id::text,
            grant_type,
            grant_name,
            status,
            granted_at,
            expires_at,
            last_verified_at
         from founder_internal.provider_grants
         where connection_id = $1::uuid
         order by grant_type, grant_name`,
        [connectionId]
    );
    return mapConnection(row, grantsResult.rows.map(mapGrant));
}

export async function saveProviderConnection(
    input: unknown
): Promise<ProviderConnectionSummary> {
    const parsed = parseProviderStorageInput(saveProviderConnectionSchema, input);

    return withProviderTransaction(async (client) => {
        const connectionResult = await client.query<ConnectionRow>(
            `insert into founder_internal.provider_connections (
                provider,
                provider_account_id,
                display_name,
                username,
                account_type,
                profile_url,
                status,
                metadata,
                connected_at,
                last_verified_at,
                last_error
             )
             values ($1, $2, $3, $4, $5, $6, 'connected', $7, now(), now(), null)
             on conflict (provider, provider_account_id) do update set
                display_name = excluded.display_name,
                username = excluded.username,
                account_type = excluded.account_type,
                profile_url = excluded.profile_url,
                status = 'connected',
                metadata = excluded.metadata,
                connected_at = coalesce(
                    founder_internal.provider_connections.connected_at,
                    now()
                ),
                last_verified_at = now(),
                last_error = null
             returning
                id::text,
                provider,
                provider_account_id,
                display_name,
                username,
                account_type,
                profile_url,
                status,
                connected_at,
                last_verified_at,
                last_error,
                created_at,
                updated_at`,
            [
                parsed.provider,
                parsed.providerAccountId,
                parsed.displayName,
                parsed.username ?? null,
                parsed.accountType ?? null,
                parsed.profileUrl ?? null,
                parsed.metadata,
            ]
        );
        const connection = connectionResult.rows[0];

        await client.query(
            `delete from founder_internal.provider_grants
             where connection_id = $1::uuid`,
            [connection.id]
        );
        for (const grant of parsed.grants) {
            await client.query(
                `insert into founder_internal.provider_grants (
                    connection_id,
                    grant_type,
                    grant_name,
                    status,
                    granted_at,
                    expires_at,
                    last_verified_at,
                    metadata
                 )
                 values ($1::uuid, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    connection.id,
                    grant.type,
                    grant.name,
                    grant.status,
                    grant.grantedAt ?? null,
                    grant.expiresAt ?? null,
                    grant.lastVerifiedAt ?? null,
                    grant.metadata,
                ]
            );
        }

        const access = encryptSecret(
            parsed.credentials.accessToken,
            (keyVersion) =>
                makeCredentialAad(
                    parsed.provider,
                    connection.id,
                    'access',
                    keyVersion
                )
        );
        const refresh = parsed.credentials.refreshToken
            ? encryptSecret(
                parsed.credentials.refreshToken,
                (keyVersion) =>
                    makeCredentialAad(
                        parsed.provider,
                        connection.id,
                        'refresh',
                        keyVersion
                    )
            )
            : null;

        await client.query(
            `insert into founder_internal.provider_credentials (
                connection_id,
                encryption_algorithm,
                encryption_version,
                key_version,
                access_token_ciphertext,
                access_token_iv,
                access_token_auth_tag,
                refresh_token_ciphertext,
                refresh_token_iv,
                refresh_token_auth_tag,
                token_type,
                access_token_expires_at,
                refresh_token_expires_at,
                issued_at
             )
             values (
                $1::uuid, 'aes-256-gcm', 1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10, $11, $12
             )
             on conflict (connection_id) do update set
                encryption_algorithm = excluded.encryption_algorithm,
                encryption_version = excluded.encryption_version,
                key_version = excluded.key_version,
                access_token_ciphertext = excluded.access_token_ciphertext,
                access_token_iv = excluded.access_token_iv,
                access_token_auth_tag = excluded.access_token_auth_tag,
                refresh_token_ciphertext = excluded.refresh_token_ciphertext,
                refresh_token_iv = excluded.refresh_token_iv,
                refresh_token_auth_tag = excluded.refresh_token_auth_tag,
                token_type = excluded.token_type,
                access_token_expires_at = excluded.access_token_expires_at,
                refresh_token_expires_at = excluded.refresh_token_expires_at,
                issued_at = excluded.issued_at`,
            [
                connection.id,
                access.keyVersion,
                access.ciphertext,
                access.iv,
                access.authTag,
                refresh?.ciphertext ?? null,
                refresh?.iv ?? null,
                refresh?.authTag ?? null,
                parsed.credentials.tokenType ?? null,
                parsed.credentials.accessTokenExpiresAt ?? null,
                parsed.credentials.refreshTokenExpiresAt ?? null,
                parsed.credentials.issuedAt ?? null,
            ]
        );

        const summary = await readConnectionSummary(client, connection.id);
        if (!summary) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_CONFLICT',
                'Provider connection could not be read after persistence.'
            );
        }

        await appendAudit(client, {
            actorType: 'system',
            actorId: 'provider-oauth-callback',
            action: 'provider.connection_saved',
            entityType: 'provider_connection',
            entityId: connection.id,
            requestId: parsed.requestId,
            afterState: summary,
            metadata: {
                provider: parsed.provider,
                tokenFieldsLogged: false,
            },
        });
        return summary;
    });
}

export async function listProviderConnectionSummaries(
    provider?: ProviderId
): Promise<ProviderConnectionSummary[]> {
    return withProviderTransaction(async (client) => {
        const result = await client.query<{ id: string }>(
            `select id::text
             from founder_internal.provider_connections
             where ($1::text is null or provider = $1)
             order by provider, display_name, id`,
            [provider ?? null]
        );
        const summaries: ProviderConnectionSummary[] = [];
        for (const row of result.rows) {
            const summary = await readConnectionSummary(client, row.id);
            if (summary) summaries.push(summary);
        }
        return summaries;
    }, 'repeatable read', true);
}

export async function getProviderConnectionSummary(
    connectionIdInput: string
): Promise<ProviderConnectionSummary | null> {
    const connectionId = parseProviderStorageInput(
        connectionIdSchema,
        connectionIdInput
    );
    return withProviderTransaction(async (client) => {
        return readConnectionSummary(client, connectionId);
    }, 'repeatable read', true);
}

function envelopeFromAccess(row: CredentialRow): EncryptedEnvelope {
    return {
        algorithm: 'aes-256-gcm',
        encryptionVersion: 1,
        keyVersion: row.key_version,
        ciphertext: row.access_token_ciphertext,
        iv: row.access_token_iv,
        authTag: row.access_token_auth_tag,
    };
}

function envelopeFromRefresh(row: CredentialRow): EncryptedEnvelope | null {
    if (
        !row.refresh_token_ciphertext
        || !row.refresh_token_iv
        || !row.refresh_token_auth_tag
    ) {
        return null;
    }
    return {
        algorithm: 'aes-256-gcm',
        encryptionVersion: 1,
        keyVersion: row.key_version,
        ciphertext: row.refresh_token_ciphertext,
        iv: row.refresh_token_iv,
        authTag: row.refresh_token_auth_tag,
    };
}

export async function loadProviderCredentialsForServer(
    connectionIdInput: string
): Promise<DecryptedProviderCredentials> {
    const connectionId = parseProviderStorageInput(
        connectionIdSchema,
        connectionIdInput
    );

    try {
        const result = await pool.query<CredentialRow>(
            `select
                pc.connection_id::text,
                c.provider,
                c.status,
                pc.encryption_version,
                pc.key_version,
                pc.access_token_ciphertext,
                pc.access_token_iv,
                pc.access_token_auth_tag,
                pc.refresh_token_ciphertext,
                pc.refresh_token_iv,
                pc.refresh_token_auth_tag,
                pc.token_type,
                pc.access_token_expires_at,
                pc.refresh_token_expires_at,
                pc.issued_at
             from founder_internal.provider_credentials pc
             join founder_internal.provider_connections c
                on c.id = pc.connection_id
             where pc.connection_id = $1::uuid`,
            [connectionId]
        );
        const row = result.rows[0];
        if (!row || !['connected', 'refresh_required'].includes(row.status)) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_NOT_FOUND',
                'Active provider credentials were not found.',
                404
            );
        }
        if (row.encryption_version !== 1) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_DECRYPTION_FAILED',
                'Provider credential envelope uses an unsupported version.'
            );
        }

        const accessToken = decryptSecret(
            envelopeFromAccess(row),
            (keyVersion) =>
                makeCredentialAad(
                    row.provider,
                    connectionId,
                    'access',
                    keyVersion
                )
        );
        const refreshEnvelope = envelopeFromRefresh(row);
        const refreshToken = refreshEnvelope
            ? decryptSecret(
                refreshEnvelope,
                (keyVersion) =>
                    makeCredentialAad(
                        row.provider,
                        connectionId,
                        'refresh',
                        keyVersion
                    )
            )
            : null;

        return new DecryptedProviderCredentials({
            accessToken,
            refreshToken,
            tokenType: row.token_type,
            accessTokenExpiresAt: toIso(row.access_token_expires_at),
            refreshTokenExpiresAt: toIso(row.refresh_token_expires_at),
            issuedAt: toIso(row.issued_at),
        });
    } catch (error) {
        if (isMissingFounderOsSchemaError(error)) throw notProvisioned();
        throw error;
    }
}

export async function revokeProviderConnection(input: {
    connectionId: string;
    requestId: string;
}): Promise<ProviderConnectionSummary> {
    const parsed = parseProviderStorageInput(
        revokeProviderConnectionSchema,
        input
    );
    const connectionId = parsed.connectionId;

    return withProviderTransaction(async (client) => {
        const before = await readConnectionSummary(client, connectionId);
        if (!before) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_NOT_FOUND',
                'Provider connection was not found.',
                404
            );
        }
        await client.query(
            `delete from founder_internal.provider_credentials
             where connection_id = $1::uuid`,
            [connectionId]
        );
        await client.query(
            `update founder_internal.provider_grants
             set status = 'revoked'
             where connection_id = $1::uuid and status = 'granted'`,
            [connectionId]
        );
        await client.query(
            `update founder_internal.provider_connections
             set
                status = 'revoked',
                last_verified_at = now(),
                last_error = null
             where id = $1::uuid`,
            [connectionId]
        );
        const after = await readConnectionSummary(client, connectionId);
        if (!after) throw new ProviderStorageError(
            'PROVIDER_STORAGE_CONFLICT',
            'Provider connection disappeared during revocation.'
        );
        await appendAudit(client, {
            actorType: 'founder',
            actorId: 'founder-session',
            action: 'provider.connection_revoked',
            entityType: 'provider_connection',
            entityId: connectionId,
            requestId: parsed.requestId,
            beforeState: before,
            afterState: after,
            metadata: { encryptedCredentialsDeleted: true },
        });
        return after;
    });
}

export async function createOAuthState(
    input: unknown
): Promise<OAuthAuthorizationState> {
    const parsed = parseProviderStorageInput(createOAuthStateSchema, input);
    const artifacts = createOAuthArtifacts();
    const stateHash = sha256(artifacts.state);
    const stateHashHex = stateHash.toString('hex');
    const verifier = encryptSecret(
        artifacts.codeVerifier,
        (keyVersion) =>
            makeOAuthVerifierAad(parsed.provider, stateHashHex, keyVersion)
    );
    const expiresAt = new Date(Date.now() + parsed.ttlSeconds * 1000);

    await withProviderTransaction(async (client) => {
        await client.query(
            `insert into founder_internal.provider_oauth_states (
                state_hash,
                provider,
                code_verifier_ciphertext,
                code_verifier_iv,
                code_verifier_auth_tag,
                encryption_version,
                key_version,
                nonce_hash,
                request_binding_hash,
                redirect_uri,
                return_to,
                expires_at
             )
             values ($1, $2, $3, $4, $5, 1, $6, $7, $8, $9, $10, $11)`,
            [
                stateHash,
                parsed.provider,
                verifier.ciphertext,
                verifier.iv,
                verifier.authTag,
                verifier.keyVersion,
                sha256(artifacts.nonce),
                parsed.requestBinding ? sha256(parsed.requestBinding) : null,
                parsed.redirectUri,
                parsed.returnTo ?? null,
                expiresAt,
            ]
        );
    });

    return {
        provider: parsed.provider,
        state: artifacts.state,
        codeChallenge: artifacts.codeChallenge,
        codeChallengeMethod: 'S256',
        nonce: artifacts.nonce,
        expiresAt: expiresAt.toISOString(),
    };
}

export async function consumeOAuthState(
    input: unknown
): Promise<ConsumedOAuthState> {
    const parsed = parseProviderStorageInput(consumeOAuthStateSchema, input);
    const stateHash = sha256(parsed.state);
    const stateHashHex = stateHash.toString('hex');

    return withProviderTransaction(async (client) => {
        const result = await client.query<{
            provider: ProviderId;
            code_verifier_ciphertext: Buffer;
            code_verifier_iv: Buffer;
            code_verifier_auth_tag: Buffer;
            encryption_version: number;
            key_version: number;
            nonce_hash: Buffer | null;
            request_binding_hash: Buffer | null;
            redirect_uri: string;
            return_to: string | null;
            expires_at: Date | string;
            consumed_at: Date | string | null;
        }>(
            `select
                provider,
                code_verifier_ciphertext,
                code_verifier_iv,
                code_verifier_auth_tag,
                encryption_version,
                key_version,
                nonce_hash,
                request_binding_hash,
                redirect_uri,
                return_to,
                expires_at,
                consumed_at
             from founder_internal.provider_oauth_states
             where state_hash = $1
             for update`,
            [stateHash]
        );
        const row = result.rows[0];
        if (
            !row
            || row.provider !== parsed.provider
            || row.consumed_at
            || new Date(row.expires_at).getTime() <= Date.now()
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_OAUTH_STATE_INVALID',
                'OAuth state is invalid, expired, or already consumed.',
                400
            );
        }
        if (row.encryption_version !== 1) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_OAUTH_STATE_INVALID',
                'OAuth state uses an unsupported encryption version.',
                400
            );
        }

        const bindingHash = parsed.requestBinding
            ? sha256(parsed.requestBinding)
            : null;
        if (
            (row.request_binding_hash && !bindingHash)
            || (!row.request_binding_hash && bindingHash)
            || (
                row.request_binding_hash
                && bindingHash
                && !constantTimeBufferEqual(row.request_binding_hash, bindingHash)
            )
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_OAUTH_STATE_INVALID',
                'OAuth request binding does not match.',
                400
            );
        }

        const nonceHash = parsed.nonce ? sha256(parsed.nonce) : null;
        if (
            (row.nonce_hash && !nonceHash)
            || (
                row.nonce_hash
                && nonceHash
                && !constantTimeBufferEqual(row.nonce_hash, nonceHash)
            )
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_OAUTH_STATE_INVALID',
                'OAuth nonce does not match.',
                400
            );
        }

        await client.query(
            `update founder_internal.provider_oauth_states
             set consumed_at = now()
             where state_hash = $1 and consumed_at is null`,
            [stateHash]
        );
        const codeVerifier = decryptSecret(
            {
                algorithm: 'aes-256-gcm',
                encryptionVersion: 1,
                keyVersion: row.key_version,
                ciphertext: row.code_verifier_ciphertext,
                iv: row.code_verifier_iv,
                authTag: row.code_verifier_auth_tag,
            },
            (keyVersion) =>
                makeOAuthVerifierAad(parsed.provider, stateHashHex, keyVersion)
        );
        await appendAudit(client, {
            actorType: 'system',
            actorId: 'provider-oauth-callback',
            action: 'provider.oauth_state_consumed',
            entityType: 'provider_oauth_state',
            entityId: stateHashHex,
            requestId: parsed.requestId,
            metadata: {
                provider: parsed.provider,
                pkceVerifierLogged: false,
            },
        });
        return new ConsumedOAuthState({
            codeVerifier,
            provider: parsed.provider,
            redirectUri: row.redirect_uri,
            returnTo: row.return_to,
        });
    });
}

export async function deleteExpiredOAuthStates(): Promise<number> {
    try {
        const result = await pool.query(
            `delete from founder_internal.provider_oauth_states
             where expires_at < now() - interval '1 day'`,
        );
        return result.rowCount ?? 0;
    } catch (error) {
        if (isMissingFounderOsSchemaError(error)) throw notProvisioned();
        throw error;
    }
}

export async function recordWebhookOnce(input: unknown): Promise<{
    id: string;
    duplicate: boolean;
    status: string;
    payloadHash: string;
}> {
    const parsed = parseProviderStorageInput(recordWebhookSchema, input);
    const payloadHash = sha256(parsed.rawBody);

    return withProviderTransaction(async (client) => {
        if (parsed.connectionId) {
            const connection = await client.query<{ provider: ProviderId }>(
                `select provider
                 from founder_internal.provider_connections
                 where id = $1::uuid`,
                [parsed.connectionId]
            );
            if (connection.rows[0]?.provider !== parsed.provider) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_CONFLICT',
                    'Webhook connection does not match the provider.',
                    409
                );
            }
        }

        const inserted = await client.query<{
            id: string;
            status: string;
            payload_hash: Buffer;
        }>(
            `insert into founder_internal.provider_webhook_events (
                connection_id,
                provider,
                provider_event_id,
                event_type,
                payload_hash,
                signature_verified_at
             )
             values ($1::uuid, $2, $3, $4, $5, $6)
             on conflict (provider, provider_event_id) do nothing
             returning id::text, status, payload_hash`,
            [
                parsed.connectionId ?? null,
                parsed.provider,
                parsed.providerEventId,
                parsed.eventType,
                payloadHash,
                parsed.signatureVerifiedAt,
            ]
        );
        if (inserted.rows[0]) {
            return {
                id: inserted.rows[0].id,
                duplicate: false,
                status: inserted.rows[0].status,
                payloadHash: `sha256:${payloadHash.toString('hex')}`,
            };
        }

        const existing = await client.query<{
            id: string;
            status: string;
            payload_hash: Buffer;
        }>(
            `select id::text, status, payload_hash
             from founder_internal.provider_webhook_events
             where provider = $1 and provider_event_id = $2
             for update`,
            [parsed.provider, parsed.providerEventId]
        );
        const row = existing.rows[0];
        if (!row || !constantTimeBufferEqual(row.payload_hash, payloadHash)) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_CONFLICT',
                'Provider event ID was reused with a different payload.',
                409
            );
        }
        return {
            id: row.id,
            duplicate: true,
            status: row.status,
            payloadHash: `sha256:${payloadHash.toString('hex')}`,
        };
    });
}

export async function registerInboundEvent(input: unknown): Promise<{
    id: string;
    windowExpiresAt: string;
}> {
    const parsed = parseProviderStorageInput(registerInboundEventSchema, input);
    const inboundAt = new Date(parsed.inboundAt);
    const windowExpiresAt = new Date(inboundAt.getTime() + 24 * 60 * 60 * 1000);

    return withProviderTransaction(async (client) => {
        const webhook = await client.query<{
            provider: ProviderId;
            provider_event_id: string;
            connection_id: string | null;
        }>(
            `select provider, provider_event_id, connection_id::text
             from founder_internal.provider_webhook_events
             where id = $1::uuid
             for update`,
            [parsed.webhookEventId]
        );
        const verified = webhook.rows[0];
        if (
            !verified
            || verified.provider !== parsed.provider
            || verified.provider_event_id !== parsed.providerEventId
            || (
                verified.connection_id
                && verified.connection_id !== parsed.connectionId
            )
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_CONFLICT',
                'Inbound event is not tied to the verified webhook.',
                409
            );
        }

        const connection = await client.query<{
            provider: ProviderId;
            status: ProviderConnectionSummary['status'];
        }>(
            `select provider, status
             from founder_internal.provider_connections
             where id = $1::uuid
             for update`,
            [parsed.connectionId]
        );
        if (
            connection.rows[0]?.provider !== parsed.provider
            || !['connected', 'refresh_required'].includes(
                connection.rows[0]?.status ?? ''
            )
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Inbound event requires a matching active provider connection.',
                409
            );
        }

        const inserted = await client.query<{
            id: string;
            webhook_event_id: string;
            connection_id: string;
            provider: ProviderId;
            provider_event_id: string;
            recipient_scoped_id: string;
            inbound_at: Date | string;
            reply_window_expires_at: Date | string;
        }>(
            `insert into founder_internal.provider_inbound_events (
                webhook_event_id,
                connection_id,
                provider,
                provider_event_id,
                recipient_scoped_id,
                inbound_at,
                reply_window_expires_at
             )
             values ($1::uuid, $2::uuid, $3, $4, $5, $6, $7)
             on conflict do nothing
             returning
                id::text,
                webhook_event_id::text,
                connection_id::text,
                provider,
                provider_event_id,
                recipient_scoped_id,
                inbound_at,
                reply_window_expires_at`,
            [
                parsed.webhookEventId,
                parsed.connectionId,
                parsed.provider,
                parsed.providerEventId,
                parsed.recipientScopedId,
                inboundAt,
                windowExpiresAt,
            ]
        );
        const existing = inserted.rows[0]
            ? inserted
            : await client.query<{
                id: string;
                webhook_event_id: string;
                connection_id: string;
                provider: ProviderId;
                provider_event_id: string;
                recipient_scoped_id: string;
                inbound_at: Date | string;
                reply_window_expires_at: Date | string;
            }>(
                `select
                    id::text,
                    webhook_event_id::text,
                    connection_id::text,
                    provider,
                    provider_event_id,
                    recipient_scoped_id,
                    inbound_at,
                    reply_window_expires_at
                 from founder_internal.provider_inbound_events
                 where webhook_event_id = $1::uuid
                 for update`,
                [parsed.webhookEventId]
            );
        const row = existing.rows[0];
        if (
            !row
            || row.webhook_event_id !== parsed.webhookEventId
            || row.connection_id !== parsed.connectionId
            || row.provider !== parsed.provider
            || !constantTimeTextEqual(
                row.provider_event_id,
                parsed.providerEventId
            )
            || !constantTimeTextEqual(
                row.recipient_scoped_id,
                parsed.recipientScopedId
            )
            || new Date(row.inbound_at).getTime() !== inboundAt.getTime()
            || new Date(row.reply_window_expires_at).getTime()
                !== windowExpiresAt.getTime()
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_CONFLICT',
                'Inbound webhook was already associated with different event data.',
                409
            );
        }
        return {
            id: row.id,
            windowExpiresAt: toIso(row.reply_window_expires_at) as string,
        };
    });
}

export async function consumeEligibleInboundReply(
    input: unknown
): Promise<InboundReplyClaim> {
    const parsed = parseProviderStorageInput(consumeInboundReplySchema, input);
    const now = parsed.now ? new Date(parsed.now) : new Date();
    const expectedChannel = parsed.provider === 'meta' ? 'instagram' : 'tiktok';

    return withProviderTransaction(async (client) => {
        const inboundResult = await client.query<{
            id: string;
            webhook_event_id: string;
            connection_id: string;
            provider: ProviderId;
            provider_event_id: string;
            recipient_scoped_id: string;
            inbound_at: Date | string;
            reply_window_expires_at: Date | string;
            claimed_at: Date | string | null;
            claimed_approval_id: string | null;
        }>(
            `select
                id::text,
                webhook_event_id::text,
                connection_id::text,
                provider,
                provider_event_id,
                recipient_scoped_id,
                inbound_at,
                reply_window_expires_at,
                claimed_at,
                claimed_approval_id
             from founder_internal.provider_inbound_events
             where provider = $1 and provider_event_id = $2
             for update`,
            [parsed.provider, parsed.providerEventId]
        );
        const inbound = inboundResult.rows[0];
        if (
            !inbound
            || inbound.claimed_at
            || !constantTimeTextEqual(
                inbound.recipient_scoped_id,
                parsed.recipientScopedId
            )
            || new Date(inbound.inbound_at).getTime() > now.getTime()
            || new Date(inbound.reply_window_expires_at).getTime() <= now.getTime()
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_REPLY_WINDOW_CLOSED',
                'Inbound reply window is closed, mismatched, or already claimed.',
                409
            );
        }

        const approvalResult = await client.query<{
            id: string;
            status: string;
            action_type: string;
            channel: string;
            content_hash: string;
            is_demo: boolean;
        }>(
            `select id, status, action_type, channel, content_hash, is_demo
             from founder_internal.approval_actions
             where id = $1
             for update`,
            [parsed.approvalId]
        );
        const approval = approvalResult.rows[0];
        if (
            !approval
            || approval.is_demo
            || approval.status !== 'APPROVED'
            || approval.action_type !== 'social-reply'
            || approval.channel !== expectedChannel
            || approval.content_hash !== parsed.expectedContentHash
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Inbound reply requires a matching approved non-demo social-reply action.',
                409
            );
        }

        const outbox = await client.query<{ id: string }>(
            `select id::text
             from founder_internal.outbox
             where approval_id = $1
               and content_hash = $2
               and status = 'held'
             for update`,
            [parsed.approvalId, parsed.expectedContentHash]
        );
        if (!outbox.rows[0]) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Inbound reply approval requires a held core outbox record.',
                409
            );
        }

        const claimedAt = now.toISOString();
        await client.query(
            `update founder_internal.provider_inbound_events
             set claimed_at = $2, claimed_approval_id = $3
             where id = $1::uuid and claimed_at is null`,
            [inbound.id, now, parsed.approvalId]
        );
        await appendAudit(client, {
            actorType: 'system',
            actorId: 'provider-inbound-gate',
            action: 'provider.inbound_reply_claimed',
            entityType: 'provider_inbound_event',
            entityId: inbound.id,
            requestId: parsed.requestId,
            metadata: {
                provider: parsed.provider,
                approvalId: parsed.approvalId,
                contentHash: parsed.expectedContentHash,
                recipientLogged: false,
            },
        });

        return {
            inboundEventId: inbound.id,
            webhookEventId: inbound.webhook_event_id,
            connectionId: inbound.connection_id,
            provider: inbound.provider,
            providerEventId: inbound.provider_event_id,
            recipientScopedId: inbound.recipient_scoped_id,
            windowExpiresAt: toIso(inbound.reply_window_expires_at) as string,
            claimedAt,
            approvalId: parsed.approvalId,
        };
    });
}

export async function createProviderJob(
    input: unknown
): Promise<ProviderJobSummary> {
    const parsed = parseProviderStorageInput(createProviderJobSchema, input);
    const requestHash = hashCanonicalJson({
        provider: parsed.provider,
        connectionId: parsed.connectionId,
        jobType: parsed.jobType,
        approvalId: parsed.approvalId ?? null,
        approvalContentHash: parsed.approvalContentHash ?? null,
        inboundEventId: parsed.inboundEventId ?? null,
        reconciliationOfJobId: parsed.reconciliationOfJobId ?? null,
        idempotencyKey: parsed.idempotencyKey,
        requestPayload: parsed.requestPayload,
        maxAttempts: parsed.maxAttempts,
    });

    return withProviderTransaction(async (client) => {
        const replay = await client.query<JobRow>(
            `select
                id::text,
                provider,
                connection_id::text,
                job_type,
                approval_id,
                approval_content_hash,
                inbound_event_id::text,
                idempotency_key,
                request_hash,
                status,
                attempt_count,
                max_attempts,
                next_attempt_at,
                remote_reference,
                last_error,
                created_at,
                updated_at,
                completed_at
             from founder_internal.provider_jobs
             where idempotency_key = $1
             for update`,
            [parsed.idempotencyKey]
        );
        if (replay.rows[0]) {
            if (
                !constantTimeBufferEqual(
                    replay.rows[0].request_hash,
                    requestHash
                )
            ) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_CONFLICT',
                    'Provider idempotency key was reused with a different request.',
                    409
                );
            }
            return mapJob(replay.rows[0]);
        }

        const connection = await client.query<{
            provider: ProviderId;
            status: ProviderConnectionSummary['status'];
        }>(
            `select provider, status
             from founder_internal.provider_connections
             where id = $1::uuid`,
            [parsed.connectionId]
        );
        if (
            connection.rows[0]?.provider !== parsed.provider
            || !['connected', 'refresh_required'].includes(
                connection.rows[0]?.status ?? ''
            )
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Provider job requires a matching active connection.',
                409
            );
        }

        if (parsed.jobType === 'content_publish' || parsed.jobType === 'social_reply') {
            const expectedAction =
                parsed.jobType === 'content_publish' ? 'social-publish' : 'social-reply';
            const expectedChannel =
                parsed.provider === 'meta' ? 'instagram' : 'tiktok';
            const approval = await client.query<{
                status: string;
                action_type: string;
                channel: string;
                content_hash: string;
                is_demo: boolean;
            }>(
                `select status, action_type, channel, content_hash, is_demo
                 from founder_internal.approval_actions
                 where id = $1`,
                [parsed.approvalId]
            );
            const row = approval.rows[0];
            if (
                !row
                || row.is_demo
                || row.status !== 'APPROVED'
                || row.action_type !== expectedAction
                || row.channel !== expectedChannel
                || row.content_hash !== parsed.approvalContentHash
            ) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_POLICY_BLOCKED',
                    'Provider job does not match an approved non-demo action.',
                    409
                );
            }
        }

        if (parsed.jobType === 'social_reply') {
            const inbound = await client.query<{
                connection_id: string;
                claimed_approval_id: string | null;
                reply_window_expires_at: Date | string;
            }>(
                `select
                    connection_id::text,
                    claimed_approval_id,
                    reply_window_expires_at
                 from founder_internal.provider_inbound_events
                 where id = $1::uuid`,
                [parsed.inboundEventId]
            );
            const row = inbound.rows[0];
            if (
                !row
                || row.connection_id !== parsed.connectionId
                || row.claimed_approval_id !== parsed.approvalId
                || new Date(row.reply_window_expires_at).getTime() <= Date.now()
            ) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_REPLY_WINDOW_CLOSED',
                    'Social reply job requires the matching live inbound claim.',
                    409
                );
            }
        }

        if (parsed.jobType === 'reconcile_unknown') {
            const original = await client.query<{
                provider: ProviderId;
                connection_id: string;
                status: string;
            }>(
                `select provider, connection_id::text, status
                 from founder_internal.provider_jobs
                 where id = $1::uuid`,
                [parsed.reconciliationOfJobId]
            );
            const row = original.rows[0];
            if (
                !row
                || row.provider !== parsed.provider
                || row.connection_id !== parsed.connectionId
                || row.status !== 'UNKNOWN'
            ) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_POLICY_BLOCKED',
                    'Reconciliation jobs can only reference a matching UNKNOWN job.',
                    409
                );
            }
        }

        const inserted = await client.query<JobRow>(
            `insert into founder_internal.provider_jobs (
                provider,
                connection_id,
                job_type,
                approval_id,
                approval_content_hash,
                inbound_event_id,
                reconciliation_of_job_id,
                idempotency_key,
                request_payload,
                request_hash,
                max_attempts,
                next_attempt_at
             )
             values (
                $1, $2::uuid, $3, $4, $5, $6::uuid, $7::uuid,
                $8, $9, $10, $11, now()
             )
             on conflict (idempotency_key) do nothing
             returning
                id::text,
                provider,
                connection_id::text,
                job_type,
                approval_id,
                approval_content_hash,
                inbound_event_id::text,
                idempotency_key,
                request_hash,
                status,
                attempt_count,
                max_attempts,
                next_attempt_at,
                remote_reference,
                last_error,
                created_at,
                updated_at,
                completed_at`,
            [
                parsed.provider,
                parsed.connectionId,
                parsed.jobType,
                parsed.approvalId ?? null,
                parsed.approvalContentHash ?? null,
                parsed.inboundEventId ?? null,
                parsed.reconciliationOfJobId ?? null,
                parsed.idempotencyKey,
                parsed.requestPayload,
                requestHash,
                parsed.maxAttempts,
            ]
        );
        let job = inserted.rows[0];
        if (!job) {
            const existing = await client.query<JobRow>(
                `select
                    id::text,
                    provider,
                    connection_id::text,
                    job_type,
                    approval_id,
                    approval_content_hash,
                    inbound_event_id::text,
                    idempotency_key,
                    request_hash,
                    status,
                    attempt_count,
                    max_attempts,
                    next_attempt_at,
                    remote_reference,
                    last_error,
                    created_at,
                    updated_at,
                    completed_at
                 from founder_internal.provider_jobs
                 where idempotency_key = $1
                 for update`,
                [parsed.idempotencyKey]
            );
            job = existing.rows[0];
            if (!job || !constantTimeBufferEqual(job.request_hash, requestHash)) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_CONFLICT',
                    'Provider idempotency key was reused with a different request.',
                    409
                );
            }
        }

        await appendAudit(client, {
            actorType: 'system',
            actorId: 'provider-job-planner',
            action: 'provider.job_created',
            entityType: 'provider_job',
            entityId: job.id,
            requestId: parsed.requestId,
            afterState: mapJob(job),
            metadata: {
                requestPayloadLogged: false,
                idempotentReplay: !inserted.rows[0],
            },
        });
        return mapJob(job);
    });
}

export async function claimProviderExecution(
    input: unknown
): Promise<ProviderExecutionClaim> {
    const parsed = parseProviderStorageInput(claimProviderExecutionSchema, input);

    return withProviderTransaction(async (client) => {
        await quarantineStaleProviderExecutionsWithClient(client, {
            limit: 10,
            requestId: parsed.requestId,
        });
        const result = await client.query<{
            job_id: string;
            provider: ProviderId;
            connection_id: string;
            connection_status: string;
            job_type: 'content_publish' | 'social_reply';
            idempotency_key: string;
            job_status: string;
            attempt_count: number;
            max_attempts: number;
            next_attempt_at: Date | string | null;
            inbound_event_id: string | null;
            approval_id: string;
            action_type: 'social-reply' | 'social-publish';
            channel: 'instagram' | 'tiktok';
            approval_status: string;
            job_approval_content_hash: string;
            content_hash: string;
            target_label: string;
            payload_summary: string;
            payload: Record<string, unknown>;
            is_demo: boolean;
        }>(
            `select
                j.id::text as job_id,
                j.provider,
                j.connection_id::text,
                c.status as connection_status,
                j.job_type,
                j.idempotency_key,
                j.status as job_status,
                j.attempt_count,
                j.max_attempts,
                j.next_attempt_at,
                j.inbound_event_id::text,
                a.id as approval_id,
                a.action_type,
                a.channel,
                a.status as approval_status,
                j.approval_content_hash as job_approval_content_hash,
                a.content_hash,
                a.target_label,
                a.payload_summary,
                a.payload,
                a.is_demo
             from founder_internal.provider_jobs j
             join founder_internal.provider_connections c on c.id = j.connection_id
             join founder_internal.approval_actions a on a.id = j.approval_id
             where j.id = $1::uuid
             for update of j, c, a`,
            [parsed.jobId]
        );
        const row = result.rows[0];
        const expectedChannel = row?.provider === 'meta' ? 'instagram' : 'tiktok';
        const expectedAction =
            row?.job_type === 'content_publish' ? 'social-publish' : 'social-reply';
        if (
            !row
            || !['content_publish', 'social_reply'].includes(row.job_type)
            || row.job_status !== 'PENDING'
            || row.connection_status !== 'connected'
            || row.attempt_count >= row.max_attempts
            || (
                row.next_attempt_at
                && new Date(row.next_attempt_at).getTime() > Date.now()
            )
            || row.is_demo
            || row.approval_status !== 'APPROVED'
            || row.job_approval_content_hash !== row.content_hash
            || row.content_hash !== parsed.expectedContentHash
            || row.channel !== expectedChannel
            || row.action_type !== expectedAction
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Provider execution claim is not eligible.',
                409
            );
        }

        if (row.job_type === 'social_reply') {
            const inbound = await client.query<{
                claimed_approval_id: string | null;
                reply_window_expires_at: Date | string;
            }>(
                `select claimed_approval_id, reply_window_expires_at
                 from founder_internal.provider_inbound_events
                 where id = $1::uuid
                 for update`,
                [row.inbound_event_id]
            );
            if (
                inbound.rows[0]?.claimed_approval_id !== row.approval_id
                || new Date(
                    inbound.rows[0]?.reply_window_expires_at ?? 0
                ).getTime() <= Date.now()
            ) {
                throw new ProviderStorageError(
                    'PROVIDER_STORAGE_REPLY_WINDOW_CLOSED',
                    'Inbound reply claim expired before execution.',
                    409
                );
            }
        }

        const outboxResult = await client.query<{ id: string }>(
            `select id::text
             from founder_internal.outbox
             where approval_id = $1
               and content_hash = $2
               and status = 'held'
             for update`,
            [row.approval_id, row.content_hash]
        );
        const outbox = outboxResult.rows[0];
        if (!outbox) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Provider execution requires a held core outbox record.',
                409
            );
        }

        await client.query(
            `update founder_internal.provider_jobs
             set
                status = 'RUNNING',
                worker_id = $2,
                attempt_count = attempt_count + 1,
                locked_at = now(),
                last_error = null
             where id = $1::uuid`,
            [row.job_id, parsed.workerId]
        );
        await client.query(
            `update founder_internal.outbox
             set
                status = 'processing',
                attempt_count = attempt_count + 1,
                locked_at = now(),
                last_error = null
             where id = $1::bigint`,
            [outbox.id]
        );
        await client.query(
            `update founder_internal.approval_actions
             set status = 'EXECUTING'
             where id = $1`,
            [row.approval_id]
        );
        await appendAudit(client, {
            actorType: 'system',
            actorId: parsed.workerId,
            action: 'provider.execution_claimed',
            entityType: 'provider_job',
            entityId: row.job_id,
            requestId: parsed.requestId,
            metadata: {
                approvalId: row.approval_id,
                contentHash: row.content_hash,
                outboxId: outbox.id,
                payloadSource: 'founder_internal.approval_actions',
            },
        });

        return {
            jobId: row.job_id,
            idempotencyKey: row.idempotency_key,
            connectionId: row.connection_id,
            outboxId: outbox.id,
            provider: row.provider,
            jobType: row.job_type,
            approval: {
                id: row.approval_id,
                actionType: row.action_type,
                channel: row.channel,
                contentHash: row.content_hash,
                targetLabel: row.target_label,
                payloadSummary: row.payload_summary,
                payload: row.payload,
            },
        };
    });
}

export async function quarantineStaleProviderExecutions(
    input: unknown
): Promise<number> {
    const parsed = parseProviderStorageInput(
        quarantineStaleProviderExecutionsSchema,
        input
    );
    return withProviderTransaction((client) =>
        quarantineStaleProviderExecutionsWithClient(client, parsed)
    );
}

export async function recordProviderJobOutcome(
    input: unknown
): Promise<ProviderJobSummary> {
    const parsed = parseProviderStorageInput(providerJobOutcomeSchema, input);

    return withProviderTransaction(async (client) => {
        const result = await client.query<JobRow & {
            approval_id: string | null;
            approval_content_hash: string | null;
        }>(
            `select
                id::text,
                provider,
                connection_id::text,
                job_type,
                approval_id,
                approval_content_hash,
                inbound_event_id::text,
                idempotency_key,
                request_hash,
                status,
                attempt_count,
                max_attempts,
                next_attempt_at,
                remote_reference,
                last_error,
                created_at,
                updated_at,
                completed_at
             from founder_internal.provider_jobs
             where id = $1::uuid
             for update`,
            [parsed.jobId]
        );
        const before = result.rows[0];
        if (
            !before
            || before.status !== 'RUNNING'
            || !['content_publish', 'social_reply'].includes(before.job_type)
            || !before.approval_id
            || !before.approval_content_hash
        ) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_POLICY_BLOCKED',
                'Only a running external provider job can record this outcome.',
                409
            );
        }

        const outbox = await client.query<{ id: string }>(
            `select id::text
             from founder_internal.outbox
             where approval_id = $1
               and content_hash = $2
               and status = 'processing'
             for update`,
            [before.approval_id, before.approval_content_hash]
        );
        if (!outbox.rows[0]) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_CONFLICT',
                'Processing core outbox record was not found.',
                409
            );
        }

        const remoteReference =
            parsed.status === 'SUCCEEDED' ? parsed.remoteReference : null;
        const failureReason =
            parsed.status === 'SUCCEEDED' ? null : parsed.failureReason;
        const jobResult = await client.query<JobRow>(
            `update founder_internal.provider_jobs
             set
                status = $2,
                completed_at = now(),
                locked_at = null,
                remote_reference = $3,
                outcome = $4,
                last_error = $5
             where id = $1::uuid
             returning
                id::text,
                provider,
                connection_id::text,
                job_type,
                approval_id,
                approval_content_hash,
                inbound_event_id::text,
                idempotency_key,
                request_hash,
                status,
                attempt_count,
                max_attempts,
                next_attempt_at,
                remote_reference,
                last_error,
                created_at,
                updated_at,
                completed_at`,
            [
                parsed.jobId,
                parsed.status,
                remoteReference,
                parsed.outcome,
                failureReason,
            ]
        );
        await client.query(
            `update founder_internal.outbox
             set
                status = $2,
                completed_at = now(),
                locked_at = null,
                last_error = $3
             where id = $1::bigint`,
            [
                outbox.rows[0].id,
                parsed.status.toLowerCase(),
                failureReason,
            ]
        );
        await client.query(
            `update founder_internal.approval_actions
             set
                status = $2,
                executed_at = now(),
                provider_reference = $3,
                failure_reason = $4
             where id = $1`,
            [
                before.approval_id,
                parsed.status,
                remoteReference,
                failureReason,
            ]
        );

        if (parsed.status === 'UNKNOWN') {
            await client.query(
                `insert into founder_internal.provider_reconciliations (
                    job_id,
                    status,
                    next_check_at,
                    evidence
                 )
                 values ($1::uuid, 'OPEN', now(), $2)
                 on conflict (job_id) do nothing`,
                [
                    parsed.jobId,
                    {
                        reason: failureReason,
                        automaticRetry: false,
                        reconcileOnly: true,
                    },
                ]
            );
        }

        const after = jobResult.rows[0];
        await appendAudit(client, {
            actorType: 'system',
            actorId: 'provider-executor',
            action: `provider.job_${parsed.status.toLowerCase()}`,
            entityType: 'provider_job',
            entityId: parsed.jobId,
            requestId: parsed.requestId,
            beforeState: mapJob(before),
            afterState: mapJob(after),
            metadata: {
                automaticRetry: false,
                reconcileOnly: parsed.status === 'UNKNOWN',
            },
        });
        return mapJob(after);
    });
}

export async function listOpenProviderReconciliations(): Promise<
    ProviderReconciliationSummary[]
> {
    return withProviderTransaction(async (client) => {
        const result = await client.query<ReconciliationRow>(
            `select
                id::text,
                job_id::text,
                status,
                attempt_count,
                next_check_at,
                resolution_note,
                resolved_at,
                created_at,
                updated_at
             from founder_internal.provider_reconciliations
             where status in ('OPEN', 'CHECKING', 'MANUAL_REVIEW')
             order by next_check_at nulls last, created_at, id`
        );
        return result.rows.map(mapReconciliation);
    }, 'repeatable read', true);
}
