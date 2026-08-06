import type { Release } from "@/lib/changelog";
import { site } from "@/lib/site";

/**
 * The releases as an Atom document.
 *
 * Pure, and separate from the route, because the part of a feed that breaks is
 * never the fetching — it is an unescaped ampersand in a changelog entry taking
 * the whole document down in every reader at once. That is worth a test, and a
 * test needs a function it can call without a network.
 */

const FEED_URL = `${site.url}/changelog.xml`;

/** Markdown is for people; the feed carries plain sentences. */
function plain(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function summarise(release: Release): string {
  return release.changes
    .map((change) => {
      const heading = change.kind ? `${change.kind}:\n` : "";
      return (
        heading + change.items.map((item) => `- ${plain(item)}`).join("\n")
      );
    })
    .join("\n\n");
}

export function atomFeed(
  releases: Release[],
  dates: Map<string, string>,
): string {
  // Only real versions. "2.6.0 and earlier" is a signpost inside the document,
  // not a release: no date, no tag, nothing to link to.
  const entries = releases.filter((release) => !release.summary);

  const updated =
    entries.map((r) => dates.get(r.version)).find(Boolean) ??
    new Date(0).toISOString();

  const host = new URL(site.url).host;

  const body = entries
    .map((release) => {
      const tag = `v${release.version}`;
      // No date means npm has not seen this version yet — an entry written
      // ahead of the release. Anchoring it to the feed's own timestamp keeps
      // the document valid without inventing a publication date.
      const when = dates.get(release.version) ?? updated;

      return `  <entry>
    <title>${escape(site.name)} ${escape(release.version)}</title>
    <id>tag:${escape(host)},2026:${escape(tag)}</id>
    <link rel="alternate" href="${escape(`${site.repo}/releases/tag/${tag}`)}"/>
    <updated>${escape(when)}</updated>
    <content type="text">${escape(summarise(release))}</content>
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escape(site.name)} releases</title>
  <subtitle>Every release and what changed in it.</subtitle>
  <id>${escape(FEED_URL)}</id>
  <link rel="self" href="${escape(FEED_URL)}"/>
  <link rel="alternate" href="${escape(`${site.url}/en/changelog`)}"/>
  <updated>${escape(updated)}</updated>
${body}
</feed>
`;
}
