import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/site/reveal";
import type { Release } from "@/lib/changelog";
import { inlineMarkdown } from "@/lib/inline-markdown";
import { site } from "@/lib/site";

/**
 * Releases down a rail.
 *
 * The cadence is the argument here — six versions in four days, at one point —
 * so the shape has to make sequence legible at a glance rather than reading as
 * a stack of cards. A rail with a node per release does that, and the newest
 * one gets a lit node and a heavier number because "this is still moving" is
 * the thing a visitor should take away in the first second.
 *
 * The kinds are coloured by what they mean, not decorated: violet for what was
 * added, cyan for what was repaired, amber for what changed under someone who
 * was already relying on it.
 */

const KIND_TONE: Record<string, string> = {
  Added: "border-signal/40 text-signal-soft",
  Fixed: "border-wire/40 text-wire",
  Changed: "border-warn/40 text-warn",
  Removed: "border-danger/40 text-danger",
  Security: "border-danger/40 text-danger",
};

export async function Timeline({ releases }: { releases: Release[] }) {
  const t = await getTranslations("changelog");

  return (
    <ol className="relative">
      {/* The rail itself, fading out at the bottom because the history keeps
          going in the repository even though the page stops. */}
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-0 left-[5px] w-px bg-gradient-to-b from-line-2 via-line to-transparent md:left-[calc(9rem+5px)]"
      />

      {releases.map((release, index) => {
        const latest = index === 0 && !release.summary;

        return (
          <li key={release.version} className="relative pb-12 pl-7 md:pl-0">
            <Reveal>
              <div className="md:flex md:gap-8">
                <div className="md:w-36 md:shrink-0 md:text-right">
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 mt-[7px] size-[11px] rounded-full border-2 md:left-36 ${
                      latest
                        ? "border-signal bg-signal shadow-[0_0_14px_2px_rgba(123,45,255,0.55)]"
                        : "border-line-2 bg-void"
                    }`}
                  />
                  <h2
                    className={`font-mono tabular-nums ${
                      latest
                        ? "text-xl font-semibold text-ink"
                        : "text-base text-dim"
                    }`}
                  >
                    {release.version}
                  </h2>
                  {latest ? (
                    <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-signal-soft uppercase">
                      {t("latest")}
                    </p>
                  ) : null}
                  {!release.summary ? (
                    <a
                      href={`${site.repo}/releases/tag/v${release.version}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1 inline-block font-mono text-[11px] text-line-2 transition-colors hover:text-signal-soft"
                    >
                      {t("release")}
                    </a>
                  ) : null}
                </div>

                <div className="mt-3 min-w-0 flex-1 md:mt-0 md:pl-8">
                  {release.changes.map((change) => (
                    <div key={change.kind} className="mb-5 last:mb-0">
                      {change.kind ? (
                        <span
                          className={`inline-block rounded-sm border px-1.5 py-px font-mono text-[10px] tracking-wide uppercase ${
                            KIND_TONE[change.kind] ?? "border-line text-faint"
                          }`}
                        >
                          {change.kind}
                        </span>
                      ) : null}
                      <ul className="mt-2.5 space-y-2.5">
                        {change.items.map((item, i) => (
                          <li key={i} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2 size-1 shrink-0 rounded-full bg-line-2"
                            />
                            <p className="max-w-3xl text-sm leading-relaxed text-dim">
                              {inlineMarkdown(item)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
