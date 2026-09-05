# VGP AI Discovery Contract

This repository treats AI discovery as a product-data and entity-consistency problem, not as a promise that any chatbot will recommend VGP.

## Authority

`lib/ai-discovery/catalog.ts` is the canonical public product registry for VGP discovery surfaces.

Every product record must state:

- canonical public URL
- product kind
- current status
- audience and topics
- whether it is currently eligible to be described as available
- an availability note that prevents overclaiming
- the Schema.org type used by the canonical page
- a machine feed URL when one exists

`discoveryEligible=true` is reserved for products that are genuinely public. Coming-soon, research, and development products must remain false until their source authority changes.

## Required discovery surfaces

The site exposes:

- `/products` for the human-readable canonical product hub
- `/products/catalog.json` for the product registry
- `/products/music` and `/products/music.json` for the privacy-safe distributed music catalog summary
- `/products/beats.json` for verified/indexable BeatStars product data
- `/products/hear-the-difference` for the official game identity and current development status
- `/llms.txt` as a supplemental discovery index
- `/sitemap.xml` for indexable canonical pages

`llms.txt` is supplemental. It does not replace crawlable HTML, structured data, sitemaps, external platforms, or authoritative third-party references.

## Structured data rules

Page-level JSON-LD must use `components/seo/JsonLd.tsx` so production CSP nonce requirements are preserved.

Stable entity IDs:

- VGP Organization: `https://www.virzyguns.com/#organization`
- Virzy Guns: `https://www.virzyguns.com/#founder`
- WebSite: `https://www.virzyguns.com/#website`
- Product pages: canonical URL plus `#product`

Do not create duplicate Organization or Person nodes with different IDs on product pages. Reference the stable site-wide nodes instead.

## Privacy and evidence rules

Do not publish private royalty, earnings, country, transaction, customer, or account data into discovery feeds.

The released-music summary intentionally exposes only aggregate catalog identity information. The source workbook contains richer commercial data, but that data is not part of the public discovery layer.

Do not fabricate:

- reviews or ratings
- awards
- availability
- prices
- release status
- scientific claims
- usage numbers
- testimonials

If a source does not provide a field, omit it rather than reconstructing it from guesswork.

## Adding a new VGP product

1. Create or identify the canonical public page.
2. Add a record to `lib/ai-discovery/catalog.ts`.
3. Set status and `discoveryEligible` from current source authority.
4. Add page-level JSON-LD with a stable `#product` ID.
5. Add a machine feed only if there is useful structured data to expose.
6. Add the canonical page to the sitemap when it should be indexed.
7. Update `llms.txt` links if the product introduces a new primary discovery surface.
8. Run `npm run validate:ai-discovery` and the normal build/lint checks.
9. Verify the Vercel preview before merging.

## Status changes

When a product launches, do not merely change marketing copy. Update the registry, page metadata, JSON-LD, sitemap behavior, machine feeds, and `llms.txt` in the same change so human and machine surfaces stay consistent.
