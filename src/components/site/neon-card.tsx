import type { ReactNode } from "react";

import { PixelTrace } from "@/components/site/pixel-trace";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

/**
 * A card with a light running its border, for the two statements the hub most
 * needs read.
 *
 * The colour is not a style choice: this site already means something by it.
 * Cyan is what travels on the wire — the hub, which belongs to nobody. Violet
 * is what you hold — a relay you run yourself. The rail says which is which
 * before the heading does.
 */
const TONES = {
  wire: {
    ring: "ring-wire/40",
    glow: "shadow-[0_0_30px_-10px_rgba(76,201,240,0.5)]",
    tag: "text-wire [text-shadow:0_0_12px_rgba(76,201,240,0.7)]",
  },
  signal: {
    ring: "ring-signal/45",
    glow: "shadow-[0_0_30px_-10px_rgba(123,45,255,0.6)]",
    tag: "text-signal-soft [text-shadow:0_0_12px_rgba(160,107,255,0.75)]",
  },
} as const;

type NeonCardProps = {
  /** `wire` for the hub, `signal` for anything the visitor would own. */
  tone: keyof typeof TONES;
  /** A real command or address — never a label invented for decoration. */
  tag: string;
  title: string;
  children: ReactNode;
  delay?: number;
};

export function NeonCard({
  tone,
  tag,
  title,
  children,
  delay = 0,
}: NeonCardProps) {
  const t = TONES[tone];

  return (
    <Reveal
      delay={delay}
      className={cn(
        "relative h-full bg-panel p-6 ring-1 ring-inset sm:p-7",
        t.ring,
        t.glow,
      )}
    >
      {/* The canvas is a replaced element, so it needs a plain div to stretch
          for it — `inset` alone leaves it at its intrinsic size. */}
      <div className="pointer-events-none absolute inset-0">
        <PixelTrace tone={tone} className="h-full w-full" />
      </div>

      <div className="relative">
        <p className={cn("font-mono text-[11px] tracking-wide", t.tag)}>
          {tag}
        </p>
        <h3 className="mt-3 font-display text-base tracking-tight text-ink">
          {title}
        </h3>
        <div className="mt-3 text-sm leading-relaxed text-dim">{children}</div>
      </div>
    </Reveal>
  );
}
