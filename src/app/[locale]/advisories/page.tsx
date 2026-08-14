import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageIntro } from "@/components/site/page-intro";
import { PageLinks } from "@/components/site/page-links";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.advisories" });
  const path = `/${locale}/advisories`;
  return {
    title: t("title"),
    description: t("lead"),
    alternates: { canonical: path },
    openGraph: {
      title: t("title"),
      description: t("lead"),
      url: `${site.url}${path}`,
    },
  };
}

export default async function AdvisoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.advisories");
  return (
    <>
      <PageIntro prompt={t("prompt")} title={t("title")} lead={t("lead")} />
      <section className="shell py-16 sm:py-20">
        <div className="max-w-3xl rounded-sm border border-line bg-panel p-6 sm:p-8">
          <p className="font-mono text-[11px] text-wire uppercase">
            {t("current.label")}
          </p>
          <h2 className="mt-3 font-display text-xl tracking-tight text-ink">
            {t("current.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            {t("current.body")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={site.advisories}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm border border-line px-3 py-2 font-mono text-xs text-dim hover:text-wire"
            >
              {t("current.list")} →
            </a>
            <a
              href={site.reportVulnerability}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm border border-signal-soft px-3 py-2 font-mono text-xs text-signal-soft hover:text-ink"
            >
              {t("current.report")} →
            </a>
          </div>
        </div>
      </section>
      <PageLinks links={["security", "downloads", "gettingStarted"]} />
    </>
  );
}
