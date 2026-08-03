import type { ReactNode } from "react";

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

        <div className="scanlines relative mt-6 overflow-hidden rounded-sm border border-line bg-panel px-5 py-4 font-mono text-sm sm:px-6">
          <span className="text-warn">{code}</span>
          <span className="text-faint">: {output}</span>
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
