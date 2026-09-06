import { createServiceClient } from "@/lib/supabase/server";

export async function claimGooglePlayRtdn(messageId: string, kind: string): Promise<boolean> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("flowstate_claim_google_play_rtdn", {
    p_message_id: messageId,
    p_kind: kind,
    p_lease_seconds: 60,
  });
  if (error) throw error;
  if (typeof data !== "boolean") throw new Error("Invalid Google Play RTDN claim response");
  return data;
}

export async function completeGooglePlayRtdn(messageId: string) {
  const now = new Date().toISOString();
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("flowstate_google_play_rtdn_messages")
    .update({
      status: "processed",
      processed_at: now,
      lease_until: null,
      last_error: null,
      updated_at: now,
    })
    .eq("message_id", messageId)
    .eq("status", "processing");
  if (error) throw error;
}

export async function failGooglePlayRtdn(messageId: string, cause: unknown) {
  const message = cause instanceof Error ? cause.message : String(cause);
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("flowstate_google_play_rtdn_messages")
    .update({
      status: "error",
      lease_until: null,
      last_error: message.slice(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq("message_id", messageId)
    .eq("status", "processing");
  if (error) console.error("google_play_rtdn_error_state_failed", error);
}

export async function cleanupGooglePlayRtdn(retentionDays = 90) {
  const safeDays = Math.max(30, Math.min(365, Math.trunc(retentionDays)));
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const supabase = await createServiceClient();
  const { error, count } = await supabase
    .from("flowstate_google_play_rtdn_messages")
    .delete({ count: "exact" })
    .in("status", ["processed", "error"])
    .lt("updated_at", cutoff);
  if (error) throw error;
  return count || 0;
}
