import { useQueries } from "@tanstack/react-query";
import {
  getGetVideoStatsQueryOptions,
  useGetFeed,
} from "@workspace/api-client-react";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { useDashboardPeriod } from "@/components/dashboard/use-period";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "@/components/dashboard/state-block";
import { formatCents, formatPct } from "@/lib/dashboard";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card rounded-[28px] px-6 py-6">
      <p className="text-xs uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardAnalyticsPage() {
  const {
    periods,
    period,
    periodKey,
    setPeriodKey,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
  } = useDashboardPeriod();

  const { data: feed, isLoading: feedLoading, isError: feedError } = useGetFeed({
    limit: 50,
  });
  const items = feed?.items ?? [];

  const statsQueries = useQueries({
    queries: items.map((it) =>
      getGetVideoStatsQueryOptions({
        videoId: it.id,
        from: period.from,
        to: period.to,
      }),
    ),
  });

  const statsLoading = statsQueries.some((q) => q.isLoading);
  const totals = statsQueries.reduce(
    (acc, q) => {
      if (q.data) {
        acc.clicks += q.data.clicks;
        acc.views += q.data.views;
        acc.purchases += q.data.purchases;
        acc.revenue += q.data.grossRevenueCents;
      }
      return acc;
    },
    { clicks: 0, views: 0, purchases: 0, revenue: 0 },
  );
  const conversion = totals.clicks > 0 ? totals.purchases / totals.clicks : 0;

  const perVideo = items
    .map((it, i) => ({
      item: it,
      stats: statsQueries[i]?.data,
    }))
    .sort((a, b) => (b.stats?.grossRevenueCents ?? 0) - (a.stats?.grossRevenueCents ?? 0));
  const topRevenue = perVideo[0]?.stats?.grossRevenueCents ?? 0;

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              Analytics
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Performance overview
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
              Revenue and conversion across all content for the selected period.
            </p>
          </div>
          <PeriodSelector
            periods={periods}
            value={periodKey}
            onChange={setPeriodKey}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
          />
        </div>
      </section>

      {feedLoading ? (
        <LoadingBlock label="Loading analytics…" />
      ) : feedError ? (
        <ErrorBlock description="Could not load analytics. Please try again." />
      ) : items.length === 0 ? (
        <EmptyBlock title="No content to analyze yet" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Gross revenue" value={formatCents(totals.revenue)} />
            <SummaryCard label="Teaser clicks" value={String(totals.clicks)} />
            <SummaryCard label="Purchases" value={String(totals.purchases)} />
            <SummaryCard label="Conversion" value={formatPct(conversion)} />
          </section>

          <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/42">
              Revenue by post
            </p>
            {statsLoading ? (
              <p className="mt-4 text-sm text-white/50">Loading per-post stats…</p>
            ) : (
              <div className="mt-5 grid gap-4">
                {perVideo.map(({ item, stats }) => (
                  <div key={item.id} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="truncate text-white/80">{item.title}</span>
                      <span className="shrink-0 font-semibold text-white">
                        {formatCents(stats?.grossRevenueCents ?? 0)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500"
                        style={{
                          width: `${
                            topRevenue > 0
                              ? Math.max(
                                  2,
                                  ((stats?.grossRevenueCents ?? 0) / topRevenue) *
                                    100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-white/45">
                      {stats?.clicks ?? 0} clicks · {stats?.purchases ?? 0}{" "}
                      purchases · {formatPct(stats?.conversionRate ?? 0)} conversion
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
