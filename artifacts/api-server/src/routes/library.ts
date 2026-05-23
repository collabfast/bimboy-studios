import { Router, type IRouter } from "express";
import {
  db,
  videosTable,
  creatorsTable,
  purchasesTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { buildFeedItems } from "../lib/feed-items";

const router: IRouter = Router();

router.get("/library", async (req, res) => {
  // @ts-ignore
  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
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
