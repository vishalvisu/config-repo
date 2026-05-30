import type { FaqItem } from "@/lib/content/types";
import { SITE_URL } from "@/lib/site";

interface FaqJsonLdProps {
  items: FaqItem[];
  pageUrl?: string;
}

export function FaqJsonLd({ items, pageUrl = `${SITE_URL}/faq` }: FaqJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: pageUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
