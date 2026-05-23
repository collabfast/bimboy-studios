"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const VIDEO_ID = "31adab135f48d93f64c3ae2861d67fe6";
const PREVIEW_LIMIT_SECONDS = 120;

const releaseBySlug: Record<
  string,
  {
    title: string;
    cast: { name: string; slug: string }[];
    description: string;
    price: string;
    access: "Premium" | "Free";
    posterSrc: string;
  }
> = {
  "my-felt-good-this-morning": {
    title: "My felt good this morning",
    cast: [{ name: "Spikeydee", slug: "spikeydee" }],
    description: "Stroking and enjoying myself.",
    price: "12.99",
    access: "Premium",
    posterSrc: "/images/poster-1.jpg",
  },
};

export default function VideoPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [locked, setLocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerVisible, setPlayerVisible] = useState(true);

  const release = useMemo(
    () =>
      releaseBySlug["my-felt-good-this-morning"] ?? {
        title: "My felt good this morning",
        cast: [],
        description: "",
        price: "12.99",
        access: "Premium" as const,
        posterSrc: "/images/poster-1.jpg",
      },
    [],
  );

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;

        if (next >= PREVIEW_LIMIT_SECONDS) {
          if (timerRef.current) clearInterval(timerRef.current);
          setLocked(true);
          setPlayerVisible(false);
          return PREVIEW_LIMIT_SECONDS;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const remainingSeconds = Math.max(PREVIEW_LIMIT_SECONDS - currentTime, 0);

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[#08080b]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative aspect-video overflow-hidden bg-black">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${release.posterSrc}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {playerVisible ? (
                <iframe
                  ref={iframeRef}
                  src={`https://iframe.videodelivery.net/${VIDEO_ID}?autoplay=true&muted=true&controls=true`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : null}

              {!locked ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">
                      Preview Active
                    </p>
                    <p className="mt-2 text-sm text-white/75">
                      Unlock full access anytime
                    </p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold text-white">
                    {remainingSeconds}s left
                  </div>
                </div>
              ) : null}

              {locked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/88 p-6 text-center">
                  <div className="rounded-full border border-pink-400/20 bg-pink-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
                    Preview Locked
                  </div>

                  <h2 className="mt-6 text-3xl font-black text-white">
                    Unlock Full Video
                  </h2>

                  <p className="mt-3 max-w-md text-white/70">
                    Your 2-minute preview has ended. Unlock the full release to
                    continue watching.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link
                      href="/signup"
                      className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
                    >
                      Unlock for ${release.price}
                    </Link>

                    {release.cast[0] ? (
                      <Link
                        href={`/${release.cast[0].slug}`}
                        className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:border-white/20"
                      >
                        View Creator
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-between px-6 py-8 sm:px-8 sm:py-10">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                    BimBoy
                  </span>
                  <span className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-200">
                    {release.access}
                  </span>
                </div>

                <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {release.title}
                </h1>

                <p className="mt-5 text-base leading-8 text-white/68">
                  {release.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
                  >
                    Unlock Full Video
                  </Link>

                  {release.cast[0] ? (
                    <Link
                      href={`/${release.cast[0].slug}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:border-white/20"
                    >
                      View Creator
                    </Link>
                  ) : null}
                </div>

                <p className="mt-4 text-sm text-white/50">
                  Playback begins muted for preview and locks after 2 minutes.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ["Preview Window", "2:00"],
                  ["Playback", locked ? "Locked" : "Previewing"],
                  ["Price", `$${release.price}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                      {label}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#09090c] px-6 py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">
              Featured Cast
            </p>

            <div className="mt-6 space-y-4">
              {release.cast.map((member) => (
                <Link
                  key={member.slug}
                  href={`/${member.slug}`}
                  className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {member.name}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      Creator profile
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-pink-200">
                    Open
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#09090c] px-6 py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">
              Release Details
            </p>

            <p className="mt-4 text-base leading-8 text-white/68">
              Watch the first two minutes free, then unlock the full release for
              permanent access.
            </p>

            <p className="mt-5 text-base leading-8 text-white/60">
              This release is connected to the creator profile, video pricing,
              and preview window so the same system can scale across the whole
              platform.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}