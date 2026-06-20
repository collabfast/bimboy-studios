import { Router, type IRouter } from "express";
import {
  db,
  creatorsTable,
  videosTable,
  videoParticipantsTable,
  type PlatformLink,
  type Creator,
} from "@workspace/db";
import { eq, desc, or, and, isNull, inArray } from "drizzle-orm";
import { buildFeedItems, toCreatorDto } from "../lib/feed-items";
import { requireAuth } from "../middleware/auth";
import { fetchXFollowers, hasXToken, isFollowersStale } from "../lib/x-followers";

// Auto-refresh the cached follower count when it has gone stale (or when
// `force` is set). Re-fetches from the X API and persists the new count.
// Degrades gracefully: with no X handle, no API token, or a failed request the
// existing creator record is returned unchanged so the cached/manual value
// survives. This is a system-driven update — it never claims ownership, so it
// is safe to run for unauthenticated profile views.
async function refreshFollowersIfStale(
  creator: Creator,
  opts: { force?: boolean } = {},
): Promise<Creator> {
  if (!creator.xHandle) return creator;
  if (!opts.force && !isFollowersStale(creator.followersUpdatedAt)) {
    return creator;
  }
  if (!hasXToken()) return creator;

  const result = await fetchXFollowers(creator.xHandle);
  if (!result.ok) return creator;

  const [updated] = await db
    .update(creatorsTable)
    .set({ followerCount: result.followers, followersUpdatedAt: new Date() })
    .where(eq(creatorsTable.id, creator.id))
    .returning();
  return updated ?? creator;
}

const router: IRouter = Router();

// A "creator/pornstar" viewer is an authenticated user who owns at least one
// creator record. Profiles are claimed on first edit (see enforceOwnership),
// so a real creator who has set up their page is recognized as a creator viewer.
async function userOwnsAnyCreator(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: creatorsTable.id })
    .from(creatorsTable)
    .where(eq(creatorsTable.ownerUserId, userId))
    .limit(1);
  return !!row;
}

// Authorization for mutating a creator. A creator with no owner is claimed by
// the first authenticated user to edit it (returns claim=true so the caller
// persists ownerUserId). Once owned, only the owner may mutate it.
type OwnershipCheck =
  | { allowed: true; claim: boolean }
  | { allowed: false };

function checkOwnership(
  creator: { ownerUserId: string | null },
  userId: string,
): OwnershipCheck {
  if (creator.ownerUserId == null) return { allowed: true, claim: true };
  if (creator.ownerUserId === userId) return { allowed: true, claim: false };
  return { allowed: false };
}

// SQL guard for atomic claim-on-first-edit: only an unowned profile or one
// already owned by this user can be mutated. Combined with claiming the row in
// the same UPDATE, this makes first-claim race-safe — a concurrent second
// claimant matches 0 rows once the first write commits.
function ownershipGuard(userId: string) {
  return or(
    isNull(creatorsTable.ownerUserId),
    eq(creatorsTable.ownerUserId, userId),
  );
}

router.get("/creators", async (_req, res) => {
  const rows = await db.select().from(creatorsTable).limit(50);
  res.json(rows.map(toCreatorDto));
});

// Turn a display name (or requested handle) into a url-safe handle: lowercase,
// alphanumeric only, collapsed. Falls back to "creator" when nothing is left.
function slugifyHandle(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
  return slug || "creator";
}

// Build a handle candidate for attempt n: the bare base first, then base2,
// base3, … When attempts are exhausted, fall back to a time-based suffix so a
// pathological run still terminates with a unique value.
function handleCandidate(base: string, attempt: number): string {
  if (attempt === 0) return base;
  if (attempt < 50) return `${base}${attempt + 1}`;
  return `${base}${Date.now().toString(36)}`;
}

// Postgres unique-violation error code (handle has a unique index).
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "23505"
  );
}

