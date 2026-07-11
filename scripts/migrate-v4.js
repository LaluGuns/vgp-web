const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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
                        process.env[key] = val.replace(/^["']|["']$/g, '');
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
    console.error('CRITICAL: DATABASE_URL environment variable is missing.');
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
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS account_type VARCHAR(100);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS user_profile VARCHAR(500);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS product_type VARCHAR(100);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS license_name VARCHAR(100);
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS product_title VARCHAR(255);

ALTER TABLE vgp_campaigns ADD COLUMN IF NOT EXISTS target_tags TEXT[] DEFAULT '{}';
ALTER TABLE vgp_campaigns ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

ALTER TABLE vgp_campaigns DROP CONSTRAINT IF EXISTS check_template;
ALTER TABLE vgp_campaigns
    ADD CONSTRAINT check_template
    CHECK (template_type IN ('beat_promo', 'cadenz_update', 'inner_circle', 'book_reader'));

CREATE INDEX IF NOT EXISTS idx_subscribers_tags ON vgp_subscribers USING GIN(tags);
`;

const runMigration = async () => {
    console.log('Connecting to database...');
    const client = new Client({ connectionString: dbUrl, ssl });
    let transactionStarted = false;

    try {
        await client.connect();
        console.log('Connected! Executing schema V4 migration...');
        await client.query('BEGIN');
        transactionStarted = true;
        await client.query(sql);
        await client.query('COMMIT');
        transactionStarted = false;
        console.log('Schema migration V4 completed successfully!');
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Database rollback failed:', rollbackError);
            }
        }
        console.error('Migration V4 failed:', error);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
};

runMigration();
