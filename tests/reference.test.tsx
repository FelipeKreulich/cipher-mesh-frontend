import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CommandBrowser } from "@/components/commands/command-browser";
import { parseChangelog } from "@/lib/changelog";
import snapshot from "@/lib/commands.snapshot.json";
import { anchor, type CommandGroup } from "@/lib/commands";
import { inlineMarkdown } from "@/lib/inline-markdown";

import { renderWithIntl } from "./helpers";

const groups = snapshot.groups as CommandGroup[];
const all = groups.flatMap((group) => group.commands);

describe("command snapshot", () => {
  it("is a real reference, not a stub", () => {
    // It is the fallback when GitHub cannot be reached, so an empty or
    // truncated snapshot would turn an outage into a blank page.
    expect(all.length).toBeGreaterThan(50);
    expect(snapshot.counts.total).toBe(all.length);
  });

  it("gives every command an anchor that survives being put in a URL", () => {
    for (const command of all) {
      expect(anchor(command.name)).toMatch(/^[a-z-]+$/);
    }
  });

  it("has no duplicate anchors", () => {
    // Two commands sharing an id would make /commands#x ambiguous, and the
    // second one unreachable by link.
    const ids = all.map((command) => anchor(command.name));
    expect(ids.length).toBe(new Set(ids).size);
  });
});

describe("CommandBrowser", () => {
  it("renders every command on the server, before any filtering", () => {
    // Deep links have to work without JavaScript, and a crawler should see the
    // whole reference rather than an empty box with a search field.
    const { container } = renderWithIntl(<CommandBrowser groups={groups} />);
    expect(container.querySelectorAll("li[id]").length).toBe(all.length);
    expect(container.querySelector("li#verify")).not.toBeNull();
  });

  it("narrows to what was typed", async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<CommandBrowser groups={groups} />);

    await user.type(screen.getByRole("searchbox"), "panic");

    // waitFor, not a bare read: user.type resolves once the keystrokes are
    // dispatched, and the re-render that filters the list happens after. Under
    // a loaded suite that gap is wide enough to read the unfiltered DOM.
    await waitFor(() => {
      const shown = [...container.querySelectorAll("li[id]")].map(
        (li) => li.id,
      );
      expect(shown).toContain("panic");
      expect(shown.length).toBeLessThan(all.length);
    });
  });

  it("filters to the commands that survive without a relay", async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<CommandBrowser groups={groups} />);

    await user.click(screen.getByRole("button", { name: /offline/i }));

    await waitFor(() => {
      const shown = [...container.querySelectorAll("li[id]")].map(
        (li) => li.id,
      );
      // /create is relay-only — a room with a password needs a server to hold it.
      expect(shown).not.toContain("create");
      expect(shown).toContain("verify");
    });
  });

  it("says so plainly when nothing matches", async () => {
    const user = userEvent.setup();
    const { container } = renderWithIntl(<CommandBrowser groups={groups} />);

    await user.type(screen.getByRole("searchbox"), "zzzzz");

    await waitFor(() => {
      expect(container.querySelectorAll("li[id]").length).toBe(0);
      expect(screen.getByText(/zzzzz/)).toBeInTheDocument();
    });
  });
});

describe("parseChangelog", () => {
  const markdown = [
    "# Changelog",
    "",
    "Notable changes per release.",
    "",
    "## 2.9.0",
    "",
    "### Added",
    "",
    "- `/block` now works in **P2P** as well. It matters more there than on a",
    "  relay, because P2P has no room owners at all.",
    "- A second thing.",
    "",
    "## 2.8.0",
    "",
    "### Fixed",
    "",
    "- A room ban was undone by `/nick`.",
    "",
    "## 2.6.0 and earlier",
    "",
    "- See the release history.",
    "",
  ].join("\n");

  const releases = parseChangelog(markdown);

  it("skips the file's own preamble", () => {
    expect(releases.map((r) => r.version)).toEqual([
      "2.9.0",
      "2.8.0",
      "2.6.0 and earlier",
    ]);
  });

  it("joins a bullet that wrapped across lines", () => {
    // The changelog is hard-wrapped, so a naive line-per-item parser would cut
    // most entries in half and read as gibberish.
    const [first] = releases[0].changes[0].items;
    expect(first).toContain("P2P has no room owners at all");
    expect(releases[0].changes[0].items).toHaveLength(2);
  });

  it("marks a heading that is not a version", () => {
    expect(releases[0].summary).toBe(false);
    expect(releases[2].summary).toBe(true);
  });

  it("keeps the kind of each change", () => {
    expect(releases[0].changes[0].kind).toBe("Added");
    expect(releases[1].changes[0].kind).toBe("Fixed");
  });
});

describe("inlineMarkdown", () => {
  it("renders code, bold and links", () => {
    render(
      <p>{inlineMarkdown("run `/panic` — **now** [docs](https://x.dev)")}</p>,
    );

    expect(screen.getByText("/panic").tagName).toBe("CODE");
    expect(screen.getByText("now").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "https://x.dev",
    );
  });

  it("refuses a link that is not http", () => {
    // This text arrives over the network from another repository. Rendering it
    // is fine; letting it hand the reader a javascript: URL is not.
    const { container } = render(
      <p>{inlineMarkdown("[click](javascript:alert(1))")}</p>,
    );

    expect(within(container).queryByRole("link")).toBeNull();
    expect(screen.getByText("click")).toBeInTheDocument();
  });
});
