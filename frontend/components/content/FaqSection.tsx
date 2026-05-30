import type { FaqItem } from "@/lib/content/types";

interface FaqSectionProps {
  items: FaqItem[];
  heading?: string;
  subheading?: string;
  id?: string;
}

export function FaqSection({
  items,
  heading = "Frequently asked questions",
  subheading = "Common questions about YouTube title and thumbnail checking for Indian creators.",
  id = "faq",
}: FaqSectionProps) {
  return (
    <section id={id} className="mt-16 border-t border-orange-500/10 pt-12">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
        <span className="gradient-text">{heading}</span>
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {subheading}
      </p>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="card-glow group rounded-xl border border-orange-500/10 bg-zinc-900/30 px-4 py-3 open:border-orange-500/25"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-zinc-100 marker:content-none [&::-webkit-details-marker]:hidden">
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
    </section>
  );
}
