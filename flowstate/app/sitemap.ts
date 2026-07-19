import type { MetadataRoute } from "next";
import { sitemapCandidates } from "@/lib/marketing/seo-registry";

const BASE = "https://flow.virzyguns.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapCandidates(BASE);
}
