import Link from "next/link";

import type { GuideContent } from "@/lib/content/types";

interface GuidePageProps {
  guide: GuideContent;
}

export function GuidePage({ guide }: GuidePageProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <nav className="mb-6 text-sm text-zinc-400">
        <Link href="/" className="hover:text-amber-200">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">{guide.title}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        <span className="gradient-text">{guide.title}</span>
      </h1>
      <p className="mt-4 text-base leading-relaxed text-zinc-300">{guide.lead}</p>

      <div className="mt-8 space-y-10">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-amber-100 sm:text-xl">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-sm leading-relaxed text-zinc-300/95 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {section.bullets && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300/95 sm:text-base">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="card-glow mt-12 rounded-2xl border border-orange-500/20 bg-zinc-900/40 p-6">
        <p className="text-sm font-medium text-zinc-200">
          Ready to test your packaging?
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Upload your title and thumbnail — get CTR grade, scores, and suggestions
          in seconds.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-amber-400 hover:to-orange-500"
        >
          Try free checker →
        </Link>
      </div>
    </article>
  );
}
