import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  CommandPalette,
  type PaletteData,
} from "@/components/site/command-palette";

import { renderWithIntl } from "./helpers";

const push = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeAll(() => {
  // cmdk measures its list with a ResizeObserver, which jsdom does not have.
  // A no-op is enough: nothing here asserts on layout.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // Radix's dialog scroll-lock reaches for these too.
  Element.prototype.scrollIntoView ??= () => {};
});

const DATA: PaletteData = {
  sections: [{ id: "security", label: "Security", href: "/#security" }],
  commands: [
    {
      id: "/panic",
      label: "/panic",
      hint: "Duress wipe — erase all on-disk secrets and exit",
      href: "/commands#panic",
    },
    {
      id: "/verify",
      label: "/verify",
      hint: "SAS code",
      href: "/commands#verify",
    },
  ],
  releases: [
    { id: "2.9.0", label: "2.9.0", hint: "Added", href: "/changelog" },
  ],
};

async function open() {
  const user = userEvent.setup();
  renderWithIntl(<CommandPalette data={DATA} />);
  await user.keyboard("{Control>}k{/Control}");
  return user;
}

describe("CommandPalette", () => {
  it("mounts without a store error and stays closed until asked", () => {
    // The first version of this shipped broken: shadcn's CommandDialog renders
    // only a Dialog, so every CommandItem was subscribing to a cmdk store that
    // did not exist. It threw on open, and nothing caught it because there was
    // no test. This is that test.
    expect(() => renderWithIntl(<CommandPalette data={DATA} />)).not.toThrow();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on ctrl+k and lists all three kinds of thing", async () => {
    await open();

    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    expect(screen.getByText("/panic")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("2.9.0")).toBeInTheDocument();
  });

  it("matches on the description, not only on the name", async () => {
    // Somebody who wants the wipe command is far more likely to type "wipe"
    // than "/panic", which is why the hint goes into the searchable value.
    const user = await open();
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

    await user.type(screen.getByRole("combobox"), "wipe");

    await waitFor(() => {
      expect(screen.getByText("/panic")).toBeInTheDocument();
      expect(screen.queryByText("/verify")).toBeNull();
    });
  });

  it("navigates and closes when something is chosen", async () => {
    push.mockClear();
    const user = await open();
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

    await user.click(screen.getByText("/panic"));

    expect(push).toHaveBeenCalledWith("/commands#panic");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
