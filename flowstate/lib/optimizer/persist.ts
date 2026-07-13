import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SessionSummary } from "@/lib/stores/focus-session-store";

/**
 * At-least-once persistence of finished focus sessions ("data bener-bener masuk").
 *
 * Every session is enqueued in a localStorage outbox FIRST (with a client-generated
 * UUID), then flushed to Supabase. Failed flushes are retried on the next session,
 * on app start, and whenever the browser comes back online — a network blip or a
 * closed tab can no longer silently lose a session.
 *
 * Idempotency: the `client_id` column has a unique index, so a retry after an
 * "insert succeeded but response was lost" race cannot create duplicates
 * (unique-violation errors are treated as success).
 *
 * Still a silent no-op when Supabase isn't configured or the user is signed out —
 * the app stays fully usable offline/logged-out.
 */

// v2 intentionally does not migrate the old ownerless queue. Those entries
// cannot be attributed safely to whichever account happens to log in next.
const OUTBOX_KEY = "flowstate-session-outbox-v2";
const MAX_ATTEMPTS = 60; // ~2 months of daily retries before giving up
const MAX_QUEUE = 200;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface OutboxEntry {
  clientId: string;
  ownerId: string;
  row: Record<string, unknown>; // insert payload minus user_id (bound at flush time)
  attempts: number;
  enqueuedAt: number;
}

function readOutbox(): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is OutboxEntry =>
        !!entry &&
        typeof entry.clientId === "string" &&
        typeof entry.ownerId === "string" &&
        entry.ownerId.length > 0 &&
        typeof entry.row === "object" &&
        entry.row !== null
    );
  } catch {
    return [];
  }
}

function writeOutbox(entries: OutboxEntry[]) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries.slice(-MAX_QUEUE)));
  } catch {
    /* storage full/blocked — nothing more we can do */
  }
}

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Very old browsers: timestamp + random fallback (still unique enough).
    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
  }
}

function entryKey(entry: Pick<OutboxEntry, "ownerId" | "clientId">): string {
  return `${entry.ownerId}:${entry.clientId}`;
}

let flushing = false;

/** Try to deliver every queued session. Safe to call often; runs one at a time. */
export async function flushSessionOutbox(): Promise<void> {
  if (flushing) return;
  if (typeof window === "undefined") return;
  if (!isSupabaseConfigured()) return;

  const queue = readOutbox();
  if (queue.length === 0) return;

  flushing = true;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // keep queued; delivered after next sign-in

    // Track outcomes by clientId, NOT by rewriting the snapshot: a session
    // finished (and enqueued) DURING this flush's awaits would otherwise be
    // clobbered when we write back — the exact data loss the outbox prevents.
    const ownedQueue = queue.filter((entry) => entry.ownerId === user.id);
    if (ownedQueue.length === 0) return;

    const processed = new Set<string>(); // delivered or permanently dropped
    const bumpAttempts = new Map<string, number>(); // clientId → new attempt count

    for (const entry of ownedQueue) {
      const { error } = await supabase
        .from("flowstate_focus_sessions")
        .insert({ ...entry.row, user_id: entry.ownerId, client_id: entry.clientId });

      if (!error || error.code === "23505" /* unique_violation = already delivered */) {
        processed.add(entryKey(entry));
        continue;
      }
      // RLS/schema rejections will never succeed — drop after logging once.
      if (error.code === "42501" || error.code === "PGRST204") {
        console.error("Dropping undeliverable focus session:", error.message);
        processed.add(entryKey(entry));
        continue;
      }
      const attempts = entry.attempts + 1;
      if (attempts < MAX_ATTEMPTS) {
        bumpAttempts.set(entryKey(entry), attempts);
      } else {
        console.error("Focus session exceeded retry budget, dropping:", entry.clientId);
        processed.add(entryKey(entry));
      }
    }

    // Re-read so entries enqueued mid-flush survive; drop the delivered/dropped
    // ones and update retry counts on the rest.
    const next = readOutbox()
      .filter((e) => !processed.has(entryKey(e)))
      .map((e) => {
        const attempts = bumpAttempts.get(entryKey(e));
        return attempts === undefined ? e : { ...e, attempts };
      });
    writeOutbox(next);
  } catch (err) {
    console.error("Outbox flush failed (will retry):", err);
  } finally {
    flushing = false;
  }
}

/** Queue a finished session and immediately attempt delivery. */
export async function persistSession(
  summary: SessionSummary,
  mode: string,
  taskId?: string | null
) {
  if (typeof window === "undefined") return;
  if (!isSupabaseConfigured()) return;

  // This reads the locally persisted auth session, so an authenticated offline
  // user can enqueue without assigning the row to a future, unrelated login.
  let ownerId: string | undefined;
  try {
    const {
      data: { session },
    } = await createClient().auth.getSession();
    ownerId = session?.user?.id;
  } catch {
    return;
  }
  if (!ownerId) return;

  const entry: OutboxEntry = {
    clientId: newClientId(),
    ownerId,
    row: {
      mode,
      started_at: new Date(summary.startedAt).toISOString(),
      ended_at: new Date().toISOString(),
      target_duration_s: summary.targetDurationSeconds,
      actual_duration_s: summary.elapsedSeconds,
      completed: summary.completed,
      fidget_count: summary.fidgetCount,
      fidget_timeline: summary.fidgetTimeline,
      // Defection tracking was removed (a hidden tab ≠ unfocused for a music app).
      // Columns retained for backward compatibility, written as neutral.
      defection_seconds: 0,
      context_bookmark: summary.contextBookmark || null,
      real_focus_ratio: null,
      task_id: taskId && UUID_REGEX.test(taskId) ? taskId : null,
    },
    attempts: 0,
    enqueuedAt: Date.now(),
  };

  writeOutbox([...readOutbox(), entry]);
  await flushSessionOutbox();
}

/** Wire flush triggers once per app lifetime (call from a root client component). */
let wired = false;
export function initSessionOutbox() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener("online", () => void flushSessionOutbox());
  // App start: deliver anything a previous session failed to send.
  void flushSessionOutbox();
}
