import { Link } from "wouter";
import { useGetCreatorRankings, useGetFeed } from "@workspace/api-client-react";
import { formatCents } from "@/lib/dashboard";
import { LoadingBlock } from "@/components/dashboard/state-block";

export default function DashboardPage() {
  const { data: feed, isLoading } = useGetFeed({ limit: 50 });
  const { data: rankings } = useGetCreatorRankings({});

  const items = feed?.items ?? [];
  const creatorPosts = items.filter((v) => v.postType !== "studio").length;
  const studioPosts = items.filter((v) => v.postType === "studio").length;
  const topEarner = rankings?.[0];
  const totalRevenue = (rankings ?? []).reduce(
    (sum, r) => sum + r.revenueCents,
    0,
  );

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
          Dashboard Overview
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
          Content command center
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
          Manage posts, revenue splits, consent paperwork, performance, and
          creator rankings — all powered by live accounting data.
        </p>

        {isLoading ? (
          <div className="mt-8">
            <LoadingBlock label="Loading overview…" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total posts", String(items.length), "Across the catalog"],
              ["Creator posts", String(creatorPosts), "20% platform share"],
              ["Studio exclusives", String(studioPosts), "33% platform share"],
              [
                "Creator earnings",
                formatCents(totalRevenue),
                topEarner
                  ? `Top: ${topEarner.displayName}`
                  : "No earnings yet",
              ],
            ].map(([label, value, description]) => (
              <div
                key={label}
                className="rounded-[28px] border border-white/8 bg-black/28 p-5"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                <p className="mt-2 text-sm leading-7 text-white/58">
                  {description}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/dashboard/videos"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:brightness-110"
          >
            My Videos
          </Link>
          <Link
            href="/dashboard/earnings"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/8"
          >
            Earnings & payouts
          </Link>
        </div>
      </section>
    </div>
  );
}
