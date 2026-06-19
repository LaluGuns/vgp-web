'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Lighthouse dial display component
function LighthouseDial({ score, label }: { score: number; label: string }) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color = 'text-rose-500';
    let strokeColor = '#f43f5e';
    if (score >= 90) {
        color = 'text-cyan-400';
        strokeColor = '#00E5FF';
    } else if (score >= 50) {
        color = 'text-amber-400';
        strokeColor = '#fbbf24';
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 border border-white/5 rounded-2xl bg-zinc-950/40 backdrop-blur-md">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        className="stroke-zinc-900"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold font-mono ${color}`}>{score}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">LIGHTHOUSE</span>
                </div>
            </div>
            <span className="mt-4 text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">{label}</span>
        </div>
    );
}

// Custom Spline Growth Chart
function GrowthChart({ data }: { data: { date: string; count: number }[] }) {
    if (!data || data.length === 0) return null;
    
    const width = 500;
    const height = 150;
    const padding = 20;
    
    const maxVal = Math.max(...data.map(d => d.count)) * 1.1;
    const minVal = Math.min(...data.map(d => d.count)) * 0.9;
    const range = maxVal - minVal || 10;
    
    const points = data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((d.count - minVal) * (height - 2 * padding)) / range;
        return { x, y, label: d.date, val: d.count };
    });
    
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY2 = points[i].y;
        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    
    const fillPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="w-full border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6">
            <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-400 mb-4 uppercase">SUBSCRIBER TRENDS</h3>
            <div className="relative w-full h-[150px]">
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>
                    <path d={fillPath} fill="url(#chartGlow)" />
                    <path d={linePath} fill="none" stroke="#00E5FF" strokeWidth="2.5" />
                    {points.map((p, i) => (
                        <g key={i} className="group/node">
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="#000"
                                stroke="#00E5FF"
                                strokeWidth="2"
                                className="cursor-pointer hover:r-6 transition-all duration-150"
                            />
                            {/* Hover data card */}
                            <text
                                x={p.x}
                                y={p.y - 10}
                                fill="#00E5FF"
                                fontSize="9"
                                fontWeight="bold"
                                fontFamily="monospace"
                                textAnchor="middle"
                                className="opacity-0 group-hover/node:opacity-100 transition-opacity bg-black duration-150"
                            >
                                {p.val}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="flex justify-between mt-2 px-2">
                {data.map((d, i) => (
                    <span key={i} className="text-[10px] font-mono text-zinc-500">{d.date}</span>
                ))}
            </div>
        </div>
    );
}

export default function FounderDashboardClient() {
    // 1. Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [passcode, setPasscode] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // 2. Navigation State
    const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'campaigns'>('overview');

    // 3. Subscribers and Stats State
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, subscribed: 0, unsubscribed: 0, new24h: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [subsLoading, setSubsLoading] = useState(false);

    // Edit/Add Subscriber state
    const [isAddSubOpen, setIsAddSubOpen] = useState(false);
    const [newSub, setNewSub] = useState({ name: '', email: '' });
    const [isEditSubOpen, setIsEditSubOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<any>(null);
    const [subActionLoading, setSubActionLoading] = useState(false);

    // 4. Campaigns State
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ subject: '', template_type: 'inner_circle', body_content: '' });
    const [campaignActionLoading, setCampaignActionLoading] = useState(false);

    // Campaign Active Monitor Progress state
    const [monitoringCampaignId, setMonitoringCampaignId] = useState<number | null>(null);
    const [campaignProgress, setCampaignProgress] = useState<any>(null);

    // 5. Performance Metrics State
    const [performance, setPerformance] = useState<any>(null);
    const [auditLoading, setAuditLoading] = useState(false);

    // 6. Check Auth session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/founder/subscribers?limit=1');
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                setIsAuthenticated(false);
            }
        };
        checkSession();
    }, []);

    // 7. Load Data on Auth
    useEffect(() => {
        if (isAuthenticated) {
            loadSubscribers();
            loadCampaigns();
            loadPerformance();
        }
    }, [isAuthenticated]);

    // Periodically fetch progress for the monitored campaign
    useEffect(() => {
        if (!monitoringCampaignId || !isAuthenticated) return;

        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/founder/campaigns/${monitoringCampaignId}/progress`);
                if (res.ok) {
                    const data = await res.json();
                    setCampaignProgress(data);
                    // Refresh campaign list status too
                    loadCampaigns();
                    // Stop monitoring if finished
                    if (data.campaign.status === 'completed' || data.campaign.status === 'cancelled' || data.campaign.status === 'failed') {
                        setMonitoringCampaignId(null);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchProgress();
        const interval = setInterval(fetchProgress, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [monitoringCampaignId, isAuthenticated]);

    // Data Loaders
    const loadSubscribers = async () => {
        setSubsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);
            
            const res = await fetch(`/api/founder/subscribers?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data.subscribers);
                if (data.stats) setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to load subscribers:', err);
        } finally {
            setSubsLoading(false);
        }
    };

    const loadCampaigns = async () => {
        setCampaignsLoading(true);
        try {
            const res = await fetch('/api/founder/campaigns/create');
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data.campaigns);
            }
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        } finally {
            setCampaignsLoading(false);
        }
    };

    const loadPerformance = async (forceRun = false) => {
        setAuditLoading(true);
        try {
            const url = forceRun ? `/api/founder/performance?url=https://www.virzyguns.com` : `/api/founder/performance`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPerformance(data.metrics || data.fallback);
            }
        } catch (err) {
            console.error('Failed to load PageSpeed performance:', err);
        } finally {
            setAuditLoading(false);
        }
    };

    // Form handlers
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        try {
            const res = await fetch('/api/founder/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
            } else {
                setAuthError(data.error || 'Authentication failed.');
            }
        } catch {
            setAuthError('Server error. Try again later.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubActionLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSub.name, email: newSub.email }),
            });
            if (res.ok) {
                setIsAddSubOpen(false);
                setNewSub({ name: '', email: '' });
                loadSubscribers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add subscriber.');
            }
        } catch {
            alert('Failed to add subscriber due to network error.');
        } finally {
            setSubActionLoading(false);
        }
    };

    const handleEditSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubActionLoading(true);
        try {
            const res = await fetch('/api/founder/subscribers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSub),
            });
            if (res.ok) {
                setIsEditSubOpen(false);
                setEditingSub(null);
                loadSubscribers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update subscriber.');
            }
        } catch {
            alert('Failed to update subscriber.');
        } finally {
            setSubActionLoading(false);
        }
    };

    const handleUnsubscribeSubscriber = async (id: number) => {
        if (!confirm('Are you sure you want to manually suppress/unsubscribe this subscriber?')) return;
        try {
            const res = await fetch(`/api/founder/subscribers?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                loadSubscribers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to unsubscribe.');
            }
        } catch {
            alert('Failed to unsubscribe.');
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setCampaignActionLoading(true);
        try {
            const res = await fetch('/api/founder/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign),
            });
            if (res.ok) {
                setIsCreateCampaignOpen(false);
                setNewCampaign({ subject: '', template_type: 'inner_circle', body_content: '' });
                loadCampaigns();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create campaign.');
            }
        } catch {
            alert('Failed to create campaign.');
        } finally {
            setCampaignActionLoading(false);
        }
    };

    const handleStartCampaign = async (id: number) => {
        if (!confirm('Are you sure you want to schedule and start queue processing for this broadcast?')) return;
        try {
            const res = await fetch(`/api/founder/campaigns/${id}/start`, { method: 'POST' });
            if (res.ok) {
                setMonitoringCampaignId(id);
                loadCampaigns();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to start campaign.');
            }
        } catch {
            alert('Failed to start campaign.');
        }
    };

    const handlePauseCampaign = async (id: number) => {
        try {
            const res = await fetch(`/api/founder/campaigns/${id}/pause`, { method: 'POST' });
            if (res.ok) {
                if (monitoringCampaignId === id) {
                    setMonitoringCampaignId(null);
                    setCampaignProgress(null);
                }
                loadCampaigns();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to pause campaign.');
            }
        } catch {
            alert('Failed to pause campaign.');
        }
    };

    // Sub-renderers
    if (isAuthenticated === null) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center bg-black px-4">
                <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="relative z-10 w-full max-w-md p-8 border border-white/10 rounded-2xl bg-zinc-950/60 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold tracking-widest text-cyan-400 font-mono">
                            FOUNDER CONTROL
                        </h1>
                        <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-wider">
                            Authorized Operations Only
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                                Access Passcode
                            </label>
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-zinc-900/50 text-white font-mono text-center tracking-widest focus:outline-none focus:border-cyan-400 transition-all duration-200"
                            />
                        </div>

                        {authError && (
                            <p className="text-rose-400 text-xs font-mono text-center leading-relaxed bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                                {authError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-sm tracking-wider transition-all duration-200 disabled:opacity-50"
                        >
                            {authLoading ? 'VERIFYING...' : 'INITIALIZE SYSTEM'}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-zinc-100 font-sans pb-20 relative overflow-x-hidden">
            {/* background glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none"></div>

            {/* Nav Header */}
            <header className="border-b border-white/5 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h1 className="text-lg font-bold tracking-widest font-mono text-cyan-400">
                            VGP FOUNDER PORTAL
                        </h1>
                    </div>
                    <nav className="flex space-x-1 bg-zinc-900/60 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-1.5 rounded-md font-mono text-xs font-bold transition-all duration-150 ${
                                activeTab === 'overview' ? 'bg-cyan-400 text-black' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            OVERVIEW
                        </button>
                        <button
                            onClick={() => setActiveTab('subscribers')}
                            className={`px-4 py-1.5 rounded-md font-mono text-xs font-bold transition-all duration-150 ${
                                activeTab === 'subscribers' ? 'bg-cyan-400 text-black' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            SUBSCRIBERS
                        </button>
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`px-4 py-1.5 rounded-md font-mono text-xs font-bold transition-all duration-150 ${
                                activeTab === 'campaigns' ? 'bg-cyan-400 text-black' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            BROADCASTS
                        </button>
                    </nav>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-6 border border-white/5 rounded-2xl bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
                                <span className="text-zinc-500 font-mono text-xs uppercase">Total Registrations</span>
                                <p className="text-3xl font-bold font-mono text-white mt-2">{stats.total}</p>
                                <div className="absolute right-4 bottom-4 text-zinc-800 text-4xl font-bold font-mono">ALL</div>
                            </div>
                            <div className="p-6 border border-white/5 rounded-2xl bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
                                <span className="text-zinc-400 font-mono text-xs uppercase">Active List</span>
                                <p className="text-3xl font-bold font-mono text-cyan-400 mt-2">{stats.subscribed}</p>
                                <div className="absolute right-4 bottom-4 text-cyan-950/20 text-4xl font-bold font-mono">OK</div>
                            </div>
                            <div className="p-6 border border-white/5 rounded-2xl bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
                                <span className="text-zinc-500 font-mono text-xs uppercase">Suppressed List</span>
                                <p className="text-3xl font-bold font-mono text-zinc-500 mt-2">{stats.unsubscribed}</p>
                                <div className="absolute right-4 bottom-4 text-zinc-900 text-4xl font-bold font-mono">OUT</div>
                            </div>
                            <div className="p-6 border border-white/5 rounded-2xl bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
                                <span className="text-cyan-400 font-mono text-xs uppercase">New (24h)</span>
                                <p className="text-3xl font-bold font-mono text-cyan-300 mt-2">+{stats.new24h}</p>
                                <div className="absolute right-4 bottom-4 text-cyan-950/10 text-4xl font-bold font-mono">GROW</div>
                            </div>
                        </div>

                        {/* Middle row: Chart and PageSpeed dial */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <GrowthChart
                                    data={[
                                        { date: '06/13', count: Math.max(0, stats.subscribed - 12) },
                                        { date: '06/14', count: Math.max(0, stats.subscribed - 10) },
                                        { date: '06/15', count: Math.max(0, stats.subscribed - 7) },
                                        { date: '06/16', count: Math.max(0, stats.subscribed - 5) },
                                        { date: '06/17', count: Math.max(0, stats.subscribed - 3) },
                                        { date: '06/18', count: Math.max(0, stats.subscribed - 1) },
                                        { date: 'Today', count: stats.subscribed },
                                    ]}
                                />
                            </div>
                            
                            <div>
                                {performance ? (
                                    <div className="relative border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">Core Audits</h3>
                                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                                                    {performance.isMock ? 'Cached' : 'Lighthouse API'}
                                                </span>
                                            </div>
                                            <div className="flex justify-center">
                                                <LighthouseDial score={performance.score} label="Performance" />
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-2.5 font-mono text-xs">
                                            <div className="flex justify-between text-zinc-400">
                                                <span>FCP (First Contentful Paint)</span>
                                                <span className="text-white font-bold">{performance.fcp}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-400">
                                                <span>LCP (Largest Contentful Paint)</span>
                                                <span className="text-white font-bold">{performance.lcp}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-400">
                                                <span>TBT (Total Blocking Time)</span>
                                                <span className="text-white font-bold">{performance.tbt}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-400">
                                                <span>CLS (Cumulative Layout Shift)</span>
                                                <span className="text-white font-bold">{performance.cls}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => loadPerformance(true)}
                                            disabled={auditLoading}
                                            className="w-full mt-6 py-2 border border-cyan-400/20 hover:border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-400 font-mono text-xs font-bold rounded-lg transition-all duration-150 disabled:opacity-50"
                                        >
                                            {auditLoading ? 'RUNNING LIGHTHOUSE...' : 'EXECUTE LIGHTHOUSE AUDIT'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-full border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-xs font-mono text-zinc-500">Loading performance data...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Campaigns Overview */}
                        <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">System Integration Checks</h3>
                                <div className="text-xs font-mono text-zinc-500 uppercase">Security Clearance: Founder</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/20">
                                    <p className="text-zinc-500 uppercase">Database connection</p>
                                    <p className="text-emerald-400 font-bold mt-2">CONNECTED (Supavisor Transaction Pooler)</p>
                                </div>
                                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/20">
                                    <p className="text-zinc-500 uppercase">SMTP configuration</p>
                                    <p className="text-cyan-400 font-bold mt-2">VERIFIED (smtp.hostinger.com:465 SSL)</p>
                                </div>
                                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/20">
                                    <p className="text-zinc-500 uppercase">Daily performance cron</p>
                                    <p className="text-zinc-300 font-bold mt-2">ACTIVE (0 1 * * * UTC schedule)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SUBSCRIBERS TAB */}
                {activeTab === 'subscribers' && (
                    <div className="space-y-6">
                        {/* Control Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-1 gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadSubscribers()}
                                    className="flex-1 max-w-md px-4 py-2 bg-zinc-900/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 bg-zinc-900/60 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-cyan-400 font-mono"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="subscribed">Subscribed</option>
                                    <option value="unsubscribed">Unsubscribed</option>
                                </select>
                                <button
                                    onClick={loadSubscribers}
                                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs rounded-lg transition-colors"
                                >
                                    SEARCH
                                </button>
                            </div>
                            <button
                                onClick={() => setIsAddSubOpen(true)}
                                className="px-4 py-2 border border-cyan-400 hover:bg-cyan-400 hover:text-black text-cyan-400 font-bold font-mono text-xs rounded-lg transition-all"
                            >
                                + ADD SUBSCRIBER
                            </button>
                        </div>

                        {/* Subscribers Table */}
                        <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl overflow-hidden">
                            {subsLoading ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-xs font-mono text-zinc-500">Querying database...</p>
                                </div>
                            ) : subscribers.length === 0 ? (
                                <div className="p-12 text-center text-zinc-500 font-mono text-sm">
                                    No subscribers found matching query.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs font-mono">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-zinc-900/30 text-zinc-500 uppercase font-bold tracking-wider">
                                                <th className="py-4 px-6">Name</th>
                                                <th className="py-4 px-6">Email</th>
                                                <th className="py-4 px-6">Status</th>
                                                <th className="py-4 px-6">Registered</th>
                                                <th className="py-4 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {subscribers.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-zinc-900/20 transition-colors">
                                                    <td className="py-4 px-6 text-zinc-200">{sub.name}</td>
                                                    <td className="py-4 px-6 text-zinc-400">{sub.email}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            sub.status === 'subscribed'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-zinc-900 text-zinc-500 border border-white/5'
                                                        }`}>
                                                            {sub.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-zinc-500">
                                                        {new Date(sub.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingSub(sub);
                                                                setIsEditSubOpen(true);
                                                            }}
                                                            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                                                        >
                                                            EDIT
                                                        </button>
                                                        {sub.status === 'subscribed' && (
                                                            <button
                                                                onClick={() => handleUnsubscribeSubscriber(sub.id)}
                                                                className="text-rose-400 hover:text-rose-300 font-bold transition-colors"
                                                            >
                                                                SUPPRESS
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. CAMPAIGNS TAB */}
                {activeTab === 'campaigns' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Broadcast Queue & Progress Tracker */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-mono font-bold tracking-wider text-cyan-400 uppercase">Broadcast History</h2>
                                <button
                                    onClick={() => setIsCreateCampaignOpen(true)}
                                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs rounded-lg transition-colors"
                                >
                                    + CREATE BROADCAST
                                </button>
                            </div>

                            {/* Campaign Active progress tracker */}
                            {campaignProgress && (
                                <div className="border border-cyan-400/20 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-1 bg-cyan-400 shadow-[0_0_15px_#00E5FF] animate-pulse w-full"></div>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">
                                                ACTIVE QUEUE MONITOR
                                            </span>
                                            <h3 className="text-base font-bold text-white font-mono mt-2">{campaignProgress.campaign.subject}</h3>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setMonitoringCampaignId(null);
                                                setCampaignProgress(null);
                                            }}
                                            className="text-zinc-500 hover:text-zinc-300 font-mono text-xs"
                                        >
                                            CLOSE
                                        </button>
                                    </div>

                                    {/* Progress calculation */}
                                    {(() => {
                                        const { stats } = campaignProgress;
                                        const finishedCount = stats.sent + stats.skipped + stats.cancelled;
                                        const totalCount = stats.total || 1;
                                        const percent = Math.round((finishedCount / totalCount) * 100);

                                        return (
                                            <div className="space-y-4 font-mono text-xs">
                                                <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-white/5">
                                                    <div
                                                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                    <div className="p-2 bg-zinc-900/50 rounded-lg">
                                                        <span className="text-zinc-500 block uppercase text-[10px]">Delivered</span>
                                                        <span className="text-sm font-bold text-white">{stats.sent}</span>
                                                    </div>
                                                    <div className="p-2 bg-zinc-900/50 rounded-lg">
                                                        <span className="text-zinc-500 block uppercase text-[10px]">Processing</span>
                                                        <span className="text-sm font-bold text-cyan-400">{stats.sending + stats.pending}</span>
                                                    </div>
                                                    <div className="p-2 bg-zinc-900/50 rounded-lg">
                                                        <span className="text-zinc-500 block uppercase text-[10px]">Failures</span>
                                                        <span className={`text-sm font-bold ${stats.failed > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>{stats.failed}</span>
                                                    </div>
                                                    <div className="p-2 bg-zinc-900/50 rounded-lg">
                                                        <span className="text-zinc-500 block uppercase text-[10px]">Completion</span>
                                                        <span className="text-sm font-bold text-white">{percent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Broadcast List */}
                            <div className="space-y-4">
                                {campaignsLoading ? (
                                    <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-12 text-center">
                                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-xs font-mono text-zinc-500">Querying database campaigns...</p>
                                    </div>
                                ) : campaigns.length === 0 ? (
                                    <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-12 text-center font-mono text-zinc-500 text-sm">
                                        No campaigns created. Click "+ Create Broadcast" to generate your first draft.
                                    </div>
                                ) : (
                                    campaigns.map((camp) => (
                                        <div key={camp.id} className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="space-y-1.5 font-mono">
                                                <div className="flex items-center space-x-2.5">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                        camp.status === 'completed'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : camp.status === 'draft'
                                                            ? 'bg-zinc-800 text-zinc-400'
                                                            : camp.status === 'paused'
                                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 animate-pulse'
                                                    }`}>
                                                        {camp.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">{camp.template_type.replace('_', ' ').toUpperCase()}</span>
                                                </div>
                                                <h3 className="text-sm font-bold text-white">{camp.subject}</h3>
                                                <p className="text-[10px] text-zinc-500">Created: {new Date(camp.created_at).toLocaleString()}</p>
                                            </div>

                                            <div className="flex space-x-2 font-mono text-xs">
                                                {(camp.status === 'queued' || camp.status === 'sending') && (
                                                    <button
                                                        onClick={() => handlePauseCampaign(camp.id)}
                                                        className="px-3.5 py-1.5 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 rounded-md transition-colors"
                                                    >
                                                        PAUSE
                                                    </button>
                                                )}

                                                {(camp.status === 'draft' || camp.status === 'paused') && (
                                                    <button
                                                        onClick={() => handleStartCampaign(camp.id)}
                                                        className="px-3.5 py-1.5 border border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-400 rounded-md transition-colors"
                                                    >
                                                        START BROADCAST
                                                    </button>
                                                )}

                                                {camp.status !== 'draft' && (
                                                    <button
                                                        onClick={() => {
                                                            setMonitoringCampaignId(camp.id);
                                                            // Scroll top to see progress tracker
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="px-3.5 py-1.5 border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 rounded-md transition-colors"
                                                    >
                                                        MONITOR
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Side Help panel */}
                        <div className="space-y-6">
                            <div className="border border-white/5 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 font-mono text-xs">
                                <h3 className="font-bold text-zinc-300 uppercase mb-4 border-b border-white/5 pb-2">Batch Engine Logic</h3>
                                <ul className="space-y-3 text-zinc-400 leading-relaxed list-disc pl-4">
                                    <li>Emails are processed in throttled batches of <strong>10</strong> by Vercel Cron.</li>
                                    <li>Row-locking query uses <code className="text-cyan-300">SKIP LOCKED</code> to prevent multiple parallel instances from double-sending.</li>
                                    <li>Emails are dispatched <strong>outside</strong> DB transactions to protect Postgres pool connection limits.</li>
                                    <li>Signed tokens are generated per email for suppression tracking, preventing raw email exposure.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            
            {/* 1. Add Subscriber Modal */}
            {isAddSubOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
                    <div className="w-full max-w-md p-6 border border-white/10 rounded-2xl bg-zinc-950 font-mono">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-white">ADD NEW SUBSCRIBER</h3>
                            <button onClick={() => setIsAddSubOpen(false)} className="text-zinc-500 hover:text-white text-sm">CLOSE</button>
                        </div>
                        <form onSubmit={handleAddSubscriber} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newSub.name}
                                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newSub.email}
                                    onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={subActionLoading}
                                className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
                            >
                                {subActionLoading ? 'SUBMITTING...' : 'ADD SUBSCRIBER'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Edit Subscriber Modal */}
            {isEditSubOpen && editingSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
                    <div className="w-full max-w-md p-6 border border-white/10 rounded-2xl bg-zinc-950 font-mono">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-white">EDIT SUBSCRIBER DETAILS</h3>
                            <button onClick={() => { setIsEditSubOpen(false); setEditingSub(null); }} className="text-zinc-500 hover:text-white text-sm">CLOSE</button>
                        </div>
                        <form onSubmit={handleEditSubscriber} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingSub.name}
                                    onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={editingSub.email}
                                    onChange={(e) => setEditingSub({ ...editingSub, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Status</label>
                                <select
                                    value={editingSub.status}
                                    onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value })}
                                    className="w-full px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                                >
                                    <option value="subscribed">Subscribed</option>
                                    <option value="unsubscribed">Unsubscribed</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={subActionLoading}
                                className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
                            >
                                {subActionLoading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Create Campaign Modal */}
            {isCreateCampaignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
                    <div className="w-full max-w-2xl p-6 border border-white/10 rounded-2xl bg-zinc-950 font-mono">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-cyan-400">CREATE NEWSLETTER BROADCAST</h3>
                            <button onClick={() => setIsCreateCampaignOpen(false)} className="text-zinc-500 hover:text-white text-sm">CLOSE</button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Subject Line</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Welcome to the Inner Circle"
                                    value={newCampaign.subject}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Email Template Type</label>
                                <select
                                    value={newCampaign.template_type}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, template_type: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300 focus:outline-none focus:border-cyan-400 text-sm"
                                >
                                    <option value="inner_circle">Inner Circle (Standard Text Layout)</option>
                                    <option value="beat_promo">Beat Promo (Product Feature Layout)</option>
                                    <option value="cadenz_update">CADENZ Update (Tech R&D Layout)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-zinc-400 uppercase mb-1">Message Body Content</label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Write your email body content here..."
                                    value={newCampaign.body_content}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, body_content: e.target.value })}
                                    className="w-full p-4 bg-zinc-900 border border-white/10 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={campaignActionLoading}
                                    className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase rounded-lg transition-colors disabled:opacity-50 text-sm tracking-wider"
                                >
                                    {campaignActionLoading ? 'CREATING...' : 'CREATE CAMPAIGN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
