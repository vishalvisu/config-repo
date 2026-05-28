"use client";

import { useState } from "react";
import { COPY, getAlternativesLabel } from "@/lib/copy";
import type { Language } from "@/lib/types";

interface TitleComparisonProps {
  originalTitle: string;
  flaw: string;
  alternatives: string[];
  language: Language | null;
}

export function TitleComparison({
  originalTitle,
  flaw,
  alternatives,
  language,
}: TitleComparisonProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-950/25 to-orange-950/15 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-100">
        <span>✍️</span> {COPY.results.titleSection}
      </h3>
      <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
        {flaw}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-600/50 bg-zinc-950/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            {COPY.results.draftLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">
            {originalTitle}
          </p>
        </div>

        <div className="rounded-lg border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 to-pink-950/30 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-300">
            {getAlternativesLabel(language)}
          </p>
          <ul className="mt-2 space-y-3">
            {alternatives.map((alt, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 text-sm text-zinc-100"
              >
                <span className="flex-1 leading-relaxed">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {alt}
                </span>
                <button
                  type="button"
                  onClick={() => copy(alt, i)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    copiedIndex === i
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "border border-fuchsia-400/40 text-fuchsia-200 hover:bg-fuchsia-500/20"
                  }`}
                >
                  {copiedIndex === i ? COPY.results.copied : COPY.results.copy}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
