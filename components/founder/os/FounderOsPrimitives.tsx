import type { ReactNode } from 'react';
import { ArrowUpRight, CircleAlert, Info, ShieldCheck } from 'lucide-react';
import type {
    ApprovalStatus,
    EvidenceFreshness,
    IntegrationStatus,
} from '@/lib/founder-os/contracts';

const STATUS_STYLES: Record<ApprovalStatus, string> = {
    DRAFT: 'border-white/10 bg-white/[0.04] text-white/55',
    READY_FOR_APPROVAL: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
    APPROVED: 'border-sky-300/25 bg-sky-300/10 text-sky-100',
    EXECUTING: 'border-violet-300/25 bg-violet-300/10 text-violet-100',
    SUCCEEDED: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    FAILED: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
    UNKNOWN: 'border-orange-300/25 bg-orange-300/10 text-orange-100',
};

const INTEGRATION_STYLES: Record<IntegrationStatus, string> = {
    connected: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    configured: 'border-sky-300/25 bg-sky-300/10 text-sky-100',
    'not-connected': 'border-white/10 bg-white/[0.04] text-white/50',
    error: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
};

export function Surface({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-[1.6rem] border border-white/[0.08] bg-[#07121b]/75 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
        >
            {children}
        </section>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300/75">
                    {eyebrow}
                </p>
                <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                    {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function MetricCard({
    label,
    value,
    helper,
    icon,
    tone = 'sky',
}: {
    label: string;
    value: string;
    helper: string;
    icon: ReactNode;
    tone?: 'sky' | 'emerald' | 'amber' | 'violet';
}) {
    const toneClasses = {
        sky: 'border-sky-300/15 bg-sky-300/[0.06] text-sky-200',
        emerald: 'border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200',
        amber: 'border-amber-300/15 bg-amber-300/[0.06] text-amber-200',
        violet: 'border-violet-300/15 bg-violet-300/[0.06] text-violet-200',
    };

    return (
        <article className="rounded-[1.35rem] border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-white/45">{label}</span>
                <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${toneClasses[tone]}`}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
            <p className="mt-1 text-xs leading-5 text-white/40">{helper}</p>
        </article>
    );
}

export function ApprovalStatusPill({ status }: { status: ApprovalStatus }) {
    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLES[status]}`}
        >
            {status.replaceAll('_', ' ')}
        </span>
    );
}

export function IntegrationStatusPill({ status }: { status: IntegrationStatus }) {
    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] ${INTEGRATION_STYLES[status]}`}
        >
            {status.replace('-', ' ')}
        </span>
    );
}

export function FreshnessPill({ freshness }: { freshness: EvidenceFreshness }) {
    const style =
        freshness === 'fresh'
            ? 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100'
            : freshness === 'stale'
                ? 'border-amber-300/20 bg-amber-300/[0.08] text-amber-100'
                : 'border-white/10 bg-white/[0.04] text-white/45';

    return (
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${style}`}>
            {freshness}
        </span>
    );
}

export function SafetyNotice({
    title,
    children,
    tone = 'info',
}: {
    title: string;
    children: ReactNode;
    tone?: 'info' | 'warning' | 'safe';
}) {
    const styles = {
        info: 'border-sky-300/15 bg-sky-300/[0.05] text-sky-100',
        warning: 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100',
        safe: 'border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-100',
    };
    const Icon = tone === 'warning' ? CircleAlert : tone === 'safe' ? ShieldCheck : Info;

    return (
        <div className={`flex gap-3 rounded-2xl border p-4 ${styles[tone]}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <div className="mt-1 text-xs leading-5 text-white/55">{children}</div>
            </div>
        </div>
    );
}

export function ScoreBar({
    label,
    value,
    max,
}: {
    label: string;
    value: number;
    max: number;
}) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-white/50">{label}</span>
                <span className="font-mono text-white/75">
                    {value}/{max}
                </span>
            </div>
            <div
                className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
                role="progressbar"
                aria-label={label}
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-200"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function TextLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    const isExternal = href.startsWith('http');

    return (
        <a
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
            {children}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
    );
}
