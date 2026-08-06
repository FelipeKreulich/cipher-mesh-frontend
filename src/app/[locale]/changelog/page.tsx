import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Timeline } from "@/components/changelog/timeline";
import { Reveal } from "@/components/site/reveal";
import { routing } from "@/i18n/routing";
import { changelog } from "@/lib/changelog";
import { site } from "@/lib/site";

/**
 * Every release, newest first.
 *
 * The project ships constantly — six versions went out in four days once — and
 * the site showed none of it. Cadence is one of the more persuasive things a
 * visitor can see, especially for a security tool, where "still maintained" is
 * part of the security.
 *
 * Parsed from the CHANGELOG the repository already keeps, hourly, so this page
 * cannot disagree with it and nobody has to write the same entry twice.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "changelog" });
  const path = `/${locale}/changelog`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l === "pt" ? "pt-PT" : l,
          `/${l}/changelog`,
        ]),
      ),
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: `${site.url}${path}`,
    },
  };
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("changelog");
  const { releases } = await changelog();
  const current = releases.find((release) => !release.summary);

  return (
    <div className="shell py-16 sm:py-24">
      <Reveal>
        <p className="prompt">{t("prompt")}</p>
        <h1 className="mt-5 max-w-3xl font-display text-section leading-[1.06] tracking-tight text-balance text-ink">
          {t("title")}
        </h1>
        <p className="prose-body mt-5 max-w-2xl">
          {current ? t("lead", { version: current.version }) : t("leadPlain")}
        </p>
      </Reveal>

      <div className="mt-14">
        <Timeline releases={releases} />
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-faint">
        {t("note")}{" "}
        <a
          href={`${site.repo}/releases`}
          target="_blank"
          rel="noreferrer noopener"
          className="text-signal-soft underline underline-offset-2 hover:text-ink"
        >
          {t("releases")}
        </a>
        .
      </p>
    </div>
  );
}
