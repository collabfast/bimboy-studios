import { db, creatorsTable, videosTable } from "@workspace/db";

export async function seedIfEmpty() {
  const [existingVideo] = await db.select({ id: videosTable.id }).from(videosTable).limit(1);
  const [existingCreator] = await db.select({ id: creatorsTable.id }).from(creatorsTable).limit(1);
  if (existingVideo || existingCreator) return;

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
  await db.insert(videosTable).values([
    v("lunavega",   "Midnight studio session — exclusive cut",  `${base}/ForBiggerBlazes.mp4`,    "linear-gradient(135deg,#ff2d87,#7c2bff 55%,#1a0033)", 768, 999,  ["#exclusive","#studio","#newdrop"], 12483),
    v("novareign",  "Behind the velvet curtain",                `${base}/ForBiggerEscapes.mp4`,   "linear-gradient(135deg,#ff6a3d,#ff2d87 50%,#220011)", 501,  650,  ["#bts","#velvet","#solo"],         8721),
    v("jademonroe", "Penthouse afterhours — full length",       `${base}/ForBiggerFun.mp4`,       "linear-gradient(135deg,#22d3ee,#7c2bff 60%,#000010)", 1330, 1499, ["#penthouse","#afterhours"],       23104),
    v("skyereyes",  "Neon balcony — director's cut",            `${base}/ForBiggerJoyrides.mp4`,  "linear-gradient(135deg,#84fab0,#8fd3f4 50%,#001220)", 362,  499,  ["#neon","#director"],              5402),
    v("ivyhart",    "Latex & laughter — uncut",                 `${base}/ForBiggerMeltdowns.mp4`, "linear-gradient(135deg,#f72585,#7209b7 50%,#3a0ca3)", 930,  1100, ["#latex","#uncut","#trending"],   18420),
    v("rubylane",   "Crimson hotel suite",                      `${base}/Sintel.mp4`,             "linear-gradient(135deg,#e63946,#9d0208 60%,#1a0000)", 614,  750,  ["#crimson","#hotel"],              9610),
  ]);
}
