# Localization and copy audit

Evidence was collected from the current source tree on 2026-07-11. This report does not make a claim of native-speaker or legal review.

## FST-I18N-01: eight declared locales are structurally behind English and Indonesian

- Severity: P1
- Evidence: `lib/translations/dictionaries.ts` contains 302 English leaf strings and 302 Indonesian strings. Spanish, French, German, Japanese, Korean, Simplified Chinese, Portuguese, Russian, and Italian each contain 286.
- Impact: 24 currently used keys silently fall back to English because `useTranslation().t()` returns the supplied English fallback. Affected surfaces include the interface-style selector, Insights momentum cards, the Focus Time glossary, history duration labels, and the consistent-week message.
- Reproduction: Switch the locale to Spanish, French, German, Japanese, Korean, Chinese, Portuguese, Russian, or Italian, then open `/app` and `/insights`.
- Fix condition: align every locale to the English key shape, remove the eight stale keys from the alternate shape, and add a parity test that fails on missing keys or placeholder mismatches.

Missing key families: `app.themes.*`, `insights.momentum.*`, `insights.glossary.focustime.*`, `insights.history.duration`, and `insights.message.consistent`.

## FST-I18N-02: legal-page link rendering is English-specific

- Severity: P1
- Evidence: `app/legal/privacy/page.tsx` splits translated content on the literal English words `See` and `contact`; `app/legal/terms/page.tsx` checks the literal English phrase `Refund and Cancellation`.
- Impact: non-English privacy pages append an English Lemon Squeezy sentence after the already translated sentence, and the contact paragraph can duplicate the email plus add an English fragment. Non-English Terms pages do not link to the refund policy.
- Reproduction: set the locale to Indonesian, Spanish, French, Japanese, or another non-English locale and open `/legal/privacy` and `/legal/terms`.
- Fix condition: replace text parsing with explicit translated link-label and pre/post-link fields. Test all eleven locales.

## FST-I18N-03: landing page language switching is partial

- Severity: P1
- Evidence: `app/page.tsx` exposes the locale selector but hard-codes visible English strings including `Start Focusing (Free)`, `Built for deep work.`, `No ads`, feature descriptions, and the footer promise.
- Impact: a visitor can select another language yet continue reading a mixed English interface.
- Fix condition: move all public visible strings into dictionaries and remove English fallbacks for any key that must be localized before launch.

## FST-PAY-01: annual price has conflicting sources of truth

- Severity: P0 pending Test Mode confirmation
- Evidence: checkout, pricing UI, and translated Terms/Refund copy use $59.99 yearly and $29.99 with `FLOWBRO`. `LAUNCH.md` and `marketing/LEMONSQUEEZY-SETUP.md` instruct a $99 yearly Lemon Squeezy product anchor.
- Impact: the provider product price, checkout custom price, public pricing, and legal copy can diverge. A buyer could see or be charged an amount that does not match the product setup or Terms.
- Fix condition: choose the intended yearly anchor and promotional price once, make provider configuration, checkout, UI, translations, Terms, Refund policy, and marketing docs agree, then prove it with a Lemon Squeezy Test Mode checkout.

## Humanizer review

The English landing copy is generally specific and consistent with `docs/VOICE.md`. The problem is less about generic AI prose than the locale split and a few strings that bypass the voice and translation system.

Candidate hero rewrite, only if the current copy is being revised:

Draft:

> A focus timer with music made for it. Every track comes from Virzy Guns, not a stock library. Add ambient sound when the room gets loud.

Still-AI check:

- It is tidy but factual. It does not make a productivity claim.
- `comes from` is vague. Naming the producer is more direct.

Final:

> A focus timer with music made by Virzy Guns. No stock loops. Add ambient sound when the room gets loud.

The final version avoids inflated claims, keeps the music provenance clear, and should be translated by a human reviewer rather than mechanically copied into the other ten locales.
