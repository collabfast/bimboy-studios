// Server-side X/Twitter follower lookup.
//
// Uses a user-supplied paid X API bearer token (read from the X_BEARER_TOKEN
// secret). When the token is missing or the API call fails, callers fall back to
// the manually-entered follower count, so the feature degrades gracefully.

export type FollowerFetchResult =
  | { ok: true; followers: number }
  | { ok: false; reason: "no-token" | "not-found" | "api-error" };

export function hasXToken(): boolean {
  return !!process.env.X_BEARER_TOKEN;
}

/**
 * Fetch a public follower count for an X handle via the X API v2.
 * `handle` may include a leading "@".
 */
export async function fetchXFollowers(
  handle: string,
): Promise<FollowerFetchResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return { ok: false, reason: "no-token" };

  const username = handle.replace(/^@/, "").trim();
  if (!username) return { ok: false, reason: "not-found" };

  try {
    const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(
      username,
    )}?user.fields=public_metrics`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status === 404) return { ok: false, reason: "not-found" };
    if (!resp.ok) return { ok: false, reason: "api-error" };

    const body = (await resp.json()) as {
      data?: { public_metrics?: { followers_count?: number } };
    };
    const followers = body.data?.public_metrics?.followers_count;
    if (typeof followers !== "number") return { ok: false, reason: "not-found" };
    return { ok: true, followers };
  } catch {
    return { ok: false, reason: "api-error" };
  }
}
