import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

/**
 * Two pages, one per language, each declaring the other as its alternate — so a
 * search engine serves a Portuguese reader the Portuguese one instead of
 * picking for itself.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale === "pt" ? "pt-PT" : locale,
      `${site.url}/${locale}`,
    ]),
  );

  return routing.locales.map((locale) => ({
    url: `${site.url}/${locale}`,
    changeFrequency: "weekly",
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));
}
