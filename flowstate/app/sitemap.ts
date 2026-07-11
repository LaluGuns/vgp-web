import type { MetadataRoute } from "next";

const BASE = "https://flow.virzyguns.com";

const PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "pricing", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "login", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "legal/terms", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "legal/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "legal/refund", changeFrequency: "yearly" as const, priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path ? `/${path}` : ""}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
