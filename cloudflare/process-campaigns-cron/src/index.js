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
export default {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(trigger(env));
    },

    // Optional manual trigger for testing: curl https://<worker-subdomain>.workers.dev
    async fetch(request, env) {
        await trigger(env);
        return new Response('process-campaigns triggered\n');
    },
};

async function trigger(env) {
    if (!env.CRON_SECRET) {
        console.error('CRON_SECRET is not set. Run: wrangler secret put CRON_SECRET');
        return;
    }

    try {
        const res = await fetch(env.PROCESS_URL, {
            method: 'GET',
            headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
        });
        const body = await res.text();
        if (!res.ok) {
            console.error(`process-campaigns failed: ${res.status} ${body}`);
        } else {
            console.log(`process-campaigns ok: ${body}`);
        }
    } catch (err) {
        console.error('process-campaigns request error:', err);
    }
}
