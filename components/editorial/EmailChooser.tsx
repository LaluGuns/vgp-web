'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getGmailComposeUrl } from '@/lib/founder-contact';

function parseMailto(href: string) {
    const [address, query = ''] = href.replace(/^mailto:/, '').split('?');
    const params = new URLSearchParams(query);
    return {
        address: decodeURIComponent(address),
        subject: params.get('subject') ?? undefined,
        body: params.get('body') ?? undefined,
    };
}

const itemClass =
    'flex w-full items-center rounded-[4px] px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:bg-white/[0.08] focus-visible:text-white';

/**
 * A mailto link that asks how to send: Gmail in the browser, the device's mail
 * app, or copy the address. Plain mailto does nothing for visitors with no mail
 * app set up, and Gmail alone shuts out everyone else.
 */
export function EmailChooser({
    href,
    children,
    className = '',
    wrapperClassName = '',
    placement = 'bottom',
}: {
    href: string;
    children: ReactNode;
    className?: string;
    wrapperClassName?: string;
    placement?: 'bottom' | 'top';
}) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [alignEnd, setAlignEnd] = useState(false);
    const menuRef = useRef<HTMLSpanElement>(null);
    const rootRef = useRef<HTMLSpanElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();
    const { address, subject, body } = parseMailto(href);

    const close = useCallback((returnFocus = false) => {
        setOpen(false);
        setCopied(false);
        if (returnFocus) triggerRef.current?.focus();
    }, []);

    // Flip to right alignment when the menu would run past the viewport edge.
    useLayoutEffect(() => {
        if (!open || !rootRef.current || !menuRef.current) return;
        const triggerLeft = rootRef.current.getBoundingClientRect().left;
        setAlignEnd(triggerLeft + menuRef.current.offsetWidth > window.innerWidth - 12);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) close();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close(true);
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, close]);

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
        } catch {
            window.prompt('Copy the address:', address);
        }
    };

    return (
        <span ref={rootRef} className={`relative inline-block ${wrapperClassName}`.trim()}>
            <button
                ref={triggerRef}
                type="button"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => (open ? close() : setOpen(true))}
                className={className}
            >
                {children}
            </button>
            <span
                ref={menuRef}
                id={menuId}
                hidden={!open}
                className={`vgp-pop absolute ${alignEnd ? 'right-0' : 'left-0'} z-50 w-56 rounded-[6px] border border-white/10 bg-[#0a0e12] p-1.5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.5)] ${
                    placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                }`}
            >
                <span className="block truncate px-3 pb-2 pt-1.5 text-xs text-white/50">{address}</span>
                <a
                    href={getGmailComposeUrl(address, subject, body)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => close()}
                    className={itemClass}
                >
                    Open in Gmail
                </a>
                <a href={href} onClick={() => close()} className={itemClass}>
                    Open mail app
                </a>
                <button type="button" onClick={copyAddress} className={itemClass} aria-live="polite">
                    {copied ? 'Address copied' : 'Copy address'}
                </button>
            </span>
        </span>
    );
}
