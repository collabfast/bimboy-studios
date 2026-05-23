import { Router, type IRouter } from "express";
import {
  db,
  creatorsTable,
  videosTable,
  videoParticipantsTable,
} from "@workspace/db";
import { eq, desc, or, inArray } from "drizzle-orm";
import { buildFeedItems } from "../lib/feed-items";

const router: IRouter = Router();

router.get("/creators", async (_req, res) => {
  const rows = await db.select().from(creatorsTable).limit(50);
  res.json(
    rows.map((c) => ({
      id: c.id,
      handle: c.handle,
      displayName: c.displayName,
      avatarUrl: c.avatarUrl,
      bio: c.bio,
      verified: c.verified,
    })),
  );
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
  res.json({
    id: row.id,
    handle: row.handle,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    verified: row.verified,
  });
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

export default router;
