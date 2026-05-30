export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideContent {
  slug: string;
  title: string;
  metaDescription: string;
  lead: string;
  sections: GuideSection[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
