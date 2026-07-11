import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the OAuth/magic-link code for a session, then redirects into the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default into the app (/) is the marketing landing now; the app lives at /app.
  let next = searchParams.get("next") ?? "/app";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    next = "/app";
  }

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Lazy profile creation (no auth.users trigger on this shared project).
      const user = data.user;
      if (user) {
        await supabase.from("flowstate_profiles").upsert(
          {
            id: user.id,
            display_name:
              user.user_metadata?.name ??
              user.user_metadata?.full_name ??
              user.email?.split("@")[0] ??
              null,
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const nextSuffix = next !== "/" ? `&next=${encodeURIComponent(next)}` : "";
  return NextResponse.redirect(`${origin}/login?error=auth_failed${nextSuffix}`);
}
