import { Pool, PoolClient } from 'pg';

// Prevent hot-reload in development from creating multiple pools
const globalForDb = global as unknown as { pool: Pool };

function getPool(): Pool {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('CRITICAL ENVIRONMENT ERROR: DATABASE_URL environment variable is missing.');
    }
    
    if (!globalForDb.pool) {
        globalForDb.pool = new Pool({
            connectionString,
            // Optimal configurations for serverless environment
            max: 8, // Low pool size to prevent exceeding database connection limits under serverless scale
            idleTimeoutMillis: 15000, // Close idle clients quickly to release resources
            connectionTimeoutMillis: 5000, // Fail fast if database is unreachable
        });
    }
    return globalForDb.pool;
}

// Export a Proxy that dynamically resolves the Pool instance at call-time.
// This prevents module-evaluation failures during Next.js static page build phases.
const pool = new Proxy({} as Pool, {
    get(target, prop, receiver) {
        return Reflect.get(getPool(), prop, receiver);
    }
});

export default pool;

/**
 * Execute a transaction block safely with automatic BEGIN, COMMIT/ROLLBACK,
 * and client release guarantee.
 */
export async function withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const activePool = getPool();
    const client = await activePool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release(); // Release client back to the pool
    }
}

/**
 * Execute a single query safely, releasing the client immediately.
 */
export async function query(text: string, params?: any[]) {
    const activePool = getPool();
    const client = await activePool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}
