import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { stats } from "@/lib/site";

const ROWS = ["version", "tests", "commands", "transport", "license"] as const;

/**
 * The claims arrive the way the CLI would print them: aligned key/value pairs,
 * not stat cards. It is the same grammar as the rest of the page.
 */
export function Proof() {
  const t = useTranslations("proof");

  return (
    <section id="proof" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="shell">
        <Reveal>
          <p className="prompt">{t("prompt")}</p>
          <div className="scanlines relative mt-5 overflow-x-auto rounded-sm border border-line bg-panel px-4 py-4 sm:px-6 sm:py-5">
            <dl className="min-w-max font-mono text-[13px] sm:text-sm">
              {ROWS.map((row) => (
                <div key={row} className="flex gap-4 py-1">
                  <dt className="w-24 shrink-0 text-faint sm:w-28">{row}</dt>
                  <dd className="text-dim">
                    {t(`values.${row}`, {
                      version: stats.version,
                      tests: stats.tests,
                      commands: stats.commands,
                      p2p: stats.p2pCommands,
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-sm text-faint">{t("lead")}</p>
        </Reveal>
      </div>
    </section>
  );
}
