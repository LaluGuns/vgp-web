import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';
import { z } from 'zod';

function normalizeTags(tags: any): string[] {
    const rawTags = Array.isArray(tags) ? tags.map(t => String(t).trim().toLowerCase()) : [];
    const parsedTags: string[] = [];
    for (const t of rawTags) {
        let clean = t;
        if (clean === 'cadenz' || clean.includes('cadenz')) {
            clean = 'cadenz';
        } else if (clean === 'pembeli beat' || clean === 'beat buyer' || clean === 'beat-buyer' || clean === 'beat_buyer') {
            clean = 'beat_buyer';
        } else if (clean === 'pembeli buku' || clean === 'book buyer' || clean === 'book-buyer' || clean === 'book_buyer') {
            clean = 'book_buyer';
        }
        if (clean && !parsedTags.includes(clean)) {
            parsedTags.push(clean);
        }
    }
    return parsedTags;
}

// Zod schemas for request validation
const subscribersGetQuerySchema = z.object({
    search: z.string().default(''),
    status: z.enum(['', 'subscribed', 'unsubscribed']).default(''),
    tag: z.string().default(''),
    limit: z.preprocess(
        (val) => (val === 'all' ? 1000000 : val === null || val === undefined ? 50 : parseInt(String(val), 10)),
        z.number().int().min(1).catch(50)
    ),
    offset: z.preprocess(
        (val) => (val === null || val === undefined ? 0 : parseInt(String(val), 10)),
        z.number().int().min(0).catch(0)
    ),
    sortBy: z.enum(['name', 'email', 'status', 'created_at']).default('created_at'),
    sortDir: z.enum(['ASC', 'DESC']).catch('DESC'),
});

const subscriberPostSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(80),
    email: z.string().trim().email("Invalid email format").max(254),
    status: z.enum(['subscribed', 'unsubscribed']).optional().default('subscribed'),
    tags: z.array(z.string().trim()).optional().default([]),
});

const subscriberPutSchema = z.object({
    id: z.number().int().positive("Invalid subscriber ID"),
    name: z.string().trim().min(1, "Name is required").max(80),
    email: z.string().trim().email("Invalid email format").max(254),
    status: z.enum(['subscribed', 'unsubscribed']),
    tags: z.array(z.string().trim()).optional().default([]),
});

const subscribersDeleteQuerySchema = z.object({
    id: z.string().optional().nullable(),
    all: z.preprocess((val) => val === 'true', z.boolean()).default(false),
    hard: z.preprocess((val) => val === 'true', z.boolean()).default(false),
    search: z.string().default(''),
    status: z.string().default(''),
    tag: z.string().default(''),
});

