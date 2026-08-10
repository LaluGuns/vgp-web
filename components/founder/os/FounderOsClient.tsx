'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Bot,
    BrainCircuit,
    ChevronRight,
    ClipboardCheck,
    CalendarDays,
    FileCheck2,
    History,
    Database,
    LayoutDashboard,
    Menu,
    Radar,
    Settings2,
    ShieldCheck,
    UserRoundSearch,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { FounderDashboardSnapshot } from '@/lib/founder-os/contracts';
import type {
    BeatMatchSummary,
    IntelligenceSignal,
} from '@/app/founder/os/demo-data';
import { OverviewPanel } from './OverviewPanel';
import { ProspectsPanel } from './ProspectsPanel';
import { ApprovalsPanel } from './ApprovalsPanel';
import { AgentsPanel } from './AgentsPanel';
import { IntelligencePanel } from './IntelligencePanel';
import { shouldShowLiveWorkspaceActivation } from './LiveWorkspaceActivationModel';
import { SettingsPanel } from './SettingsPanel';
import { OperationalDetailPanel } from './OperationalDetailPanel';
import { ProviderConnectionsPanel } from './ProviderConnectionsPanel';
import type { FounderOsSection } from './types';

interface NavigationItem {
    id: FounderOsSection;
    label: string;
    description: string;
    icon: LucideIcon;
}

const NAVIGATION: NavigationItem[] = [
    {
        id: 'overview',
        label: 'Overview',
        description: 'Founder priorities',
        icon: LayoutDashboard,
    },
    {
        id: 'agents-skills',
        label: 'Agents / Skills',
        description: 'AI workforce and boundaries',
        icon: Bot,
    },
    {
        id: 'content-intelligence',
        label: 'Content intelligence',
        description: 'Evidence and hypotheses',
        icon: Radar,
    },
    {
        id: 'prospects',
        label: 'Leads / Prospects',
        description: 'Buyer pipeline',
        icon: UserRoundSearch,
    },
    {
        id: 'content-calendar',
        label: 'Content calendar',
        description: 'Dated plan evidence',
        icon: CalendarDays,
    },
    {
        id: 'drafts',
        label: 'Drafts',
        description: 'Not executable',
        icon: FileCheck2,
    },
    {
        id: 'approvals',
        label: 'Approval queue',
        description: 'Execution boundary',
        icon: ClipboardCheck,
    },
    {
        id: 'providers',
        label: 'Provider connections',
        description: 'Scopes and feature gates',
        icon: ShieldCheck,
    },
    {
        id: 'analytics',
        label: 'Analytics',
        description: 'Verified owned data',
        icon: Database,
    },
    {
        id: 'audit-log',
        label: 'Audit log',
        description: 'Status and reconciliation',
        icon: History,
    },
    {
        id: 'settings',
        label: 'Settings',
        description: 'Policies and connections',
        icon: Settings2,
    },
];

const SECTION_CONTEXT: Record<
    FounderOsSection,
    { label: string; summary: string }
> = {
    overview: {
        label: 'Founder overview',
        summary: 'Priorities, risks, approvals, and workforce status.',
    },
    'agents-skills': { label: 'Agents / skills', summary: 'Bounded roles, active skills, and evidence coverage.' },
    'content-intelligence': { label: 'Content intelligence', summary: 'Evidence, confidence, and testable hypotheses.' },
    prospects: {
        label: 'Prospect intelligence',
        summary: 'Source-backed rapper, game developer, and creator leads.',
    },
    'content-calendar': { label: 'Content calendar', summary: 'Schedule claims require persisted, dated records.' },
    drafts: { label: 'Drafts', summary: 'Drafts are reviewable but never executable.' },
    approvals: {
        label: 'Approval center',
        summary: 'Review exact revisions before external execution.',
    },
    providers: { label: 'Provider connections', summary: 'Configured, connected, scoped, token, webhook, and health stay distinct.' },
    analytics: { label: 'Analytics', summary: 'Only evidence-backed measurement is shown.' },
    'audit-log': { label: 'Audit log', summary: 'Recorded approvals, provider references, and manual reconciliation.' },
    settings: {
        label: 'Founder settings',
        summary: 'Tune strategy while hard safety controls stay locked.',
    },
};

