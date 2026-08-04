import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Controls } from "@/components/sections/controls";
import { PixelDissolve } from "@/components/site/pixel-dissolve";

import { messages, renderWithIntl } from "./helpers";

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

describe("PixelDissolve", () => {
  it("never draws when the visitor asked for reduced motion", () => {
    reducedMotion(true);
    const getContext = vi.fn();
    HTMLCanvasElement.prototype.getContext = getContext;

    render(<PixelDissolve intensity={1} />);

    expect(getContext).not.toHaveBeenCalled();
  });
});

describe("Controls", () => {
  it("only lets the panic card come apart", () => {
    reducedMotion(true);
    const { container } = renderWithIntl(<Controls />);

    // One canvas, not four. The effect is a warning about the one command that
    // destroys something — on every card it would just be decoration.
    expect(container.querySelectorAll("canvas")).toHaveLength(1);
  });

  it("keeps every card readable", () => {
    reducedMotion(true);
    renderWithIntl(<Controls />);

    for (const key of ["panic", "lock", "ephemeral", "retention"] as const) {
      expect(
        screen.getByText(messages.controls.items[key].name),
      ).toBeInTheDocument();
    }
  });

  it("shows the commands exactly as they are typed", () => {
    reducedMotion(true);
    renderWithIntl(<Controls />);
    expect(screen.getByText("/panic yes")).toBeInTheDocument();
  });
});
