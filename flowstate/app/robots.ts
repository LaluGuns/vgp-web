import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
  if (host !== "flow.virzyguns.com") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // App routes behind auth and API endpoints aren't useful to crawlers.
      disallow: ["/api/", "/auth/", "/insights"],
    },
    sitemap: "https://flow.virzyguns.com/sitemap.xml",
  };
}
