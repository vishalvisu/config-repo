"use client";

import { useMemo, useState } from "react";

import { HighlightedScriptEditor } from "@/components/script/HighlightedScriptEditor";
import { COPY } from "@/lib/copy";
import type { SentenceHighlight } from "@/lib/scriptZones";
import type {
  ExpectedLength,
  PacingStyle,
  VideoCategory,
} from "@/lib/types";
import {
  EXPECTED_LENGTHS,
  PACING_STYLES,
  VIDEO_CATEGORIES,
} from "@/lib/types";

const MIN_CHARS = 50;
const MIN_AUDIENCE_CHARS = 2;

interface ScriptEditorFormProps {
  scriptText: string;
  onScriptTextChange: (text: string) => void;
  highlight: SentenceHighlight | null;
  isLoading: boolean;
  onSubmit: (payload: {
    scriptText: string;
    pacingStyle: PacingStyle;
    targetAudience: string;
    category: VideoCategory;
    expectedLength: ExpectedLength;
  }) => void;
  errorMessage: string | null;
}

export function ScriptEditorForm({
  scriptText,
  onScriptTextChange,
  highlight,
  isLoading,
  onSubmit,
  errorMessage,
}: ScriptEditorFormProps) {
  const [pacingStyle, setPacingStyle] = useState<PacingStyle>("Balanced");
  const [targetAudience, setTargetAudience] = useState("");
  const [category, setCategory] = useState<VideoCategory>("Tutorial");
  const [expectedLength, setExpectedLength] =
    useState<ExpectedLength>("5–15 min");

  const wordCount = useMemo(
    () => scriptText.trim().split(/\s+/).filter(Boolean).length,
    [scriptText],
  );

  const isValid =
    scriptText.trim().length >= MIN_CHARS &&
    targetAudience.trim().length >= MIN_AUDIENCE_CHARS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit({
      scriptText: scriptText.trim(),
      pacingStyle,
      targetAudience: targetAudience.trim(),
      category,
      expectedLength,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-glow space-y-5 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 via-zinc-900/80 to-purple-950/20 p-6 backdrop-blur-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-amber-100">
          {COPY.script.cardTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{COPY.script.cardSubtitle}</p>
        <p className="mt-3 rounded-lg border border-teal-500/20 bg-teal-950/20 px-3 py-2 text-xs leading-relaxed text-teal-200/90">
          {COPY.script.textOnlyNote}
        </p>
      </div>

      <div>
        <label
          htmlFor="script-text"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          {COPY.script.scriptLabel}
        </label>
        <HighlightedScriptEditor
          id="script-text"
          value={scriptText}
          onChange={onScriptTextChange}
          highlight={highlight}
          placeholder={COPY.script.scriptPlaceholder}
          rows={14}
          disabled={isLoading}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {wordCount} {COPY.script.wordCount}
          </span>
          {!isValid && scriptText.length > 0 && (
            <span className="text-amber-400/90">{COPY.script.minLengthHint}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="target-audience"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            {COPY.script.targetAudience}
          </label>
          <input
            id="target-audience"
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={COPY.script.targetAudiencePlaceholder}
            disabled={isLoading}
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="script-category"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            {COPY.script.category}
          </label>
          <select
            id="script-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as VideoCategory)}
            disabled={isLoading}
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
          >
            {VIDEO_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="expected-length"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            {COPY.script.expectedLength}
          </label>
          <select
            id="expected-length"
            value={expectedLength}
            onChange={(e) =>
              setExpectedLength(e.target.value as ExpectedLength)
            }
            disabled={isLoading}
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
          >
            {EXPECTED_LENGTHS.map((length) => (
              <option key={length} value={length}>
                {length}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="pacing-style"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          {COPY.script.pacingStyle}
        </label>
        <select
          id="pacing-style"
          value={pacingStyle}
          onChange={(e) => setPacingStyle(e.target.value as PacingStyle)}
          disabled={isLoading}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
        >
          {PACING_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-amber-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? COPY.script.analyzing : COPY.script.analyze}
      </button>
    </form>
  );
}
