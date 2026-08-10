import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { authenticateFounderOsBridge } from '../../lib/founder-os/bridge/auth.ts';
import { redactBridgeAuditValue } from '../../lib/founder-os/bridge/redaction.ts';

const ROOT = process.cwd();
const BRIDGE_ROUTE_ROOT = path.join(
    ROOT,
    'app',
    'api',
    'founder',
    'os',
    'bridge',
    'v1'
);

async function filesBelow(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? filesBelow(fullPath) : [fullPath];
    }));
    return nested.flat();
}

test('bridge bearer auth fails closed and grants only bounded safe scopes', () => {
    const previous = process.env.FOUNDER_OS_BRIDGE_SECRET;
    try {
        delete process.env.FOUNDER_OS_BRIDGE_SECRET;
        assert.deepEqual(authenticateFounderOsBridge(new Headers()), {
            ok: false,
            status: 503,
            code: 'NOT_CONFIGURED',
        });
        process.env.FOUNDER_OS_BRIDGE_SECRET = 'a'.repeat(64);
        assert.equal(
            authenticateFounderOsBridge(new Headers({
                authorization: `Bearer ${'b'.repeat(64)}`,
            })).ok,
            false
        );
        const accepted = authenticateFounderOsBridge(new Headers({
            authorization: `Bearer ${'a'.repeat(64)}`,
        }));
        assert.equal(accepted.ok, true);
        if (accepted.ok) {
            assert.equal(accepted.principalId, 'codex-plugin');
            assert.deepEqual(accepted.scopes, [
                'bridge:read',
                'bridge:draft',
                'bridge:request-review',
            ]);
            assert.equal(
                accepted.scopes.some((scope) => /approve|execute|external/i.test(scope)),
                false
            );
        }
    } finally {
        if (previous === undefined) delete process.env.FOUNDER_OS_BRIDGE_SECRET;
        else process.env.FOUNDER_OS_BRIDGE_SECRET = previous;
    }
});

test('audit redaction removes private content and credential-like values', () => {
    const redacted = redactBridgeAuditValue({
        contentHash: `sha256:${'a'.repeat(64)}`,
        accessToken: 'sensitive-token-value',
        nested: {
            messageBody: 'private message',
            message: 'private message text',
            caption: 'private caption',
            subject: 'private subject',
            text: 'private text',
            content: 'private content',
            authorization: `Bearer ${'z'.repeat(32)}`,
            safeStatus: 'DRAFT',
        },
    });
    assert.deepEqual(redacted, {
        contentHash: `sha256:${'a'.repeat(64)}`,
        accessToken: '[REDACTED]',
        nested: {
            messageBody: '[REDACTED]',
            message: '[REDACTED]',
            caption: '[REDACTED]',
            subject: '[REDACTED]',
            text: '[REDACTED]',
            content: '[REDACTED]',
            authorization: '[REDACTED]',
            safeStatus: 'DRAFT',
        },
    });
});

