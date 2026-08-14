import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Support } from "@/components/sections/support";
import { PageIntro } from "@/components/site/page-intro";
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
  const t = await getTranslations({ locale, namespace: "pages.support" });
  const path = `/${locale}/support`;

  return {
    title: t("title"),
    description: t("lead"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((value) => [
          value === "pt" ? "pt-PT" : value,
          `/${value}/support`,
        ]),
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("lead"),
      url: `${site.url}${path}`,
    },
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.support");

  return (
    <>
      <PageIntro prompt={t("prompt")} title={t("title")} lead={t("lead")} />
      <Support />
    </>
  );
}
