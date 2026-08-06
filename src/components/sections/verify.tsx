import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { SasCheck } from "@/components/site/sas-check";
import { Section } from "@/components/site/section";

const ITEMS = ["sas", "outofband", "tofu"] as const;

/**
 * End-to-end encryption answers "can the relay read this". Verification answers
 * "is this the person I think it is", and the page would be making half an
 * argument without it.
 *
 * This used to show a mocked-up code in a static card. It now runs the real
 * construction — sort both public keys, hash them with a domain separator, read
 * five bytes as thirteen digits — over illustrative keys, with a switch that
 * drops an interceptor into the middle so the codes visibly come apart. Telling
 * someone that reading four numbers aloud defeats a man in the middle is a
 * claim; watching the two terminals disagree is an argument.
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
      <Reveal>
        <SasCheck />
      </Reveal>

      <ul className="mt-10 grid gap-6 md:grid-cols-3">
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

      <p className="mt-8 max-w-3xl font-mono text-sm text-faint">{t("note")}</p>
    </Section>
  );
}
