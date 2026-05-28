import { COPY } from "@/lib/copy";
import type { CtrGrade } from "@/lib/types";

const GRADE_COLORS: Record<
  CtrGrade,
  { ring: string; text: string; glow: string; bg: string }
> = {
  A: {
    ring: "border-amber-400",
    text: "text-amber-300",
    glow: "shadow-amber-400/40",
    bg: "bg-gradient-to-br from-amber-500/20 to-yellow-600/10",
  },
  B: {
    ring: "border-emerald-400",
    text: "text-emerald-300",
    glow: "shadow-emerald-400/35",
    bg: "bg-gradient-to-br from-emerald-500/20 to-teal-600/10",
  },
  C: {
    ring: "border-orange-400",
    text: "text-orange-300",
    glow: "shadow-orange-400/35",
    bg: "bg-gradient-to-br from-orange-500/20 to-amber-600/10",
  },
  D: {
    ring: "border-rose-400",
    text: "text-rose-300",
    glow: "shadow-rose-400/35",
    bg: "bg-gradient-to-br from-rose-500/20 to-red-600/10",
  },
  F: {
    ring: "border-red-500",
    text: "text-red-300",
    glow: "shadow-red-500/40",
    bg: "bg-gradient-to-br from-red-600/25 to-rose-900/20",
  },
};

interface GradeBadgeProps {
  grade: CtrGrade;
}

export function GradeBadge({ grade }: GradeBadgeProps) {
  const colors = GRADE_COLORS[grade];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex h-36 w-36 items-center justify-center rounded-full border-[6px] shadow-xl ${colors.ring} ${colors.glow} ${colors.bg}`}
      >
        <div
          className={`absolute inset-2 rounded-full border-2 border-dashed opacity-50 ${colors.ring}`}
        />
        <span className={`text-5xl font-black tracking-tight ${colors.text}`}>
          {grade}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-amber-200/70">
        {COPY.results.gradeCaption}
      </p>
    </div>
  );
}
