import { useParams, Link } from "wouter";
import {
  BadgeCheck,
  ExternalLink,
  Handshake,
  Lock,
  Play,
  ShieldCheck,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  useGetCreator,
  useGetCreatorVideos,
  useGetCreatorCollab,
  useGetLibrary,
  getGetCreatorCollabQueryKey,
  type FeedItem,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { accountUrl, accountUrlLabel } from "@/lib/links";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CreatorPage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? "";
  const { user } = useAuth();

  const { data: creator, isLoading, isError } = useGetCreator(handle);
  const { data: feed } = useGetCreatorVideos(handle);
  const { data: collab } = useGetCreatorCollab(handle, {
    query: {
      enabled: !!user && !!handle,
      queryKey: getGetCreatorCollabQueryKey(handle),
      retry: false,
    },
  });
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
          <a
            href={accountUrl(creator.handle)}
            target="_blank"
            rel="noreferrer noopener"
            className="creator-hero-url"
          >
            {accountUrlLabel(creator.handle)}
          </a>
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

      <section className="creator-profile-grid">
        <div className="creator-profile-card">
          <p className="creator-profile-card-label">Find me everywhere</p>
          {creator.platformLinks.length === 0 ? (
            <p className="creator-profile-empty">No external links added yet.</p>
          ) : (
            <ul className="creator-link-list">
              {creator.platformLinks.map((link) => (
                <li key={`${link.label}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="creator-link"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {collab?.collabFastUrl ? (
            <a
              href={collab.collabFastUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="creator-collabfast-btn"
            >
              <Handshake className="h-4 w-4" />
              Collab via CollabFast
            </a>
          ) : null}
        </div>

        <div className="creator-profile-card">
          <p className="creator-profile-card-label">Reach & safety</p>
          <div className="creator-stat-row">
            <Users className="h-5 w-5 text-pink-300" />
            <div>
              <div className="creator-stat-value">
                {creator.followerCount != null
                  ? formatFollowers(creator.followerCount)
                  : "—"}
                {creator.xHandle ? (
                  <span className="creator-stat-sub"> on X (@{creator.xHandle})</span>
                ) : null}
              </div>
              <div className="creator-stat-caption">
                {creator.followersUpdatedAt
                  ? `Followers · updated ${formatDate(creator.followersUpdatedAt)}`
                  : "Follower count not set"}
              </div>
            </div>
          </div>
          <div className="creator-stat-row">
            {creator.testingVerified ? (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            )}
            <div>
              <div className="creator-stat-value">
                {creator.testingVerified
                  ? "Health & STI testing verified"
                  : "Testing status unverified"}
              </div>
              <div className="creator-stat-caption">
                {creator.lastTestedAt
                  ? `Last tested ${formatDate(creator.lastTestedAt)}`
                  : "No test date on file"}
              </div>
            </div>
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
