import {
  db,
  videosTable,
  creatorsTable,
  purchasesTable,
  likesTable,
  savesTable,
  videoParticipantsTable,
  type Creator,
  type Video,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

type PlatformLinkDto = { label: string; url: string };

type CreatorDto = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string | null;
  verified: boolean;
  platformLinks: PlatformLinkDto[];
  xHandle: string | null;
  followerCount: number | null;
  followersUpdatedAt: string | null;
  lastTestedAt: string | null;
  testingVerified: boolean;
  collabFastUrl: string | null;
};

export function toCreatorDto(c: Creator): CreatorDto {
  return {
    id: c.id,
    handle: c.handle,
    displayName: c.displayName,
    avatarUrl: c.avatarUrl,
    bio: c.bio,
    verified: c.verified,
    platformLinks: c.platformLinks ?? [],
    xHandle: c.xHandle ?? null,
    followerCount: c.followerCount ?? null,
    followersUpdatedAt: c.followersUpdatedAt
      ? c.followersUpdatedAt.toISOString()
      : null,
    lastTestedAt: c.lastTestedAt ? c.lastTestedAt.toISOString() : null,
    testingVerified: c.testingVerified,
    collabFastUrl: c.collabFastUrl ?? null,
  };
}

export async function buildFeedItems(
  rows: Array<{ v: Video; c: Creator }>,
  userId: string | null,
) {
  const videoIds = rows.map((r) => r.v.id);
  if (videoIds.length === 0) return [];

  const [parts, unlocked, liked, saved] = await Promise.all([
    db
      .select({
        videoId: videoParticipantsTable.videoId,
        splitBps: videoParticipantsTable.splitBps,
        creator: creatorsTable,
      })
      .from(videoParticipantsTable)
      .innerJoin(
        creatorsTable,
        eq(videoParticipantsTable.creatorId, creatorsTable.id),
      )
      .where(inArray(videoParticipantsTable.videoId, videoIds)),
    userId
      ? db
          .select({ videoId: purchasesTable.videoId })
          .from(purchasesTable)
          .where(eq(purchasesTable.userId, userId))
      : Promise.resolve([] as { videoId: string }[]),
    userId
      ? db
          .select({ videoId: likesTable.videoId })
          .from(likesTable)
          .where(eq(likesTable.userId, userId))
      : Promise.resolve([] as { videoId: string }[]),
    userId
      ? db
          .select({ videoId: savesTable.videoId })
          .from(savesTable)
          .where(eq(savesTable.userId, userId))
      : Promise.resolve([] as { videoId: string }[]),
  ]);

  const partsByVideo = new Map<
    string,
    Array<{ creator: CreatorDto; splitBps: number }>
  >();
  for (const p of parts) {
    const arr = partsByVideo.get(p.videoId) ?? [];
    arr.push({ creator: toCreatorDto(p.creator), splitBps: p.splitBps });
    partsByVideo.set(p.videoId, arr);
  }
  const unlockedSet = new Set(unlocked.map((p) => p.videoId));
  const likedSet = new Set(liked.map((l) => l.videoId));
  const savedSet = new Set(saved.map((s) => s.videoId));

  return rows.map(({ v, c }) => ({
    id: v.id,
    title: v.title,
    teaserUrl: v.teaserUrl,
    fullUrl: v.fullUrl,
    posterUrl: v.posterUrl,
    gradient: v.gradient,
    durationSeconds: v.durationSeconds,
    priceCents: v.priceCents,
    likesCount: v.likesCount,
    savesCount: v.savesCount,
    tags: v.tags ?? [],
    postType: v.postType,
    createdAt: v.createdAt.toISOString(),
    creator: toCreatorDto(c),
    participants: (partsByVideo.get(v.id) ?? []).sort(
      (a, b) => b.splitBps - a.splitBps,
    ),
    unlocked: unlockedSet.has(v.id),
    liked: likedSet.has(v.id),
    saved: savedSet.has(v.id),
  }));
}
