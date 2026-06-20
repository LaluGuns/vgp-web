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
            `SELECT 
                c.id, 
                c.subject, 
                c.template_type, 
                c.body_content, 
                c.status, 
                c.created_at, 
                c.updated_at, 
                c.completed_at, 
                c.target_tags,
                c.scheduled_for,
                COUNT(rl.id)::int AS total_recipients,
                COUNT(CASE WHEN rl.status = 'sent' THEN 1 END)::int AS sent_recipients,
                COUNT(CASE WHEN rl.opened_at IS NOT NULL THEN 1 END)::int AS opened_recipients,
                COUNT(CASE WHEN rl.clicked_at IS NOT NULL THEN 1 END)::int AS clicked_recipients
             FROM vgp_campaigns c
             LEFT JOIN vgp_recipient_logs rl ON rl.campaign_id = c.id
             GROUP BY c.id
             ORDER BY c.created_at DESC`
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

        const { subject, template_type, body_content, target_tags, scheduled_for } = await request.json();

        if (!subject || !template_type) {
            return NextResponse.json({ error: 'Subject and template type are required.' }, { status: 400 });
        }

        const validTemplates = ['beat_promo', 'cadenz_update', 'inner_circle'];
        if (!validTemplates.includes(template_type)) {
            return NextResponse.json({ error: 'Invalid template type.' }, { status: 400 });
        }

        const parsedTargetTags = Array.isArray(target_tags) ? target_tags.map(t => String(t).trim().toLowerCase()) : [];
        const parsedScheduledFor = scheduled_for ? new Date(scheduled_for) : null;

        const result = await pool.query(
            `INSERT INTO vgp_campaigns (subject, template_type, body_content, status, target_tags, scheduled_for)
             VALUES ($1, $2, $3, 'draft', $4, $5)
             RETURNING id, subject, template_type, status, created_at, target_tags, scheduled_for`,
            [subject.trim(), template_type, body_content || '', parsedTargetTags, parsedScheduledFor]
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
