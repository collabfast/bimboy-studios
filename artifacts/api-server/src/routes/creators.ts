import { Router, type IRouter } from "express";
import { db, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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

export default router;
