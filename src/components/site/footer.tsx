import { useTranslations } from "next-intl";

import { GitHubIcon } from "@/components/site/icons";
import { Wordmark } from "@/components/site/logo";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

/** Pages on this site. Internal, so they route through the locale-aware Link. */
const PAGES = [
  { key: "commands", href: "/commands" },
  { key: "changelog", href: "/changelog" },
  { key: "status", href: "/status" },
] as const;

/** Everything that lives somewhere else. */
const LINKS = [
  { key: "source", href: site.repo },
  { key: "npm", href: site.npm },
  { key: "terms", href: site.terms },
  { key: "security", href: site.security },
] as const;

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-line/60 py-14">
      <div className="shell flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <Wordmark className="block font-display text-sm text-ink lowercase" />
          <p className="mt-3 text-sm text-faint">{t("tagline")}</p>
          <p className="mt-4 font-mono text-xs text-faint">
            {t("built")}{" "}
            <a
              href={site.authorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4 transition-colors hover:text-wire"
            >
              {site.author}
            </a>
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {PAGES.map((page) => (
              <Link
                key={page.key}
                href={page.href}
                className="font-mono text-xs text-faint transition-colors hover:text-ink"
              >
                {t(page.key)}
              </Link>
            ))}
            <a
              href="/changelog.xml"
              className="font-mono text-xs text-faint transition-colors hover:text-ink"
            >
              {t("feed")}
            </a>
          </nav>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-xs text-faint transition-colors hover:text-ink"
              >
                {t(link.key)}
              </a>
            ))}
          </nav>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={site.name}
            className="text-faint transition-colors hover:text-ink"
          >
            <GitHubIcon className="size-4" />
          </a>
          <p className="mt-2 font-mono text-[11px] text-faint/70">
            {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
