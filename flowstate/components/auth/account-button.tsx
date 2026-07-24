"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useEntitlement } from "@/hooks/use-entitlement";
import { useAppStore } from "@/lib/stores/app-store";
import { userDisplayName, userAvatarUrl, userInitial } from "@/lib/user-profile";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, Sparkles, ChevronDown, BarChart2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useTranslation } from "@/hooks/use-translation";
import { track } from "@/lib/analytics";

export function AccountButton() {
  const { t } = useTranslation();
  const { user, configured } = useUser();
  useEntitlement(); // syncs premium status into the store
  const isPremium = useAppStore((s) => s.isPremium);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
    } catch {
      // If sign-out fails (e.g. network error), force a page reload to clear client state
      window.location.reload();
    }
  };

  if (!configured || !user) {
    return (
      <Link href={`/login?next=${pathname}`}>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-xs font-semibold px-4 border border-white/10 hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300"
        >
          <UserIcon className="h-3.5 w-3.5" />
          {t("dashboard.login.title", "Sign in")}
        </Button>
      </Link>
    );
  }

  const displayName = userDisplayName(user);
  const avatarUrl = userAvatarUrl(user);
  const initial = userInitial(user);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 active:scale-95 transition-all duration-300 group shadow-lg"
      >
        <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold flex items-center justify-center overflow-hidden uppercase shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || "User"}
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
            <span className="relative z-10">{initial}</span>
          )}
        </span>
        {isPremium ? (
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-primary flex items-center gap-0.5 transition-colors">
            <Sparkles className="h-2.5 w-2.5 animate-pulse" /> Pro
          </span>
        ) : (
          <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
            {t("dashboard.freePlan", "Free")}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 text-white/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-56 glass-card p-2 !rounded-2xl z-50 animate-in fade-in-0 zoom-in-95 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.15)]">
          <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
            <p className="text-xs font-semibold text-white truncate">
              {displayName || t("dashboard.signedIn", "Signed in")}
            </p>
            <p className="text-[10px] text-white/40 truncate">{user.email}</p>
          </div>

          <Link href="/insights" onClick={() => setOpen(false)}>
            <button className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/[0.08] flex items-center gap-2.5 transition-all duration-200">
              <BarChart2 className="h-3.5 w-3.5 text-white/50" /> {t("dashboard.insights", "Insights")}
            </button>
          </Link>

          {!isPremium && (
            <Link href="/pricing" onClick={() => { track("upgrade_clicked", { source: "account_menu" }); setOpen(false); }}>
              <button className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 flex items-center gap-2.5 transition-all duration-200 mt-1">
                <Sparkles className="h-3.5 w-3.5" /> {t("dashboard.upgradeToPro", "Upgrade to Pro")}
              </button>
            </Link>
          )}

          <form onSubmit={handleSignOut}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-white/50 hover:text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-all duration-200 border-t border-white/[0.08] mt-1 pt-2.5"
            >
              <LogOut className="h-3.5 w-3.5" /> {t("dashboard.signOut", "Sign out")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
