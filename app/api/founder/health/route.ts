import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';
import { checkFounderSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

/**
 * Real system health — every field is measured live, nothing hardcoded.
 *  - db:    runs `SELECT 1` and reports round-trip latency.
 *  - smtp:  opens a real connection via transporter.verify() (5s timeout).
 *  - queue: live counts from vgp_recipient_logs + last actual delivery time.
 */
export async function GET(request: NextRequest) {
    const isAuthorized = await checkFounderSession(request);
    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Database connectivity + latency
    const db = { ok: false, latencyMs: null as number | null, detail: '' };
    try {
        const t0 = Date.now();
        await pool.query('SELECT 1');
        db.ok = true;
        db.latencyMs = Date.now() - t0;
        db.detail = `Responded in ${db.latencyMs}ms`;
    } catch (e: any) {
        db.detail = e?.message || 'Connection failed';
    }

    // 2. Email queue state (only meaningful if DB is reachable)
    const queue = {
        pending: 0,
        sending: 0,
        failed: 0,
        sentToday: 0,
        activeCampaigns: 0,
        lastDeliveryAt: null as string | null,
    };
    if (db.ok) {
        try {
            const q = await pool.query(
                `SELECT
                    COUNT(*) FILTER (WHERE status = 'pending') AS pending,
                    COUNT(*) FILTER (WHERE status = 'sending') AS sending,
                    COUNT(*) FILTER (WHERE status = 'failed' AND attempts < max_attempts) AS failed,
                    COUNT(*) FILTER (WHERE status = 'sent' AND sent_at >= CURRENT_DATE) AS sent_today,
                    MAX(sent_at) FILTER (WHERE status = 'sent') AS last_delivery
                 FROM vgp_recipient_logs`
            );
            const r = q.rows[0];
            queue.pending = parseInt(r.pending || '0');
            queue.sending = parseInt(r.sending || '0');
            queue.failed = parseInt(r.failed || '0');
            queue.sentToday = parseInt(r.sent_today || '0');
            queue.lastDeliveryAt = r.last_delivery ? new Date(r.last_delivery).toISOString() : null;

            const c = await pool.query(
                `SELECT COUNT(*) AS active FROM vgp_campaigns WHERE status IN ('queued', 'sending')`
            );
            queue.activeCampaigns = parseInt(c.rows[0].active || '0');
        } catch (e) {
            // Tables may not exist yet; leave zeros.
        }
    }

    // 3. SMTP connectivity (real verify, bounded by a short timeout)
    const smtp = { ok: false, configured: false, detail: '' };
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpUser && smtpPass) {
        smtp.configured = true;
        const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
        const port = parseInt(process.env.SMTP_PORT || '465');
        try {
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure: true,
                auth: { user: smtpUser, pass: smtpPass },
                connectionTimeout: 5000,
                greetingTimeout: 5000,
            });
            await transporter.verify();
            smtp.ok = true;
            smtp.detail = `${host}:${port} verified`;
        } catch (e: any) {
            smtp.detail = e?.message || 'SMTP verification failed';
        }
    } else {
        smtp.detail = 'SMTP credentials not configured';
    }

    return NextResponse.json({
        success: true,
        checkedAt: new Date().toISOString(),
        db,
        smtp,
        queue,
    });
}
