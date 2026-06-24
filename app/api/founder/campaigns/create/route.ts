import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';
import { z } from 'zod';

const campaignCreateSchema = z.object({
    subject: z.string().trim().min(1, "Subject is required").max(255),
    template_type: z.enum(['beat_promo', 'cadenz_update', 'inner_circle']),
    body_content: z.string().trim().optional().default(''),
    target_tags: z.array(z.string().trim()).optional().default([]),
    scheduled_for: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === '') return null;
            const date = new Date(String(val));
            return isNaN(date.getTime()) ? undefined : date;
        },
        z.date().nullable().optional()
    ),
});

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

        let body: any;
        try {
            body = await request.json();
        } catch (jsonErr) {
            return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
        }

        const parseResult = campaignCreateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { subject, template_type, body_content, target_tags, scheduled_for } = parseResult.data;

        const parsedTargetTags = target_tags.map(t => t.toLowerCase());
        const parsedScheduledFor = scheduled_for || null;

        const result = await pool.query(
            `INSERT INTO vgp_campaigns (subject, template_type, body_content, status, target_tags, scheduled_for)
             VALUES ($1, $2, $3, 'draft', $4, $5)
             RETURNING id, subject, template_type, status, created_at, target_tags, scheduled_for`,
            [subject, template_type, body_content, parsedTargetTags, parsedScheduledFor]
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
