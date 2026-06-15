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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCreatorSchema = createInsertSchema(creatorsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creatorsTable.$inferSelect;
