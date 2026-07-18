// Shared shape for the /alternatives/<slug> comparison pages.
import type { FaqItem } from "@/lib/marketing/seo";

export type AlternativeCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Honest intro — acknowledge what the competitor does well. */
  intro: string[];
  competitorName: string;
  tableHeading: string;
  rows: { feature: string; them: string; flow: string }[];
  whenHeading: string;
  whenParagraphs: string[];
  faq: FaqItem[];
};
