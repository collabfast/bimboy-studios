import {
  db,
  creatorsTable,
  videosTable,
  videoParticipantsTable,
} from "@workspace/db";

export async function seedIfEmpty() {
  const [existingVideo] = await db.select({ id: videosTable.id }).from(videosTable).limit(1);
  const [existingCreator] = await db.select({ id: creatorsTable.id }).from(creatorsTable).limit(1);
  if (existingVideo || existingCreator) {
    await backfillParticipants();
    return;
  }

  const creatorRows = [
    { handle: "lunavega", displayName: "Luna Vega", avatarUrl: "https://i.pravatar.cc/120?img=47", bio: "Studio nightowl. New drops every Friday.", verified: true },
    { handle: "novareign", displayName: "Nova Reign", avatarUrl: "https://i.pravatar.cc/120?img=32", bio: "Behind the velvet curtain.", verified: true },
    { handle: "jademonroe", displayName: "Jade Monroe", avatarUrl: "https://i.pravatar.cc/120?img=20", bio: "Penthouse afterhours.", verified: true },
    { handle: "skyereyes", displayName: "Skye Reyes", avatarUrl: "https://i.pravatar.cc/120?img=15", bio: "Neon balcony, director cuts.", verified: false },
    { handle: "ivyhart", displayName: "Ivy Hart", avatarUrl: "https://i.pravatar.cc/120?img=44", bio: "Latex & laughter.", verified: true },
    { handle: "rubylane", displayName: "Ruby Lane", avatarUrl: "https://i.pravatar.cc/120?img=49", bio: "Crimson hotel suite.", verified: false },
  ];

  const insertedCreators = await db.insert(creatorsTable).values(creatorRows).returning();
  const byHandle = new Map(insertedCreators.map((c) => [c.handle, c.id] as const));

  const v = (
    handle: string,
    title: string,
    teaser: string,
    gradient: string,
    durationSeconds: number,
    priceCents: number,
    tags: string[],
    likes: number,
  ) => ({
    creatorId: byHandle.get(handle)!,
    title,
    teaserUrl: teaser,
    fullUrl: teaser,
    posterUrl: null,
    gradient,
    durationSeconds,
    priceCents,
    likesCount: likes,
    savesCount: Math.floor(likes / 5),
    tags,
    status: "published" as const,
  });

  const base = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";
  const insertedVideos = await db.insert(videosTable).values([
    v("lunavega",   "Midnight studio session — exclusive cut",  `${base}/ForBiggerBlazes.mp4`,    "linear-gradient(135deg,#ff2d87,#7c2bff 55%,#1a0033)", 768, 999,  ["#exclusive","#studio","#newdrop"], 12483),
    v("novareign",  "Behind the velvet curtain",                `${base}/ForBiggerEscapes.mp4`,   "linear-gradient(135deg,#ff6a3d,#ff2d87 50%,#220011)", 501,  650,  ["#bts","#velvet","#solo"],         8721),
    v("jademonroe", "Penthouse afterhours — full length",       `${base}/ForBiggerFun.mp4`,       "linear-gradient(135deg,#22d3ee,#7c2bff 60%,#000010)", 1330, 1499, ["#penthouse","#afterhours"],       23104),
    v("skyereyes",  "Neon balcony — director's cut",            `${base}/ForBiggerJoyrides.mp4`,  "linear-gradient(135deg,#84fab0,#8fd3f4 50%,#001220)", 362,  499,  ["#neon","#director"],              5402),
    v("ivyhart",    "Latex & laughter — uncut",                 `${base}/ForBiggerMeltdowns.mp4`, "linear-gradient(135deg,#f72585,#7209b7 50%,#3a0ca3)", 930,  1100, ["#latex","#uncut","#trending"],   18420),
    v("rubylane",   "Crimson hotel suite",                      `${base}/Sintel.mp4`,             "linear-gradient(135deg,#e63946,#9d0208 60%,#1a0000)", 614,  750,  ["#crimson","#hotel"],              9610),
  ]).returning();

  // Multi-creator collabs: every video has a lead split, some are duos/trios.
  // splitBps sums to 10000 per video (basis points so no float drift).
  const byTitle = new Map(insertedVideos.map((row) => [row.title, row.id] as const));
  type Part = { videoId: string; creatorId: string; splitBps: number };
  const parts: Part[] = [];
  const split = (title: string, entries: Array<[string, number]>) => {
    const videoId = byTitle.get(title);
    if (!videoId) return;
    const total = entries.reduce((s, [, bps]) => s + bps, 0);
    if (total !== 10000) throw new Error(`splits for "${title}" must sum to 10000, got ${total}`);
    for (const [handle, splitBps] of entries) {
      const creatorId = byHandle.get(handle);
      if (!creatorId) continue;
      parts.push({ videoId, creatorId, splitBps });
    }
  };

  split("Midnight studio session — exclusive cut", [["lunavega", 7000], ["novareign", 3000]]);
  split("Penthouse afterhours — full length",      [["jademonroe", 6000], ["ivyhart", 2500], ["rubylane", 1500]]);
  split("Latex & laughter — uncut",                [["ivyhart", 6500], ["skyereyes", 3500]]);
  split("Behind the velvet curtain",               [["novareign", 10000]]);
  split("Neon balcony — director's cut",           [["skyereyes", 10000]]);
  split("Crimson hotel suite",                     [["rubylane", 10000]]);

  if (parts.length > 0) {
    await db.insert(videoParticipantsTable).values(parts);
  }
}

// Idempotent participant backfill for already-seeded DBs. Skipped once any
// row exists so manual changes are never overwritten.
async function backfillParticipants() {
  const [existing] = await db
    .select({ id: videoParticipantsTable.id })
    .from(videoParticipantsTable)
    .limit(1);
  if (existing) return;

  const creators = await db.select().from(creatorsTable);
  const videos = await db.select().from(videosTable);
  const byHandle = new Map(creators.map((c) => [c.handle, c.id] as const));
  const byTitle = new Map(videos.map((v) => [v.title, v.id] as const));

  type Part = { videoId: string; creatorId: string; splitBps: number };
  const parts: Part[] = [];
  const split = (title: string, entries: Array<[string, number]>) => {
    const videoId = byTitle.get(title);
    if (!videoId) return;
    for (const [handle, splitBps] of entries) {
      const creatorId = byHandle.get(handle);
      if (!creatorId) continue;
      parts.push({ videoId, creatorId, splitBps });
    }
  };

  split("Midnight studio session — exclusive cut", [["lunavega", 7000], ["novareign", 3000]]);
  split("Penthouse afterhours — full length",      [["jademonroe", 6000], ["ivyhart", 2500], ["rubylane", 1500]]);
  split("Latex & laughter — uncut",                [["ivyhart", 6500], ["skyereyes", 3500]]);
  split("Behind the velvet curtain",               [["novareign", 10000]]);
  split("Neon balcony — director's cut",           [["skyereyes", 10000]]);
  split("Crimson hotel suite",                     [["rubylane", 10000]]);

  if (parts.length > 0) {
    await db.insert(videoParticipantsTable).values(parts);
  }
}
