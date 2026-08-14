import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { site } from "@/lib/site";

const EVIDENCE = [
  { key: "protocol", href: site.protocolDocs },
  { key: "limits", href: site.security },
  { key: "source", href: site.repo },
] as const;

export function Evidence() {
  const t = useTranslations("evidence");

  return (
    <Section
      id="evidence"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
        {EVIDENCE.map((item, index) => (
          <Reveal
            key={item.key}
            delay={index * 0.06}
            className="h-full bg-panel"
          >
            <li className="h-full">
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group block h-full p-6 transition-colors hover:bg-panel-2 focus-visible:outline-none sm:p-7"
              >
                <p className="font-mono text-[11px] text-faint">
                  {t(`items.${item.key}.label`)}
                </p>
                <h3 className="mt-3 font-display text-base tracking-tight text-ink group-hover:text-wire">
                  {t(`items.${item.key}.name`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">
                  {t(`items.${item.key}.body`)}
                </p>
                <span className="mt-5 inline-block font-mono text-xs text-signal-soft group-hover:text-wire">
                  {t("open")} →
                </span>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
