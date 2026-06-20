import { NextRequest, NextResponse } from 'next/server';
import pool, { withTransaction } from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        const { subscribers } = await request.json();

        if (!Array.isArray(subscribers)) {
            return NextResponse.json({ error: 'Invalid payload. Expected an array of subscribers.' }, { status: 400 });
        }

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        await withTransaction(async (client) => {
            for (const sub of subscribers) {
                const { name, email, tags } = sub;
                if (!email) {
                    errorCount++;
                    errors.push('Row missing email address.');
                    continue;
                }

                const normalizedEmail = String(email).trim().toLowerCase();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(normalizedEmail)) {
                    errorCount++;
                    errors.push(`Invalid email format: ${normalizedEmail}`);
                    continue;
                }

                const cleanName = String(name || 'Producer').trim();
                const parsedTags = Array.isArray(tags) ? tags.map(t => String(t).trim().toLowerCase()) : [];

                try {
                    await client.query(
                        `INSERT INTO vgp_subscribers (name, email, tags, status)
                         VALUES ($1, $2, $3, 'subscribed')
                         ON CONFLICT (email)
                         DO UPDATE SET name = EXCLUDED.name, tags = EXCLUDED.tags, status = 'subscribed', unsubscribed_at = NULL`,
                        [cleanName, normalizedEmail, parsedTags]
                    );
                    successCount++;
                } catch (dbErr: any) {
                    console.error('Failed to import row:', sub, dbErr);
                    errorCount++;
                    errors.push(`Database error for ${normalizedEmail}: ${dbErr.message}`);
                }
            }
        });

        return NextResponse.json({
            success: true,
            imported: successCount,
            failed: errorCount,
            errors: errors.slice(0, 10), // Limit error details in response
        });
    } catch (error: any) {
        console.error('Import Subscribers POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
