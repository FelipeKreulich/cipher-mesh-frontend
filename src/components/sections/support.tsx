import { Coffee } from "lucide-react";
import { useTranslations } from "next-intl";

import Noise from "@/components/Noise";
import ScrambledText from "@/components/ScrambledText";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function Support() {
  const t = useTranslations("support");

  return (
    <section id="support" className="relative scroll-mt-20 pb-24 sm:pb-32">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-sm border border-line bg-panel p-7 sm:p-10">
            {/* The one warm surface on the page: grain instead of scanlines,
                so the ask reads as paper rather than another terminal. */}
            <Noise patternAlpha={12} />
            <p className="prompt relative">{t("prompt")}</p>
            <div className="relative mt-5 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-display text-xl tracking-tight text-ink sm:text-2xl">
                  <ScrambledText>{t("title")}</ScrambledText>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-dim sm:text-base">
                  {t("lead")}
                </p>
                <p className="mt-4 text-sm text-faint">{t("note")}</p>
              </div>
              <Button asChild size="lg" className="h-11 shrink-0 px-5">
                <a href={site.coffee} target="_blank" rel="noreferrer noopener">
                  <Coffee className="size-4" aria-hidden="true" />
                  {t("cta")}
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
