import { COPY } from "@/lib/copy";

export function HomeHero() {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-400/90">
        {COPY.hero.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        <span className="gradient-text">{COPY.hero.title}</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300/90">
        {COPY.hero.subtitle}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400/90">
        {COPY.seoIntro}
      </p>
    </div>
  );
}
