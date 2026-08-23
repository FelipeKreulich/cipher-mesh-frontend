import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CommandBrowser } from "@/components/commands/command-browser";
import { PageIntro } from "@/components/site/page-intro";
import { routing } from "@/i18n/routing";
import { commandReference } from "@/lib/commands";
import { site } from "@/lib/site";

/**
 * The command reference.
 *
 * Sixty-seven commands are the project's largest piece of writing and they
 * lived only in a README on GitHub. Here they are searchable, filterable by
 * whether they survive without a relay, and every one of them has an anchor —
 * `ciphermesh.de/commands#verify` is a link you can send someone.
 *
 * Revalidates hourly against the generated file in the client repository, so a
 * release that adds a command shows up without anyone touching this site.
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
  const t = await getTranslations({ locale, namespace: "commands" });
  const path = `/${locale}/commands`;

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l === "pt" ? "pt-PT" : l,
          `/${l}/commands`,
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

export default async function CommandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("commands");
  const reference = await commandReference();

  return (
    <>
      <PageIntro
        prompt={t("prompt")}
        title={t("title")}
        lead={t("lead", {
          commands: reference.counts.total,
          p2p: reference.counts.p2p,
        })}
      />

      <div className="shell pb-16 sm:pb-24">
        <div className="mt-10">
          <CommandBrowser groups={reference.groups} />
        </div>

        <p className="mt-14 max-w-3xl text-sm leading-relaxed text-faint">
          {t("generated")}{" "}
          <a
            href={`${site.repo}/blob/master/docs/commands.json`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-signal-soft underline underline-offset-2 hover:text-ink"
          >
            docs/commands.json
          </a>
          .
        </p>
      </div>
    </>
  );
}
