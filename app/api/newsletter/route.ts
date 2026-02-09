import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Configure Hostinger SMTP Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const subscriberName = name || 'Producer';

        // 1. Send Notification to Admin (You)
        await transporter.sendMail({
            from: `"VGP System" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `New Subscriber: ${subscriberName}`,
            text: `Name: ${subscriberName}\nEmail: ${email}\nDate: ${new Date().toLocaleString()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px;">
                    <h2 style="color: #00E5FF;">New VGP Subscriber! 🚀</h2>
                    <p><strong>Name:</strong> ${subscriberName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #00E5FF;">${email}</a></p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `,
        });

        // 2. Send Welcome Email to Subscriber
        await transporter.sendMail({
            from: `"Virzy Guns Production" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Welcome to the Inner Circle 🛡️`,
            text: `Welcome to VGP, ${subscriberName}. You're now on the list for exclusive beats and updates.`,
            html: `
                <div style="background-color: #000000; color: #ffffff; font-family: 'Courier New', monospace; padding: 40px 20px;">
                    <div style="max-w-md mx-auto border border-gray-800 p-8 rounded-lg" style="border: 1px solid #333;">
                        <h1 style="color: #00E5FF; text-align: center; letter-spacing: 2px; margin-bottom: 30px;">VIRZY GUNS PRODUCTION</h1>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                            Welcome, <strong>${subscriberName}</strong>.
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
                            <a href="https://virzyguns.com/studio/beats" style="background-color: #00E5FF; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: bold; font-family: sans-serif; border-radius: 4px; display: inline-block;">
                                BROWSE STUDIO
                            </a>
                        </div>
                        
                        <hr style="border-color: #333; margin-top: 60px; margin-bottom: 20px;">
                        
                        <div style="text-align: center; font-size: 11px; color: #555555;">
                            © ${new Date().getFullYear()} Virzy Guns Production.<br>
                            To unsubscribe, reply "UNSUBSCRIBE" to this email.
                        </div>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: (error as Error).message },
            { status: 500 }
        );
    }
}
