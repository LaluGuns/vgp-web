import type { Metadata } from "next";
import { noIndexRouteMetadata } from "@/lib/marketing/route-metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return noIndexRouteMetadata(lang, "login");
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
