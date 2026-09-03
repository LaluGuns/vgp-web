import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { App as CapacitorApp } from "@capacitor/app";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "../../app/globals.css";
import "./mobile-shell.css";

import FlowstatePage from "@/app/[lang]/app/page";
import PricingPage from "@/app/[lang]/pricing/page";
import InsightsPage from "@/app/[lang]/(app)/insights/page";
import { DeleteAccountPanel } from "@/components/account/delete-account-panel";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ProductProviders } from "@/components/layout/product-providers";
import { LocaleProvider } from "@/hooks/use-translation";
import type { Locale } from "@/lib/translations/dictionaries";
import { installPlayBillingRuntime } from "./billing";
import { installMobileRuntime } from "./runtime";
import { MobileLoginPage } from "./mobile-login";
import { NativeTimerRuntime } from "./native-timer-runtime";

const ROUTE_EVENT = "flow-mobile-route";
const BASE_LOCALES = new Set(["en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "it"]);
type MobileRoute = "app" | "login" | "pricing" | "insights" | "delete-account";

function preferredLocale(): Locale {
  try {
    const stored = localStorage.getItem("flowstate-locale");
    const base = stored?.split("-")[0].toLowerCase();
    if (base && BASE_LOCALES.has(base)) return base as Locale;
  } catch {}
  const browser = navigator.language.split("-")[0].toLowerCase();
  return (BASE_LOCALES.has(browser) ? browser : "en") as Locale;
}

function routeFromHash(hash: string): MobileRoute {
  const route = hash.replace(/^#\//, "").split("?")[0].toLowerCase();
  return route === "login" || route === "pricing" || route === "insights" || route === "delete-account" ? route : "app";
}

function ProductRoute({ route }: { route: Exclude<MobileRoute, "login" | "delete-account"> }) {
  return (
    <ProductProviders>
      <NativeTimerRuntime />
      {route === "pricing" ? <PricingPage /> : route === "insights" ? <InsightsPage /> : <FlowstatePage />}
    </ProductProviders>
  );
}

function MobileRoot() {
  const [revision, setRevision] = useState(0);
  const locale = useMemo(() => preferredLocale(), [revision]);
  const route = routeFromHash(window.location.hash || "#/app");

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener("hashchange", refresh);
    window.addEventListener("popstate", refresh);
    window.addEventListener(ROUTE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("popstate", refresh);
      window.removeEventListener(ROUTE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-flow-route", route);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [route]);

  return (
    <LocaleProvider initialLocale={locale}>
      <AnalyticsProvider />
      <div className={`flow-mobile-route flow-mobile-route-${route}`} data-flow-route={route}>
        {route === "login"
          ? <MobileLoginPage />
          : route === "delete-account"
            ? <DeleteAccountPanel />
            : <ProductRoute route={route} />}
      </div>
    </LocaleProvider>
  );
}

installMobileRuntime();
installPlayBillingRuntime();

CapacitorApp.addListener("backButton", () => {
  const route = routeFromHash(window.location.hash || "#/app");
  if (route !== "app") {
    history.replaceState(null, "", "#/app");
    window.dispatchEvent(new Event(ROUTE_EVENT));
    return;
  }
  CapacitorApp.minimizeApp();
}).catch(() => {});

const root = document.getElementById("root");
if (!root) throw new Error("Flow mobile root element is missing");
createRoot(root).render(
  <React.StrictMode>
    <MobileRoot />
  </React.StrictMode>,
);
