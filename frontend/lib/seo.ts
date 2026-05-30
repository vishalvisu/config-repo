import { COPY } from "@/lib/copy";
import { SITE_URL } from "@/lib/site";

export const SEO = {
  siteName: "ClickKaro",
  title:
    "YouTube Title & Thumbnail Checker for Indian Creators | ClickKaro",
  description:
    "Free YouTube title checker and thumbnail analyzer for Indian creators. Get CTR grade, Hinglish title ideas, AI thumbnail tips, and packaging scores — Title aur Thumbnail Check.",
  keywords: [
    "YouTube title checker",
    "YouTube thumbnail analyzer",
    "CTR grade",
    "Hinglish YouTube titles",
    "Indian YouTube creators",
    "thumbnail tips India",
    "YouTube packaging tool",
    "title aur thumbnail check",
  ],
  locale: "en_IN",
  ogAlt: "ClickKaro — Title aur Thumbnail Check for Indian YouTube creators",
} as const;

export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SEO.siteName,
        description: SEO.description,
        inLanguage: SEO.locale,
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: COPY.brand.header,
        url: SITE_URL,
        description: SEO.description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: ["en-IN", "hi-IN"],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        audience: {
          "@type": "Audience",
          geographicArea: {
            "@type": "Country",
            name: "India",
          },
        },
        publisher: {
          "@type": "Organization",
          name: SEO.siteName,
          url: SITE_URL,
        },
      },
    ],
  };
}
