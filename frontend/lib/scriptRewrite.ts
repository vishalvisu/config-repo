const EXAMPLE_PREFIX =
  /(?:for example|e\.g\.?|try this|rewrite:|example:|such as|like)/i;
const MIN_REWRITE_LENGTH = 12;

const QUOTED_SEGMENTS =
  /\u201C([^\u201D]+)\u201D|"([^"]+)"|\u2018([^\u2019]+)\u2019|'([^']+)'/g;

function pushCandidate(candidates: string[], segment: string | undefined) {
  const trimmed = segment?.trim();
  if (trimmed) candidates.push(trimmed);
}

function extractAfterExample(text: string): string | null {
  const exampleMatch = text.match(EXAMPLE_PREFIX);
  if (!exampleMatch?.index && exampleMatch?.index !== 0) return null;

  const afterExample = text.slice(exampleMatch.index + exampleMatch[0].length);
  const openMatch = afterExample.match(/[\u2018\u201C'"]/);
  if (!openMatch?.index && openMatch?.index !== 0) return null;

  const quoted = afterExample.slice(openMatch.index);
  const openChar = quoted[0];
  const closeChar =
    openChar === "'"
      ? "'"
      : openChar === '"'
        ? '"'
        : openChar === "\u2018"
          ? "\u2019"
          : "\u201D";

  const closeIdx = quoted.lastIndexOf(closeChar);
  if (closeIdx <= 0) return null;

  return quoted.slice(1, closeIdx).trim();
}

/** Pull quoted rewrite text out of a KYA BADLO block (instruction + example). */
export function extractSuggestedRewrite(kyaBadlo: string): string | null {
  const text = kyaBadlo.trim();
  if (!text) return null;

  const afterCue = extractAfterExample(text);
  if (afterCue && afterCue.length >= MIN_REWRITE_LENGTH) {
    return afterCue;
  }

  const candidates: string[] = [];
  for (const match of text.matchAll(QUOTED_SEGMENTS)) {
    pushCandidate(candidates, match[1] ?? match[2] ?? match[3] ?? match[4]);
  }

  const meaningful = candidates.filter((segment) => segment.length >= MIN_REWRITE_LENGTH);
  if (meaningful.length === 0) return null;

  return meaningful.sort((a, b) => b.length - a.length)[0];
}
