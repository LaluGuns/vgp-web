import { NextRequest, NextResponse } from 'next/server';
import pool, { withTransaction } from '@/lib/db';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';
import { z } from 'zod';

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

// Zod schemas for validation
const subscriberImportRowSchema = z.object({
    email: z.string().trim().email("Invalid email format").max(254),
    name: z.string().trim().max(80).optional().nullable(),
    tags: z.array(z.string().trim()).optional().default([]),
    first_name: z.string().trim().max(255).optional().nullable(),
    last_name: z.string().trim().max(255).optional().nullable(),
    account_type: z.string().trim().max(100).optional().nullable(),
    username: z.string().trim().max(255).optional().nullable(),
    user_profile: z.string().trim().max(500).optional().nullable(),
    location: z.string().trim().max(255).optional().nullable(),
    product_type: z.string().trim().max(100).optional().nullable(),
    license_name: z.string().trim().max(100).optional().nullable(),
    product_title: z.string().trim().max(255).optional().nullable(),
});

const MAX_IMPORT_BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
    try {
        const isAuthorized = await checkFounderSession(request);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        let body: any;
        try {
            body = await request.json();
        } catch (jsonErr) {
            return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
        }

        // Validate payload structure
        const payloadResult = z.object({
            subscribers: z.array(z.any()),
        }).safeParse(body);

        if (!payloadResult.success) {
            return NextResponse.json({ error: 'Invalid payload. Expected an array of subscribers.' }, { status: 400 });
        }

        const { subscribers } = payloadResult.data;

        if (subscribers.length > MAX_IMPORT_BATCH_SIZE) {
            return NextResponse.json({ 
                error: `Batch size too large. Maximum allowed is ${MAX_IMPORT_BATCH_SIZE} subscribers per request.` 
            }, { status: 400 });
        }

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        await withTransaction(async (client) => {
            for (let i = 0; i < subscribers.length; i++) {
                const sub = subscribers[i];
                
                // Parse individual subscriber rows
                const rowResult = subscriberImportRowSchema.safeParse(sub);
                if (!rowResult.success) {
                    errorCount++;
                    const rowEmail = sub && typeof sub === 'object' && 'email' in sub ? String(sub.email).trim() : 'Unknown';
                    errors.push(`Validation failed for ${rowEmail}: ${rowResult.error.issues[0].message}`);
                    continue;
                }

                const {
                    email,
                    name,
                    tags,
                    first_name,
                    last_name,
                    account_type,
                    username,
                    user_profile,
                    location,
                    product_type,
                    license_name,
                    product_title
                } = rowResult.data;

                const normalizedEmail = email.toLowerCase();
                const rawName = name && name !== 'Producer' ? name : getDefaultNameFromEmail(normalizedEmail);
                const cleanName = rawName.slice(0, 80);

                const rawTags = tags.map(t => t.toLowerCase());
                const parsedTags: string[] = [];
                for (const t of rawTags) {
                    let clean = t;
                    if (clean === 'cadenz' || clean.includes('cadenz')) {
                        clean = 'cadenz';
                    } else if (clean === 'pembeli beat' || clean === 'beat buyer' || clean === 'beat-buyer' || clean === 'beat_buyer') {
                        clean = 'beat_buyer';
                    } else if (clean === 'pembeli buku' || clean === 'book buyer' || clean === 'book-buyer' || clean === 'book_buyer') {
                        clean = 'book_buyer';
                    }
                    if (clean && !parsedTags.includes(clean)) {
                        parsedTags.push(clean);
                    }
                }

                // Wrap individual row in a Postgres savepoint to support recovery
                const savepointName = `row_import_${i}`;
                await client.query(`SAVEPOINT ${savepointName}`);

                try {
                    await client.query(
                        `INSERT INTO vgp_subscribers (
                            name, email, tags, status,
                            first_name, last_name, account_type, username, 
                            user_profile, location, product_type, license_name, product_title
                         )
                         VALUES ($1, $2, $3, 'subscribed', $4, $5, $6, $7, $8, $9, $10, $11, $12)
                         ON CONFLICT (email)
                         DO UPDATE SET 
                            name = EXCLUDED.name, 
                            tags = ARRAY(SELECT DISTINCT unnest(COALESCE(vgp_subscribers.tags, '{}') || EXCLUDED.tags)), 
                            status = 'subscribed', 
                            unsubscribed_at = NULL,
                            first_name = EXCLUDED.first_name,
                            last_name = EXCLUDED.last_name,
                            account_type = EXCLUDED.account_type,
                            username = EXCLUDED.username,
                            user_profile = EXCLUDED.user_profile,
                            location = EXCLUDED.location,
                            product_type = EXCLUDED.product_type,
                            license_name = EXCLUDED.license_name,
                            product_title = EXCLUDED.product_title`,
                        [
                            cleanName, 
                            normalizedEmail, 
                            parsedTags,
                            first_name || null,
                            last_name || null,
                            account_type || null,
                            username || null,
                            user_profile || null,
                            location || null,
                            product_type || null,
                            license_name || null,
                            product_title || null
                        ]
                    );
                    await client.query(`RELEASE SAVEPOINT ${savepointName}`);
                    successCount++;
                } catch (dbErr: any) {
                    await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
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
