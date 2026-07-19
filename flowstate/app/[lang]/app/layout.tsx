import type { Metadata } from "next";
import { ProductProviders } from "@/components/layout/product-providers";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ProductAppLayout({ children }: { children: React.ReactNode }) {
  return <ProductProviders>{children}</ProductProviders>;
}
