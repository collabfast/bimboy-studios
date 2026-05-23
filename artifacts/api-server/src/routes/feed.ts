import { Router, type IRouter } from "express";
import { db, videosTable, creatorsTable, purchasesTable, likesTable, savesTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";

const router: IRouter = Router();

router.get("/feed", async (req, res) => {
  // @ts-ignore
  const rawLimit = Number(req.query.limit ?? 20);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, Math.floor(rawLimit)))
    : 20;
  // NOTE: MVP — `userId` is trusted from the client. Supabase auth is planned
  // to replace this with a server-derived identity before launch.
  // @ts-ignore
  const userId = typeof req.query.userId === "string" ? req.query.userId : null;

  const rows = await db
    .select({
      v: videosTable,
      c: creatorsTable,
    })
    .from(videosTable)
    .innerJoin(creatorsTable, eq(videosTable.creatorId, creatorsTable.id))
    .orderBy(desc(videosTable.likesCount), desc(videosTable.createdAt))
    .limit(limit);

  const videoIds = rows.map((r) => r.v.id);
  let unlockedSet = new Set<string>();
  let likedSet = new Set<string>();
  let savedSet = new Set<string>();

  if (userId && videoIds.length > 0) {
    const [purchases, likes, saves] = await Promise.all([
      db
        .select({ videoId: purchasesTable.videoId })
        .from(purchasesTable)
        .where(eq(purchasesTable.userId, userId)),
      db
        .select({ videoId: likesTable.videoId })
        .from(likesTable)
        .where(eq(likesTable.userId, userId)),
      db
        .select({ videoId: savesTable.videoId })
        .from(savesTable)
        .where(eq(savesTable.userId, userId)),
    ]);
    unlockedSet = new Set(purchases.map((p) => p.videoId));
    likedSet = new Set(likes.map((l) => l.videoId));
    savedSet = new Set(saves.map((s) => s.videoId));
  }

  res.json({
    items: rows.map(({ v, c }) => ({
      id: v.id,
      title: v.title,
      teaserUrl: v.teaserUrl,
      fullUrl: v.fullUrl,
      posterUrl: v.posterUrl,
      gradient: v.gradient,
      durationSeconds: v.durationSeconds,
      priceCents: v.priceCents,
      likesCount: v.likesCount,
      savesCount: v.savesCount,
      tags: v.tags ?? [],
      creator: {
        id: c.id,
        handle: c.handle,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl,
        bio: c.bio,
        verified: c.verified,
      },
      unlocked: unlockedSet.has(v.id),
      liked: likedSet.has(v.id),
      saved: savedSet.has(v.id),
    })),
  });
});

export default router;
