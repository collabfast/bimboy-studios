import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { creatorsTable } from "./creators";

// The two studio brands creators can apply to perform scenes for. Stored as a
// plain text column (not a pg enum) so adding a brand later is a code-only
// change; validated against this list in the API layer.
export const SCENE_BRANDS = ["backpackboys", "bimboys_badbitches"] as const;
export type SceneBrand = (typeof SCENE_BRANDS)[number];

// The two compensation options a performer can choose (Paradox Systems revenue
// model): a revenue-share deal or a flat appearance fee.
export const SCENE_PAYMENT_MODELS = ["revenue_share", "flat_fee"] as const;
export type ScenePaymentModel = (typeof SCENE_PAYMENT_MODELS)[number];

// Review lifecycle of an application.
export const SCENE_APPLICATION_STATUSES = [
  "pending",
  "approved",
  "declined",
] as const;
export type SceneApplicationStatus =
  (typeof SCENE_APPLICATION_STATUSES)[number];

// A creator's application to shoot scenes for one of the studio brands. Tied to
// a creator profile (the applicant must own the profile). Contact happens via
// the creator's existing profile/email, so no PII is duplicated here.
export const sceneApplicationsTable = pgTable("scene_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creatorsTable.id, { onDelete: "cascade" }),
  brand: text("brand").notNull(),
  paymentModel: text("payment_model").notNull(),
  // Free-text performer-supplied context.
  experience: text("experience"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SceneApplication = typeof sceneApplicationsTable.$inferSelect;
