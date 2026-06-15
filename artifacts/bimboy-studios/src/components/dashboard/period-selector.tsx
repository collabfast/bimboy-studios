import type { Period, PeriodKey } from "@/lib/dashboard";

type PeriodSelectorProps = {
  periods: Period[];
  value: PeriodKey;
  onChange: (key: PeriodKey) => void;
};

export function PeriodSelector({
  periods,
  value,
  onChange,
}: PeriodSelectorProps) {
  return (
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
  );
}
