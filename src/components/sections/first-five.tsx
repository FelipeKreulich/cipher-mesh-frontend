import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { site } from "@/lib/site";

const STEPS = [
  { key: "run", command: site.install },
  { key: "join", command: site.hub },
  { key: "verify", command: "/verify" },
  { key: "private", command: "/create private-room passphrase" },
] as const;

export function FirstFive() {
  const t = useTranslations("firstFive");

  return (
    <Section
      id="first-five"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <ol className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-4">
        {STEPS.map((step, index) => (
          <Reveal
            key={step.key}
            delay={index * 0.05}
            className="h-full bg-panel p-6"
          >
            <li>
              <p className="font-mono text-[11px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-base tracking-tight text-ink">
                {t(`steps.${step.key}.name`)}
              </h3>
              <code className="mt-3 block overflow-x-auto font-mono text-sm whitespace-nowrap text-wire">
                <span className="text-signal-soft select-none">$ </span>
                {step.command}
              </code>
              <p className="mt-3 text-sm leading-relaxed text-dim">
                {t(`steps.${step.key}.body`)}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
