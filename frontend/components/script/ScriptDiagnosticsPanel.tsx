import { CopyRewriteButton } from "@/components/script/CopyRewriteButton";
import { COPY } from "@/lib/copy";
import { extractSuggestedRewrite } from "@/lib/scriptRewrite";
import {
  formatZoneLabel,
  sentenceRangeFromZone,
  type SentenceHighlight,
  zoneKey,
} from "@/lib/scriptZones";
import type { AnalyzeStatus, BoredomZone, ScriptDoctorResponse } from "@/lib/types";

interface ScriptDiagnosticsPanelProps {
  status: AnalyzeStatus;
  result: ScriptDoctorResponse | null;
  activeZoneKey?: string | null;
  onZoneHover?: (highlight: SentenceHighlight | null) => void;
  onZoneClick?: (zone: BoredomZone) => void;
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color =
    score >= 75
      ? "from-emerald-500 to-teal-500"
      : score >= 50
        ? "from-amber-500 to-orange-500"
        : "from-rose-500 to-pink-500";

  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-700/50 bg-zinc-950/40 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span
        className={`mt-1 bg-gradient-to-r ${color} bg-clip-text text-3xl font-bold text-transparent`}
      >
        {score}
      </span>
    </div>
  );
}

function CritiqueCard({
  dikkat,
  kyaBadlo,
  zoneLabel,
  interactive = false,
  isActive = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onKeyDown,
}: {
  dikkat: string;
  kyaBadlo: string;
  zoneLabel?: string;
  interactive?: boolean;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`rounded-xl border border-rose-500/25 bg-gradient-to-r from-rose-950/30 to-emerald-950/20 p-4 transition ${
        interactive ? "cursor-pointer hover:border-amber-400/40" : ""
      } ${isActive ? "ring-2 ring-amber-400/50" : ""}`}
    >
      {zoneLabel && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-300/90">
          {zoneLabel}
        </p>
      )}
      <dl className="space-y-3 text-sm">
        <div className="rounded-lg bg-rose-950/40 p-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-rose-300">
            {COPY.script.dikkat}
          </dt>
          <dd className="mt-1 text-zinc-200">{dikkat}</dd>
        </div>
        <div
          className={`relative rounded-lg bg-emerald-950/40 p-3 ${
            extractSuggestedRewrite(kyaBadlo) ? "pb-10" : ""
          }`}
        >
          <dt className="text-xs font-bold uppercase tracking-wide text-emerald-300">
            {COPY.script.kyaBadlo}
          </dt>
          <dd className="mt-1 pr-2 text-zinc-200">{kyaBadlo}</dd>
          <div className="absolute bottom-2 right-2">
            <CopyRewriteButton kyaBadlo={kyaBadlo} />
          </div>
        </div>
      </dl>
    </div>
  );
}

function DiagnosticsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-orange-950/20 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 rounded-xl bg-zinc-800/50" />
        <div className="h-20 rounded-xl bg-zinc-800/50" />
      </div>
      <div className="h-24 rounded-xl bg-zinc-800/50" />
      <div className="h-32 rounded-xl bg-zinc-800/50" />
      <div className="h-32 rounded-xl bg-zinc-800/50" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-400/30 bg-gradient-to-br from-amber-950/20 via-purple-950/15 to-teal-950/20 p-8 text-center">
      <span className="text-4xl">📝</span>
      <p className="mt-4 text-sm font-semibold text-amber-100/90">
        {COPY.script.emptyTitle}
      </p>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-orange-200/60">
        {COPY.script.emptyBody}
      </p>
    </div>
  );
}

export function ScriptDiagnosticsPanel({
  status,
  result,
  activeZoneKey = null,
  onZoneHover,
  onZoneClick,
}: ScriptDiagnosticsPanelProps) {
  if (status === "loading") {
    return <DiagnosticsSkeleton />;
  }

  if (status !== "success" || !result) {
    return <EmptyState />;
  }

  return (
    <div className="card-glow space-y-6 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-950/25 via-zinc-900/80 to-fuchsia-950/25 p-6 backdrop-blur-sm">
      <div>
        <h3 className="text-sm font-semibold text-teal-200">
          {COPY.script.diagnosticsTitle}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {COPY.script.diagnosticsSubtitle}
        </p>
        <p className="mt-2 text-xs text-teal-300/80">
          {COPY.script.diagnosticsTextOnlyNote}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScoreBadge label={COPY.script.hookScore} score={result.hook.hook_score} />
        <ScoreBadge
          label={COPY.script.retentionScore}
          score={result.retention_score}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-zinc-700/40 bg-zinc-950/30 p-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {COPY.script.overallFeedback}
          </p>
          <p className="mt-1 leading-relaxed text-zinc-200">
            {result.overall_feedback}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {COPY.script.pacingFeedback}
          </p>
          <p className="mt-1 leading-relaxed text-zinc-200">
            {result.pacing_feedback}
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-100">
          <span>🎯</span> {COPY.script.hookHeading}
        </h4>
        <CritiqueCard
          dikkat={result.hook.dikkat}
          kyaBadlo={result.hook.kya_badlo}
        />
      </div>

      {result.boredom_zones.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-100">
            <span>⚠️</span> {COPY.script.boredomZones}
          </h4>
          <p className="mb-3 text-xs text-zinc-500">
            {COPY.script.zoneHighlightHint}
          </p>
          <div className="space-y-4">
            {result.boredom_zones.map((zone) => {
              const key = zoneKey(zone);
              const range = sentenceRangeFromZone(zone);
              const interactive = range != null;

              return (
                <CritiqueCard
                  key={key}
                  zoneLabel={formatZoneLabel(zone)}
                  dikkat={zone.dikkat}
                  kyaBadlo={zone.kya_badlo}
                  interactive={interactive}
                  isActive={activeZoneKey === key}
                  onMouseEnter={() =>
                    interactive && onZoneHover?.(range)
                  }
                  onMouseLeave={() => onZoneHover?.(null)}
                  onClick={() => interactive && onZoneClick?.(zone)}
                  onKeyDown={(e) => {
                    if (!interactive) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onZoneClick?.(zone);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
