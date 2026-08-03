import type { SVGProps } from "react";

/**
 * Two squares meeting at a single corner: the plaintext half you hold and the
 * sealed half that goes on the wire. They touch and never overlap, which is
 * the shortest way to draw what the relay is allowed to know.
 */
export function MeshMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <rect x="6" y="6" width="10" height="10" rx="1" fill="#A06BFF" />
      <rect x="16" y="16" width="10" height="10" rx="1" fill="#4CC9F0" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <MeshMark className="inline-block size-[1.15em] translate-y-[0.12em]" />
      <span className="ml-2">ciphermesh</span>
    </span>
  );
}
