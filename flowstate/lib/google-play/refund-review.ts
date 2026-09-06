import crypto from "node:crypto";
import { ANDROID_PACKAGE, publisherFetch } from "@/lib/google-play/google-api";
import { createServiceClient } from "@/lib/supabase/server";

export type GooglePlayRefundPreference = "APPROVE" | "DECLINE" | "NEUTRAL";

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function userForPlayAccount(accountId?: string | null) {
  if (!accountId) return null;
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("flowstate_billing_accounts")
    .select("user_id")
    .eq("provider", "google_play")
    .eq("provider_account_id", accountId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

export async function queuePendingRefundReview(input: {
  pendingRefundToken: string;
  orderId: string;
  refundReason: number;
  obfuscatedAccountId?: string | null;
  occurredAt: string;
}) {
  const pendingRefundToken = input.pendingRefundToken.trim();
  const orderId = input.orderId.trim();
  const occurredAtMs = new Date(input.occurredAt).getTime();
  if (!pendingRefundToken || pendingRefundToken.length > 4096) throw new Error("Invalid pending refund token");
  if (!orderId || orderId.length > 256) throw new Error("Invalid Google Play order ID");
  if (!Number.isInteger(input.refundReason) || input.refundReason < 0) throw new Error("Invalid Google Play refund reason");
  if (!Number.isFinite(occurredAtMs)) throw new Error("Invalid pending refund review time");

  const userId = await userForPlayAccount(input.obfuscatedAccountId?.trim() || null);
  const providerReviewId = sha256Hex(pendingRefundToken);
  const deadlineAt = new Date(occurredAtMs + 24 * 60 * 60 * 1000).toISOString();
  const supabase = await createServiceClient();

  // Pub/Sub can redeliver. Ignore the duplicate instead of reopening a review
  // that is already processing or responded.
  const { error } = await supabase.from("flowstate_billing_refund_reviews").upsert({
    provider: "google_play",
    provider_review_id: providerReviewId,
    user_id: userId,
    provider_order_id: orderId,
    pending_refund_token: pendingRefundToken,
    refund_reason: input.refundReason,
    received_at: new Date(occurredAtMs).toISOString(),
    deadline_at: deadlineAt,
    status: "pending",
    updated_at: new Date().toISOString(),
  }, {
    onConflict: "provider,provider_review_id",
    ignoreDuplicates: true,
  });
  if (error) throw error;

  const { data: review, error: lookupError } = await supabase
    .from("flowstate_billing_refund_reviews")
    .select("user_id,deadline_at")
    .eq("provider", "google_play")
    .eq("provider_review_id", providerReviewId)
    .single();
  if (lookupError) throw lookupError;

  return {
    providerReviewId,
    userId: review.user_id ?? userId,
    deadlineAt: review.deadline_at ?? deadlineAt,
  };
}

export async function listPendingRefundReviews(limit = 50) {
  const supabase = await createServiceClient();
  const now = new Date().toISOString();

  const { error: expireError } = await supabase
    .from("flowstate_billing_refund_reviews")
    .update({ status: "expired", updated_at: now })
    .eq("provider", "google_play")
    .in("status", ["pending", "error"])
    .lte("deadline_at", now);
  if (expireError) throw expireError;

  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const { data, error } = await supabase
    .from("flowstate_billing_refund_reviews")
    .select("provider_review_id,user_id,provider_order_id,refund_reason,received_at,deadline_at,status,response_preference,attempt_count,last_attempt_at,last_error")
    .eq("provider", "google_play")
    .in("status", ["pending", "error"])
    .gt("deadline_at", now)
    .order("deadline_at", { ascending: true })
    .limit(safeLimit);
  if (error) throw error;
  return data || [];
}

export async function reviewPendingRefund(input: {
  providerReviewId: string;
  refundPreference: GooglePlayRefundPreference;
  sampleContentProvided: boolean;
  consumptionPercentageMilliunits: number | null;
}) {
  const providerReviewId = input.providerReviewId.trim();
  if (!/^[a-f0-9]{64}$/i.test(providerReviewId)) throw new Error("Invalid refund review ID");
  if (!["APPROVE", "DECLINE", "NEUTRAL"].includes(input.refundPreference)) {
    throw new Error("Invalid refund preference");
  }
  if (typeof input.sampleContentProvided !== "boolean") throw new Error("Invalid sample-content flag");
  if (
    input.consumptionPercentageMilliunits != null &&
    (!Number.isInteger(input.consumptionPercentageMilliunits) ||
      input.consumptionPercentageMilliunits < 0 ||
      input.consumptionPercentageMilliunits > 100_000)
  ) {
    throw new Error("Invalid consumption percentage");
  }

  const supabase = await createServiceClient();
  const now = new Date().toISOString();
  const { data: existing, error: lookupError } = await supabase
    .from("flowstate_billing_refund_reviews")
    .select("provider_order_id,pending_refund_token,deadline_at,status,attempt_count")
    .eq("provider", "google_play")
    .eq("provider_review_id", providerReviewId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!existing) throw new Error("Refund review not found");
  if (new Date(existing.deadline_at).getTime() <= Date.now()) {
    await supabase
      .from("flowstate_billing_refund_reviews")
      .update({ status: "expired", updated_at: now })
      .eq("provider", "google_play")
      .eq("provider_review_id", providerReviewId)
      .in("status", ["pending", "error"]);
    throw new Error("Refund review deadline expired");
  }

  // Claim the review atomically enough for concurrent admin requests: only an
  // actionable row may transition to processing.
  const { data: claimed, error: claimError } = await supabase
    .from("flowstate_billing_refund_reviews")
    .update({
      status: "processing",
      attempt_count: Number(existing.attempt_count || 0) + 1,
      last_attempt_at: now,
      last_error: null,
      updated_at: now,
    })
    .eq("provider", "google_play")
    .eq("provider_review_id", providerReviewId)
    .in("status", ["pending", "error"])
    .select("provider_order_id,pending_refund_token")
    .maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) throw new Error("Refund review is already processing or resolved");

  try {
    await publisherFetch<void>(
      `/applications/${encodeURIComponent(ANDROID_PACKAGE)}/orders/${encodeURIComponent(claimed.provider_order_id)}:reviewrefund`,
      {
        method: "POST",
        body: JSON.stringify({
          pendingRefundToken: claimed.pending_refund_token,
          sampleContentProvided: input.sampleContentProvided,
          refundPreference: input.refundPreference,
          ...(input.consumptionPercentageMilliunits == null
            ? {}
            : { consumptionPercentageMilliunits: input.consumptionPercentageMilliunits }),
        }),
      },
    );

    const respondedAt = new Date().toISOString();
    const { data, error: updateError } = await supabase
      .from("flowstate_billing_refund_reviews")
      .update({
        status: "responded",
        response_preference: input.refundPreference,
        responded_at: respondedAt,
        last_error: null,
        updated_at: respondedAt,
      })
      .eq("provider", "google_play")
      .eq("provider_review_id", providerReviewId)
      .eq("status", "processing")
      .select("provider_review_id,status,response_preference,responded_at")
      .single();
    if (updateError) throw updateError;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const { error: restoreError } = await supabase
      .from("flowstate_billing_refund_reviews")
      .update({
        status: "error",
        last_error: message.slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "google_play")
      .eq("provider_review_id", providerReviewId)
      .eq("status", "processing");
    if (restoreError) console.error("google_play_refund_review_state_restore_failed", restoreError);
    throw error;
  }
}
