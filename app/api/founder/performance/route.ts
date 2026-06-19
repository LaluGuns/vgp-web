import { NextRequest, NextResponse } from 'next/server';
import { checkFounderSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Authenticate request
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const targetUrl = searchParams.get('url') || 'https://www.virzyguns.com';
        
        const key = process.env.PAGESPEED_API_KEY || '';
        const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            targetUrl
        )}&category=performance${key ? `&key=${key}` : ''}`;

        console.log(`Running PageSpeed audit for ${targetUrl}...`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            next: { revalidate: 3600 } // Cache results for 1 hour on Next.js side
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('PageSpeed API Error response:', errText);
            throw new Error(`Google PageSpeed API returned status ${response.status}`);
        }

        const data = await response.json();
        
        const lh = data.lighthouseResult;
        const score = Math.round((lh.categories.performance.score || 0) * 100);
        
        const metrics = {
            url: targetUrl,
            score,
            fcp: lh.audits['first-contentful-paint']?.displayValue || 'N/A',
            lcp: lh.audits['largest-contentful-paint']?.displayValue || 'N/A',
            tbt: lh.audits['total-blocking-time']?.displayValue || 'N/A',
            cls: lh.audits['cumulative-layout-shift']?.displayValue || 'N/A',
            speedIndex: lh.audits['speed-index']?.displayValue || 'N/A',
            auditTime: new Date().toISOString()
        };

        return NextResponse.json({ success: true, metrics });
    } catch (error: any) {
        console.error('PageSpeed Audit API Error:', error);
        
        // Return a mock fallback if API fails due to rate limits or invalid target URL
        // so that the dashboard UI doesn't crash during presentation
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to query PageSpeed API',
            fallback: {
                url: 'https://www.virzyguns.com',
                score: 94,
                fcp: '1.2s',
                lcp: '2.1s',
                tbt: '140ms',
                cls: '0.04',
                speedIndex: '1.5s',
                auditTime: new Date().toISOString(),
                isMock: true
            }
        });
    }
}
