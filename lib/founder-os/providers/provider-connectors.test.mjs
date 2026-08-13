import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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
        if (specifier === 'zod') return nodeRequire('zod');
        if (specifier.startsWith('node:')) return nodeRequire(specifier);
        throw new Error(`Unexpected test dependency: ${specifier}`);
    };
    Function('exports', 'require', 'module', output)(
        testModule.exports,
        localRequire,
        testModule
    );
    return testModule.exports;
}

const contracts = loadTypeScriptCommonJs('./contracts.ts');
const config = loadTypeScriptCommonJs('./config.ts', {
    './contracts': contracts,
});
const http = loadTypeScriptCommonJs('./http.ts');
const meta = loadTypeScriptCommonJs('./meta.ts', {
    './config': config,
    './http': http,
});
const tiktok = loadTypeScriptCommonJs('./tiktok.ts', {
    './config': config,
    './http': http,
});
const executor = loadTypeScriptCommonJs('./executor.ts', {
    './contracts': contracts,
    './http': http,
});
const metaWebhook = loadTypeScriptCommonJs('./meta-webhook.ts');

const metaCredentials = {
    connectionId: 'connection-1',
    provider: 'meta',
    accountId: 'ig-account-1',
    accountLabel: 'VGP',
    accessToken: 'meta-test-token',
    refreshToken: null,
    grantedScopes: ['instagram_business_content_publish'],
    expiresAt: null,
};

test('approval payload schemas require explicit consent and exact operations', () => {
    assert.equal(
        contracts.providerActionPayloadSchema.safeParse({
            operation: 'tiktok.draft.init',
            source: {
                source: 'PULL_FROM_URL',
                videoUrl: 'https://media.virzyguns.com/video.mp4',
            },
            explicitConsent: false,
        }).success,
        false
    );
    assert.equal(
        contracts.providerActionPayloadSchema.safeParse({
            operation: 'meta.inbound.reply',
            recipientScopedId: 'recipient',
            providerEventId: 'verified-event',
            text: 'Thanks for reaching out.',
        }).success,
        true
    );
    assert.equal(
        contracts.providerActionPayloadSchema.safeParse({
            operation: 'meta.inbound.reply',
            recipientScopedId: 'recipient',
            text: 'Cold message',
        }).success,
        false
    );
});

test('Meta authorization requests least named scopes and never exposes app secret', () => {
    const client = new meta.MetaProviderClient({
        appId: 'app-id',
        appSecret: 'must-not-appear',
        redirectUri: 'https://www.virzyguns.com/api/callback',
        apiVersion: 'v23.0',
        allowedMediaHosts: ['media.virzyguns.com'],
    });
    const authorizationUrl = client.buildAuthorizationUrl('state-value');
    assert.match(authorizationUrl, /instagram_business_manage_insights/);
    assert.match(authorizationUrl, /instagram_business_manage_messages/);
    assert.doesNotMatch(authorizationUrl, /must-not-appear/);
});

test('Meta write uses bearer auth and network ambiguity is marked UNKNOWN-eligible', async () => {
    let captured;
    const successClient = new meta.MetaProviderClient(
        {
            appId: 'app-id',
            appSecret: 'app-secret',
            redirectUri: 'https://www.virzyguns.com/api/callback',
            apiVersion: 'v23.0',
            allowedMediaHosts: ['media.virzyguns.com'],
        },
        async (url, init) => {
            captured = { url, init };
            return Response.json({ id: 'container-1' });
        }
    );
    const result = await successClient.createReelContainer(metaCredentials, {
        videoUrl: 'https://media.virzyguns.com/video.mp4',
        caption: 'Approved caption',
        shareToFeed: true,
    });
    assert.equal(result.providerReference, 'container-1');
    assert.equal(captured.init.method, 'POST');
    assert.equal(captured.init.headers.get('Authorization'), 'Bearer meta-test-token');
    assert.doesNotMatch(captured.url, /meta-test-token/);

    const uncertainClient = new meta.MetaProviderClient(
        {
            appId: 'app-id',
            appSecret: 'app-secret',
            redirectUri: 'https://www.virzyguns.com/api/callback',
            apiVersion: 'v23.0',
            allowedMediaHosts: ['media.virzyguns.com'],
        },
        async () => {
            throw new TypeError('network down');
        }
    );
    await assert.rejects(
        uncertainClient.createReelContainer(metaCredentials, {
            videoUrl: 'https://media.virzyguns.com/video.mp4',
            caption: 'Approved caption',
            shareToFeed: false,
        }),
        (error) =>
            error instanceof http.ProviderRequestError
            && error.ambiguous === true
            && error.providerCode === 'NETWORK_ERROR'
    );
});

