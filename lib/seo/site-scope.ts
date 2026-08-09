import type { SiteScope } from "@/lib/organic-discovery/types";

export type SeoSiteScope = {
  key: SiteScope;
  pagePrefix: string;
  propertyUri: string;
};

export const SEO_SITE_SCOPES: readonly SeoSiteScope[] = [
  {
    key: "root",
    pagePrefix: "https://www.virzyguns.com/",
    propertyUri: process.env.GSC_ROOT_SITE_URL || process.env.GSC_SITE_URL || "sc-domain:virzyguns.com",
  },
  {
    key: "flow",
    pagePrefix: "https://flow.virzyguns.com/",
    propertyUri: process.env.GSC_FLOW_SITE_URL || process.env.GSC_SITE_URL || "sc-domain:virzyguns.com",
  },
];

export function getSeoSiteScope(value: string | null | undefined): SeoSiteScope {
  return SEO_SITE_SCOPES.find((scope) => scope.key === value) || SEO_SITE_SCOPES[1];
}
