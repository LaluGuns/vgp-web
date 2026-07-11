const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('.supabase.com') ? { rejectUnauthorized: false } : undefined
});

async function main() {
    try {
        console.log("Checking tables...");
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables:", tablesRes.rows.map(r => r.table_name));

        for (const table of tablesRes.rows.map(r => r.table_name)) {
            const countRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`Table ${table} row count: ${countRes.rows[0].count}`);
        }

        // Check if vgp_recipient_logs exists and has data
        const hasRecipientLogs = tablesRes.rows.some(r => r.table_name === 'vgp_recipient_logs');
        if (hasRecipientLogs) {
            const sampleLogs = await pool.query(`
                SELECT email, name, status, created_at
                FROM vgp_recipient_logs
                LIMIT 50
            `);
            console.log("Sample recipient logs (from campaigns):", sampleLogs.rows);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

main();
