import { NextRequest, NextResponse } from 'next/server';
import pool, { withTransaction } from '@/lib/db';
import nodemailer from 'nodemailer';
import { signToken } from '@/lib/tokens';

// Vercel Hobby caps function duration at 10s by default; sending a batch of
// SMTP emails serially can exceed that. Hobby allows up to 60s when set.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Max emails to process in a single batch run
const BATCH_SIZE = 10;

// Email HTML Template Generator
function getEmailHtml(
    name: string,
    subject: string,
    templateType: string,
    bodyContent: string,
    unsubscribeUrl: string,
    baseUrl: string,
    logId: number
): string {
    const currentYear = new Date().getFullYear();

    // Helper to rewrite text links for click tracking
    const trackLink = (url: string) => {
        return `${baseUrl}/api/newsletter/track/click?logId=${logId}&url=${encodeURIComponent(url)}`;
    };

    const rewriteTextLinks = (text: string): string => {
        const urlRegex = /(https?:\/\/[^\s<]+)/g;
        return text.replace(urlRegex, (url) => {
            if (url.includes('/api/newsletter/track') || url.includes('/unsubscribe')) {
                return url;
            }
            return trackLink(url);
        });
    };

    const trackedBody = rewriteTextLinks(bodyContent);

    let mainContentHtml = '';

    if (templateType === 'beat_promo') {
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(0, 229, 255, 0.12); color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    BEAT PROMO
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Hey ${name},
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${trackedBody || 'A new premium beat has just dropped in the studio. Get first access and special rates before public release.'}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <a href="${trackLink(`${baseUrl}/studio/beats`)}" style="background-color: #00E5FF; background: linear-gradient(135deg, #00E5FF 0%, #008cff 100%); color: #030712; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.35); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    LISTEN & SECURE LICENSE
                </a>
            </div>
        `;
    } else if (templateType === 'cadenz_update') {
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(112, 0, 255, 0.12); color: #a855f7; border: 1px solid rgba(112, 0, 255, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    CADENZ R&D
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Dear ${name},
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${trackedBody || 'We are pushing the boundaries of spatial audio and bio-resonance beat science. Check out our latest project logs.'}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <a href="${trackLink(`${baseUrl}/cadenz`)}" style="background-color: #7000FF; background: linear-gradient(135deg, #7000FF 0%, #a855f7 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(112, 0, 255, 0.35); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    READ DEVELOPMENT LOG
                </a>
            </div>
        `;
    } else { // inner_circle
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(255, 255, 255, 0.05); color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    INNER CIRCLE
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Greetings ${name},
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${trackedBody}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <a href="${trackLink(baseUrl)}" style="background-color: #0c1220; color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.4); padding: 13px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.05); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ACCESS PRIVATE PORTAL
                </a>
            </div>
        `;
    }

    return `
        <div style="background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; min-height: 100%; box-sizing: border-box;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #060b13; border: 1px solid rgba(56, 189, 248, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); margin-top: 20px;">
                <!-- Glowing top border -->
                <tr>
                    <td height="4" style="background: linear-gradient(90deg, #00E5FF 0%, #7000FF 100%); line-height: 4px; font-size: 0px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="padding: 40px 35px; background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.04), transparent 75%);">
                        <!-- Logo Section -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="margin-bottom: 12px;">
                                <img src="${baseUrl}/branding/logo-tg.png" alt="VGP" style="height: 48px; width: 48px; border-radius: 50%; border: 2px solid rgba(0, 229, 255, 0.2); box-shadow: 0 0 15px rgba(0, 229, 255, 0.15); display: inline-block;" />
                            </div>
                            <h1 style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 3px; margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">VIRZY GUNS PRODUCTION</h1>
                            <div style="color: #00E5FF; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">100% Art. 100% Science.</div>
                        </div>
                        
                        <div style="border-top: 1px solid rgba(56, 189, 248, 0.08); margin-bottom: 30px; height: 1px;"></div>
                        
                        ${mainContentHtml}
                        
                        <div style="border-top: 1px solid rgba(56, 189, 248, 0.08); margin-top: 40px; margin-bottom: 25px; height: 1px;"></div>
                        
                        <!-- Footer -->
                        <div style="text-align: center; font-size: 11px; color: #475569; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            © ${currentYear} Virzy Guns Production. All rights reserved.<br>
                            You are receiving this because you are part of the VGP Inner Circle.<br><br>
                            To stop receiving these emails, <a href="${unsubscribeUrl}" style="color: #00E5FF; text-decoration: underline; font-weight: 600;">unsubscribe here</a>.
                        </div>
                    </td>
                </tr>
            </table>
            <!-- Open Tracking Pixel -->
            <img src="${baseUrl}/api/newsletter/track/open?logId=${logId}" width="1" height="1" style="display:none;" />
        </div>
    `;
}

export async function GET(request: NextRequest) {
    try {
        // 1. Cron Secret Authorization check
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
            throw new Error('CRITICAL ENVIRONMENT ERROR: CRON_SECRET is not configured.');
        }
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const host = request.headers.get('host') || 'www.virzyguns.com';
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const baseUrl = `${protocol}://${host}`;

        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass) {
            throw new Error('CRITICAL ENVIRONMENT ERROR: SMTP credentials (SMTP_USER/SMTP_PASS) are missing.');
        }

        // Validate configuration before claiming queue rows so a missing SMTP
        // credential does not leave fresh jobs waiting for the stale-lock timeout.
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // 2. Select and lock recipient log rows inside a short transaction
        interface Job {
            id: number;
            campaign_id: number;
            subscriber_id: number;
            email: string;
            name: string;
            subject: string;
            template_type: string;
            body_content: string;
            attempts: number;
            max_attempts: number;
        }

        let jobs: Job[] = [];

        await withTransaction(async (client) => {
            // Terminalize exhausted work so a stale final attempt cannot leave
            // its parent campaign permanently in the sending state.
            await client.query(
                `UPDATE vgp_recipient_logs
                 SET status = 'failed', locked_at = NULL, next_attempt_at = NULL,
                     last_error = COALESCE(last_error, 'Maximum delivery attempts exhausted'),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE attempts >= max_attempts
                   AND (
                     status IN ('pending', 'failed')
                     OR (status = 'sending' AND locked_at < CURRENT_TIMESTAMP - INTERVAL '30 minutes')
                   )`
            );

            // Suppress queue rows that can no longer be delivered. Without this,
            // an unsubscribed recipient would remain pending and block completion.
            await client.query(
                `UPDATE vgp_recipient_logs rl
                 SET status = 'skipped', locked_at = NULL,
                     last_error = 'Subscriber is no longer subscribed',
                     updated_at = CURRENT_TIMESTAMP
                 FROM vgp_subscribers s, vgp_campaigns c
                 WHERE s.id = rl.subscriber_id
                   AND c.id = rl.campaign_id
                   AND c.status IN ('queued', 'sending')
                   AND s.status <> 'subscribed'
                   AND (
                     rl.status IN ('pending', 'failed')
                     OR (rl.status = 'sending' AND rl.locked_at < CURRENT_TIMESTAMP - INTERVAL '30 minutes')
                   )`
            );

            // Select up to BATCH_SIZE pending/retriable jobs
            // Using OF rl locks ONLY the logs, not campaign/subscriber tables.
            // SKIP LOCKED avoids blockages if multiple cron workers run concurrently.
            const queryRes = await client.query(
                `SELECT 
                    rl.id, 
                    rl.campaign_id, 
                    rl.subscriber_id, 
                    rl.attempts,
                    rl.max_attempts,
                    s.email, 
                    s.name, 
                    c.subject, 
                    c.template_type, 
                    c.body_content
                 FROM vgp_recipient_logs rl
                 JOIN vgp_campaigns c ON c.id = rl.campaign_id
                 JOIN vgp_subscribers s ON s.id = rl.subscriber_id
                 WHERE (c.status = 'sending' OR (c.status = 'queued' AND (c.scheduled_for IS NULL OR c.scheduled_for <= CURRENT_TIMESTAMP)))
                   AND s.status = 'subscribed'
                   AND rl.attempts < rl.max_attempts
                   AND (
                     rl.status = 'pending'
                     OR (rl.status = 'failed' AND rl.next_attempt_at <= CURRENT_TIMESTAMP)
                     OR (rl.status = 'sending' AND rl.locked_at < CURRENT_TIMESTAMP - INTERVAL '30 minutes')
                   )
                 ORDER BY rl.next_attempt_at ASC, rl.id ASC
                 LIMIT $1
                 FOR UPDATE OF rl SKIP LOCKED`,
                [BATCH_SIZE]
            );

            jobs = queryRes.rows;

            if (jobs.length > 0) {
                const jobIds = jobs.map(j => j.id);
                // Atomically mark them as sending and increment attempts, record locked time
                await client.query(
                    `UPDATE vgp_recipient_logs
                     SET status = 'sending', locked_at = CURRENT_TIMESTAMP, attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
                     WHERE id = ANY($1)`,
                    [jobIds]
                );

                // Keep the in-memory attempt count aligned with the committed row.
                jobs = jobs.map(job => ({ ...job, attempts: job.attempts + 1 }));

                // Ensure campaigns are marked as 'sending' if they were 'queued'
                const campaignIds = Array.from(new Set(jobs.map(j => j.campaign_id)));
                await client.query(
                    `UPDATE vgp_campaigns
                     SET status = 'sending', updated_at = CURRENT_TIMESTAMP
                     WHERE id = ANY($1) AND status = 'queued'`,
                    [campaignIds]
                );
            }
        });

        if (jobs.length === 0) {
            // No jobs to process, check if any campaigns should be completed
            const compResult = await pool.query(
                `UPDATE vgp_campaigns c
                 SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE (c.status = 'sending' OR (c.status = 'queued' AND (c.scheduled_for IS NULL OR c.scheduled_for <= CURRENT_TIMESTAMP)))
                   AND NOT EXISTS (
                     SELECT 1 FROM vgp_recipient_logs rl
                     WHERE rl.campaign_id = c.id
                       AND (
                         rl.status IN ('pending', 'sending')
                         OR (
                           rl.status = 'failed'
                           AND rl.attempts < rl.max_attempts
                           AND rl.next_attempt_at IS NOT NULL
                         )
                       )
                   )
                 RETURNING id`
            );
            return NextResponse.json({
                success: true,
                message: 'Queue idle. No jobs processed.',
                completedCampaigns: compResult.rows.map(r => r.id)
            });
        }

        const results = {
            successCount: 0,
            failCount: 0,
            processedJobs: [] as { jobId: number; status: string; error?: string }[]
        };

        // 4. Send SMTP emails OUTSIDE the database transaction
        for (const job of jobs) {
            try {
                // Re-check mutable state immediately before delivery. This closes
                // the normal unsubscribe/pause window without holding a DB
                // transaction open while SMTP is in flight.
                const currentState = await pool.query(
                    `SELECT rl.status AS job_status,
                            s.status AS subscriber_status,
                            c.status AS campaign_status
                     FROM vgp_recipient_logs rl
                     JOIN vgp_subscribers s ON s.id = rl.subscriber_id
                     JOIN vgp_campaigns c ON c.id = rl.campaign_id
                     WHERE rl.id = $1`,
                    [job.id]
                );

                if (currentState.rowCount === 0 || currentState.rowCount === null) {
                    results.processedJobs.push({ jobId: job.id, status: 'missing' });
                    continue;
                }

                const state = currentState.rows[0];
                if (state.job_status !== 'sending') {
                    results.processedJobs.push({ jobId: job.id, status: state.job_status });
                    continue;
                }

                if (state.subscriber_status !== 'subscribed') {
                    await pool.query(
                        `UPDATE vgp_recipient_logs
                         SET status = 'skipped', locked_at = NULL,
                             last_error = 'Subscriber is no longer subscribed',
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $1 AND status = 'sending'`,
                        [job.id]
                    );
                    results.processedJobs.push({ jobId: job.id, status: 'skipped' });
                    continue;
                }

                if (!['queued', 'sending'].includes(state.campaign_status)) {
                    await pool.query(
                        `UPDATE vgp_recipient_logs
                         SET status = 'pending', locked_at = NULL,
                             attempts = GREATEST(attempts - 1, 0),
                             next_attempt_at = CURRENT_TIMESTAMP,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $1 AND status = 'sending'`,
                        [job.id]
                    );
                    results.processedJobs.push({ jobId: job.id, status: 'deferred' });
                    continue;
                }

                // Generate a fresh, secure signed unsubscribe token for this user
                const unsubscribeToken = signToken({
                    subscriber_id: job.subscriber_id,
                    email: job.email,
                    purpose: 'unsubscribe'
                });

                const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;

                const emailHtml = getEmailHtml(
                    job.name,
                    job.subject,
                    job.template_type,
                    job.body_content,
                    unsubscribeUrl,
                    baseUrl,
                    job.id
                );

                const mailRes = await transporter.sendMail({
                    from: `"Virzy Guns Production" <${process.env.SMTP_USER}>`,
                    to: job.email,
                    subject: job.subject,
                    text: `${job.subject}\n\nGreetings ${job.name},\n\n${job.body_content}\n\nTo unsubscribe: ${unsubscribeUrl}`,
                    html: emailHtml
                });

                // Update database job status to 'sent'
                await pool.query(
                    `UPDATE vgp_recipient_logs
                     SET status = 'sent', sent_at = CURRENT_TIMESTAMP, message_id = $2, locked_at = NULL, last_error = NULL, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1 AND status = 'sending'`,
                    [job.id, mailRes.messageId || 'unknown']
                );

                results.successCount++;
                results.processedJobs.push({ jobId: job.id, status: 'sent' });
            } catch (err: any) {
                console.error(`Failed to send email job ID ${job.id} to ${job.email}:`, err);
                const isFinalFailure = job.attempts >= job.max_attempts;
                const retryDelayMinutes = Math.min(60, 5 * (2 ** Math.max(0, job.attempts - 1)));
                const nextAttemptAt = new Date(Date.now() + retryDelayMinutes * 60 * 1000);

                // Update database job status to 'failed' with error log
                await pool.query(
                    `UPDATE vgp_recipient_logs
                     SET status = 'failed', last_error = $2, locked_at = NULL, next_attempt_at = $3, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1 AND status = 'sending'`,
                    [job.id, err.message || 'Unknown SMTP error', isFinalFailure ? null : nextAttemptAt]
                );

                results.failCount++;
                results.processedJobs.push({ jobId: job.id, status: 'failed', error: err.message });
            }
        }

        // 5. Complete campaigns that are fully finished
        const compResult = await pool.query(
            `UPDATE vgp_campaigns c
             SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE (c.status = 'sending' OR (c.status = 'queued' AND (c.scheduled_for IS NULL OR c.scheduled_for <= CURRENT_TIMESTAMP)))
               AND NOT EXISTS (
                 SELECT 1 FROM vgp_recipient_logs rl
                 WHERE rl.campaign_id = c.id
                   AND (
                     rl.status IN ('pending', 'sending')
                     OR (
                       rl.status = 'failed'
                       AND rl.attempts < rl.max_attempts
                       AND rl.next_attempt_at IS NOT NULL
                     )
                   )
               )
             RETURNING id`
        );

        return NextResponse.json({
            success: true,
            batchSize: jobs.length,
            successCount: results.successCount,
            failCount: results.failCount,
            processedJobs: results.processedJobs,
            completedCampaigns: compResult.rows.map(r => r.id)
        });
    } catch (error: any) {
        console.error('Batch Queue Processor Cron Error:', error);
        return NextResponse.json(
            { error: 'Internal queue processor crash.' },
            { status: 500 }
        );
    }
}
