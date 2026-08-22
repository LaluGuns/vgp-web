import { renderFlowHomeOgCard } from "@/lib/social/flow-home-og-card";

export const dynamic = "force-static";

export function GET() {
  return renderFlowHomeOgCard();
}
