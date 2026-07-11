"use client";

import { useEffect } from "react";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function CookiesPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.cookies.title", "Cookie Policy")} - Flowstate`;
  }, [t]);

  return (
    <LegalShell 
      title={t("legal.cookies.title", "Cookie Policy")} 
      updated={t("legal.cookies.updated", "July 6, 2026")} 
      active="Cookies"
    >
      <p>
        {t("legal.cookies.intro")}
      </p>

      <h2>{t("legal.cookies.sec1_title")}</h2>
      <p>
        {t("legal.cookies.sec1_text")}
      </p>

      <h2>{t("legal.cookies.sec2_title")}</h2>
      <p>
        {t("legal.cookies.sec2_text").split("\n")[0]}
      </p>
      <ul>
        <li>
          <strong>{t("legal.cookies.sec2_text").split("\n")[1].split(":")[0]}</strong>:
          {t("legal.cookies.sec2_text").split("\n")[1].split(":")[1]}
        </li>
        <li>
          <strong>{t("legal.cookies.sec2_text").split("\n")[2].split(":")[0]}</strong>:
          {t("legal.cookies.sec2_text").split("\n")[2].split(":")[1]}
        </li>
      </ul>

      <h2>{t("legal.cookies.sec3_title")}</h2>
      <p>
        {t("legal.cookies.sec3_text")}
      </p>

      <h2>{t("legal.cookies.sec4_title")}</h2>
      <p>
        {t("legal.cookies.sec4_text")}
      </p>

      <h2>{t("legal.cookies.sec5_title")}</h2>
      <p>
        {t("legal.cookies.sec5_text")}
      </p>
    </LegalShell>
  );
}
