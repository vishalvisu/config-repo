"use client";

import { useCallback, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GraderForm } from "@/components/dashboard/GraderForm";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { analyzeGrader } from "@/lib/api";
import type {
  AnalyzeStatus,
  GraderAnalyzeResponse,
  Language,
  Niche,
} from "@/lib/types";

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalyzeStatus>("idle");
  const [result, setResult] = useState<GraderAnalyzeResponse | null>(null);
  const [originalTitle, setOriginalTitle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (payload: {
      title: string;
      videoContext: string;
      niche: Niche;
      language: Language;
      file: File;
    }) => {
      setStatus("loading");
      setErrorMessage(null);
      setOriginalTitle(payload.title);
      setSelectedLanguage(payload.language);

      const formData = new FormData();
      formData.append("title", payload.title);
      if (payload.videoContext) {
        formData.append("video_context", payload.videoContext);
      }
      formData.append("niche", payload.niche);
      formData.append("language", payload.language);
      formData.append("thumbnail", payload.file);

      try {
        const data = await analyzeGrader(formData);
        setResult(data);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setResult(null);
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      }
    },
    [],
  );

  return (
    <DashboardLayout
      form={
        <GraderForm
          isLoading={status === "loading"}
          previewUrl={previewUrl}
          onPreviewChange={setPreviewUrl}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      }
      results={
        <ResultsPanel
          status={status}
          result={result}
          originalTitle={originalTitle}
          previewUrl={previewUrl}
          language={selectedLanguage}
        />
      }
    />
  );
}
