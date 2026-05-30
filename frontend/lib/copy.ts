import type { GraderScores, Language } from "@/lib/types";

/** Shown in header wordmark and page hero — keep in sync */
const APP_HEADLINE = "Title aur Thumbnail Check";

export const COPY = {
  brand: {
    logoLetter: "T",
    header: APP_HEADLINE,
  },
  meta: {
    title: "YouTube Title & Thumbnail Checker for Indian Creators | ClickKaro",
    description:
      "Free YouTube title checker and thumbnail analyzer for Indian creators. Get CTR grade, Hinglish title ideas, AI thumbnail tips, and packaging scores — Title aur Thumbnail Check.",
  },
  seoIntro:
    "Free YouTube title checker and thumbnail analyzer built for Indian creators. Upload your thumbnail, get a CTR grade, Hinglish title suggestions, and AI-powered thumbnail tips in one place.",
  hero: {
    eyebrow: "🇮🇳 Creator dashboard",
    title: APP_HEADLINE,
    subtitle:
      "Apne video ka packaging Indian audience ke liye optimize karo — behtar title ideas, thumbnail tips, aur CTR grade ek hi jagah.",
    madeFor: "Made for Indian creators",
  },
  heroScript: {
    title: "Script Checker",
    subtitle:
      "Apne video script ka hook aur retention check karo — hook score, boredom zones, aur KYA BADLO suggestions ek hi jagah.",
    seoIntro:
      "Free YouTube script checker for Indian creators. Paste your spoken script, get hook score, retention score, boredom zones, and copy-ready KYA BADLO rewrites.",
  },
  form: {
    cardTitle: "Video packaging check",
    cardSubtitle:
      "Title + thumbnail daalo — score aur suggestions milenge.",
    videoTitle: "Video title",
    videoContext: "What is this video about?",
    videoContextOptional: "(optional)",
    niche: "Niche",
    videoLanguage: "Video language",
    thumbnail: "Thumbnail",
    thumbnailDrag: "Thumbnail yahan drag karo",
    thumbnailFormats: "PNG ya JPG",
    analyze: "Analyze karo →",
    analyzing: "Check ho raha hai…",
  },
  empty: {
    title: "Results yahan dikhenge",
    body: "Title aur thumbnail submit karo — CTR grade, scores, aur title suggestions milenge.",
    pillCtr: "CTR grade",
    pillScores: "Scores",
    pillTitles: "Behtar titles",
    pillThumbnail: "AI thumbnail",
  },
  results: {
    gradeCaption: "Aapka CTR grade",
    metricsHeading: "Thumbnail scores",
    critiqueHeading: "Thumbnail review",
    critiqueFlaw: "Dikkat",
    critiqueFix: "Kya badlo",
    titleSection: "Title sudharo",
    draftLabel: "Aapka draft",
    copy: "Copy",
    copied: "Ho gaya",
  },
  thumbnail: {
    suggestedHeading: "Suggested thumbnail",
    suggestedSub:
      "AI-generated 16:9 — download karke editor mein polish karo",
    ideaHeading: "Thumbnail idea",
    ideaSub:
      "Design brief — AI image ke liye backend mein OpenAI key chahiye",
    download: "Download",
    prompt: "Prompt",
    simulatorHeading: "Mobile feed preview",
    simulatorSub: "120px width — bilkul YouTube mobile browse jaisa",
  },
  metrics: {
    textContrast: "Text clear hai?",
    mobileLegibility: "Mobile par padh sakte?",
    curiosity: "Click curiosity",
  } satisfies Record<string, string>,
  contact: {
    heading: "Contact",
    subheading: "Feedback ya help chahiye? Seedha message karo.",
    emailLabel: "Email",
    phoneLabel: "Mobile",
    email: "vk85243@gmail.com",
    phone: "7543990177",
    phoneDisplay: "+91 75439 90177",
  },
  tabs: {
    packaging: "Title & Thumbnail Check",
    script: "Script Checker",
  },
  script: {
    cardTitle: "Hook-to-Retention Script Checker",
    cardSubtitle:
      "Apna video script paste karo — hook score, boredom zones, aur KYA BADLO suggestions milenge.",
    textOnlyNote:
      "Text-only analysis — boredom zones use sentence numbers from your script, not video timestamps.",
    scriptLabel: "Video script",
    scriptPlaceholder:
      "Apna spoken script yahan paste karo… (intro, main points, CTA)",
    pacingStyle: "Pacing style",
    wordCount: "words",
    minLengthHint: "Kam se kam 50 characters chahiye",
    analyze: "Script analyze karo →",
    analyzing: "Script check ho raha hai…",
    diagnosticsTitle: "Retention diagnostics",
    diagnosticsSubtitle:
      "Hook review aur boredom zones — DIKKAT aur KYA BADLO cards",
    diagnosticsTextOnlyNote:
      "Zones reference sentence numbers in your pasted script (no video uploaded).",
    emptyTitle: "Diagnostics yahan dikhenge",
    emptyBody:
      "Script paste karo aur analyze karo — hook score, retention score, aur boredom zones milenge.",
    hookHeading: "Opening hook",
    hookScore: "Hook score",
    retentionScore: "Retention score",
    overallFeedback: "Overall feedback",
    pacingFeedback: "Pacing feedback",
    boredomZones: "Boredom zones",
    zoneHighlightHint:
      "Hover or click a boredom zone to highlight sentences in your script.",
    dikkat: "Dikkat",
    kyaBadlo: "Kya badlo",
    copyRewrite: "Copy Rewrite",
  },
} as const;

export const METRIC_KEYS: {
  key: keyof GraderScores;
  labelKey: keyof typeof COPY.metrics;
  barClass: string;
  labelClass: string;
}[] = [
  {
    key: "text_contrast",
    labelKey: "textContrast",
    barClass: "bg-gradient-to-r from-amber-500 to-orange-500",
    labelClass: "text-amber-300",
  },
  {
    key: "mobile_legibility",
    labelKey: "mobileLegibility",
    barClass: "bg-gradient-to-r from-teal-500 to-emerald-500",
    labelClass: "text-teal-300",
  },
  {
    key: "curiosity_score",
    labelKey: "curiosity",
    barClass: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
    labelClass: "text-pink-300",
  },
];

export function getAlternativesLabel(language: Language | null): string {
  if (!language) return "Behtar title ideas";
  if (language === "English") return "Behtar title (English)";
  if (language === "Hinglish") return "Behtar title (Hinglish)";
  if (language === "Pure Hindi") return "Behtar title (Hindi)";
  return `Behtar title (${language})`;
}
