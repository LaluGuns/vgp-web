"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { usePathname } from "next/navigation";
import { isSupportedSeoLocale, type SeoRouteLocale } from "@/lib/marketing/seo-registry";

// Header language dropdown — needs setLocale (router navigation), so it stays
// a client island while the rest of the header renders on the server.
export function LandingLanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const routeSegment = pathname.split("/")[1];
  const selectedLocale = isSupportedSeoLocale(routeSegment) ? routeSegment : locale;

  return (
    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl px-2 py-1.5 transition-all">
      <Globe className="h-3 w-3 text-white/40" />
      <select
        value={selectedLocale}
        onChange={(e) => setLocale(e.target.value as SeoRouteLocale)}
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
        <option value="en-US" className="bg-[#0b1326] text-white">EN-US</option>
        <option value="en-GB" className="bg-[#0b1326] text-white">EN-GB</option>
        <option value="ja-JP" className="bg-[#0b1326] text-white">JA-JP</option>
        <option value="de-DE" className="bg-[#0b1326] text-white">DE-DE</option>
        <option value="es-MX" className="bg-[#0b1326] text-white">ES-MX</option>
        <option value="es-ES" className="bg-[#0b1326] text-white">ES-ES</option>
        <option value="pt-BR" className="bg-[#0b1326] text-white">PT-BR</option>
        <option value="ko-KR" className="bg-[#0b1326] text-white">KO-KR</option>
      </select>
    </div>
  );
}
