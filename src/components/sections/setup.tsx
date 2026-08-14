import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { SetupGuide } from "@/components/site/setup-guide";
import { site } from "@/lib/site";

const OPTIONS = [
  { key: "try", href: "#start", command: site.install },
  { key: "lan", href: "#start", command: "npx ciphermesh p2p" },
  { key: "internet", href: site.selfhostDocs, command: "tailscale + relay" },
  { key: "own", href: site.selfhostDocs, command: "npx ciphermesh server" },
] as const;

/** A choice of threat-model and topology, not a feature comparison. */
export function Setup() {
  const t = useTranslations("setup");

  return (
    <Section
      id="setup"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
        {OPTIONS.map((option, index) => (
          <Reveal
            key={option.key}
            delay={index * 0.05}
            className="h-full bg-panel"
          >
            <li>
              <a
                href={option.href}
                className="group block h-full p-6 transition-colors hover:bg-panel-2 focus-visible:outline-none sm:p-7"
              >
                <p className="font-mono text-[11px] text-faint">0{index + 1}</p>
                <h3 className="mt-3 font-display text-base tracking-tight text-ink group-hover:text-wire">
                  {t(`options.${option.key}.name`)}
                </h3>
                <code className="mt-4 block overflow-x-auto font-mono text-sm whitespace-nowrap text-wire">
                  <span className="text-signal-soft select-none">$ </span>
                  {option.command}
                </code>
                <p className="mt-3 text-sm leading-relaxed text-dim">
                  {t(`options.${option.key}.body`)}
                </p>
                <span className="mt-5 inline-block font-mono text-xs text-signal-soft group-hover:text-wire">
                  {t("choose")} →
                </span>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
      <SetupGuide />
    </Section>
  );
}
