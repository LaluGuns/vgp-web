export const founderEmail = 'founder@virzyguns.com';

export function getFounderGmailComposeUrl(subject: string, body?: string) {
    const params = new URLSearchParams({
        view: 'cm',
        fs: '1',
        to: founderEmail,
        su: subject,
    });

    if (body) params.set('body', body);

    return `https://mail.google.com/mail/?${params.toString()}`;
}
