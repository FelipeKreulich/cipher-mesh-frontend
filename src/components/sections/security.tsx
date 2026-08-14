import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { cn } from "@/lib/utils";

const CAN = ["route", "limits", "ban", "offline"] as const;
const CANNOT = ["read", "delete", "moderate", "hand"] as const;
const MAP = ["content", "identity", "metadata"] as const;

export function Security() {
  const t = useTranslations("security");

  return (
    <Section
      id="security"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
        <Reveal className="bg-panel p-6 sm:p-8">
          <h3 className="font-mono text-[11px] tracking-wide text-faint uppercase">
            {t("canTitle")}
          </h3>
          <ul className="mt-5 space-y-3">
            {CAN.map((key) => (
              <Item key={key} marker="+" tone="faint">
                {t(`can.${key}`)}
              </Item>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="scanlines relative bg-panel p-6 sm:p-8">
          <h3 className="font-mono text-[11px] tracking-wide text-signal-soft uppercase">
            {t("cannotTitle")}
          </h3>
          <ul className="mt-5 space-y-3">
            {CANNOT.map((key) => (
              <Item key={key} marker="×" tone="signal">
                {t(`cannot.${key}`)}
              </Item>
            ))}
          </ul>
        </Reveal>
      </div>

      <p className="mt-6 max-w-3xl text-sm text-faint">{t("footnote")}</p>

      <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
        {MAP.map((key, index) => (
          <Reveal key={key} delay={index * 0.06} className="bg-panel p-6">
            <p className="font-mono text-[11px] text-faint">
              {t(`map.${key}.label`)}
            </p>
            <h3 className="mt-3 font-display text-base tracking-tight text-ink">
              {t(`map.${key}.name`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              {t(`map.${key}.body`)}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Item({
  marker,
  tone,
  children,
}: {
  marker: string;
  tone: "faint" | "signal";
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 font-mono text-sm",
          tone === "signal" ? "text-signal-soft" : "text-line-2",
        )}
      >
        {marker}
      </span>
      <span
        className={cn(
          "text-sm leading-relaxed",
          tone === "signal" ? "text-ink" : "text-faint",
        )}
      >
        {children}
      </span>
    </li>
  );
}
