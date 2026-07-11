import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
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
