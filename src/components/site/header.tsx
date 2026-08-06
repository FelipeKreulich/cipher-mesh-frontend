import { useTranslations } from "next-intl";

import { GitHubIcon } from "@/components/site/icons";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Wordmark } from "@/components/site/logo";
import { NavMenu } from "@/components/site/nav-menu";
import { site } from "@/lib/site";

/**
 * The whole page, in the three questions someone arriving cold actually asks,
 * in the order they ask them: what is this, should I trust it, how do I take
 * part. Twelve equally weighted links in a row answered none of them.
 */
const GROUPS = [
  { id: "product", keys: ["replay", "what", "controls", "plugins"] },
  { id: "trust", keys: ["security", "verify", "limits", "versus"] },
  { id: "join", keys: ["start", "community", "open", "support"] },
] as const;

/**
 * The four kept in the bar itself: see it work, is it safe, how do I start, who
 * is already there. Not a ranking of the sections — a guess at the first click.
 */
const PRIMARY = ["replay", "security", "start", "community"] as const;

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-void/70 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only rounded-sm bg-signal px-3 py-2 font-mono text-xs text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        {t("skipToContent")}
      </a>

      <div className="shell flex h-14 items-center justify-between gap-4">
        <a href="#top" aria-label={site.name}>
          <Wordmark className="font-display text-sm tracking-tight text-ink lowercase" />
        </a>

        <nav
          aria-label={t("sections")}
          className="hidden items-center gap-6 md:flex"
        >
          {PRIMARY.map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="font-mono text-xs whitespace-nowrap text-faint transition-colors hover:text-ink"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <NavMenu
            label={t("menu")}
            title={t("sections")}
            groups={GROUPS.map((group) => ({
              id: group.id,
              label: t(`groups.${group.id}`),
              items: group.keys.map((key) => ({ id: key, label: t(key) })),
            }))}
          />
          <LanguageSwitcher label={t("language")} />
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("github")}
            className="text-faint transition-colors hover:text-ink"
          >
            <GitHubIcon className="size-[18px]" />
          </a>
        </div>
      </div>
    </header>
  );
}
