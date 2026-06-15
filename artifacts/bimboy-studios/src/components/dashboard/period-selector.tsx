import type { Period, PeriodKey } from "@/lib/dashboard";

type PeriodSelectorProps = {
  periods: Period[];
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
  customFrom?: string;
  customTo?: string;
  onCustomFromChange?: (value: string) => void;
  onCustomToChange?: (value: string) => void;
};

export function PeriodSelector({
  periods,
  value,
  onChange,
  customFrom = "",
  customTo = "",
  onCustomFromChange,
  onCustomToChange,
}: PeriodSelectorProps) {
  const showCustomInputs =
    value === "custom" && !!onCustomFromChange && !!onCustomToChange;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => {
          const isActive = period.key === value;
          return (
            <button
              key={period.key}
              type="button"
              onClick={() => onChange(period.key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isActive
                  ? "border-pink-400/40 bg-pink-500/15 text-pink-100"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80"
              }`}
            >
              {period.label}
            </button>
          );
        })}
      </div>

      {showCustomInputs ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
          <label className="flex items-center gap-1.5">
            <span className="uppercase tracking-[0.16em]">From</span>
            <input
              type="date"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => onCustomFromChange?.(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white/80 outline-none focus:border-pink-400/40"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="uppercase tracking-[0.16em]">To</span>
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => onCustomToChange?.(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white/80 outline-none focus:border-pink-400/40"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
