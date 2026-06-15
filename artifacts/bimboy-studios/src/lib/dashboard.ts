import type { FeedItem, Participant } from "@workspace/api-client-react";

// Platform base cut, mirroring the api-server revenue rules:
// creator posts -> platform 20%, studio posts -> platform 33%.
export const PLATFORM_BASE_BPS: Record<string, number> = {
  creator: 2000,
  studio: 3300,
};

export const PLATFORM_NAME = "BackpackBoys";

export function platformBaseBps(postType: string): number {
  return PLATFORM_BASE_BPS[postType] ?? PLATFORM_BASE_BPS.creator;
}

export type SplitRow = {
  label: string;
  /** percentage of the gross sale (0-100) */
  pct: number;
  isPlatform: boolean;
};

/**
 * Display-only revenue split for a post. Mirrors the authoritative cents math in
 * api-server/src/lib/revenue.ts: the platform takes its base cut, and the
 * remaining pool is divided among participants weighted by splitBps.
 */
export function computeDisplaySplit(
  postType: string,
  participants: Participant[],
): SplitRow[] {
  const baseBps = platformBaseBps(postType);
  const poolBps = 10000 - baseBps;
  const platformRow: SplitRow = {
    label: PLATFORM_NAME,
    pct: baseBps / 100,
    isPlatform: true,
  };

  if (participants.length === 0) {
    return [{ ...platformRow, pct: 100 }];
  }

  const weights = participants.map((p) =>
    p.splitBps && p.splitBps > 0 ? p.splitBps : 1,
  );
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  const creatorRows: SplitRow[] = participants.map((p, i) => ({
    label: p.creator.displayName,
    pct: (poolBps * (weights[i] / totalWeight)) / 100,
    isPlatform: false,
  }));

  return [platformRow, ...creatorRows];
}

export function formatCents(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatPct(fraction: number | null | undefined): string {
  return `${((fraction ?? 0) * 100).toFixed(1)}%`;
}

export function isStudioPost(item: FeedItem): boolean {
  return item.postType === "studio";
}

export type PeriodKey = "all" | "today" | "7d" | "30d" | "month";

export type Period = {
  key: PeriodKey;
  label: string;
  from?: string;
  to?: string;
};

export function buildPeriods(now: Date = new Date()): Period[] {
  const to = now.toISOString();
  const startOf = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
  };
  const daysAgo = (n: number) => {
    const x = new Date(now);
    x.setDate(x.getDate() - n);
    return x.toISOString();
  };
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  return [
    { key: "all", label: "All time" },
    { key: "today", label: "Today", from: startOf(now), to },
    { key: "7d", label: "Last 7 days", from: daysAgo(7), to },
    { key: "30d", label: "Last 30 days", from: daysAgo(30), to },
    { key: "month", label: "This month", from: monthStart, to },
  ];
}
