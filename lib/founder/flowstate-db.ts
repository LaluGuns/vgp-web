import { Pool, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';

// Separate pg Pool for the Flowstate product database (flowstate_* tables).
// Driven by FLOWSTATE_DATABASE_URL — intentionally distinct from the founder
// app's DATABASE_URL pool in lib/db.ts. If the env var is not set, nothing
// throws at import time; callers check isFlowstateConfigured() first.

const globalForFlowstateDb = global as unknown as { flowstatePool?: Pool };

let supabaseCa: string | null = null;

function getSslConfig(connectionString: string) {
    const hostname = new URL(connectionString).hostname;
    if (!hostname.endsWith('.supabase.com')) return undefined;

    if (!supabaseCa) {
        supabaseCa = fs.readFileSync(
            path.join(process.cwd(), 'supabase-prod-ca-2021.crt'),
            'utf8'
        );
    }

    return { ca: supabaseCa, rejectUnauthorized: true };
}

/** True when FLOWSTATE_DATABASE_URL is present. Never throws. */
export function isFlowstateConfigured(): boolean {
    return Boolean(process.env.FLOWSTATE_DATABASE_URL);
}

function getFlowstatePool(): Pool {
    const connectionString = process.env.FLOWSTATE_DATABASE_URL;
    if (!connectionString) {
        throw new Error('FLOWSTATE_DATABASE_URL environment variable is missing.');
    }

    if (!globalForFlowstateDb.flowstatePool) {
        globalForFlowstateDb.flowstatePool = new Pool({
            connectionString,
            ssl: getSslConfig(connectionString),
            // Small pool: this connection only serves founder-dashboard reads.
            max: 4,
            idleTimeoutMillis: 15000,
            connectionTimeoutMillis: 5000,
        });
    }
    return globalForFlowstateDb.flowstatePool;
}

/**
 * Execute a single read-only query against the Flowstate database.
 * Throws if FLOWSTATE_DATABASE_URL is not configured — guard with
 * isFlowstateConfigured() before calling.
 */
export async function flowstateQuery(text: string, params?: unknown[]): Promise<QueryResult> {
    const pool = getFlowstatePool();
    const client = await pool.connect();
    try {
        return await client.query(text, params as any[]);
    } finally {
        client.release();
    }
}
