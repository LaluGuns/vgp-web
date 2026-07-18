"use client";

import { useEffect } from "react";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function RefundPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.refund.title", "Refund & Cancellation Policy")} - Flow`;
  }, [t]);

  const sec2Lines = t("legal.refund.sec2_text").split("\n");

  return (
    <LegalShell 
      title={t("legal.refund.title", "Refund & Cancellation Policy")} 
      updated={t("legal.refund.updated", "July 6, 2026")} 
      active="Refunds"
    >
      <p>
        {t("legal.refund.intro")}
      </p>

      <h2>{t("legal.refund.sec1_title")}</h2>
      <p>
        {t("legal.refund.sec1_text")}
      </p>

      <h2>{t("legal.refund.sec2_title")}</h2>
      <ul>
        {sec2Lines.map((line, idx) => {
          if (!line.trim()) return null;
          const cleanLine = line.replace(/^-\s*/, "");
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>

      <h2>{t("legal.refund.sec3_title")}</h2>
      <p>
        {t("legal.refund.sec3_text").split("founder@virzyguns.com")[0]}
        <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a>
        {t("legal.refund.sec3_text").split("founder@virzyguns.com")[1]}
      </p>

      <h2>{t("legal.refund.sec4_title")}</h2>
      <p>
        {t("legal.refund.sec4_text")}
      </p>

      <h2>{t("legal.refund.sec5_title")}</h2>
      <p>
        {t("legal.refund.sec5_text").split("founder@virzyguns.com")[0]}
        <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a>
        {t("legal.refund.sec5_text").split("founder@virzyguns.com")[1]}
      </p>
    </LegalShell>
  );
}
