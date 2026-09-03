"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function PrivacyPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.privacy.title", "Privacy Policy")} - Flow`;
  }, [t]);

  return (
    <LegalShell title={t("legal.privacy.title", "Privacy Policy")} updated="September 3, 2026" active="Privacy">
      <p>
        This Privacy Policy explains what Flow collects, why it is used, which providers process data, and how to delete your account. Flow is operated by Virzy Guns. We do not sell personal data and Flow does not contain third-party advertising.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your email address and, when supplied by your sign-in provider, profile name and avatar metadata.</li>
        <li><strong>Focus data:</strong> tasks, timer/focus sessions, mixer presets, statistics, settings, and other product data you create so Flow can sync and show your history.</li>
        <li><strong>Subscription data:</strong> plan, entitlement state, renewal/expiry information, provider identifiers, and security-safe purchase/account bindings needed to verify paid access. Flow does not store your full card or bank-account details.</li>
        <li><strong>Technical and security data:</strong> standard request metadata, rate-limit/security records, and limited device/presence information such as operating system, browser/device category, and approximate country/city where available.</li>
        <li><strong>Product analytics:</strong> selected product events such as page views, focus-session actions, paywall actions, and checkout milestones. PostHog analytics are configured without account UUIDs, email addresses, names, autocapture, advertising tracking, or session recording.</li>
      </ul>

      <h2>2. How we use data</h2>
      <p>
        We use data to authenticate users, provide and sync Flow, verify subscriptions, stream content, show focus history, operate support and Creator Music licensing features, prevent abuse, diagnose product issues, and understand aggregate product usage. We do not sell personal data or use it for third-party advertising.
      </p>

      <h2>3. Service providers</h2>
      <ul>
        <li><strong>Supabase:</strong> authentication, database, and account data infrastructure.</li>
        <li><strong>Google Play:</strong> Android app distribution, subscription checkout, billing, purchase status, and store-side refund/cancellation processing for Google Play purchases.</li>
        <li><strong>Lemon Squeezy:</strong> Merchant of Record and payment processing for eligible web purchases.</li>
        <li><strong>PostHog:</strong> privacy-limited product analytics. Flow does not identify PostHog events with your Flow account UUID, email address, or name.</li>
        <li><strong>Content delivery infrastructure:</strong> used to deliver audio and app assets. Standard network metadata such as IP address may be processed when content is requested.</li>
      </ul>

      <h2>4. Cookies, local storage, and mobile storage</h2>
      <p>
        Flow uses authentication storage and local device/browser storage to keep you signed in and remember product settings. PostHog uses first-party local storage for anonymous product analytics when analytics are enabled and respects Do Not Track. We do not use advertising or cross-site tracking cookies. See the Cookie Policy for additional detail.
      </p>

      <h2>5. Account deletion and retention</h2>
      <p>
        You can permanently delete your Flow account from the <Link href="/delete-account">Delete account</Link> page in the app or on the web. Deletion removes the authentication account and account-linked Flow profile, tasks, focus sessions/history, statistics, presets, subscription records, and billing-account binding. Limited transaction and refund-review records may be de-identified and retained where reasonably necessary for accounting, fraud prevention, legal obligations, or dispute handling. Issued Creator Music license records may retain licensee details where necessary to preserve the validity of an already-issued license or defend legal rights; the Flow account link itself is removed.
      </p>

      <h2>6. Subscription deletion note</h2>
      <p>
        Deleting a Flow account does not automatically cancel a subscription that is managed by Google Play or another external billing provider. Cancel that subscription with the provider before deleting your Flow account if you do not want future charges.
      </p>

      <h2>7. Security</h2>
      <p>
        Flow uses encrypted HTTPS connections, database row-level security, server-side billing verification, restricted service credentials, rate limiting, and other access controls. No system can guarantee absolute security, but we design Flow to minimize exposed personal and payment data.
      </p>

      <h2>8. International processing</h2>
      <p>
        Flow is operated from Indonesia and uses providers that may process data in other countries. Cross-border processing is limited to what is needed to provide, secure, distribute, and support the service, subject to applicable law and provider safeguards.
      </p>

      <h2>9. Contact and changes</h2>
      <p>
        We may update this policy as Flow changes. The date above identifies the current version. For privacy questions, data requests, or deletion help, contact <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a>.
      </p>
    </LegalShell>
  );
}
