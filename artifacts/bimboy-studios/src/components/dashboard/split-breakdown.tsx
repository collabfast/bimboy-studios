import type { Participant } from "@workspace/api-client-react";
import { computeDisplaySplit } from "@/lib/dashboard";

type SplitBreakdownProps = {
  postType: string;
  participants: Participant[];
};

export function SplitBreakdown({ postType, participants }: SplitBreakdownProps) {
  const rows = computeDisplaySplit(postType, participants);

  return (
    <div className="grid gap-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-white/8">
        {rows.map((row, i) => (
          <div
            key={`${row.label}-${i}`}
            style={{ width: `${row.pct}%` }}
            className={
              row.isPlatform
                ? "bg-white/30"
                : i % 2 === 1
                  ? "bg-pink-400/80"
                  : "bg-violet-400/80"
            }
            title={`${row.label} · ${row.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {rows.map((row, i) => (
          <span
            key={`${row.label}-label-${i}`}
            className="inline-flex items-center gap-1.5 text-xs text-white/65"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                row.isPlatform
                  ? "bg-white/40"
                  : i % 2 === 1
                    ? "bg-pink-400"
                    : "bg-violet-400"
              }`}
            />
            <span className={row.isPlatform ? "text-white/50" : "text-white/75"}>
              {row.label}
            </span>
            <span className="font-semibold text-white/90">
              {row.pct.toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
