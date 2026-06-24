// Quick API test script
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
}

const BASE = 'http://localhost:3000';

async function test(label, url, options = {}) {
    console.log(`\n=== ${label} ===`);
    try {
        const res = await fetch(url, { redirect: 'manual', ...options });
        const text = await res.text();
        let body;
        try { body = JSON.parse(text); } catch { body = text; }
        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(body, null, 2));
        // Extract Set-Cookie headers
        let setCookies = [];
        if (res.headers.getSetCookie) {
            setCookies = res.headers.getSetCookie();
        } else {
            const raw = res.headers.get('set-cookie');
            if (raw) setCookies = raw.split(/,(?=\s*\w+=)/);
        }
        if (setCookies.length > 0) console.log('Set-Cookie:', setCookies);
        return { status: res.status, body, setCookies };
    } catch (err) {
        console.error('Fetch error:', err.message);
        return null;
    }
}

async function main() {
    // 1. Newsletter signup
    const signup = await test('Newsletter Signup', `${BASE}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': BASE },
        body: JSON.stringify({ email: 'testdummy@virzyguns.com', name: 'Dummy Test' }),
    });

    // 2. Duplicate signup (should handle gracefully)
    await test('Duplicate Signup', `${BASE}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': BASE },
        body: JSON.stringify({ email: 'testdummy@virzyguns.com', name: 'Dummy Test' }),
    });

    // 3. Founder login (wrong passcode)
    await test('Founder Login - Wrong Passcode', `${BASE}/api/founder/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': BASE },
        body: JSON.stringify({ passcode: 'wrong-password-123' }),
    });

    // 4. Founder login (correct passcode from env)
    const passcode = process.env.FOUNDER_PASSCODE;
    if (passcode) {
        const loginRes = await test('Founder Login - Correct Passcode', `${BASE}/api/founder/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Origin': BASE },
            body: JSON.stringify({ passcode }),
        });

        // Extract session cookie if login succeeded
        if (loginRes && loginRes.status === 200) {
            console.log('\n--- Login successful, testing authenticated routes ---');

            // Extract the session cookie from Set-Cookie header (support both standard and hardened prefixes)
            const sessionCookie = (loginRes.setCookies || [])
                .find(c => c.startsWith('founder_session=') || c.startsWith('__Host-founder_session='));
            const cookieValue = sessionCookie ? sessionCookie.split(';')[0] : '';
            console.log('Cookie extracted:', cookieValue ? 'yes (' + cookieValue.substring(0, 30) + '...)' : 'no');

            // 5. Get subscribers
            await test('Get Subscribers', `${BASE}/api/founder/subscribers`, {
                headers: { 'Cookie': cookieValue },
            });

            // 6. Get campaigns
            await test('Get Campaigns', `${BASE}/api/founder/campaigns/create`, {
                headers: { 'Cookie': cookieValue },
            });
        }
    } else {
        console.log('\nSkipping founder login test: FOUNDER_PASSCODE not in env');
    }

    // 7. Unsubscribe with invalid token
    await test('Unsubscribe - Invalid Token', `${BASE}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': BASE },
        body: JSON.stringify({ token: 'invalid-token-here' }),
    });

    // 8. Cron without secret (should be 401)
    await test('Cron Process Campaigns - No Secret', `${BASE}/api/cron/process-campaigns`);

    // 9. Cron with correct secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        await test('Cron Process Campaigns - With Secret', `${BASE}/api/cron/process-campaigns`, {
            headers: { 'Authorization': `Bearer ${cronSecret}` },
        });

        await test('Cron Daily Report - With Secret', `${BASE}/api/cron/daily-report`, {
            headers: { 'Authorization': `Bearer ${cronSecret}` },
        });
    } else {
        console.log('\nSkipping cron tests: CRON_SECRET not in env');
    }

    console.log('\n=== ALL TESTS COMPLETE ===\n');
}

main().catch(console.error);
