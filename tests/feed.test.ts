import { describe, expect, it } from "vitest";

import type { Release } from "@/lib/changelog";
import { atomFeed } from "@/lib/feed";

const RELEASES: Release[] = [
  {
    version: "2.9.0",
    summary: false,
    changes: [
      {
        kind: "Added",
        items: [
          "`/block` now works in **P2P** — see [the docs](https://ciphermesh.de) & try it",
        ],
      },
    ],
  },
  {
    version: "2.8.0",
    summary: false,
    changes: [{ kind: "Fixed", items: ["A <script> in a name"] }],
  },
  {
    version: "2.6.0 and earlier",
    summary: true,
    changes: [{ kind: "", items: ["See releases."] }],
  },
];

const DATES = new Map([
  ["2.9.0", "2026-08-05T10:00:00.000Z"],
  ["2.8.0", "2026-08-05T09:00:00.000Z"],
]);

describe("atomFeed", () => {
  const xml = atomFeed(RELEASES, DATES);

  it("escapes everything that would break the document", () => {
    // One unescaped ampersand takes the whole feed down in every reader at
    // once, and the changelog is prose written by hand — ampersands and angle
    // brackets turn up in it.
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;script&gt;");
  });

  it("strips markdown, since a feed is not rendered as markdown", () => {
    expect(xml).toContain("/block now works in P2P");
    expect(xml).toContain("see the docs");
    expect(xml).not.toContain("**P2P**");
    expect(xml).not.toContain("](https://");
  });

  it("leaves out headings that are not releases", () => {
    // "2.6.0 and earlier" is a signpost in the document: no date, no tag,
    // nothing to link to. Emitting it would put a dead entry in every reader.
    expect(xml).not.toContain("2.6.0 and earlier");
    expect(xml.match(/<entry>/g)).toHaveLength(2);
  });

  it("uses the real publication dates and links to the tag", () => {
    expect(xml).toContain("<updated>2026-08-05T10:00:00.000Z</updated>");
    expect(xml).toContain("/releases/tag/v2.9.0");
  });

  it("still produces a valid document when npm knows no dates", () => {
    // Atom requires updated on the feed and on every entry, so a missing date
    // must fall back rather than emit an empty element.
    const undated = atomFeed(RELEASES, new Map());
    expect(undated).not.toContain("<updated></updated>");
    expect(undated.match(/<updated>/g)).toHaveLength(3); // feed + two entries
  });

  it("is parseable", () => {
    const parsed = new DOMParser().parseFromString(xml, "application/xml");
    expect(parsed.querySelector("parsererror")).toBeNull();
    expect(parsed.querySelectorAll("entry")).toHaveLength(2);
  });
});
