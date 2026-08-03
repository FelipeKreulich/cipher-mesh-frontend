import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";

/**
 * The command is the label here — these are things you type in a hurry, and
 * knowing the exact words matters more than any heading could.
 */
const ITEMS = [
  { key: "panic", cmd: "/panic yes" },
  { key: "lock", cmd: "/autolock 5" },
  { key: "ephemeral", cmd: "/ephemeral 10m" },
  { key: "retention", cmd: "/retention 7d" },
] as const;

export function Controls() {
  const t = useTranslations("controls");

  return (
    <Section
      id="controls"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
        {ITEMS.map((item, index) => (
          <Reveal
            key={item.key}
            delay={index * 0.05}
            className="h-full bg-panel p-6 sm:p-7"
          >
            <code className="block font-mono text-sm text-wire">
              <span className="text-signal-soft select-none">› </span>
              {item.cmd}
            </code>
            <h3 className="mt-3 font-display text-base tracking-tight text-ink">
              {t(`items.${item.key}.name`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              {t(`items.${item.key}.body`)}
            </p>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-sm text-faint">{t("note")}</p>
    </Section>
  );
}
