import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import en from "@/../messages/en.json";
import pt from "@/../messages/pt.json";
import { releaseAnchor } from "@/lib/changelog";
import { paletteSections } from "@/lib/palette";

/**
 * The palette's destinations, checked against the pages that exist.
 *
 * Every section entry used to be `/#<id>`, which was right while the site was
 * one long page and quietly wrong the moment the sections moved onto routes of
 * their own — nine of twelve dumped the visitor at the top of home. Nothing
 * threw, no test failed, and it shipped. So the guard is here rather than in a
 * comment: resolve each href for real, against the route directory and the
 * section components that page renders.
 */

// `import.meta.url` is an http URL under the jsdom environment, so the repo
// root comes from the working directory vitest was started in.
const root = process.cwd();
const page = (route: string) =>
  `${root}/src/app/[locale]${route === "/" ? "" : route}/page.tsx`;

function read(path: string) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/** Every element id the page can render, via the sections it composes. */
function idsOn(route: string): string[] | null {
  const source = read(page(route));
  if (source === null) return null;

  const sections = [
    ...source.matchAll(/from "@\/components\/sections\/(.+)";/g),
  ]
    .map(([, name]) => read(`${root}/src/components/sections/${name}.tsx`))
    .filter((body): body is string => body !== null);

  // Leading whitespace keeps `data-id=` and `aria-labelledby=` out of it; the
  // attribute has to be `id` on its own.
  return [...sections.join("\n").matchAll(/\sid="([a-z0-9-]+)"/g)].map(
    ([, id]) => id,
  );
}

const entries = paletteSections.map((entry) => {
  const [route, fragment] = entry.href.split("#");
  return { ...entry, route: route === "" ? "/" : route, fragment };
});

describe("palette sections", () => {
  it.each(entries)("$id points at a route that exists", ({ route }) => {
    expect(read(page(route))).not.toBeNull();
  });

  it.each(entries)(
    "$id lands on a real anchor, not the top of the page",
    ({ route, fragment }) => {
      expect(idsOn(route)).toContain(fragment);
    },
  );

  it.each(entries)("$id has a nav label in both locales", ({ id }) => {
    expect(en.nav).toHaveProperty(id);
    expect(pt.nav).toHaveProperty(id);
  });

  it("sends no two entries to the same place", () => {
    const hrefs = entries.map((entry) => entry.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("releaseAnchor", () => {
  it("is the git tag, so one release is spelled one way everywhere", () => {
    expect(releaseAnchor("2.12.0")).toBe("v2.12.0");
  });

  it("is an id the timeline actually sets", () => {
    // The palette links `/changelog#v2.12.0`; if the timeline stops writing
    // that id the link silently degrades to the top of the page again.
    const timeline = read(`${root}/src/components/changelog/timeline.tsx`);
    expect(timeline).toContain("id={release.summary ? undefined");
    expect(timeline).toContain("releaseAnchor(release.version)");
  });
});
