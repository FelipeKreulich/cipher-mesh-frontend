import { useTranslations } from "next-intl";

import { Reveal } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { TranscriptPlayer } from "@/components/site/transcript-player";

const NOTES = ["verbatim", "derived", "nothing"] as const;

/**
 * The one place the site runs instead of describing.
 *
 * Everything above this is a claim in prose. A recorded session — connect,
 * verify a peer against their key, say something, wipe the disk — is the only
 * element on the page that shows the product existing, and it costs a few
 * kilobytes of text rather than a video that would not match the theme, would
 * not scale, and would go stale the first time a string changed.
 */
export function Replay() {
  const t = useTranslations("replay");

  return (
    <Section
      id="replay"
      prompt={t("prompt")}
      title={t("title")}
      lead={t("lead")}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-10">
        <Reveal>
          <TranscriptPlayer replayLabel={t("replay")} />
        </Reveal>

        <ul className="space-y-6">
          {NOTES.map((key, index) => (
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
                    {t(`notes.${key}.name`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dim">
                    {t(`notes.${key}.body`)}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
