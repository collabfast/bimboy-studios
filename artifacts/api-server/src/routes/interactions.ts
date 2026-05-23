import { Router, type IRouter } from "express";
import { db, likesTable, savesTable, videosTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function toggle(
  table: typeof likesTable | typeof savesTable,
  videoId: string,
  userId: string,
  counterCol: "likesCount" | "savesCount",
) {
  const [video] = await db
    .select({ id: videosTable.id })
    .from(videosTable)
    .where(eq(videosTable.id, videoId))
    .limit(1);
  if (!video) return null;

  const existing = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.videoId, videoId), eq(table.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(table).where(eq(table.id, existing[0].id));
    await db
      .update(videosTable)
      .set({ [counterCol]: sql`GREATEST(${videosTable[counterCol]} - 1, 0)` } as any)
      .where(eq(videosTable.id, videoId));
  } else {
    await db.insert(table).values({ videoId, userId });
    await db
      .update(videosTable)
      .set({ [counterCol]: sql`${videosTable[counterCol]} + 1` } as any)
      .where(eq(videosTable.id, videoId));
  }

  const [v] = await db
    .select({ likesCount: videosTable.likesCount, savesCount: videosTable.savesCount })
    .from(videosTable)
    .where(eq(videosTable.id, videoId))
    .limit(1);

  return {
    active: existing.length === 0,
    count: counterCol === "likesCount" ? v?.likesCount ?? 0 : v?.savesCount ?? 0,
  };
}

router.post("/videos/:videoId/like", async (req, res) => {
  // @ts-ignore
  const videoId = req.params.videoId as string;
  const userId = req.body?.userId as string;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const out = await toggle(likesTable, videoId, userId, "likesCount");
  if (!out) { res.status(404).json({ error: "Video not found" }); return; }
  res.json(out);
});

router.post("/videos/:videoId/save", async (req, res) => {
  // @ts-ignore
  const videoId = req.params.videoId as string;
  const userId = req.body?.userId as string;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const out = await toggle(savesTable, videoId, userId, "savesCount");
  if (!out) { res.status(404).json({ error: "Video not found" }); return; }
  res.json(out);
});

export default router;
