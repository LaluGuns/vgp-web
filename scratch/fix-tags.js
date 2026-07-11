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
        
        // Find subscribers with non-standard tags
        const res = await pool.query('SELECT id, name, email, tags FROM vgp_subscribers');
        console.log(`Found ${res.rows.length} subscribers total.`);
        
        let updatedCount = 0;
        for (const row of res.rows) {
            const tags = row.tags || [];
            // If tags has any element that is not 'cadenz', 'beat_buyer', or 'book_buyer', or if tags is empty but they are from the imported batch
            const hasInvalidTag = tags.some(t => t !== 'cadenz' && t !== 'beat_buyer' && t !== 'book_buyer');
            
            if (hasInvalidTag) {
                // Update tags to ['beat_buyer']
                await pool.query('UPDATE vgp_subscribers SET tags = $1 WHERE id = $2', [['beat_buyer'], row.id]);
                updatedCount++;
            }
        }
        
        console.log(`Successfully fixed tags for ${updatedCount} subscribers to ['beat_buyer'].`);
        
    } catch (e) {
        console.error("Error running migration:", e);
    } finally {
        await pool.end();
    }
}

main();
