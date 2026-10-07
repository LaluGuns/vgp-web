import { CADENZ_PLAY_URL } from '@/lib/vgp-ecosystem';

type WelcomeEmail = { subject: string; text: string; html: string };

/**
 * Welcome email for a new subscriber. The popup sends a source label
 * ("Book Waitlist", "VGP Subscriber") as the name for dashboard segmentation,
 * so the greeting never uses it. The body follows the signup's tags instead.
 */
export function buildWelcomeEmail({
    tags,
    baseUrl,
    unsubscribeUrl,
}: {
    tags: string[];
    baseUrl: string;
    unsubscribeUrl: string;
}): WelcomeEmail {
    const variant = tags.includes('book_buyer')
        ? {
              line: 'You will get one email when Music Production Guide: Trap Edition comes out. The free articles on the blog are there to read in the meantime.',
              cta: { label: 'Read the free articles', href: `${baseUrl}/blog` },
          }
        : tags.includes('cadenz')
          ? {
                line: 'You will hear about new CADENZ music and app updates. CADENZ is already on Google Play if you want to run with it today.',
                cta: { label: 'Get CADENZ on Google Play', href: CADENZ_PLAY_URL },
            }
          : {
                line: 'You will get an email when there are new beats, a new article, or news about CADENZ and Flow.',
                cta: { label: 'Browse beats', href: `${baseUrl}/studio/beats` },
            };

    const subject = 'You are on the VGP list';

    const text = [
        'Thanks for signing up to Virzy Guns Production.',
        '',
        variant.line,
        '',
        `${variant.cta.label}: ${variant.cta.href}`,
        '',
        'Virzy Guns',
        '',
        `You signed up at virzyguns.com. Unsubscribe: ${unsubscribeUrl}`,
    ].join('\n');

    const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

    const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
        <tr>
          <td style="font-family:${font};font-size:14px;font-weight:600;color:#050607;padding-bottom:32px;">
            Virzy Guns Production
          </td>
        </tr>
        <tr>
          <td style="font-family:${font};font-size:24px;line-height:32px;font-weight:600;color:#050607;padding-bottom:16px;">
            Thanks for signing up.
          </td>
        </tr>
        <tr>
          <td style="font-family:${font};font-size:16px;line-height:26px;color:#3a3f45;padding-bottom:28px;">
            ${variant.line}
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:36px;">
            <a href="${variant.cta.href}" style="display:inline-block;background:#050607;color:#ffffff;font-family:${font};font-size:14px;font-weight:600;text-decoration:none;padding:13px 24px;border-radius:999px;">
              ${variant.cta.label}
            </a>
          </td>
        </tr>
        <tr>
          <td style="font-family:${font};font-size:16px;line-height:26px;color:#3a3f45;padding-bottom:40px;">
            Virzy Guns
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding-top:20px;font-family:${font};font-size:12px;line-height:20px;color:#6b7280;">
            You signed up at virzyguns.com.
            <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    return { subject, text, html };
}
