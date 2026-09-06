import { dayFile, getRecord } from "../content";
import type { DayMoment, Kind } from "../types";

export const DAY_END_MINUTES = 1440;

export interface DayTotals {
  emitted: number;
  relational: number;
  inferred: number;
  total: number;
}

export function momentsUpTo(minutes: number): DayMoment[] {
  return dayFile.moments.filter((m) => m.t <= minutes);
}

export function totalsFor(moments: DayMoment[]): DayTotals {
  let emitted = 0;
  let relational = 0;
  let inferred = 0;
  for (const moment of moments) {
    for (const entry of moment.entries) {
      const kind: Kind = getRecord(entry.record).kind;
      if (kind === "emitted") emitted += entry.count;
      else if (kind === "relational") relational += entry.count;
      else inferred += entry.count;
    }
  }
  return { emitted, relational, inferred, total: emitted + relational + inferred };
}

export interface CumulativePoint {
  t: number;
  value: number;
  hasInference: boolean;
}

export const cumulativeSeries: CumulativePoint[] = (() => {
  let acc = 0;
  return dayFile.moments.map((m) => {
    const totals = totalsFor([m]);
    acc += totals.emitted + totals.relational;
    return { t: m.t, value: acc, hasInference: totals.inferred > 0 };
  });
})();

export const maxCumulativeValue = cumulativeSeries[cumulativeSeries.length - 1]?.value ?? 1;

export function formatClock(minutes: number): string {
  const clamped = Math.max(0, Math.min(DAY_END_MINUTES, minutes));
  const hh = Math.floor(clamped / 60) % 24;
  const mm = clamped % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
