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
 * `/status` writes its own `h1` and deliberately does not scramble it.
 *
 * It is `force-dynamic`, and pulling GSAP onto a route that renders on demand
 * stops it sharing the scramble chunk with the static pages: the chunker writes
 * GSAP and `motion` into three per-route copies instead of one. Measured at
 * +105 KiB gzipped across the site — 383.1 KiB before, 488.4 KiB after, against
 * a 419.9 KiB budget. A hover flourish on one heading does not buy that, least
 * of all on the page people open when they already think something is broken.
 *
 * Tracked in #54. Closing it means deleting this set.
 */
const NO_SCRAMBLE = new Set(["status"]);

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

  it("keeps the exemption list down to the one page that earns it", () => {
    // An allowlist nobody prunes is how the rule dies. Anything added here has
    // to come with a measurement and an issue, the way #54 did.
    expect([...NO_SCRAMBLE]).toEqual(["status"]);
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
