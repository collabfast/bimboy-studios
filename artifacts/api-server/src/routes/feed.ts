import { Router, type IRouter } from "express";
import { db, videosTable, creatorsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { buildFeedItems } from "../lib/feed-items";

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
    .select({ v: videosTable, c: creatorsTable })
    .from(videosTable)
    .innerJoin(creatorsTable, eq(videosTable.creatorId, creatorsTable.id))
    .orderBy(desc(videosTable.likesCount), desc(videosTable.createdAt))
    .limit(limit);

  res.json({ items: await buildFeedItems(rows, userId) });
});

export default router;
