import type { User } from "@supabase/supabase-js";

// Google OAuth populates user_metadata with name/full_name and avatar_url/picture.
// These helpers read those consistently with sensible fallbacks.

export function userDisplayName(user: User | null | undefined): string {
  if (!user) return "";
  const m = (user.user_metadata ?? {}) as Record<string, unknown>;
  return (
    (m.name as string) ||
    (m.full_name as string) ||
    (user.email ? user.email.split("@")[0] : "") ||
    "You"
  );
}

export function userAvatarUrl(user: User | null | undefined): string | null {
  if (!user) return null;
  const m = (user.user_metadata ?? {}) as Record<string, unknown>;
  return (m.avatar_url as string) || (m.picture as string) || null;
}

export function userInitial(user: User | null | undefined): string {
  const name = userDisplayName(user);
  return (name || "?").charAt(0).toUpperCase();
}
