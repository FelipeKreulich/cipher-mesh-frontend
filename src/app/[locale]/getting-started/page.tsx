import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Community } from "@/components/sections/community";
import { FirstFive } from "@/components/sections/first-five";
import { Setup } from "@/components/sections/setup";
import { Start } from "@/components/sections/start";
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
  const t = await getTranslations({
    locale,
    namespace: "pages.gettingStarted",
  });
  const path = `/${locale}/getting-started`;

  return {
    title: t("title"),
    description: t("lead"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((value) => [
          value === "pt" ? "pt-PT" : value,
          `/${value}/getting-started`,
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

export default async function GettingStartedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.gettingStarted");

  return (
    <>
      <PageIntro prompt={t("prompt")} title={t("title")} lead={t("lead")} />
      <Setup />
      <Start />
      <FirstFive />
      <Community />
      <PageLinks links={["security", "features", "commands"]} />
    </>
  );
}
