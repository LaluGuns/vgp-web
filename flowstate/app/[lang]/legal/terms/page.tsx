"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { useTranslation } from "@/hooks/use-translation";

export default function TermsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("legal.terms.title", "Terms of Service")} - Flow`;
  }, [t]);

  return (
    <LegalShell title={t("legal.terms.title", "Terms of Service")} updated="September 3, 2026" active="Terms">
      <p>
        Welcome to Flow ("Flow", "we", "us"). Flow is a deep-work product operated by Virzy Guns and available on the web and supported mobile platforms. By accessing or using Flow, you agree to these Terms of Service.
      </p>

      <h2>1. The service</h2>
      <p>
        Flow provides a focus timer, original music, ambient sounds, task tools, focus history and analytics, and optional paid features. We may add, change, or remove features as the product evolves.
      </p>

      <h2>2. Your account</h2>
      <p>
        Some features require an account created through supported sign-in methods. You are responsible for keeping access to your sign-in method secure. You must meet the minimum digital-consent age that applies in your country.
      </p>

      <h2>3. Subscriptions and payment</h2>
      <ul>
        <li>On Android, eligible subscriptions are offered and billed through Google Play. Google Play displays the current localized price, billing period, taxes where applicable, and any eligible offer before purchase.</li>
        <li>On the web, eligible paid purchases may be processed by Lemon Squeezy, which acts as Merchant of Record for those web transactions.</li>
        <li>Subscriptions renew automatically unless cancelled through the provider that billed the purchase. Cancelling stops future renewal while paid access normally continues through the already-paid period, subject to the provider&apos;s rules.</li>
        <li>Flow does not store full card or bank-account details. Store and payment-provider terms also apply to purchases made through those providers.</li>
        <li>Deleting a Flow account does not itself cancel an external Google Play or web subscription. Cancel the subscription with the billing provider first if you do not want future charges.</li>
      </ul>

      <h2>4. Refunds</h2>
      <p>
        Refund eligibility and processing depend on where you purchased Flow. Google Play purchases are subject to Google Play&apos;s refund process and applicable law. Web purchases are handled under our Refund &amp; Cancellation Policy and the applicable payment provider&apos;s terms.
      </p>

      <h2>5. Music and content license</h2>
      <p>
        Unless a separate Creator Music license expressly says otherwise, music and ambient audio in Flow are provided for personal focus and productivity use only. You may not rip, redistribute, resell, sample, or publish the audio as your own content. Separate Creator Music grants are governed by the license terms presented when the grant is issued.
      </p>

      <h2>6. Acceptable use</h2>
      <ul>
        <li>Do not circumvent paid-feature gating, rate limits, billing verification, or content protections.</li>
        <li>Do not scrape, mass-download, or rip the audio library or other protected assets.</li>
        <li>Do not attempt unauthorized access, interfere with service operation, or use Flow unlawfully.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>Flow, its software, interface, brand, and content are owned by us or our licensors except where expressly stated otherwise. These Terms do not transfer ownership to you.</p>

      <h2>8. Disclaimers and limitation of liability</h2>
      <p>
        Flow is provided "as is" and "as available" to the extent permitted by law. We do not guarantee uninterrupted operation or specific productivity outcomes. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of Flow.
      </p>

      <h2>9. Termination and account deletion</h2>
      <p>
        We may suspend accounts that materially violate these Terms. You may stop using Flow at any time. You can permanently delete your account and account-linked data from the <Link href="/delete-account">Delete account</Link> page in Flow or on the web. Limited de-identified transaction, refund-review, or issued-license records may be retained where required for accounting, fraud prevention, legal obligations, or license defense.
      </p>

      <h2>10. Changes and governing law</h2>
      <p>
        We may update these Terms. The last-updated date above identifies the current version. These Terms are governed by the laws of the Republic of Indonesia, subject to any mandatory consumer rights that apply where you live.
      </p>

      <p>Questions: <a href="mailto:founder@virzyguns.com">founder@virzyguns.com</a>.</p>
    </LegalShell>
  );
}
