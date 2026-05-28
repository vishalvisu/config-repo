import { COPY, METRIC_KEYS } from "@/lib/copy";
import type { GraderScores } from "@/lib/types";

interface MetricsGridProps {
  scores: GraderScores;
}

export function MetricsGrid({ scores }: MetricsGridProps) {
  return (
    <div className="space-y-4">
      {METRIC_KEYS.map(({ key, labelKey, barClass, labelClass }) => {
        const value = scores[key];
        const label = COPY.metrics[labelKey];
        return (
          <div key={key}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className={`font-medium ${labelClass}`}>{label}</span>
              <span className="font-semibold text-zinc-100">{value}/100</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800/80 ring-1 ring-white/5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
