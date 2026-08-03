"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

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
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? copiedLabel : copyLabel}
        className="flex h-7 shrink-0 items-center gap-1.5 rounded-sm border border-line px-2 font-mono text-xs text-faint transition-colors hover:border-wire/40 hover:text-wire"
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
  );
}
