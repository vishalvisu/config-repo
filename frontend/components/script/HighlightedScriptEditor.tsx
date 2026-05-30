"use client";

import { useCallback, useMemo, useRef } from "react";

import {
  buildHighlightSegments,
  type SentenceHighlight,
} from "@/lib/scriptZones";

interface HighlightedScriptEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  highlight: SentenceHighlight | null;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

const EDITOR_CLASSES =
  "w-full resize-y px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words";

export function HighlightedScriptEditor({
  id,
  value,
  onChange,
  highlight,
  placeholder,
  rows = 14,
  disabled = false,
}: HighlightedScriptEditorProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const segments = useMemo(
    () => buildHighlightSegments(value, highlight),
    [value, highlight],
  );

  const syncScroll = useCallback((scrollTop: number, scrollLeft: number) => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    backdrop.scrollTop = scrollTop;
    backdrop.scrollLeft = scrollLeft;
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950/60 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/20">
      <div
        ref={backdropRef}
        aria-hidden
        className={`${EDITOR_CLASSES} pointer-events-none absolute inset-0 overflow-auto text-zinc-100`}
        style={{ minHeight: `${rows * 1.625}rem` }}
      >
        {value ? (
          segments.map((segment, i) =>
            segment.highlighted ? (
              <mark
                key={i}
                className="rounded-sm bg-amber-500/25 text-zinc-100"
              >
                {segment.text}
              </mark>
            ) : (
              <span key={i}>{segment.text}</span>
            ),
          )
        ) : (
          <span className="text-zinc-600">{placeholder}</span>
        )}
      </div>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) =>
          syncScroll(e.currentTarget.scrollTop, e.currentTarget.scrollLeft)
        }
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        spellCheck
        className={`${EDITOR_CLASSES} relative block bg-transparent text-transparent caret-zinc-100 selection:bg-orange-500/30 focus:outline-none disabled:opacity-60`}
      />
    </div>
  );
}
