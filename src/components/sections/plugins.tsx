import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The real thing, short enough to read end to end. */
const SOURCE = `export default {
  name: 'roll',
  description: 'Roll dice',
  commands: {
    roll: (args) => ({
      send: \`🎲 \${d(args[0])}\`,
    }),
  },
}`;

const ITEMS = [
  { key: "send", tone: "default" },
  { key: "offline", tone: "default" },
  { key: "local", tone: "default" },
  { key: "warn", tone: "warn" },
] as const;

export function Plugins() {
  const t = useTranslations("plugins");

  return (
    <Section
      id="plugins"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Reveal>
          <figure className="scanlines relative overflow-hidden rounded-sm border border-line bg-panel">
            <figcaption className="border-b border-line/80 px-4 py-2.5 font-mono text-[11px] text-faint">
              {t("fileLabel")}
            </figcaption>
            <pre className="overflow-x-auto px-4 py-5 font-mono text-[13px] leading-relaxed text-dim">
              <code>{SOURCE}</code>
            </pre>
            <div className="border-t border-line/80 px-4 py-3.5">
              <p className="font-mono text-[11px] text-faint">
                {t("usageLabel")}
              </p>
              <p className="mt-1.5 font-mono text-sm">
                <span className="text-signal-soft select-none">› </span>
                <span className="text-ink">/roll 2d20+3</span>
              </p>
            </div>
          </figure>
        </Reveal>

        <ul className="space-y-6">
          {ITEMS.map((item, index) => (
            <Reveal key={item.key} delay={index * 0.05}>
              <li className="flex gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 font-mono text-sm",
                    item.tone === "warn" ? "text-warn" : "text-line-2",
                  )}
                >
                  {item.tone === "warn" ? "!" : "+"}
                </span>
                <div>
                  <h3
                    className={cn(
                      "font-display text-base tracking-tight",
                      item.tone === "warn" ? "text-warn" : "text-ink",
                    )}
                  >
                    {t(`items.${item.key}.name`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dim">
                    {t(`items.${item.key}.body`)}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="mt-9">
        <Button asChild variant="outline" size="lg" className="h-10 px-4">
          <a href={site.pluginDocs} target="_blank" rel="noreferrer noopener">
            {t("docs")}
          </a>
        </Button>
      </div>
    </Section>
  );
}
