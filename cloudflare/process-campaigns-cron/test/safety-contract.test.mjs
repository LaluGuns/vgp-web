import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const workerDirectory = resolve(testDirectory, '..');
const repositoryRoot = resolve(workerDirectory, '..', '..');

const workerPath = join(workerDirectory, 'src', 'index.js');
const routePath = join(
    repositoryRoot,
    'app',
    'api',
    'cron',
    'process-campaigns',
    'route.ts'
);
const migrationPath = join(
    repositoryRoot,
    'scripts',
    'migrate-v5-recipient-delivery-unknown.js'
);
const dailyReportRoutePath = join(
    repositoryRoot,
    'app',
    'api',
    'cron',
    'daily-report',
    'route.ts'
);

const [workerSource, routeSource, migrationSource, dailyReportRouteSource] = await Promise.all([
    readFile(workerPath, 'utf8'),
    readFile(routePath, 'utf8'),
    readFile(migrationPath, 'utf8'),
    readFile(dailyReportRoutePath, 'utf8'),
]);

const workerModuleUrl = `data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`;
const worker = (await import(workerModuleUrl)).default;

test('public fetch is health-only and never invokes the processor', async () => {
    const originalFetch = globalThis.fetch;
    let upstreamCalls = 0;
    globalThis.fetch = async () => {
        upstreamCalls += 1;
        return new Response('unexpected');
    };

    try {
        const healthResponse = await worker.fetch(
            new Request('https://worker.example/health')
        );
        assert.equal(healthResponse.status, 200);
        assert.deepEqual(await healthResponse.json(), {
            ok: true,
            service: 'vgp-process-campaigns-cron',
            scheduledOnly: true,
        });

        const rootResponse = await worker.fetch(
            new Request('https://worker.example/')
        );
        assert.equal(rootResponse.status, 404);

        const postResponse = await worker.fetch(
            new Request('https://worker.example/health', { method: 'POST' })
        );
        assert.equal(postResponse.status, 404);
        assert.equal(upstreamCalls, 0);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('scheduled handler invokes the processor as authenticated POST', async () => {
    const originalFetch = globalThis.fetch;
    const originalLog = console.log;
    let scheduledPromise;
    let capturedRequest;

    globalThis.fetch = async (url, init) => {
        capturedRequest = { url, init };
        return new Response('job metadata must not be logged', { status: 200 });
    };
    console.log = () => {};

    try {
        worker.scheduled(
            { scheduledTime: 123456789 },
            {
                PROCESS_URL: 'https://www.virzyguns.com/api/cron/process-campaigns',
                CRON_SECRET: 'test-secret',
            },
            {
                waitUntil(promise) {
                    scheduledPromise = promise;
                },
            }
        );

        assert.ok(scheduledPromise instanceof Promise);
        await scheduledPromise;
        assert.equal(
            capturedRequest.url,
            'https://www.virzyguns.com/api/cron/process-campaigns'
        );
        assert.equal(capturedRequest.init.method, 'POST');
        assert.equal(
            capturedRequest.init.headers.Authorization,
            'Bearer test-secret'
        );
        assert.doesNotMatch(workerSource, /res\.text\(\)/);
        assert.doesNotMatch(workerSource, /console\.(?:log|warn|error)\([^)]*body/);
    } finally {
        globalThis.fetch = originalFetch;
        console.log = originalLog;
    }
});

test('route quarantines ambiguous SMTP outcomes and keeps them out of claims', () => {
    const claimStart = routeSource.indexOf('// Select up to BATCH_SIZE');
    const claimEnd = routeSource.indexOf('ORDER BY rl.next_attempt_at', claimStart);
    const claimSql = routeSource.slice(claimStart, claimEnd);

    assert.match(routeSource, /export async function POST\(/);
    assert.match(routeSource, /smtp_attempted_at = CURRENT_TIMESTAMP/);
    assert.match(routeSource, /deliveryAttemptStarted = true;\s*const mailRes = await transporter\.sendMail/s);
    assert.match(routeSource, /deliveryState = deliveryAttemptStarted \? 'unknown' : 'failed'/);
    assert.match(routeSource, /deliveryAttemptStarted \|\| isFinalFailure \? null : nextAttemptAt/);
    assert.doesNotMatch(claimSql, /rl\.status = 'sending'/);
    assert.doesNotMatch(claimSql, /rl\.status = 'unknown'/);
    assert.equal(
        routeSource.match(/rl\.status IN \('pending', 'sending', 'unknown'\)/g)?.length,
        2
    );
    assert.doesNotMatch(routeSource, /console\.(?:log|warn|error)\([^\n]*job\.email/);
    assert.doesNotMatch(routeSource, /err\.message/);
});

test('migration adds the unknown state and preserves legacy in-flight safety', () => {
    assert.match(migrationSource, /ADD COLUMN IF NOT EXISTS smtp_attempted_at TIMESTAMPTZ/);
    assert.match(migrationSource, /'unknown'/);
    assert.match(migrationSource, /WHERE status = 'sending'\s+AND smtp_attempted_at IS NULL/);
    assert.match(migrationSource, /WHERE status = 'unknown'/);
});

test('daily report also quarantines ambiguous SMTP outcomes', () => {
    assert.match(
        dailyReportRouteSource,
        /smtp_attempted_at = CURRENT_TIMESTAMP[\s\S]*smtpAttemptStarted = true;[\s\S]*await transporter\.sendMail/,
    );
    assert.match(
        dailyReportRouteSource,
        /smtpAttemptStarted \? 'unknown' : 'failed'/,
    );
    assert.match(
        dailyReportRouteSource,
        /status === 'unknown'[\s\S]*manual reconciliation/,
    );
    assert.match(
        migrationSource,
        /ALTER TABLE vgp_daily_report_logs[\s\S]*'pending', 'sent', 'failed', 'unknown'/,
    );
});
