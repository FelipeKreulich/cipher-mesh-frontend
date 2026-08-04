import { notFound } from "next/navigation";

/**
 * Anything under a locale that matches no real page.
 *
 * Without this, an unknown path never reaches `[locale]/not-found.tsx`: that
 * file only renders when something inside the segment calls `notFound()`, and
 * an unmatched route falls through to Next's built-in 404 instead. The status
 * code was right all along, which is what made it easy to miss — the page was
 * simply not ours.
 */
export default function CatchAll() {
  notFound();
}
