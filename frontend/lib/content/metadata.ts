import type { Metadata } from "next";

import type { GuideContent } from "@/lib/content/types";

export function guideMetadata(guide: GuideContent): Metadata {
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: {
      canonical: `/${guide.slug}`,
    },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      type: "article",
    },
  };
}
