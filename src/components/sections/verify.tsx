import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";

const ITEMS = ["sas", "outofband", "tofu"] as const;

/**
 * End-to-end encryption answers "can the relay read this". Verification answers
 * "is this the person I think it is", and the page would be making half an
 * argument without it. The sample code is the real format the client prints:
 * 40 bits of BLAKE2b over both public keys, grouped 4-4-5.
 */
export function Verify() {
  const t = useTranslations("verify");

  return (
    <Section
      id="verify"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <Reveal>
          <div className="scanlines relative overflow-hidden rounded-sm border border-line bg-panel">
            <p className="border-b border-line/80 px-4 py-2.5 font-mono text-[11px] text-faint">
              {t("outputLabel")}
            </p>
            <div className="space-y-3 px-5 py-6 font-mono text-sm sm:px-6">
              <p>
                <span className="text-signal-soft select-none">› </span>
                <span className="text-ink">/verify peer</span>
              </p>
              <p className="text-faint">
                SAS code for peer:{" "}
                <span className="text-base tracking-[0.12em] text-wire sm:text-lg">
                  8241 0937 55182
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        <ul className="space-y-6">
          {ITEMS.map((key, index) => (
            <Reveal key={key} delay={index * 0.05}>
              <li className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 font-mono text-sm text-line-2"
                >
                  +
                </span>
                <div>
                  <h3 className="font-display text-base tracking-tight text-ink">
                    {t(`items.${key}.name`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dim">
                    {t(`items.${key}.body`)}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <p className="mt-8 max-w-3xl font-mono text-sm text-faint">{t("note")}</p>
    </Section>
  );
}
