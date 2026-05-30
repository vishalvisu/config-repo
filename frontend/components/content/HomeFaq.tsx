import Link from "next/link";

import { FaqJsonLd } from "@/components/content/FaqJsonLd";
import { FaqSection } from "@/components/content/FaqSection";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { SITE_URL } from "@/lib/site";

const HOME_FAQ_ITEMS = FAQ_ITEMS.slice(0, 5);

export function HomeFaq() {
  return (
    <>
      <FaqJsonLd items={HOME_FAQ_ITEMS} pageUrl={`${SITE_URL}/#faq`} />
      <FaqSection items={HOME_FAQ_ITEMS} />
      <p className="mt-6 text-sm text-zinc-500">
        More answers on our{" "}
        <Link href="/faq" className="text-amber-300/90 underline underline-offset-2 hover:text-amber-200">
          full FAQ page
        </Link>
        .
      </p>
    </>
  );
}
