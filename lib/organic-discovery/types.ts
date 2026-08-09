export type SiteScope = "root" | "flow";

export type EvidenceTier = "A" | "B" | "C" | "Hold";

export type CatalogEntityType = "artist" | "track" | "release" | "playlist";

export type CatalogEntity = {
  canonicalId: string;
  entityType: CatalogEntityType;
  artist: string;
  title: string;
  isrc: string | null;
  upc: string | null;
  factualBpm: number | null;
  bpmSource: "metadata" | "title_reviewed" | "not_available";
  flowTrackId: string | null;
  dspUrl: string | null;
  youtubeVideoId: string | null;
  confidence: "verified" | "candidate" | "blocked";
  manualReviewReason: string | null;
};

export type EvidenceCard = {
  key: string;
  funnel: "cadenz" | "flow";
  primaryIntent: string;
  firstPartySearch: "confirmed" | "not_available" | "no_signal";
  royaltyEvidence: "strong" | "moderate" | "weak" | "not_available";
  searchProxyEvidence: "strong" | "moderate" | "weak" | "not_available";
  productFit: "direct" | "adjacent" | "none";
  assetReadiness: "publishable" | "draft" | "blocked";
  cannibalizationRisk: "low" | "review" | "high";
  tier: EvidenceTier;
  reason: string;
};

export type SeoPageRecord = {
  route: string;
  funnel: "cadenz" | "flow";
  primaryIntent: string;
  entityReferences: string[];
  localeRelease: string;
  indexState: "indexable" | "hub_only" | "draft" | "hold";
  canonical: string;
  schemaTypes: string[];
  ctaDestination: string;
  evidenceTier: EvidenceTier;
  reviewStatus: "approved" | "manual_review" | "blocked";
};
