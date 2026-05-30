import type { BoredomZone } from "@/lib/types";

export interface SentenceSpan {
  index: number;
  start: number;
  end: number;
  text: string;
}

export type SentenceHighlight = {
  startSentence: number;
  endSentence: number;
};

const SENTENCE_SPLIT = /(?<=[.!?])\s+|\n+/;

/** Split script into sentences (matches backend _split_sentences). */
export function splitSentences(scriptText: string): string[] {
  const trimmed = scriptText.trim();
  if (!trimmed) return [];
  return trimmed.split(SENTENCE_SPLIT).filter((part) => part.length > 0);
}

/** Sentence spans with char offsets in the original scriptText string. */
export function parseSentenceSpans(scriptText: string): SentenceSpan[] {
  const trimmed = scriptText.trim();
  if (!trimmed) return [];

  const leading = scriptText.indexOf(trimmed);
  const sentences = splitSentences(scriptText);
  const spans: SentenceSpan[] = [];
  let searchFrom = 0;

  for (let i = 0; i < sentences.length; i++) {
    const text = sentences[i];
    const idx = trimmed.indexOf(text, searchFrom);
    if (idx === -1) break;

    spans.push({
      index: i + 1,
      start: leading + idx,
      end: leading + idx + text.length,
      text,
    });
    searchFrom = idx + text.length;
  }

  return spans;
}

export function sentenceRangeFromZone(
  zone: BoredomZone,
): SentenceHighlight | null {
  if (zone.start_sentence == null || zone.end_sentence == null) {
    return null;
  }
  return {
    startSentence: zone.start_sentence,
    endSentence: zone.end_sentence,
  };
}

export function isSentenceHighlighted(
  index: number,
  highlight: SentenceHighlight | null,
): boolean {
  if (!highlight) return false;
  return (
    index >= highlight.startSentence && index <= highlight.endSentence
  );
}

export function zoneKey(zone: BoredomZone): string {
  return `${zone.start_sentence ?? "x"}-${zone.end_sentence ?? "x"}-${zone.dikkat.slice(0, 32)}`;
}

/** Prefer sentence range label when API provides indices. */
export function formatZoneLabel(zone: BoredomZone): string {
  if (zone.start_sentence != null && zone.end_sentence != null) {
    if (zone.start_sentence === zone.end_sentence) {
      return `Sentence ${zone.start_sentence}`;
    }
    return `Sentences ${zone.start_sentence}–${zone.end_sentence}`;
  }
  return zone.zone_label;
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/** Build render segments for mirror-layer editor (covers full scriptText). */
export function buildHighlightSegments(
  scriptText: string,
  highlight: SentenceHighlight | null,
): HighlightSegment[] {
  if (!scriptText) return [];

  const spans = parseSentenceSpans(scriptText);
  if (spans.length === 0) {
    return [{ text: scriptText, highlighted: false }];
  }

  const segments: HighlightSegment[] = [];
  let lastEnd = 0;

  for (const span of spans) {
    if (span.start > lastEnd) {
      segments.push({
        text: scriptText.slice(lastEnd, span.start),
        highlighted: false,
      });
    }
    segments.push({
      text: scriptText.slice(span.start, span.end),
      highlighted: isSentenceHighlighted(span.index, highlight),
    });
    lastEnd = span.end;
  }

  if (lastEnd < scriptText.length) {
    segments.push({
      text: scriptText.slice(lastEnd),
      highlighted: false,
    });
  }

  return segments;
}

export function highlightsEqual(
  a: SentenceHighlight | null,
  b: SentenceHighlight | null,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.startSentence === b.startSentence && a.endSentence === b.endSentence
  );
}
