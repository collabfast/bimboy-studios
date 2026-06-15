import { Router, type IRouter } from "express";
import {
  db,
  creatorsTable,
  videosTable,
  earningsTable,
  payoutsTable,
} from "@workspace/db";
import { and, eq, gte, lte, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

async function resolveCreator(handleOrId: string) {
  const [byHandle] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.handle, handleOrId))
    .limit(1);
  if (byHandle) return byHandle;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    handleOrId,
  );
  if (!isUuid) return undefined;
  const [byId] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.id, handleOrId))
    .limit(1);
  return byId;
}

// Earnings and payouts are financial data: only the user who owns the creator
// (ownerUserId === sub) may read or act on them. Unlike profile edits there is
// no claim-on-first-edit here — money endpoints never establish ownership.
function ownsCreator(
  creator: { ownerUserId: string | null },
  userId: string,
): boolean {
  return creator.ownerUserId === userId;
}

// GET /creators/:handle/earnings — lifetime + available balance with a
// per-video breakdown. Only the creator's owner may read it.
router.get("/creators/:handle/earnings", requireAuth, async (req, res) => {
  const creator = await resolveCreator(req.params.handle as string);
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  if (!ownsCreator(creator, req.userId!)) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }

  const [totals] = await db
    .select({
      totalCents: sql<number>`coalesce(sum(${earningsTable.amountCents}), 0)::int`,
    })
    .from(earningsTable)
    .where(and(eq(earningsTable.creatorId, creator.id), eq(earningsTable.kind, "creator")));

  const [paid] = await db
    .select({
      paidCents: sql<number>`coalesce(sum(${payoutsTable.amountCents}), 0)::int`,
    })
    .from(payoutsTable)
    .where(eq(payoutsTable.creatorId, creator.id));

  const byVideo = await db
    .select({
      videoId: earningsTable.videoId,
      title: videosTable.title,
      postType: videosTable.postType,
      amountCents: sql<number>`coalesce(sum(${earningsTable.amountCents}), 0)::int`,
      purchases: sql<number>`count(*)::int`,
    })
    .from(earningsTable)
    .innerJoin(videosTable, eq(videosTable.id, earningsTable.videoId))
    .where(and(eq(earningsTable.creatorId, creator.id), eq(earningsTable.kind, "creator")))
    .groupBy(earningsTable.videoId, videosTable.title, videosTable.postType)
    .orderBy(desc(sql`sum(${earningsTable.amountCents})`));

  const totalEarnedCents = totals?.totalCents ?? 0;
  const paidOutCents = paid?.paidCents ?? 0;

  res.json({
    creatorId: creator.id,
    handle: creator.handle,
    totalEarnedCents,
    paidOutCents,
    availableCents: totalEarnedCents - paidOutCents,
    byVideo,
  });
});

// GET /creators/:handle/payouts — payout history.
router.get("/creators/:handle/payouts", requireAuth, async (req, res) => {
  const creator = await resolveCreator(req.params.handle as string);
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  if (!ownsCreator(creator, req.userId!)) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }
  const rows = await db
    .select()
    .from(payoutsTable)
    .where(eq(payoutsTable.creatorId, creator.id))
    .orderBy(desc(payoutsTable.createdAt));
  res.json(
    rows.map((p) => ({
      id: p.id,
      creatorId: p.creatorId,
      amountCents: p.amountCents,
      status: p.status,
      provider: p.provider,
      providerRef: p.providerRef,
      periodStart: p.periodStart?.toISOString() ?? null,
      periodEnd: p.periodEnd?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

// POST /creators/:handle/payouts — request a payout of the available balance.
// Created in "pending" state; no money moves until a processor is connected.
router.post("/creators/:handle/payouts", requireAuth, async (req, res) => {
  const creator = await resolveCreator(req.params.handle as string);
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  if (!ownsCreator(creator, req.userId!)) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }

  const [totals] = await db
    .select({
      totalCents: sql<number>`coalesce(sum(${earningsTable.amountCents}), 0)::int`,
    })
    .from(earningsTable)
    .where(and(eq(earningsTable.creatorId, creator.id), eq(earningsTable.kind, "creator")));
  const [paid] = await db
    .select({
      paidCents: sql<number>`coalesce(sum(${payoutsTable.amountCents}), 0)::int`,
    })
    .from(payoutsTable)
    .where(eq(payoutsTable.creatorId, creator.id));

  const available = (totals?.totalCents ?? 0) - (paid?.paidCents ?? 0);
  const requested =
    typeof req.body?.amountCents === "number" ? req.body.amountCents : available;

  if (requested <= 0) {
    res.status(400).json({ error: "No funds available for payout" });
    return;
  }
  if (requested > available) {
    res.status(400).json({ error: "Requested amount exceeds available balance" });
    return;
  }

  const [payout] = await db
    .insert(payoutsTable)
    .values({
      creatorId: creator.id,
      amountCents: requested,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    id: payout.id,
    creatorId: payout.creatorId,
    amountCents: payout.amountCents,
    status: payout.status,
    statusLabel: "pending — awaiting processor",
    createdAt: payout.createdAt.toISOString(),
  });
});

// GET /rankings/creators?from=&to= — leaderboard by creator earnings.
router.get("/rankings/creators", async (req, res) => {
  const { from, to } = req.query;
  const conds = [eq(earningsTable.kind, "creator")];
  if (typeof from === "string" && !Number.isNaN(Date.parse(from))) {
    conds.push(gte(earningsTable.createdAt, new Date(from)));
  }
  if (typeof to === "string" && !Number.isNaN(Date.parse(to))) {
    conds.push(lte(earningsTable.createdAt, new Date(to)));
  }

  const rows = await db
    .select({
      creatorId: creatorsTable.id,
      handle: creatorsTable.handle,
      displayName: creatorsTable.displayName,
      avatarUrl: creatorsTable.avatarUrl,
      revenueCents: sql<number>`coalesce(sum(${earningsTable.amountCents}), 0)::int`,
      purchases: sql<number>`count(*)::int`,
    })
    .from(earningsTable)
    .innerJoin(creatorsTable, eq(creatorsTable.id, earningsTable.creatorId))
    .where(and(...conds))
    .groupBy(creatorsTable.id, creatorsTable.handle, creatorsTable.displayName, creatorsTable.avatarUrl)
    .orderBy(desc(sql`sum(${earningsTable.amountCents})`));

  res.json(rows.map((r, i) => ({ rank: i + 1, ...r })));
});

export default router;
