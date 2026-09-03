"use client";

import { useEffect } from "react";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function CookiesPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.cookies.title", "Cookie & Local Storage Policy")} - Flow`;
  }, [t]);

  return (
    <LegalShell title="Cookie & Local Storage Policy" updated="September 3, 2026" active="Cookies">
      <p>
        Flow uses a small amount of first-party browser or device storage to authenticate users, remember product settings, and measure anonymous product usage. We do not use advertising or cross-site tracking cookies.
      </p>

      <h2>1. Authentication storage</h2>
      <p>
        On the web, Supabase authentication may use first-party cookies or browser storage to maintain your signed-in session. In the mobile app, equivalent authentication state is stored locally on the device. Removing this storage signs you out and may remove locally remembered settings.
      </p>

      <h2>2. Product preferences</h2>
      <p>
        Flow uses local storage for preferences and product state such as interface theme, mixer/timer settings, acquisition-session context, and other settings that make the product work consistently between launches.
      </p>

      <h2>3. Anonymous product analytics</h2>
      <p>
        When PostHog analytics are enabled, Flow uses first-party local storage for an anonymous analytics identity. Flow does not send your Flow account UUID, email address, or name to PostHog. Autocapture and session recording are disabled, and Do Not Track is respected. The analytics are used to understand product usage and improve Flow, not for third-party advertising.
      </p>

      <h2>4. Checkout providers</h2>
      <p>
        A web checkout handled by Lemon Squeezy may use its own essential security or payment cookies under its policies. Android checkout is handled by Google Play outside Flow&apos;s web cookie system.
      </p>

      <h2>5. Your controls</h2>
      <p>
        You can clear browser/app storage or use browser privacy controls. Blocking essential authentication storage can prevent sign-in or personalized features from working. If your browser sends Do Not Track, Flow&apos;s PostHog configuration respects it.
      </p>

      <h2>6. Contact</h2>
      <p>Questions about storage or analytics can be sent to <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a>.</p>
    </LegalShell>
  );
}
