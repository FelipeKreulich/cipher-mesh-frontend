import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Reveal } from "@/components/site/reveal";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { statusChecks, type Verdict } from "@/lib/status";

/**
 * The page people open when they already think something is broken.
 *
 * Which is why every line is measured from here at request time rather than
 * cached or asserted. A stale green tick is worse than no page at all.
 */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "status" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    // Nothing to index: it is different every time it is loaded, and a search
    // result for a status snapshot is misinformation by the time it is clicked.
    robots: { index: false, follow: true },
    alternates: { canonical: `/${locale}/status` },
  };
}

const TONE: Record<Verdict, string> = {
  ok: "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]",
  degraded: "border-warn/40 bg-warn/10 text-warn",
  unknown: "border-line text-faint",
};

const DOT: Record<Verdict, string> = {
  ok: "bg-[#4ade80]",
  degraded: "bg-warn",
  unknown: "bg-line-2",
};

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("status");
  const checks = await statusChecks();
  const worst: Verdict = checks.some((c) => c.verdict === "degraded")
    ? "degraded"
    : "ok";

  return (
    <div className="shell py-16 sm:py-24">
      <Reveal>
        <p className="prompt">{t("prompt")}</p>
        <h1 className="mt-5 max-w-3xl font-display text-section leading-[1.06] tracking-tight text-balance text-ink">
          {t("title")}
        </h1>

        <div
          className={`mt-6 inline-flex items-center gap-2.5 rounded-sm border px-3.5 py-2 font-mono text-sm ${TONE[worst]}`}
        >
          <span className={`size-2 rounded-full ${DOT[worst]}`} />
          {t(`overall.${worst}`)}
        </div>
      </Reveal>

      <dl className="mt-10 divide-y divide-line/70 border-y border-line/70">
        {checks.map((check) => (
          <div
            key={check.id}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
          >
            <dt className="flex items-center gap-2.5 font-mono text-sm text-ink">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${DOT[check.verdict]}`}
              />
              {t(`checks.${check.id}`)}
            </dt>
            <dd className="ml-auto font-mono text-sm text-dim tabular-nums">
              {check.detail}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 max-w-3xl space-y-3 text-sm leading-relaxed text-faint">
        <p>{t("notMeasured")}</p>
        <p>
          {t("monitor")}{" "}
          <a
            href={`${site.repo}/blob/master/.github/workflows/hub-monitor.yml`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-signal-soft underline underline-offset-2 hover:text-ink"
          >
            hub-monitor.yml
          </a>
          .
        </p>
        <p>{t("privacy")}</p>
      </div>
    </div>
  );
}