function generatedAtLabel(value: string) {
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    }).format(new Date(value));
}

export function FounderOsClient({
    snapshot,
    beatDirectory,
    intelligenceSignals,
    liveDatabaseEnabled,
}: {
    snapshot: FounderDashboardSnapshot;
    beatDirectory: Record<string, BeatMatchSummary>;
    intelligenceSignals: IntelligenceSignal[];
    liveDatabaseEnabled: boolean;
}) {
    const [activeSection, setActiveSection] = useState<FounderOsSection>('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mainRef = useRef<HTMLElement>(null);
    const mobileMenuRef = useRef<HTMLElement>(null);
    const mobileCloseRef = useRef<HTMLButtonElement>(null);
    const context = SECTION_CONTEXT[activeSection];
    const isLive = snapshot.mode === 'live';
    const readyApprovals = snapshot.approvals.filter(
        (approval) => approval.status === 'READY_FOR_APPROVAL',
    ).length;

    const navigate = (section: FounderOsSection) => {
        setActiveSection(section);
        setMobileMenuOpen(false);
        window.requestAnimationFrame(() => {
            mainRef.current?.focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        mobileCloseRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setMobileMenuOpen(false);
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = Array.from(
                mobileMenuRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
                ) ?? [],
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [mobileMenuOpen]);

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-[#02070c] text-white">
            <a
                href="#founder-os-content"
                className="fixed left-4 top-4 z-[80] -translate-y-20 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition focus:translate-y-0"
            >
                Skip to main content
            </a>

            <div
                className="pointer-events-none fixed inset-0 opacity-80"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(circle at 74% 0%, rgba(56,189,248,0.12), transparent 27rem), radial-gradient(circle at 8% 76%, rgba(139,92,246,0.08), transparent 25rem)',
                }}
            />

            <div className="relative lg:grid lg:min-h-dvh lg:grid-cols-[17.5rem_minmax(0,1fr)]">
                <aside className="hidden border-r border-white/[0.07] bg-[#030b11]/90 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
                    <div className="border-b border-white/[0.07] px-5 py-5">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/[0.08] text-sky-100 shadow-[0_0_30px_rgba(56,189,248,0.08)]">
                                <BrainCircuit className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold tracking-[-0.02em]">VGP Founder OS</p>
                                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                                    Chief Everything Office
                                </p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Founder OS">
                        {NAVIGATION.map((item) => {
                            const Icon = item.icon;
                            const active = activeSection === item.id;
                            const badge = item.id === 'approvals' && readyApprovals > 0 ? readyApprovals : null;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.id)}
                                    aria-current={active ? 'page' : undefined}
                                    className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                                        active
                                            ? 'border-sky-300/20 bg-sky-300/[0.08]'
                                            : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <span
                                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                                            active
                                                ? 'border-sky-300/20 bg-sky-300/[0.08] text-sky-100'
                                                : 'border-white/[0.07] bg-black/20 text-white/40 group-hover:text-white/65'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={`block text-sm font-medium ${
                                                active ? 'text-white' : 'text-white/60'
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[10px] text-white/30">
                                            {item.description}
                                        </span>
                                    </span>
                                    {badge ? (
                                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1.5 font-mono text-[9px] font-bold text-[#211600]">
                                            {badge}
                                        </span>
                                    ) : (
                                        <ChevronRight
                                            className={`h-3.5 w-3.5 ${
                                                active ? 'text-sky-200' : 'text-white/15'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="border-t border-white/[0.07] p-4">
                        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-3.5">
                            <div className="flex items-center gap-2 text-emerald-100">
                                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                <p className="text-xs font-semibold">Approval lock active</p>
                            </div>
                            <p className="mt-2 text-[10px] leading-4 text-white/35">
                                {isLive
                                    ? 'External actions require exact-revision approval and provider eligibility before execution.'
                                    : 'No external action can execute from this demo surface.'}
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0">
                    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#02070c]/90 backdrop-blur-xl">
                        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:hidden"
                                    aria-label="Open Founder OS navigation"
                                    aria-expanded={mobileMenuOpen}
                                >
                                    <Menu className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{context.label}</p>
                                    <p className="mt-0.5 hidden truncate text-[11px] text-white/35 sm:block">
                                        {context.summary}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/35 md:inline-flex">
                                    <Database className="h-3.5 w-3.5" aria-hidden="true" />
                                    Snapshot · {generatedAtLabel(snapshot.generatedAt)} UTC
                                </span>
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-2 text-[10px] sm:px-3 ${
                                        isLive
                                            ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100'
                                            : 'border-amber-300/15 bg-amber-300/[0.06] text-amber-100'
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isLive ? 'bg-emerald-300' : 'bg-amber-300'
                                        }`}
                                    />
                                    <span className="hidden sm:inline">
                                        {isLive ? 'Live workspace' : 'Demo mode'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </header>

                    <main
                        id="founder-os-content"
                        ref={mainRef}
                        tabIndex={-1}
                        className="mx-auto w-full max-w-[94rem] px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8"
                    >
                        {activeSection === 'overview' ? (
                            <OverviewPanel snapshot={snapshot} onNavigate={navigate} />
                        ) : activeSection === 'agents-skills' ? (
                            <AgentsPanel agents={snapshot.agents} />
                        ) : activeSection === 'content-intelligence' ? (
                            <IntelligencePanel signals={intelligenceSignals} settings={snapshot.settings} dataGaps={snapshot.dataGaps} />
                        ) : activeSection === 'prospects' ? (
                            <ProspectsPanel
                                prospects={snapshot.prospects}
                                beatDirectory={beatDirectory}
                                threshold={snapshot.settings.scoreThreshold}
                            />
                        ) : activeSection === 'content-calendar' || activeSection === 'analytics' || activeSection === 'audit-log' ? (
                            <OperationalDetailPanel section={activeSection} snapshot={snapshot} />
                        ) : activeSection === 'drafts' ? (
                            <ApprovalsPanel approvals={snapshot.approvals} live={isLive} filter="drafts" />
                        ) : activeSection === 'approvals' ? (
                            <ApprovalsPanel
                                approvals={snapshot.approvals}
                                live={isLive}
                                filter="queue"
                            />
                        ) : activeSection === 'providers' ? (
                            <ProviderConnectionsPanel
                                settings={snapshot.settings}
                                live={isLive}
                            />
                        ) : (
                            <SettingsPanel
                                initialSettings={snapshot.settings}
                                live={isLive}
                                canActivateLiveWorkspace={
                                    shouldShowLiveWorkspaceActivation(
                                        snapshot.mode,
                                        liveDatabaseEnabled,
                                    )
                                }
                            />
                        )}
                    </main>
                </div>
            </div>

            {mobileMenuOpen ? (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close Founder OS navigation"
                    />
                    <aside
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="founder-os-mobile-nav-title"
                        className="absolute inset-y-0 left-0 w-[min(88vw,21rem)] overflow-y-auto border-r border-white/10 bg-[#030b11] p-4 shadow-[32px_0_90px_rgba(0,0,0,0.6)]"
                    >
                        <div className="flex items-center justify-between gap-4 px-1 py-2">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/[0.08] text-sky-100">
                                    <BrainCircuit className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div>
                                    <p id="founder-os-mobile-nav-title" className="text-sm font-semibold">
                                        VGP Founder OS
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-white/35">Chief Everything Office</p>
                                </div>
                            </div>
                            <button
                                ref={mobileCloseRef}
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                aria-label="Close navigation"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <nav className="mt-6 space-y-2" aria-label="Mobile Founder OS">
                            {NAVIGATION.map((item) => {
                                const Icon = item.icon;
                                const active = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => navigate(item.id)}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                                            active
                                                ? 'border-sky-300/20 bg-sky-300/[0.08]'
                                                : 'border-white/[0.05] bg-white/[0.02]'
                                        }`}
                                    >
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-black/20 text-white/60">
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-medium">{item.label}</span>
                                            <span className="mt-0.5 block text-[10px] text-white/35">
                                                {item.description}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            ) : null}
        </div>
    );
}
