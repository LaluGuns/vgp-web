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
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

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

        // 2. Build list query
        let queryText = `
            SELECT id, name, email, status, unsubscribed_at, created_at, tags 
            FROM vgp_subscribers
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramCount = 1;

        if (search) {
            queryText += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (status) {
            queryText += ` AND status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (tag) {
            queryText += ` AND $${paramCount} = ANY(tags)`;
            params.push(tag);
            paramCount++;
        }

        queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const listRes = await pool.query(queryText, params);

        return NextResponse.json({
            success: true,
            stats,
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

        if (!id) {
            return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
        }

        // Soft delete: update status to unsubscribed
        const result = await pool.query(
            `UPDATE vgp_subscribers
             SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id, name, email, status`,
            [id]
        );

        if (result.rowCount === 0 || result.rowCount === null) {
            return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, subscriber: result.rows[0] });
    } catch (error) {
        console.error('Admin Subscribers DELETE Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