// Onboarding: create a creator profile owned by the signed-in user. Handle is
// derived from the display name (or a requested handle). Insert is retried on a
// unique-constraint violation so concurrent signups for the same base handle
// resolve to distinct handles instead of surfacing a 500.
router.post("/creators", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName) {
    res.status(400).json({ error: "displayName is required" });
    return;
  }

  const requested =
    typeof body.handle === "string" && body.handle.trim()
      ? body.handle
      : displayName;
  const base = slugifyHandle(requested);

  for (let attempt = 0; attempt < 100; attempt++) {
    const handle = handleCandidate(base, attempt);
    try {
      const [created] = await db
        .insert(creatorsTable)
        .values({
          handle,
          displayName,
          avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent(handle)}`,
          ownerUserId: req.userId!,
        })
        .returning();
      res.status(201).json(toCreatorDto(created));
      return;
    } catch (err) {
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }

  res.status(409).json({ error: "Could not allocate a unique handle" });
});

// Creators owned by the signed-in user. Drives the dashboard so a creator
// manages their own page(s) instead of picking from a global operator list.
router.get("/me/creators", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.ownerUserId, req.userId!))
    .orderBy(desc(creatorsTable.createdAt));
  res.json(rows.map(toCreatorDto));
});

router.get("/creators/:handle", async (req, res) => {
  // @ts-ignore
  const handle = req.params.handle as string;
  const [row] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.handle, handle))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const creator = await refreshFollowersIfStale(row);
  res.json(toCreatorDto(creator));
});

router.get("/creators/:handle/videos", async (req, res) => {
  // @ts-ignore
  const handle = req.params.handle as string;
  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.handle, handle))
    .limit(1);
  if (!creator) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  // Include both lead-owned videos and collab appearances so a creator's
  // public profile shows every drop they earn a split from.
  const participantVideoIds = (
    await db
      .select({ videoId: videoParticipantsTable.videoId })
      .from(videoParticipantsTable)
      .where(eq(videoParticipantsTable.creatorId, creator.id))
  ).map((r) => r.videoId);

  const rows = await db
    .select({ v: videosTable, c: creatorsTable })
    .from(videosTable)
    .innerJoin(creatorsTable, eq(videosTable.creatorId, creatorsTable.id))
    .where(
      participantVideoIds.length > 0
        ? or(
            eq(videosTable.creatorId, creator.id),
            inArray(videosTable.id, participantVideoIds),
          )
        : eq(videosTable.creatorId, creator.id),
    )
    .orderBy(desc(videosTable.createdAt));
  res.json({ items: await buildFeedItems(rows, null) });
});

// Only allow web links. Blocks javascript:/data: and other schemes that would
// be unsafe when rendered as anchor hrefs on the public profile card.
function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizePlatformLinks(input: unknown): PlatformLink[] | null {
  if (!Array.isArray(input)) return null;
  const out: PlatformLink[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const label = (raw as Record<string, unknown>).label;
    const url = (raw as Record<string, unknown>).url;
    if (typeof label !== "string" || typeof url !== "string") return null;
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    if (!trimmedLabel || !trimmedUrl) continue;
    if (!isSafeHttpUrl(trimmedUrl)) return null;
    out.push({ label: trimmedLabel, url: trimmedUrl });
  }
  return out;
}

router.patch("/creators/:handle/profile", requireAuth, async (req, res) => {
  const handle = req.params.handle as string;
  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.handle, handle))
    .limit(1);
  if (!creator) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const ownership = checkOwnership(creator, req.userId!);
  if (!ownership.allowed) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: Partial<typeof creatorsTable.$inferInsert> = {};
  if (ownership.claim) updates.ownerUserId = req.userId!;

  if ("bio" in body) {
    updates.bio = body.bio === null ? null : String(body.bio);
  }
  if ("platformLinks" in body) {
    const links = sanitizePlatformLinks(body.platformLinks);
    if (links === null) {
      res.status(400).json({ error: "platformLinks must be {label,url} objects" });
      return;
    }
    updates.platformLinks = links;
  }
  if ("xHandle" in body) {
    updates.xHandle =
      body.xHandle === null || body.xHandle === ""
        ? null
        : String(body.xHandle).replace(/^@/, "").trim();
  }
  if ("followerCount" in body) {
    if (body.followerCount === null) {
      updates.followerCount = null;
    } else {
      const n = Number(body.followerCount);
      if (!Number.isFinite(n) || n < 0) {
        res.status(400).json({ error: "followerCount must be a positive number" });
        return;
      }
      updates.followerCount = Math.floor(n);
      updates.followersUpdatedAt = new Date();
    }
  }
  if ("lastTestedAt" in body) {
    if (body.lastTestedAt === null || body.lastTestedAt === "") {
      updates.lastTestedAt = null;
    } else {
      const d = new Date(String(body.lastTestedAt));
      if (Number.isNaN(d.getTime())) {
        res.status(400).json({ error: "lastTestedAt must be a valid date" });
        return;
      }
      updates.lastTestedAt = d;
    }
  }
  if ("testingVerified" in body) {
    updates.testingVerified = Boolean(body.testingVerified);
  }
  if ("collabFastUrl" in body) {
    if (body.collabFastUrl === null || body.collabFastUrl === "") {
      updates.collabFastUrl = null;
    } else {
      const trimmed = String(body.collabFastUrl).trim();
      if (!isSafeHttpUrl(trimmed)) {
        res.status(400).json({ error: "collabFastUrl must be an http(s) URL" });
        return;
      }
      updates.collabFastUrl = trimmed;
    }
  }

  if (Object.keys(updates).length === 0) {
    res.json(toCreatorDto(creator));
    return;
  }

  const [updated] = await db
    .update(creatorsTable)
    .set(updates)
    .where(and(eq(creatorsTable.id, creator.id), ownershipGuard(req.userId!)))
    .returning();
  if (!updated) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }
  res.json(toCreatorDto(updated));
});

router.post(
  "/creators/:handle/refresh-followers",
  requireAuth,
  async (req, res) => {
    const handle = req.params.handle as string;
    const [creator] = await db
      .select()
      .from(creatorsTable)
      .where(eq(creatorsTable.handle, handle))
      .limit(1);
    if (!creator) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const ownership = checkOwnership(creator, req.userId!);
    if (!ownership.allowed) {
      res.status(403).json({ error: "You do not own this creator profile" });
      return;
    }
    if (!creator.xHandle) {
      res.status(400).json({ error: "No X handle set for this creator" });
      return;
    }

    const result = await fetchXFollowers(creator.xHandle);
    if (!result.ok) {
      const message =
        result.reason === "no-token"
          ? "X API token not configured — enter followers manually"
          : result.reason === "not-found"
            ? "X account not found"
            : "X API request failed";
      res.status(502).json({ error: message });
      return;
    }

    const setData: Partial<typeof creatorsTable.$inferInsert> = {
      followerCount: result.followers,
      followersUpdatedAt: new Date(),
    };
    if (ownership.claim) setData.ownerUserId = req.userId!;
    const [updated] = await db
      .update(creatorsTable)
      .set(setData)
      .where(and(eq(creatorsTable.id, creator.id), ownershipGuard(req.userId!)))
      .returning();
    if (!updated) {
      res.status(403).json({ error: "You do not own this creator profile" });
      return;
    }
    res.json(toCreatorDto(updated));
  },
);

// CollabFast link is private to creators/pornstars. Only an authenticated user
// who owns at least one creator profile may read it; fans get 403.
router.get("/creators/:handle/collab", requireAuth, async (req, res) => {
  const handle = req.params.handle as string;
  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.handle, handle))
    .limit(1);
  if (!creator) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const isCreator = await userOwnsAnyCreator(req.userId!);
  if (!isCreator) {
    res.status(403).json({ error: "Only creators can view collab links" });
    return;
  }
  res.json({ collabFastUrl: creator.collabFastUrl ?? null });
});

export default router;
