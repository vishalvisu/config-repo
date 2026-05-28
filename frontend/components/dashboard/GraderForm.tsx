"use client";

import { useCallback, useRef, useState } from "react";
import { COPY } from "@/lib/copy";
import type { Language, Niche } from "@/lib/types";
import { LANGUAGE_GROUPS, NICHES } from "@/lib/types";

interface GraderFormProps {
  isLoading: boolean;
  previewUrl: string | null;
  onPreviewChange: (url: string | null) => void;
  onSubmit: (payload: {
    title: string;
    videoContext: string;
    niche: Niche;
    language: Language;
    file: File;
  }) => void;
  errorMessage: string | null;
}

export function GraderForm({
  isLoading,
  previewUrl,
  onPreviewChange,
  onSubmit,
  errorMessage,
}: GraderFormProps) {
  const [title, setTitle] = useState("");
  const [videoContext, setVideoContext] = useState("");
  const [niche, setNiche] = useState<Niche>("Tech");
  const [language, setLanguage] = useState<Language>("Hinglish");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setThumbnail = useCallback(
    (next: File | null) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (!next) {
        setFile(null);
        onPreviewChange(null);
        return;
      }
      const ext = next.name.split(".").pop()?.toLowerCase();
      if (!ext || !["png", "jpg", "jpeg"].includes(ext)) {
        return;
      }
      setFile(next);
      onPreviewChange(URL.createObjectURL(next));
    },
    [onPreviewChange, previewUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) setThumbnail(dropped);
    },
    [setThumbnail],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    onSubmit({
      title: title.trim(),
      videoContext: videoContext.trim(),
      niche,
      language,
      file,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-glow rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-950/30 via-zinc-900/80 to-purple-950/30 p-6 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg shadow-md shadow-orange-500/25">
          ✨
        </span>
        <div>
          <h2 className="text-lg font-semibold text-amber-50">
            {COPY.form.cardTitle}
          </h2>
          <p className="mt-1 text-sm text-orange-100/70">
            {COPY.form.cardSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-amber-200/90"
          >
            {COPY.form.videoTitle}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ye Phone Hack Sabko Chahiye"
            className="w-full rounded-lg border border-orange-500/30 bg-zinc-950/90 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            required
            maxLength={500}
          />
        </div>

        <div>
          <label
            htmlFor="video_context"
            className="mb-1.5 block text-sm font-medium text-amber-200/90"
          >
            {COPY.form.videoContext}{" "}
            <span className="font-normal text-zinc-500">
              {COPY.form.videoContextOptional}
            </span>
          </label>
          <textarea
            id="video_context"
            value={videoContext}
            onChange={(e) => setVideoContext(e.target.value)}
            placeholder="e.g. RBI changed home loan rules in 2025 — who benefits, EMI impact, common mistakes"
            rows={3}
            maxLength={500}
            className="w-full resize-y rounded-lg border border-orange-500/30 bg-zinc-950/90 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          />
          <p className="mt-1 text-right text-xs text-zinc-500">
            {videoContext.length}/500
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="niche"
              className="mb-1.5 block text-sm font-medium text-teal-200/90"
            >
              {COPY.form.niche}
            </label>
            <select
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value as Niche)}
              className="w-full rounded-lg border border-teal-500/30 bg-zinc-950/90 px-4 py-2.5 text-zinc-100 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="language"
              className="mb-1.5 block text-sm font-medium text-pink-200/90"
            >
              {COPY.form.videoLanguage}
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full rounded-lg border border-pink-500/30 bg-zinc-950/90 px-4 py-2.5 text-zinc-100 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
            >
              {LANGUAGE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-purple-200/90">
            {COPY.form.thumbnail}
          </span>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-all ${
              isDragging
                ? "border-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/10 scale-[1.01]"
                : "border-purple-400/40 bg-gradient-to-br from-purple-950/40 to-orange-950/20 hover:border-amber-400/60 hover:from-amber-950/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) setThumbnail(picked);
              }}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Thumbnail preview"
                className="max-h-40 rounded-lg object-contain"
              />
            ) : (
              <>
                <p className="text-2xl">🖼️</p>
                <p className="mt-2 text-sm font-medium text-amber-100/90">
                  {COPY.form.thumbnailDrag}
                </p>
                <p className="mt-1 text-xs text-orange-300/60">
                  {COPY.form.thumbnailFormats}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !file || !title.trim()}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 hover:shadow-orange-400/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {COPY.form.analyzing}
          </>
        ) : (
          COPY.form.analyze
        )}
      </button>
    </form>
  );
}
