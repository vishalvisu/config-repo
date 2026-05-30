import Link from "next/link";

import { FaqJsonLd } from "@/components/content/FaqJsonLd";
import type { FaqItem } from "@/lib/content/types";

interface FaqPageContentProps {
  items: FaqItem[];
}

export function FaqPageContent({ items }: FaqPageContentProps) {
  return (
    <>
      <FaqJsonLd items={items} />
      <article className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="gradient-text">
            YouTube Title &amp; Thumbnail FAQ
          </span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          Answers about ClickKaro, CTR grades, Hinglish titles, thumbnail uploads,
          and how Indian creators can improve YouTube packaging before publish.
        </p>
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <details
              key={item.question}
              className="card-glow group rounded-xl border border-orange-500/10 bg-zinc-900/30 px-4 py-3 open:border-orange-500/25"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-zinc-100 [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {item.question}
                  <span className="shrink-0 text-orange-400 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
        <div className="card-glow mt-12 rounded-2xl border border-orange-500/20 bg-zinc-900/40 p-6">
          <p className="text-sm font-medium text-zinc-200">
            Test your title and thumbnail now
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-amber-400 hover:to-orange-500"
          >
            Try free checker →
          </Link>
        </div>
      </article>
    </>
  );
}
