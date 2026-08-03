"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";

import DecryptedText from "@/components/DecryptedText";
import { CopyCommand } from "@/components/site/copy-command";
import { GitHubIcon } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import { sealedLines } from "@/lib/cipher";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Line = { who: string; text: string };

const TYPE_MS = 38;
const HOLD_LINE_MS = 900;
const HOLD_ALL_MS = 3200;
const SEALED_COLS = 44;

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();

  const lines = useMemo(() => t.raw("transcript") as Line[], [t]);

  // Each plaintext line has one envelope, and every envelope is the same
  // length — that is the whole demonstration, so the rows must line up 1:1.
  const sealed = useMemo(
    () =>
      lines.map(
        (line, index) =>
          sealedLines(`${index}:${line.text}`, 1, SEALED_COLS)[0],
      ),
    [lines],
  );

  // Server render shows the finished conversation: correct without JavaScript,
  // and it means the animation starts from a complete frame rather than a blank
  // one. The first thing the loop does is hold, then clear and retype.
  const [cursor, setCursor] = useState(() => ({
    index: lines.length - 1,
    chars: lines[lines.length - 1]?.text.length ?? 0,
  }));

  useEffect(() => {
    if (reduce) return;
    const current = lines[cursor.index];
    if (!current) return;

    const done = cursor.chars >= current.text.length;
    const last = cursor.index === lines.length - 1;
    const delay = !done ? TYPE_MS : last ? HOLD_ALL_MS : HOLD_LINE_MS;

    const timer = window.setTimeout(() => {
      setCursor((prev) => {
        const line = lines[prev.index];
        if (prev.chars < line.text.length) {
          return { index: prev.index, chars: prev.chars + 1 };
        }
        if (prev.index < lines.length - 1) {
          return { index: prev.index + 1, chars: 0 };
        }
        return { index: 0, chars: 0 };
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [cursor, lines, reduce]);

  const progressFor = (index: number) => {
    if (reduce) return 1;
    if (index < cursor.index) return 1;
    if (index > cursor.index) return 0;
    return cursor.chars / Math.max(1, lines[index].text.length);
  };

  return (
    <section id="top" className="relative">
      <div className="shell pt-16 pb-20 sm:pt-24 sm:pb-28">
        <p className="prompt">{t("prompt")}</p>

        <h1 className="mt-6 max-w-4xl font-display text-hero leading-[1.08] tracking-[-0.035em] text-balance text-ink">
          {reduce ? (
            t("title")
          ) : (
            // The headline arrives the way a message does: noise on the wire
            // first, then plaintext. The scramble uses the base64 alphabet so
            // it matches the sealed pane below.
            <DecryptedText
              text={t("title")}
              animateOn="view"
              sequential
              revealDirection="start"
              speed={26}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
              parentClassName="block"
              className="text-ink"
              encryptedClassName="text-wire/60"
            />
          )}
        </h1>

        <p className="prose-body mt-6 max-w-2xl">{t("lead")}</p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 px-5">
              <a href="#start">
                {t("cta")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5">
              <a href={site.repo} target="_blank" rel="noreferrer noopener">
                <GitHubIcon className="size-4" />
                {t("ctaSecondary")}
              </a>
            </Button>
          </div>
          <CopyCommand
            command={site.install}
            copyLabel={t("copy")}
            copiedLabel={t("copied")}
            className="sm:max-w-sm sm:flex-1"
          />
        </div>

        {/* The signature: the same conversation twice. Left grows and shrinks
            with what is said; right never changes shape. */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2">
          <Pane label={t("youType")} meta={t("youTypeMeta")} tone="signal">
            {lines.map((line, index) => {
              const shown = Math.round(progressFor(index) * line.text.length);
              const active = !reduce && index === cursor.index;
              return (
                <p
                  key={line.text}
                  data-slot="plain-row"
                  className={cn(
                    "truncate",
                    shown === 0 && !active && "opacity-0",
                  )}
                >
                  <span
                    className={
                      line.who === "you" ? "text-signal-soft" : "text-faint"
                    }
                  >
                    {line.who}
                  </span>
                  <span className="text-faint"> › </span>
                  <span className={cn("text-ink", active && "caret")}>
                    {line.text.slice(0, shown)}
                  </span>
                </p>
              );
            })}
          </Pane>

          <Pane label={t("relaySees")} meta={t("relaySeesMeta")} tone="wire">
            {sealed.map((row, index) => {
              const shown = Math.round(progressFor(index) * SEALED_COLS);
              return (
                <p
                  key={lines[index].text}
                  data-slot="sealed-row"
                  className={cn(
                    "truncate text-wire/70",
                    shown === 0 && "opacity-0",
                  )}
                >
                  {row.slice(0, Math.max(shown, 1))}
                </p>
              );
            })}
          </Pane>
        </div>

        <p className="mt-5 max-w-3xl text-sm text-faint">{t("relayNote")}</p>
      </div>
    </section>
  );
}

function Pane({
  label,
  meta,
  tone,
  children,
}: {
  label: string;
  meta: string;
  tone: "signal" | "wire";
  children: React.ReactNode;
}) {
  return (
    <div className="scanlines relative bg-panel">
      <div className="flex items-baseline justify-between gap-3 border-b border-line/80 px-4 py-2.5">
        <span
          className={cn(
            "font-mono text-[11px] tracking-wide uppercase",
            tone === "signal" ? "text-signal-soft" : "text-wire",
          )}
        >
          {label}
        </span>
        <span className="truncate font-mono text-[11px] text-faint">
          {meta}
        </span>
      </div>
      <div className="space-y-1.5 px-4 py-5 font-mono text-[13px] leading-relaxed sm:text-sm">
        {children}
      </div>
    </div>
  );
}
