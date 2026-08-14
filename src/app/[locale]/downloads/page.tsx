import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageIntro } from "@/components/site/page-intro";
import { PageLinks } from "@/components/site/page-links";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

const METHODS = ["npm", "release", "docker", "source"] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.downloads" });
  const path = `/${locale}/downloads`;
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

export default async function DownloadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.downloads");

  return (
    <>
      <PageIntro prompt={t("prompt")} title={t("title")} lead={t("lead")} />
      <section className="shell py-16 sm:py-20">
        <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
          {METHODS.map((method) => (
            <article key={method} className="bg-panel p-6 sm:p-7">
              <p className="font-mono text-[11px] text-faint">
                {t(`methods.${method}.label`)}
              </p>
              <h2 className="mt-3 font-display text-lg tracking-tight text-ink">
                {t(`methods.${method}.name`)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dim">
                {t(`methods.${method}.body`)}
              </p>
              <code className="mt-4 block overflow-x-auto font-mono text-sm whitespace-nowrap text-wire">
                <span className="text-signal-soft">$ </span>
                {t(`methods.${method}.command`)}
              </code>
            </article>
          ))}
        </div>
        <aside className="mt-10 max-w-3xl rounded-sm border border-warn/40 bg-warn/10 p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-wide text-warn uppercase">
            {t("limits.label")}
          </p>
          <h2 className="mt-3 font-display text-lg tracking-tight text-ink">
            {t("limits.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            {t("limits.body")}
          </p>
          <a
            href={site.releases}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block font-mono text-xs text-warn underline underline-offset-4"
          >
            {t("limits.cta")} →
          </a>
        </aside>
      </section>
      <PageLinks links={["security", "gettingStarted", "commands"]} />
    </>
  );
}
