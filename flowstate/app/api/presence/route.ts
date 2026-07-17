import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Lightweight UA parsing — intentionally regex-only, no dependency. Order
// matters: check the more specific tokens first (Edge before Chrome, iOS
// before macOS, Android before Linux).
function parseUserAgent(ua: string) {
  let os: string | null = null;
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/cros/i.test(ua)) os = "ChromeOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser: string | null = null;
  if (/edg(?:e|a|ios)?\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";

  let deviceType: string | null = null;
  if (/ipad|tablet|(?:android(?!.*mobile))/i.test(ua)) deviceType = "tablet";
  else if (/mobile|iphone|ipod/i.test(ua)) deviceType = "mobile";
  else if (ua) deviceType = "desktop";

  return { os, browser, deviceType };
}

function geoHeader(request: NextRequest, name: string): string | null {
  const raw = request.headers.get(name);
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    return decoded || null;
  } catch {
    return raw.trim() || null;
  }
}

// One fire-and-forget ping per page load from signed-in clients. Updates the
// caller's own flowstate_profiles row via the service client (RLS bypass is
// safe: the row is looked up by the authenticated user's id, never from input).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { os, browser, deviceType } = parseUserAgent(
    request.headers.get("user-agent") ?? ""
  );
  const country = geoHeader(request, "x-vercel-ip-country");
  const city = geoHeader(request, "x-vercel-ip-city");

  const service = await createServiceClient();
  const { error } = await service
    .from("flowstate_profiles")
    .update({
      last_seen_at: new Date().toISOString(),
      os,
      browser,
      device_type: deviceType,
      country,
      city,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[presence] profile update failed:", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
