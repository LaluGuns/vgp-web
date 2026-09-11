# VGP AI Discovery v1 Plan

Status: staging only
Branch: `feat/ai-discovery-v1`
Production: DO NOT MERGE OR DEPLOY YET

## Goal

Make Virzy Guns Production and its public products easier for search engines, AI assistants, agents, and conversational discovery systems to understand, verify, cite, and recommend when relevant.

This project does not attempt to force recommendations. It builds a clean public evidence layer with consistent canonical URLs, structured data, machine-readable catalogs, product availability states, and crawlable human-readable pages.

## Current authority

- Repository: `LaluGuns/vgp-web`
- Production branch: `main`
- Working branch: `feat/ai-discovery-v1`
- Vercel project: `vgp-web`
- Production must remain untouched until explicit approval.

## Product status policy

Only products marked `discoveryEligible: true` may be described as currently available.

Current status model:

- `available`: public product or catalog is currently usable or purchasable
- `coming_soon`: public preview exists, but the product is not released
- `research`: public research/program page, not a released product
- `development`: active development, not released

Do not silently upgrade a product from coming soon, research, or development to available.

## Implemented in this branch

### Canonical discovery layer

- `/products`
  - Human-readable canonical VGP product catalog
- `/products/catalog.json`
  - Machine-readable master product registry
- `/products/beats.json`
  - Public/indexable beat discovery feed
- `/products/music`
  - Human-readable VGP released-music identity summary
- `/products/music.json`
  - Privacy-safe music catalog summary
- `/llms.txt`
  - Conservative discovery index for LLM/agent consumers
- `/products/hear-the-difference`
  - Canonical public identity page for HTD while it remains in development

### Entity graph

Site-wide schema now links stable identities for:

- Virzy Guns Production / VGP
- Virzy Guns
- VGP website
- VGP product catalog
- Flow
- CADENZ
- Music Production Guide: Trap Edition
- VGP Music Production Masterclass
- HealingWave Lab
- Hear the Difference
- individual indexable beat pages

### CSP-safe structured data

A shared `JsonLd` helper now renders page-level schema using the request CSP nonce so JSON-LD survives the production Content Security Policy.

Applied to important product surfaces including:

- Flow
- CADENZ
- book
- Masterclass
- HealingWave
- HTD
- beat pages in English, Japanese, and German

### Music identity snapshot

The current private distribution authority was used only to establish a safe public catalog summary.

Current identity counts in the source snapshot:

- Virzy Guns: 315
- Chill Music Division: 264
- LUNA Q: 20
- LA LU: 10
- mia.exe: 8
- Total unique track identities: 617

Private royalty, earnings, transaction, country, and store-performance data must never be copied into the public discovery layer.

The source does not contain reliable release-title hierarchy for every recording, so v1 deliberately does not fabricate hundreds of individual song pages.

### Internal discovery

- `/products` is included in sitemap
- `/products/music` is included in sitemap
- footer links to the official Product Catalog
- root metadata advertises the public catalog and LLM discovery index

### Guardrails

- `docs/AI_DISCOVERY.md`
  - maintenance contract and implementation notes
- `scripts/validate-ai-discovery.mjs`
  - repository-level discovery contract validator
- `npm run validate:ai-discovery`
  - validator entry point

## QA completed so far

- Vercel preview builds have reached READY for functional milestones.
- `/products` preview returned HTTP 200.
- Rendered HTML was inspected.
- Organization, Person, WebSite, and product ItemList JSON-LD are present in rendered HTML.
- JSON-LD scripts carry CSP nonces.
- Canonical `/products` metadata is present.
- Vercel preview adds `x-robots-tag: noindex`, which is expected for preview deployments and is not a production signal.

Preview-protected JSON endpoints may redirect through Vercel SSO when fetched externally. Do not claim public runtime verification for those endpoints until they are tested on an accessible deployment.

## Remaining staging work

### P0 before merge approval

- [ ] Confirm latest branch deployment reaches READY after all final consistency/doc commits.
- [ ] Inspect build logs for warnings/errors on latest deployment.
- [ ] Run final branch diff review for accidental unrelated changes.
- [ ] Verify no private financial/distribution fields were exposed.
- [ ] Verify all `discoveryEligible` states match current product authority.
- [ ] Verify canonical schema `@id` values match their product pages.
- [ ] Verify sitemap contains only intended public routes.
- [ ] Verify footer/internal links do not introduce broken routes.
- [ ] Open a DRAFT PR to `main` with explicit `NO PRODUCTION DEPLOY` status.
- [ ] Create a dated branch/source backup in Google Drive.

### P1 after explicit production approval

Do not execute these steps without explicit approval.

- [ ] Merge approved PR to `main`.
- [ ] Verify production Vercel deployment.
- [ ] Test `/products`, `/products/catalog.json`, `/products/beats.json`, `/products/music.json`, `/llms.txt`, and `/sitemap.xml` on the public domain.
- [ ] Confirm production robots headers do not contain accidental `noindex`.
- [ ] Validate representative structured-data pages from public HTML.
- [ ] Submit/update Google Search Console sitemap if needed.
- [ ] Submit/update Bing Webmaster Tools and IndexNow if needed.
- [ ] Measure crawl/indexation over time.

### P2 recommendation benchmark

After the discovery layer is public and crawlable:

- Build a buyer-intent prompt bank by product category.
- Test ChatGPT, Claude, Gemini, Copilot, Perplexity, and other relevant assistants.
- Track whether VGP is mentioned only when relevant.
- Track citation/source URL.
- Track top-three and first-position recommendation frequency.
- Track factual errors or stale product-status claims.
- Improve authoritative product pages based on evidence, not keyword stuffing.

Suggested KPI set:

- eligible-query count
- VGP mention rate
- top-3 recommendation rate
- first recommendation rate
- official-source citation rate
- incorrect-fact rate

## Product expansion rule

Whenever VGP launches a new product, app, game, book, music property, course, or other public product:

1. Add it to the canonical VGP product registry.
2. Give it one canonical public URL.
3. State availability explicitly.
4. Add accurate page-level schema using a stable `@id`.
5. Add it to the sitemap if public and indexable.
6. Add a machine-readable feed only if it adds real value.
7. Link it from a relevant human-readable VGP hub.
8. Do not expose private operational, royalty, customer, or financial data.
9. Update the AI discovery validator if the product adds a new contract requirement.
10. Add the product to future recommendation benchmark queries only when it is relevant to those queries.

## Hard rules

- Do not fabricate reviews, awards, ratings, users, streams, sales, press, citations, or third-party endorsements.
- Do not create fake Reddit/community discussions.
- Do not use hidden prompt injection or instructions aimed at manipulating chatbots.
- Do not mass-generate low-value SEO pages.
- Do not mark unreleased products as available.
- Do not publish private royalty or financial data.
- Do not merge or deploy production without explicit approval.

## Current next action

Finish staging QA, create a draft PR, and back up the branch snapshot to Google Drive. Stop before production.
