import type {
  ExpectedLength,
  GraderAnalyzeResponse,
  Language,
  PacingStyle,
  ScriptDoctorResponse,
  VideoCategory,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function formatErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String((item as { msg: string }).msg);
        }
        return JSON.stringify(item);
      })
      .join("; ");
  }
  if (detail && typeof detail === "object" && "msg" in detail) {
    return String((detail as { msg: string }).msg);
  }
  return "Analysis failed. Please try again.";
}

export async function analyzeGrader(
  data: FormData,
): Promise<GraderAnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/grader/analyze`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        message = formatErrorDetail(body.detail);
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }

  return res.json() as Promise<GraderAnalyzeResponse>;
}

export async function analyzeScript(payload: {
  script_text: string;
  pacing_style: PacingStyle;
  target_audience: string;
  category: VideoCategory;
  expected_length: ExpectedLength;
}): Promise<ScriptDoctorResponse> {
  const res = await fetch(`${API_BASE}/api/v1/script/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        message = formatErrorDetail(body.detail);
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }

  return res.json() as Promise<ScriptDoctorResponse>;
}
