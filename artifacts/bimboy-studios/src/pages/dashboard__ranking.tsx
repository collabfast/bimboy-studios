import { useGetCreatorRankings } from "@workspace/api-client-react";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { useDashboardPeriod } from "@/components/dashboard/use-period";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "@/components/dashboard/state-block";
import { formatCents } from "@/lib/dashboard";

export default function DashboardRankingPage() {
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

  const { data, isLoading, isError } = useGetCreatorRankings({
    from: period.from,
    to: period.to,
  });
  const rankings = data ?? [];
  const topRevenue = rankings[0]?.revenueCents ?? 0;

  return (
    <div className="grid gap-6">
      <section className="surface-card rounded-[32px] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-pink-300">
              Model Ranking
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
              Top creators by revenue
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
              Ranked by net creator earnings for the selected period.
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

      {isLoading ? (
        <LoadingBlock label="Loading rankings…" />
      ) : isError ? (
        <ErrorBlock description="Could not load rankings. Please try again." />
      ) : rankings.length === 0 ? (
        <EmptyBlock
          title="No revenue in this period"
          description="Once creators earn within this window, they'll be ranked here."
        />
      ) : (
        <section className="surface-card overflow-hidden rounded-[32px]">
          {rankings.map((row) => (
            <div
              key={row.creatorId}
              className="flex items-center gap-4 border-b border-white/8 px-6 py-4 last:border-b-0"
            >
              <span className="w-8 text-center text-lg font-bold text-white/40">
                {row.rank}
              </span>
              <img
                src={row.avatarUrl}
                alt={row.displayName}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{row.displayName}</p>
                <p className="text-sm text-white/50">@{row.handle}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500"
                    style={{
                      width: `${
                        topRevenue > 0
                          ? Math.max(4, (row.revenueCents / topRevenue) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">
                  {formatCents(row.revenueCents)}
                </p>
                <p className="text-xs text-white/45">{row.purchases} sales</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
