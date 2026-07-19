"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Result = { valid: boolean; issuedAt: string; termsVersion: string; catalogVersion: string; eligibleGenres: string[] };

export function LicenseVerifier({ grantId }: { grantId: string }) {
  const [state, setState] = useState<"loading" | "valid" | "invalid">("loading");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/license/verify/${encodeURIComponent(grantId)}`, { cache: "no-store" })
      .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => null) }))
      .then(({ ok, body }) => {
        if (!active || !ok || !body || typeof body.valid !== "boolean") { setState("invalid"); return; }
        setResult(body as Result);
        setState(body.valid ? "valid" : "invalid");
      })
      .catch(() => { if (active) setState("invalid"); });
    return () => { active = false; };
  }, [grantId]);

  if (state === "loading") return <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">Checking this creator license…</p>;
  if (state === "invalid" || !result) return <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-rose-100"><XCircle className="mb-3 h-6 w-6" /><h2 className="font-bold">This grant is not valid</h2><p className="mt-1 text-sm text-rose-100/75">It may be unknown, revoked, or unavailable. No personal information is shown here.</p></div>;
  return <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-50"><CheckCircle2 className="mb-3 h-6 w-6" /><h2 className="font-bold">Valid Flow Pro creator license</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-emerald-100/60">Issued</dt><dd>{new Date(result.issuedAt).toLocaleDateString()}</dd></div><div><dt className="text-emerald-100/60">Eligible catalog</dt><dd>{result.eligibleGenres.join(", ")}</dd></div><div><dt className="text-emerald-100/60">Terms</dt><dd className="font-mono text-xs">{result.termsVersion}</dd></div><div><dt className="text-emerald-100/60">Catalog</dt><dd className="font-mono text-xs">{result.catalogVersion}</dd></div></dl></div>;
}
