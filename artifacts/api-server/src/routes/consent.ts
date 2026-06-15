import { Router, type IRouter } from "express";
import {
  db,
  videosTable,
  consentDocumentsTable,
  videoParticipantsTable,
} from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

// POST /videos/:videoId/consent-documents — record a consent doc after the
// file has been uploaded to object storage via the presigned URL flow.
router.post("/videos/:videoId/consent-documents", requireAuth, async (req, res) => {
  const videoId = req.params.videoId as string;
  const { fileUrl, fileName, contentType, creatorId } = req.body ?? {};

  if (!fileUrl || !fileName || !contentType) {
    res.status(400).json({ error: "fileUrl, fileName and contentType are required" });
    return;
  }

  const [video] = await db
    .select({ id: videosTable.id })
    .from(videosTable)
    .where(eq(videosTable.id, videoId))
    .limit(1);
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }

  // A doc tied to a specific creator must reference a participant of this video.
  if (creatorId) {
    const [participant] = await db
      .select({ id: videoParticipantsTable.id })
      .from(videoParticipantsTable)
      .where(
        and(
          eq(videoParticipantsTable.videoId, videoId),
          eq(videoParticipantsTable.creatorId, creatorId),
        ),
      )
      .limit(1);
    if (!participant) {
      res.status(400).json({ error: "creatorId is not a participant in this video" });
      return;
    }
  }

  // Normalize a raw GCS URL down to a stable /objects/<id> path.
  const objectPath = objectStorage.normalizeObjectEntityPath(fileUrl);

  const [doc] = await db
    .insert(consentDocumentsTable)
    .values({
      videoId,
      creatorId: creatorId ?? null,
      fileUrl: objectPath,
      fileName,
      contentType,
      uploadedBy: req.userId ?? null,
    })
    .returning();

  res.status(201).json({
    id: doc.id,
    videoId: doc.videoId,
    creatorId: doc.creatorId,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    contentType: doc.contentType,
    uploadedBy: doc.uploadedBy,
    createdAt: doc.createdAt.toISOString(),
  });
});

// GET /videos/:videoId/consent-documents — list recorded consent docs.
router.get("/videos/:videoId/consent-documents", requireAuth, async (req, res) => {
  const videoId = req.params.videoId as string;
  const rows = await db
    .select()
    .from(consentDocumentsTable)
    .where(eq(consentDocumentsTable.videoId, videoId))
    .orderBy(desc(consentDocumentsTable.createdAt));
  res.json(
    rows.map((d) => ({
      id: d.id,
      videoId: d.videoId,
      creatorId: d.creatorId,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      contentType: d.contentType,
      uploadedBy: d.uploadedBy,
      createdAt: d.createdAt.toISOString(),
    })),
  );
});

export default router;
