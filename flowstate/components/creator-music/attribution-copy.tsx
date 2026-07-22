"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { track } from "@/lib/analytics";
import { CREATOR_ATTRIBUTION, creatorUiCopy } from "@/lib/creator-music/content";

export function AttributionCopy({ locale }: { locale: string }) {
  const [copied, setCopied] = useState(false);
  const regional = creatorUiCopy(locale);
  async function copy() {
    try {
      await navigator.clipboard.writeText(CREATOR_ATTRIBUTION);
      setCopied(true);
      track("license_attribution_copied", { locale });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }
  return <div className="flex flex-col gap-3 rounded-2xl border border-[#00e5ff]/25 bg-[#00e5ff]/[0.04] p-4 md:flex-row md:items-center md:justify-between">
    <code className="break-words text-xs leading-relaxed text-cyan-100">{CREATOR_ATTRIBUTION}</code>
    <button type="button" onClick={copy} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00e5ff]/30 px-3 py-2 text-xs font-semibold text-[#00e5ff] hover:bg-[#00e5ff]/10">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? (regional?.copied ?? "Copied") : (regional?.copyAttribution ?? "Copy attribution")}
    </button>
  </div>;
}
