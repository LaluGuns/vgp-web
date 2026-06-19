import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await pool.query(
            `SELECT id, subject, template_type, body_content, status, created_at, updated_at, completed_at
             FROM vgp_campaigns
             ORDER BY created_at DESC`
        );

        return NextResponse.json({
            success: true,
            campaigns: result.rows
        });
    } catch (error) {
        console.error('Campaigns GET Error:', error);
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

        const { subject, template_type, body_content } = await request.json();

        if (!subject || !template_type) {
            return NextResponse.json({ error: 'Subject and template type are required.' }, { status: 400 });
        }

        const validTemplates = ['beat_promo', 'cadenz_update', 'inner_circle'];
        if (!validTemplates.includes(template_type)) {
            return NextResponse.json({ error: 'Invalid template type.' }, { status: 400 });
        }

        const result = await pool.query(
            `INSERT INTO vgp_campaigns (subject, template_type, body_content, status)
             VALUES ($1, $2, $3, 'draft')
             RETURNING id, subject, template_type, status, created_at`,
            [subject.trim(), template_type, body_content || '']
        );

        return NextResponse.json({
            success: true,
            campaign: result.rows[0]
        });
    } catch (error) {
        console.error('Campaigns Create POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
