"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { HeroMachines } from "@/components/landing/hero-machines";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Music, 
  Sliders, 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Compass,
  ArrowUpRight,
  Play,
  Pause,
  Rocket,
  BarChart3,
  Check
} from "lucide-react";

import { usePlayerStore } from "@/lib/stores/player-store";

const FEATURED_TRACKS = [
  {
    id: "city-pop/city-pop-001",
    title: "Neon Drive",
    genre: "City Pop",
    url: "/tracks/city-pop/city-pop-001.mp3",
    duration: "2:15"
  },
  {
    id: "cyberpunk-jazz/cyberpunk-jazz-001",
    title: "Neon Alley",
    genre: "Cyberpunk Jazz",
    url: "/tracks/cyberpunk-jazz/cyberpunk-jazz-001.mp3",
    duration: "3:29"
  },
  {
    id: "city-pop/city-pop-018",
    title: "Velvet Cassette",
    genre: "Lofi Chill",
    url: "/tracks/city-pop/city-pop-018.mp3",
    duration: "1:58"
  }
];

export default function LandingPage() {
  const { t, locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      document.title = "Flowstate - Deep Work Music & Focus Timer";
    }
    
    // Pause any playing music tracks when visiting the landing page
    const playerStore = usePlayerStore.getState();
    if (playerStore.isPlaying) {
      playerStore.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayPreview = (trackId: string, url: string) => {
    if (activeTrackId === trackId) {
      if (isPlayingPreview) {
        audioRef.current?.pause();
        setIsPlayingPreview(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlayingPreview(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveTrackId(trackId);
      setIsPlayingPreview(true);
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.onended = () => {
        setIsPlayingPreview(false);
        setActiveTrackId(null);
      };
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
  };

  if (!mounted) return null;

  // JSON-LD Structured Data for Search Engine Optimization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Flowstate",
    "operatingSystem": "All",
    "applicationCategory": "ProductivityApplication",
    "description": "A focus timer with music actually made for it. Every track is produced in-house by Virzy Guns Production — no stock loops.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "9.99",
      "highPrice": "59.99",
      "offerCount": "2"
    }
  };

  return (
    // The landing is brand territory — pin it to the glass identity so it never
    // inherits whatever in-app interface theme the visitor last picked.
    <div data-theme="glass" className="contents">
      {/* WebGL Animated Cosmic Space Background (always the cosmic scene here) */}
      <WebGLBackground forceScene />

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient depth glows over the cosmic scene */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[5%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px]" />
        <div className="absolute top-[60%] left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
      </div>

      <div className="min-h-screen relative z-10 flex flex-col justify-between text-foreground bg-grid-pattern">
        
        {/* Navigation Header */}
        <header className="w-full max-w-7xl mx-auto px-8 h-20 flex items-center justify-between border-b border-white/[0.04] bg-transparent">
          <div className="flex items-center gap-2 select-none shrink-0">
            <img src="/icons/flowstate-logo.png" alt="Flowstate Logo" className="h-8 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-mono text-muted-foreground/80 hover:text-white transition-colors uppercase tracking-wider">
              Features
            </a>
            <a href="#soundtracks" className="text-xs font-mono text-muted-foreground/80 hover:text-white transition-colors uppercase tracking-wider">
              Soundtracks
            </a>
            <Link href="/pricing" className="text-xs font-mono text-muted-foreground/80 hover:text-white transition-colors uppercase tracking-wider">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl px-2 py-1.5 transition-all">
              <Globe className="h-3 w-3 text-white/40" />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="bg-transparent border-none text-[10px] font-mono text-white/60 hover:text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-[#0b1326] text-white">EN</option>
                <option value="id" className="bg-[#0b1326] text-white">ID</option>
                <option value="es" className="bg-[#0b1326] text-white">ES</option>
                <option value="fr" className="bg-[#0b1326] text-white">FR</option>
                <option value="de" className="bg-[#0b1326] text-white">DE</option>
                <option value="ja" className="bg-[#0b1326] text-white">JA</option>
                <option value="ko" className="bg-[#0b1326] text-white">KO</option>
                <option value="zh" className="bg-[#0b1326] text-white">ZH</option>
                <option value="pt" className="bg-[#0b1326] text-white">PT</option>
                <option value="ru" className="bg-[#0b1326] text-white">RU</option>
                <option value="it" className="bg-[#0b1326] text-white">IT</option>
              </select>
            </div>

            <Link
              href="/app"
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00e5ff] border border-[#00e5ff]/30 hover:border-[#00e5ff] bg-[#00e5ff]/5 hover:bg-[#00e5ff]/10 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              Start Focusing (Free)
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-20 md:py-36 grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Hero Left Content */}
          <div className="md:col-span-5 space-y-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-[#8b5cf6] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" /> Focus Environment
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white tracking-tight leading-[0.95]">
              Music for focus.<br/>
              <span className="text-[#00e5ff]">Built for deep work.</span>
            </h1>
            
            <p className="text-sm md:text-lg text-white/80 leading-relaxed max-w-xl">
              A focus timer with music actually made for it. Every track is produced in-house — no stock loops — plus an ambient mixer to cover whatever's happening around you.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/app"
                className="px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center gap-2 group"
              >
                Start focusing
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest text-white/80 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center gap-1.5"
              >
                Pricing & Features
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Trust Indicators (Honest and Factual) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono text-white/50 pt-4 border-t border-white/[0.06] max-w-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                Free tier available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                No ads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                Runs in your browser
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                No registration required
              </span>
            </div>
          </div>

          {/* Hero Right — a live, working machine (the product sells itself) */}
          <div className="md:col-span-7 relative w-full">
            <HeroMachines />
          </div>

        </main>

        {/* Feature Bento Grid Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-8 py-16 md:py-24 border-t border-white/[0.04] bg-transparent">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-mono text-[#00e5ff] uppercase tracking-[0.3em]">
                <span className="w-6 h-px bg-[#00e5ff]/50" /> The setup
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.05]">
                Everything the block needs.<br className="hidden md:block" /> Nothing it doesn&apos;t.
              </h2>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs md:text-right">
              A timer, music made for focus, a way to cover the room, and honest numbers after. That&apos;s the whole thing.
            </p>
          </div>

          {/* Spec-plate grid: uniform modules, one accent, no fake screenshots. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.05]">
            {[
              { code: "01 / TIMER", Icon: Clock, title: t("legal.landing.feat_timer_title", "Focus timer"), desc: "Work in blocks. Set your own focus and break lengths to match how your attention actually runs.", spec: "Pomodoro · Deep Work · custom" },
              { code: "02 / TASKS", Icon: CheckSquare, title: t("legal.landing.feat_task_title", "Task planning"), desc: "Line up what the block is for and check it off as you go — right beside the clock, not in another tab.", spec: "Per-session checklist" },
              { code: "03 / SOUND", Icon: Music, title: t("legal.landing.feat_music_title", "Original soundtracks"), desc: "Lofi and synthwave, produced in-house by Virzy Guns. Written for focus, not licensed from a stock library.", spec: "80+ tracks · new ones monthly", accent: true },
              { code: "04 / AMBIENT", Icon: Sliders, title: t("legal.landing.feat_mixer_title", "Ambient mixer"), desc: "Blend rain, café, and campfire under the music to cover whatever the room is doing around you.", spec: "12 layers · independent volumes" },
              { code: "05 / STATS", Icon: BarChart3, title: "Honest analytics", desc: "Streaks, a heatmap of when you actually focus, personal records. Measured minutes only — nothing inflated.", spec: "Real data, never padded" },
              { code: "→", Icon: null, title: "See it running", desc: "The hero up top is the real app on a demo clock. Open it, press play, hear the difference.", spec: "Open Flowstate", cta: true },
            ].map((f) => {
              const Icon = f.Icon;
              const inner = (
                <div className={cn(
                  "h-full p-6 md:p-7 flex flex-col gap-4 bg-[#080a15] transition-colors duration-300 relative group",
                  f.cta ? "hover:bg-[#00e5ff]/[0.04]" : "hover:bg-white/[0.015]"
                )}>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "p-2.5 rounded-xl border",
                      f.accent
                        ? "bg-[#00e5ff]/10 border-[#00e5ff]/25 text-[#00e5ff]"
                        : f.cta
                          ? "bg-[#00e5ff]/10 border-[#00e5ff]/25 text-[#00e5ff]"
                          : "bg-white/[0.03] border-white/[0.07] text-white/70 group-hover:text-[#00e5ff] transition-colors"
                    )}>
                      {Icon ? <Icon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                    </span>
                    <span className="text-[9px] font-mono text-white/25 tracking-[0.25em] uppercase">{f.code}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[13px] font-bold text-white uppercase tracking-[0.12em] font-mono flex items-center gap-2">
                      {f.title}
                      {f.accent && <span className="text-[8px] font-mono text-[#00e5ff] border border-[#00e5ff]/30 rounded px-1 py-px tracking-normal normal-case">the moat</span>}
                    </h3>
                    <p className="text-xs text-white/55 leading-relaxed mt-2.5">{f.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/35">
                    <span className="tracking-wide">{f.spec}</span>
                    <ArrowRight className="h-3 w-3 text-[#00e5ff] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              );
              return f.cta || f.accent ? (
                <Link key={f.code} href="/app" className="block">{inner}</Link>
              ) : (
                <div key={f.code}>{inner}</div>
              );
            })}
          </div>
        </section>

        {/* Music Production Highlight Section */}
        <section id="soundtracks" className="w-full max-w-7xl mx-auto px-8 py-16 md:py-24 border-t border-white/[0.04] bg-transparent">
          <div className="glass-card p-8 md:p-12 rounded-[32px] border border-white/5 max-w-5xl mx-auto relative overflow-hidden bg-white/[0.01]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Visual Album / Vinyl Disk Cover */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 opacity-40" />
                
                {/* Vinyl Record Visual */}
                <div className="w-48 h-48 rounded-full bg-black border-4 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative flex items-center justify-center overflow-hidden mb-6 z-10">
                  {/* Vinyl grooves */}
                  <div className="absolute inset-2 rounded-full border border-white/[0.03] pointer-events-none" />
                  <div className="absolute inset-6 rounded-full border border-white/[0.03] pointer-events-none" />
                  <div className="absolute inset-10 rounded-full border border-white/[0.03] pointer-events-none" />
                  <div className="absolute inset-14 rounded-full border border-white/[0.03] pointer-events-none" />
                  
                  {/* Center Sticker */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,229,255,0.4)] ${isPlayingPreview ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                    <img src="/icons/flowstate-logo.png" alt="Logo" className="w-8 h-8 object-contain opacity-80" />
                    <div className="absolute w-3.5 h-3.5 rounded-full bg-[#0b1326] border border-white/10" />
                  </div>
                </div>

                {/* Metadata & Wave visualizer */}
                <div className="text-center z-10 w-full">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                    <Compass className="h-3 w-3" /> ORIGINAL SOUNDTRACKS
                  </span>
                  
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {activeTrackId ? FEATURED_TRACKS.find(t => t.id === activeTrackId)?.title : "Soundtracks by Virzy Guns"}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                    {activeTrackId ? FEATURED_TRACKS.find(t => t.id === activeTrackId)?.genre : "Virzy Guns Production"}
                  </p>

                  {/* Equalizer Visualizer (animated only when playing) */}
                  <div className="flex items-end justify-center gap-1 h-8 mt-5">
                    {[...Array(12)].map((_, i) => (
                      <span 
                        key={i} 
                        className="w-1 bg-[#00e5ff] rounded-full transition-all duration-300"
                        style={{
                          height: isPlayingPreview ? `${Math.floor(Math.random() * 80) + 20}%` : '15%',
                          animation: isPlayingPreview ? `bounce-bar ${0.4 + (i * 0.05)}s ease-in-out infinite alternate` : 'none',
                          transformOrigin: 'bottom'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Playlist & Info */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {t("legal.landing.producer_title", "Soundtracks by Virzy Guns Production")}
                  </h2>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {t("legal.landing.producer_desc", "Every track in Flowstate is produced by one person — Virzy Guns. Not licensed, not pulled from a stock library. Written for focus, and only here.")}
                  </p>
                </div>

                <div className="space-y-2">
                  {FEATURED_TRACKS.map((track) => {
                    const isActive = activeTrackId === track.id;
                    const isPlaying = isActive && isPlayingPreview;
                    
                    return (
                      <div 
                        key={track.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                          isActive 
                            ? "bg-white/[0.06] border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.3)]" 
                            : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePlayPreview(track.id, track.url)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isActive 
                                ? "bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]" 
                                : "bg-white/5 hover:bg-white/10 text-white"
                            }`}
                          >
                            {isPlaying ? (
                              <Pause className="h-3.5 w-3.5 fill-current" />
                            ) : (
                              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          
                          <div>
                            <p className={`text-xs font-bold transition-colors ${isActive ? "text-[#00e5ff]" : "text-white"}`}>
                              {track.title}
                            </p>
                            <p className="text-[9px] font-mono text-white/40 mt-0.5">
                              {track.genre}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/40">{track.duration}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Honest Pricing CTA Banner */}
        <section className="w-full max-w-7xl mx-auto px-8 py-12 md:py-20 border-t border-t-white/[0.04] bg-transparent">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                {t("legal.landing.pricing_cta", "Start focusing")}
              </h2>
              <p className="text-xs md:text-sm text-white/60 max-w-md mx-auto">
                No credit card required to try. Cancel anytime.
              </p>
            </div>

            {/* Side by side simple pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
              {/* Free Tier */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {t("legal.landing.pricing_free_title", "Free Tier")}
                  </h3>
                  <p className="text-[10px] text-white/60">
                    {t("legal.landing.pricing_free_desc", "Essential focus tools")}
                  </p>
                </div>
                <div className="text-2xl font-extrabold text-white">
                  $0.00
                </div>
                <Link
                  href="/app"
                  className="block w-full text-center py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-white/5 border border-white/15 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  Start Focusing
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/25 text-[8px] font-mono font-bold uppercase tracking-wider text-[#00e5ff]">
                  Pro
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#00e5ff] font-mono uppercase tracking-wider">
                    {t("legal.landing.pricing_pro_title", "Pro Tier")}
                  </h3>
                  <p className="text-[10px] text-white/60">
                    {t("legal.landing.pricing_pro_desc", "The full focus library")}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl font-extrabold text-white">
                    $9.99<span className="text-xs font-normal text-white/60"> / mo</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-400 font-mono">
                    $59.99<span className="text-[10px] font-normal text-white/60"> / yr</span>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full text-center py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                >
                  Go Pro
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Roadmap Footer Banner */}
        <section id="roadmap" className="w-full max-w-7xl mx-auto px-8 py-6 border-t border-white/[0.04] bg-transparent">
          <div className="glass-card p-4 px-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Rocket className="h-4 w-4" />
              </span>
              <p className="text-xs text-white/60 leading-relaxed">
                <strong className="text-white">Built for deep work.</strong> Designed to disappear. • Works offline • Cross-platform • Always improving
              </p>
            </div>
            <Link 
              href="/app"
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              View Roadmap
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-8 py-8 border-t border-white/[0.04] bg-transparent flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-white/50">
              © {new Date().getFullYear()} Flowstate. All rights reserved.
            </div>
            <div className="text-[9px] font-mono text-white/20">
              Operated by Virzy Guns.
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-muted-foreground/50">
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              {t("dashboard.terms", "Terms")}
            </Link>
            <span>·</span>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              {t("dashboard.privacy", "Privacy")}
            </Link>
            <span>·</span>
            <Link href="/legal/refund" className="hover:text-white transition-colors">
              {t("dashboard.refunds", "Refunds")}
            </Link>
            <span>·</span>
            <Link href="/legal/cookies" className="hover:text-white transition-colors">
              {t("dashboard.cookies", "Cookies")}
            </Link>
          </div>
        </footer>

        <style dangerouslySetInnerHTML={{__html: `
          .bg-grid-pattern {
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
            background-size: 60px 60px;
          }
        `}} />

      </div>
    </div>
  );
}