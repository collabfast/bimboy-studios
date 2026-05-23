import { Router, type IRouter } from "express";
import { db, purchasesTable, videosTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/purchases", async (req, res) => {
  const userId = req.body?.userId as string;
  const videoId = req.body?.videoId as string;
  if (!userId || !videoId) {
    res.status(400).json({ error: "userId and videoId required" });
    return;
  }

  const [video] = await db
    .select()
    .from(videosTable)
    .where(eq(videosTable.id, videoId))
    .limit(1);
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  const existing = await db
    .select()
    .from(purchasesTable)
    .where(and(eq(purchasesTable.userId, userId), eq(purchasesTable.videoId, videoId)))
    .limit(1);

  let purchase = existing[0];
  if (!purchase) {
    // Placeholder CCBill — record an immediate success. Real integration would
    // create a CCBill FlexForm session and complete via webhook.
    const providerRef = `ccbill_placeholder_${randomUUID()}`;
    const [inserted] = await db
      .insert(purchasesTable)
      .values({
        userId,
        videoId,
        amountCents: video.priceCents,
        provider: "ccbill_placeholder",
        providerRef,
        status: "succeeded",
      })
      .returning();
    purchase = inserted;
  }

  res.json({
    purchase: {
      id: purchase.id,
      userId: purchase.userId,
      videoId: purchase.videoId,
      amountCents: purchase.amountCents,
      provider: purchase.provider,
      providerRef: purchase.providerRef,
      status: purchase.status,
      createdAt: purchase.createdAt.toISOString(),
    },
    // In real CCBill: this would be the FlexForm URL the client redirects to.
    redirectUrl: `ccbill://placeholder/${purchase.providerRef}`,
  });
});

router.get("/purchases/me", async (req, res) => {
  // @ts-ignore
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const rows = await db
    .select()
    .from(purchasesTable)
    .where(eq(purchasesTable.userId, userId));
  res.json(
    rows.map((p) => ({
      id: p.id,
      userId: p.userId,
      videoId: p.videoId,
      amountCents: p.amountCents,
      provider: p.provider,
      providerRef: p.providerRef,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

export default router;
