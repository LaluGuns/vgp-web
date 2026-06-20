import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim().toLowerCase() || '';
        const status = searchParams.get('status') || ''; // 'subscribed' or 'unsubscribed'
        const tag = searchParams.get('tag')?.trim().toLowerCase() || '';
        const limitParam = searchParams.get('limit');
        const limit = limitParam === 'all' ? 1000000 : parseInt(limitParam || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortDir = (searchParams.get('sortDir') || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

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

        if (search) {
            baseFilter += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (status) {
            baseFilter += ` AND status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (tag) {
            baseFilter += ` AND $${paramCount} = ANY(tags)`;
            params.push(tag);
            paramCount++;
        }

        // 3. Get filtered total count
        const countRes = await pool.query(`SELECT COUNT(*) as count FROM vgp_subscribers ${baseFilter}`, params);
        const filteredCount = parseInt(countRes.rows[0].count || '0');

        // 4. Build list query with ordering, limit and offset
        const allowedSortColumns = ['name', 'email', 'status', 'created_at'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

        let queryText = `
            SELECT id, name, email, status, unsubscribed_at, created_at, tags,
                   first_name, last_name, account_type, username, user_profile, 
                   location, product_type, license_name, product_title
            FROM vgp_subscribers
            ${baseFilter}
            ORDER BY ${validSortBy} ${sortDir}
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        params.push(limit, offset);

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

        const { name, email, status, tags } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const activeStatus = status || 'subscribed';
        if (activeStatus !== 'subscribed' && activeStatus !== 'unsubscribed') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const parsedTags = normalizeTags(tags);

        const result = await pool.query(
            `INSERT INTO vgp_subscribers (name, email, status, tags)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email)
             DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, tags = EXCLUDED.tags, unsubscribed_at = CASE WHEN EXCLUDED.status = 'unsubscribed' THEN CURRENT_TIMESTAMP ELSE NULL END
             RETURNING id, name, email, status, tags, created_at`,
            [name.trim(), normalizedEmail, activeStatus, parsedTags]
        );

        return NextResponse.json({ success: true, subscriber: result.rows[0] });
    } catch (error) {
        console.error('Admin Subscribers POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Authenticate request and verify origin
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const { id, name, email, status, tags } = await request.json();

        if (!id || !name || !email || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (status !== 'subscribed' && status !== 'unsubscribed') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const unsubscribedAt = status === 'unsubscribed' ? 'CURRENT_TIMESTAMP' : 'NULL';
        const parsedTags = normalizeTags(tags);

        const result = await pool.query(
            `UPDATE vgp_subscribers
             SET name = $1, email = $2, status = $3, unsubscribed_at = ${unsubscribedAt === 'NULL' ? 'NULL' : 'CURRENT_TIMESTAMP'}, tags = $4
             WHERE id = $5
             RETURNING id, name, email, status, unsubscribed_at, tags`,
            [name.trim(), normalizedEmail, status, parsedTags, id]
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
        const id = searchParams.get('id');
        const all = searchParams.get('all') === 'true';
        const hard = searchParams.get('hard') === 'true';

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

            if (all) {
                // Read filters
                const search = searchParams.get('search')?.trim().toLowerCase() || '';
                const status = searchParams.get('status') || '';
                const tag = searchParams.get('tag')?.trim().toLowerCase() || '';

                let baseFilter = ' WHERE 1=1';
                const filterParams: any[] = [];
                let paramCount = 1;

                if (search) {
                    baseFilter += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount})`;
                    filterParams.push(`%${search}%`);
                    paramCount++;
                }

                if (status) {
                    baseFilter += ` AND status = $${paramCount}`;
                    filterParams.push(status);
                    paramCount++;
                }

                if (tag) {
                    baseFilter += ` AND $${paramCount} = ANY(tags)`;
                    filterParams.push(tag);
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

            if (!id) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
            }

            const ids = id.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            if (ids.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Invalid subscriber ID format' }, { status: 400 });
            }

            if (hard) {
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
