import { Router, type IRouter } from "express";
import {
  db,
  videosTable,
  creatorsTable,
  purchasesTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { buildFeedItems } from "../lib/feed-items";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/library", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const rows = await db
    .select({ v: videosTable, c: creatorsTable })
    .from(purchasesTable)
    .innerJoin(videosTable, eq(purchasesTable.videoId, videosTable.id))
    .innerJoin(creatorsTable, eq(videosTable.creatorId, creatorsTable.id))
    .where(eq(purchasesTable.userId, userId))
    .orderBy(desc(purchasesTable.createdAt));

  res.json({ items: await buildFeedItems(rows, userId) });
});

export default router;
