import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { videosTable } from "./videos";
import { creatorsTable } from "./creators";
import { purchasesTable } from "./purchases";

// Immutable ledger. Each successful purchase fans out into one row per
// beneficiary (every participating creator + the platform). The rows for a
// single purchase always sum to the purchase amount, so balances and
// statements can be derived purely from this table.
export const earningsTable = pgTable("earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: uuid("purchase_id")
    .notNull()
    .references(() => purchasesTable.id, { onDelete: "cascade" }),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videosTable.id, { onDelete: "cascade" }),
  // null when kind = "platform" (BackpackBoys cut).
  creatorId: uuid("creator_id").references(() => creatorsTable.id, {
    onDelete: "cascade",
  }),
  // "creator" = a participant's share, "platform" = BackpackBoys cut.
  kind: text("kind").notNull(),
  amountCents: integer("amount_cents").notNull(),
  // Basis points applied for this beneficiary (null for platform remainder).
  splitBps: integer("split_bps"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertEarningSchema = createInsertSchema(earningsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earningsTable.$inferSelect;
