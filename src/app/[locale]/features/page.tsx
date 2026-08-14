import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Controls } from "@/components/sections/controls";
import { Features } from "@/components/sections/features";
import { OpenSource } from "@/components/sections/open-source";
import { Plugins } from "@/components/sections/plugins";
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
  const t = await getTranslations({ locale, namespace: "pages.features" });
  const path = `/${locale}/features`;

  return {
    title: t("title"),
    description: t("lead"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((value) => [
          value === "pt" ? "pt-PT" : value,
          `/${value}/features`,
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

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.features");

  return (
    <>
      <PageIntro prompt={t("prompt")} title={t("title")} lead={t("lead")} />
      <Features />
      <Controls />
      <Plugins />
      <OpenSource />
      <PageLinks links={["security", "gettingStarted", "commands"]} />
    </>
  );
}
