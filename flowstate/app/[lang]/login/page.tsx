"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function LoginPage() {
  const { t, locale, setLocale } = useTranslation();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("login.title", "FLOW")} | Flow`;
    }
  }, [t]);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [nextParam, setNextParam] = useState("/app");
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
        queueMicrotask(() => setNextParam(next));
      }
      const errorParam = searchParams.get("error");
      if (errorParam === "auth_failed") {
        queueMicrotask(() => {
          setStatus("error");
          setMessage(t("login.error.authFailed", "Authentication failed. Please try signing in again."));
        });
      }
    }
  }, []);

  async function signInWithGoogle() {
    if (!configured) return;
    const supabase = createClient();
    const nextSuffix = nextParam !== "/app" ? `?next=${encodeURIComponent(nextParam)}` : "";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback${nextSuffix}` },
    });
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || !email) return;
    setStatus("sending");
    const supabase = createClient();
    const nextSuffix = nextParam !== "/app" ? `?next=${encodeURIComponent(nextParam)}` : "";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback${nextSuffix}` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setMessage(t("login.status.sent", "Check your inbox for a magic link."));
    }
  }

  return (
    <>
      <WebGLBackground />
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5">
          <Link href={nextParam} className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t("dashboard.backToFlowstate", "Back to Flow")}
          </Link>
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <div className="text-primary font-mono text-2xl font-bold tracking-tighter glow-text-primary">
                {t("login.title", "FLOW")}
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {t("login.tagline", "Get in the zone")}
              </p>
            </div>

            {!configured && (
              <p className="text-[11px] text-amber-400/80 text-center bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
                {t("login.error.unconfigured", "Auth not configured yet — set Supabase env vars to enable sign in.")}
              </p>
            )}

            <Button
              variant="glass"
              className="w-full h-11"
              onClick={signInWithGoogle}
              disabled={!configured}
            >
              <GoogleIcon />
              {t("login.google", "Continue with Google")}
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("login.or", "or")}</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <form onSubmit={signInWithEmail} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.placeholder", "you@email.com")}
                disabled={!configured}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                className="w-full h-11"
                disabled={!configured || status === "sending"}
              >
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-apple-loader" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {t("login.magicLink", "Send magic link")}
              </Button>
            </form>

            {message && (
              <p
                className={`text-xs text-center ${
                  status === "error" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {message}
              </p>
            )}

            <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
              {t("login.agree", "By continuing you agree to our")}{" "}
              <Link href="/legal/terms" className="text-primary/70 hover:text-primary transition-colors">{t("dashboard.terms", "Terms")}</Link>{" "}
              {t("login.and", "and")}{" "}
              <Link href="/legal/privacy" className="text-primary/70 hover:text-primary transition-colors">{t("dashboard.privacy", "Privacy Policy")}</Link>.
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
          </div>
        </div>
      </main>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
