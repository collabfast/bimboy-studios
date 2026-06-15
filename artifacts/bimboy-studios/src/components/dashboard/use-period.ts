import { useMemo, useState } from "react";
import {
  buildPeriods,
  selectPeriod,
  type Period,
  type PeriodKey,
} from "@/lib/dashboard";

export type DashboardPeriod = {
  periods: Period[];
  period: Period;
  periodKey: PeriodKey;
  setPeriodKey: (key: PeriodKey) => void;
  customFrom: string;
  setCustomFrom: (value: string) => void;
  customTo: string;
  setCustomTo: (value: string) => void;
};

export function useDashboardPeriod(initial: PeriodKey = "all"): DashboardPeriod {
  const periods = useMemo(() => buildPeriods(), []);
  const [periodKey, setPeriodKey] = useState<PeriodKey>(initial);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const period = selectPeriod(periods, periodKey, customFrom, customTo);

  return {
    periods,
    period,
    periodKey,
    setPeriodKey,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
  };
}
