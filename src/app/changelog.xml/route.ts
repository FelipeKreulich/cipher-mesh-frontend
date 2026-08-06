import { changelog, releaseDates } from "@/lib/changelog";
import { atomFeed } from "@/lib/feed";

/**
 * An Atom feed of releases.
 *
 * Somebody depending on a security tool wants to hear about a new version
 * without following a repository, and "still maintained" is part of what they
 * are trusting. It comes from the same parsed CHANGELOG the page renders, so
 * the two cannot disagree, and the dates come from npm because the changelog
 * deliberately carries none.
 *
 * Atom rather than RSS 2.0: unambiguous dates, real entry IDs, and every reader
 * handles it.
 */
export const revalidate = 3600;

export async function GET() {
  const [{ releases }, dates] = await Promise.all([
    changelog(),
    releaseDates(),
  ]);

  return new Response(atomFeed(releases, dates), {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
