import type { ReactNode } from "react";

import ScrambledText from "@/components/ScrambledText";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  prompt: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  /** Scatters the heading's characters under the pointer. On by default. */
  scrambleTitle?: boolean;
};

/**
 * Every section opens the way the product does: a command, then its output.
 * The `~/ciphermesh $` prefix is drawn by CSS so assistive tech reads the
 * command on its own.
 */
export function Section({
  id,
  prompt,
  title,
  lead,
  children,
  className,
  scrambleTitle = true,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-20 py-20 sm:py-28", className)}
    >
      <div className="shell">
        <Reveal>
          <p className="prompt">{prompt}</p>
          <h2 className="mt-5 max-w-3xl font-display text-section leading-[1.06] tracking-tight text-balance text-ink">
            {scrambleTitle ? <ScrambledText>{title}</ScrambledText> : title}
          </h2>
          {lead ? <p className="prose-body mt-5 max-w-2xl">{lead}</p> : null}
        </Reveal>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}
