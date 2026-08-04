"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { PixelFire } from "@/components/site/pixel-fire";
import { cn } from "@/lib/utils";

type CopyCommandProps = {
  command: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
};

export function CopyCommand({
  command,
  copyLabel,
  copiedLabel,
  className,
}: CopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // Clipboard blocked — the command is on screen and selectable anyway.
    }
  };

  // Copying the command is the one thing this page is really asking for, so it
  // gets the reward. Hovering only hints that something is there; a box burning
  // permanently would fight the headline for attention.
  const intensity = copied ? 1 : hovered ? 0.42 : 0;

  return (
    <div
      className={cn("relative isolate", className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* One band wider than the panel on every side. Each edge burns outwards
          into its own band, so the flames stay inside this box and cannot climb
          over the paragraph above.

          The inset pairs with BAND in pixel-fire.tsx — change one, change both.

          The canvas needs a plain div to stretch for it: a canvas is a replaced
          element, so `inset` alone leaves it at its intrinsic size, tucked into
          the corner. */}
      <div className="pointer-events-none absolute -inset-4 z-0">
        <PixelFire intensity={intensity} className="h-full w-full" />
      </div>

      <div className="relative z-10 flex items-center gap-3 rounded-sm border border-line bg-panel px-3 py-2.5 sm:px-4">
        <code className="flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap text-ink">
          <span className="text-signal-soft select-none">$ </span>
          {command}
        </code>
        <button
          type="button"
          onClick={copy}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-label={copied ? copiedLabel : copyLabel}
          className={cn(
            "flex h-7 shrink-0 items-center gap-1.5 rounded-sm border px-2 font-mono text-xs transition-colors",
            copied
              ? "border-signal/50 text-signal-soft"
              : "border-line text-faint hover:border-wire/40 hover:text-wire",
          )}
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {copied ? copiedLabel : copyLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
