import { NextRequest, NextResponse } from 'next/server';
import pool, { withTransaction } from '@/lib/db';
import nodemailer from 'nodemailer';
import { signToken } from '@/lib/tokens';
import { getAppBaseUrl } from '@/lib/auth';
import { renderCampaignEmail } from '@/lib/founder/campaign-email';

function getDefaultNameFromEmail(email: string): string {
    if (!email || typeof email !== 'string') return 'Producer';
    const parts = email.split('@');
    if (parts.length < 2) return 'Producer';
    const username = parts[0];
    const cleanUsername = username.replace(/[._-]/g, ' ').trim();
    return cleanUsername
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Producer';
}

// Vercel Hobby caps function duration at 10s by default; sending a batch of
// SMTP emails serially can exceed that. Hobby allows up to 60s when set.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Max emails to process in a single batch run
const BATCH_SIZE = 10;
const STALE_LOCK_MINUTES = 30;

function getSafeErrorCode(error: unknown): string {
    let rawCode = '';

    if (typeof error === 'object' && error !== null) {
        const candidate = error as { code?: unknown; responseCode?: unknown };
        rawCode = String(candidate.code ?? candidate.responseCode ?? '');
    }

    const sanitized = rawCode
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')
        .slice(0, 32);

    return sanitized || 'UNCLASSIFIED';
}