test('TikTok Direct Post is disabled without audit feature flag while draft works', async () => {
    let calls = 0;
    const client = new tiktok.TikTokProviderClient(
        {
            clientKey: 'client-key',
            clientSecret: 'client-secret',
            redirectUri: 'https://www.virzyguns.com/api/callback',
            allowedMediaHosts: ['media.virzyguns.com'],
            directPostEnabled: false,
        },
        async () => {
            calls += 1;
            return Response.json({
                data: { publish_id: 'draft-1' },
                error: { code: 'ok', message: '', log_id: 'safe-log-id' },
            });
        }
    );
    const credentials = {
        connectionId: 'connection-2',
        provider: 'tiktok',
        accountId: 'creator-1',
        accountLabel: 'VGP',
        accessToken: 'tiktok-test-token',
        refreshToken: 'refresh',
        grantedScopes: ['video.upload', 'video.publish'],
        expiresAt: null,
    };
    const authorizationUrl = client.buildAuthorizationUrl('state-value');
    assert.doesNotMatch(authorizationUrl, /video\.publish/);
    assert.match(authorizationUrl, /video\.upload/);
    await assert.rejects(
        client.initDirectPost(credentials, {
            videoUrl: 'https://media.virzyguns.com/video.mp4',
            title: 'Approved post',
            privacyLevel: 'SELF_ONLY',
            allowComment: false,
            allowDuet: false,
            allowStitch: false,
            brandContent: false,
            brandOrganic: true,
            isAiGenerated: false,
        }),
        (error) =>
            error instanceof http.ProviderRequestError
            && error.providerCode === 'DIRECT_POST_AUDIT_REQUIRED'
    );
    assert.equal(calls, 0);

    const draft = await client.initDraft(
        credentials,
        'https://media.virzyguns.com/video.mp4'
    );
    assert.equal(draft.providerReference, 'draft-1');
    assert.equal(calls, 1);
});

test('provider success with persistence failure becomes UNKNOWN, never FAILED', async () => {
    const outcomes = [];
    let outcomeAttempts = 0;
    const result = await executor.executeClaimedProviderAction(
        {
            jobId: 'job-1',
            idempotencyKey: 'key-1',
            connectionId: 'connection-1',
            outboxId: 'outbox-1',
            provider: 'meta',
            jobType: 'content_publish',
            approval: {
                id: 'approval-1',
                actionType: 'social-publish',
                channel: 'instagram',
                contentHash: `sha256:${'a'.repeat(64)}`,
                targetLabel: 'VGP Instagram',
                payloadSummary: 'Approved Reel',
                payload: {
                    operation: 'meta.reel.create-container',
                    videoUrl: 'https://media.virzyguns.com/video.mp4',
                    caption: 'Approved',
                    shareToFeed: true,
                },
            },
        },
        'request-1',
        {
            async loadCredentials() {
                return metaCredentials;
            },
            async recordOutcome(outcome) {
                outcomeAttempts += 1;
                if (outcomeAttempts === 1) {
                    throw new Error('database unavailable');
                }
                outcomes.push(outcome);
            },
        },
        {
            meta: {
                async createReelContainer() {
                    return {
                        providerReference: 'container-accepted',
                        detail: { containerId: 'container-accepted' },
                    };
                },
            },
            tiktok: {},
        }
    );
    assert.equal(result.status, 'UNKNOWN');
    assert.equal(outcomes[0].status, 'UNKNOWN');
    assert.match(outcomes[0].failureReason, /manual reconciliation required/);
});

