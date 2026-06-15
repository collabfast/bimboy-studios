import { Router, type IRouter } from "express";
import { db, videosTable, videoEventsTable, purchasesTable } from "@workspace/db";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { optionalAuth } from "../middleware/auth";

const router: IRouter = Router();

// Parse ?from / ?to ISO date query params into a Drizzle filter on createdAt.
function dateRange(column: PgColumn, from?: unknown, to?: unknown) {
  const conds = [];
  if (typeof from === "string" && !Number.isNaN(Date.parse(from))) {
    conds.push(gte(column, new Date(from)));
  }
  if (typeof to === "string" && !Number.isNaN(Date.parse(to))) {
    conds.push(lte(column, new Date(to)));
  }
  return conds;
}

// POST /videos/:videoId/events — log a teaser_click / view event.
router.post("/videos/:videoId/events", optionalAuth, async (req, res) => {
  const videoId = req.params.videoId as string;
  const type = req.body?.type as string;
  if (!["teaser_click", "view"].includes(type)) {
    res.status(400).json({ error: "type must be teaser_click or view" });
    return;
  }
  const [video] = await db
    .select({ id: videosTable.id })
    .from(videosTable)
    .where(eq(videosTable.id, videoId))
    .limit(1);
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  await db.insert(videoEventsTable).values({
    videoId,
    userId: req.userId ?? null,
    type,
  });
  res.json({ ok: true });
});

// GET /videos/stats?videoId=&from=&to= — funnel + revenue for one video.
router.get("/videos/stats", async (req, res) => {
  const videoId = req.query.videoId as string;
  const { from, to } = req.query;
  if (!videoId) {
    res.status(400).json({ error: "videoId query param required" });
    return;
  }

  const eventConds = [eq(videoEventsTable.videoId, videoId), ...dateRange(videoEventsTable.createdAt, from, to)];
  const eventRows = await db
    .select({ type: videoEventsTable.type, count: sql<number>`count(*)::int` })
    .from(videoEventsTable)
    .where(and(...eventConds))
    .groupBy(videoEventsTable.type);

  const counts: Record<string, number> = {};
  for (const r of eventRows) counts[r.type] = r.count;

  const purchaseConds = [
    eq(purchasesTable.videoId, videoId),
    eq(purchasesTable.status, "succeeded"),
    ...dateRange(purchasesTable.createdAt, from, to),
  ];
  const [purchaseAgg] = await db
    .select({
      purchases: sql<number>`count(*)::int`,
      grossCents: sql<number>`coalesce(sum(${purchasesTable.amountCents}), 0)::int`,
    })
    .from(purchasesTable)
    .where(and(...purchaseConds));

  const clicks = counts["teaser_click"] ?? 0;
  const views = counts["view"] ?? 0;
  const purchases = purchaseAgg?.purchases ?? 0;
  const grossRevenueCents = purchaseAgg?.grossCents ?? 0;
  const conversionRate = clicks > 0 ? purchases / clicks : 0;

  res.json({
    videoId,
    clicks,
    views,
    purchases,
    grossRevenueCents,
    conversionRate,
  });
});

export default router;
