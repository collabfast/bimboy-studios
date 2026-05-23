import { Router, type IRouter } from "express";
import { db, videosTable, creatorsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { buildFeedItems } from "../lib/feed-items";
import { optionalAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/feed", optionalAuth, async (req, res) => {
  const rawLimit = Number(req.query["limit"] ?? 20);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, Math.floor(rawLimit)))
    : 20;
  const userId = req.userId ?? null;

  const rows = await db
    .select({ v: videosTable, c: creatorsTable })
    .from(videosTable)
    .innerJoin(creatorsTable, eq(videosTable.creatorId, creatorsTable.id))
    .orderBy(desc(videosTable.likesCount), desc(videosTable.createdAt))
    .limit(limit);

  res.json({ items: await buildFeedItems(rows, userId) });
});

export default router;
