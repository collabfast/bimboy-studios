// Replaced by Supabase auth. Re-exports the current user id from the auth
// context for callers that still need a synchronous lookup.
//
// Prefer importing `useAuth()` from "@/lib/auth" in React code.

import { supabase } from "./supabase";

/**
 * Returns the current Supabase user id if a session exists, else null.
 * This reads from the in-memory Supabase client; it does not trigger a fetch.
 */
export function getCurrentUserId(): string | null {
  // supabase-js caches the session on the client after init; this is sync-safe
  // once AuthProvider has mounted. For pre-mount calls it returns null.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (supabase.auth as any).currentSession ?? null;
  return session?.user?.id ?? null;
}
