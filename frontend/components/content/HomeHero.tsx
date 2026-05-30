import { COPY } from "@/lib/copy";

interface HomeHeroProps {
  title?: string;
  subtitle?: string;
  seoIntro?: string;
}

export function HomeHero({
  title = COPY.hero.title,
  subtitle = COPY.hero.subtitle,
  seoIntro = COPY.seoIntro,
}: HomeHeroProps) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-400/90">
        {COPY.hero.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        <span className="gradient-text">{title}</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300/90">
        {subtitle}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400/90">
        {seoIntro}
      </p>
    </div>
  );
}
