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
        const countRes = await pool.query('SELECT COUNT(*) FROM vgp_subscribers');
        console.log("Total subscribers in vgp_subscribers:", countRes.rows[0].count);

        const tagsRes = await pool.query('SELECT DISTINCT tags FROM vgp_subscribers');
        console.log("All unique tags combinations:");
        console.log(JSON.stringify(tagsRes.rows, null, 2));

        const sampleRes = await pool.query('SELECT * FROM vgp_subscribers LIMIT 15');
        console.log("Sample subscribers:");
        console.log(JSON.stringify(sampleRes.rows, null, 2));

        const beatBuyerRes = await pool.query("SELECT COUNT(*) FROM vgp_subscribers WHERE 'beat_buyer' = ANY(tags)");
        console.log("Subscribers with 'beat_buyer' tag:", beatBuyerRes.rows[0].count);

        const bookBuyerRes = await pool.query("SELECT COUNT(*) FROM vgp_subscribers WHERE 'book_buyer' = ANY(tags)");
        console.log("Subscribers with 'book_buyer' tag:", bookBuyerRes.rows[0].count);

        const cadenzRes = await pool.query("SELECT COUNT(*) FROM vgp_subscribers WHERE 'cadenz' = ANY(tags)");
        console.log("Subscribers with 'cadenz' tag:", cadenzRes.rows[0].count);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

main();
