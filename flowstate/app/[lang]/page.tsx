// Server component: all SEO-critical copy (hero, features, pricing, footer)
// renders as static HTML per locale. Interactive pieces are client islands in
// components/landing/ (background, hero demo, soundtrack previewer, language
// selector, side effects).
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Clock,
  Music,
  Sliders,
  CheckSquare,
  ArrowRight,
  ArrowUpRight,
  Rocket,
  BarChart3,
} from "lucide-react";

import { getTranslator, resolveLocale } from "@/lib/translations/server";
import { LandingBackground } from "@/components/landing/landing-background";
import { HeroMachinesIsland } from "@/components/landing/hero-machines-island";
import { SoundtrackShowcase } from "@/components/landing/soundtrack-showcase";
import { LandingLanguageSelector } from "@/components/landing/language-selector";
import { LandingEffects } from "@/components/landing/landing-effects";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const t = getTranslator(locale);

  // JSON-LD Structured Data for Search Engine Optimization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Flow by Virzy Guns",
    "alternateName": ["Flow", "Flowstate"],
    "url": "https://flow.virzyguns.com",
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
      {/* Client-only side effects (pause in-app music, localized doc title) */}
      <LandingEffects />

      {/* WebGL Animated Cosmic Space Background (always the cosmic scene here).
          Client island: static gradient placeholder until the browser is idle. */}
      <LandingBackground />

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
            <img src="/icons/flowstate-logo.png" alt="Flow by Virzy Guns logo" className="h-8 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-mono text-muted-foreground/80 hover:text-white transition-colors uppercase tracking-wider">
              {t("legal.landing.nav_features", "Features")}
            </a>
            <a href="#soundtracks" className="text-xs font-mono text-muted-foreground/80 hover:text-white transition-colors uppercase tracking-wider">
              {t("legal.landing.nav_soundtracks", "Soundtracks")}
            </a>
            <Link href="/pricing" className="text-xs font-mono text-muted-foreground/80 hover:text-white transition-colors uppercase tracking-wider">
              {t("legal.landing.nav_pricing", "Pricing")}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Selector Dropdown */}
            <LandingLanguageSelector />

            <Link
              href="/app"
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00e5ff] border border-[#00e5ff]/30 hover:border-[#00e5ff] bg-[#00e5ff]/5 hover:bg-[#00e5ff]/10 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {t("legal.landing.cta_start", "Start Focusing (Free)")}
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* Hero Left Content */}
          <div className="md:col-span-5 space-y-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-[#8b5cf6] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" /> {t("legal.landing.focus_environment", "Focus environment")}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white tracking-tight leading-[0.95]">
              {t("legal.landing.hero_title", "Music for focus. Built for deep work.")}
            </h1>

            <p className="text-sm md:text-lg text-white/80 leading-relaxed max-w-xl">
              {t("legal.landing.hero_subtitle", "A focus timer with music actually made for it. Every track is produced in-house, with an ambient mixer to cover whatever's happening around you.")}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/app"
                className="px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center gap-2 group"
              >
                {t("legal.landing.cta_start", "Start focusing")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest text-white/80 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center gap-1.5"
              >
                {t("legal.landing.cta_explore", "See Pro")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Trust Indicators (Honest and Factual) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono text-white/50 pt-4 border-t border-white/[0.06] max-w-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                {t("legal.landing.trust_free", "Free tier available")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                {t("legal.landing.trust_no_ads", "No ads")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                {t("legal.landing.trust_browser", "Runs in your browser")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                {t("legal.landing.trust_no_registration", "No registration required")}
              </span>
            </div>
          </div>

          {/* Hero Right — a live, working machine (the product sells itself).
              Client-only demo; the SEO-critical copy lives in the left column. */}
          <div className="md:col-span-7 relative w-full">
            <HeroMachinesIsland />
          </div>

        </main>

        {/* Feature Bento Grid Section */}
        <section id="features" className="w-full max-w-7xl mx-auto px-8 py-12 md:py-16 border-t border-white/[0.04] bg-transparent">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-mono text-[#00e5ff] uppercase tracking-[0.3em]">
                <span className="w-6 h-px bg-[#00e5ff]/50" /> {t("legal.landing.setup_label", "The setup")}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.05]">
                {t("legal.landing.setup_title", "Everything the block needs. Nothing it doesn't.")}
              </h2>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs md:text-right">
              {t("legal.landing.setup_subtitle", "A timer, music made for focus, a way to cover the room, and honest numbers after.")}
            </p>
          </div>

          {/* Spec-plate grid: uniform modules, one accent, no fake screenshots. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.05]">
            {[
              { code: "01 / TIMER", Icon: Clock, title: t("legal.landing.feat_timer_title", "Focus timer"), desc: t("legal.landing.feat_timer_desc", "Work in blocks."), spec: t("legal.landing.spec_timer", "Pomodoro · Deep Work · custom") },
              { code: "02 / TASKS", Icon: CheckSquare, title: t("legal.landing.feat_task_title", "Task planning"), desc: t("legal.landing.feat_task_desc", "Plan and check off your session tasks."), spec: t("legal.landing.spec_tasks", "Per-session checklist") },
              { code: "03 / SOUND", Icon: Music, title: t("legal.landing.feat_music_title", "Original soundtracks"), desc: t("legal.landing.feat_music_desc", "Original music made for focus."), spec: t("legal.landing.spec_music", "80+ tracks · new ones monthly"), accent: true },
              { code: "04 / AMBIENT", Icon: Sliders, title: t("legal.landing.feat_mixer_title", "Ambient mixer"), desc: t("legal.landing.feat_mixer_desc", "Blend ambient sounds under the music."), spec: t("legal.landing.spec_ambient", "12 layers · independent volumes") },
              { code: "05 / STATS", Icon: BarChart3, title: t("legal.landing.feat_analytics_title", "Honest analytics"), desc: t("legal.landing.feat_analytics_desc", "Streaks, a heatmap, and personal records. Measured minutes only."), spec: t("legal.landing.spec_stats", "Real data, never padded") },
              { code: "→", Icon: null, title: t("legal.landing.feat_demo_title", "See it running"), desc: t("legal.landing.feat_demo_desc", "Open the app, press play, and hear the difference."), spec: t("legal.landing.spec_demo", "Open Flow"), cta: true },
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
                      {f.accent && <span className="text-[8px] font-mono text-[#00e5ff] border border-[#00e5ff]/30 rounded px-1 py-px tracking-normal normal-case">{t("legal.landing.moat_label", "The difference")}</span>}
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
        <section id="soundtracks" className="w-full max-w-7xl mx-auto px-8 py-12 md:py-16 border-t border-white/[0.04] bg-transparent">
          <SoundtrackShowcase />
        </section>

        {/* Honest Pricing CTA Banner */}
        <section className="w-full max-w-7xl mx-auto px-8 py-12 md:py-16 border-t border-t-white/[0.04] bg-transparent">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                {t("legal.landing.pricing_cta", "Start focusing")}
              </h2>
              <p className="text-xs md:text-sm text-white/60 max-w-md mx-auto">
                {t("legal.landing.pricing_trial", "No credit card required to try. Cancel anytime.")}
              </p>
            </div>

            {/* Side by side simple pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
              {/* Free Tier */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full">
                <div className="space-y-4 mb-4 flex-1">
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
                </div>
                <Link
                  href="/app"
                  className="block w-full text-center py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-white/5 border border-white/15 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {t("legal.landing.cta_start", "Start focusing")}
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/25 text-[8px] font-mono font-bold uppercase tracking-wider text-[#00e5ff]">
                  Pro
                </div>
                <div className="space-y-4 mb-4 flex-1">
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
                    <div className="flex items-baseline gap-1.5 text-xs font-mono">
                      <span className="font-medium text-white/35 line-through">$99</span>
                      <span className="font-semibold text-emerald-400">$59.99</span>
                      <span className="text-[10px] font-normal text-white/60">/ yr</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full text-center py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                >
                  {t("legal.landing.pricing_go_pro", "Go Pro")}
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
                {t("legal.landing.roadmap_copy", "Built for deep work. Designed to disappear. Works offline. Cross-platform. Always improving")}
              </p>
            </div>
            {/* There is no roadmap page — the honest CTA here is the app itself. */}
            <Link
              href="/app"
              className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              {t("legal.landing.pricing_cta", "Start focusing")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-8 py-8 border-t border-white/[0.04] bg-transparent flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-white/50">
              © {new Date().getFullYear()} Flow by Virzy Guns. {t("legal.landing.footer_rights", "All rights reserved.")}
            </div>
            <div className="text-[9px] font-mono text-white/20">
              {t("legal.landing.footer_operator", "Operated by Virzy Guns Production.")}
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
