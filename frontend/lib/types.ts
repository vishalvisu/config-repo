export type CtrGrade = "A" | "B" | "C" | "D" | "F";

export type Niche =
  | "Tech"
  | "Gaming"
  | "Finance"
  | "Vlogs"
  | "Comedy"
  | "Infotainment";

export type Language =
  | "English"
  | "Hinglish"
  | "Pure Hindi"
  | "Tamil"
  | "Telugu"
  | "Bengali"
  | "Marathi"
  | "Kannada"
  | "Malayalam"
  | "Gujarati"
  | "Punjabi"
  | "Odia"
  | "Other Regional";

export const NICHES: Niche[] = [
  "Tech",
  "Gaming",
  "Finance",
  "Vlogs",
  "Comedy",
  "Infotainment",
];

export const LANGUAGE_GROUPS: { label: string; options: Language[] }[] = [
  { label: "Popular", options: ["English", "Hinglish", "Pure Hindi"] },
  {
    label: "South India",
    options: ["Tamil", "Telugu", "Kannada", "Malayalam"],
  },
  {
    label: "East & West India",
    options: ["Bengali", "Marathi", "Gujarati", "Punjabi", "Odia"],
  },
  { label: "Other", options: ["Other Regional"] },
];

export interface GraderSummary {
  ctr_grade: CtrGrade;
  overall_feedback: string;
}

export interface GraderScores {
  text_contrast: number;
  mobile_legibility: number;
  curiosity_score: number;
}

export interface VisualCritique {
  flaw: string;
  fix: string;
}

export interface TitleOptimization {
  flaw: string;
  hinglish_alternatives: string[];
}

export interface GeneratedThumbnail {
  prompt_used: string;
  image_base64: string;
}

export interface ThumbnailOptimization {
  flaw: string;
  fix: string;
  thumbnail_alternatives: string[];
  on_image_text_language?: string | null;
  generated_thumbnails: GeneratedThumbnail[];
}

export interface GraderAnalyzeResponse {
  summary: GraderSummary;
  scores: GraderScores;
  visual_critique: VisualCritique;
  title_optimization: TitleOptimization;
  thumbnail_optimization: ThumbnailOptimization;
}

export type AnalyzeStatus = "idle" | "loading" | "success" | "error";

export type PacingStyle = "Fast" | "Balanced" | "Storytelling" | "Tutorial";

export const PACING_STYLES: PacingStyle[] = [
  "Fast",
  "Balanced",
  "Storytelling",
  "Tutorial",
];

export interface HookAnalysis {
  dikkat: string;
  kya_badlo: string;
  hook_score: number;
}

export interface BoredomZone {
  zone_label: string;
  start_sentence: number | null;
  end_sentence: number | null;
  start_seconds: number | null;
  end_seconds: number | null;
  dikkat: string;
  kya_badlo: string;
}

export interface ScriptDoctorResponse {
  hook: HookAnalysis;
  retention_score: number;
  overall_feedback: string;
  pacing_feedback: string;
  boredom_zones: BoredomZone[];
}
