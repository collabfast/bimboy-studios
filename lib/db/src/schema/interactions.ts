import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { videosTable } from "./videos";

export const likesTable = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ unq: unique().on(t.userId, t.videoId) }),
);

export const savesTable = pgTable(
  "saves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videosTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ unq: unique().on(t.userId, t.videoId) }),
);
