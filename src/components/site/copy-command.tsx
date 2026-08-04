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
      {/* Behind the panel, and larger than it on every side. The panel stays
          opaque, so the flames only show where they lick past its edges — which
          keeps the command readable while it burns. */}
      <PixelFire
        intensity={intensity}
        className="pointer-events-none absolute -inset-x-6 -top-12 -bottom-3 z-0"
      />

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
