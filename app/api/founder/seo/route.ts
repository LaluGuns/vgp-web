import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkFounderSession } from '@/lib/auth';

// ── Service Account Auth Helper (No Google APIs dependencies) ─────────
async function getAccessToken(serviceAccountJson: any): Promise<string> {
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: serviceAccountJson.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
    const signatureInput = `${base64Header}.${base64Claim}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    
    // Support either direct private key or parsed key containing escape characters
    const privateKey = serviceAccountJson.private_key;
    const signature = sign.sign(privateKey, 'base64url');

    const jwt = `${signatureInput}.${signature}`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OAuth token exchange failed: ${errText}`);
    }

    const data = await response.json();
    return data.access_token;
}

// ── Mock Data for Demo Setup Mode ───────────────────────────────────────
function getDemoData() {
    const today = new Date();
    const chart = [];
    
    for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i - 3);
        const randOffset = Math.sin(i / 3) * 10 + Math.random() * 5;
        chart.push({
            date: d.toISOString().split('T')[0],
            clicks: Math.max(0, Math.round(15 + randOffset)),
            impressions: Math.round(240 + randOffset * 15 + Math.random() * 50),
        });
    }

    const queries = [
        { query: 'healingwave beats', clicks: 120, impressions: 850, ctr: '14.1%', position: 1.2 },
        { query: 'virzy guns production', clicks: 95, impressions: 520, ctr: '18.3%', position: 1.0 },
        { query: 'buy spatial audio beats', clicks: 54, impressions: 940, ctr: '5.7%', position: 2.4 },
        { query: 'cadenz app download', clicks: 42, impressions: 1100, ctr: '3.8%', position: 3.1 },
        { query: 'bio resonance beats', clicks: 31, impressions: 450, ctr: '6.9%', position: 1.8 },
        { query: 'free lofi beats download', clicks: 28, impressions: 2100, ctr: '1.3%', position: 8.4 },
        { query: 'music producer bandung', clicks: 18, impressions: 320, ctr: '5.6%', position: 4.2 },
        { query: 'vgp inner circle', clicks: 12, impressions: 85, ctr: '14.1%', position: 1.1 },
    ];

    return {
        clicks: 400,
        impressions: 6345,
        ctr: '6.3%',
        position: 2.9,
        chart,
        queries,
    };
}

export async function GET(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const credsEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

        if (!credsEnv) {
            // Return simulated demo data with connected: false
            return NextResponse.json({
                success: true,
                connected: false,
                metrics: getDemoData(),
                clientEmail: null,
            });
        }

        let creds: any;
        try {
            creds = JSON.parse(credsEnv);
        } catch (jsonErr) {
            console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', jsonErr);
            throw new Error('Environment variable GOOGLE_SERVICE_ACCOUNT_JSON has invalid JSON format.');
        }

        const accessToken = await getAccessToken(creds);
        
        // Calculate date ranges (Google Search Console typically has 3 days lag)
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() - 3);
        const start = new Date(end);
        start.setDate(end.getDate() - 30);
        
        const fmtDate = (d: Date) => d.toISOString().split('T')[0];
        const startDate = fmtDate(start);
        const endDate = fmtDate(end);

        const resourceId = 'sc-domain:virzyguns.com';
        const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(resourceId)}/searchAnalytics/query`;

        // 1. Fetch grand totals (no dimensions)
        const totalsPromise = fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ startDate, endDate }),
        });

        // 2. Fetch time series chart data (date dimension)
        const chartPromise = fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startDate,
                endDate,
                dimensions: ['date'],
            }),
        });

        // 3. Fetch top queries (query dimension)
        const queriesPromise = fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startDate,
                endDate,
                dimensions: ['query'],
                rowLimit: 20,
            }),
        });

        const [totalsRes, chartRes, queriesRes] = await Promise.all([
            totalsPromise,
            chartPromise,
            queriesPromise,
        ]);

        if (!totalsRes.ok || !chartRes.ok || !queriesRes.ok) {
            const errs = await Promise.all([
                totalsRes.ok ? '' : totalsRes.text(),
                chartRes.ok ? '' : chartRes.text(),
                queriesRes.ok ? '' : queriesRes.text(),
            ]);
            throw new Error(`Google API Request(s) failed: ${errs.filter(Boolean).join(' | ')}`);
        }

        const totalsData = await totalsRes.json();
        const chartData = await chartRes.json();
        const queriesData = await queriesRes.json();

        // Parse totals
        const totalClicks = totalsData.rows?.[0]?.clicks || 0;
        const totalImpressions = totalsData.rows?.[0]?.impressions || 0;
        const avgCtr = `${((totalsData.rows?.[0]?.ctr || 0) * 100).toFixed(1)}%`;
        const avgPosition = parseFloat((totalsData.rows?.[0]?.position || 0).toFixed(1));

        // Parse chart rows
        const chart = (chartData.rows || []).map((row: any) => ({
            date: row.keys[0],
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
        })).sort((a: any, b: any) => a.date.localeCompare(b.date));

        // Parse top queries
        const queries = (queriesData.rows || []).map((row: any) => ({
            query: row.keys[0],
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: `${((row.ctr || 0) * 100).toFixed(1)}%`,
            position: parseFloat((row.position || 0).toFixed(1)),
        }));

        return NextResponse.json({
            success: true,
            connected: true,
            metrics: {
                clicks: totalClicks,
                impressions: totalImpressions,
                ctr: avgCtr,
                position: avgPosition,
                chart,
                queries,
            },
            clientEmail: creds.client_email,
        });

    } catch (error: any) {
        console.error('SEO Analytics API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to query Search Console API.',
        }, { status: 500 });
    }
}
