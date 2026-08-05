import assert from 'node:assert/strict';
import * as nodeCrypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { inspect } from 'node:util';
import test from 'node:test';
import ts from 'typescript';

const nodeRequire = createRequire(import.meta.url);

function loadTypeScriptCommonJs(relativeUrl, dependencyMap = {}) {
    const filename = new URL(relativeUrl, import.meta.url);
    const source = readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            esModuleInterop: true,
        },
        fileName: filename.pathname,
    }).outputText;
    const testModule = { exports: {} };
    const localRequire = (specifier) => {
        if (specifier in dependencyMap) return dependencyMap[specifier];
        throw new Error(`Unexpected test dependency: ${specifier}`);
    };

    Function('exports', 'require', 'module', output)(
        testModule.exports,
        localRequire,
        testModule
    );
    return testModule.exports;
}

const errors = loadTypeScriptCommonJs('./errors.ts');
const types = loadTypeScriptCommonJs('./types.ts');
const crypto = loadTypeScriptCommonJs('./crypto.ts', {
    'node:crypto': nodeCrypto,
    './errors': errors,
});
const validation = loadTypeScriptCommonJs('./validation.ts', {
    zod: nodeRequire('zod'),
    './errors': errors,
    './types': types,
});

const TEST_KEY = `hex:${'42'.repeat(32)}`;
const CONNECTION_ID = '11111111-1111-4111-8111-111111111111';
const JOB_ID = '22222222-2222-4222-8222-222222222222';
const CONTENT_HASH = `sha256:${'a'.repeat(64)}`;

function withEncryptionEnvironment(callback) {
    const previousKey = process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY;
    const previousVersion =
        process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION;
    process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY = TEST_KEY;
    process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION = '1';
    try {
        return callback();
    } finally {
        if (previousKey === undefined) {
            delete process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY;
        } else {
            process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY = previousKey;
        }
        if (previousVersion === undefined) {
            delete process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION;
        } else {
            process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION =
                previousVersion;
        }
    }
}

test('AES-256-GCM round-trips and authenticates token context', () => {
    withEncryptionEnvironment(() => {
        const aad = (version) =>
            crypto.makeCredentialAad(
                'meta',
                CONNECTION_ID,
                'access',
                version
            );
        const envelope = crypto.encryptSecret('private-access-token', aad);

        assert.equal(envelope.algorithm, 'aes-256-gcm');
        assert.equal(envelope.iv.byteLength, 12);
        assert.equal(envelope.authTag.byteLength, 16);
        assert.equal(crypto.decryptSecret(envelope, aad), 'private-access-token');
        assert.equal(
            envelope.ciphertext.includes(Buffer.from('private-access-token')),
            false
        );

        assert.throws(
            () => crypto.decryptSecret(
                envelope,
                (version) =>
                    crypto.makeCredentialAad(
                        'tiktok',
                        CONNECTION_ID,
                        'access',
                        version
                    )
            ),
            (error) =>
                error.code === 'PROVIDER_STORAGE_DECRYPTION_FAILED'
        );

        const tampered = {
            ...envelope,
            ciphertext: Buffer.from(envelope.ciphertext),
        };
        tampered.ciphertext[0] ^= 1;
        assert.throws(
            () => crypto.decryptSecret(tampered, aad),
            (error) =>
                error.code === 'PROVIDER_STORAGE_DECRYPTION_FAILED'
        );
    });
});

test('credential encryption fails closed for missing or wrong-version keys', () => {
    const previousKey = process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY;
    const previousVersion =
        process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION;
    delete process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY;
    delete process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION;
    try {
        assert.throws(
            () => crypto.encryptSecret('secret', () => Buffer.from('aad')),
            (error) =>
                error.code === 'PROVIDER_STORAGE_ENCRYPTION_KEY_MISSING'
        );

        process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY = TEST_KEY;
        process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION = '1';
        const envelope = crypto.encryptSecret(
            'secret',
            (version) => Buffer.from(`aad-${version}`)
        );
        process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION = '2';
        assert.throws(
            () => crypto.decryptSecret(
                envelope,
                (version) => Buffer.from(`aad-${version}`)
            ),
            (error) =>
                error.code === 'PROVIDER_STORAGE_KEY_VERSION_MISMATCH'
        );
    } finally {
        if (previousKey === undefined) {
            delete process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY;
        } else {
            process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY = previousKey;
        }
        if (previousVersion === undefined) {
            delete process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION;
        } else {
            process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION =
                previousVersion;
        }
    }
});

