import Link from "next/link";

import { SiteFooter } from "@/components/content/SiteFooter";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { COPY } from "@/lib/copy";
import { HeaderContact } from "@/components/ContactSection";
import { SEO } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: {
    default: SEO.title,
    template: `%s | ${SEO.siteName}`,
  },
  description: SEO.description,
  keywords: [...SEO.keywords],
  applicationName: SEO.siteName,
  authors: [{ name: SEO.siteName, url: SITE_URL }],
  creator: SEO.siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: SITE_URL,
    siteName: SEO.siteName,
    locale: SEO.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="page-bg min-h-full font-sans text-zinc-100">
        <SeoJsonLd />
        <div className="border-b border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-teal-950/40 backdrop-blur-md">
          <header className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-4 sm:items-center sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                {COPY.brand.logoLetter}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c0a14]" />
              </span>
              <span className="gradient-text text-base font-semibold tracking-tight sm:text-lg">
                {COPY.brand.header}
              </span>
            </Link>
            <HeaderContact />
          </header>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
          <SiteFooter />
        </main>
        <Analytics />
      </body>
    </html>
  );
}
