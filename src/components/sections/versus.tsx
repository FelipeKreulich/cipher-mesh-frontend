import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";

const COLUMNS = {
  signal: ["phone", "audited", "everyone"],
  mesh: ["lan", "terminal", "yours"],
} as const;

/**
 * The question every visitor is already asking.
 *
 * Leaving it unanswered does not stop anyone thinking it; it just means they
 * decide on their own and usually decide wrong. The honest answer opens by
 * sending most people to Signal, which costs nothing — anyone for whom Signal
 * is the right answer was never going to run a terminal client — and buys the
 * standing to be believed about the cases where this genuinely fits.
 *
 * No winner is declared and no score is kept. Two columns, both true.
 */
export function Versus() {
  const t = useTranslations("versus");

  return (
    <Section
      id="versus"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(COLUMNS).map(([column, keys], index) => (
          <Reveal key={column} delay={index * 0.05}>
            <div className="h-full rounded-sm border border-line bg-panel p-5 sm:p-6">
              <h3 className="font-display text-lg tracking-tight text-ink">
                {t(`columns.${column}.name`)}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {keys.map((key) => (
                  <li key={key} className="flex gap-3 text-sm text-dim">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-line-2"
                    />
                    <span className="leading-relaxed">
                      {t(`columns.${column}.items.${key}`)}
                    </span>
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
