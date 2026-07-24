"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { userDisplayName, userAvatarUrl } from "@/lib/user-profile";
import { useActiveLogoClass } from "@/components/workspace/use-active-logo-class";

// Left SideNav Sidebar (Stitch premium theme spec)
export function InsightsSidebar({ user }: { user: any }) {
  const { t, locale, setLocale } = useTranslation();
  const activeLogoClass = useActiveLogoClass();

  return (
    <nav className="relative hidden md:flex flex-col h-full w-64 backdrop-blur-[45px] border-t border-l border-white/15 border-r border-b border-white/5 bg-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[32px] py-8 shrink-0 z-20 overflow-hidden">
      {/* Top specular reflection strip */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="px-6 mb-10 select-none">
        <Image
          src="/icons/flowstate-logo.png"
          alt="Flow"
          width={150}
          height={53}
          className={cn(
            "h-9 w-auto object-contain theme-logo transition-all duration-500",
            activeLogoClass
          )}
          priority
        />
        <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-2.5 ml-0.5">{t("dashboard.deepWorkActive", "Deep Work Active")}</p>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 px-3">
        <Link
          href="/app"
          className="group px-4 py-3 flex items-center gap-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] text-white/50 hover:text-white/90 transition-all duration-300 font-mono text-[11px] font-semibold uppercase tracking-wider hover:translate-x-1 active:scale-[0.98]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors duration-300" />
          <span>{t("dashboard.focus", "Focus")}</span>
        </Link>
        <Link
          href="/insights"
          className="relative px-4 py-3 flex items-center gap-3 rounded-2xl bg-white/[0.07] border border-white/20 border-t-white/40 border-l-primary/60 shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-wider text-primary drop-shadow-[0_0_10px_rgba(0,229,255,0.25)] transition-all duration-300 scale-[1.02]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          <span>{t("dashboard.insights", "Insights")}</span>
        </Link>

        {/* Language Selector Dropdown */}
        <div className="px-4 py-1">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl px-2 py-1 text-[9px] font-mono text-white/50 hover:text-white/80 transition-all duration-300 focus:outline-none cursor-pointer"
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

      <div className="mt-auto flex flex-col gap-1.5 px-3 pt-6 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/40 shrink-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[11px] font-bold text-white">
              {userAvatarUrl(user) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatarUrl(user)!} alt={userDisplayName(user)} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                (userDisplayName(user) || "?").charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white/90 truncate leading-tight">{userDisplayName(user)}</p>
              <p className="text-[9px] font-mono text-white/35 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
