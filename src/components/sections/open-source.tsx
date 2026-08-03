import { useTranslations } from "next-intl";

import { GitHubIcon } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function OpenSource() {
  const t = useTranslations("open");

  return (
    <Section id="open" prompt={t("prompt")} title={t("title")} lead={t("lead")}>
      <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
        <Reveal className="bg-panel p-6 sm:p-8">
          <h3 className="font-display text-base tracking-tight text-ink">
            {t("auditTitle")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            {t("auditBody")}
          </p>
        </Reveal>
        <Reveal delay={0.08} className="bg-panel p-6 sm:p-8">
          <h3 className="font-display text-base tracking-tight text-ink">
            {t("contributeTitle")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            {t("contributeBody")}
          </p>
        </Reveal>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-10 px-4">
          <a href={site.issues} target="_blank" rel="noreferrer noopener">
            {t("issue")}
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-10 px-4">
          <a href={site.repo} target="_blank" rel="noreferrer noopener">
            <GitHubIcon className="size-4" />
            {t("repo")}
          </a>
        </Button>
        <Button asChild variant="ghost" size="lg" className="h-10 px-4">
          <a href={site.docs} target="_blank" rel="noreferrer noopener">
            {t("docs")}
          </a>
        </Button>
      </div>
    </Section>
  );
}
