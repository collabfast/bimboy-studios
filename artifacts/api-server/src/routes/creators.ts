import { Router, type IRouter } from "express";
import {
  db,
  creatorsTable,
  videosTable,
  videoParticipantsTable,
  type PlatformLink,
} from "@workspace/db";
import { eq, desc, or, inArray } from "drizzle-orm";
import { buildFeedItems, toCreatorDto } from "../lib/feed-items";
import { requireAuth } from "../middleware/auth";
import { fetchXFollowers } from "../lib/x-followers";

const router: IRouter = Router();

router.get("/creators", async (_req, res) => {
  const rows = await db.select().from(creatorsTable).limit(50);
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
  res.json(toCreatorDto(row));
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

  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: Partial<typeof creatorsTable.$inferInsert> = {};

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
    .where(eq(creatorsTable.id, creator.id))
    .returning();
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

    const [updated] = await db
      .update(creatorsTable)
      .set({ followerCount: result.followers, followersUpdatedAt: new Date() })
      .where(eq(creatorsTable.id, creator.id))
      .returning();
    res.json(toCreatorDto(updated));
  },
);

export default router;
