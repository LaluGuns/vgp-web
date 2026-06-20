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
-- 1. Add tracking columns to recipient logs
ALTER TABLE vgp_recipient_logs ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE vgp_recipient_logs ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;

-- 2. Add tags array column to subscribers for segmenting
ALTER TABLE vgp_subscribers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Add target_tags array column to campaigns for targeted broadcasts
ALTER TABLE vgp_campaigns ADD COLUMN IF NOT EXISTS target_tags TEXT[] DEFAULT '{}';
`;

const runMigration = async () => {
    console.log('Connecting to database...');
    const client = new Client({ connectionString: dbUrl, ssl });
    try {
        await client.connect();
        console.log('Connected! Executing schema V2 migration...');
        await client.query(sql);
        console.log('Schema migration V2 completed successfully!');
    } catch (error) {
        console.error('Migration V2 failed:', error);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
};

runMigration();
