export const founderEmail = 'founder@virzyguns.com';

export function getGmailComposeUrl(to: string, subject?: string, body?: string) {
    const params = new URLSearchParams({ view: 'cm', fs: '1', to });

    if (subject) params.set('su', subject);
    if (body) params.set('body', body);

    return `https://mail.google.com/mail/?${params.toString()}`;
}

export function getFounderGmailComposeUrl(subject: string, body?: string) {
    return getGmailComposeUrl(founderEmail, subject, body);
}
