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

        const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
        const categoryParams = categories.map(c => `category=${c}`).join('&');

        const makeApiUrl = (strategy: 'desktop' | 'mobile') =>
            `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
                targetUrl
            )}&strategy=${strategy}&${categoryParams}${key ? `&key=${key}` : ''}`;

        const fetchStrategy = async (strategy: 'desktop' | 'mobile') => {
            console.log(`Running PageSpeed ${strategy} audit for ${targetUrl}...`);
            const response = await fetch(makeApiUrl(strategy), {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                next: { revalidate: 3600 } // Cache results for 1 hour on Next.js side
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`PageSpeed ${strategy} API Error response:`, errText);
                throw new Error(`Google PageSpeed API (${strategy}) returned status ${response.status}`);
            }

            const data = await response.json();
            const lh = data.lighthouseResult;

            return {
                performance: Math.round((lh.categories.performance?.score || 0) * 100),
                accessibility: Math.round((lh.categories.accessibility?.score || 0) * 100),
                bestPractices: Math.round((lh.categories['best-practices']?.score || 0) * 100),
                seo: Math.round((lh.categories.seo?.score || 0) * 100),
                fcp: lh.audits['first-contentful-paint']?.displayValue || 'N/A',
                lcp: lh.audits['largest-contentful-paint']?.displayValue || 'N/A',
                tbt: lh.audits['total-blocking-time']?.displayValue || 'N/A',
                cls: lh.audits['cumulative-layout-shift']?.displayValue || 'N/A',
                speedIndex: lh.audits['speed-index']?.displayValue || 'N/A',
            };
        };

        const [desktop, mobile] = await Promise.all([
            fetchStrategy('desktop'),
            fetchStrategy('mobile')
        ]);

        const metrics = {
            url: targetUrl,
            desktop,
            mobile,
            auditTime: new Date().toISOString()
        };

        return NextResponse.json({ success: true, metrics });
    } catch (error: any) {
        console.error('PageSpeed Audit API Error:', error);

        // Report unavailability honestly instead of substituting fabricated
        // metrics. The dashboard renders a clear "unavailable / retry" state.
        return NextResponse.json({
            success: false,
            available: false,
            metrics: null,
            error: error.message || 'Failed to query PageSpeed API',
        }, { status: 200 });
    }
}
