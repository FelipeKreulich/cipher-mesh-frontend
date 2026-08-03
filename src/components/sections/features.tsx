import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";

/**
 * The tag under each heading is the actual primitive or keybinding behind the
 * feature, so a reader who knows the field can check the claim without reading
 * the paragraph, and everyone else learns the real name for it.
 */
const ITEMS = [
  { key: "pq", tag: "ml-kem-768" },
  { key: "pfs", tag: "double-ratchet" },
  { key: "sealed", tag: "sealed-sender" },
  { key: "rooms", tag: "argon2id" },
  { key: "buffers", tag: "alt+1..9" },
  { key: "p2p", tag: "mdns" },
] as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <Section id="what" prompt={t("prompt")} title={t("title")} lead={t("lead")}>
      <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item, index) => (
          <Reveal
            key={item.key}
            delay={index * 0.05}
            className="h-full bg-panel p-6 sm:p-7"
          >
            <p className="font-mono text-[11px] tracking-wide text-wire">
              {item.tag}
            </p>
            <h3 className="mt-3 font-display text-base tracking-tight text-ink">
              {t(`items.${item.key}.name`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              {t(`items.${item.key}.body`)}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
