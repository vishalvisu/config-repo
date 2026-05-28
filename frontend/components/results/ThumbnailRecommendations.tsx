"use client";

import { useState } from "react";
import { COPY } from "@/lib/copy";
import type { ThumbnailOptimization } from "@/lib/types";

interface ThumbnailRecommendationsProps {
  thumbnailOptimization: ThumbnailOptimization;
}

export function ThumbnailRecommendations({
  thumbnailOptimization,
}: ThumbnailRecommendationsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

  const generated = thumbnailOptimization.generated_thumbnails ?? [];

  const copy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = `coreai-thumbnail-${index + 1}.png`;
    link.click();
  };

  if (generated.length > 0) {
    return (
      <div className="rounded-xl border border-teal-500/25 bg-gradient-to-br from-teal-950/25 to-cyan-950/15 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-teal-100">
          <span>🖼️</span> {COPY.thumbnail.suggestedHeading}
        </h3>
        <p className="mt-1 text-xs text-teal-200/60">
          {COPY.thumbnail.suggestedSub}
        </p>

        <div
          className={`mt-4 grid gap-4 ${
            generated.length === 1 ? "max-w-md grid-cols-1" : "sm:grid-cols-3"
          }`}
        >
          {generated.map((thumb, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-teal-500/20 bg-zinc-950/60"
            >
              <img
                src={`data:image/png;base64,${thumb.image_base64}`}
                alt={`Recommended thumbnail ${i + 1}`}
                className="aspect-video w-full object-cover"
              />
              <div className="flex flex-wrap gap-2 p-2">
                <button
                  type="button"
                  onClick={() => downloadImage(thumb.image_base64, i)}
                  className="flex-1 rounded-md border border-teal-400/40 px-2 py-1.5 text-xs font-medium text-teal-200 hover:bg-teal-500/20"
                >
                  {COPY.thumbnail.download}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPrompt(expandedPrompt === i ? null : i)
                  }
                  className="rounded-md border border-zinc-600 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  {COPY.thumbnail.prompt}
                </button>
              </div>
              {expandedPrompt === i && (
                <p className="border-t border-zinc-800 px-2 py-2 text-[10px] leading-relaxed text-zinc-500">
                  {thumb.prompt_used}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-teal-500/25 bg-gradient-to-br from-teal-950/25 to-cyan-950/15 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-teal-100">
        <span>🖼️</span> {COPY.thumbnail.ideaHeading}
      </h3>
      <p className="mt-1 text-xs text-teal-200/60">{COPY.thumbnail.ideaSub}</p>

      <ul className="mt-4 space-y-3">
        {thumbnailOptimization.thumbnail_alternatives.map((concept, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-2 rounded-lg border border-teal-500/20 bg-zinc-950/50 p-3 text-sm text-zinc-100"
          >
            <span className="flex-1 leading-relaxed">
              <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {concept}
            </span>
            <button
              type="button"
              onClick={() => copy(concept, i)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                copiedIndex === i
                  ? "bg-emerald-500/30 text-emerald-300"
                  : "border border-teal-400/40 text-teal-200 hover:bg-teal-500/20"
              }`}
            >
              {copiedIndex === i ? COPY.results.copied : COPY.results.copy}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
