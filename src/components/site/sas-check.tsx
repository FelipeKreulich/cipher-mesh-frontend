"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { keyArtBox } from "@/lib/key-art";
import { computeSas, DEMO_KEYS } from "@/lib/sas";

/**
 * Verification, by doing it.
 *
 * Two terminals, the same command, and a switch that puts a machine between
 * them. With a direct connection both sides derive the same code, because the
 * code is a hash of the two public keys sorted — neither side has to send
 * anything for them to agree. Put someone in the middle and each side is
 * hashing a *different* pair, because each is talking to the interceptor rather
 * than to the other person, so the codes cannot match no matter how convincing
 * everything else looks.
 *
 * That is the entire argument for reading four words down a phone line, and it
 * is much easier to believe after watching the numbers come apart than after
 * reading a paragraph about it.
 */

type Pane = { code: string; art: string[] };

export function SasCheck() {
  const t = useTranslations("verify.check");
  const [intercepted, setIntercepted] = useState(false);
  const [panes, setPanes] = useState<{ you: Pane; them: Pane } | null>(null);

  useEffect(() => {
    let live = true;

    // Under interception each side is handed the middle key and believes it
    // belongs to the other person — so each derives a code from a different
    // pair, and the art each is shown is the interceptor's.
    const yoursIs = intercepted ? DEMO_KEYS.middle : DEMO_KEYS.peer;
    const theirsIs = intercepted ? DEMO_KEYS.middle : DEMO_KEYS.you;

    Promise.all([
      computeSas(DEMO_KEYS.you, yoursIs),
      computeSas(DEMO_KEYS.peer, theirsIs),
    ])
      .then(([yours, theirs]) => {
        if (!live) return;
        setPanes({
          you: { code: yours, art: keyArtBox(yoursIs, "rita") },
          them: { code: theirs, art: keyArtBox(theirsIs, "you") },
        });
      })
      .catch(() => {});

    return () => {
      live = false;
    };
  }, [intercepted]);

  const matches = !intercepted;

  return (
    <div>
      <div
        role="group"
        aria-label={t("toggle.label")}
        className="inline-flex rounded-md border border-line bg-panel p-1"
      >
        {(
          [
            ["direct", false],
            ["intercepted", true],
          ] as const
        ).map(([key, value]) => (
          <button
            key={key}
            type="button"
            aria-pressed={intercepted === value}
            onClick={() => setIntercepted(value)}
            className={`rounded px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
              intercepted === value
                ? "bg-signal/15 text-ink"
                : "text-faint hover:text-dim"
            }`}
          >
            {t(`toggle.${key}`)}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Terminal
          title={t("panes.you")}
          peer="rita"
          pane={panes?.you}
          highlight={matches}
        />
        <Terminal
          title={t("panes.them")}
          peer="you"
          pane={panes?.them}
          highlight={matches}
        />
      </div>

      {/* A status region, not just a live one: flipping the switch changes the
          advice, and a screen reader has to hear the new advice rather than
          only the numbers changing behind it. */}
      <div
        role="status"
        aria-live="polite"
        className={`mt-5 rounded-lg border p-4 sm:p-5 ${
          matches
            ? "border-signal/40 bg-signal/[0.06]"
            : "border-danger/40 bg-danger/[0.06]"
        }`}
      >
        <p className="font-mono text-xs tracking-wide text-faint">
          {matches ? t("verdict.match.tag") : t("verdict.differ.tag")}
        </p>
        <p className="mt-2 font-semibold text-ink">
          {matches ? t("verdict.match.title") : t("verdict.differ.title")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-dim">
          {matches ? t("verdict.match.body") : t("verdict.differ.body")}
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-faint">{t("note")}</p>
    </div>
  );
}

function Terminal({
  title,
  peer,
  pane,
  highlight,
}: {
  title: string;
  peer: string;
  pane?: Pane;
  highlight: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="border-b border-line bg-panel-2 px-4 py-2 font-mono text-xs text-faint">
        {title}
      </div>
      <div className="overflow-x-auto px-4 py-3 font-mono text-[0.72rem] leading-[1.6] sm:text-xs">
        <div className="w-max min-w-full">
          <div className="text-signal-soft">
            <span className="text-faint">&gt; </span>/verify {peer}
          </div>
          <div className="mt-1.5 text-wire">
            SAS code for {peer}:{" "}
            <span
              className={`rounded px-1 py-0.5 font-semibold ${
                highlight ? "bg-signal/20 text-ink" : "bg-danger/20 text-ink"
              }`}
            >
              {pane?.code ?? "·······"}
            </span>
          </div>
          <pre className="mt-2 whitespace-pre text-faint">
            {pane?.art.join("\n") ?? ""}
          </pre>
        </div>
      </div>
    </div>
  );
}
