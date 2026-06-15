import { Router, type IRouter } from "express";
import {
  db,
  purchasesTable,
  videosTable,
  videoParticipantsTable,
  earningsTable,
  videoEventsTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth";
import { computeRevenueSplit } from "../lib/revenue";

const router: IRouter = Router();

router.post("/purchases", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const videoId = req.body?.videoId as string;
  if (!videoId) {
    res.status(400).json({ error: "videoId required" });
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

    // The purchase, its earnings ledger fan-out, and the conversion event are
    // written atomically: a purchase must never exist without its split rows.
    const parts = await db
      .select({
        creatorId: videoParticipantsTable.creatorId,
        splitBps: videoParticipantsTable.splitBps,
      })
      .from(videoParticipantsTable)
      .where(eq(videoParticipantsTable.videoId, video.id));

    const split = computeRevenueSplit(video.priceCents, video.postType, parts);

    purchase = await db.transaction(async (tx) => {
      const [inserted] = await tx
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

      const rows = split.creators.map((c) => ({
        purchaseId: inserted.id,
        videoId: video.id,
        creatorId: c.creatorId,
        kind: "creator",
        amountCents: c.amountCents,
        splitBps: c.splitBps,
      }));
      if (split.platformCents > 0 || rows.length === 0) {
        rows.push({
          purchaseId: inserted.id,
          videoId: video.id,
          creatorId: null as unknown as string,
          kind: "platform",
          amountCents: split.platformCents,
          splitBps: split.platformBps,
        });
      }
      await tx.insert(earningsTable).values(rows);

      await tx.insert(videoEventsTable).values({
        videoId: video.id,
        userId,
        type: "purchase",
      });
      return inserted;
    });
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

router.get("/purchases/me", requireAuth, async (req, res) => {
  const userId = req.userId!;
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
