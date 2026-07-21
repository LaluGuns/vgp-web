import type { Metadata } from "next";
import { ProductProviders } from "@/components/layout/product-providers";
import { noIndexRouteMetadata } from "@/lib/marketing/route-metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return noIndexRouteMetadata(lang, "insights");
}

export default function AuthenticatedProductLayout({ children }: { children: React.ReactNode }) {
  return <ProductProviders>{children}</ProductProviders>;
}
