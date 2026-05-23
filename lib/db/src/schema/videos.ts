import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { creatorsTable } from "./creators";

export const videosTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creatorsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  teaserUrl: text("teaser_url").notNull(),
  fullUrl: text("full_url").notNull(),
  posterUrl: text("poster_url"),
  gradient: text("gradient").notNull().default("linear-gradient(135deg,#ff2d87,#7c2bff)"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  priceCents: integer("price_cents").notNull().default(0),
  likesCount: integer("likes_count").notNull().default(0),
  savesCount: integer("saves_count").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  savesCount: true,
});
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;
