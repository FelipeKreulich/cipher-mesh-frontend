import { upstream } from "@/lib/upstream";

/**
 * The changelog, read from the client repository.
 *
 * Six versions shipped in four days at one point, and the site showed none of
 * it — release cadence is one of the more persuasive things about this project
 * and it was invisible. Parsing the file the project already keeps means the
 * page cannot disagree with the repository, and nobody has to remember to
 * update two changelogs.
 */

export type Change = { kind: string; items: string[] };
export type Release = {
  version: string;
  /** True for a heading that is not a version, like "2.6.0 and earlier". */
  summary: boolean;
  changes: Change[];
};

/** Enough of a fallback to keep the page honest if GitHub is unreachable. */
const FALLBACK: Release[] = [
  {
    version: "2.9.0",
    summary: false,
    changes: [
      {
        kind: "Added",
        items: [
          "`/block` now works in **P2P** as well, where there are no room owners and so no moderation at all.",
        ],
      },
    ],
  },
];

const VERSION = /^(\d+\.\d+\.\d+)$/;

/**
 * Split `CHANGELOG.md` into releases.
 *
 * The format is stable and simple: `## <version>` opens a release, `### <kind>`
 * opens a group inside it, and a list item runs until the next one — bullets
 * wrap across lines, so a continuation is any indented line that does not start
 * a new item.
 */
export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = [];
  let release: Release | null = null;
  let change: Change | null = null;

  for (const line of markdown.split("\n")) {
    const heading = /^## +(.+?) *$/.exec(line);
    if (heading) {
      release = {
        version: heading[1],
        summary: !VERSION.test(heading[1]),
        changes: [],
      };
      change = null;
      releases.push(release);
      continue;
    }

    if (!release) continue; // The file's own preamble.

    const kind = /^### +(.+?) *$/.exec(line);
    if (kind) {
      change = { kind: kind[1], items: [] };
      release.changes.push(change);
      continue;
    }

    const item = /^- +(.*)$/.exec(line);
    if (item) {
      if (!change) {
        // A release with no `###` grouping still has changes worth showing.
        change = { kind: "", items: [] };
        release.changes.push(change);
      }
      change.items.push(item[1]);
      continue;
    }

    // A wrapped bullet, or a paragraph hanging off one.
    const trimmed = line.trim();
    if (change && change.items.length > 0 && trimmed) {
      const last = change.items.length - 1;
      change.items[last] = `${change.items[last]} ${trimmed}`;
    }
  }

  return releases.filter((entry) => entry.changes.length > 0);
}

/**
 * When each version was published, from npm.
 *
 * The changelog itself carries no dates — deliberately, since a hand-written
 * date is one more thing to get wrong — but a feed needs them, and the registry
 * already knows precisely. Returns an empty map rather than throwing: a feed
 * with approximate dates beats no feed.
 */
export async function releaseDates(): Promise<Map<string, string>> {
  try {
    const res = await fetch("https://registry.npmjs.org/ciphermesh", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return new Map();

    const data = (await res.json()) as { time?: Record<string, string> };
    const entries = Object.entries(data.time ?? {}).filter(
      ([version]) => !["created", "modified"].includes(version),
    );
    return new Map(entries);
  } catch {
    return new Map();
  }
}

export async function changelog(): Promise<{
  releases: Release[];
  live: boolean;
}> {
  const raw = await upstream("CHANGELOG.md");
  if (raw) {
    const releases = parseChangelog(raw);
    if (releases.length > 0) return { releases, live: true };
  }
  return { releases: FALLBACK, live: false };
}
