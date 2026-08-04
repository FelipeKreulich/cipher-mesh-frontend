import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyCommand } from "@/components/site/copy-command";
import { PixelFire } from "@/components/site/pixel-fire";

import { renderWithIntl } from "./helpers";

function reducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PixelFire", () => {
  it("never draws when the visitor asked for reduced motion", () => {
    reducedMotion(true);
    const getContext = vi.fn();
    HTMLCanvasElement.prototype.getContext = getContext;

    render(<PixelFire intensity={1} />);

    // Bailing before the context is even requested is the check that matters:
    // it means no frame loop was ever set up, not just that it looks still.
    expect(getContext).not.toHaveBeenCalled();
  });

  it("is hidden from assistive technology", () => {
    reducedMotion(true);
    const { container } = render(<PixelFire intensity={0} />);
    expect(container.querySelector("canvas")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

describe("CopyCommand with fire", () => {
  it("still copies, and the button keeps its accessible name", async () => {
    reducedMotion(true);
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderWithIntl(
      <CopyCommand
        command="npx ciphermesh@latest"
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    );

    // The flame sits in the same box as the button; if it ever intercepted the
    // pointer, the page's main call to action would silently stop working.
    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith("npx ciphermesh@latest");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeVisible();
  });
});
