import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  Heart,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Lock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Sparkles,
  Eye,
  Shield,
  Loader2,
  Play,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetFeed,
  useToggleLike,
  useToggleSave,
  useCreatePurchase,
  getGetFeedQueryKey,
  type FeedItem,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

type Toast = { id: number; text: string; tone: "save" | "like" | "info" };

export function SwipeFeed() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const params = { limit: 20 };
  const feedKey = getGetFeedQueryKey(params);

  const requireSignIn = useCallback(
    (action: string) => {
      navigate(`/login?next=/&action=${encodeURIComponent(action)}`);
    },
    [navigate],
  );

  const { data, isLoading, isError, refetch } = useGetFeed(params, {
    query: { queryKey: feedKey },
  });

  const items = data?.items ?? [];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [muted, setMuted] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState<FeedItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const toastIdRef = useRef(0);

  const total = items.length;
  const safeIndex = total > 0 ? index % total : 0;
  const current = items[safeIndex];
  const next = total > 0 ? items[(safeIndex + 1) % total] : undefined;
  const prev = total > 0 ? items[(safeIndex - 1 + total) % total] : undefined;

  const pushToast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1800);
  }, []);

  const goNext = useCallback(() => {
    if (total === 0) return;
    setDirection(1);
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    setDirection(-1);
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const likeMutation = useToggleLike();
  const saveMutation = useToggleSave();
  const purchaseMutation = useCreatePurchase();

  const patchItem = useCallback(
    (videoId: string, patch: Partial<FeedItem>) => {
      qc.setQueryData<{ items: FeedItem[] } | undefined>(feedKey, (old) => {
        if (!old) return old;
        return {
          items: old.items.map((it) =>
            it.id === videoId ? { ...it, ...patch } : it,
          ),
        };
      });
    },
    [qc, feedKey],
  );

  const toggleLike = useCallback(
    (item: FeedItem) => {
      if (!user) { requireSignIn("like"); return; }
      const willActivate = !item.liked;
      patchItem(item.id, {
        liked: willActivate,
        likesCount: item.likesCount + (willActivate ? 1 : -1),
      });
      pushToast(willActivate ? "Liked" : "Unliked", "like");
      likeMutation.mutate(
        { videoId: item.id },
        {
          onSuccess: (resp) =>
            patchItem(item.id, { liked: resp.active, likesCount: resp.count }),
          onError: () =>
            patchItem(item.id, {
              liked: item.liked,
              likesCount: item.likesCount,
            }),
        },
      );
    },
    [likeMutation, patchItem, pushToast, user, requireSignIn],
  );

  const toggleSave = useCallback(
    (item: FeedItem) => {
      if (!user) { requireSignIn("save"); return; }
      const willActivate = !item.saved;
      patchItem(item.id, {
        saved: willActivate,
        savesCount: item.savesCount + (willActivate ? 1 : -1),
      });
      pushToast(willActivate ? "Saved to watchlist" : "Removed", "save");
      saveMutation.mutate(
        { videoId: item.id },
        {
          onSuccess: (resp) =>
            patchItem(item.id, { saved: resp.active, savesCount: resp.count }),
          onError: () =>
            patchItem(item.id, {
              saved: item.saved,
              savesCount: item.savesCount,
            }),
        },
      );
    },
    [saveMutation, patchItem, pushToast, user, requireSignIn],
  );

  const openUnlock = useCallback(
    (item: FeedItem | undefined) => {
      if (!item || item.unlocked) return;
      if (!user) { requireSignIn("unlock"); return; }
      setUnlockOpen(item);
    },
    [user, requireSignIn],
  );

  const confirmUnlock = useCallback(() => {
    if (!unlockOpen) return;
    const item = unlockOpen;
    purchaseMutation.mutate(
      { data: { videoId: item.id } },
      {
        onSuccess: () => {
          patchItem(item.id, { unlocked: true });
          pushToast(
            `Unlocked — $${(item.priceCents / 100).toFixed(2)} (placeholder CCBill)`,
            "info",
          );
          setUnlockOpen(null);
        },
        onError: () => {
          pushToast("Payment failed", "info");
        },
      },
    );
  }, [unlockOpen, purchaseMutation, patchItem, pushToast]);

  // keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (unlockOpen) return;
      // Desktop grid: only respond to keys while the viewer is open.
      if (isDesktop && !viewerOpen) {
        if (e.key === "Escape") setViewerOpen(false);
        return;
      }
      if (e.key === "Escape" && viewerOpen) {
        setViewerOpen(false);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openUnlock(current);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "m" || e.key === "M") {
        setMuted((m) => !m);
      } else if (e.key === "l" || e.key === "L") {
        if (current) toggleLike(current);
      } else if (e.key === "s" || e.key === "S") {
        if (current) toggleSave(current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goNext, goPrev, openUnlock, toggleLike, toggleSave, unlockOpen, isDesktop, viewerOpen]);

  const openViewerAt = useCallback(
    (i: number) => {
      setDirection(1);
      setIndex(i);
      setViewerOpen(true);
    },
    [],
  );

  return (
    <div className="swipe-app">
      <div className="swipe-topbar">
        <div className="swipe-brand">
          <span className="swipe-brand-bim">BIM</span>
          <span className="swipe-brand-boy">BOY</span>
        </div>
        <div className="swipe-topbar-actions">
          <button
            type="button"
            className={`swipe-pill ${safeMode ? "swipe-pill-active" : ""}`}
            onClick={() => {
              setSafeMode((v) => !v);
              pushToast(safeMode ? "Safe mode off" : "Safe mode on", "info");
            }}
          >
            <Shield className="h-3.5 w-3.5" />
            Safe
          </button>
          <button
            type="button"
            className="swipe-pill"
            onClick={() => setMuted((m) => !m)}
            aria-label="toggle mute"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {isDesktop ? (
        <DesktopGrid
          items={items}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onOpen={openViewerAt}
          onUnlock={openUnlock}
          onLike={toggleLike}
          onSave={toggleSave}
        />
      ) : (
      <div className="swipe-stage">
        <div className="swipe-frame">
          <div className="swipe-card-stack">
            {isLoading && (
              <div className="swipe-status">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Loading feed…</p>
              </div>
            )}
            {isError && (
              <div className="swipe-status">
                <p>Couldn’t load feed.</p>
                <button type="button" className="swipe-unlock-btn" onClick={() => refetch()}>
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !isError && total === 0 && (
              <div className="swipe-status">
                <p>No videos yet.</p>
              </div>
            )}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {current && (
                <SwipeCard
                  key={current.id}
                  item={current}
                  muted={muted}
                  safeMode={safeMode}
                  direction={direction}
                  onNext={goNext}
                  onPrev={goPrev}
                  onUnlock={() => openUnlock(current)}
                  onSave={() => toggleSave(current)}
                  onLike={() => toggleLike(current)}
                  onShare={() => pushToast("Share link copied", "info")}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="swipe-hints">
            <div className="swipe-hint"><ChevronUp className="h-3 w-3" /> unlock</div>
            <div className="swipe-hint"><ChevronDown className="h-3 w-3" /> save</div>
            <div className="swipe-hint"><ChevronLeft className="h-3 w-3" /> prev</div>
            <div className="swipe-hint"><ChevronRight className="h-3 w-3" /> next</div>
          </div>
        </div>

        <aside className="swipe-sidepanel">
          {next && <SidePreview label="Next up" item={next} onClick={goNext} />}
          {prev && <SidePreview label="Previous" item={prev} onClick={goPrev} />}
          <TrendingPanel items={items} />
        </aside>
      </div>
      )}

      <AnimatePresence>
        {isDesktop && viewerOpen && current && (
          <ViewerOverlay
            item={current}
            muted={muted}
            safeMode={safeMode}
            direction={direction}
            onClose={() => setViewerOpen(false)}
            onNext={goNext}
            onPrev={goPrev}
            onUnlock={() => openUnlock(current)}
            onSave={() => toggleSave(current)}
            onLike={() => toggleLike(current)}
            onShare={() => pushToast("Share link copied", "info")}
          />
        )}
      </AnimatePresence>

      <div className="swipe-toast-wrap">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 16, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.96 }}
              className={`swipe-toast swipe-toast-${t.tone}`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {unlockOpen && (
          <UnlockDialog
            item={unlockOpen}
            pending={purchaseMutation.isPending}
            onClose={() => setUnlockOpen(null)}
            onConfirm={confirmUnlock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type SwipeCardProps = {
  item: FeedItem;
  muted: boolean;
  safeMode: boolean;
  direction: 1 | -1;
  onNext: () => void;
  onPrev: () => void;
  onUnlock: () => void;
  onSave: () => void;
  onLike: () => void;
  onShare: () => void;
};

function SwipeCard({
  item,
  muted,
  safeMode,
  direction,
  onNext,
  onPrev,
  onUnlock,
  onSave,
  onLike,
  onShare,
}: SwipeCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-6, 0, 6]);
  const upGlow = useTransform(y, [-200, -40, 0], [1, 0.4, 0]);
  const downGlow = useTransform(y, [0, 40, 200], [0, 0.4, 1]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    const tryPlay = async () => {
      try { await v.play(); } catch { /* ignore */ }
    };
    tryPlay();
  }, [item.id, muted]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const sx = Math.abs(offset.x) * 0.6 + Math.abs(velocity.x) * 0.15;
    const sy = Math.abs(offset.y) * 0.6 + Math.abs(velocity.y) * 0.15;
    if (sy > sx) {
      if (offset.y < -80) onUnlock();
      else if (offset.y > 80) onSave();
    } else {
      if (offset.x < -80) onNext();
      else if (offset.x > 80) onPrev();
    }
    x.set(0);
    y.set(0);
  };

  const blurred = !item.unlocked || safeMode;
  const videoSrc = item.unlocked ? item.fullUrl : item.teaserUrl;

  return (
    <motion.div
      className="swipe-card"
      style={{ x, y, rotate, background: item.gradient }}
      drag
      dragElastic={0.18}
      dragMomentum={false}
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, scale: 0.96, y: direction === 1 ? 60 : -60 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: direction === 1 ? -60 : 60 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className={`swipe-video ${blurred ? "swipe-video-blur" : ""}`}
          autoPlay
          loop
          playsInline
          muted={muted}
          poster={item.posterUrl ?? undefined}
          // @ts-ignore
          disableRemotePlayback
        />
      )}
      <div className="swipe-card-vignette" />

      {!item.unlocked && (
        <div className="swipe-lock">
          <div className="swipe-lock-inner">
            <Lock className="h-7 w-7" />
            <p className="swipe-lock-title">Premium teaser</p>
            <p className="swipe-lock-sub">
              Swipe up to unlock the full {formatDuration(item.durationSeconds)}
            </p>
            <button type="button" className="swipe-unlock-btn" onClick={onUnlock}>
              Unlock · ${(item.priceCents / 100).toFixed(2)}
            </button>
          </div>
        </div>
      )}

      <motion.div className="swipe-glow swipe-glow-up" style={{ opacity: upGlow }}>
        <ChevronUp className="h-8 w-8" /> Unlock
      </motion.div>
      <motion.div className="swipe-glow swipe-glow-down" style={{ opacity: downGlow }}>
        <ChevronDown className="h-8 w-8" /> Save
      </motion.div>

      <div className="swipe-actions">
        <ActionButton
          icon={<Heart className={item.liked ? "fill-pink-500 text-pink-500" : ""} />}
          label={formatCount(item.likesCount)}
          onClick={onLike}
          active={item.liked}
        />
        <ActionButton
          icon={<Bookmark className={item.saved ? "fill-cyan-300 text-cyan-300" : ""} />}
          label={formatCount(item.savesCount)}
          onClick={onSave}
          active={item.saved}
        />
        <ActionButton icon={<Share2 />} label="Share" onClick={onShare} />
      </div>

      <div className="swipe-info">
        <div className="swipe-info-creator">
          <img src={item.creator.avatarUrl} alt={item.creator.displayName} className="swipe-avatar" />
          <div className="swipe-info-text">
            <div className="swipe-info-name">
              {item.creator.displayName}
              {item.creator.verified && (
                <BadgeCheck className="ml-1 inline-block h-4 w-4 text-pink-400" />
              )}
            </div>
            <div className="swipe-info-handle">@{item.creator.handle}</div>
          </div>
          <button type="button" className="swipe-follow">Follow</button>
        </div>
        <p className="swipe-info-title">{item.title}</p>
        <div className="swipe-info-tags">
          {item.tags.map((t) => (
            <span key={t} className="swipe-tag">{t}</span>
          ))}
          <span className="swipe-views">
            <Eye className="h-3 w-3" /> {formatCount(item.likesCount * 4)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`swipe-action ${active ? "swipe-action-active" : ""}`}
      onClick={onClick}
    >
      <span className="swipe-action-icon">{icon}</span>
      <span className="swipe-action-label">{label}</span>
    </button>
  );
}

function SidePreview({
  label,
  item,
  onClick,
}: {
  label: string;
  item: FeedItem;
  onClick: () => void;
}) {
  return (
    <button type="button" className="swipe-side" onClick={onClick}>
      <div className="swipe-side-thumb" style={{ background: item.gradient }}>
        {!item.unlocked && <Lock className="h-4 w-4 text-white/80" />}
      </div>
      <div className="swipe-side-meta">
        <div className="swipe-side-label">{label}</div>
        <div className="swipe-side-title">{item.title}</div>
        <div className="swipe-side-creator">
          {item.creator.displayName} · ${(item.priceCents / 100).toFixed(2)}
        </div>
      </div>
    </button>
  );
}

function TrendingPanel({ items }: { items: FeedItem[] }) {
  const top = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, 4),
    [items],
  );
  if (top.length === 0) return null;
  return (
    <div className="swipe-trending">
      <div className="swipe-trending-head">
        <Sparkles className="h-4 w-4 text-pink-400" />
        <span>Trending creators</span>
      </div>
      <ul className="swipe-trending-list">
        {top.map((c, i) => (
          <li key={c.id} className="swipe-trending-row">
            <span className="swipe-trending-rank">#{i + 1}</span>
            <img src={c.creator.avatarUrl} className="swipe-trending-avatar" alt="" />
            <div className="swipe-trending-meta">
              <div className="swipe-trending-name">
                {c.creator.displayName}
                {c.creator.verified && (
                  <BadgeCheck className="ml-1 inline-block h-3 w-3 text-pink-400" />
                )}
              </div>
              <div className="swipe-trending-sub">{formatCount(c.likesCount)} likes</div>
            </div>
            <button type="button" className="swipe-trending-cta">View</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesktopGrid({
  items,
  isLoading,
  isError,
  onRetry,
  onOpen,
  onUnlock,
  onLike,
  onSave,
}: {
  items: FeedItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpen: (i: number) => void;
  onUnlock: (item: FeedItem) => void;
  onLike: (item: FeedItem) => void;
  onSave: (item: FeedItem) => void;
}) {
  const featured = items[0];
  const rest = items.slice(1);
  return (
    <div className="swipe-desktop">
      <div className="swipe-desktop-inner">
        {isLoading && (
          <div className="swipe-status">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading feed…</p>
          </div>
        )}
        {isError && (
          <div className="swipe-status">
            <p>Couldn’t load feed.</p>
            <button type="button" className="swipe-unlock-btn" onClick={onRetry}>Retry</button>
          </div>
        )}
        {!isLoading && !isError && items.length === 0 && (
          <div className="swipe-status"><p>No videos yet.</p></div>
        )}

        {featured && (
          <section className="swipe-desktop-hero" onClick={() => onOpen(0)}>
            <div className="swipe-desktop-hero-media" style={{ background: featured.gradient }}>
              <video
                src={featured.teaserUrl}
                className={`swipe-desktop-hero-video ${featured.unlocked ? "" : "swipe-video-blur"}`}
                autoPlay loop muted playsInline
                // @ts-ignore
                disableRemotePlayback
              />
              <div className="swipe-desktop-hero-shade" />
              <div className="swipe-desktop-hero-badge">
                <Sparkles className="h-3 w-3" /> Featured drop
              </div>
              <div className="swipe-desktop-hero-info">
                <div className="swipe-desktop-hero-creator">
                  <img src={featured.creator.avatarUrl} alt="" className="swipe-avatar" />
                  <div>
                    <div className="swipe-info-name">
                      {featured.creator.displayName}
                      {featured.creator.verified && (
                        <BadgeCheck className="ml-1 inline-block h-4 w-4 text-pink-400" />
                      )}
                    </div>
                    <div className="swipe-info-handle">@{featured.creator.handle}</div>
                  </div>
                </div>
                <h2 className="swipe-desktop-hero-title">{featured.title}</h2>
                <div className="swipe-desktop-hero-meta">
                  <span><Eye className="h-3 w-3 inline mr-1" />{formatCount(featured.likesCount * 4)} views</span>
                  <span>·</span>
                  <span>{formatDuration(featured.durationSeconds)}</span>
                  <span>·</span>
                  <span className="swipe-desktop-price">${(featured.priceCents / 100).toFixed(2)}</span>
                </div>
                <div className="swipe-desktop-hero-cta">
                  <button
                    type="button"
                    className="swipe-unlock-btn"
                    onClick={(e) => { e.stopPropagation(); onUnlock(featured); }}
                  >
                    <Lock className="h-4 w-4 inline mr-2" />
                    {featured.unlocked ? "Watch full" : `Unlock · $${(featured.priceCents / 100).toFixed(2)}`}
                  </button>
                  <button
                    type="button"
                    className="swipe-pill"
                    onClick={(e) => { e.stopPropagation(); onOpen(0); }}
                  >
                    <Play className="h-3.5 w-3.5" /> Play teaser
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            <div className="swipe-desktop-section-head">
              <h3>Trending teasers</h3>
              <span>Swipe-style PPV · {rest.length} more</span>
            </div>
            <div className="swipe-desktop-grid">
              {rest.map((item, i) => (
                <TeaserCard
                  key={item.id}
                  item={item}
                  onOpen={() => onOpen(i + 1)}
                  onUnlock={() => onUnlock(item)}
                  onLike={() => onLike(item)}
                  onSave={() => onSave(item)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TeaserCard({
  item,
  onOpen,
  onUnlock,
  onLike,
  onSave,
}: {
  item: FeedItem;
  onOpen: () => void;
  onUnlock: () => void;
  onLike: () => void;
  onSave: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (hover) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  }, [hover]);
  return (
    <article
      className="swipe-teaser"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
    >
      <div className="swipe-teaser-media" style={{ background: item.gradient }}>
        <video
          ref={ref}
          src={item.teaserUrl}
          className={`swipe-teaser-video ${item.unlocked ? "" : "swipe-video-blur"}`}
          muted loop playsInline preload="metadata"
          // @ts-ignore
          disableRemotePlayback
        />
        <div className="swipe-teaser-shade" />
        {!item.unlocked && (
          <div className="swipe-teaser-lock">
            <Lock className="h-3.5 w-3.5" /> ${(item.priceCents / 100).toFixed(2)}
          </div>
        )}
        <div className="swipe-teaser-duration">{formatDuration(item.durationSeconds)}</div>
        <button
          type="button"
          className="swipe-teaser-play"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          aria-label="Play teaser"
        >
          <Play className="h-5 w-5" />
        </button>
      </div>
      <div className="swipe-teaser-meta">
        <img src={item.creator.avatarUrl} className="swipe-avatar" alt="" />
        <div className="swipe-teaser-text">
          <div className="swipe-info-name">
            {item.creator.displayName}
            {item.creator.verified && (
              <BadgeCheck className="ml-1 inline-block h-3.5 w-3.5 text-pink-400" />
            )}
          </div>
          <div className="swipe-teaser-title">{item.title}</div>
          {item.participants && item.participants.length > 1 && (
            <div className="swipe-teaser-feat">
              feat.{" "}
              {item.participants
                .filter((p) => p.creator.handle !== item.creator.handle)
                .slice(0, 2)
                .map((p) => p.creator.displayName)
                .join(" & ")}
              {item.participants.length > 3 ? " +more" : ""}
            </div>
          )}
          <div className="swipe-teaser-stats">
            <button
              type="button"
              className={`swipe-chip ${item.liked ? "swipe-chip-active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onLike(); }}
            >
              <Heart className="h-3 w-3" /> {formatCount(item.likesCount)}
            </button>
            <button
              type="button"
              className={`swipe-chip ${item.saved ? "swipe-chip-active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onSave(); }}
            >
              <Bookmark className="h-3 w-3" /> {formatCount(item.savesCount)}
            </button>
            <button
              type="button"
              className="swipe-chip swipe-chip-cta"
              onClick={(e) => { e.stopPropagation(); onUnlock(); }}
            >
              {item.unlocked ? "Watch" : `Unlock $${(item.priceCents / 100).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ViewerOverlay(
  props: SwipeCardProps & { onClose: () => void },
) {
  const { onClose, ...cardProps } = props;
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      className={`swipe-viewer-backdrop ${expanded ? "is-expanded" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        type="button"
        className="swipe-viewer-expand"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        aria-label={expanded ? "Shrink" : "Fit to screen"}
        title={expanded ? "Shrink" : "Fit to screen"}
      >
        {expanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </button>
      <button type="button" className="swipe-viewer-close" onClick={onClose} aria-label="Close">
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="swipe-viewer-nav swipe-viewer-nav-prev"
        onClick={(e) => { e.stopPropagation(); cardProps.onPrev(); }}
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        className="swipe-viewer-nav swipe-viewer-nav-next"
        onClick={(e) => { e.stopPropagation(); cardProps.onNext(); }}
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <motion.div
        className={`swipe-viewer-frame ${expanded ? "is-expanded" : ""}`}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false} custom={cardProps.direction} mode="popLayout">
          <SwipeCard key={cardProps.item.id} {...cardProps} />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function UnlockDialog({
  item,
  onClose,
  onConfirm,
  pending,
}: {
  item: FeedItem;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <motion.div
      className="swipe-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="swipe-modal"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="swipe-modal-hero" style={{ background: item.gradient }}>
          <Lock className="h-6 w-6 text-white" />
          <div>
            <div className="swipe-modal-eyebrow">Unlock full video</div>
            <div className="swipe-modal-title">{item.title}</div>
          </div>
        </div>
        <div className="swipe-modal-body">
          <div className="swipe-modal-row">
            <div className="swipe-modal-row-label">Creator</div>
            <div className="swipe-modal-row-value">
              {item.creator.displayName}
              {item.creator.verified && (
                <BadgeCheck className="ml-1 inline-block h-4 w-4 text-pink-400" />
              )}
            </div>
          </div>
          <div className="swipe-modal-row">
            <div className="swipe-modal-row-label">Length</div>
            <div className="swipe-modal-row-value">{formatDuration(item.durationSeconds)}</div>
          </div>
          <div className="swipe-modal-row">
            <div className="swipe-modal-row-label">One-time PPV</div>
            <div className="swipe-modal-row-value swipe-modal-price">
              ${(item.priceCents / 100).toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            className="swipe-modal-cta"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing…
              </span>
            ) : (
              <>Pay ${(item.priceCents / 100).toFixed(2)} & unlock now</>
            )}
          </button>
          <button type="button" className="swipe-modal-ghost" onClick={onClose}>
            Maybe later
          </button>
          <p className="swipe-modal-foot">
            Placeholder CCBill checkout — no real card is charged.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
