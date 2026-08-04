const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed
            .slice(separatorIndex + 1)
            .trim()
            .replace(/^["']|["']$/g, '');
        process.env[key] = value;
    });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error(JSON.stringify({
        event: 'recipient_delivery_migration_error',
        code: 'DATABASE_URL_MISSING',
    }));
    process.exit(1);
}

const databaseHostname = new URL(databaseUrl).hostname;
const ssl = databaseHostname.endsWith('.supabase.com')
    ? {
        ca: fs.readFileSync(
            path.join(__dirname, '../supabase-prod-ca-2021.crt'),
            'utf8'
        ),
        rejectUnauthorized: true,
    }
    : undefined;

const migrationSql = `
ALTER TABLE vgp_recipient_logs
    ADD COLUMN IF NOT EXISTS smtp_attempted_at TIMESTAMPTZ;

ALTER TABLE vgp_recipient_logs
    DROP CONSTRAINT IF EXISTS check_recipient_status;

ALTER TABLE vgp_recipient_logs
    ADD CONSTRAINT check_recipient_status
    CHECK (
        status IN (
            'pending',
            'sending',
            'sent',
            'failed',
            'unknown',
            'skipped',
            'cancelled'
        )
    ) NOT VALID;

ALTER TABLE vgp_recipient_logs
    VALIDATE CONSTRAINT check_recipient_status;

-- Legacy in-flight rows predate the explicit SMTP boundary marker. Treat them
-- conservatively so the new processor quarantines them instead of risking an
-- automatic duplicate delivery.
UPDATE vgp_recipient_logs
SET smtp_attempted_at = COALESCE(locked_at, updated_at, CURRENT_TIMESTAMP)
WHERE status = 'sending'
  AND smtp_attempted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_recipient_unknown_delivery
    ON vgp_recipient_logs(updated_at DESC)
    WHERE status = 'unknown';

COMMENT ON COLUMN vgp_recipient_logs.smtp_attempted_at IS
    'Set immediately before SMTP invocation; stale marked rows require reconciliation before retry.';

ALTER TABLE vgp_daily_report_logs
    ADD COLUMN IF NOT EXISTS smtp_attempted_at TIMESTAMPTZ;

ALTER TABLE vgp_daily_report_logs
    DROP CONSTRAINT IF EXISTS check_report_status;

ALTER TABLE vgp_daily_report_logs
    ADD CONSTRAINT check_report_status
    CHECK (status IN ('pending', 'sent', 'failed', 'unknown')) NOT VALID;

ALTER TABLE vgp_daily_report_logs
    VALIDATE CONSTRAINT check_report_status;

-- Existing pending report rows predate the SMTP boundary. Treat them
-- conservatively because their delivery outcome cannot be reconstructed.
UPDATE vgp_daily_report_logs
SET smtp_attempted_at = COALESCE(sent_at, CURRENT_TIMESTAMP)
WHERE status = 'pending'
  AND smtp_attempted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_daily_report_unknown_delivery
    ON vgp_daily_report_logs(report_date DESC)
    WHERE status = 'unknown';

COMMENT ON COLUMN vgp_daily_report_logs.smtp_attempted_at IS
    'Set immediately before daily-report SMTP invocation; marked failures require reconciliation.';
`;

function safeErrorCode(error) {
    const rawCode = error && typeof error === 'object' ? String(error.code || '') : '';
    return rawCode
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')
        .slice(0, 32) || 'UNCLASSIFIED';
}

async function runMigration() {
    const client = new Client({ connectionString: databaseUrl, ssl });
    let transactionStarted = false;

    try {
        await client.connect();
        await client.query('BEGIN');
        transactionStarted = true;
        await client.query(migrationSql);
        await client.query('COMMIT');
        transactionStarted = false;
        console.log(JSON.stringify({
            event: 'recipient_delivery_migration_complete',
            version: 5,
        }));
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            } catch {
                console.error(JSON.stringify({
                    event: 'recipient_delivery_migration_rollback_error',
                    code: 'ROLLBACK_FAILED',
                }));
            }
        }

        console.error(JSON.stringify({
            event: 'recipient_delivery_migration_error',
            code: safeErrorCode(error),
        }));
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

runMigration();
