"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// Header language dropdown — needs setLocale (router navigation), so it stays
// a client island while the rest of the header renders on the server.
export function LandingLanguageSelector() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl px-2 py-1.5 transition-all">
      <Globe className="h-3 w-3 text-white/40" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        className="bg-transparent border-none text-[10px] font-mono text-white/60 hover:text-white focus:outline-none cursor-pointer pr-1"
      >
        <option value="en" className="bg-[#0b1326] text-white">EN</option>
        <option value="id" className="bg-[#0b1326] text-white">ID</option>
        <option value="es" className="bg-[#0b1326] text-white">ES</option>
        <option value="fr" className="bg-[#0b1326] text-white">FR</option>
        <option value="de" className="bg-[#0b1326] text-white">DE</option>
        <option value="ja" className="bg-[#0b1326] text-white">JA</option>
        <option value="ko" className="bg-[#0b1326] text-white">KO</option>
        <option value="zh" className="bg-[#0b1326] text-white">ZH</option>
        <option value="pt" className="bg-[#0b1326] text-white">PT</option>
        <option value="ru" className="bg-[#0b1326] text-white">RU</option>
        <option value="it" className="bg-[#0b1326] text-white">IT</option>
      </select>
    </div>
  );
}
