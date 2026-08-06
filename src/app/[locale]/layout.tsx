import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Martian_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RatchetField } from "@/components/site/ratchet-field";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

import "../globals.css";

/**
 * Martian Mono carries the headlines: a mono face wide enough to hold a line of
 * display type without looking like code. IBM Plex Mono is the code voice and
 * IBM Plex Sans handles running text, so the two registers never blur.
 */
const martian = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

/**
 * The URL keeps the short code, but the document declares the variant it is
 * actually written in. The Portuguese here is European — "tu" forms, "ecrã",
 * "ficheiro", "palavra-passe" — and a screen reader pronouncing it as Brazilian
 * gets the vowels wrong.
 */
const HTML_LANG: Record<string, string> = { pt: "pt-PT" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((value) => [value, `/${value}`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={HTML_LANG[locale] ?? locale}
      className={`dark ${martian.variable} ${plexMono.variable} ${plexSans.variable}`}
      suppressHydrationWarning
    >
      <body className="relative min-h-svh">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_50%_0%,rgba(123,45,255,0.12),transparent_70%)]" />
          {/* The ratchet field sits behind the first screen only. Fading it out
              down the page keeps it from arguing with every section below, and
              the mask means it never has to be scrolled past. */}
          <div className="absolute inset-x-0 top-0 h-[110svh] [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)] opacity-70">
            <RatchetField className="h-full w-full" />
          </div>
        </div>

        <NextIntlClientProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
