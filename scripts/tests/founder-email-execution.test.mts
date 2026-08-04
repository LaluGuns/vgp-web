import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(relativePath: string) {
    return readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

test('email executor verifies SMTP before atomically claiming the approval', async () => {
    const route = await source(
        'app/api/founder/os/email/actions/execute/route.ts'
    );
    const verifyIndex = route.indexOf('await transporter.verify()');
    const claimIndex = route.indexOf('await beginFounderEmailExecution');
    assert.ok(verifyIndex >= 0, 'SMTP verification call must exist');
    assert.ok(claimIndex > verifyIndex, 'claim must occur only after SMTP verification');
    assert.match(
        route,
        /'X-VGP-Content-Hash':\s*claim\.approval\.action\.contentHash/
    );
});

test('ambiguous SMTP outcomes are quarantined as UNKNOWN without automatic retry', async () => {
    const route = await source(
        'app/api/founder/os/email/actions/execute/route.ts'
    );
    const service = await source('lib/founder-os/service.ts');
    const repository = await source('lib/founder-os/repository.ts');

    assert.match(route, /status:\s*'UNKNOWN'/);
    assert.match(route, /Do not resend; reconcile it manually/);
    assert.match(service, /retryAutomatically:\s*false/);
    assert.match(service, /contact\.suppressed/);
    assert.match(repository, /status = 'UNKNOWN'/);
    assert.doesNotMatch(route, /setTimeout|retry\s*\(/);
});

test('email execution uses only the immutable approved payload and a revalidated recipient', async () => {
    const service = await source('lib/founder-os/service.ts');
    const route = await source(
        'app/api/founder/os/email/actions/execute/route.ts'
    );

    assert.match(service, /founderEmailPayloadSchema\.parse\(before\.payload\)/);
    assert.match(service, /getProspectDeliveryContact/);
    assert.match(service, /assertExpectedContentHash/);
    assert.match(route, /to:\s*claim\.recipientEmail/);
    assert.match(route, /subject:\s*claim\.payload\.subject/);
    assert.match(route, /text:\s*claim\.payload\.body/);
    assert.doesNotMatch(route, /html:/);
});
