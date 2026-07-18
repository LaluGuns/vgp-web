"use client";

import { useEffect } from "react";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function TermsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.terms.title", "Terms of Service")} - Flow`;
  }, [t]);

  const sec3Lines = t("legal.terms.sec3_text").split("\n");
  const sec5Lines = t("legal.terms.sec5_text").split("\n");

  return (
    <LegalShell 
      title={t("legal.terms.title", "Terms of Service")} 
      updated={t("legal.terms.updated", "July 6, 2026")} 
      active="Terms"
    >
      <p>
        {t("legal.terms.intro")}
      </p>

      <h2>{t("legal.terms.sec1_title")}</h2>
      <p>
        {t("legal.terms.sec1_text")}
      </p>

      <h2>{t("legal.terms.sec2_title")}</h2>
      <p>
        {t("legal.terms.sec2_text")}
      </p>

      <h2>{t("legal.terms.sec3_title")}</h2>
      <ul>
        {sec3Lines.map((line, idx) => {
          if (!line.trim()) return null;
          const cleanLine = line.replace(/^-\s*/, "");
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>

      <h2>{t("legal.terms.sec4_title")}</h2>
      <p>
        {t("legal.terms.sec4_text")}
      </p>

      <h2>{t("legal.terms.sec5_title")}</h2>
      <ul>
        {sec5Lines.map((line, idx) => {
          if (!line.trim()) return null;
          const cleanLine = line.replace(/^-\s*/, "");
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>

      <h2>{t("legal.terms.sec6_title")}</h2>
      <p>
        {t("legal.terms.sec6_text")}
      </p>

      <h2>{t("legal.terms.sec7_title")}</h2>
      <p>
        {t("legal.terms.sec7_text")}
      </p>

      <h2>{t("legal.terms.sec8_title")}</h2>
      <p>
        {t("legal.terms.sec8_text")}
      </p>

      <h2>{t("legal.terms.sec9_title")}</h2>
      <p>
        {t("legal.terms.sec9_text")}
      </p>

      <h2>{t("legal.terms.sec10_title")}</h2>
      <p>
        {t("legal.terms.sec10_text")}
      </p>
    </LegalShell>
  );
}
