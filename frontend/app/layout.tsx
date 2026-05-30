import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HeaderContact } from "@/components/ContactSection";
import { COPY } from "@/lib/copy";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: COPY.meta.title,
  description: COPY.meta.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: COPY.meta.title,
    description: COPY.meta.description,
    url: SITE_URL,
    siteName: COPY.brand.header,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: COPY.meta.title,
    description: COPY.meta.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="page-bg min-h-full font-sans text-zinc-100">
        <div className="border-b border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-teal-950/40 backdrop-blur-md">
          <header className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-4 sm:items-center sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                {COPY.brand.logoLetter}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c0a14]" />
              </span>
              <span className="gradient-text text-base font-semibold tracking-tight sm:text-lg">
                {COPY.brand.header}
              </span>
            </div>
            <HeaderContact />
          </header>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