test('bridge route tree exposes no external-write or final-approval endpoint', async () => {
    const routeFiles = (await filesBelow(BRIDGE_ROUTE_ROOT))
        .filter((file) => file.endsWith('route.ts'));
    assert.equal(routeFiles.length, 10);
    const relativeRoutes = routeFiles.map((file) =>
        path.relative(BRIDGE_ROUTE_ROOT, file).replaceAll('\\', '/')
    );
    for (const route of relativeRoutes) {
        assert.doesNotMatch(
            route,
            /(?:^|\/)(?:approve|execute|send|publish|upload|reply|dm|oauth|disconnect)(?:\/|$)/i
        );
    }
    const sources = await Promise.all(routeFiles.map((file) => readFile(file, 'utf8')));
    for (const source of sources) {
        assert.match(source, /handleFounderOsBridgeRequest/);
        assert.doesNotMatch(source, /executeClaimedProviderAction|beginFounderEmailExecution/);
    }
    const reviewRoute = sources[relativeRoutes.indexOf('approvals/[id]/request-review/route.ts')];
    assert.match(reviewRoute, /requestFounderOsBridgeReview/);
    assert.match(reviewRoute, /idempotency-key/);
    assert.match(reviewRoute, /bridgeIdempotencyKeySchema/);
    assert.doesNotMatch(reviewRoute, /['"]APPROVED['"]/);
});

test('OpenAPI operation catalog is read, draft, prospect, or request-review only', async () => {
    const spec = await readFile(
        path.join(ROOT, 'docs', 'founder-os', 'bridge.openapi.yaml'),
        'utf8'
    );
    const operationIds = [...spec.matchAll(/operationId:\s*([^\s]+)/g)]
        .map((match) => match[1]);
    assert.equal(operationIds.length, 12);
    for (const operationId of operationIds) {
        assert.doesNotMatch(
            operationId,
            /approve|execute|send|publish|upload|reply|dm|oauth|disconnect/i
        );
    }
    assert.match(spec, /requestFounderOsBridgeReview/);
    assert.match(spec, /Move the exact DRAFT revision to READY_FOR_APPROVAL/i);
});

test('persistent limiter migration is private, bounded, and stores no secret', async () => {
    const migration = await readFile(
        path.join(
            ROOT,
            'supabase',
            'migrations',
            '20260810093000_founder_os_codex_bridge.sql'
        ),
        'utf8'
    );
    assert.match(migration, /create table founder_internal\.bridge_rate_limits/i);
    assert.match(migration, /enable row level security/i);
    assert.match(migration, /revoke all privileges[\s\S]*from public/i);
    assert.match(migration, /request_count between 1 and 100000/i);
    assert.doesNotMatch(migration, /bearer_secret|access_token|refresh_token|request_body/i);
});

test('request limiter commits metadata without body, cookie, or authorization values', async () => {
    const repository = await readFile(
        path.join(ROOT, 'lib', 'founder-os', 'bridge', 'repository.ts'),
        'utf8'
    );
    assert.match(repository, /bridge\.request_authorized/);
    assert.match(repository, /bridge\.rate_limited/);
    assert.match(repository, /requestBodyLogged:\s*false/);
    assert.match(repository, /authorizationLogged:\s*false/);
    assert.doesNotMatch(repository, /headers\.get\(['"]authorization['"]\)/);
});

test('bridge IDs are idempotent while Custom GPT defaults remain backward compatible', async () => {
    const service = await readFile(
        path.join(ROOT, 'lib', 'founder-os', 'service.ts'),
        'utf8'
    );
    const bridgeService = await readFile(
        path.join(ROOT, 'lib', 'founder-os', 'bridge', 'service.ts'),
        'utf8'
    );
    assert.match(service, /draftIdPrefix:\s*'gpt-draft'/);
    assert.match(service, /prospectIdPrefix:\s*'lead'/);
    assert.match(service, /update\(input\.requestKey, 'utf8'\)/);
    assert.match(bridgeService, /draftIdPrefix:\s*'bridge-draft'/);
    assert.match(bridgeService, /prospectIdPrefix:\s*'bridge-lead'/);
    assert.match(bridgeService, /'READY_FOR_APPROVAL'/);
    assert.match(service, /allowExactReplay/);
    assert.match(service, /idempotentReplay:\s*true/);
    assert.match(bridgeService, /idempotencyKeyHash/);
    assert.doesNotMatch(bridgeService, /OPENAI_API_KEY|responses\.create|cloudflare/i);
});

test('exact approval payload is founder-session same-origin only and never a bridge tool', async () => {
    const contentRoute = await readFile(
        path.join(
            ROOT,
            'app',
            'api',
            'founder',
            'os',
            'approvals',
            '[id]',
            'content',
            'route.ts'
        ),
        'utf8'
    );
    const service = await readFile(
        path.join(ROOT, 'lib', 'founder-os', 'service.ts'),
        'utf8'
    );
    assert.match(contentRoute, /export async function GET/);
    assert.match(contentRoute, /authorizeFounderOsRequest\(request, false\)/);
    assert.match(contentRoute, /sec-fetch-site/);
    assert.match(contentRoute, /hasValidRequestOrigin\(request\)/);
    assert.match(service, /action:\s*'approval\.content_viewed'/);
    assert.match(service, /payloadLogged:\s*false/);

    const bridgeRoutes = await filesBelow(BRIDGE_ROUTE_ROOT);
    const bridgeSource = (
        await Promise.all(
            bridgeRoutes
                .filter((file) => file.endsWith('route.ts'))
                .map((file) => readFile(file, 'utf8'))
        )
    ).join('\n');
    assert.doesNotMatch(bridgeSource, /getFounderApprovalContentForReview/);
});
