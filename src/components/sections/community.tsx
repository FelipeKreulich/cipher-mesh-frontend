import { useTranslations } from "next-intl";

import { NeonCard } from "@/components/site/neon-card";
import { Presence } from "@/components/site/presence";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const ITEMS = ["open", "general", "private", "ephemeral"] as const;

/**
 * The hub is the reason this section exists: with a relay that is always on,
 * two strangers can talk without either of them running a server. The panel
 * reproduces the client's own join prompt, so the answers on this page are
 * literally what gets typed.
 */
export function Community() {
  const t = useTranslations("community");

  return (
    <Section
      id="community"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <Reveal>
        <div className="scanlines relative overflow-hidden rounded-sm border border-line bg-panel">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full bg-signal"
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] tracking-wide text-faint uppercase">
                {t("connectTitle")}
              </span>
            </div>
            {/* The one live thing on the page: whether it is worth joining
                right now. Renders nothing when the relay cannot be reached. */}
            <Presence />
          </div>

          <dl className="space-y-2 px-5 py-6 font-mono text-sm sm:px-7 sm:py-8">
            {/* The client's prompts are English-only, like the rest of its UI,
                so they are not translated here. */}
            <div className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-signal-soft">Server</dt>
              <dd className="text-base text-ink sm:text-lg">{site.hub}</dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-signal-soft">Room</dt>
              <dd className="text-base text-ink sm:text-lg">general</dd>
            </div>
          </dl>

          <p className="border-t border-line/80 px-5 py-4 text-sm text-faint sm:px-7">
            {t("connectNote")}
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
        {ITEMS.map((key, index) => (
          <Reveal
            key={key}
            delay={index * 0.05}
            className="h-full bg-panel p-6 sm:p-7"
          >
            <h3 className="font-display text-base tracking-tight text-ink">
              {t(`items.${key}.name`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              {t(`items.${key}.body`)}
            </p>
          </Reveal>
        ))}
      </div>

      {/* What the hub is for, and what it is not. A service with no declared
          purpose reads as general-purpose infrastructure, and self-hosting is
          the honest answer for anyone who needs more than a meeting point.

          Cyan for the hub, violet for a relay of your own — the site's own
          meaning for those two colours, doing the work before the headings
          do. */}
      <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
        <NeonCard tone="wire" tag={site.hub} title={t("purposeTitle")}>
          {t("purposeBody")}
        </NeonCard>

        <NeonCard
          tone="signal"
          tag="npx ciphermesh server"
          title={t("selfhostTitle")}
          delay={0.08}
        >
          <p>{t("selfhostBody")}</p>
          <a
            href={site.selfhostDocs}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex font-mono text-xs text-signal-soft underline underline-offset-4 transition-colors hover:text-ink"
          >
            {t("selfhostCta")}
          </a>
        </NeonCard>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-faint">{t("note")}</p>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-10 shrink-0 px-4"
        >
          <a href={site.terms} target="_blank" rel="noreferrer noopener">
            {t("cta")}
          </a>
        </Button>
      </div>
    </Section>
  );
}
