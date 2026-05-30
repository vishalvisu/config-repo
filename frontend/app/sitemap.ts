import type { MetadataRoute } from "next";

import { ALL_GUIDES } from "@/lib/content/guides";
import { SITE_URL } from "@/lib/site";

const CONTENT_ROUTES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" as const },
  ...ALL_GUIDES.map((guide) => ({
    path: `/${guide.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return CONTENT_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
