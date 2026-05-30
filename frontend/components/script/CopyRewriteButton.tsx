"use client";

import { useState } from "react";

import { COPY } from "@/lib/copy";
import { extractSuggestedRewrite } from "@/lib/scriptRewrite";

interface CopyRewriteButtonProps {
  kyaBadlo: string;
}

export function CopyRewriteButton({ kyaBadlo }: CopyRewriteButtonProps) {
  const [copied, setCopied] = useState(false);
  const suggestedRewrite = extractSuggestedRewrite(kyaBadlo);

  if (!suggestedRewrite) return null;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(suggestedRewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
        copied
          ? "bg-emerald-500/30 text-emerald-300"
          : "border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/20"
      }`}
    >
      {copied ? COPY.results.copied : COPY.script.copyRewrite}
    </button>
  );
}
