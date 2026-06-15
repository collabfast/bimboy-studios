import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { videosTable } from "./videos";
import { creatorsTable } from "./creators";

// Consent / 2257-style documents (PDF or image) stored in object storage.
// fileUrl holds the normalized object path (e.g. "/objects/uploads/<id>").
export const consentDocumentsTable = pgTable("consent_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("video_id")
    .notNull()
    .references(() => videosTable.id, { onDelete: "cascade" }),
  // null = applies to the whole scene rather than a specific participant.
  creatorId: uuid("creator_id").references(() => creatorsTable.id, {
    onDelete: "set null",
  }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertConsentDocumentSchema = createInsertSchema(
  consentDocumentsTable,
).omit({ id: true, createdAt: true });
export type InsertConsentDocument = z.infer<typeof insertConsentDocumentSchema>;
export type ConsentDocument = typeof consentDocumentsTable.$inferSelect;
