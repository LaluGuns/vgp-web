/**
 * Copy text for the reader: the Clipboard API where the page is allowed to
 * use it, else a hidden textarea and execCommand (older Safari, plain http,
 * or a browser that refuses writeText, say without a recent tap). Rejects
 * when neither works, so the caller can say so.
 */
export async function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // Denied or not focused: try the older way below.
        }
    }
    if (!copyWithTextarea(text)) throw new Error('Copy failed');
}

function copyWithTextarea(text: string): boolean {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.setAttribute('aria-hidden', 'true');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    area.style.top = '0';
    area.style.opacity = '0';
    // Selecting moves focus; put it back where the reader was.
    const before = document.activeElement as HTMLElement | null;
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch {
        copied = false;
    }
    area.remove();
    before?.focus({ preventScroll: true });
    return copied;
}
