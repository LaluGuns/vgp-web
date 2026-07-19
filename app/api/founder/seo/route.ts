import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkFounderSession } from '@/lib/auth';

const FLOW_PAGE_PREFIX = 'https://flow.virzyguns.com/';
const BRAND_TERMS = ['virzy', 'virzyguns', 'flow by virzy guns'];
type GscRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };

function formatRow(row: GscRow) {
    return { clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: `${((row.ctr || 0) * 100).toFixed(1)}%`, position: parseFloat((row.position || 0).toFixed(1)) };
}
function classifyPage(page: string) {
    let pathname = page;
    try { pathname = new URL(page).pathname; } catch { /* GSC value retained */ }
    const locale = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/|$)/)?.[1] ?? 'en';
    const normalized = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '') || '/';
    const cluster = normalized.includes('creator-music') ? 'creator_music' : normalized.includes('deep-work') ? 'deep_work' : normalized.includes('study-timer') ? 'study_timer' : normalized.includes('pomodoro') ? 'pomodoro_music' : normalized.includes('/timer/') ? 'timer_preset' : normalized.includes('pricing') ? 'pricing' : 'product';
    return { locale, cluster };
}
function isBrandQuery(query: string) { return BRAND_TERMS.some((term) => query.toLowerCase().includes(term)); }

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

export async function GET(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const credsEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

        if (!credsEnv) {
            // Honest not-connected state — no placeholder metrics.
            return NextResponse.json({
                success: true,
                connected: false,
                metrics: null,
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

        // Search Console property is domain-wide: every query is constrained to Flow.
        const flowFilter = [{ filters: [{ dimension: 'page', operator: 'contains', expression: FLOW_PAGE_PREFIX }] }];
        const requestGsc = (dimensions: string[] = [], rowLimit?: number) => fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, dimensionFilterGroups: flowFilter }),
        });
        const [totalsRes, chartRes, queriesRes, pagesRes, queryPagesRes, countriesRes, devicesRes] = await Promise.all([
            requestGsc(), requestGsc(['date'], 1000), requestGsc(['query'], 50), requestGsc(['page'], 50),
            requestGsc(['query', 'page'], 100), requestGsc(['country'], 25), requestGsc(['device'], 10),
        ]);
        const responses = [totalsRes, chartRes, queriesRes, pagesRes, queryPagesRes, countriesRes, devicesRes];
        if (responses.some((response) => !response.ok)) {
            const errs = await Promise.all(responses.map((response) => response.ok ? '' : response.text()));
            throw new Error(`Google API Request(s) failed: ${errs.filter(Boolean).join(' | ')}`);
        }

        const totalsData = await totalsRes.json();
        const chartData = await chartRes.json();
        const [queriesData, pagesData, queryPagesData, countriesData, devicesData] = await Promise.all([
            queriesRes.json(), pagesRes.json(), queryPagesRes.json(), countriesRes.json(), devicesRes.json(),
        ]);

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
        const queries = (queriesData.rows || []).map((row: GscRow) => ({ query: row.keys?.[0] || '', ...formatRow(row), brand: isBrandQuery(row.keys?.[0] || '') }));
        type PageMetric = ReturnType<typeof formatRow> & { page: string; cluster: string; locale: string };
        const pages: PageMetric[] = (pagesData.rows || []).map((row: GscRow): PageMetric => ({ page: row.keys?.[0] || '', ...formatRow(row), ...classifyPage(row.keys?.[0] || '') }));
        const queryPages = (queryPagesData.rows || []).map((row: GscRow) => ({ query: row.keys?.[0] || '', page: row.keys?.[1] || '', ...formatRow(row), brand: isBrandQuery(row.keys?.[0] || ''), ...classifyPage(row.keys?.[1] || '') }));
        const countries = (countriesData.rows || []).map((row: GscRow) => ({ country: row.keys?.[0] || '', ...formatRow(row) }));
        const devices = (devicesData.rows || []).map((row: GscRow) => ({ device: row.keys?.[0] || '', ...formatRow(row) }));
        const clusterMap = pages.reduce((acc: Record<string, { cluster: string; locale: string; clicks: number; impressions: number }>, page: PageMetric) => {
            const key = `${page.cluster}:${page.locale}`;
            const current = acc[key] || { cluster: page.cluster, locale: page.locale, clicks: 0, impressions: 0 };
            current.clicks += page.clicks; current.impressions += page.impressions; acc[key] = current;
            return acc;
        }, {} as Record<string, { cluster: string; locale: string; clicks: number; impressions: number }>);
        const clusters = Object.values(clusterMap).sort((a, b) => b.clicks - a.clicks);

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
                pages,
                queryPages,
                countries,
                devices,
                clusters,
                scope: { pagePrefix: FLOW_PAGE_PREFIX, startDate, endDate },
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
