"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/hooks/use-translation";
import { identifyUser } from "@/lib/analytics";

function isNativeFlow(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as typeof window & { __FLOW_MOBILE__?: boolean }).__FLOW_MOBILE__);
}

export function DeleteAccountPanel() {
  const { user, loading, configured } = useUser();
  const { locale } = useTranslation();
  const expected = useMemo(() => user?.email || "DELETE", [user?.email]);
  const [confirmation, setConfirmation] = useState("");
  const [acknowledgeSubscriptions, setAcknowledgeSubscriptions] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  async function deleteAccount() {
    if (!user || deleting || confirmation.trim().toLowerCase() !== expected.trim().toLowerCase() || !acknowledgeSubscriptions) return;
    setDeleting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again before deleting your account.");

      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation, acknowledgeSubscriptions: true }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; deleted?: boolean };
      if (!response.ok || payload.deleted !== true) {
        if (payload.error === "confirmation_mismatch") throw new Error("The confirmation does not match your account email.");
        if (payload.error === "rate_limited") throw new Error("Too many deletion attempts. Try again later.");
        throw new Error("We could not delete the account. Try again or contact founder@virzyguns.com.");
      }

      identifyUser(null);
      try { await supabase.auth.signOut({ scope: "local" }); } catch {}
      setDeleted(true);

      window.setTimeout(() => {
        if (isNativeFlow()) {
          history.replaceState(null, "", "#/login");
          window.dispatchEvent(new Event("flow-mobile-route"));
        } else {
          window.location.assign(`/${locale}`);
        }
      }, 1800);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account deletion failed.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07040d] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/app" className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Flow
        </Link>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/10 text-rose-300">
            <Trash2 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Delete your Flow account</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            This permanently removes your Flow account and account-linked product data, including your profile, tasks, focus history, stats, presets, entitlement records, and billing-account binding.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50/80">
            <div className="mb-1 flex items-center gap-2 font-semibold text-amber-200">
              <AlertTriangle className="h-4 w-4" /> Subscriptions are separate
            </div>
            Deleting Flow does not automatically cancel a Google Play or web subscription. Cancel it with the store/payment provider first if you do not want future charges.
            <a
              href="https://play.google.com/store/account/subscriptions"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-fit items-center gap-1.5 text-amber-200 underline decoration-amber-200/35 underline-offset-4 hover:decoration-amber-200"
            >
              Google Play subscriptions <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-5 text-white/50">
            Limited de-identified transaction, refund-review, or issued-license records may be retained where required for accounting, fraud prevention, legal obligations, or license defense. They are no longer linked to an active Flow account.
          </div>

          {!configured ? (
            <p className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">Account services are unavailable right now.</p>
          ) : loading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Loading your account…</div>
          ) : !user ? (
            <div className="mt-8">
              <p className="text-sm text-white/60">Sign in to the Flow account you want to delete. You can complete deletion from this web page without reinstalling the app.</p>
              <Link href={`/login?next=/${locale}/delete-account`} className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90">
                Sign in to continue
              </Link>
            </div>
          ) : deleted ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
              Your Flow account has been deleted. Redirecting…
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="delete-confirmation" className="block text-sm font-medium text-white/85">
                  Type <span className="font-mono text-rose-300">{expected}</span> to confirm
                </label>
                <input
                  id="delete-confirmation"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 h-12 w-full rounded-xl border border-white/12 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-rose-300/50 focus:ring-2 focus:ring-rose-400/10"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-5 text-white/65">
                <input
                  type="checkbox"
                  checked={acknowledgeSubscriptions}
                  onChange={(event) => setAcknowledgeSubscriptions(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-400"
                />
                <span>I understand that deleting my Flow account does not cancel an external Google Play or web subscription.</span>
              </label>

              {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p>}

              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting || confirmation.trim().toLowerCase() !== expected.trim().toLowerCase() || !acknowledgeSubscriptions}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Deleting account…" : "Permanently delete account"}
              </button>
            </div>
          )}

          <p className="mt-8 text-xs leading-5 text-white/35">
            Need help? Email <a href="mailto:founder@virzyguns.com" className="text-white/55 underline underline-offset-4">founder@virzyguns.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
