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
  // gets the reward. Hovering only hints that something is there; a button
  // burning permanently would fight the headline for attention.
  const intensity = copied ? 1 : hovered ? 0.42 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sm border border-line bg-panel px-3 py-2.5 sm:px-4",
        className,
      )}
    >
      <code className="flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap text-ink">
        <span className="text-signal-soft select-none">$ </span>
        {command}
      </code>

      <div className="relative shrink-0">
        {/* Taller than the button and pinned to its base: the flame rises out
            of it. pointer-events-none keeps the click on the button. */}
        <PixelFire
          intensity={intensity}
          className="pointer-events-none absolute -inset-x-3 -top-8 bottom-0 h-[calc(100%+2rem)] w-[calc(100%+1.5rem)]"
        />
        <button
          type="button"
          onClick={copy}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          aria-label={copied ? copiedLabel : copyLabel}
          className={cn(
            "relative flex h-7 shrink-0 items-center gap-1.5 rounded-sm border px-2 font-mono text-xs transition-colors",
            copied
              ? "border-signal/50 bg-panel text-signal-soft"
              : "border-line bg-panel text-faint hover:border-wire/40 hover:text-wire",
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
