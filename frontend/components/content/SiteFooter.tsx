import Link from "next/link";

const GUIDE_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/hinglish-youtube-titles", label: "Hinglish title ideas" },
  { href: "/youtube-thumbnail-tips-india", label: "Thumbnail tips (India)" },
  { href: "/faq", label: "FAQ" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-orange-500/10 pt-10 pb-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-amber-200/90">ClickKaro</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            Free YouTube title checker and thumbnail analyzer for Indian creators.
          </p>
        </div>
        <nav aria-label="Guides">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Guides
          </p>
          <ul className="mt-3 space-y-2">
            {GUIDE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-amber-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-8 text-xs text-zinc-600">
        © {new Date().getFullYear()} ClickKaro · Title aur Thumbnail Check
      </p>
    </footer>
  );
}
