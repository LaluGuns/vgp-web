"use client";

import { useEffect } from "react";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function RefundPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.refund.title", "Refund & Cancellation Policy")} - Flow`;
  }, [t]);

  return (
    <LegalShell title={t("legal.refund.title", "Refund & Cancellation Policy")} updated="September 3, 2026" active="Refunds">
      <p>This policy explains how subscription cancellation and refund requests work depending on where you purchased Flow.</p>

      <h2>1. Cancelling a subscription</h2>
      <p>
        Cancel through the provider that billed your purchase. Android subscriptions purchased through Google Play must be managed in Google Play. Web subscriptions must be managed through the web payment provider or the account-management link supplied for that purchase. Cancelling stops future renewal; access normally remains available through the already-paid period, subject to the provider&apos;s rules.
      </p>

      <h2>2. Google Play purchases</h2>
      <p>
        Refund requests for Android purchases are processed under Google Play&apos;s refund rules and applicable consumer law. You can review purchases and request eligible refunds through Google Play. Flow may assist with purchase verification or support questions, but we cannot override a decision that Google Play is required to make as the billing platform.
      </p>
      <p>
        <a href="https://play.google.com/store/account/orderhistory" target="_blank" rel="noopener noreferrer">Open Google Play order history</a>
      </p>

      <h2>3. Web purchases</h2>
      <p>
        For eligible purchases made directly on the Flow website through Lemon Squeezy, you may request a refund within 14 days of the initial purchase or renewal charge. Requests may be declined where permitted by law in cases of evident abuse, such as repeated refund-and-resubscribe cycles.
      </p>

      <h2>4. How to request help</h2>
      <p>
        For web purchases, email <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a> from the address associated with your Flow account and include the relevant order or receipt details. For Google Play purchases, include the Google Play order identifier when contacting us so we can investigate the Flow-side entitlement state without asking for payment-card details.
      </p>

      <h2>5. Account deletion is not cancellation</h2>
      <p>
        Permanently deleting your Flow account removes account-linked Flow data, but it does not automatically cancel a subscription managed by Google Play or another external billing provider. Cancel the subscription with that provider before deleting your Flow account if you do not want future charges.
      </p>

      <h2>6. Processing time</h2>
      <p>Approved refunds are returned through the provider that processed the original transaction. Bank or card settlement time varies by provider and financial institution.</p>
    </LegalShell>
  );
}
