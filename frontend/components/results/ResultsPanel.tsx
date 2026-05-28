import { COPY } from "@/lib/copy";
import type {
  AnalyzeStatus,
  GraderAnalyzeResponse,
  Language,
} from "@/lib/types";
import { GradeBadge } from "./GradeBadge";
import { MetricsGrid } from "./MetricsGrid";
import { ThumbnailSimulator } from "./ThumbnailSimulator";
import { ThumbnailRecommendations } from "./ThumbnailRecommendations";
import { TitleComparison } from "./TitleComparison";

interface ResultsPanelProps {
  status: AnalyzeStatus;
  result: GraderAnalyzeResponse | null;
  originalTitle: string;
  previewUrl: string | null;
  language: Language | null;
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-orange-950/20 p-6">
      <div className="mx-auto h-36 w-36 rounded-full bg-gradient-to-br from-amber-900/50 to-orange-900/50" />
      <div className="space-y-3">
        <div className="h-2.5 rounded-full bg-amber-900/40" />
        <div className="h-2.5 rounded-full bg-teal-900/40" />
        <div className="h-2.5 rounded-full bg-pink-900/40" />
      </div>
      <div className="h-24 rounded-xl bg-zinc-800/50" />
      <div className="h-32 rounded-xl bg-zinc-800/50" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-400/30 bg-gradient-to-br from-amber-950/20 via-purple-950/15 to-teal-950/20 p-8 text-center">
      <span className="text-4xl">📊</span>
      <p className="mt-4 text-sm font-semibold text-amber-100/90">
        {COPY.empty.title}
      </p>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-orange-200/60">
        {COPY.empty.body}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-medium text-amber-300">
          {COPY.empty.pillCtr}
        </span>
        <span className="rounded-full bg-teal-500/20 px-3 py-1 text-[10px] font-medium text-teal-300">
          {COPY.empty.pillScores}
        </span>
        <span className="rounded-full bg-pink-500/20 px-3 py-1 text-[10px] font-medium text-pink-300">
          {COPY.empty.pillTitles}
        </span>
        <span className="rounded-full bg-teal-500/20 px-3 py-1 text-[10px] font-medium text-teal-300">
          {COPY.empty.pillThumbnail}
        </span>
      </div>
    </div>
  );
}

export function ResultsPanel({
  status,
  result,
  originalTitle,
  previewUrl,
  language,
}: ResultsPanelProps) {
  if (status === "loading") {
    return <ResultsSkeleton />;
  }

  if (status !== "success" || !result) {
    return <EmptyState />;
  }

  return (
    <div className="card-glow space-y-6 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-950/25 via-zinc-900/80 to-fuchsia-950/25 p-6 backdrop-blur-sm">
      <div className="flex flex-col items-center border-b border-orange-500/20 pb-6">
        <GradeBadge grade={result.summary.ctr_grade} />
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-orange-50/80">
          {result.summary.overall_feedback}
        </p>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-200">
          <span className="text-base">📈</span> {COPY.results.metricsHeading}
        </h3>
        <MetricsGrid scores={result.scores} />
      </div>

      <div className="rounded-xl border border-rose-500/25 bg-gradient-to-r from-rose-950/30 to-emerald-950/20 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <span>🎨</span> {COPY.results.critiqueHeading}
        </h3>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="rounded-lg bg-rose-950/40 p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-rose-300">
              {COPY.results.critiqueFlaw}
            </dt>
            <dd className="mt-1 text-zinc-200">{result.visual_critique.flaw}</dd>
          </div>
          <div className="rounded-lg bg-emerald-950/40 p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-emerald-300">
              {COPY.results.critiqueFix}
            </dt>
            <dd className="mt-1 text-zinc-200">{result.visual_critique.fix}</dd>
          </div>
        </dl>
      </div>

      <TitleComparison
        originalTitle={originalTitle}
        flaw={result.title_optimization.flaw}
        alternatives={result.title_optimization.hinglish_alternatives}
        language={language}
      />

      <ThumbnailRecommendations
        thumbnailOptimization={result.thumbnail_optimization}
      />

      {previewUrl && <ThumbnailSimulator previewUrl={previewUrl} />}
    </div>
  );
}
