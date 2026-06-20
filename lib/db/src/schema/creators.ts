import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type PlatformLink = {
  label: string;
  url: string;
};

export const creatorsTable = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  bio: text("bio"),
  verified: boolean("verified").notNull().default(false),
  ownerUserId: text("owner_user_id"),
  platformLinks: jsonb("platform_links")
    .$type<PlatformLink[]>()
    .notNull()
    .default([]),
  xHandle: text("x_handle"),
  followerCount: integer("follower_count"),
  followersUpdatedAt: timestamp("followers_updated_at", { withTimezone: true }),
  lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
  testingVerified: boolean("testing_verified").notNull().default(false),
  collabFastUrl: text("collab_fast_url"),
  // Didit ID/age (KYC) verification status — distinct from `verified` (creator
  // badge) and `testingVerified` (STI/health). The authoritative source of
  // truth is the signed Didit webhook; the hosted callback only nudges a refetch.
  // Values: not_started | pending | in_review | approved | declined.
  idVerificationStatus: text("id_verification_status")
    .notNull()
    .default("not_started"),
  // The most recent Didit session id created for this creator. Not sensitive
  // (no PII / document data is ever stored — only status + session id).
  diditSessionId: text("didit_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCreatorSchema = createInsertSchema(creatorsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creatorsTable.$inferSelect;
