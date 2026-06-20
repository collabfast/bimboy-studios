import { Router, type IRouter } from "express";
import { createHash, randomBytes } from "node:crypto";
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
import {
  createSession,
  getDiditConfig,
  DiditNotConfiguredError,
} from "../lib/didit";
import {
  sendVerificationEmail,
  ResendNotConfiguredError,
} from "../lib/resend";

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

// Lightweight email validation — good enough to reject obvious garbage before
// we attempt delivery. Resend performs the authoritative check.
function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (!email || email.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashEmailToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Build the confirmation link the creator clicks. `appUrl` is the client's own
// origin + base path (so the link lands inside the app in dev at the root and
// in prod under /bimboy-studios/). Falls back to the dev domain root.
function buildVerifyLink(appUrl: unknown, token: string): string {
  let base: string | null = null;
  if (typeof appUrl === "string" && isSafeHttpUrl(appUrl)) {
    base = appUrl.replace(/\/+$/, "");
  } else {
    const devDomain = process.env["REPLIT_DEV_DOMAIN"];
    if (devDomain) base = `https://${devDomain}`;
  }
  if (!base) return "";
  return `${base}/verify-email?token=${encodeURIComponent(token)}`;
}

// Persist a fresh verification token + expiry for the creator, then send the
// confirmation email. Throws ResendNotConfiguredError or a generic Error when
// delivery fails (callers decide whether that should be fatal).
async function startEmailVerification(
  creatorId: string,
  email: string,
  appUrl: unknown,
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  // Build the link first and fail closed: if we can't produce a working
  // confirmation URL, don't persist a token or send a broken email.
  const link = buildVerifyLink(appUrl, token);
  if (!link) {
    throw new Error("Could not build a verification link (missing app URL).");
  }

  await db
    .update(creatorsTable)
    .set({
      email,
      emailVerified: false,
      emailVerificationTokenHash: hashEmailToken(token),
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS),
    })
    .where(eq(creatorsTable.id, creatorId));

  await sendVerificationEmail(email, link);
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

  const xHandle =
    typeof body.xHandle === "string" && body.xHandle.trim()
      ? body.xHandle.replace(/^@/, "").trim()
      : null;

  // Email is optional. When present it is saved on the new profile (unverified)
  // and a confirmation email is sent. A delivery failure must not block profile
  // creation, so it is logged and swallowed — the creator can resend later.
  const email = body.email == null ? null : normalizeEmail(body.email);
  if (body.email != null && body.email !== "" && email == null) {
    res.status(400).json({ error: "Please enter a valid email address" });
    return;
  }

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
          xHandle,
          email,
        })
        .returning();

      if (email) {
        try {
          await startEmailVerification(created.id, email, body.appUrl);
        } catch (err) {
          req.log?.warn(
            { err: (err as Error).message, creatorId: created.id },
            "Could not send confirmation email at signup",
          );
        }
      }

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

// Read the creator's contact email and verification state. Owner-only — email
// is private PII and must never appear on the public creator profile surface.
router.get("/creators/:handle/email", requireAuth, async (req, res) => {
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
  if (creator.ownerUserId !== req.userId) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }
  res.json({
    email: creator.email ?? null,
    emailVerified: creator.emailVerified,
  });
});

// Set or update the creator's contact email and (re)send the confirmation
// email. Owner-only. Saving and sending happen together so the UI's "resend"
// button can reuse this with the same email.
router.post("/creators/:handle/email", requireAuth, async (req, res) => {
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
  if (creator.ownerUserId !== req.userId) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(body.email);
  if (!email) {
    res.status(400).json({ error: "Please enter a valid email address" });
    return;
  }

  try {
    await startEmailVerification(creator.id, email, body.appUrl);
  } catch (err) {
    if (err instanceof ResendNotConfiguredError) {
      res.status(502).json({
        error:
          "Email delivery is not configured yet. Your email was saved; please try again later.",
      });
      return;
    }
    req.log?.error(
      { err: (err as Error).message },
      "Confirmation email delivery failed",
    );
    res.status(502).json({
      error: "Could not send the confirmation email. Please try again.",
    });
    return;
  }

  res.json({ email, emailVerified: false });
});

// Public: confirm an email from the link in the confirmation message. The raw
// token is matched against the stored sha256 hash and must not be expired.
// Idempotent-ish: a second click on a consumed token returns verified=false.
router.post("/email/verify", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    res.status(400).json({ error: "A token is required" });
    return;
  }

  const tokenHash = hashEmailToken(token);
  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.emailVerificationTokenHash, tokenHash))
    .limit(1);

  if (
    !creator ||
    !creator.emailVerificationExpiresAt ||
    creator.emailVerificationExpiresAt.getTime() < Date.now()
  ) {
    res.json({ verified: false, handle: null });
    return;
  }

  await db
    .update(creatorsTable)
    .set({
      emailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    })
    .where(eq(creatorsTable.id, creator.id));

  res.json({ verified: true, handle: creator.handle });
});

router.get("/creators/:handle/verification", requireAuth, async (req, res) => {
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
  if (creator.ownerUserId !== req.userId) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }
  res.json({
    status: toCreatorDto(creator).idVerificationStatus,
    sessionId: creator.diditSessionId ?? null,
  });
});

// Start a Didit ID-verification session for the creator and return the hosted
// URL to redirect the owner to. The authoritative result arrives later via the
// signed webhook; here we only flip the status to "pending" and persist the
// session id. Owner-only.
router.post(
  "/creators/:handle/verification/session",
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
    if (creator.ownerUserId !== req.userId) {
      res.status(403).json({ error: "You do not own this creator profile" });
      return;
    }

    if (!getDiditConfig()) {
      res.status(502).json({
        error:
          "Identity verification is not configured yet. Please try again later.",
      });
      return;
    }

    // Send the browser back to the app after the hosted flow. The client passes
    // its own origin + base path (so the redirect lands correctly in dev at the
    // root and in prod under /bimboy-studios/). Fall back to the dev domain.
    const body = (req.body ?? {}) as Record<string, unknown>;
    const requestedCallback =
      typeof body.callbackUrl === "string" && isSafeHttpUrl(body.callbackUrl)
        ? body.callbackUrl
        : null;
    const devDomain = process.env["REPLIT_DEV_DOMAIN"];
    const fallbackCallback = devDomain
      ? `https://${devDomain}/dashboard/profile?verify=return`
      : undefined;
    const callbackUrl = requestedCallback ?? fallbackCallback;
    if (!callbackUrl) {
      res.status(400).json({ error: "A callbackUrl is required" });
      return;
    }

    try {
      const { sessionId, url } = await createSession({
        vendorData: creator.id,
        callbackUrl,
      });
      const [updated] = await db
        .update(creatorsTable)
        .set({ idVerificationStatus: "pending", diditSessionId: sessionId })
        .where(eq(creatorsTable.id, creator.id))
        .returning();
      res.json({
        url,
        status: updated
          ? toCreatorDto(updated).idVerificationStatus
          : "pending",
      });
    } catch (err) {
      if (err instanceof DiditNotConfiguredError) {
        res.status(502).json({
          error:
            "Identity verification is not configured yet. Please try again later.",
        });
        return;
      }
      req.log?.error(
        { err: (err as Error).message },
        "Didit session creation failed",
      );
      res.status(502).json({
        error: "Could not start identity verification. Please try again.",
      });
    }
  },
);

export default router;
