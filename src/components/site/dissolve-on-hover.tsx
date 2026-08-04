"use client";

import { useState, type ReactNode } from "react";

import { PixelDissolve } from "@/components/site/pixel-dissolve";
import { cn } from "@/lib/utils";

/**
 * Keeps the hover state for the one card that comes apart, so the section
 * around it can stay a server component.
 */
export function DissolveOnHover({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn("relative isolate", className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      {children}

      {/* Over the content, not behind it: this one eats the card rather than
          glowing around it. A canvas is a replaced element, so it needs a plain
          div to stretch for it — `inset` alone leaves it at its intrinsic size. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <PixelDissolve
          intensity={hovered ? 1 : 0}
          className="h-full w-full rounded-sm"
        />
      </div>
    </div>
  );
}
