"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { videos } from "@/lib/placeholders";

const filterOptions = [
  { key: "featured", label: "Featured" },
  { key: "new", label: "New" },
  { key: "premium", label: "Premium" },
] as const;

type FilterKey = (typeof filterOptions)[number]["key"];

const videoMeta: Record<
  string,
  {
    tag: string;
    cast: string;
    access: "Premium" | "Free";
  }
> = {
  "midnight-premiere": {
    tag: "Featured Release",
    cast: "Luna Vale, Nico Voss",
    access: "Premium",
  },
  "velvet-spotlight": {
    tag: "New Arrival",
    cast: "Rhea Onyx, Luna Vale",
    access: "Premium",
  },
  "royalty-cut": {
    tag: "Editorial Cut",
    cast: "Nico Voss, Rhea Onyx",
    access: "Free",
  },
};

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>("featured");

  const visibleVideos = useMemo(() => {
    return videos
      .map((video, index) => ({
        ...video,
        ...videoMeta[video.slug],
        isFeatured: index === 0 || video.status === "Featured",
        isNew: index <= 1,
      }))
      .filter((video) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          normalizedQuery.length === 0 ||
          video.title.toLowerCase().includes(normalizedQuery) ||
          video.studio.toLowerCase().includes(normalizedQuery) ||
          video.cast.toLowerCase().includes(normalizedQuery) ||
          video.tag.toLowerCase().includes(normalizedQuery);

        if (!matchesQuery) {
          return false;
        }

        if (activeFilter === "featured") {
          return video.isFeatured;
        }

        if (activeFilter === "new") {
          return video.isNew;
        }

        if (activeFilter === "premium") {
          return video.access === "Premium";
        }

        return true;
      });
  }, [activeFilter, query]);

  return (
    <PageShell
      eyebrow="Browse"
      title="Discover premium releases, standout scenes, and featured talent."
      description="Explore the BimBoy Studios library through cinematic drops, cast-led discovery, and polished release presentation."
    >
      <section className="page-shell mt-10">
        <div className="surface-card rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-pink-300">
                Video Library
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Premium content discovery built around releases, creators, and cast.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/64">
                Search the library, follow featured drops, and move from a
                release into creator pages and credits with ease.
              </p>
            </div>

            <label className="block w-full lg:max-w-xl">
              <span className="sr-only">Search videos</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search releases, studios, or cast"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-pink-400/30"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {filterOptions.map((option) => {
              const isActive = activeFilter === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setActiveFilter((current) =>
                      current === option.key ? null : option.key,
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-pink-400/40 bg-pink-500/12 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-shell mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-pink-300">
              Releases
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Browse the library
            </h2>
          </div>
          <p className="text-sm text-white/45">
            {visibleVideos.length} release{visibleVideos.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleVideos.map((video) => (
            <article
              key={video.slug}
              className="surface-card overflow-hidden rounded-[30px] transition hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,92,168,0.24),_transparent_40%),linear-gradient(160deg,_rgba(141,125,255,0.34),_rgba(8,8,10,0.96))]">
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
                    {video.tag}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      video.access === "Premium"
                        ? "border border-pink-400/30 bg-pink-500/12 text-pink-100"
                        : "border border-white/10 bg-black/35 text-white/72"
                    }`}
                  >
                    {video.access}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-end p-5">
                  <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                      {video.studio}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {video.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-white">
                  {video.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-white/68">
                  Cast: {video.cast}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {video.summary}
                </p>
                <div className="mt-6">
                  <Link
                    href={`/videos/${video.slug}`}
                    className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                  >
                    Open Release
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleVideos.length === 0 ? (
          <div className="surface-card mt-6 rounded-[28px] p-8 text-center">
            <h3 className="text-2xl font-semibold text-white">
              No releases match that search
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Try another title, studio, cast name, or filter.
            </p>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
