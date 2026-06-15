import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { videosTable } from "./videos";

// Analytics event stream. Powers conversion ratios (teaser_click vs purchase)
// and date-windowed performance views. The purchases table remains the source
// of truth for unlock state; a "purchase" event is logged here too so a single
// stream can express the full funnel.
export const videoEventsTable = pgTable(
  "video_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    userId: text("user_id"),
    // "teaser_click" | "view" | "purchase"
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    byVideo: index("video_events_video_idx").on(t.videoId, t.type),
  }),
);

export const insertVideoEventSchema = createInsertSchema(videoEventsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertVideoEvent = z.infer<typeof insertVideoEventSchema>;
export type VideoEvent = typeof videoEventsTable.$inferSelect;
