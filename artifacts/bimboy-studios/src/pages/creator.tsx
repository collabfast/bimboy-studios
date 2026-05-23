import { useParams, Link } from "wouter";
import { BadgeCheck, Lock, Play } from "lucide-react";
import {
  useGetCreator,
  useGetCreatorVideos,
  useGetLibrary,
  type FeedItem,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function CreatorPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? "";
  const { user } = useAuth();

  const { data: creator, isLoading, isError } = useGetCreator(handle);
  const { data: feed } = useGetCreatorVideos(handle);
  const { data: library } = useGetLibrary({
    query: { enabled: !!user, queryKey: ["getLibrary"] },
  });

  const unlocked = new Set((library?.items ?? []).map((i) => i.id));
  const videos: FeedItem[] = (feed?.items ?? []).map((v) => ({
    ...v,
    unlocked: v.unlocked || unlocked.has(v.id),
  }));

  if (isLoading) {
    return (
      <div className="page-shell pt-10 pb-28">
        <div className="skeleton-card" style={{ height: 200 }} />
      </div>
    );
  }
  if (isError || !creator) {
    return (
      <div className="page-shell pt-10 pb-28">
        <div className="library-empty">
          <div className="library-empty-title">Creator not found</div>
          <Link href="/" className="library-empty-cta">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pt-8 pb-28">
      <section
        className="creator-hero"
        style={{
          background: `radial-gradient(circle at 20% 20%, rgba(255,45,135,.35), transparent 60%), radial-gradient(circle at 80% 80%, rgba(124,43,255,.35), transparent 60%), #0b0014`,
        }}
      >
        <img src={creator.avatarUrl} alt="" className="creator-hero-avatar" />
        <div className="creator-hero-text">
          <div className="creator-hero-name">
            {creator.displayName}
            {creator.verified && (
              <BadgeCheck className="ml-2 inline-block h-5 w-5 text-pink-400" />
            )}
          </div>
          <div className="creator-hero-handle">@{creator.handle}</div>
          {creator.bio && <p className="creator-hero-bio">{creator.bio}</p>}
          <div className="creator-hero-stats">
            <span>
              <strong>{videos.length}</strong> videos
            </span>
            <span>
              <strong>
                {videos.reduce((s, v) => s + v.likesCount, 0).toLocaleString()}
              </strong>{" "}
              likes
            </span>
          </div>
        </div>
      </section>

      <h2 className="creator-section-title">Drops from {creator.displayName}</h2>

      {videos.length === 0 ? (
        <div className="library-empty">No videos yet.</div>
      ) : (
        <div className="library-grid">
          {videos.map((v) => (
            <article key={v.id} className="library-card">
              <div className="library-thumb" style={{ background: v.gradient }}>
                <video
                  src={v.teaserUrl}
                  className={`library-video${v.unlocked ? "" : " swipe-video-blur"}`}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="library-thumb-shade" />
                <div className="library-duration">
                  {formatDuration(v.durationSeconds)}
                </div>
                {v.unlocked ? (
                  <div className="library-unlocked">
                    <Lock className="h-3 w-3" /> Unlocked
                  </div>
                ) : (
                  <div className="library-price">
                    <Lock className="h-3 w-3" /> $
                    {(v.priceCents / 100).toFixed(2)}
                  </div>
                )}
                <Link
                  href="/"
                  className="library-play"
                  aria-label="Watch on feed"
                >
                  <Play className="h-5 w-5" />
                </Link>
              </div>
              <div className="library-meta">
                <div style={{ flex: 1 }}>
                  <div className="library-card-title">{v.title}</div>
                  {v.participants.length > 1 && (
                    <div className="creator-card-split">
                      Split:{" "}
                      {v.participants
                        .map(
                          (p) =>
                            `${p.creator.displayName.split(" ")[0]} ${(p.splitBps / 100).toFixed(0)}%`,
                        )
                        .join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
