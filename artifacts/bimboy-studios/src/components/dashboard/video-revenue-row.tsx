import { useState } from "react";
import type { FeedItem } from "@workspace/api-client-react";
import {
  getGetVideoStatsQueryKey,
  useGetVideoStats,
} from "@workspace/api-client-react";
import { formatCents, formatPct } from "@/lib/dashboard";
import { SplitBreakdown } from "./split-breakdown";
import { PeriodSelector } from "./period-selector";
import { useDashboardPeriod } from "./use-period";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function VideoRevenueRow({ item }: { item: FeedItem }) {
  const [open, setOpen] = useState(false);
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

  const statsParams = { videoId: item.id, from: period.from, to: period.to };
  const { data, isLoading, isError } = useGetVideoStats(statsParams, {
    query: {
      enabled: open,
      queryKey: getGetVideoStatsQueryKey(statsParams),
    },
  });

  const postedOn = new Date(item.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="border-b border-white/8 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 px-6 py-5 text-left transition hover:bg-white/[0.02]"
      >
        <div
          className="mt-1 h-12 w-12 shrink-0 rounded-xl"
          style={{ background: item.gradient }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                item.postType === "studio"
                  ? "border-violet-400/30 bg-violet-500/12 text-violet-100"
                  : "border-pink-400/30 bg-pink-500/12 text-pink-100"
              }`}
            >
              {item.postType === "studio" ? "Studio exclusive" : "Creator post"}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/55">
            {item.creator.displayName} · {formatCents(item.priceCents)} · Posted{" "}
            {postedOn}
          </p>
          <div className="mt-3 max-w-xl">
            <SplitBreakdown
              postType={item.postType}
              participants={item.participants}
            />
          </div>
        </div>
        <span className="mt-1 text-sm text-white/40">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="border-t border-white/8 bg-black/20 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-pink-300">
              Revenue & conversion
            </p>
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

          {isLoading ? (
            <p className="mt-4 text-sm text-white/50">Loading stats…</p>
          ) : isError ? (
            <p className="mt-4 text-sm text-rose-200/80">
              Could not load stats for this period.
            </p>
          ) : data ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatTile
                label="Revenue"
                value={formatCents(data.grossRevenueCents)}
              />
              <StatTile label="Teaser clicks" value={String(data.clicks)} />
              <StatTile label="Views" value={String(data.views)} />
              <StatTile label="Purchases" value={String(data.purchases)} />
              <StatTile
                label="Conversion"
                value={formatPct(data.conversionRate)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
