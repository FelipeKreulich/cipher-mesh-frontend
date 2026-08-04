import { useTranslations } from "next-intl";

import { DissolveOnHover } from "@/components/site/dissolve-on-hover";
import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { cn } from "@/lib/utils";

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
        {ITEMS.map((item, index) => {
          const danger = item.key === "panic";
          const body = (
            <>
              <code
                className={cn(
                  "block font-mono text-sm",
                  danger ? "text-danger" : "text-wire",
                )}
              >
                <span
                  className={cn(
                    "select-none",
                    danger ? "text-danger/70" : "text-signal-soft",
                  )}
                >
                  ›{" "}
                </span>
                {item.cmd}
              </code>
              <h3 className="mt-3 font-display text-base tracking-tight text-ink">
                {t(`items.${item.key}.name`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">
                {t(`items.${item.key}.body`)}
              </p>
            </>
          );

          return (
            <Reveal
              key={item.key}
              delay={index * 0.05}
              className={cn(
                "relative h-full bg-panel",
                // A neon rail on the one card that destroys something, so it
                // reads as different before you get to the words. The ring is
                // inset and the glow is a shadow, so neither disturbs the
                // one-pixel grid the four cards sit in.
                danger &&
                  "shadow-[0_0_30px_-6px_rgba(255,51,85,0.5),inset_0_0_20px_-12px_rgba(255,51,85,0.9)] ring-1 ring-danger/55 ring-inset",
              )}
            >
              {/* Only /panic comes apart. It is the one command here that
                  destroys something, and an effect on all four would be
                  decoration rather than a warning. */}
              {danger ? (
                <DissolveOnHover className="h-full p-6 sm:p-7">
                  {body}
                </DissolveOnHover>
              ) : (
                <div className="h-full p-6 sm:p-7">{body}</div>
              )}
            </Reveal>
          );
        })}
      </div>

      <p className="mt-6 max-w-2xl text-sm text-faint">{t("note")}</p>
    </Section>
  );
}
