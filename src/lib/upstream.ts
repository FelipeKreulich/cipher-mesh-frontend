const RAW = "https://raw.githubusercontent.com/FelipeKreulich/secret-chat-lan";

/**
 * Read a file out of the client repository at build and revalidation time.
 *
 * The commands reference and the changelog are both content the project already
 * maintains, and copying either one into this repository would mean maintaining
 * it twice and getting it wrong the first time a release went out. `master` is
 * the branch, so the site shows what is released rather than what is in
 * progress.
 *
 * Every caller passes a committed snapshot as the fallback. A GitHub outage, a
 * rename or a network hiccup during a build then costs freshness rather than a
 * broken page — and because the snapshot is committed, the page still renders
 * with nothing at all reachable.
 */
export async function upstream(
  path: string,
  { revalidate = 3600 }: { revalidate?: number } = {},
): Promise<string | null> {
  try {
    const res = await fetch(`${RAW}/master/${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}
