import { useTranslations } from "next-intl";

import { GitHubIcon } from "@/components/site/icons";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Wordmark } from "@/components/site/logo";
import { NavMenu } from "@/components/site/nav-menu";
import { site } from "@/lib/site";

// Same order as the page, so the nav doubles as a table of contents.
const NAV = [
  { id: "what", key: "what" },
  { id: "security", key: "security" },
  { id: "verify", key: "verify" },
  { id: "start", key: "start" },
  { id: "community", key: "community" },
  { id: "controls", key: "controls" },
  { id: "plugins", key: "plugins" },
  { id: "open", key: "open" },
  { id: "support", key: "support" },
] as const;

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
          className="hidden items-center gap-4 xl:flex"
        >
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono text-[11px] whitespace-nowrap text-faint transition-colors hover:text-ink"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <NavMenu
            label={t("menu")}
            title={t("sections")}
            items={NAV.map((item) => ({ id: item.id, label: t(item.key) }))}
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
