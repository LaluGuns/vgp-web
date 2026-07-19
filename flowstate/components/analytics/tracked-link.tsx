"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

export function TrackedLink({ children, destination, source, className, ...props }: LinkProps & { children: ReactNode; destination: string; source: string; className?: string }) {
  return <Link {...props} className={className} onClick={() => track("seo_cta_clicked", { destination, source })}>{children}</Link>;
}