test('credential and PKCE containers redact secrets from JSON and inspection', () => {
    const credentials = new types.DecryptedProviderCredentials({
        accessToken: 'access-secret',
        refreshToken: 'refresh-secret',
        tokenType: 'Bearer',
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        issuedAt: null,
    });
    const consumedState = new types.ConsumedOAuthState({
        codeVerifier: 'pkce-secret',
        provider: 'meta',
        redirectUri: 'https://example.com/callback',
        returnTo: '/founder/os',
    });

    assert.equal(credentials.accessToken, 'access-secret');
    assert.equal(consumedState.codeVerifier, 'pkce-secret');
    assert.doesNotMatch(JSON.stringify(credentials), /access-secret|refresh-secret/);
    assert.doesNotMatch(inspect(credentials), /access-secret|refresh-secret/);
    assert.doesNotMatch(JSON.stringify(consumedState), /pkce-secret/);
    assert.doesNotMatch(inspect(consumedState), /pkce-secret/);
});

test('validation rejects secret payloads, oversized webhooks, and ambiguous jobs', () => {
    assert.throws(
        () => validation.parseProviderStorageInput(
            validation.createProviderJobSchema,
            {
                provider: 'meta',
                connectionId: CONNECTION_ID,
                jobType: 'content_publish',
                approvalId: 'approval-1',
                approvalContentHash: CONTENT_HASH,
                idempotencyKey: 'job-1',
                requestPayload: { accessToken: 'must-not-persist-here' },
                maxAttempts: 1,
                requestId: 'request-1',
            }
        ),
        (error) => error.code === 'PROVIDER_STORAGE_INVALID_INPUT'
    );

    assert.throws(
        () => validation.parseProviderStorageInput(
            validation.recordWebhookSchema,
            {
                provider: 'meta',
                providerEventId: 'event-1',
                eventType: 'message',
                rawBody: new Uint8Array(1024 * 1024 + 1),
                signatureVerifiedAt: new Date().toISOString(),
            }
        ),
        (error) => error.code === 'PROVIDER_STORAGE_INVALID_INPUT'
    );

    assert.throws(
        () => validation.parseProviderStorageInput(
            validation.createProviderJobSchema,
            {
                provider: 'meta',
                connectionId: CONNECTION_ID,
                jobType: 'account_sync',
                approvalId: 'approval-1',
                approvalContentHash: CONTENT_HASH,
                idempotencyKey: 'job-2',
                requestId: 'request-2',
            }
        ),
        (error) => error.code === 'PROVIDER_STORAGE_INVALID_INPUT'
    );

    assert.doesNotThrow(() => validation.parseProviderStorageInput(
        validation.claimProviderExecutionSchema,
        {
            jobId: JOB_ID,
            workerId: 'executor-1',
            expectedContentHash: CONTENT_HASH,
            requestId: 'request-3',
        }
    ));
});

