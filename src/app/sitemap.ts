import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

/**
 * Every page, in every language, each declaring the others as its alternates —
 * so a search engine serves a Portuguese reader the Portuguese one instead of
 * picking for itself.
 *
 * The commands reference earns a high priority despite not being the landing
 * page: it is the only part of the site somebody would search for by name, and
 * every command on it is separately linkable.
 */
const PAGES = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/commands", changeFrequency: "weekly", priority: 0.9 },
  { path: "/changelog", changeFrequency: "daily", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, changeFrequency, priority }) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [
        locale === "pt" ? "pt-PT" : locale,
        `${site.url}/${locale}${path}`,
      ]),
    );

    return routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      changeFrequency,
      priority: locale === routing.defaultLocale ? priority : priority - 0.2,
      alternates: { languages },
    }));
  });
}
