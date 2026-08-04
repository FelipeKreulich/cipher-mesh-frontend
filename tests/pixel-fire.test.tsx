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

  it("sets up and tears down cleanly when motion is allowed", () => {
    // Every other test runs the reduced-motion path, which returns before any
    // of the fire code executes. Without this one, the animation itself is
    // never exercised and could throw in a browser while CI stays green.
    reducedMotion(false);

    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = disconnect;
      },
    );

    const putImageData = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      createImageData: (w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      putImageData,
      clearRect: vi.fn(),
    })) as unknown as HTMLCanvasElement["getContext"];

    const { unmount } = render(<PixelFire intensity={1} />);

    expect(observe).toHaveBeenCalled();
    expect(() => unmount()).not.toThrow();
    expect(disconnect).toHaveBeenCalled();
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