test('migration keeps provider secrets private and UNKNOWN reconcile-only', () => {
    const migration = readFileSync(
        new URL(
            '../../../supabase/migrations/20260729095858_founder_os_provider_storage.sql',
            import.meta.url
        ),
        'utf8'
    );

    assert.match(migration, /access_token_ciphertext bytea not null/i);
    assert.match(migration, /access_token_iv bytea not null/i);
    assert.match(migration, /access_token_auth_tag bytea not null/i);
    assert.doesNotMatch(migration, /\baccess_token\s+text\b/i);
    assert.match(migration, /state_hash bytea primary key/i);
    assert.match(migration, /code_verifier_ciphertext bytea not null/i);
    assert.match(migration, /consumed_at timestamptz/i);
    assert.match(migration, /unique \(provider, provider_event_id\)/i);
    assert.match(
        migration,
        /reply_window_expires_at = inbound_at \+ interval '24 hours'/i
    );
    assert.match(
        migration,
        /alter table founder_internal\.provider_credentials enable row level security/i
    );
    assert.match(
        migration,
        /where rolname in \('anon', 'authenticated', 'service_role'\)/i
    );
    assert.match(
        migration,
        /provider_jobs_dispatch_idx[\s\S]*where status = 'PENDING'/i
    );
    assert.match(
        migration,
        /provider_jobs_stale_execution_idx[\s\S]*status = 'RUNNING'[\s\S]*content_publish[\s\S]*social_reply/i
    );
    assert.match(
        migration,
        /provider_jobs_lifecycle[\s\S]*status = 'RUNNING'[\s\S]*locked_at is not null/i
    );
    assert.doesNotMatch(
        migration,
        /old\.status = 'UNKNOWN'[\s\S]{0,120}new\.status/i
    );
});

test('execution claim loads immutable approval payload from the database', () => {
    const repository = readFileSync(
        new URL('./repository.ts', import.meta.url),
        'utf8'
    );
    const claimStart = repository.indexOf(
        'export async function claimProviderExecution'
    );
    const outcomeStart = repository.indexOf(
        'export async function recordProviderJobOutcome'
    );
    const claimSource = repository.slice(claimStart, outcomeStart);

    assert.match(
        claimSource,
        /join founder_internal\.approval_actions a on a\.id = j\.approval_id/i
    );
    assert.match(claimSource, /\ba\.payload\b/i);
    assert.match(
        claimSource,
        /j\.approval_content_hash as job_approval_content_hash/i
    );
    assert.match(
        claimSource,
        /row\.job_approval_content_hash !== row\.content_hash/i
    );
    assert.match(claimSource, /status = 'RUNNING'/i);
    assert.match(claimSource, /status = 'processing'/i);
    assert.match(claimSource, /set status = 'EXECUTING'/i);
    assert.match(
        claimSource,
        /payloadSource: 'founder_internal\.approval_actions'/
    );
    assert.doesNotMatch(claimSource, /parsed\.requestPayload/);
});

test('stale RUNNING executions are quarantined without a resend path', () => {
    const repository = readFileSync(
        new URL('./repository.ts', import.meta.url),
        'utf8'
    );
    const quarantineStart = repository.indexOf(
        'async function quarantineStaleProviderExecutionsWithClient'
    );
    const readSummaryStart = repository.indexOf(
        'async function readConnectionSummary'
    );
    const quarantineSource = repository.slice(
        quarantineStart,
        readSummaryStart
    );

    assert.match(
        quarantineSource,
        /status = 'RUNNING'[\s\S]*job_type in \('content_publish', 'social_reply'\)/i
    );
    assert.match(quarantineSource, /status = 'UNKNOWN'/i);
    assert.match(quarantineSource, /status = 'unknown'/i);
    assert.match(quarantineSource, /status = 'UNKNOWN'[\s\S]*EXECUTING/i);
    assert.match(
        quarantineSource,
        /values \(\$1::uuid, 'OPEN', now\(\), \$2\)/i
    );
    assert.match(quarantineSource, /automaticRetry: false/);
    assert.doesNotMatch(quarantineSource, /status = 'PENDING'/i);
});

test('provider job idempotency hash binds identity and exact approval hash', () => {
    const repository = readFileSync(
        new URL('./repository.ts', import.meta.url),
        'utf8'
    );
    const createStart = repository.indexOf(
        'export async function createProviderJob'
    );
    const claimStart = repository.indexOf(
        'export async function claimProviderExecution'
    );
    const createSource = repository.slice(createStart, claimStart);

    assert.match(createSource, /hashCanonicalJson\(\{/);
    assert.match(createSource, /provider: parsed\.provider/);
    assert.match(createSource, /connectionId: parsed\.connectionId/);
    assert.match(
        createSource,
        /approvalContentHash: parsed\.approvalContentHash/
    );
    assert.match(createSource, /requestPayload: parsed\.requestPayload/);
    assert.match(
        createSource,
        /constantTimeBufferEqual\([\s\S]*request_hash[\s\S]*requestHash/
    );
});
