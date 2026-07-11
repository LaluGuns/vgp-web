"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "./use-user";
import { useAppStore } from "@/lib/stores/app-store";

/**
 * Reads the user's subscription and syncs premium status into the app store.
 * Falls back to free when not signed in or Supabase isn't configured.
 */
export function useEntitlement() {
  const { user, loading, configured } = useUser();
  const setPremium = useAppStore((s) => s.setPremium);

  useEffect(() => {
    // Pre-launch promo: everything unlocked for everyone. Flip by removing
    // NEXT_PUBLIC_PREMIUM_PROMO from the env when checkout goes live (LAUNCH.md).
    if (process.env.NEXT_PUBLIC_PREMIUM_PROMO === "1") {
      setPremium(true, user?.id ?? null);
      return;
    }

    // Wait for the auth session to load before making decisions about premium status
    if (loading) {
      return;
    }

    if (!configured || !user) {
      setPremium(false, null);
      return;
    }

    const supabase = createClient();
    let active = true;
    const userId = user.id;
    const cachedUserId = useAppStore.getState().premiumUserId;

    // Immediately reset premium state if the cached userId doesn't match the current user
    if (cachedUserId !== userId) {
      setPremium(false, userId);
    }

    async function checkEntitlement() {
      try {
        const { data, error } = await supabase
          .from("flowstate_profiles")
          .select("plan")
          .eq("id", userId)
          .single();

        if (active) {
          if (!error && data) {
            setPremium(data.plan !== "free", userId);
          } else if (error) {
            // Keep cached status if offline and matches the user to prevent instant lockout
            if (typeof navigator !== "undefined" && !navigator.onLine) {
              if (cachedUserId !== userId) {
                setPremium(false, userId);
              }
              return;
            }
            setPremium(false, userId);
          }
        }
      } catch {
        if (active) {
          // Keep cached status if offline and matches the user to prevent instant lockout
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            if (cachedUserId !== userId) {
              setPremium(false, userId);
            }
            return;
          }
          setPremium(false, userId);
        }
      }
    }

    checkEntitlement();

    return () => {
      active = false;
    };
  }, [user, loading, configured, setPremium]);
}

