import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

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
const approvalState = loadTypeScriptCommonJs('./approval-state.ts', {
    './errors': errors,
});

test('approval lifecycle only allows the frozen forward path', () => {
    const allowed = [
        ['DRAFT', 'READY_FOR_APPROVAL'],
        ['READY_FOR_APPROVAL', 'APPROVED'],
        ['APPROVED', 'EXECUTING'],
        ['EXECUTING', 'SUCCEEDED'],
        ['EXECUTING', 'FAILED'],
        ['EXECUTING', 'UNKNOWN'],
    ];
    for (const [from, to] of allowed) {
        assert.equal(approvalState.isApprovalTransitionAllowed(from, to), true);
    }

    assert.equal(
        approvalState.isApprovalTransitionAllowed('UNKNOWN', 'EXECUTING'),
        false
    );
    assert.equal(
        approvalState.isApprovalTransitionAllowed('FAILED', 'EXECUTING'),
        false
    );
});

test('content change is the only route back to DRAFT', () => {
    assert.equal(
        approvalState.isApprovalTransitionAllowed(
            'APPROVED',
            'DRAFT',
            { contentChanged: true }
        ),
        true
    );
    assert.equal(
        approvalState.isApprovalTransitionAllowed('APPROVED', 'DRAFT'),
        false
    );
});

test('outbox idempotency key binds approval id and content hash', () => {
    const hash = `sha256:${'a'.repeat(64)}`;
    const first = approvalState.makeApprovalOutboxKey('approval-1', hash);
    const second = approvalState.makeApprovalOutboxKey('approval-1', hash);
    assert.equal(first, second);
    assert.match(first, /approval-1:sha256:a{64}$/);
});

test('migration keeps founder data private and UNKNOWN reconcile-only', () => {
    const migration = readFileSync(
        new URL(
            '../../supabase/migrations/20260729074605_founder_os_core.sql',
            import.meta.url
        ),
        'utf8'
    );

    assert.match(migration, /create schema if not exists founder_internal/i);
    assert.match(
        migration,
        /revoke all privileges on schema founder_internal from public/i
    );
    assert.match(
        migration,
        /where rolname in \('anon', 'authenticated', 'service_role'\)/i
    );
    assert.match(
        migration,
        /alter table founder_internal\.approval_actions enable row level security/i
    );
    assert.match(
        migration,
        /unique \(approval_id, content_hash, event_type\)/i
    );
    assert.match(
        migration,
        /where status in \('held', 'failed'\)/i
    );
    assert.doesNotMatch(
        migration,
        /old\.status in \('failed', 'unknown'\).*new\.status = 'processing'/is
    );
});

test('every Founder OS mutation route applies founder session and same-origin checks', () => {
    const mutationRoutes = [
        '../../app/api/founder/os/bootstrap/route.ts',
        '../../app/api/founder/os/settings/route.ts',
        '../../app/api/founder/os/approvals/[id]/transition/route.ts',
        '../../app/api/founder/os/approvals/[id]/content/route.ts',
    ];

    for (const route of mutationRoutes) {
        const source = readFileSync(new URL(route, import.meta.url), 'utf8');
        assert.match(
            source,
            /authorizeFounderOsRequest\(request, true\)/,
            `${route} must enforce mutation authorization`
        );
    }
});
