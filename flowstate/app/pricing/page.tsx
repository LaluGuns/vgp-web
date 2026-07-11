"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { BILLING, type BillingInterval } from "@/lib/pricing";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { track } from "@/lib/analytics";

export default function PricingPage() {
  const { t, locale, setLocale } = useTranslation();
  
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("pricing.fixed.title", "Choose a plan")} | Flowstate`;
    }
  }, [t]);

  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    const code = promoInput.trim().toUpperCase();
    if (code === "FLOWBRO") {
      setIsPromoApplied(true);
      setPromoError("");
    } else {
      setIsPromoApplied(false);
      if (code.length > 0 && code.length >= 7) {
        setPromoError(t("pricing.invalidPromo", "Invalid promo code"));
      } else {
        setPromoError("");
      }
    }
  }, [promoInput, t]);

  const perks = [
    t("pricing.perks.sounds", "Extra ambient sounds — fire & rain, river, waterfall, city, vinyl"),
    t("pricing.perks.scenes", "Every visual scene and theme"),
    t("pricing.perks.music", "New original music added every month"),
    t("pricing.perks.support", "Directly support an independent producer"),
  ];

  async function handleCheckout() {
    setError("");
    setLoading(true);
    try {
      let amountUsdCents = interval === "yearly" ? 5999 : 999;
      if (isPromoApplied) {
        amountUsdCents = interval === "yearly" ? 2999 : 499;
      }

      track("checkout_started", { interval, promo: isPromoApplied });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interval,
          amountUsdCents,
          discountCode: isPromoApplied ? "FLOWBRO" : undefined
        }),
      });
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch {
        setError(t("pricing.error.generic", "Something went wrong. Please try again."));
        return;
      }

      if (!res.ok) {
        if (res.status === 429) {
          setError(t("pricing.error.rateLimit", "Too many checkout attempts. Please try again in a minute."));
        } else if (res.status === 503) {
          setError(data.message || "Payments are not configured yet.");
        } else {
          setError(data.message || data.error || t("pricing.error.failed", "Checkout failed. Please try again soon."));
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(t("pricing.error.unavailable", "Checkout isn't available yet — try again soon."));
    } catch {
      setError(t("pricing.error.generic", "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <WebGLBackground />
      <main className="min-h-screen overflow-y-auto flex items-start md:items-center justify-center p-4 py-10">
        <div className="w-full max-w-lg space-y-5">
          <Link href="/app" className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t("dashboard.backToFlowstate", "Back to Flowstate")}
          </Link>

          <div className="glass-card p-7 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3 animate-pulse" /> {t("pricing.fixed.tagline", "Flowstate Pro")}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{t("pricing.fixed.title", "Choose a plan")}</h1>
              <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto leading-relaxed">
                {t("pricing.fixed.description", "Full access to every ambient sound and visual scene, plus new original music added each month.")}
              </p>
            </div>

            {/* Billing interval */}
            <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-black/30 border border-white/5 w-fit mx-auto">
              {(Object.keys(BILLING) as BillingInterval[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setInterval(k)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    interval === k
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground/70 hover:text-white"
                  )}
                >
                  {k === "monthly" ? t("pricing.monthly", "Monthly") : t("pricing.yearly", "Yearly")}
                  {k === "yearly" && <span className="ml-1 text-[9px] text-primary/70">{t("pricing.bestValue", "best value")}</span>}
                </button>
              ))}
            </div>

            {/* Amount display */}
            <div className="text-center space-y-1.5">
              {isPromoApplied ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl line-through text-white/30 tabular-nums">
                      {interval === "yearly" ? "$59.99" : "$9.99"}
                    </span>
                    <span className="text-4xl font-extrabold text-emerald-400 tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse">
                      {interval === "yearly" ? "$29.99" : "$4.99"}
                    </span>
                    <span className="text-base font-normal text-muted-foreground/60">
                      {BILLING[interval].suffix}
                    </span>
                  </div>
                  <div className="inline-flex items-center justify-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Promo code FLOWBRO applied — 50% off
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-white tabular-nums">
                  {interval === "yearly" ? "$59.99" : "$9.99"}
                  <span className="text-base font-normal text-muted-foreground/60">
                    {BILLING[interval].suffix}
                  </span>
                </div>
              )}
              {interval === "yearly" && (
                <p className="text-[10px] text-primary/80 font-mono mt-1.5 uppercase tracking-wider">
                  {t("pricing.saveYearly", "Save 50% compared to monthly")}
                </p>
              )}
            </div>

            {/* CTA */}
            <Button className="w-full h-12 text-sm" onClick={handleCheckout} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-apple-loader" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t("pricing.button", "Continue")} · {
                isPromoApplied 
                  ? (interval === "yearly" ? "$29.99/yr" : "$4.99/mo")
                  : (interval === "yearly" ? "$59.99/yr" : "$9.99/mo")
              }
            </Button>
            {error && <p className="text-xs text-rose-400/80 text-center">{error}</p>}

            {/* Promo Code Input */}
            <div className="pt-3 pb-1 border-t border-white/5 space-y-2">
              <label htmlFor="promo-input" className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">
                {t("pricing.promoCode", "Have a Promo Code?")}
              </label>
              <div className="flex gap-2">
                <input
                  id="promo-input"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={t("pricing.promoPlaceholder", "Enter code (e.g. FLOWBRO)")}
                  className="flex-1 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none transition-all duration-300"
                />
              </div>
              {promoError && (
                <p className="text-[9px] font-mono text-rose-400/80">{promoError}</p>
              )}
            </div>

            {/* Perks */}
            <div className="pt-2 space-y-2 border-t border-white/5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 pt-3">
                {t("pricing.supportUnlocks", "Your support gets you")}
              </p>
              {perks.map((p) => (
                <div key={p} className="flex items-start gap-2.5 text-xs text-muted-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
              {t("pricing.secure", "Secure checkout via Lemon Squeezy (Merchant of Record) — taxes handled, cancel anytime. Prices shown in {currency}; charged in your local currency at checkout.").replace("{currency}", "USD")}
            </p>

            {/* Language Selector Dropdown */}
            <div className="flex justify-center max-w-[180px] mx-auto py-1">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl px-2 py-1 text-[9px] font-mono text-white/50 hover:text-white/80 transition-all duration-300 focus:outline-none cursor-pointer text-center"
              >
                <option value="en" className="bg-[#0b1326] text-white">English</option>
                <option value="id" className="bg-[#0b1326] text-white">Bahasa Indonesia</option>
                <option value="es" className="bg-[#0b1326] text-white">Español</option>
                <option value="fr" className="bg-[#0b1326] text-white">Français</option>
                <option value="de" className="bg-[#0b1326] text-white">Deutsch</option>
                <option value="ja" className="bg-[#0b1326] text-white">日本語</option>
                <option value="ko" className="bg-[#0b1326] text-white">한국어</option>
                <option value="zh" className="bg-[#0b1326] text-white">简体中文</option>
                <option value="pt" className="bg-[#0b1326] text-white">Português</option>
                <option value="ru" className="bg-[#0b1326] text-white">Русский</option>
                <option value="it" className="bg-[#0b1326] text-white">Italiano</option>
              </select>
            </div>

            <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/40">
              <Link href="/legal/terms" className="hover:text-white transition-colors">{t("dashboard.terms", "Terms")}</Link>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <Link href="/legal/privacy" className="hover:text-white transition-colors">{t("dashboard.privacy", "Privacy")}</Link>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <Link href="/legal/refund" className="hover:text-white transition-colors">{t("dashboard.refunds", "Refunds")}</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
