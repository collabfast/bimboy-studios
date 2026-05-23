import { Link } from "wouter";
import { BadgeCheck, Lock, Play } from "lucide-react";
import { useGetLibrary, type FeedItem } from "@workspace/api-client-react";
import { getUserId } from "../lib/session";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function LibraryPage() {
  const userId = getUserId();
  const { data, isLoading, isError } = useGetLibrary({ userId });
  const items: FeedItem[] = data?.items ?? [];

  return (
    <div className="page-shell pt-10 pb-28">
      <header className="library-header">
        <h1 className="library-title">Your library</h1>
        <p className="library-sub">
          Everything you&apos;ve unlocked, ready to rewatch.
        </p>
      </header>

      {isLoading && (
        <div className="library-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {isError && (
        <div className="library-empty">
          Couldn&apos;t load your library. Try again in a moment.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="library-empty">
          <div className="library-empty-title">Nothing here yet</div>
          <p>
            Unlock a video from the feed and it&apos;ll show up here for instant
            replay.
          </p>
          <Link href="/" className="library-empty-cta">
            Browse the feed
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="library-grid">
          {items.map((it) => (
            <article key={it.id} className="library-card">
              <div className="library-thumb" style={{ background: it.gradient }}>
                <video
                  src={it.teaserUrl}
                  className="library-video"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="library-thumb-shade" />
                <div className="library-duration">
                  {formatDuration(it.durationSeconds)}
                </div>
                <div className="library-unlocked">
                  <Lock className="h-3 w-3" /> Unlocked
                </div>
                <Link
                  href="/"
                  className="library-play"
                  aria-label="Watch on feed"
                >
                  <Play className="h-5 w-5" />
                </Link>
              </div>
              <div className="library-meta">
                <img
                  src={it.creator.avatarUrl}
                  alt=""
                  className="library-avatar"
                />
                <div>
                  <div className="library-card-title">{it.title}</div>
                  <Link
                    href={`/c/${it.creator.handle}`}
                    className="library-card-creator"
                  >
                    {it.creator.displayName}
                    {it.creator.verified && (
                      <BadgeCheck className="ml-1 inline-block h-3 w-3 text-pink-400" />
                    )}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
