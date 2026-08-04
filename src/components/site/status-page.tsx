import type { ReactNode } from "react";

import { PixelFire } from "@/components/site/pixel-fire";

/**
 * Shared frame for 404 and the error boundary. Both are the same idea — a
 * command that did not work — so they get the same shape and differ only in
 * what they say and what they offer next.
 */
export function StatusPage({
  prompt,
  code,
  output,
  title,
  body,
  children,
}: {
  prompt: string;
  code: string;
  output: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="shell flex min-h-[70svh] flex-col justify-center py-24">
      <div className="max-w-2xl">
        <p className="prompt">{prompt}</p>

        {/* The status line burns, quietly and without stopping. Nothing else on
            these pages moves, almost nobody reaches them, and whoever does hit
            a dead end may as well get something for it. Amber because that is
            the colour this site keeps for things going wrong.

            The inset pairs with BAND in pixel-fire.tsx — change one, change
            both. The canvas needs a plain div to stretch for it. */}
        <div className="relative isolate mt-6">
          <div className="pointer-events-none absolute -inset-4 z-0">
            <PixelFire intensity={0.5} tone="warn" className="h-full w-full" />
          </div>
          <div className="scanlines relative z-10 overflow-hidden rounded-sm border border-line bg-panel px-5 py-4 font-mono text-sm sm:px-6">
            <span className="text-warn">{code}</span>
            <span className="text-faint">: {output}</span>
          </div>
        </div>

        <h1 className="mt-8 font-display text-2xl leading-tight tracking-tight text-balance text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="prose-body mt-4">{body}</p>

        <div className="mt-8 flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}
