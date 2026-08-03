import Image from "next/image";
import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { site } from "@/lib/site";

/**
 * Numbered because this genuinely is a sequence: nothing in step two works
 * before step one has happened. The commands are the client's own, so they are
 * shown in English exactly as they are typed.
 */
const STEPS = [
  { key: "run", cmd: site.install },
  { key: "connect", cmd: site.hub },
  { key: "talk", cmd: "/join secret-room" },
] as const;

export function Start() {
  const t = useTranslations("start");

  return (
    <Section
      id="start"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <ol className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Reveal
            key={step.key}
            delay={index * 0.06}
            className="h-full bg-panel p-6 sm:p-7"
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
                {step.cmd}
              </code>
              <p className="mt-3 text-sm leading-relaxed text-dim">
                {t(`steps.${step.key}.body`)}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={0.1}>
        <figure className="mt-10 overflow-hidden rounded-sm border border-line bg-panel">
          <div className="flex items-center gap-1.5 border-b border-line/80 px-4 py-2.5">
            <span
              className="size-2 rounded-full bg-line-2"
              aria-hidden="true"
            />
            <span
              className="size-2 rounded-full bg-line-2"
              aria-hidden="true"
            />
            <span
              className="size-2 rounded-full bg-line-2"
              aria-hidden="true"
            />
            <span className="ml-2 font-mono text-[11px] text-faint">
              ciphermesh — general
            </span>
          </div>
          <Image
            src="/demo.svg"
            alt={t("demoAlt")}
            width={720}
            height={400}
            unoptimized
            className="h-auto w-full"
          />
        </figure>
      </Reveal>

      <p className="mt-6 max-w-2xl text-sm text-faint">{t("selfhost")}</p>
    </Section>
  );
}
