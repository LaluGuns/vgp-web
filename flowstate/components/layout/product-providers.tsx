"use client";

import { AudioDriver } from "@/components/audio/audio-driver";
import { GuestGate } from "@/components/auth/guest-gate";
import { UpgradePrompt } from "@/components/pricing/upgrade-prompt";
import { ThemeProvider } from "@/components/theme/theme-provider";

/** Keeps audio and entitlement runtime code out of static marketing routes. */
export function ProductProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AudioDriver />
      <UpgradePrompt />
      <GuestGate />
      <ThemeProvider />
      {children}
    </>
  );
}
