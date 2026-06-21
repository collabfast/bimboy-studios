import { Router, type IRouter } from "express";
import {
  db,
  creatorsTable,
  sceneApplicationsTable,
  SCENE_BRANDS,
  SCENE_PAYMENT_MODELS,
  SCENE_APPLICATION_STATUSES,
  type SceneApplication,
  type Creator,
} from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAuth, ensureAdmin } from "../middleware/auth";

const router: IRouter = Router();

// Public-facing shape of an application, enriched with the applying creator's
// public profile basics so the creator can see which profile applied.
function toDto(app: SceneApplication, creator: Creator) {
  return {
    id: app.id,
    creatorId: app.creatorId,
    handle: creator.handle,
    displayName: creator.displayName,
    avatarUrl: creator.avatarUrl,
    brand: app.brand,
    paymentModel: app.paymentModel,
    experience: app.experience,
    message: app.message,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

// Admin shape adds private contact details so reviewers can reach applicants.
function toAdminDto(app: SceneApplication, creator: Creator) {
  return {
    ...toDto(app, creator),
    contactEmail: creator.email ?? null,
    contactEmailVerified: creator.emailVerified,
    xHandle: creator.xHandle ?? null,
    followerCount: creator.followerCount ?? null,
  };
}

// POST /scene-applications — a signed-in creator applies for a brand/payment
// model using one of their owned profiles (identified by handle).
router.post("/scene-applications", requireAuth, async (req, res) => {
  const { handle, brand, paymentModel, experience, message } = req.body ?? {};

  if (!handle || typeof handle !== "string") {
    res.status(400).json({ error: "handle is required" });
    return;
  }
  if (!SCENE_BRANDS.includes(brand)) {
    res.status(400).json({ error: "Invalid brand" });
    return;
  }
  if (!SCENE_PAYMENT_MODELS.includes(paymentModel)) {
    res.status(400).json({ error: "Invalid paymentModel" });
    return;
  }

  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.handle, handle))
    .limit(1);
  if (!creator) {
    res.status(404).json({ error: "Creator profile not found" });
    return;
  }
  if (creator.ownerUserId !== req.userId) {
    res.status(403).json({ error: "You do not own this creator profile" });
    return;
  }

  const [app] = await db
    .insert(sceneApplicationsTable)
    .values({
      creatorId: creator.id,
      brand,
      paymentModel,
      experience: typeof experience === "string" && experience.trim() ? experience.trim() : null,
      message: typeof message === "string" && message.trim() ? message.trim() : null,
    })
    .returning();

  res.status(201).json(toDto(app, creator));
});

// GET /me/scene-applications — applications submitted via any profile the
// signed-in user owns.
router.get("/me/scene-applications", requireAuth, async (req, res) => {
  const owned = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.ownerUserId, req.userId!));
  if (owned.length === 0) {
    res.json([]);
    return;
  }
  const byId = new Map(owned.map((c) => [c.id, c]));
  const rows = await db
    .select()
    .from(sceneApplicationsTable)
    .where(inArray(sceneApplicationsTable.creatorId, [...byId.keys()]))
    .orderBy(desc(sceneApplicationsTable.createdAt));
  res.json(rows.map((app) => toDto(app, byId.get(app.creatorId)!)));
});

// GET /scene-applications — admin review queue across all creators.
router.get("/scene-applications", requireAuth, ensureAdmin, async (_req, res) => {
  const rows = await db
    .select({ app: sceneApplicationsTable, creator: creatorsTable })
    .from(sceneApplicationsTable)
    .innerJoin(creatorsTable, eq(sceneApplicationsTable.creatorId, creatorsTable.id))
    .orderBy(desc(sceneApplicationsTable.createdAt));
  res.json(rows.map(({ app, creator }) => toAdminDto(app, creator)));
});

// PATCH /scene-applications/:id — admin approves or declines an application.
router.patch(
  "/scene-applications/:id",
  requireAuth,
  ensureAdmin,
  async (req, res) => {
    const id = req.params.id as string;
    const { status } = req.body ?? {};
    if (!SCENE_APPLICATION_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [app] = await db
      .update(sceneApplicationsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(sceneApplicationsTable.id, id))
      .returning();
    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const [creator] = await db
      .select()
      .from(creatorsTable)
      .where(eq(creatorsTable.id, app.creatorId))
      .limit(1);
    res.json(toAdminDto(app, creator!));
  },
);

export default router;
