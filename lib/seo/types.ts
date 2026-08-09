import type { SiteScope } from '@/lib/organic-discovery/types';

export type SeoRange = 7 | 28 | 90;
export type SeoConnectorState = 'connected' | 'not_configured' | 'error' | 'stale';

export interface SeoFilters {
  days: SeoRange;
  siteScope?: SiteScope;
  start?: string;
  end?: string;
  market?: string;
  locale?: string;
  country?: string;
  cluster?: string;
  device?: string;
  brand?: 'brand' | 'non_brand' | 'all';
  searchType?: 'web';
}

export interface SeoAggregateRow {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
}
