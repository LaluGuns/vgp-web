import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';
import { signToken } from '@/lib/tokens';
import { getAppBaseUrl, hasValidRequestOrigin } from '@/lib/auth';
import redis from '@/lib/redis';
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

// Zod schema validation for input data
const newsletterPostSchema = z.object({
    email: z.string().trim().email("Invalid email format").max(254),
    name: z.string().trim().max(80).optional().nullable(),
    website: z.string().optional().nullable(), // Honeypot field
    tags: z.array(z.string().trim()).optional().default([]),
});

// Production-grade Rate Limiting
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 3;

// Memory-bounded fallback map to prevent memory leaks if Redis is not configured
const fallbackCache = new Map<string, { count: number; expiresAt: number }>();

function pruneFallbackCache() {
    const now = Date.now();
    for (const [ip, data] of fallbackCache.entries()) {
        if (now > data.expiresAt) {
            fallbackCache.delete(ip);
        }
    }
}

async function isRateLimited(ip: string): Promise<boolean> {
    if (redis) {
        const key = `ratelimit:newsletter:${ip}`;
        try {
            const current = await redis.get(key);
            if (current !== null) {
                const count = parseInt(current, 10);
                if (count >= RATE_LIMIT_MAX_REQUESTS) {
                    return true;
                }
                await redis.incr(key);
            } else {
                await redis.set(key, '1', 'EX', RATE_LIMIT_WINDOW_SECONDS);
            }
            return false;
        } catch (redisError) {
            console.warn('Redis rate-limiting failed, falling back to local memory rate-limiter:', redisError);
        }
    }

    // In-memory rate limiting fallback with leak prevention
    if (fallbackCache.size > 1000) {
        pruneFallbackCache();
        if (fallbackCache.size > 2000) {
            // Drop oldest entry if still overflowing
            const oldestKey = fallbackCache.keys().next().value;
            if (oldestKey) fallbackCache.delete(oldestKey);
        }
    }

    const now = Date.now();
    const cached = fallbackCache.get(ip);

    if (!cached || now > cached.expiresAt) {
        fallbackCache.set(ip, {
            count: 1,
            expiresAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000,
        });
        return false;
    }

    if (cached.count >= RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }

    cached.count++;
    return false;
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
    try {
        // CSRF check & secure baseUrl resolution
        if (!hasValidRequestOrigin(request)) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }
        const baseUrl = getAppBaseUrl(request);

        // Test database pool connection first
        try {
            const client = await pool.connect();
            client.release();
        } catch (dbError) {
            console.error('Database connection test failed:', dbError);
            return NextResponse.json(
                { error: 'Newsletter is temporarily unavailable.' },
                { status: 503 }
            );
        }

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';

        if (await isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse JSON safely to prevent 500 crash on malformed payloads
        let body: any;
        try {
            body = await request.json();
        } catch (jsonErr) {
            return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
        }

        // Validate using Zod schema
        const parseResult = newsletterPostSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, name, website, tags } = parseResult.data;

        // Honeypot field for bot submissions
        if (website) {
            return NextResponse.json({ success: true });
        }

        const normalizedEmail = email.toLowerCase();
        
        // Clean name resolving
        const rawName = name && name !== 'Producer' ? name : getDefaultNameFromEmail(normalizedEmail);
        
        // Store RAW data in the database (no pre-escaping, only length limit)
        const subscriberName = rawName.slice(0, 80);
        const subscriberEmail = normalizedEmail;

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

        // Database Insertion (handling upsert/re-subscribe)
        let subscriberId: number;
        try {
            const result = await pool.query(
                `INSERT INTO vgp_subscribers (name, email, status, tags, unsubscribed_at)
                 VALUES ($1, $2, 'subscribed', $3, NULL)
                 ON CONFLICT (email)
                 DO UPDATE SET 
                    status = 'subscribed', 
                    name = EXCLUDED.name, 
                    tags = ARRAY(SELECT DISTINCT unnest(COALESCE(vgp_subscribers.tags, '{}') || EXCLUDED.tags)), 
                    unsubscribed_at = NULL
                 RETURNING id`,
                [subscriberName, subscriberEmail, parsedTags]
            );
            subscriberId = result.rows[0].id;
        } catch (dbInsertError) {
            console.error('Database subscriber insert failed:', dbInsertError);
            return NextResponse.json(
                { error: 'Failed to record subscription. Please try again.' },
                { status: 500 }
            );
        }

        // Generate secure signed unsubscribe token
        const unsubscribeToken = signToken({
            subscriber_id: subscriberId,
            email: subscriberEmail,
            purpose: 'unsubscribe'
        });

        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;

        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass) {
            throw new Error('CRITICAL ENVIRONMENT ERROR: SMTP credentials (SMTP_USER/SMTP_PASS) are missing.');
        }

        // Configure Hostinger SMTP Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // HTML escaping is performed exclusively during email composition (presentation layer)
        const escapedName = escapeHtml(subscriberName);
        const escapedEmail = escapeHtml(subscriberEmail);

        // 1. Send Notification to Admin
        await transporter.sendMail({
            from: `"VGP System" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `New Subscriber: ${escapedName}`,
            text: `Name: ${subscriberName}\nEmail: ${subscriberEmail}\nDate: ${new Date().toLocaleString()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px;">
                    <h2 style="color: #00E5FF;">New VGP Subscriber! 🚀</h2>
                    <p><strong>Name:</strong> ${escapedName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${escapedEmail}" style="color: #00E5FF;">${escapedEmail}</a></p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `,
        });

        // 2. Send Welcome Email to Subscriber
        await transporter.sendMail({
            from: `"Virzy Guns Production" <${process.env.SMTP_USER}>`,
            to: subscriberEmail,
            subject: `Welcome to the Inner Circle 🛡️`,
            text: `Welcome to VGP, ${subscriberName}. You're now on the list for exclusive beats and updates. Unsubscribe here: ${unsubscribeUrl}`,
            html: `
                <div style="background-color: #000000; color: #ffffff; font-family: 'Courier New', monospace; padding: 40px 20px;">
                    <div style="max-w-md mx-auto border border-gray-800 p-8 rounded-lg" style="border: 1px solid #333;">
                        <h1 style="color: #00E5FF; text-align: center; letter-spacing: 2px; margin-bottom: 30px;">VIRZY GUNS PRODUCTION</h1>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                            Welcome, <strong>${escapedName}</strong>.
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                            You've successfully joined the VGP Inner Circle. You are now prioritized for:
                        </p>
                        
                        <ul style="color: #888888; padding-left: 20px; margin-bottom: 30px;">
                            <li style="margin-bottom: 10px;">Exclusive Beat Drops 🎹</li>
                            <li style="margin-bottom: 10px;">HealingWave R&D Updates 🧠</li>
                            <li style="margin-bottom: 10px;">Private Promo Codes 💎</li>
                        </ul>
                        
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="${baseUrl}/studio/beats" style="background-color: #00E5FF; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: bold; font-family: sans-serif; border-radius: 4px; display: inline-block;">
                                BROWSE STUDIO
                            </a>
                        </div>
                        
                        <hr style="border-color: #333; margin-top: 60px; margin-bottom: 20px;">
                        
                        <div style="text-align: center; font-size: 11px; color: #555555;">
                            © ${new Date().getFullYear()} Virzy Guns Production.<br>
                            To unsubscribe, <a href="${unsubscribeUrl}" style="color: #00E5FF; text-decoration: underline;">click here</a>.
                        </div>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json(
            { error: 'Failed to send welcome email. Please try again later.' },
            { status: 500 }
        );
    }
}
