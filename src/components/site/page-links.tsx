import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const HREF = {
  security: "/security",
  gettingStarted: "/getting-started",
  features: "/features",
  commands: "/commands",
  support: "/support",
  downloads: "/downloads",
  advisories: "/advisories",
} as const;

type PageLink = keyof typeof HREF;

/** A short hand-off at the end of a deep page, not another full navigation. */
export function PageLinks({ links }: { links: readonly PageLink[] }) {
  const t = useTranslations("pages.explore");
  const nav = useTranslations("nav");

  return (
    <aside className="shell py-12 sm:py-16">
      <div className="border-t border-line pt-8">
        <p className="font-mono text-[11px] tracking-wide text-faint uppercase">
          {t("title")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {links.map((key) => (
            <Link
              key={key}
              href={HREF[key]}
              className="rounded-sm border border-line px-3 py-2 font-mono text-xs text-dim transition-colors hover:border-wire hover:text-wire focus-visible:outline-none"
            >
              {nav(key)} →
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