export async function GET(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const queryObj = {
            search: searchParams.get('search')?.trim() ?? undefined,
            status: searchParams.get('status') ?? undefined,
            tag: searchParams.get('tag')?.trim() ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
            offset: searchParams.get('offset') ?? undefined,
            sortBy: searchParams.get('sortBy') ?? undefined,
            sortDir: searchParams.get('sortDir')?.toUpperCase() ?? undefined,
        };

        const parseResult = subscribersGetQuerySchema.safeParse(queryObj);
        const query = parseResult.success ? parseResult.data : {
            search: '',
            status: '' as const,
            tag: '',
            limit: 50,
            offset: 0,
            sortBy: 'created_at' as const,
            sortDir: 'DESC' as const,
        };

        // 1. Get stats
        const statsRes = await pool.query(`
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'subscribed' THEN 1 END) as subscribed,
                COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_24h
            FROM vgp_subscribers
        `);
        const stats = {
            total: parseInt(statsRes.rows[0].total || '0'),
            subscribed: parseInt(statsRes.rows[0].subscribed || '0'),
            unsubscribed: parseInt(statsRes.rows[0].unsubscribed || '0'),
            new24h: parseInt(statsRes.rows[0].new_24h || '0')
        };

        // 2. Build filter clause
        let baseFilter = ' WHERE 1=1';
        const params: any[] = [];
        let paramCount = 1;

        if (query.search) {
            baseFilter += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount})`;
            params.push(`%${query.search.toLowerCase()}%`);
            paramCount++;
        }

        if (query.status) {
            baseFilter += ` AND status = $${paramCount}`;
            params.push(query.status);
            paramCount++;
        }

        if (query.tag) {
            baseFilter += ` AND $${paramCount} = ANY(tags)`;
            params.push(query.tag.toLowerCase());
            paramCount++;
        }

        // 3. Get filtered total count
        const countRes = await pool.query(`SELECT COUNT(*) as count FROM vgp_subscribers ${baseFilter}`, params);
        const filteredCount = parseInt(countRes.rows[0].count || '0');

        // 4. Build list query with ordering, limit and offset
        const allowedSortColumns = ['name', 'email', 'status', 'created_at'];
        const validSortBy = allowedSortColumns.includes(query.sortBy) ? query.sortBy : 'created_at';

        const queryText = `
            SELECT id, name, email, status, unsubscribed_at, created_at, tags,
                   first_name, last_name, account_type, username, user_profile, 
                   location, product_type, license_name, product_title
            FROM vgp_subscribers
            ${baseFilter}
            ORDER BY ${validSortBy} ${query.sortDir}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(query.limit, query.offset);

        const listRes = await pool.query(queryText, params);

        return NextResponse.json({
            success: true,
            stats,
            filteredCount,
            subscribers: listRes.rows
        });
    } catch (error) {
        console.error('Admin Subscribers GET Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        let body: any;
        try {
            body = await request.json();
        } catch (jsonErr) {
            return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
        }

        const parseResult = subscriberPostSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { name, email, status, tags } = parseResult.data;
        const normalizedEmail = email.toLowerCase();
        const parsedTags = normalizeTags(tags);

        const result = await pool.query(
            `INSERT INTO vgp_subscribers (name, email, status, tags)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email)
             DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, tags = EXCLUDED.tags, unsubscribed_at = CASE WHEN EXCLUDED.status = 'unsubscribed' THEN CURRENT_TIMESTAMP ELSE NULL END
             RETURNING id, name, email, status, tags, created_at`,
            [name, normalizedEmail, status, parsedTags]
        );

        return NextResponse.json({ success: true, subscriber: result.rows[0] });
    } catch (error) {
        console.error('Admin Subscribers POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        let body: any;
        try {
            body = await request.json();
        } catch (jsonErr) {
            return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
        }

        const parseResult = subscriberPutSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { id, name, email, status, tags } = parseResult.data;
        const normalizedEmail = email.toLowerCase();
        const parsedTags = normalizeTags(tags);

        const result = await pool.query(
            `UPDATE vgp_subscribers
             SET name = $1, email = $2, status = $3, unsubscribed_at = CASE WHEN $3 = 'unsubscribed' THEN CURRENT_TIMESTAMP ELSE NULL END, tags = $4
             WHERE id = $5
             RETURNING id, name, email, status, unsubscribed_at, tags`,
            [name, normalizedEmail, status, parsedTags, id]
        );

        if (result.rowCount === 0 || result.rowCount === null) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, subscriber: result.rows[0] });
    } catch (error) {
        console.error('Admin Subscribers PUT Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const queryObj = {
            id: searchParams.get('id'),
            all: searchParams.get('all'),
            hard: searchParams.get('hard'),
            search: searchParams.get('search')?.trim() ?? undefined,
            status: searchParams.get('status') ?? undefined,
            tag: searchParams.get('tag')?.trim() ?? undefined,
        };

        const deleteQuery = subscribersDeleteQuerySchema.parse(queryObj);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Ensure trash table exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS vgp_subscribers_trash (
                    id SERIAL PRIMARY KEY,
                    deleted_batch_id VARCHAR(255) NOT NULL,
                    name VARCHAR(255),
                    email VARCHAR(255) NOT NULL,
                    status VARCHAR(50),
                    tags TEXT[],
                    created_at TIMESTAMP,
                    unsubscribed_at TIMESTAMP,
                    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    first_name VARCHAR(255),
                    last_name VARCHAR(255),
                    account_type VARCHAR(100),
                    username VARCHAR(255),
                    user_profile VARCHAR(500),
                    location VARCHAR(255),
                    product_type VARCHAR(100),
                    license_name VARCHAR(100),
                    product_title VARCHAR(255)
                )
            `);

            // 2. Automatically clean up records older than 24h
            await client.query("DELETE FROM vgp_subscribers_trash WHERE deleted_at < NOW() - INTERVAL '24 hours'");

            const deletedBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

            if (deleteQuery.all) {
                let baseFilter = ' WHERE 1=1';
                const filterParams: any[] = [];
                let paramCount = 1;

                if (deleteQuery.search) {
                    baseFilter += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount})`;
                    filterParams.push(`%${deleteQuery.search.toLowerCase()}%`);
                    paramCount++;
                }

                if (deleteQuery.status) {
                    baseFilter += ` AND status = $${paramCount}`;
                    filterParams.push(deleteQuery.status);
                    paramCount++;
                }

                if (deleteQuery.tag) {
                    baseFilter += ` AND $${paramCount} = ANY(tags)`;
                    filterParams.push(deleteQuery.tag.toLowerCase());
                    paramCount++;
                }

                // Copy to trash
                const copyRes = await client.query(
                    `INSERT INTO vgp_subscribers_trash (
                        deleted_batch_id, name, email, status, tags, created_at, unsubscribed_at,
                        first_name, last_name, account_type, username, user_profile, 
                        location, product_type, license_name, product_title
                     )
                     SELECT $1, name, email, status, tags, created_at, unsubscribed_at,
                            first_name, last_name, account_type, username, user_profile, 
                            location, product_type, license_name, product_title
                     FROM vgp_subscribers
                     ${baseFilter}
                     RETURNING email`,
                    [deletedBatchId, ...filterParams]
                );
                const count = copyRes.rowCount || 0;

                if (count > 0) {
                    await client.query(`DELETE FROM vgp_subscribers ${baseFilter}`, filterParams);
                }

                await client.query('COMMIT');
                return NextResponse.json({ success: true, count, deleted_batch_id: deletedBatchId });
            }

            if (!deleteQuery.id) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
            }

            const ids = deleteQuery.id.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
            if (ids.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Invalid subscriber ID format' }, { status: 400 });
            }

            if (deleteQuery.hard) {
                // Copy to trash
                const copyRes = await client.query(
                    `INSERT INTO vgp_subscribers_trash (
                        deleted_batch_id, name, email, status, tags, created_at, unsubscribed_at,
                        first_name, last_name, account_type, username, user_profile, 
                        location, product_type, license_name, product_title
                     )
                     SELECT $1, name, email, status, tags, created_at, unsubscribed_at,
                            first_name, last_name, account_type, username, user_profile, 
                            location, product_type, license_name, product_title
                     FROM vgp_subscribers
                     WHERE id = ANY($2)
                     RETURNING email`,
                    [deletedBatchId, ids]
                );
                const count = copyRes.rowCount || 0;

                if (count > 0) {
                    await client.query('DELETE FROM vgp_subscribers WHERE id = ANY($1)', [ids]);
                }

                await client.query('COMMIT');
                return NextResponse.json({ success: true, count, deleted_batch_id: deletedBatchId });
            }

            // Soft delete: update status to unsubscribed (only supports first ID for single operation)
            const result = await client.query(
                `UPDATE vgp_subscribers
                 SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
                 WHERE id = $1
                 RETURNING id, name, email, status`,
                [ids[0]]
            );

            if (result.rowCount === 0 || result.rowCount === null) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true, subscriber: result.rows[0] });
        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Admin Subscribers DELETE Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
