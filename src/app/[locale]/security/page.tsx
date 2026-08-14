import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Evidence } from "@/components/sections/evidence";
import { Limits } from "@/components/sections/limits";
import { Security } from "@/components/sections/security";
import { Verify } from "@/components/sections/verify";
import { Versus } from "@/components/sections/versus";
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
  const t = await getTranslations({ locale, namespace: "pages.security" });
  const path = `/${locale}/security`;

  return {
    title: t("title"),
    description: t("lead"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((value) => [
          value === "pt" ? "pt-PT" : value,
          `/${value}/security`,
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

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.security");

  return (
    <>
      <PageIntro prompt={t("prompt")} title={t("title")} lead={t("lead")} />
      <Security />
      <Verify />
      <Limits />
      <Versus />
      <Evidence />
      <PageLinks links={["gettingStarted", "features", "commands"]} />
    </>
  );
}