export async function POST(request: NextRequest) {
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

        const baseUrl = getAppBaseUrl(request);

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
            // A stale lock with an SMTP-attempt marker has an ambiguous external
            // outcome. Quarantine it for provider reconciliation; never retry it.
            const quarantinedResult = await client.query(
                `UPDATE vgp_recipient_logs
                 SET status = 'unknown', locked_at = NULL, next_attempt_at = NULL,
                     last_error = 'Delivery outcome unknown after interrupted SMTP attempt; manual reconciliation required',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE status = 'sending'
                   AND locked_at < CURRENT_TIMESTAMP - make_interval(mins => $1::int)
                   AND smtp_attempted_at IS NOT NULL
                 RETURNING id`,
                [STALE_LOCK_MINUTES]
            );

            if (quarantinedResult.rowCount) {
                console.warn(JSON.stringify({
                    event: 'campaign_delivery_stale_quarantined',
                    count: quarantinedResult.rowCount,
                    deliveryState: 'unknown',
                }));
            }

            // A stale lock that never reached the SMTP-attempt marker is safe to
            // retry using the ordinary failed/backoff queue semantics.
            const releasedResult = await client.query(
                `UPDATE vgp_recipient_logs
                 SET status = 'failed', locked_at = NULL,
                     next_attempt_at = CASE
                       WHEN attempts >= max_attempts THEN NULL
                       ELSE CURRENT_TIMESTAMP
                     END,
                     last_error = CASE
                       WHEN attempts >= max_attempts
                         THEN 'Processor stopped before SMTP attempt; maximum attempts exhausted'
                       ELSE 'Processor stopped before SMTP attempt; safe to retry'
                     END,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE status = 'sending'
                   AND locked_at < CURRENT_TIMESTAMP - make_interval(mins => $1::int)
                   AND smtp_attempted_at IS NULL
                 RETURNING id`,
                [STALE_LOCK_MINUTES]
            );

            if (releasedResult.rowCount) {
                console.warn(JSON.stringify({
                    event: 'campaign_delivery_stale_released',
                    count: releasedResult.rowCount,
                    deliveryState: 'failed',
                }));
            }

            // Terminalize exhausted work so a stale final attempt cannot leave
            // its parent campaign permanently in the sending state.
            await client.query(
                `UPDATE vgp_recipient_logs
                 SET status = 'failed', locked_at = NULL, next_attempt_at = NULL,
                     last_error = COALESCE(last_error, 'Maximum delivery attempts exhausted'),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE attempts >= max_attempts
                   AND status IN ('pending', 'failed')`
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
                   AND rl.status IN ('pending', 'failed')`
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
                     SET status = 'sending', locked_at = CURRENT_TIMESTAMP,
                         smtp_attempted_at = NULL, attempts = attempts + 1,
                         updated_at = CURRENT_TIMESTAMP
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
                         rl.status IN ('pending', 'sending', 'unknown')
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
            unknownCount: 0,
            processedJobs: [] as { jobId: number; status: string }[]
        };

        // 4. Send SMTP emails OUTSIDE the database transaction
        for (const job of jobs) {
            let deliveryAttemptStarted = false;

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

                const jobNameClean = job.name && job.name.trim() ? job.name.trim() : '';
                const recipientName = jobNameClean && jobNameClean !== 'Producer'
                    ? jobNameClean
                    : getDefaultNameFromEmail(job.email);

                const renderedEmail = renderCampaignEmail({
                    recipientName,
                    recipientEmail: job.email,
                    subject: job.subject,
                    templateType: job.template_type,
                    bodyContent: job.body_content,
                    unsubscribeUrl,
                    baseUrl,
                    logId: job.id,
                    includeTrackingPixel: true,
                });

                // Persist the external-action boundary before invoking SMTP.
                // A crash after this marker must be reconciled, never retried.
                const attemptResult = await pool.query(
                    `UPDATE vgp_recipient_logs
                     SET smtp_attempted_at = CURRENT_TIMESTAMP,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1 AND status = 'sending'
                     RETURNING id`,
                    [job.id]
                );

                if (attemptResult.rowCount !== 1) {
                    results.processedJobs.push({ jobId: job.id, status: 'state_changed' });
                    continue;
                }

                deliveryAttemptStarted = true;
                const mailRes = await transporter.sendMail({
                    from: `"Virzy Guns Production" <${process.env.SMTP_USER}>`,
                    to: job.email,
                    subject: job.subject,
                    text: renderedEmail.text,
                    html: renderedEmail.html
                });

                // SMTP returned acceptance. Persist it even if a concurrent abort
                // changed the row to skipped after the final state check.
                const sentResult = await pool.query(
                    `UPDATE vgp_recipient_logs
                     SET status = 'sent', sent_at = CURRENT_TIMESTAMP,
                         message_id = $2, locked_at = NULL, next_attempt_at = NULL,
                         last_error = NULL, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1 AND status IN ('sending', 'skipped', 'unknown')
                     RETURNING id`,
                    [job.id, mailRes.messageId || 'unknown']
                );

                if (sentResult.rowCount !== 1) {
                    const persistenceError = new Error('delivery_receipt_not_persisted') as Error & { code: string };
                    persistenceError.code = 'DELIVERY_RECEIPT_NOT_PERSISTED';
                    throw persistenceError;
                }

                results.successCount++;
                results.processedJobs.push({ jobId: job.id, status: 'sent' });
            } catch (err: unknown) {
                const errorCode = getSafeErrorCode(err);
                const isFinalFailure = job.attempts >= job.max_attempts;
                const retryDelayMinutes = Math.min(60, 5 * (2 ** Math.max(0, job.attempts - 1)));
                const nextAttemptAt = new Date(Date.now() + retryDelayMinutes * 60 * 1000);
                const deliveryState = deliveryAttemptStarted ? 'unknown' : 'failed';
                const storedError = deliveryAttemptStarted
                    ? `Delivery outcome unknown after SMTP attempt (${errorCode}); manual reconciliation required`
                    : `Pre-delivery processing failed (${errorCode})`;
                const allowedCurrentStatuses = deliveryAttemptStarted
                    ? ['sending', 'skipped', 'unknown']
                    : ['sending'];

                console.error(JSON.stringify({
                    event: 'campaign_delivery_error',
                    jobId: job.id,
                    campaignId: job.campaign_id,
                    attempt: job.attempts,
                    deliveryState,
                    errorCode,
                }));

                const failureResult = await pool.query(
                    `UPDATE vgp_recipient_logs
                     SET status = $2, last_error = $3, locked_at = NULL,
                         next_attempt_at = $4, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1 AND status = ANY($5::text[])
                     RETURNING id`,
                    [
                        job.id,
                        deliveryState,
                        storedError,
                        deliveryAttemptStarted || isFinalFailure ? null : nextAttemptAt,
                        allowedCurrentStatuses,
                    ]
                );

                if (failureResult.rowCount !== 1) {
                    console.error(JSON.stringify({
                        event: 'campaign_delivery_state_conflict',
                        jobId: job.id,
                        campaignId: job.campaign_id,
                        deliveryState,
                        errorCode: 'STATUS_UPDATE_NOT_APPLIED',
                    }));
                }

                if (deliveryAttemptStarted) {
                    results.unknownCount++;
                } else {
                    results.failCount++;
                }
                results.processedJobs.push({ jobId: job.id, status: deliveryState });
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
                     rl.status IN ('pending', 'sending', 'unknown')
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
            unknownCount: results.unknownCount,
            processedJobs: results.processedJobs,
            completedCampaigns: compResult.rows.map(r => r.id)
        });
    } catch (error: unknown) {
        console.error(JSON.stringify({
            event: 'campaign_processor_crash',
            errorCode: getSafeErrorCode(error),
        }));
        return NextResponse.json(
            { error: 'Internal queue processor crash.' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        {
            status: 405,
            headers: { Allow: 'POST' },
        }
    );
}
