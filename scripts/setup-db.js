const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Simple helper to parse .env.local manually
const loadEnv = () => {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const eqIndex = trimmed.indexOf('=');
                    if (eqIndex !== -1) {
                        const key = trimmed.slice(0, eqIndex).trim();
                        const val = trimmed.slice(eqIndex + 1).trim();
                        // Remove surrounding quotes if any
                        const cleanVal = val.replace(/^["']|["']$/g, '');
                        process.env[key] = cleanVal;
                    }
                }
            });
            console.log('Loaded env variables from .env.local');
        } else {
            console.warn('.env.local file not found. Using system env variables.');
        }
    } catch (error) {
        console.error('Failed to parse .env.local:', error);
    }
};

loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('CRITICAL: DATABASE_URL environment variable is missing in .env.local');
    console.log('Please add DATABASE_URL=your_postgres_connection_string to .env.local first.');
    process.exit(1);
}

const databaseHostname = new URL(dbUrl).hostname;
const ssl = databaseHostname.endsWith('.supabase.com')
    ? {
        ca: fs.readFileSync(path.join(__dirname, '../supabase-prod-ca-2021.crt'), 'utf8'),
        rejectUnauthorized: true,
    }
    : undefined;

const sql = `
-- 1. Create Subscribers Table
CREATE TABLE IF NOT EXISTS vgp_subscribers (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL CONSTRAINT email_lowercase CHECK (email = LOWER(email)),
    status VARCHAR(50) DEFAULT 'subscribed' CONSTRAINT check_sub_status CHECK (status IN ('subscribed', 'unsubscribed')),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON vgp_subscribers(email);

-- 2. Create Campaigns Table
CREATE TABLE IF NOT EXISTS vgp_campaigns (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL CONSTRAINT check_template CHECK (template_type IN ('beat_promo', 'cadenz_update', 'inner_circle')),
    body_content TEXT,
    status VARCHAR(50) DEFAULT 'draft' CONSTRAINT check_camp_status CHECK (status IN ('draft', 'queued', 'sending', 'paused', 'completed', 'cancelled', 'failed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 3. Create Recipient Logs (Queue) Table
CREATE TABLE IF NOT EXISTS vgp_recipient_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campaign_id INT REFERENCES vgp_campaigns(id) ON DELETE CASCADE,
    subscriber_id INT REFERENCES vgp_subscribers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CONSTRAINT check_recipient_status CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped', 'cancelled')),
    sent_at TIMESTAMPTZ,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    next_attempt_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    locked_at TIMESTAMPTZ,
    last_error TEXT,
    message_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (campaign_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS idx_recipient_queue ON vgp_recipient_logs(status, next_attempt_at) WHERE status IN ('pending', 'failed');
CREATE INDEX IF NOT EXISTS idx_recipient_campaign_status ON vgp_recipient_logs(campaign_id, status);

-- 4. Create Login Attempts (Rate Limiting) Table
CREATE TABLE IF NOT EXISTS vgp_login_attempts (
    ip_address VARCHAR(45) PRIMARY KEY,
    attempts INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_attempt_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMPTZ
);

-- 5. Create Daily Report Logs Table
CREATE TABLE IF NOT EXISTS vgp_daily_report_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CONSTRAINT check_report_status CHECK (status IN ('pending', 'sent', 'failed'))
);

-- 6. Create Metric Snapshots Table (daily historical trends)
-- Captured once per day by the daily-report cron. Powers honest trend charts
-- for metrics that cannot be reconstructed later (e.g. PageSpeed score history).
-- pagespeed_score is nullable: NULL means the audit was unavailable that day.
CREATE TABLE IF NOT EXISTS vgp_metric_snapshots (
    snapshot_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    total_subscribers INT NOT NULL DEFAULT 0,
    active_subscribers INT NOT NULL DEFAULT 0,
    unsubscribed INT NOT NULL DEFAULT 0,
    new_24h INT NOT NULL DEFAULT 0,
    campaigns_total INT NOT NULL DEFAULT 0,
    campaigns_completed INT NOT NULL DEFAULT 0,
    emails_sent_24h INT NOT NULL DEFAULT 0,
    pagespeed_score INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;

const setup = async () => {
    console.log('Connecting to database...');
    const client = new Client({ connectionString: dbUrl, ssl });
    let transactionStarted = false;
    
    try {
        await client.connect();
        console.log('Connected! Executing schema DDL...');
        await client.query('BEGIN');
        transactionStarted = true;
        await client.query(sql);
        await client.query('COMMIT');
        transactionStarted = false;
        console.log('Database tables and indexes created successfully!');
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Database rollback failed:', rollbackError);
            }
        }
        console.error('Database migration failed:', error);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
};

setup();
