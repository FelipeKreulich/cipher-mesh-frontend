import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CopyCommand } from "@/components/site/copy-command";

import { renderWithIntl } from "./helpers";

/**
 * userEvent.setup() installs its own clipboard stub, so the mock has to be
 * planted afterwards or the component never sees it.
 */
function stubClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
}

describe("CopyCommand", () => {
  it("copies the command and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    renderWithIntl(
      <CopyCommand
        command="npx ciphermesh@latest"
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith("npx ciphermesh@latest");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeVisible();
  });

  it("stays usable when the clipboard is blocked", async () => {
    // Browsers refuse clipboard access outside a secure context. The command is
    // on screen and selectable either way, so a rejection must not throw and
    // must not claim success.
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));

    renderWithIntl(
      <CopyCommand
        command="npx ciphermesh"
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("button", { name: "Copy" })).toBeVisible();
  });
});
