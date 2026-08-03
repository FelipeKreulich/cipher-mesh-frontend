"use client";

import { useEffect } from "react";

import "./globals.css";

/**
 * Last resort: this renders when the root layout itself failed, so there is no
 * locale, no messages and no header. It is deliberately plain and English-only,
 * and it carries its own html/body because nothing above it succeeded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-svh items-center bg-void text-ink">
        <main className="shell max-w-2xl">
          <p className="font-mono text-xs text-signal-soft">
            ~/ciphermesh $ ciphermesh --render
          </p>

          <div className="mt-6 rounded-sm border border-line bg-panel px-5 py-4 font-mono text-sm">
            <span className="text-warn">500</span>
            <span className="text-faint">
              : the site failed to load
              {error.digest ? ` (${error.digest})` : ""}
            </span>
          </div>

          <h1 className="mt-8 font-mono text-2xl leading-tight tracking-tight">
            CipherMesh could not start
          </h1>
          <p className="mt-4 leading-relaxed text-dim">
            Something broke before the page could be built. Reloading usually
            clears it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="h-10 rounded-sm bg-signal px-4 font-mono text-sm text-white transition-opacity hover:opacity-90"
            >
              Try again
            </button>
            <a
              href="https://github.com/FelipeKreulich/cipher-mesh-frontend/issues/new/choose"
              className="flex h-10 items-center rounded-sm border border-line px-4 font-mono text-sm text-dim transition-colors hover:text-ink"
            >
              Report it
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
