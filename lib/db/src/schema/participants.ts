import {
  pgTable,
  integer,
  timestamp,
  uuid,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { videosTable } from "./videos";
import { creatorsTable } from "./creators";

// Multi-creator collaboration: every verified creator appearing in a video
// earns an automatic revenue share. Splits expressed as basis points
// (0-10000) so they sum to exactly 10000 without floating-point drift.
export const videoParticipantsTable = pgTable(
  "video_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creatorsTable.id, { onDelete: "cascade" }),
    splitBps: integer("split_bps").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    unq: unique().on(t.videoId, t.creatorId),
    splitRange: check(
      "video_participants_split_bps_range",
      sql`${t.splitBps} BETWEEN 0 AND 10000`,
    ),
  }),
);

export const insertVideoParticipantSchema = createInsertSchema(
  videoParticipantsTable,
).omit({ id: true, createdAt: true });
export type InsertVideoParticipant = z.infer<typeof insertVideoParticipantSchema>;
export type VideoParticipant = typeof videoParticipantsTable.$inferSelect;
