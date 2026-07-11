const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in .env.local!");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('.supabase.com') ? { rejectUnauthorized: false } : undefined
});

async function main() {
    try {
        console.log("Connecting to database...");
        
        const queryText = `
            UPDATE vgp_subscribers
            SET tags = ARRAY['beat_buyer']::text[]
            WHERE cardinality(tags) > 0
              AND NOT (tags && ARRAY['cadenz', 'beat_buyer', 'book_buyer']::text[])
        `;
        
        console.log("Running fast tag migration query...");
        const res = await pool.query(queryText);
        console.log(`Successfully updated ${res.rowCount} rows!`);
        
    } catch (e) {
        console.error("Error running migration:", e);
    } finally {
        await pool.end();
    }
}

main();
