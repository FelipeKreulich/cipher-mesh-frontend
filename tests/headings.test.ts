import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Page headings scramble, all of them.
 *
 * `/commands`, `/changelog` and `/status` each hand-rolled the chrome
 * `PageIntro` provides — the back link, the `Reveal`, the prompt line, the `h1`
 * and the lead — and so quietly missed the scramble when it was added to the
 * shared component. Three pages copied the same twelve-word class string and
 * three pages drifted from the rest of the site.
 *
 * Nothing about that is catchable by rendering: the pages were correct, just
 * inconsistent. So the check is on the source — a page may not own a bare `h1`.
 */

/**
 * Nothing is exempt any more.
 *
 * `/status` used to be: it is `force-dynamic`, and a route rendered on demand
 * does not share entry chunks with the static ones, so putting the GSAP-backed
 * scramble on it wrote GSAP and `motion` into three per-route copies instead of
 * one — +105 KiB gzipped across the site, over budget, for a hover flourish on
 * the page people open when they already think something is broken.
 *
 * #54 removed the dependency rather than the effect: the scramble is a few
 * dozen lines of requestAnimationFrame now, GSAP is gone from the site, and
 * every page can afford it. Kept as an empty set on purpose — an exemption has
 * to be added deliberately, with a measurement and an issue, the way #54 was.
 */
const NO_SCRAMBLE = new Set<string>([]);

const root = process.cwd();
const routes = `${root}/src/app/[locale]`;

/** Every route page under `[locale]`, including the nested ones. */
function pages(dir = routes): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return pages(`${dir}/${entry.name}`);
    return entry.name === "page.tsx" ? [`${dir}/${entry.name}`] : [];
  });
}

const all = pages().map((path) => ({
  name: path.slice(routes.length + 1).replace("/page.tsx", "") || "(home)",
  source: readFileSync(path, "utf8"),
}));

describe("page headings", () => {
  it("finds the routes to check", () => {
    // A rename that quietly empties this list would make every test below
    // pass by vacuum.
    expect(all.map((page) => page.name)).toContain("commands");
    expect(all.map((page) => page.name)).toContain("changelog");
  });

  it.each(
    all.filter(
      (page) => page.source.includes("<h1") && !NO_SCRAMBLE.has(page.name),
    ),
  )("$name scrambles the h1 it writes itself", ({ source }) => {
    expect(source).toContain("ScrambledText");
  });

  it("exempts no page at all", () => {
    // An allowlist nobody prunes is how the rule dies. Anything added here has
    // to come with a measurement and an issue, the way #54 did.
    expect([...NO_SCRAMBLE]).toEqual([]);
  });

  it("checks the page that used to be exempt", () => {
    // The reason status was exempt is gone, so the point of this file is that
    // status is now one of the pages the rule above actually runs on.
    const status = all.find((page) => page.name === "status");
    expect(status?.source).toContain("<h1");
    expect(status?.source).toContain("ScrambledText");
  });

  it.each(["commands", "changelog"])(
    "%s takes its heading from PageIntro rather than copying it",
    (name) => {
      const page = all.find((candidate) => candidate.name === name);
      expect(page?.source).toContain("PageIntro");
      // The class string is PageIntro's signature. Copying it back here is how
      // these two drifted in the first place.
      expect(page?.source).not.toContain("font-display text-section");
    },
  );
});
