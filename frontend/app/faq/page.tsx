import type { Metadata } from "next";

import { FaqPageContent } from "@/components/content/FaqPageContent";
import { FAQ_ITEMS } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "YouTube Title & Thumbnail FAQ for Indian Creators",
  description:
    "Frequently asked questions about ClickKaro — free YouTube title checker, thumbnail analyzer, CTR grade, Hinglish titles, and AI thumbnail tips.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FaqPage() {
  return <FaqPageContent items={FAQ_ITEMS} />;
}
