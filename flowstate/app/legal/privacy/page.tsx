"use client";

import { useEffect } from "react";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function PrivacyPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.privacy.title", "Privacy Policy")} - Flowstate`;
  }, [t]);

  const sec1Lines = t("legal.privacy.sec1_text").split("\n");
  const sec3Lines = t("legal.privacy.sec3_text").split("\n");

  return (
    <LegalShell 
      title={t("legal.privacy.title", "Privacy Policy")} 
      updated={t("legal.privacy.updated", "July 6, 2026")} 
      active="Privacy"
    >
      <p>
        {t("legal.privacy.intro")}
      </p>

      <h2>{t("legal.privacy.sec1_title")}</h2>
      <ul>
        {sec1Lines.map((line, idx) => {
          if (!line.trim()) return null;
          // Strip leading bullet point character if present
          const cleanLine = line.replace(/^-\s*/, "");
          const colonIdx = cleanLine.indexOf(":");
          if (colonIdx !== -1) {
            const label = cleanLine.slice(0, colonIdx + 1);
            const val = cleanLine.slice(colonIdx + 1);
            return (
              <li key={idx}>
                <strong>{label}</strong>{val}
              </li>
            );
          }
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>

      <h2>{t("legal.privacy.sec2_title")}</h2>
      <p>
        {t("legal.privacy.sec2_text")}
      </p>

      <h2>{t("legal.privacy.sec3_title")}</h2>
      <ul>
        {sec3Lines.map((line, idx) => {
          if (!line.trim()) return null;
          // Strip leading bullet point character if present
          const cleanLine = line.replace(/^-\s*/, "");
          const colonIdx = cleanLine.indexOf(":");
          if (colonIdx !== -1) {
            const label = cleanLine.slice(0, colonIdx + 1);
            const val = cleanLine.slice(colonIdx + 1);
            
            // Check if there is an anchor tag or link text to render for Lemon Squeezy
            if (cleanLine.toLowerCase().includes("lemon squeezy")) {
              return (
                <li key={idx}>
                  <strong>{label}</strong>
                  {val.split("See")[0]}
                  See <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">Lemon Squeezy&rsquo;s privacy policy</a> for details.
                </li>
              );
            }
            
            return (
              <li key={idx}>
                <strong>{label}</strong>{val}
              </li>
            );
          }
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>

      <h2>{t("legal.privacy.sec4_title")}</h2>
      <p>
        {t("legal.privacy.sec4_text")}
      </p>

      <h2>{t("legal.privacy.sec5_title")}</h2>
      <p>
        {t("legal.privacy.sec5_text")}
      </p>

      <h2>{t("legal.privacy.sec6_title")}</h2>
      <p>
        {t("legal.privacy.sec6_text")}
      </p>

      <h2>{t("legal.privacy.sec7_title")}</h2>
      <p>
        {t("legal.privacy.sec7_text")}
      </p>

      <h2>{t("legal.privacy.sec8_title")}</h2>
      <p>
        {t("legal.privacy.sec8_text").split("contact")[0]}contact{" "}
        <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a>.
      </p>
    </LegalShell>
  );
}