test('Meta inbound eligibility starts only from a valid signed non-echo webhook', () => {
    const body = new TextEncoder().encode(JSON.stringify({
        object: 'instagram',
        entry: [{
            id: 'owned-account',
            messaging: [
                {
                    sender: { id: 'customer-1' },
                    recipient: { id: 'owned-account' },
                    timestamp: 1_800_000_000_000,
                    message: { mid: 'message-1' },
                },
                {
                    sender: { id: 'owned-account' },
                    recipient: { id: 'customer-1' },
                    timestamp: 1_800_000_000_001,
                    message: { mid: 'echo-1', is_echo: true },
                },
            ],
        }],
    }));
    const signature = nodeRequire('node:crypto')
        .createHmac('sha256', 'app-secret')
        .update(body)
        .digest('hex');
    assert.equal(
        metaWebhook.verifyMetaWebhookSignature(
            body,
            `sha256=${signature}`,
            'app-secret'
        ),
        true
    );
    assert.equal(
        metaWebhook.verifyMetaWebhookSignature(
            body,
            `sha256=${'0'.repeat(64)}`,
            'app-secret'
        ),
        false
    );
    const events = metaWebhook.parseMetaInboundEvents(
        JSON.parse(new TextDecoder().decode(body))
    );
    assert.deepEqual(events.map((event) => ({
        providerEventId: event.providerEventId,
        recipientScopedId: event.recipientScopedId,
    })), [{
        providerEventId: 'message-1',
        recipientScopedId: 'customer-1',
    }]);
});

test('execution route claims exact approved DB payload and has no auto-publish path', () => {
    const route = readFileSync(
        new URL(
            '../../../app/api/founder/os/providers/[provider]/actions/execute/route.ts',
            import.meta.url
        ),
        'utf8'
    );
    assert.match(route, /authorizeFounderOsRequest\(request, true\)/);
    assert.match(route, /claimProviderExecution\(/);
    assert.match(route, /expectedContentHash: input\.expectedContentHash/);
    assert.match(route, /requestPayload: \{\}/);
    assert.doesNotMatch(route, /payload:\s*(?:input|bodyResult)/);
    assert.doesNotMatch(route, /cron|schedule|setInterval/);
});

test('OAuth callback accepts cross-site redirect only through state and nonce', () => {
    const route = readFileSync(
        new URL(
            '../../../app/api/founder/os/providers/[provider]/oauth/callback/route.ts',
            import.meta.url
        ),
        'utf8'
    );
    assert.doesNotMatch(route, /authorizeFounderOsRequest/);
    assert.match(route, /request\.cookies\.get\(`vgp_oauth_\$\{provider\}`\)/);
    assert.match(route, /consumeOAuthState\(\{/);
    assert.match(route, /state: stateValue/);
    assert.match(route, /nonce/);
    assert.match(route, /error instanceof ProviderRequestError/);
    assert.match(route, /isProviderStorageError\(error\)/);
    assert.match(route, /phase/);
    assert.doesNotMatch(
        route,
        /console\.error\([^)]*(?:stateValue|nonce|tokens|appSecret|clientSecret)/s
    );
});

test('provider sources never log tokens or raw provider errors', () => {
    for (const file of [
        './meta.ts',
        './tiktok.ts',
        './http.ts',
        './executor.ts',
    ]) {
        const source = readFileSync(new URL(file, import.meta.url), 'utf8');
        assert.doesNotMatch(
            source,
            /console\.(?:log|warn|error)/,
            `${file} must not log provider data`
        );
    }
});
