import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";

const GROUPS = {
  relay: ["address", "identity", "shape"],
  device: ["endpoint", "exported", "names"],
  panic: ["sent", "copies", "memory"],
} as const;

/**
 * What CipherMesh does not protect.
 *
 * Every other section on this page is an argument for the thing. This one is
 * the reason to believe the others: a page about encryption that lists only
 * strengths reads as marketing, and the whole category is full of sites
 * promising "military-grade" whatever. The content is not new — it is
 * SECURITY.md's known limitations and section 2 of the terms, which have said
 * this all along; it was simply missing from the place most people actually
 * read.
 *
 * It is deliberately the plainest thing on the site. No accent colour, no glow,
 * no reveal flourish beyond the shared one. A section that admits limits should
 * not look like it is selling them.
 */
export function Limits() {
  const t = useTranslations("limits");

  return (
    <Section
      id="limits"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
        {Object.entries(GROUPS).map(([group, keys], index) => (
          <Reveal key={group} delay={index * 0.05}>
            <div className="h-full bg-void p-5 sm:p-6">
              <h3 className="font-mono text-xs tracking-[0.14em] text-faint uppercase">
                {t(`groups.${group}.name`)}
              </h3>
              <ul className="mt-5 space-y-4">
                {keys.map((key) => (
                  <li key={key}>
                    <p className="text-sm font-medium text-ink">
                      {t(`groups.${group}.items.${key}.name`)}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-dim">
                      {t(`groups.${group}.items.${key}.body`)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-faint">
        {t("close")}
      </p>
    </Section>
  );
}
