---
name: lead-discovery
description: Discover and qualify evidence-backed rappers, game developers, and content creators who may fit VGP beats or services. Use when the user asks to find prospects, research leads, qualify an account, build a prospect list, or save a candidate with source URLs and confidence.
---

# Lead Discovery

1. Read configured market, segment, platform, niche, and lead limits from
   `founder_get_brief`. Search existing records with
   `founder_search_prospects` before adding anything.
2. Use public business pages, official sources, and founder-permitted research.
   Respect robots, rate limits, login walls, and platform restrictions.
3. Capture observed name, profile URL, source URL, observation time, fit reason,
   evidence-specific confidence, gaps, and the safest next step.
4. Never infer contact data. A business email is usable only when the source
   explicitly provides it and the permission/source fields agree.
5. Search verified beats with `founder_search_catalog` for any claimed match.
6. Save one bounded candidate with `founder_save_prospect_candidate` only after
   evidence validation. Deduplicate and use a stable request key.

Do not scrape aggressively, bypass access controls, buy unverifiable lists, or
manufacture identity, audience, purchase intent, email, phone, or confidence.
Saving a candidate never authorizes outreach.
