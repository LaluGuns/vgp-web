/**
 * VGP — campaign queue trigger.
 *
 * A Cloudflare Cron Trigger fires every 10 minutes and calls the Next.js
 * batch processor with the shared CRON_SECRET. This exists because the
 * Vercel Hobby plan only allows daily cron schedules, so the every-10-min
 * email queue is driven from Cloudflare instead.
 *
 * Required secret (set with `wrangler secret put CRON_SECRET`, NOT in
 * wrangler.toml): CRON_SECRET — must match the CRON_SECRET env var on Vercel.
 */
const worker = {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(trigger(env, event?.scheduledTime));
    },

    // Public HTTP traffic is deliberately side-effect free. Campaign processing
    // can only be started by the configured Cloudflare Cron Trigger.
    async fetch(request) {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/health') {
            return Response.json({
                ok: true,
                service: 'vgp-process-campaigns-cron',
                scheduledOnly: true,
            });
        }

        return Response.json({ error: 'Not found' }, { status: 404 });
    },
};

export default worker;

async function trigger(env, scheduledTime) {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();

    if (!env.CRON_SECRET) {
        console.error(JSON.stringify({
            event: 'campaign_processor_config_error',
            requestId,
            code: 'CRON_SECRET_MISSING',
        }));
        throw new Error('campaign_processor_config_error');
    }

    try {
        const res = await fetch(env.PROCESS_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
        });

        // The response may contain job-level metadata. Do not buffer or log it.
        await res.body?.cancel();

        if (!res.ok) {
            console.error(JSON.stringify({
                event: 'campaign_processor_http_error',
                requestId,
                scheduledTime: scheduledTime ?? null,
                status: res.status,
                durationMs: Date.now() - startedAt,
            }));
            throw new Error(`campaign_processor_http_${res.status}`);
        }

        console.log(JSON.stringify({
            event: 'campaign_processor_ok',
            requestId,
            scheduledTime: scheduledTime ?? null,
            status: res.status,
            durationMs: Date.now() - startedAt,
        }));
    } catch (err) {
        if (err instanceof Error && err.message.startsWith('campaign_processor_http_')) {
            throw err;
        }

        console.error(JSON.stringify({
            event: 'campaign_processor_request_error',
            requestId,
            scheduledTime: scheduledTime ?? null,
            code: 'UPSTREAM_REQUEST_FAILED',
            durationMs: Date.now() - startedAt,
        }));
        throw new Error('campaign_processor_request_failed');
    }
}
