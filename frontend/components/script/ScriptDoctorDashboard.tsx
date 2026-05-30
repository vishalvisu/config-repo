"use client";

import { useCallback, useMemo, useState } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScriptDiagnosticsPanel } from "@/components/script/ScriptDiagnosticsPanel";
import { ScriptEditorForm } from "@/components/script/ScriptEditorForm";
import { analyzeScript } from "@/lib/api";
import {
  highlightsEqual,
  sentenceRangeFromZone,
  type SentenceHighlight,
  zoneKey,
} from "@/lib/scriptZones";
import type {
  AnalyzeStatus,
  BoredomZone,
  ExpectedLength,
  PacingStyle,
  ScriptDoctorResponse,
  VideoCategory,
} from "@/lib/types";

export function ScriptDoctorDashboard() {
  const [scriptText, setScriptText] = useState("");
  const [status, setStatus] = useState<AnalyzeStatus>("idle");
  const [result, setResult] = useState<ScriptDoctorResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoverHighlight, setHoverHighlight] =
    useState<SentenceHighlight | null>(null);
  const [pinnedHighlight, setPinnedHighlight] =
    useState<SentenceHighlight | null>(null);
  const [pinnedZoneKey, setPinnedZoneKey] = useState<string | null>(null);

  const activeHighlight = pinnedHighlight ?? hoverHighlight;

  const handleSubmit = useCallback(
    async (payload: {
      scriptText: string;
      pacingStyle: PacingStyle;
      targetAudience: string;
      category: VideoCategory;
      expectedLength: ExpectedLength;
    }) => {
      setStatus("loading");
      setErrorMessage(null);
      setHoverHighlight(null);
      setPinnedHighlight(null);
      setPinnedZoneKey(null);

      try {
        const data = await analyzeScript({
          script_text: payload.scriptText,
          pacing_style: payload.pacingStyle,
          target_audience: payload.targetAudience,
          category: payload.category,
          expected_length: payload.expectedLength,
        });
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

  const handleZoneHover = useCallback((highlight: SentenceHighlight | null) => {
    setHoverHighlight(highlight);
  }, []);

  const handleZoneClick = useCallback((zone: BoredomZone) => {
    const range = sentenceRangeFromZone(zone);
    if (!range) return;

    const key = zoneKey(zone);
    if (
      pinnedZoneKey === key &&
      highlightsEqual(pinnedHighlight, range)
    ) {
      setPinnedHighlight(null);
      setPinnedZoneKey(null);
      return;
    }

    setPinnedHighlight(range);
    setPinnedZoneKey(key);
  }, [pinnedHighlight, pinnedZoneKey]);

  const activeZoneKey = useMemo(() => {
    if (pinnedZoneKey) return pinnedZoneKey;
    if (!hoverHighlight || !result) return null;
    const zone = result.boredom_zones.find((z) =>
      highlightsEqual(sentenceRangeFromZone(z), hoverHighlight),
    );
    return zone ? zoneKey(zone) : null;
  }, [pinnedZoneKey, hoverHighlight, result]);

  return (
    <DashboardLayout
      form={
        <ScriptEditorForm
          scriptText={scriptText}
          onScriptTextChange={setScriptText}
          highlight={activeHighlight}
          isLoading={status === "loading"}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      }
      results={
        <ScriptDiagnosticsPanel
          status={status}
          result={result}
          activeZoneKey={activeZoneKey}
          onZoneHover={handleZoneHover}
          onZoneClick={handleZoneClick}
        />
      }
    />
  );
}
